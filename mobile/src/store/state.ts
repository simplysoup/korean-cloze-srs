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
// Boot order: restore only an already-verified, trusted account's own key;
// never show the old global snapshot or pull before binding the account.

import { syncPull } from '../lib/api';
import { isLogoutGraceActive } from '../lib/auth';
import { mergeDailyLearned, mergeStreaks, serverCardWins } from '../lib/sync-merge';
import type { SyncDocument, SyncReviewCard } from '../lib/sync-types';
import type { AccountSessionLease } from '../features/contracts/phase2';
import {
  accountDocumentKey, copyAccountSnapshot, isAccountSnapshot,
  isValidServerAccountId, legacyHasPositiveOwnerEvidence, LEGACY_DOCUMENT_KEY,
  type AccountPersistedSnapshot, type LegacyPersistedSnapshot,
} from './account-isolation/storage';

export interface ServerUserRecord {
  id: string;
  email: string;
  username: string;
  /** True when the server says this account has a password set. */
  serverHasPassword: boolean;
  /** Local password hash + salt (offline login only). Empty = never set locally. */
  passwordHash: string;
  salt: string;
  /** Set only after an actual server auth response included this account ID. */
  verifiedServerId?: boolean;
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
  /** Null means guest/logged-out; never mapped to another account's cache. */
  activeAccountId: string | null;
  /** Persistence is forbidden until this account's IDB read has settled. */
  accountCacheLoaded: boolean;
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
const LS_TOKEN_OWNER = 'munpro.sessionTokenOwner:v1';

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

// ── IndexedDB (same database, separate verified-account keys) ─────────────
const IDB_NAME = 'munpro';
const IDB_STORE = 'kv';

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('indexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(IDB_STORE)) req.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('indexedDB open failed'));
  });
}

async function idbGet(key: string): Promise<unknown> {
  const db = await openIdb();
  try {
    return await new Promise<unknown>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error ?? new Error('indexedDB read failed'));
      tx.onabort = () => reject(tx.error ?? new Error('indexedDB read aborted'));
    });
  } finally {
    db.close();
  }
}

/** Resolve only after transaction commit; request success is not durability. */
async function idbPut(key: string, value: AccountPersistedSnapshot): Promise<void> {
  const db = await openIdb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('indexedDB write failed'));
      tx.onabort = () => reject(tx.error ?? new Error('indexedDB write aborted'));
    });
  } finally {
    db.close();
  }
}

// ── The state (module singleton) ─────────────────────────────────────────────

let state: WebState | null = null;
let sessionEpoch = 0;
let removeStorageListener: (() => void) | null = null;
const accountSessionListeners = new Set<() => void>();

/** Lead-owned layout must subscribe and immediately clear its React auth
 * state when a different browser tab revokes or switches the session. */
export function subscribeAccountSessionChange(listener: () => void): () => void {
  accountSessionListeners.add(listener);
  return () => { accountSessionListeners.delete(listener); };
}

function notifyAccountSessionChange(): void {
  for (const listener of accountSessionListeners) listener();
}

function bumpEpoch(): number {
  sessionEpoch += 1;
  return sessionEpoch;
}

/** Captured leases are invalid after any login/logout/token replacement. */
export function getAccountSessionLease(): AccountSessionLease | null {
  const id = state?.activeAccountId;
  if (!id || !state?.user?.verifiedServerId || state.user.id !== id) return null;
  return { accountId: id, epoch: sessionEpoch };
}

export function isAccountSessionLeaseCurrent(lease: AccountSessionLease): boolean {
  return !!state?.activeAccountId &&
    state.activeAccountId === lease.accountId && sessionEpoch === lease.epoch &&
    state.user?.verifiedServerId === true && state.user.id === lease.accountId;
}

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
    activeAccountId: null,
    accountCacheLoaded: false,
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

// ── Token binding (identity is never inferred from the bearer string) ────
export function getSessionToken(): string | null {
  const token = lsGet(LS_SESSION_TOKEN);
  const owner = lsGet(LS_TOKEN_OWNER);
  if (!token || !owner || !state?.user?.verifiedServerId) return null;
  // Also allow first-login password setup, before the shell activates IDB.
  if (state.user.id !== owner) return null;
  if (state.activeAccountId && state.activeAccountId !== owner) return null;
  return token;
}

export function setSessionToken(token: string): void {
  bumpEpoch(); // invalidate pulls/pushes associated with the old token
  lsSet(LS_SESSION_TOKEN, token);
  lsRemove(LS_TOKEN_OWNER); // new token must be bound by actual server auth
}

/** Call only after successful server auth returned the verified server ID. */
export function bindSessionTokenToVerifiedAccount(id: string): void {
  if (!isValidServerAccountId(id) || !state?.user?.verifiedServerId || state.user.id !== id) {
    throw new Error('cannot bind bearer token to unverified account');
  }
  if (lsGet(LS_SESSION_TOKEN)) {
    lsSet(LS_TOKEN_OWNER, id);
    bumpEpoch();
  }
}

