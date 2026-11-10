import {
  activateVerifiedAccount, clearSessionToken, clearSessionUserId,
  endAccountSession, getAccountSessionLease, getState, initStore,
  isAccountSessionLeaseCurrent, markDirty, persistNow,
  setSessionToken, setSessionUserId,
} from '../../state';
import { recordServerUser } from '../../auth';

jest.mock('../../../lib/api', () => ({
  syncPull: jest.fn().mockResolvedValue({ ok: false }),
}));

type Req = { result?: unknown; error?: Error; onsuccess?: () => void; onerror?: () => void; onupgradeneeded?: () => void };
const rows = new Map<string, unknown>();
const delayedReads: Array<() => void> = [];
const delayedWrites: Array<() => void> = [];
let holdReadFor: string | null = null;
let holdWriteFor: string | null = null;

const localData = new Map<string, string>();
const localStorageMock = {
  getItem: (k: string) => localData.get(k) ?? null,
  setItem: (k: string, v: string) => { localData.set(k, v); },
  removeItem: (k: string) => { localData.delete(k); },
  clear: () => { localData.clear(); },
};
const storageListeners: Array<(event: { key: string | null }) => void> = [];

function dbMock() {
  return {
    objectStoreNames: { contains: () => true },
    createObjectStore: () => undefined,
    close: () => undefined,
    transaction: (_store: string, _mode: string) => {
      const tx: {
        oncomplete?: () => void; onabort?: () => void; onerror?: () => void; error?: Error;
        objectStore: (name: string) => {
          get: (key: string) => Req;
          put: (value: unknown, key: string) => Req;
        };
      } = {
        objectStore: () => ({
          get(key: string): Req {
            const request: Req = {};
            const finish = () => {
              request.result = rows.get(key);
              request.onsuccess?.();
            };
            if (holdReadFor === key) delayedReads.push(finish);
            else Promise.resolve().then(finish);
            return request;
          },
          put(value: unknown, key: string): Req {
            const request: Req = {};
            const finish = () => {
              rows.set(key, value);
              request.onsuccess?.();
              tx.oncomplete?.();
            };
            if (holdWriteFor === key) delayedWrites.push(finish);
            else Promise.resolve().then(finish);
            return request;
          },
        }),
      };
      return tx;
    },
  };
}

beforeAll(() => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: localStorageMock,
      addEventListener: (name: string, cb: (e: { key: string | null }) => void) => {
        if (name === 'storage') storageListeners.push(cb);
      },
      removeEventListener: (name: string, cb: (e: { key: string | null }) => void) => {
        if (name !== 'storage') return;
        const index = storageListeners.indexOf(cb);
        if (index >= 0) storageListeners.splice(index, 1);
      },
    },
  });
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: {
      open: () => {
        const request: Req = { result: dbMock() };
        Promise.resolve().then(() => request.onsuccess?.());
        return request;
      },
    },
  });
});

function login(id: string) {
  setSessionToken('test-token-for-' + id);
  recordServerUser({
    id, email: id.toLowerCase() + '@example.com',
    username: id, hasPassword: true,
  });
}

describe('account-scoped real web state (synthetic IDB, no production users)', () => {
  test('A/B isolation, logout barrier, reload, late IDB writes and account leases', async () => {
    await initStore();
    login('A');
    expect(await activateVerifiedAccount('A')).toBe(true);
    setSessionUserId('A');
    const firstLease = getAccountSessionLease()!;
    getState().doc.reviewLogs.push({
      id: 'A-log', grammarPointId: 'g-1', rating: 3,
      reviewedAt: '2026-01-01', stability: 1, difficulty: 1,
      elapsedDays: 0, scheduledDays: 1,
    });
    markDirty();
    await persistNow();
    expect(getState().doc.reviewLogs).toHaveLength(1);

    // A's stale persist can finish AFTER B's login; the key and value
    // were captured before the switch and must never reference B.
    holdWriteFor = 'state-v2:A';
    const lateAWrite = persistNow();
    await Promise.resolve();
    clearSessionUserId();
    expect(getState().doc.reviewLogs).toHaveLength(0);
    expect(getAccountSessionLease()).toBeNull();
    clearSessionToken();
    login('B');
    expect(await activateVerifiedAccount('B')).toBe(true);
    setSessionUserId('B');
    expect(getState().doc.reviewLogs).toHaveLength(0);
    expect(isAccountSessionLeaseCurrent(firstLease)).toBe(false);
    holdWriteFor = null;
    while (delayedWrites.length) delayedWrites.shift()!();
    await lateAWrite;
    expect((rows.get('state-v2:B') as { doc?: unknown } | undefined)).toBeUndefined();
    expect(getState().doc.reviewLogs).toHaveLength(0);

    getState().doc.reviewLogs.push({
      id: 'B-log', grammarPointId: 'g-1', rating: 3,
      reviewedAt: '2026-01-01', stability: 1, difficulty: 1,
      elapsedDays: 0, scheduledDays: 1,
    });
    markDirty();
    await persistNow();
    endAccountSession();
    login('A');
    expect(await activateVerifiedAccount('A')).toBe(true);
    expect(getState().doc.reviewLogs.map((l) => l.id)).toEqual(['A-log']);
    expect((rows.get('state-v2:B') as { doc: { reviewLogs: Array<{id:string}> } }).doc.reviewLogs[0].id).toBe('B-log');

    // Token expiry invalidates stale network leases but preserves A offline.
    const beforeExpiry = getAccountSessionLease()!;
    clearSessionToken();
    expect(isAccountSessionLeaseCurrent(beforeExpiry)).toBe(false);
    expect(getState().doc.reviewLogs[0].id).toBe('A-log');
  });

  test('delayed A read cannot replace B after rapid account switch', async () => {
    endAccountSession();
    login('A');
    holdReadFor = 'state-v2:A';
    const loadA = activateVerifiedAccount('A');
    await Promise.resolve();
    endAccountSession();
    login('B');
    holdReadFor = null;
    expect(await activateVerifiedAccount('B')).toBe(true);
    while (delayedReads.length) delayedReads.shift()!();
    expect(await loadA).toBe(false);
    expect(getState().doc.reviewLogs[0].id).toBe('B-log');
  });

  test('storage event from another tab revokes in-memory read access', async () => {
    setSessionUserId('B');
    localStorageMock.setItem('munpro.userRecord', JSON.stringify({
      id: 'A', email: 'a@example.com', username: 'A', verifiedServerId: true,
    }));
    storageListeners.forEach((listener) => listener({ key: 'munpro.userRecord' }));
    expect(getAccountSessionLease()).toBeNull();
    expect(getState().doc.reviewLogs).toHaveLength(0);
  });

  test('IDB failure starts empty and never resurrects prior account data', async () => {
    Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: undefined });
    login('B');
    expect(await activateVerifiedAccount('B')).toBe(true);
    expect(getState().doc.reviewLogs).toHaveLength(0);
  });
});
