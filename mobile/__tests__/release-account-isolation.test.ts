/**
 * Agent 13: intentionally red acceptance tests against the known unsafe
 * shared-key baseline. No real accounts, network, passwords or user data.
 * Do not weaken tests to obtain green pre-fix CI.
 */
import { ServerUnreachable, syncPull, syncPush } from '../src/lib/api';
import type { SyncDocument } from '../src/lib/sync-types';
import {
  clearSessionToken, clearUserRecord, getSessionToken, getState,
  initStore, saveUserRecord, setSessionToken,
} from '../src/store/state';
import { syncNow } from '../src/store/sync';

jest.mock('../src/lib/api', () => {
  const actual = jest.requireActual('../src/lib/api');
  return { ...actual, syncPull: jest.fn(), syncPush: jest.fn() };
});

const pull = syncPull as jest.MockedFunction<typeof syncPull>;
const push = syncPush as jest.MockedFunction<typeof syncPush>;
const A = { id: 'qa-account-a', email: 'a@qa.invalid', username: 'qa-a', serverHasPassword: true, passwordHash: '', salt: '' };
const B = { id: 'qa-account-b', email: 'b@qa.invalid', username: 'qa-b', serverHasPassword: true, passwordHash: '', salt: '' };
const LOG = {
  id: 'qa-event-a', grammarPointId: 'gp_e_loc', rating: 3,
  reviewedAt: '2026-11-10T12:00:00.000Z', stability: 3,
  difficulty: 5, elapsedDays: 1, scheduledDays: 2,
};
const snapshot = (): SyncDocument => ({
  version: 2, updatedAt: '2026-11-10T12:00:00.000Z',
  user: { username: A.username, email: A.email },
  reviewCards: [], reviewLogs: [{ ...LOG }],
  libraryDecks: [{ deckId: 'deck_topik1_level1', addedAt: '2026-11-10T11:00:00.000Z' }],
  streak: null, settings: null, dailyLearned: {},
});

const local = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: (key: string) => local.get(key) ?? null,
  setItem: (key: string, val: string) => { local.set(key, val); },
  removeItem: (key: string) => { local.delete(key); },
  clear: () => local.clear(),
} });

beforeEach(async () => {
  local.clear();
  jest.resetAllMocks();
  pull.mockResolvedValue({ ok: true, version: 0, updatedAt: null, payload: null });
  push.mockResolvedValue({ ok: true, version: 1 });
  await initStore();
});

describe('release: cross-account isolation', () => {
  it('detaches progress immediately when the signed-in account is cleared', async () => {
    saveUserRecord(A);
    getState().doc = snapshot();
    await clearUserRecord();
    expect(getState().doc.reviewLogs).toHaveLength(0);
    expect(getState().doc.libraryDecks).toHaveLength(0);
  });
  it('keeps B from accessing A history after switching in the same browser', async () => {
    saveUserRecord(A);
    getState().doc = snapshot();
    clearSessionToken();
    await clearUserRecord();
    await saveUserRecord(B);
    expect(getState().user?.id).toBe(B.id);
    expect(getState().doc.reviewLogs.some(log => log.id === LOG.id)).toBe(false);
    expect(getState().doc.libraryDecks.some(d => d.deckId === 'deck_topik1_level1')).toBe(false);
  });
  it('ignores delayed A sync across logout + B login, without stale push or token reuse', async () => {
    saveUserRecord(A);
    setSessionToken('qa-token-A');
    let finish!: (v: Awaited<ReturnType<typeof syncPull>>) => void;
    const pending = new Promise<Awaited<ReturnType<typeof syncPull>>>(res => { finish = res; });
    pull.mockImplementationOnce(() => pending);
    const oldRun = syncNow();
    expect(pull).toHaveBeenCalledWith('qa-token-A');
    clearSessionToken();
    await clearUserRecord();
    await saveUserRecord(B);
    setSessionToken('qa-token-B');
    // Independently isolate the in-flight callback from the known stale-doc
    // logout bug. Even with a clean B document, A's late response must not
    // mutate or push through the new session.
    const cleanB = snapshot();
    cleanB.user = { username: B.username, email: B.email };
    cleanB.reviewLogs = [];
    cleanB.libraryDecks = [];
    getState().doc = cleanB;
    finish({ ok: true, version: 2, updatedAt: '2026-11-10T12:00:00.000Z', payload: snapshot() });
    await oldRun;
    expect(getSessionToken()).toBe('qa-token-B');
    expect(getState().user?.id).toBe(B.id);
    expect(getState().doc.reviewLogs.some(log => log.id === LOG.id)).toBe(false);
    expect(push).not.toHaveBeenCalledWith('qa-token-A', expect.anything());
    expect(push).not.toHaveBeenCalledWith('qa-token-B', expect.objectContaining({
      reviewLogs: expect.arrayContaining([LOG]),
    }));
  });
  it('retains local history after an offline timeout; no push attempted', async () => {
    saveUserRecord(A);
    setSessionToken('qa-token-A');
    getState().doc.reviewLogs = [{ ...LOG }];
    pull.mockRejectedValueOnce(new ServerUnreachable());
    const result = await syncNow();
    expect(result.status).toBe('offline');
    expect(getState().doc.reviewLogs.map(log => log.id)).toEqual([LOG.id]);
    expect(push).not.toHaveBeenCalled();
  });
  it('invalidates an expired token without uploading progress', async () => {
    saveUserRecord(A);
    setSessionToken('qa-token-expired');
    pull.mockResolvedValueOnce({ ok: false, version: 0, updatedAt: null, payload: null, error: 'unauthorized' });
    const result = await syncNow();
    expect(result.status).toBe('unauthorized');
    expect(getSessionToken()).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });
});
