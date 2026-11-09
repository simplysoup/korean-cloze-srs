// Sync protocol: pull the server document, merge it into the local DB,
// push the local document when dirty. Best-effort — a failed fetch
// (offline, server down) is silent; the app keeps working locally and
// syncs later. See docs/planning/sync-server-accounts.md.
//
// The token is stored in the local meta table (see db/index.ts). The
// caller must have a token before calling syncNow(); without one there
// is nothing to sync against.

import { ServerUnreachable, syncPull, syncPush } from './api';
import {
  applySyncSnapshot,
  clearSessionToken,
  clearSyncDirty,
  getLastSyncedAt,
  getLastSyncedVersion,
  getSessionToken,
  getSyncSnapshot,
  isSyncDirty,
  setLastSyncedAt,
  setLastSyncedVersion,
} from '../db';

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
  const token = getSessionToken();
  if (!token) {
    return { ok: false, status: 'no-token', version: getLastSyncedVersion(), lastSyncedAt: getLastSyncedAt() };
  }
  let pulled;
  try {
    pulled = await syncPull(token);
  } catch (e) {
    if (e instanceof ServerUnreachable) {
      return { ok: false, status: 'offline', version: getLastSyncedVersion(), lastSyncedAt: getLastSyncedAt() };
    }
    throw e;
  }
  if (!pulled.ok) {
    if (pulled.error === 'unauthorized') {
      // The token is dead (logged out elsewhere, or expired). Drop it so
      // the next login issues a fresh one instead of retrying forever.
      clearSessionToken();
      return { ok: false, status: 'unauthorized', version: getLastSyncedVersion(), lastSyncedAt: getLastSyncedAt() };
    }
    return { ok: false, status: pulled.error ?? 'error', version: getLastSyncedVersion(), lastSyncedAt: getLastSyncedAt() };
  }
  const lastVersion = getLastSyncedVersion();
  let merged = false;
  if (pulled.payload && pulled.version > lastVersion) {
    merged = applySyncSnapshot(pulled.payload);
    setLastSyncedVersion(pulled.version);
  }
  // Push when the local copy changed, when a merge changed it, or when
  // this device has never synced: local progress created before sync
  // existed never set the dirty flag, so "never synced" alone must
  // trigger the first upload (otherwise that progress would stay
  // local-only forever).
  const dirty = isSyncDirty() || merged || lastVersion === 0;
  if (!dirty) {
    return { ok: true, status: 'up-to-date', version: getLastSyncedVersion(), lastSyncedAt: getLastSyncedAt() };
  }
  const doc = getSyncSnapshot();
  let pushed;
  try {
    pushed = await syncPush(token, doc);
  } catch (e) {
    if (e instanceof ServerUnreachable) {
      return { ok: false, status: 'offline', version: getLastSyncedVersion(), lastSyncedAt: getLastSyncedAt() };
    }
    throw e;
  }
  if (!pushed.ok) {
    if (pushed.error === 'unauthorized') {
      clearSessionToken();
      return { ok: false, status: 'unauthorized', version: getLastSyncedVersion(), lastSyncedAt: getLastSyncedAt() };
    }
    return { ok: false, status: pushed.error ?? 'error', version: getLastSyncedVersion(), lastSyncedAt: getLastSyncedAt() };
  }
  setLastSyncedVersion(pushed.version);
  setLastSyncedAt(new Date().toISOString());
  clearSyncDirty();
  return { ok: true, status: 'synced', version: pushed.version, lastSyncedAt: getLastSyncedAt() };
}
