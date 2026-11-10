// Web sync — pull the server document, merge it into the in-memory
// doc, push the local doc when dirty. Same protocol and merge rules as
// lib/sync.ts, but against the web store state instead of the SQLite DB.
// Best-effort: a failed fetch (offline, server down) is silent; the app
// keeps working from memory + IndexedDB and syncs later.
//
// The caller must have a token before calling syncNow(); without one
// there is nothing to sync against.

import { ServerUnreachable, syncPull, syncPush } from '../lib/api';
import {
  getSessionToken,
  getState,
  getSyncSnapshot,
  markDirty,
  mergeServerDoc,
  persistNow,
  schedulePersist,
  clearSessionToken,
} from './state';

export interface SyncResult {
  /** True when a pull and/or push completed. False when offline, not
   * logged in on the server, or nothing needed doing. */
  ok: boolean;
  /** 'offline' | 'no-token' | 'unauthorized' | 'up-to-date' | 'synced' */
  status: string;
  /** The server version after the sync (0 when unknown). */
  version: number;
  /** ISO timestamp of the last successful sync, or null. */
  lastSyncedAt: string | null;
}

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
  let pulled;
  try {
    pulled = await syncPull(token);
  } catch (e) {
    if (e instanceof ServerUnreachable) {
      return { ok: false, status: 'offline', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
    }
    throw e;
  }
  if (!pulled.ok) {
    if (pulled.error === 'unauthorized') {
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
    s.lastSyncedVersion = pulled.version;
  }
  // Push when the local copy changed, when a merge changed it, or when
  // this device has never synced.
  const dirty = s.syncDirty || merged || lastVersion === 0;
  if (!dirty) {
    return { ok: true, status: 'up-to-date', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
  }
  const doc = getSyncSnapshot();
  let pushed;
  try {
    pushed = await syncPush(token, doc);
  } catch (e) {
    if (e instanceof ServerUnreachable) {
      return { ok: false, status: 'offline', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
    }
    throw e;
  }
  if (!pushed.ok) {
    if (pushed.error === 'unauthorized') {
      clearSessionToken();
      return { ok: false, status: 'unauthorized', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
    }
    return { ok: false, status: pushed.error ?? 'error', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
  }
  s.lastSyncedVersion = pushed.version;
  s.lastSyncedAt = new Date().toISOString();
  s.syncDirty = false;
  schedulePersist();
  return { ok: true, status: 'synced', version: s.lastSyncedVersion, lastSyncedAt: s.lastSyncedAt };
}

/** Push the current doc to the server now (used after review/learn sessions). */
export function syncPushNow(): Promise<SyncResult> {
  return syncNow();
}

export { markDirty, persistNow };
