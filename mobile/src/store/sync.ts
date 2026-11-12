// Web sync — pull the server document, merge it into the in-memory
// doc, push the local doc when dirty. Same protocol and merge rules as
// lib/sync.ts, but against the web store state instead of the SQLite DB.
// Best-effort: a failed fetch (offline, server down) is silent; the app
// keeps working from memory + IndexedDB and syncs later.
//
// The caller must have a token before calling syncNow(); without one
// there is nothing to sync against.
//
// Compare-and-swap protocol (the server enforces it):
//   - Every push sends the `expectedVersion` the client last pulled
//     (0 when nothing is stored yet). A push without it gets 428; a
//     stale version gets 409.
//   - On 409 the client re-pulls, merges the server snapshot into the
//     local doc with the never-lose-a-review rules, and retries with
//     the newly pulled version. At most MAX_PUSH_ATTEMPTS tries; when
//     they are exhausted the local copy stays dirty and nothing is
//     cleared, so the next sync retries from the local state.
//   - Local dirty state is preserved on every failure (409 exhaustion,
//     428, 413, 429, 5xx, offline, logout). A failed sync never
//     discards local progress.
//   - Account epoch: the user id + token are captured when the sync
//     starts, and every state mutation re-checks them. If the user
//     logged out (or a different account logged in) mid-sync, the run
//     aborts without touching the new account's state.

import { ServerUnreachable, syncPull, syncPush } from '../lib/api';
import {
  getSessionToken,
  getState,
  getSyncSnapshot,
  markDirty,
  mergeServerDoc,
  persistNow,
  schedulePersist,
  setSyncedVersion,
  clearSessionToken,
} from './state';

export interface SyncResult {
  /** True when a pull and/or push completed. False when offline, not
   * logged in on the server, or nothing needed doing. */
  ok: boolean;
  /** 'offline' | 'no-token' | 'unauthorized' | 'up-to-date' | 'synced' |
   *  'account-changed' | 'version-conflict' | 'precondition-required' |
   *  'payload-too-large' | 'rate-limited' | 'error' */
  status: string;
  /** The server version after the sync (0 when unknown). */
  version: number;
  /** ISO timestamp of the last successful sync, or null. */
  lastSyncedAt: string | null;
}

/** How many times a push is retried after a 409 before giving up. */
const MAX_PUSH_ATTEMPTS = 3;

let syncInFlight: Promise<SyncResult> | null = null;

/**
 * Run one sync: pull, merge if the server is newer, push if dirty.
 * Concurrent callers share the in-flight run (a second call while one
 * is running waits for it instead of starting a duplicate).
 */
export function syncNow(): Promise<SyncResult> {
  if (syncInFlight) return syncInFlight;
  syncInFlight = runSync().finally(() => {
    syncInFlight = null;
  });
  return syncInFlight;
}

