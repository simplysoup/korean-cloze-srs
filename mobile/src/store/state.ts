// Web store state — the user's progress as an in-memory SyncDocument,
// persisted to IndexedDB and synced to the server. No SQLite, no OPFS:
// every read/write after boot is a plain object access, so the app never
// blocks on a database opening. Persistence is async and best-effort —
// if IndexedDB is unavailable (or this is an incognito tab, where it is
// wiped on close) the app still works from memory + the server.
//
// Auth bits (device id, trust, session token, last user) live in
// localStorage, not IndexedDB: they are small, synchronous, and
// localStorage is not the fragile piece. The session token is the same
// `munpro.sessionToken` mirror the DB build used, so a locked-out tab's
// read-only flow keeps working.
//
// Boot order (initStore): IndexedDB snapshot first (instant, offline),
// then a server pull when there is a token (authoritative, merged with
// the same never-lose-a-review rules as the old applySyncSnapshot).

import { syncPull } from '../lib/api';
import { isLogoutGraceActive } from '../lib/auth';
import { mergeDailyLearned, mergeStreaks, serverCardWins } from '../lib/sync-merge';
import type { SyncDocument, SyncReviewCard } from '../lib/sync-types';

export interface ServerUserRecord {
  id: string;
  email: string;
  username: string;
  /** True when the server says this account has a password set. */
  serverHasPassword: boolean;
  /** Local password hash + salt (offline login only). Empty = never set locally. */
  passwordHash: string;
  salt: string;
}

export interface DeviceTrust {
  userId: string;
  deviceId: string;
  lastVerifiedAt: string;
  lastLogoutAt: string | null;
}

export interface WebState {
  /** The logged-in server user, or null when logged out / never logged in. */
  user: ServerUserRecord | null;
  /** The user's progress document — the in-memory source of truth. */
  doc: SyncDocument;
  /** Server sync version this device last synced to (0 = never). */
  lastSyncedVersion: number;
  /** ISO timestamp of the last successful sync, or null. */
  lastSyncedAt: string | null;
  /** True when local state changed since the last successful push. */
  syncDirty: boolean;
  /** Stable per-device id (localStorage). */
  deviceId: string;
  /** Device trust rows, keyed by user id. */
  deviceTrust: Record<string, DeviceTrust>;
  /** Id of the last user on this device (localStorage). */
  lastUserId: string | null;
  /** Id of the remembered session user (localStorage). */
  sessionUserId: string | null;
}

function emptyDoc(): SyncDocument {
  return {
    version: 0,
    updatedAt: new Date().toISOString(),
    user: { username: 'learner', email: '' },
    reviewCards: [],
    reviewLogs: [],
    libraryDecks: [],
    streak: null,
    settings: null,
    dailyLearned: {},
  };
}

const LS_DEVICE_ID = 'munpro.deviceId';
const LS_LAST_USER_ID = 'munpro.lastUserId';
const LS_SESSION_USER_ID = 'munpro.sessionUserId:v2';
const LS_SESSION_TOKEN = 'munpro.sessionToken';
const LS_USER_RECORD = 'munpro.userRecord';
const LS_DEVICE_TRUST = 'munpro.deviceTrust';

function lsGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage.getItem(key);
  } catch {
    return null;
  }
  return null;
}

function lsSet(key: string, value: string): void {
  try {
    window.localStorage?.setItem(key, value);
  } catch {
    // Storage unavailable — the in-memory state still works for this launch.
  }
}

function lsRemove(key: string): void {
  try {
    window.localStorage?.removeItem(key);
  } catch {
    // Ignore.
  }
}

// ── IndexedDB (one key, one JSON value) ──────────────────────────────────────

const IDB_NAME = 'munpro';
const IDB_STORE = 'kv';
const IDB_DOC_KEY = 'state-v1';

interface PersistedState {
  doc: SyncDocument;
  lastSyncedVersion: number;
  lastSyncedAt: string | null;
  syncDirty: boolean;
}

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('indexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('indexedDB open failed'));
  });
}

