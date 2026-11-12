// Thin client for the Munpro auth + sync backend (~/korean-auth/server.js,
// reached same-origin through the static server's /api proxy). No DB
// knowledge here — that lives in db/ and lib/sync.ts.
//
// A failed fetch (server unreachable, offline) throws ServerUnreachable,
// so callers can tell "no server" apart from "server said no". Sync
// treats it as silent (offline-first); auth surfaces it as an error.
//
// The API base defaults to '' (same-origin, relative paths). Tests that
// run against a real backend set it with setApiBase() — the app never
// does, so the browser always uses the same-origin proxy.

import type { SyncDocument } from './sync-types';

let apiBase = '';

/** Override the API base (tests only). The app always uses ''. */
export function setApiBase(base: string): void {
  apiBase = base;
}

export function getApiBase(): string {
  return apiBase;
}

export class ServerUnreachable extends Error {
  constructor() {
    super('server-unreachable');
    this.name = 'ServerUnreachable';
  }
}

export interface ServerUser {
  id: string;
  email: string;
  username: string;
  /** True when the server says this account has a password set. */
  hasPassword?: boolean;
}

async function postJson<T>(path: string, body: unknown, token?: string | null): Promise<{ status: number; json: T }> {
  let res: Response;
  try {
    res = await fetch(`${apiBase}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ServerUnreachable();
  }
  let json = {} as T;
  try {
    json = (await res.json()) as T;
  } catch {
    json = {} as T;
  }
  return { status: res.status, json };
}

async function getJson<T>(path: string, token?: string | null): Promise<{ status: number; json: T }> {
  let res: Response;
  try {
    res = await fetch(`${apiBase}${path}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    throw new ServerUnreachable();
  }
  let json = {} as T;
  try {
    json = (await res.json()) as T;
  } catch {
    json = {} as T;
  }
  return { status: res.status, json };
}

export async function requestCode(email: string): Promise<{ ok: boolean; delivery?: string; error?: string; status: number }> {
  const { status, json } = await postJson<{ ok: boolean; delivery?: string; error?: string }>(
    '/api/auth/request-code',
    { email },
  );
  return { ...json, status };
}

export async function verifyCode(
  email: string,
  code: string,
): Promise<{ ok: boolean; token?: string; user?: ServerUser; error?: string; status: number }> {
  const { status, json } = await postJson<{ ok: boolean; token?: string; user?: ServerUser; error?: string }>(
    '/api/auth/verify-code',
    { email, code },
  );
  return { ...json, status };
}

export async function loginPassword(
  email: string,
  password: string,
): Promise<{ ok: boolean; token?: string; user?: ServerUser; error?: string; status: number }> {
  const { status, json } = await postJson<{ ok: boolean; token?: string; user?: ServerUser; error?: string }>(
    '/api/auth/login-password',
    { email, password },
  );
  return { ...json, status };
}

export async function setServerPassword(
  password: string,
  token: string,
): Promise<{ ok: boolean; error?: string; status: number }> {
  const { status, json } = await postJson<{ ok: boolean; error?: string }>(
    '/api/auth/set-password',
    { password },
    token,
  );
  return { ...json, status };
}

export async function logoutServer(token: string): Promise<void> {
  try {
    await postJson('/api/auth/logout', {}, token);
  } catch {
    // Logging out locally is what matters; a failed server call just
    // leaves an orphaned token that expires on its own in 30 days.
  }
}

export async function syncPull(
  token: string,
): Promise<{ ok: boolean; version: number; updatedAt: string | null; payload: SyncDocument | null; error?: string; status: number }> {
  const { status, json } = await getJson<{ ok: boolean; version: number; updatedAt: string | null; payload: SyncDocument | null; error?: string }>(
    '/api/sync/pull',
    token,
  );
  return { ...json, status };
}

/**
 * Push a sync snapshot with the compare-and-swap precondition. The
 * caller passes the server version it last pulled (0 when nothing is
 * stored yet); the server rejects the push with 409 when that version
 * no longer matches, and with 428 when expectedVersion is absent.
 * The returned `status` lets the caller tell 409/428/413/429 apart.
 */
export async function syncPush(
  token: string,
  doc: SyncDocument,
  expectedVersion: number,
): Promise<{ ok: boolean; version: number; error?: string; status: number }> {
  const { status, json } = await postJson<{ ok: boolean; version: number; error?: string }>(
    '/api/sync/push',
    { expectedVersion, updatedAt: doc.updatedAt, payload: doc },
    token,
  );
  return { ...json, status };
}
