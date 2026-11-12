// Client CAS protocol tests — the sync layer against the compare-and-
// swap server. fetch is mocked to play the server's part (pull/push
// with versions, 409 conflicts, 428, 413, 429, offline), and the store
// is the real web store (in-memory + mocked localStorage, no IndexedDB,
// no network).
//
// The store runs in a node Jest environment, so localStorage is mocked
// here before the store is imported, the same way store.test.ts does it.

const lsStore = new Map<string, string>();
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (k: string) => (lsStore.has(k) ? lsStore.get(k)! : null),
  setItem: (k: string, v: string) => {
    lsStore.set(k, v);
  },
  removeItem: (k: string) => {
    lsStore.delete(k);
  },
  clear: () => lsStore.clear(),
};

import { getState, initStore, setSessionToken } from '../src/store/state';
import { syncNow } from '../src/store/sync';
import type { SyncDocument } from '../src/lib/sync-types';

const TOKEN = 'a'.repeat(64);
const USER_A = { id: 'u_a', email: 'a@qa.invalid', username: 'a', serverHasPassword: false, passwordHash: '', salt: '' };
const USER_B = { id: 'u_b', email: 'b@qa.invalid', username: 'b', serverHasPassword: false, passwordHash: '', salt: '' };

function emptyDoc(userId = 'u_a'): SyncDocument {
  return {
    version: 0,
    updatedAt: new Date().toISOString(),
    user: { username: 'a', email: 'a@qa.invalid' },
    reviewCards: [],
    reviewLogs: [],
    libraryDecks: [],
    streak: null,
    settings: null,
    dailyLearned: {},
  };
}

function log(id: string, gp = 'gp1'): SyncDocument['reviewLogs'][number] {
  return {
    id,
    grammarPointId: gp,
    rating: 3,
    reviewedAt: new Date().toISOString(),
    stability: 2,
    difficulty: 5,
    elapsedDays: 1,
    scheduledDays: 2,
  };
}

function docWithLogs(...logs: SyncDocument['reviewLogs']): SyncDocument {
  const d = emptyDoc();
  d.reviewLogs = logs;
  return d;
}

/** A fetch mock that answers pull/push from a scripted server state. */
type PushReply = { status: number; version?: number; error?: string };
type PullReply = { status: number; version: number; payload: SyncDocument | null; error?: string };

interface Script {
  /** Server version and payload at the start. */
  version: number;
  payload: SyncDocument | null;
  /** Push replies in order; when exhausted, pushes succeed with version+1. */
  pushReplies?: PushReply[];
  /** Pull replies in order (after the first); when exhausted, pulls return the current server state. */
  pullReplies?: PullReply[];
  /** Called on every request, with the parsed body (push) or null (pull). */
  onRequest?: (path: string, body: Record<string, unknown> | null) => void;
  /** Throw instead of answering (simulates offline). */
  throwOn?: (path: string) => boolean;
}