/** Expiry is NOT logout: preserve the selected account's offline cache. */
export function clearSessionToken(): void {
  bumpEpoch();
  lsRemove(LS_SESSION_TOKEN);
  lsRemove(LS_TOKEN_OWNER);
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
  // Explicit logout is a synchronous privacy barrier before any UI render.
  endAccountSession();
  lsRemove(LS_SESSION_USER_ID);
  if (state) state.sessionUserId = null;
}

function loadUserRecord(): ServerUserRecord | null {
  const raw = lsGet(LS_USER_RECORD);
  if (!raw) return null;
  try {
    const record = JSON.parse(raw) as ServerUserRecord;
    if (!isValidServerAccountId(record?.id) || typeof record.email !== 'string') return null;
    // Historic records lacked this marker; never infer verified ownership.
    return { ...record, verifiedServerId: record.verifiedServerId === true };
  } catch {
    return null;
  }
}

export function saveUserRecord(user: ServerUserRecord): void {
  if (state?.activeAccountId && state.activeAccountId !== user.id) endAccountSession();
  lsSet(LS_USER_RECORD, JSON.stringify(user));
  if (state) state.user = user;
}

export function clearUserRecord(): void {
  endAccountSession();
  lsRemove(LS_USER_RECORD);
  if (state) state.user = null;
}

// ── Account activation, write serialization and generation barriers ────
let persistTimer: ReturnType<typeof setTimeout> | null = null;
const pendingWrites = new Map<string, Promise<void>>();

function captureSnapshot(): { key: string; data: AccountPersistedSnapshot } | null {
  const lease = getAccountSessionLease();
  if (!lease) return null;
  const s = getState();
  // Switching away before an IDB read completes must NOT overwrite the
  // existing saved snapshot with this account's not-yet-loaded empty doc.
  if (!s.accountCacheLoaded) return null;
  return {
    key: accountDocumentKey(lease.accountId),
    data: copyAccountSnapshot({
      ownerId: lease.accountId,
      doc: s.doc,
      lastSyncedVersion: s.lastSyncedVersion,
      lastSyncedAt: s.lastSyncedAt,
      syncDirty: s.syncDirty,
    }),
  };
}

/** Queue immutable owner-tagged data. An old A write can finish after
 * switching to B but cannot derive B's key or data. In-tab writes for
 * one key complete in order; no assumption about cross-device CAS. */
async function writeCaptured(key: string, data: AccountPersistedSnapshot): Promise<void> {
  const previous = pendingWrites.get(key) ?? Promise.resolve();
  const task = previous.catch(() => undefined).then(() => idbPut(key, data));
  pendingWrites.set(key, task);
  try {
    await task;
  } finally {
    if (pendingWrites.get(key) === task) pendingWrites.delete(key);
  }
}

export async function persistNow(): Promise<void> {
  const captured = captureSnapshot();
  if (!captured) return;
  try {
    await writeCaptured(captured.key, captured.data);
  } catch {
    // Cache is best-effort; caller and server sync still have in-memory data.
  }
}

export function schedulePersist(): void {
  const lease = getAccountSessionLease();
  if (!lease || persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    if (isAccountSessionLeaseCurrent(lease)) void persistNow();
  }, 300);
}

/** Detach synchronously BEFORE React renders logout/account switch. Capture
 * outstanding A data before resetting it. A-scope writes are harmless after
 * a switch; late reads are rejected by the epoch check. */
export function endAccountSession(): void {
  if (persistTimer) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  if (state?.activeAccountId) void persistNow();
  bumpEpoch();
  if (!state) return;
  state.activeAccountId = null;
  state.accountCacheLoaded = false;
  state.doc = emptyDoc();
  state.lastSyncedVersion = 0;
  state.lastSyncedAt = null;
  state.syncDirty = false;
  notifyAccountSessionChange();
}

/** Must be awaited by the auth shell before mounting learner screens or
 * starting sync. No local email, unverified user ID or shared cache can
 * activate this namespace. */
export async function activateVerifiedAccount(id: string): Promise<boolean> {
  const s = getState();
  if (!s.user?.verifiedServerId || !isValidServerAccountId(id) || s.user.id !== id) {
    endAccountSession();
    return false;
  }
  if (s.activeAccountId === id) return true;
  endAccountSession();
  s.activeAccountId = id;
  s.accountCacheLoaded = false;
  notifyAccountSessionChange();
  const lease = getAccountSessionLease();
  if (!lease) return false;
  try {
    const key = accountDocumentKey(id);
    // A rapid A -> logout -> A re-login must await A's captured flush
    // before reading A's namespace, or it could restore stale data.
    await pendingWrites.get(key)?.catch(() => undefined);
    if (!isAccountSessionLeaseCurrent(lease)) return false;
    const cached = await idbGet(key);
    if (!isAccountSessionLeaseCurrent(lease)) return false;
    if (isAccountSnapshot(cached, id)) {
      s.doc = cached.doc;
      s.lastSyncedVersion = cached.lastSyncedVersion;
      s.lastSyncedAt = cached.lastSyncedAt;
      s.syncDirty = cached.syncDirty;
    }
  } catch {
    // Offline-capable: if IDB is unavailable the in-memory doc starts empty.
  }
  if (!isAccountSessionLeaseCurrent(lease)) return false;
  s.accountCacheLoaded = true;
  return true;
}

