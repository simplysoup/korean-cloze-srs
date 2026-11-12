// End-to-end test of the client CAS protocol against the REAL staging
// backend (the fixed server on the VPS, reached through an SSH forward
// at http://127.0.0.1:28769). This is NOT run by the normal CI suite —
// it needs the staging server and synthetic users, so it is skipped
// unless MUNPRO_E2E_STAGING=1 and the tokens are provided.
//
// Run it with (tokens are synthetic @qa.invalid sessions created in the
// staging DB; they are passed by env, never written to a file):
//   MUNPRO_E2E_STAGING=1 MUNPRO_E2E_TOKEN_A1=... MUNPRO_E2E_TOKEN_A2=... \
//     MUNPRO_E2E_TOKEN_B=... npx jest __tests__/sync-cas-staging.e2e.test.ts --ci --runInBand
//
// The synthetic users/sessions must be removed from the staging DB
// after the run (the test does not delete them; the operator does).

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

import { setApiBase, syncPull, syncPush } from '../src/lib/api';
import { getState, initStore, setSessionToken, saveUserRecord } from '../src/store/state';
import { syncNow } from '../src/store/sync';
import type { SyncDocument } from '../src/lib/sync-types';

const ENABLED = process.env.MUNPRO_E2E_STAGING === '1';
const TOKEN_A1 = process.env.MUNPRO_E2E_TOKEN_A1 ?? '';
const TOKEN_A2 = process.env.MUNPRO_E2E_TOKEN_A2 ?? '';
const TOKEN_B = process.env.MUNPRO_E2E_TOKEN_B ?? '';

const describeE2E = ENABLED && TOKEN_A1 && TOKEN_A2 && TOKEN_B ? describe : describe.skip;

function emptyDoc(): SyncDocument {
  return {
    version: 0,
    updatedAt: new Date().toISOString(),
    user: { username: 'a', email: 'qa-e2e-a@qa.invalid' },
    reviewCards: [],
    reviewLogs: [],
    libraryDecks: [],
    streak: null,
    settings: null,
    dailyLearned: {},
  };
}

function log(id: string): SyncDocument['reviewLogs'][number] {
  return {
    id,
    grammarPointId: 'gp1',
    rating: 3,
    reviewedAt: new Date().toISOString(),
    stability: 2,
    difficulty: 5,
    elapsedDays: 1,
    scheduledDays: 2,
  };
}

describeE2E('client CAS protocol against the real staging server', () => {
  beforeAll(() => {
    setApiBase('http://127.0.0.1:28769');
  });

  afterAll(() => {
    setApiBase('');
  });

  beforeEach(async () => {
    lsStore.clear();
    await initStore();
    const s = getState();
    s.doc = emptyDoc();
    s.lastSyncedVersion = 0;
    s.lastSyncedUserId = null;
    s.lastSyncedAt = null;
    s.syncDirty = false;
  });

  it('syncs a local log to the server with expectedVersion', async () => {
    const s = getState();
    s.user = { id: 'qa-e2e-a', email: 'qa-e2e-a@qa.invalid', username: 'qa-e2e-a', serverHasPassword: false, passwordHash: '', salt: '' };
    saveUserRecord(s.user);
    setSessionToken(TOKEN_A1);
    s.doc.reviewLogs = [log('e2e-local-1')];
    s.syncDirty = true;
    const res = await syncNow();
    expect(res.ok).toBe(true);
    expect(res.status).toBe('synced');
    expect(res.version).toBeGreaterThan(0);
    expect(getState().syncDirty).toBe(false);
    // The server really has the log.
    const pulled = await syncPull(TOKEN_A1);
    expect(pulled.ok).toBe(true);
    expect(pulled.payload?.reviewLogs.map((l) => l.id)).toContain('e2e-local-1');
  });

  it('merges another device’s log on pull and keeps both', async () => {
    // Device 2 (same user, second token) pushes its own log directly.
    const pulledBefore = await syncPull(TOKEN_A2);
    const serverVersion = pulledBefore.version;
    const device2Doc = emptyDoc();
    device2Doc.reviewLogs = [...(pulledBefore.payload?.reviewLogs ?? []), log('e2e-device2-1')];
    const pushed = await syncPush(TOKEN_A2, device2Doc, serverVersion);
    expect(pushed.ok).toBe(true);
    // Device 1 (the store) has its own local log and syncs. The pull
    // merges device 2's log; the push uploads both.
    const s = getState();
    s.user = { id: 'qa-e2e-a', email: 'qa-e2e-a@qa.invalid', username: 'qa-e2e-a', serverHasPassword: false, passwordHash: '', salt: '' };
    saveUserRecord(s.user);
    setSessionToken(TOKEN_A1);
    s.doc = emptyDoc();
    s.doc.reviewLogs = [log('e2e-device1-1')];
    s.lastSyncedVersion = serverVersion;
    s.lastSyncedUserId = 'qa-e2e-a';
    s.syncDirty = true;
    const res = await syncNow();
    expect(res.ok).toBe(true);
    expect(res.status).toBe('synced');
    const pulled = await syncPull(TOKEN_A1);
    const ids = new Set(pulled.payload?.reviewLogs.map((l) => l.id));
    expect(ids.has('e2e-device2-1')).toBe(true);
    expect(ids.has('e2e-device1-1')).toBe(true);
  });

  it('a second account cannot read the first account’s snapshot', async () => {
    const pulled = await syncPull(TOKEN_B);
    expect(pulled.ok).toBe(true);
    // User B has no snapshot of its own.
    expect(pulled.version).toBe(0);
    expect(pulled.payload).toBeNull();
  });
});