async function idbGet(): Promise<PersistedState | null> {
  const db = await openIdb();
  try {
    return await new Promise<PersistedState | null>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(IDB_DOC_KEY);
      req.onsuccess = () => resolve((req.result as PersistedState | undefined) ?? null);
      req.onerror = () => reject(req.error ?? new Error('indexedDB read failed'));
    });
  } finally {
    db.close();
  }
}

async function idbPut(value: PersistedState): Promise<void> {
  const db = await openIdb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const req = tx.objectStore(IDB_STORE).put(value, IDB_DOC_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error ?? new Error('indexedDB write failed'));
    });
  } finally {
    db.close();
  }
}

// ── The state (module singleton) ─────────────────────────────────────────────

let state: WebState | null = null;

function newState(): WebState {
  return {
    user: null,
    doc: emptyDoc(),
    lastSyncedVersion: 0,
    lastSyncedAt: null,
    syncDirty: false,
    deviceId: '',
    deviceTrust: {},
    lastUserId: null,
    sessionUserId: null,
  };
}

/** The live state. Throws when initStore() has not run yet. */
export function getState(): WebState {
  if (!state) throw new Error('web store not initialized');
  return state;
}

/** The current user id (server user id, or 'local' before login). Used
 * to build stable review-card ids (`rc_<uid>_<gpId>`), as the DB did. */
export function currentUid(): string {
  return state?.user?.id ?? 'local';
}

/** True once initStore() has completed. */
export function isStoreReady(): boolean {
  return state !== null;
}

// ── Session token (localStorage mirror, same key as the DB build) ───────────

export function getSessionToken(): string | null {
  return lsGet(LS_SESSION_TOKEN);
}

export function setSessionToken(token: string): void {
  lsSet(LS_SESSION_TOKEN, token);
}

export function clearSessionToken(): void {
  lsRemove(LS_SESSION_TOKEN);
}

// ── Device id / trust / last user (localStorage) ─────────────────────────────

