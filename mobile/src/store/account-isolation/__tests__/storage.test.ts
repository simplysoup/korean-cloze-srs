import {
  accountDocumentKey, copyAccountSnapshot, isAccountSnapshot,
  isValidServerAccountId, legacyHasPositiveOwnerEvidence,
} from '../storage';
import type { SyncDocument } from '../../../lib/sync-types';

function doc(email: string, ids: string[]): SyncDocument {
  return {
    version: 1, updatedAt: '2026-01-01T00:00:00Z',
    user: { username: 'learner', email },
    reviewCards: [], reviewLogs: ids.map((id) => ({
      id, grammarPointId: 'gp-1', rating: 3, reviewedAt: '2026-01-01T00:00:00Z',
      stability: 1, difficulty: 1, elapsedDays: 1, scheduledDays: 1,
    })),
    libraryDecks: [], streak: null, settings: null, dailyLearned: {},
  };
}

describe('account namespace and conservative migration', () => {
  test('account keys cannot be guest, email or guessed malformed ID', () => {
    expect(isValidServerAccountId('u_verified_12')).toBe(true);
    expect(accountDocumentKey('u_verified_12')).toBe('state-v2:u_verified_12');
    for (const id of ['local', 'guest', '', '../user', 'a@example.com', 'a:b']) {
      expect(isValidServerAccountId(id)).toBe(false);
      expect(() => accountDocumentKey(id)).toThrow();
    }
  });

  test('owner mismatch always rejects a scoped snapshot', () => {
    const value = {
      ownerId: 'A', doc: doc('a@example.com', []),
      lastSyncedVersion: 2, lastSyncedAt: null, syncDirty: false,
    };
    expect(isAccountSnapshot(value, 'A')).toBe(true);
    expect(isAccountSnapshot(value, 'B')).toBe(false);
    expect(isAccountSnapshot({ ...value, ownerId: undefined }, 'A')).toBe(false);
  });

  test('persist capture never aliases mutable grammar rows or metadata', () => {
    const original = {
      ownerId: 'A', doc: doc('a@example.com', ['log-a']),
      lastSyncedVersion: 1, lastSyncedAt: null, syncDirty: true,
    };
    const copy = copyAccountSnapshot(original);
    original.doc.reviewLogs[0].id = 'changed';
    original.doc.reviewCards.push({} as never);
    expect(copy.doc.reviewLogs[0].id).toBe('log-a');
    expect(copy.doc.reviewCards).toHaveLength(0);
  });

  test('a matching email is not enough to claim the unscoped cache', () => {
    const legacy = {
      doc: doc('a@example.com', ['A-only-log']),
      lastSyncedVersion: 2, lastSyncedAt: null, syncDirty: true,
    };
    expect(legacyHasPositiveOwnerEvidence(legacy, doc('a@example.com', ['B-only-log']), 'a@example.com')).toBe(false);
    expect(legacyHasPositiveOwnerEvidence(legacy, doc('b@example.com', ['A-only-log']), 'a@example.com')).toBe(false);
    expect(legacyHasPositiveOwnerEvidence(legacy, doc('a@example.com', []), 'a@example.com')).toBe(false);
    expect(legacyHasPositiveOwnerEvidence(null, doc('a@example.com', ['A-only-log']), 'a@example.com')).toBe(false);
  });

  test('positive owner evidence requires an immutable shared server review-log ID', () => {
    const legacy = {
      doc: doc('a@example.com', ['same-random-log', 'offline-unsynced']),
      lastSyncedVersion: 2, lastSyncedAt: null, syncDirty: true,
    };
    expect(legacyHasPositiveOwnerEvidence(
      legacy, doc('a@example.com', ['same-random-log']), 'a@example.com',
    )).toBe(true);
  });
});
