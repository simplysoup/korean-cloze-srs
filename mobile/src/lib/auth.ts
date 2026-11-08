// Local-only auth logic for Munpro — pure functions, unit-testable in Jest.
// Email-code auth is the preferred route (codes are issued by the VPS auth
// backend); a password is optional and only a second way in. Passwords are
// salted + iterated SHA-256 (see sha256.ts). The database never leaves the
// device; this is a local-privacy measure so a copied DB file does not
// expose plaintext passwords, not server-grade credential storage. No
// server auth, no password reset, no social login (Google/Meta later).

import { sha256Hex } from './sha256';

export interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  code?: string;
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const CODE_RE = /^\d{6}$/;

/** Error string, or undefined when the email is usable. */
export function validateEmail(email: string): string | undefined {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return 'Email is required.';
  if (!EMAIL_RE.test(normalized)) return 'Enter a valid email address.';
  return undefined;
}

/** Error string, or undefined when the 6-digit code looks right. */
export function validateCode(code: string): string | undefined {
  if (!code.trim()) return 'Enter the 6-digit code.';
  if (!CODE_RE.test(code.trim())) return 'The code is 6 digits.';
  return undefined;
}

export function validatePasswordSet(password: string, confirmPassword: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!password) errors.password = 'Password is required.';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters.';
  if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.';
  }
  return errors;
}

export function validateLoginPassword(password: string): string | undefined {
  if (!password) return 'Password is required.';
  return undefined;
}

/** Display name for an account created from an email address only: the
 * local part, stripped to letters/numbers/underscores. A plus-tag
 * (nick+tag@…) is dropped first, so it reads as the real local part. */
export function usernameFromEmail(email: string): string {
  const localPart = email.trim().toLowerCase().split('@')[0]?.split('+')[0] ?? '';
  const cleaned = localPart.replace(/[^A-Za-z0-9_]/g, '').slice(0, 20);
  return cleaned || 'learner';
}

// ── Device trust / logout grace ─────────────────────────────────────────────

/** After logging out, the same device auto-logs the user back in for this
 * long without a fresh email code. Past it, the code route is required. */
export const LOGOUT_GRACE_MS = 30 * 60 * 1000;

/** True when a trusted device may auto-log the user in without a fresh
 * code: never logged out, or logged out within the grace window. */
export function isLogoutGraceActive(lastLogoutAt: string | null, nowMs: number = Date.now()): boolean {
  if (!lastLogoutAt) return true;
  const loggedOutMs = new Date(lastLogoutAt).getTime();
  if (Number.isNaN(loggedOutMs)) return false;
  return nowMs - loggedOutMs <= LOGOUT_GRACE_MS;
}

/** 16 random bytes, hex-encoded. Prefers crypto.getRandomValues (web secure
 * context and modern native runtimes); falls back to Math.random, which is
 * adequate for a salt in a local-only app. */
export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  const cryptoObj = (globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => void } }).crypto;
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const HASH_ROUNDS = 1000;

/** Salted, iterated SHA-256. Deterministic for a given salt + password. */
export function hashPassword(password: string, salt: string): string {
  let h = sha256Hex(`${salt}:${password}`);
  for (let i = 1; i < HASH_ROUNDS; i++) h = sha256Hex(h);
  return h;
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  return hashPassword(password, salt) === hash;
}
