// Thin client for the Munpro auth + sync backend (~/korean-auth/server.js,
// reached same-origin through the static server's /api proxy). No DB
// knowledge here — that lives in db/ and lib/sync.ts.
//
// A failed fetch (server unreachable, offline) throws ServerUnreachable,
// so callers can tell "no server" apart from "server said no". Sync
// treats it as silent (offline-first); auth surfaces it as an error.

import type { SyncDocument } from './sync-types';

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
}

async function postJson<T>(path: string, body: unknown, token?: string | null): Promise<{ status: number; json: T }> {
  let res: Response;
  try {
    res = await fetch(path, {
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
    res = await fetch(path, {
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
): Promise<{ ok: boolean; version: number; updatedAt: string | null; payload: SyncDocument | null; error?: string }> {
  const { json } = await getJson<{ ok: boolean; version: number; updatedAt: string | null; payload: SyncDocument | null; error?: string }>(
    '/api/sync/pull',
    token,
  );
  return json;
}

export async function syncPush(
  token: string,
  doc: SyncDocument,
): Promise<{ ok: boolean; version: number; error?: string }> {
  const { json } = await postJson<{ ok: boolean; version: number; error?: string }>(
    '/api/sync/push',
    { updatedAt: doc.updatedAt, payload: doc },
    token,
  );
  return json;
}