export function getOrCreateDeviceId(): string {
  const existing = lsGet(LS_DEVICE_ID);
  if (existing) return existing;
  const id = `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  lsSet(LS_DEVICE_ID, id);
  return id;
}

export function getDeviceTrust(userId: string, deviceId: string): DeviceTrust | null {
  const s = getState();
  const trust = s.deviceTrust[userId];
  return trust && trust.deviceId === deviceId ? trust : null;
}

export function trustDevice(userId: string, deviceId: string): void {
  const s = getState();
  s.deviceTrust[userId] = {
    userId,
    deviceId,
    lastVerifiedAt: new Date().toISOString(),
    lastLogoutAt: null,
  };
  lsSet(LS_DEVICE_TRUST, JSON.stringify(s.deviceTrust));
}

export function markDeviceLogout(userId: string, deviceId: string): void {
  const s = getState();
  const trust = s.deviceTrust[userId];
  if (trust && trust.deviceId === deviceId) {
    trust.lastLogoutAt = new Date().toISOString();
    lsSet(LS_DEVICE_TRUST, JSON.stringify(s.deviceTrust));
  }
}

export function getLastUserId(): string | null {
  return lsGet(LS_LAST_USER_ID);
}

export function setLastUserId(userId: string): void {
  lsSet(LS_LAST_USER_ID, userId);
  if (state) state.lastUserId = userId;
}

export function getSessionUserId(): string | null {
  return lsGet(LS_SESSION_USER_ID);
}

export function setSessionUserId(userId: string): void {
  lsSet(LS_SESSION_USER_ID, userId);
  if (state) state.sessionUserId = userId;
}

export function clearSessionUserId(): void {
  lsRemove(LS_SESSION_USER_ID);
  if (state) state.sessionUserId = null;
}

function loadUserRecord(): ServerUserRecord | null {
  const raw = lsGet(LS_USER_RECORD);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ServerUserRecord;
  } catch {
    return null;
  }
}

export function saveUserRecord(user: ServerUserRecord): void {
  lsSet(LS_USER_RECORD, JSON.stringify(user));
  if (state) state.user = user;
}

export function clearUserRecord(): void {
  lsRemove(LS_USER_RECORD);
  if (state) state.user = null;
}

// ── Persistence (IndexedDB, debounced) ───────────────────────────────────────

let persistTimer: ReturnType<typeof setTimeout> | null = null;

/** Write the doc + sync metadata to IndexedDB. Best-effort: a failure
 * (unavailable storage, incognito quirks) never throws — the in-memory
 * state and the server push still work. */
export async function persistNow(): Promise<void> {
  const s = getState();
  try {
    await idbPut({
      doc: s.doc,
      lastSyncedVersion: s.lastSyncedVersion,
      lastSyncedAt: s.lastSyncedAt,
      syncDirty: s.syncDirty,
    });
  } catch {
    // Ignore — IndexedDB is a cache; the server is the backup.
  }
}

export function schedulePersist(): void {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    void persistNow();
  }, 300);
}

/**
 * Mark local state dirty: schedule an IndexedDB persist. The server push
 * is the sync layer's job (syncNow, called on login and after
 * review/learn sessions, and debounced by the caller).
 */
export function markDirty(): void {
  const s = getState();
  s.syncDirty = true;
  s.doc.updatedAt = new Date().toISOString();
  schedulePersist();
}

/** Alias for markDirty (the DB build's name). */
export const markSyncDirty = markDirty;

export function isSyncDirty(): boolean {
  return getState().syncDirty;
}

export function clearSyncDirty(): void {
  getState().syncDirty = false;
  schedulePersist();
}

/** The server sync version this device last synced to (0 = never). */
export function getLastSyncedVersion(): number {
  return getState().lastSyncedVersion;
}

export function setLastSyncedVersion(v: number): void {
  getState().lastSyncedVersion = v;
  schedulePersist();
}

export function getLastSyncedAt(): string | null {
  return getState().lastSyncedAt;
}

export function setLastSyncedAt(iso: string): void {
  getState().lastSyncedAt = iso;
  schedulePersist();
}

// ── Merge a server document into the in-memory doc ───────────────────────────
// Same never-lose-a-review rules as the old applySyncSnapshot: review
// cards keep the later lastReview (tie → higher reps), logs and library
// decks are unions, streaks and daily counts take the max, settings are
// last-write-wins with the server document winning (it is newer than the
// last sync by construction). Returns true when anything changed.

export function mergeServerDoc(serverDoc: SyncDocument): boolean {
  const s = getState();
  let changed = false;
  const local = s.doc;

  const localCards = new Map(local.reviewCards.map((c) => [c.grammarPointId, c] as const));
  for (const sc of serverDoc.reviewCards) {
    const existing = localCards.get(sc.grammarPointId);
    if (!existing) {
      local.reviewCards.push({ ...sc });
      changed = true;
      continue;
    }
    if (serverCardWins(existing, sc)) {
      Object.assign(existing, sc);
      changed = true;
    }
  }
  const localLogIds = new Set(local.reviewLogs.map((l) => l.id));
  for (const sl of serverDoc.reviewLogs) {
    if (localLogIds.has(sl.id)) continue;
    local.reviewLogs.push({ ...sl });
    changed = true;
  }
  const localDeckIds = new Set(local.libraryDecks.map((d) => d.deckId));
  for (const sd of serverDoc.libraryDecks) {
    if (localDeckIds.has(sd.deckId)) continue;
    local.libraryDecks.push({ ...sd });
    changed = true;
  }
  if (serverDoc.streak) {
    if (!local.streak) {
      local.streak = { ...serverDoc.streak };
      changed = true;
    } else {
      const merged = mergeStreaks(local.streak, serverDoc.streak);
      if (
        merged.currentStreak !== local.streak.currentStreak ||
        merged.longestStreak !== local.streak.longestStreak ||
        merged.lastStudiedDate !== local.streak.lastStudiedDate
      ) {
        local.streak = merged;
        changed = true;
      }
    }
  }
  if (serverDoc.settings) {
    const raw = JSON.stringify(serverDoc.settings);
    if (JSON.stringify(local.settings) !== raw) {
      local.settings = serverDoc.settings;
      changed = true;
    }
  }
  const mergedDaily = mergeDailyLearned(local.dailyLearned, serverDoc.dailyLearned);
  if (JSON.stringify(mergedDaily) !== JSON.stringify(local.dailyLearned)) {
    local.dailyLearned = mergedDaily;
    changed = true;
  }
  if (serverDoc.user?.email) {
    local.user = serverDoc.user;
  }
  if (changed) markDirty();
  return changed;
}

/** Serialize the in-memory doc for a sync push (the server assigns the version). */
export function getSyncSnapshot(): SyncDocument {
  const s = getState();
  return {
    ...s.doc,
    version: 0,
    updatedAt: new Date().toISOString(),
    reviewCards: s.doc.reviewCards.map((c) => ({ ...c })),
    reviewLogs: s.doc.reviewLogs.map((l) => ({ ...l })),
    libraryDecks: s.doc.libraryDecks.map((d) => ({ ...d })),
    streak: s.doc.streak ? { ...s.doc.streak } : null,
    settings: s.doc.settings ? { ...(s.doc.settings as Record<string, unknown>) } : null,
    dailyLearned: { ...s.doc.dailyLearned },
  };
}

// ── Boot ─────────────────────────────────────────────────────────────────────

export interface StoreInit {
  sessionUser: { id: string; username: string; email: string } | null;
  deviceId: string;
  lastEmail: string | null;
}

/**
 * Boot the web store. Never throws for a storage failure: a missing or
 * unreadable IndexedDB snapshot just means "start from the server (or
 * empty)", and a failed server pull just means "work from the cache".
 * There is no database to fail opening, so there is no error screen —
 * the app always boots.
 */
export async function initStore(): Promise<StoreInit> {
  const s = newState();
  state = s;

  // Auth bits from localStorage (synchronous, reliable).
  s.deviceId = getOrCreateDeviceId();
  s.user = loadUserRecord();
  s.lastUserId = getLastUserId();
  s.sessionUserId = getSessionUserId();
  try {
    const rawTrust = lsGet(LS_DEVICE_TRUST);
    s.deviceTrust = rawTrust ? (JSON.parse(rawTrust) as Record<string, DeviceTrust>) : {};
  } catch {
    s.deviceTrust = {};
  }

  // Progress from the IndexedDB cache (best-effort).
  try {
    const cached = await idbGet();
    if (cached) {
      s.doc = cached.doc;
      s.lastSyncedVersion = cached.lastSyncedVersion;
      s.lastSyncedAt = cached.lastSyncedAt;
      s.syncDirty = cached.syncDirty;
    }
  } catch {
    // No cache — start empty and pull from the server below.
  }

  // Server pull when there is a token (authoritative, merged in).
  const token = getSessionToken();
  if (token) {
    try {
      const pulled = await syncPull(token);
      if (pulled.ok && pulled.payload && pulled.version > s.lastSyncedVersion) {
        mergeServerDoc(pulled.payload);
        s.lastSyncedVersion = pulled.version;
        // The merged state goes back up on the next push (syncNow).
        s.syncDirty = true;
        schedulePersist();
      } else if (pulled.ok && pulled.payload && s.lastSyncedVersion === 0) {
        // Never synced before: take the server doc wholesale.
        s.doc = pulled.payload;
        s.lastSyncedVersion = pulled.version;
        schedulePersist();
      }
    } catch {
      // Offline / server down — the cache (or empty state) stands.
    }
  }

  // Session restore: the remembered user on a trusted device goes
  // straight in (same rules as the DB build's initDatabase).
  let sessionUser: StoreInit['sessionUser'] = null;
  const sessionId = s.sessionUserId;
  if (sessionId && s.user && s.user.id === sessionId) {
    const trust = s.deviceTrust[sessionId];
    if (trust && isLogoutGraceActive(trust.lastLogoutAt)) {
      sessionUser = { id: s.user.id, username: s.user.username, email: s.user.email };
    }
  }
  if (!sessionUser && s.lastUserId && s.user && s.user.id === s.lastUserId) {
    const trust = s.deviceTrust[s.lastUserId];
    if (trust && isLogoutGraceActive(trust.lastLogoutAt)) {
      sessionUser = { id: s.user.id, username: s.user.username, email: s.user.email };
      s.sessionUserId = s.lastUserId;
      lsSet(LS_SESSION_USER_ID, s.lastUserId);
    }
  }
  const lastEmail = s.user?.email ?? null;
  return { sessionUser, deviceId: s.deviceId, lastEmail };
}