function installMock(script: Script) {
  const pushBodies: Record<string, unknown>[] = [];
  let serverVersion = script.version;
  let serverPayload = script.payload;
  let pushIdx = 0;
  let pullIdx = 0;
  const fetchMock = jest.fn(async (url: string, init?: RequestInit) => {
    const path = String(url);
    const body = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : null;
    script.onRequest?.(path, body);
    if (script.throwOn?.(path)) throw new Error('network down');
    const json = (obj: unknown, status = 200) => ({
      status,
      json: async () => obj,
    });
    if (path.endsWith('/api/sync/pull')) {
      const reply = script.pullReplies?.[pullIdx++];
      if (reply) return json({ ok: reply.status === 200, version: reply.version, updatedAt: null, payload: reply.payload, error: reply.error }, reply.status);
      return json({ ok: true, version: serverVersion, updatedAt: null, payload: serverPayload });
    }
    if (path.endsWith('/api/sync/push')) {
      pushBodies.push(body ?? {});
      const reply = script.pushReplies?.[pushIdx++];
      if (reply) {
        if (reply.status === 200) {
          serverVersion = reply.version ?? serverVersion + 1;
          serverPayload = (body?.payload as SyncDocument) ?? serverPayload;
        }
        return json({ ok: reply.status === 200, version: reply.version ?? serverVersion, error: reply.error }, reply.status);
      }
      // Default: enforce the CAS rule — the push must carry the current
      // server version, else 409.
      const expected = (body as { expectedVersion?: unknown })?.expectedVersion;
      if (expected === undefined) return json({ ok: false, error: 'precondition-required' }, 428);
      if (expected !== serverVersion) return json({ ok: false, error: 'version-conflict' }, 409);
      serverVersion += 1;
      serverPayload = (body?.payload as SyncDocument) ?? serverPayload;
      return json({ ok: true, version: serverVersion }, 200);
    }
    return json({ ok: false, error: 'not-found' }, 404);
  });
  (globalThis as Record<string, unknown>).fetch = fetchMock;
  return { fetchMock, pushBodies, getServerVersion: () => serverVersion, getServerPayload: () => serverPayload };
}

