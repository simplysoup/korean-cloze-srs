// Web auth — the account / session / device-trust functions the layout
// and AuthScreen use, backed by the web store state + localStorage
// instead of the SQLite users / device_trust / meta tables.
//
// There is one account at a time on web: the server user. The user
// record (id, email, username, whether the server says a password is
// set, and the local password hash/salt for offline login) lives in
// localStorage. The password hash is never the password itself, and
// password verification against the server is always preferred — the
// local hash exists only so a password login still works when the
// server is unreachable (the offline fallback AuthScreen already had).

import { generateSalt, hashPassword, isLogoutGraceActive, usernameFromEmail } from '../lib/auth';
import { isValidServerAccountId } from './account-isolation/storage';
import {
  getState,
  saveUserRecord,
  endAccountSession,
  bindSessionTokenToVerifiedAccount,
  type DeviceTrust,
  type ServerUserRecord,
} from './state';

export const LOCAL_USER_ID = 'local';

/** The id of the currently logged-in user. On web this is the server
 * user id once logged in, 'local' before that. */
let currentUserId = LOCAL_USER_ID;

export function setCurrentUserId(id: string): void {
  // Legacy synchronous call sites must not leave the previous account's
  // document readable during logout or an account transition.
  const active = getState().activeAccountId;
  if (id === LOCAL_USER_ID || (active && active !== id)) endAccountSession();
  currentUserId = id;
}

export function getCurrentUserId(): string {
  return currentUserId;
}

export interface DbUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  /** True when the server says this account has a password set. */
  serverHasPassword?: boolean;
}

function toDbUser(record: ServerUserRecord): DbUser {
  return {
    id: record.id,
    username: record.username,
    email: record.email,
    passwordHash: record.passwordHash,
    salt: record.salt,
    createdAt: '',
    serverHasPassword: record.serverHasPassword,
  };
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Record the server user from a successful auth response (code verify
 * or password login). This is the web replacement for createUserByEmail
 * in the auth flow: the record carries the server user id, so device
 * trust and the session key off the same id the server knows.
 */
export function recordServerUser(serverUser: {
  id: string;
  email: string;
  username: string;
  hasPassword?: boolean;
}): DbUser {
  if (!isValidServerAccountId(serverUser.id)) {
    throw new Error('server did not return a valid verified account id');
  }
  const existing = getState().user;
  const record: ServerUserRecord = {
    id: serverUser.id,
    email: serverUser.email.trim().toLowerCase(),
    username: serverUser.username,
    serverHasPassword: serverUser.hasPassword ??
      (existing?.id === serverUser.id ? existing.serverHasPassword : false),
    // Keep a locally-set password hash/salt (offline login) when the
    // same account already had one on this device.
    passwordHash: existing && existing.id === serverUser.id &&
      existing.email === serverUser.email.trim().toLowerCase() ? existing.passwordHash : '',
    salt: existing && existing.id === serverUser.id &&
      existing.email === serverUser.email.trim().toLowerCase() ? existing.salt : '',
    verifiedServerId: true,
  };
  saveUserRecord(record);
  bindSessionTokenToVerifiedAccount(record.id);
  return toDbUser(record);
}

export function countUsers(): number {
  return getState().user ? 1 : 0;
}

export function getUserByEmail(email: string): DbUser | null {
  const user = getState().user;
  if (!user) return null;
  return user.email === email.trim().toLowerCase() ? toDbUser(user) : null;
}

export function getUserById(id: string): DbUser | null {
  const user = getState().user;
  if (!user) return null;
  return user.id === id ? toDbUser(user) : null;
}

/** The single account on this device, or null when there is none. */
export function getSoleUser(): DbUser | null {
  const user = getState().user;
  return user ? toDbUser(user) : null;
}

/**
 * Create an account from an email address only (email-code auth).
 * Fallback for flows where the server user is not available — the auth
 * flow itself prefers recordServerUser. The username is derived from
 * the email; a password is optional and added later with
 * setUserPassword (empty hash = no password set).
 */
export function createUserByEmail(email: string): DbUser {
  const normalized = email.trim().toLowerCase();
  const existing = getUserByEmail(normalized);
  if (existing) return existing;
  const record: ServerUserRecord = {
    id: newId('u'),
    username: usernameFromEmail(normalized),
    email: normalized,
    serverHasPassword: false,
    passwordHash: '',
    salt: '',
    verifiedServerId: false, // a local fallback ID cannot select server-account storage
  };
  saveUserRecord(record);
  return toDbUser(record);
}

/** A password is set when there is a local hash or the server says one exists. */
export function userHasPassword(user: DbUser): boolean {
  return user.passwordHash !== '' || user.serverHasPassword === true;
}

/** Set (or change) the local password for an account (offline login).
 * The server-side set is the caller's job (setServerPassword), as in
 * the DB build. */
export function setUserPassword(userId: string, password: string): void {
  const s = getState();
  const user = s.user;
  if (!user || user.id !== userId) return;
  const salt = generateSalt();
  const updated: ServerUserRecord = {
    ...user,
    passwordHash: hashPassword(password, salt),
    salt,
    serverHasPassword: true,
  };
  saveUserRecord(updated);
}

/**
 * Move pre-auth data to a real account. No-op on web: there is no
 * pre-auth local data — the document is already the user's.
 */
export function migrateLocalDataToUser(_userId: string): void {
  // No-op.
}

// ── Device trust (email-code auth) ──────────────────────────────────────────
// A device is a random id in localStorage (per browser profile).
// Verifying an email code (or logging in with the password) marks the
// device trusted for that user. Logging out stamps the trust row,
// starting the 30-minute grace: within it the same device auto-logs
// the user back in; past it (or on a never-trusted device) the
// email-code route is required again.

export type { DeviceTrust };

export { getDeviceTrust, trustDevice, markDeviceLogout } from './state';

/** True when this trusted device may auto-log the user in without a
 * fresh code (never logged out, or logged out within the grace window). */
export function deviceMayAutoLogin(trust: DeviceTrust | null, nowMs: number = Date.now()): boolean {
  // An explicit logout revokes automatic access even within the previous
  // 30-minute grace; otherwise simply typing A's email exposes A's cache.
  if (!trust || trust.lastLogoutAt !== null) return false;
  return isLogoutGraceActive(trust.lastLogoutAt, nowMs);
}