async function runSync(): Promise<SyncResult> {
  const s = getState();
  const token = getSessionToken();
  if (!token) {
    return { ok: false, status: 'no-token', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
  }
  // The account epoch for this run. Every state mutation below
  // re-checks it, so a logout / account switch mid-sync cannot let
  // this run write the previous account's data into the new one.
  const epochUserId = s.user?.id ?? null;
  const epochToken = token;
  const epochChanged = (): boolean =>
    getState().user?.id !== epochUserId || getSessionToken() !== epochToken;

  // The cached version belongs to one account. If the logged-in user is
  // a different account than the version was synced for, the version is
  // meaningless for them — reset it so the first push uses
  // expectedVersion 0 and the pull establishes the new account's
  // version.
  if (epochUserId && s.lastSyncedUserId && s.user?.id !== s.lastSyncedUserId) {
    s.lastSyncedVersion = 0;
    s.lastSyncedUserId = null;
    schedulePersist();
  }

  let pulled;
  try {
    pulled = await syncPull(token);
  } catch (e) {
    if (e instanceof ServerUnreachable) {
      return { ok: false, status: 'offline', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
    }
    throw e;
  }
  if (epochChanged()) {
    return { ok: false, status: 'account-changed', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
  }
  if (!pulled.ok) {
    if (pulled.error === 'unauthorized' || pulled.status === 401) {
      // The token is dead (logged out elsewhere, or expired). Drop it so
      // the next login issues a fresh one instead of retrying forever.
      clearSessionToken();
      return { ok: false, status: 'unauthorized', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
    }
    return { ok: false, status: pulled.error ?? 'error', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
  }
  const lastVersion = s.lastSyncedVersion;
  let merged = false;
  if (pulled.payload && pulled.version > lastVersion) {
    merged = mergeServerDoc(pulled.payload);
    setSyncedVersion(pulled.version, epochUserId);
  }
  // Push when the local copy changed, when a merge changed it, or when
  // this device has never synced.
  const dirty = s.syncDirty || merged || lastVersion === 0;
  if (!dirty) {
    return { ok: true, status: 'up-to-date', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
  }
  return pushWithRetry(s, token, epochUserId, epochChanged);
}

/**
 * Push the local doc, retrying on 409: re-pull, merge the server
 * snapshot (never loses a review), and retry with the new version.
 * Bounded; when the attempts run out the local copy stays dirty and
 * the version is left at the last pulled value, so the next sync
 * retries from the local state. A failed push never clears dirty state.
 */
async function pushWithRetry(
  s: ReturnType<typeof getState>,
  token: string,
  epochUserId: string | null,
  epochChanged: () => boolean,
): Promise<SyncResult> {
  for (let attempt = 1; attempt <= MAX_PUSH_ATTEMPTS; attempt++) {
    if (epochChanged()) {
      return { ok: false, status: 'account-changed', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
    }
    const doc = getSyncSnapshot();
    let pushed;
    try {
      pushed = await syncPush(token, doc, s.lastSyncedVersion);
    } catch (e) {
      if (e instanceof ServerUnreachable) {
        return { ok: false, status: 'offline', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
      }
      throw e;
    }
    if (epochChanged()) {
      return { ok: false, status: 'account-changed', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
    }
    if (pushed.ok) {
      setSyncedVersion(pushed.version, epochUserId);
      s.lastSyncedAt = new Date().toISOString();
      s.syncDirty = false;
      schedulePersist();
      return { ok: true, status: 'synced', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
    }
    if (pushed.error === 'unauthorized' || pushed.status === 401) {
      clearSessionToken();
      return { ok: false, status: 'unauthorized', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
    }
    if (pushed.status === 409 || pushed.error === 'version-conflict') {
      // Another writer won. Re-pull, merge, and retry with the fresh
      // version — unless this was the last attempt, in which case the
      // local copy stays dirty for the next sync.
      if (attempt === MAX_PUSH_ATTEMPTS) {
        return { ok: false, status: 'version-conflict', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
      }
      let pulled;
      try {
        pulled = await syncPull(token);
      } catch (e) {
        if (e instanceof ServerUnreachable) {
          return { ok: false, status: 'offline', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
        }
        throw e;
      }
      if (epochChanged()) {
        return { ok: false, status: 'account-changed', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
      }
      if (!pulled.ok) {
        if (pulled.error === 'unauthorized' || pulled.status === 401) {
          clearSessionToken();
          return { ok: false, status: 'unauthorized', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
        }
        return { ok: false, status: pulled.error ?? 'error', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
      }
      if (pulled.payload) {
        mergeServerDoc(pulled.payload);
        setSyncedVersion(pulled.version, epochUserId);
      }
      continue;
    }
    if (pushed.status === 428 || pushed.error === 'precondition-required') {
      // The client always sends expectedVersion, so this means the
      // protocol drifted. Do not clear dirty state; surface it.
      return { ok: false, status: 'precondition-required', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
    }
    if (pushed.status === 413 || pushed.error === 'payload-too-large') {
      return { ok: false, status: 'payload-too-large', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
    }
    if (pushed.status === 429 || pushed.error === 'rate-limited') {
      return { ok: false, status: 'rate-limited', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
    }
    return { ok: false, status: pushed.error ?? 'error', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
  }
  // Unreachable: the loop always returns. Kept for the typechecker.
  return { ok: false, status: 'version-conflict', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
}

/** Push the current doc to the server now (used after review/learn sessions). */
export function syncPushNow(): Promise<SyncResult> {
  return syncNow();
}

export { markDirty, persistNow };