beforeEach(async () => {
  lsStore.clear();
  await initStore();
  const s = getState();
  s.doc = emptyDoc();
  s.lastSyncedVersion = 0;
  s.lastSyncedUserId = null;
  s.lastSyncedAt = null;
  s.syncDirty = false;
  s.user = { ...USER_A };
  setSessionToken(TOKEN);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('client CAS protocol', () => {
  it('sends expectedVersion on every push', async () => {
    const { pushBodies } = installMock({ version: 3, payload: docWithLogs(log('srv-1')) });
    const s = getState();
    s.lastSyncedVersion = 3;
    s.lastSyncedUserId = 'u_a';
    s.syncDirty = true;
    const res = await syncNow();
    expect(res.ok).toBe(true);
    expect(res.status).toBe('synced');
    expect(res.version).toBe(4);
    expect(pushBodies).toHaveLength(1);
    expect(pushBodies[0]?.expectedVersion).toBe(3);
  });

  it('retries a 409 by re-pulling, merging, and pushing the new version', async () => {
    // Server is at version 4 with one log; the client last saw 3 and
    // has its own local log. The first push gets 409, the retry merges
    // both logs and succeeds.
    const serverDoc = docWithLogs(log('srv-1'));
    const { getServerPayload } = installMock({
      version: 4,
      payload: serverDoc,
      pushReplies: [{ status: 409, error: 'version-conflict' }],
    });
    const s = getState();
    s.lastSyncedVersion = 3;
    s.lastSyncedUserId = 'u_a';
    s.doc.reviewLogs = [log('local-1')];
    s.syncDirty = true;
    const res = await syncNow();
    expect(res.ok).toBe(true);
    expect(res.status).toBe('synced');
    expect(res.version).toBe(5);
    const ids = new Set(getServerPayload()?.reviewLogs.map((l) => l.id));
    expect(ids.has('srv-1')).toBe(true);
    expect(ids.has('local-1')).toBe(true);
    expect(getState().syncDirty).toBe(false);
  });

  it('keeps local state dirty when 409 retries are exhausted', async () => {
    installMock({
      version: 4,
      payload: docWithLogs(log('srv-1')),
      pushReplies: [
        { status: 409, error: 'version-conflict' },
        { status: 409, error: 'version-conflict' },
        { status: 409, error: 'version-conflict' },
      ],
      pullReplies: [
        { status: 200, version: 4, payload: docWithLogs(log('srv-1')) },
        { status: 200, version: 4, payload: docWithLogs(log('srv-1')) },
      ],
    });
    const s = getState();
    s.lastSyncedVersion = 3;
    s.lastSyncedUserId = 'u_a';
    s.doc.reviewLogs = [log('local-1')];
    s.syncDirty = true;
    const res = await syncNow();
    expect(res.ok).toBe(false);
    expect(res.status).toBe('version-conflict');
    // Nothing was cleared: the next sync retries from the local state.
    expect(getState().syncDirty).toBe(true);
    expect(getState().doc.reviewLogs.map((l) => l.id)).toContain('local-1');
  });

  it('a 428 does not clear dirty state', async () => {
    installMock({
      version: 3,
      payload: null,
      pushReplies: [{ status: 428, error: 'precondition-required' }],
    });
    const s = getState();
    s.lastSyncedVersion = 3;
    s.lastSyncedUserId = 'u_a';
    s.syncDirty = true;
    const res = await syncNow();
    expect(res.ok).toBe(false);
    expect(res.status).toBe('precondition-required');
    expect(getState().syncDirty).toBe(true);
  });

  it('a 413 does not clear dirty state', async () => {
    installMock({
      version: 3,
      payload: null,
      pushReplies: [{ status: 413, error: 'payload-too-large' }],
    });
    const s = getState();
    s.lastSyncedVersion = 3;
    s.lastSyncedUserId = 'u_a';
    s.syncDirty = true;
    const res = await syncNow();
    expect(res.ok).toBe(false);
    expect(res.status).toBe('payload-too-large');
    expect(getState().syncDirty).toBe(true);
  });

  it('offline does not clear dirty state', async () => {
    installMock({ version: 3, payload: null, throwOn: () => true });
    const s = getState();
    s.lastSyncedVersion = 3;
    s.lastSyncedUserId = 'u_a';
    s.syncDirty = true;
    const res = await syncNow();
    expect(res.ok).toBe(false);
    expect(res.status).toBe('offline');
    expect(getState().syncDirty).toBe(true);
  });

  it('resets the version when the account changes', async () => {
    const { pushBodies } = installMock({ version: 0, payload: null });
    const s = getState();
    // The cache was last synced by user A at version 5.
    s.lastSyncedVersion = 5;
    s.lastSyncedUserId = 'u_a';
    // User B is now logged in.
    s.user = { ...USER_B };
    s.syncDirty = true;
    const res = await syncNow();
    expect(res.ok).toBe(true);
    expect(res.status).toBe('synced');
    // The first push for B uses expectedVersion 0, not A's 5.
    expect(pushBodies[0]?.expectedVersion).toBe(0);
    expect(getState().lastSyncedUserId).toBe('u_b');
  });

  it('an account switch mid-sync aborts without mutating the new account', async () => {
    // The pull resolves, then the test swaps the account before the
    // push fires. The run must abort as account-changed and leave the
    // new account's doc and version untouched.
    const s = getState();
    s.lastSyncedVersion = 2;
    s.lastSyncedUserId = 'u_a';
    s.syncDirty = true;
    const beforeDoc = JSON.stringify(s.doc);
    installMock({
      version: 2,
      payload: null,
      onRequest: (path) => {
        if (path.endsWith('/api/sync/pull')) {
          // Simulate a logout + a different login while the sync runs.
          s.user = { ...USER_B };
          setSessionToken('b'.repeat(64));
        }
      },
    });
    const res = await syncNow();
    expect(res.status).toBe('account-changed');
    expect(res.ok).toBe(false);
    expect(getState().user?.id).toBe('u_b');
    expect(getState().lastSyncedVersion).toBe(2);
    expect(JSON.stringify(getState().doc)).toBe(beforeDoc);
    expect(getState().syncDirty).toBe(true);
  });

  it('persists the server version with the account it belongs to', async () => {
    installMock({ version: 3, payload: docWithLogs(log('srv-1')) });
    const s = getState();
    s.lastSyncedVersion = 3;
    s.lastSyncedUserId = 'u_a';
    s.syncDirty = true;
    const res = await syncNow();
    expect(res.ok).toBe(true);
    expect(getState().lastSyncedVersion).toBe(4);
    expect(getState().lastSyncedUserId).toBe('u_a');
  });
});
