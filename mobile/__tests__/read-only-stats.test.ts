// Read-only stats: computed from a SyncDocument + content bundles, with
// no DB access. The DB-backed equivalents live in db/index.ts; these
// tests pin the read-only copies to the same outcomes on a small doc.
import {
  computeReadOnlyStats,
  readOnlyDueQueue,
  readOnlyGrammarList,
} from '../src/lib/read-only-stats';
import type { SyncDocument } from '../src/lib/sync-types';

const GP_ID = 'gp_ieyo_yeyo';
const DECK_ID = 'deck_topik1_level1';

function doc(overrides: Partial<SyncDocument> = {}): SyncDocument {
  return {
    version: 3,
    updatedAt: new Date().toISOString(),
    user: { username: 'learner', email: 'a@example.com' },
    reviewCards: [
      {
        grammarPointId: GP_ID,
        stability: 0.5,
        difficulty: 5,
        reps: 1,
        lapses: 0,
        state: 1,
        due: new Date(Date.now() - 60_000).toISOString(),
        lastReview: new Date().toISOString(),
        streakCorrect: 1,
        masteredAt: null,
        peakStability: 0.5,
        lastClozeCardId: null,
      },
    ],
    reviewLogs: [
      {
        id: 'log1',
        grammarPointId: GP_ID,
        rating: 4,
        reviewedAt: new Date().toISOString(),
        stability: 0.5,
        difficulty: 5,
        elapsedDays: 0,
        scheduledDays: 1,
      },
    ],
    libraryDecks: [{ deckId: DECK_ID, addedAt: new Date().toISOString() }],
    streak: { currentStreak: 2, longestStreak: 5, lastStudiedDate: new Date().toISOString().slice(0, 10) },
    settings: null,
    dailyLearned: {},
    ...overrides,
  };
}

describe('computeReadOnlyStats', () => {
  it('counts the due card, learned point, and streak from the document', () => {
    const stats = computeReadOnlyStats(doc());
    expect(stats.dueCount).toBe(1);
    expect(stats.learnedCount).toBe(1);
    expect(stats.totalGrammarPoints).toBe(102);
    expect(stats.currentStreak).toBe(2);
    expect(stats.longestStreak).toBe(5);
    expect(stats.totalReviews).toBe(1);
    expect(stats.libraryCount).toBe(1);
    expect(stats.stageCounts.beginner).toBe(1);
  });

  it('reports zero due on vacation and in an empty library', () => {
    expect(computeReadOnlyStats(doc({ settings: { vacationMode: true } })).dueCount).toBe(0);
    expect(computeReadOnlyStats(doc({ libraryDecks: [] })).dueCount).toBe(0);
  });
});

describe('readOnlyDueQueue', () => {
  it('lists the due card with its grammar point title', () => {
    const queue = readOnlyDueQueue(doc());
    expect(queue).toHaveLength(1);
    expect(queue[0].title).toBe('이에요/예요');
  });

  it('is empty on vacation', () => {
    expect(readOnlyDueQueue(doc({ settings: { vacationMode: true } }))).toHaveLength(0);
  });
});

describe('readOnlyGrammarList', () => {
  it('marks the carded point learning and the rest new', () => {
    const list = readOnlyGrammarList(doc());
    expect(list).toHaveLength(102);
    const learned = list.find((item) => item.id === GP_ID);
    expect(learned?.status).toBe('learning');
    expect(list.filter((item) => item.status === 'new')).toHaveLength(101);
  });
});