/** Legacy state-v1 is NEVER assigned by lastUserId, email, or first login.
 * It is read-only/quarantined unless a verified account's server document
 * contains a matching unique log and matching account email. The source
 * key remains untouched even after a safe union, for rollback. */
export async function recoverVerifiedLegacyState(
  serverDoc: SyncDocument,
  lease: AccountSessionLease,
): Promise<boolean> {
  if (!isAccountSessionLeaseCurrent(lease)) return false;
  const account = getState().user;
  if (!account) return false;
  let legacy: LegacyPersistedSnapshot | null = null;
  try {
    legacy = await idbGet(LEGACY_DOCUMENT_KEY) as LegacyPersistedSnapshot | null;
  } catch {
    return false;
  }
  if (!isAccountSessionLeaseCurrent(lease)) return false;
  if (!legacyHasPositiveOwnerEvidence(legacy, serverDoc, account.email)) return false;
  mergeServerDoc(legacy!.doc);
  markDirty(); // server echo is required; original state-v1 remains intact
  return true;
}

function installCrossTabAccountGuard(): void {
  removeStorageListener?.();
  if (typeof window === 'undefined' || !window.addEventListener) return;
  const onStorage = (e: StorageEvent) => {
    if (!state?.activeAccountId) return;
    if (e.key !== LS_USER_RECORD && e.key !== LS_SESSION_USER_ID &&
        e.key !== LS_SESSION_TOKEN && e.key !== LS_TOKEN_OWNER && e.key !== null) return;
    const account = loadUserRecord();
    const active = state.activeAccountId;
    if (!account?.verifiedServerId || account.id !== active ||
        getSessionUserId() !== active) {
      endAccountSession();
    } else if (e.key === LS_SESSION_TOKEN || e.key === LS_TOKEN_OWNER) {
      // A new token cannot authorize old requests, even for the same ID.
      bumpEpoch();
    }
  };
  window.addEventListener('storage', onStorage);
  removeStorageListener = () => window.removeEventListener('storage', onStorage);
}

/** No guest progress may be written to another account. */
export function markDirty(): void {
  const s = getState();
  if (!getAccountSessionLease() || !s.accountCacheLoaded) return;
  s.syncDirty = true;
  s.doc.updatedAt = new Date().toISOString();
  schedulePersist();
}

export const markSyncDirty = markDirty;

export function isSyncDirty(): boolean {
  return getState().syncDirty;
}

export function clearSyncDirty(): void {
  getState().syncDirty = false;
  schedulePersist();
}

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
  endAccountSession();
  const s = newState();
  state = s;
  installCrossTabAccountGuard();

  s.deviceId = getOrCreateDeviceId();
  s.user = loadUserRecord();
  s.lastUserId = getLastUserId();
  s.sessionUserId = getSessionUserId();
  try {
    const raw = lsGet(LS_DEVICE_TRUST);
    s.deviceTrust = raw ? (JSON.parse(raw) as Record<string, DeviceTrust>) : {};
  } catch {
    s.deviceTrust = {};
  }

  let sessionUser: StoreInit['sessionUser'] = null;
  const id = s.sessionUserId;
  // An explicit logout always requires re-authentication, even inside the
  // old 30-minute grace; trust is not a replacement for a verified session.
  if (id && s.user?.verifiedServerId && s.user.id === id) {
    const trust = s.deviceTrust[id];
    if (trust && trust.lastLogoutAt === null && isLogoutGraceActive(trust.lastLogoutAt)) {
      if (await activateVerifiedAccount(id)) {
        sessionUser = { id: s.user.id, username: s.user.username, email: s.user.email };
      }
    }
  }

  // Only pull using a token previously bound to this exact verified account.
  // A slow pull from this boot may never apply after a switch/logout.
  const lease = getAccountSessionLease();
  const token = getSessionToken();
  if (sessionUser && lease && token) {
    try {
      const pulled = await syncPull(token);
      if (isAccountSessionLeaseCurrent(lease) && getSessionToken() === token &&
          pulled.ok && pulled.payload) {
        await recoverVerifiedLegacyState(pulled.payload, lease);
        if (isAccountSessionLeaseCurrent(lease) && getSessionToken() === token) {
          if (pulled.version > s.lastSyncedVersion) {
            mergeServerDoc(pulled.payload);
            s.lastSyncedVersion = pulled.version;
            s.syncDirty = true;
            schedulePersist();
          } else if (s.lastSyncedVersion === 0) {
            mergeServerDoc(pulled.payload);
            s.lastSyncedVersion = pulled.version;
            schedulePersist();
          }
        }
      }
    } catch {
      // Offline/expired token: keep THIS verified account's local copy.
    }
  }

  return { sessionUser, deviceId: s.deviceId, lastEmail: s.user?.email ?? null };
}
