// Web store tests — the in-memory document + IndexedDB/server store that
// replaced SQLite on web. Covers the merge rules (never lose a review),
// settings clamping, the due queue, and the learn -> review round trip.
//
// The store runs in jsdom: localStorage is real, IndexedDB is absent
// (initStore treats that as "no cache" and carries on), and there is no
// session token, so no network is attempted.

// Jest runs in a node environment (jest-expo preset), so localStorage
// does not exist. Provide a minimal in-memory one; the store reads it
// through the global, so the mock must be installed before initStore().
const store = new Map<string, string>();
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => {
    store.set(k, v);
  },
  removeItem: (k: string) => {
    store.delete(k);
  },
  clear: () => store.clear(),
};

import { CONTENT_POINTS, getContentCards } from '../src/store/content';
import { getState, initStore, mergeServerDoc } from '../src/store/state';
import {
  dayBoundary4am,
  getCycledQueueItem,
  getDashboardStats,
  getDueQueue,
  getNextReviewAt,
  getUserSettings,
} from '../src/store/queries';
import { completeLearnSession, submitReview } from '../src/store/mutations';
import type { SyncDocument } from '../src/lib/sync-types';

const gpId = CONTENT_POINTS[0].gp.id;

function emptyDoc(): SyncDocument {
  return {
    version: 0,
    updatedAt: new Date().toISOString(),
    user: { username: '', email: '' },
    reviewCards: [],
    reviewLogs: [],
    libraryDecks: [],
    streak: null,
    settings: null,
    dailyLearned: {},
  };
}

function card(over: Partial<SyncDocument['reviewCards'][number]> = {}) {
  return {
    grammarPointId: gpId,
    stability: 1,
    difficulty: 5,
    reps: 1,
    lapses: 0,
    state: 1,
    due: new Date(Date.now() - 60_000).toISOString(),
    lastReview: new Date(Date.now() - 86_400_000).toISOString(),
    streakCorrect: 1,
    masteredAt: null,
    peakStability: 1,
    lastClozeCardId: null,
    ...over,
  };
}

beforeEach(async () => {
  localStorage.clear();
  await initStore();
  const s = getState();
  s.doc = emptyDoc();
  // The first content point is in the first deck; put that deck in the
  // library so the queue/stats see it.
  s.doc.libraryDecks = [{ deckId: CONTENT_POINTS[0].deckId, addedAt: new Date().toISOString() }];
});

describe('getUserSettings clamping', () => {
  it('clamps dailyNewLimit to 1-10 and caps batchSize at it', () => {
    getState().doc.settings = { dailyNewLimit: 99, batchSize: 50 };
    const s = getUserSettings();
    expect(s.dailyNewLimit).toBe(10);
    expect(s.batchSize).toBe(10);
  });

  it('keeps maxReviewsPerDay null, clamps a number to 5-100', () => {
    getState().doc.settings = { maxReviewsPerDay: null };
    expect(getUserSettings().maxReviewsPerDay).toBeNull();
    getState().doc.settings = { maxReviewsPerDay: 3 };
    expect(getUserSettings().maxReviewsPerDay).toBe(5);
    getState().doc.settings = { maxReviewsPerDay: 500 };
    expect(getUserSettings().maxReviewsPerDay).toBe(100);
  });
});

describe('getDueQueue', () => {
  it('returns a due, unmastered card in the library', () => {
    getState().doc.reviewCards = [card()];
    const q = getDueQueue();
    expect(q).toHaveLength(1);
    expect(q[0].grammarPointId).toBe(gpId);
    expect(q[0].reviewCardId).toContain(gpId);
  });

  it('excludes mastered and not-yet-due cards', () => {
    getState().doc.reviewCards = [
      card({ masteredAt: new Date().toISOString() }),
      card({ grammarPointId: CONTENT_POINTS[1].gp.id, due: new Date(Date.now() + 86_400_000).toISOString() }),
    ];
    expect(getDueQueue()).toHaveLength(0);
  });
});

describe('learn -> review round trip', () => {
  it('completeLearnSession creates a card and submitReview advances it', () => {
    const quiz = completeLearnSession([gpId]);
    expect(quiz).toHaveLength(1);
    expect(getState().doc.reviewCards).toHaveLength(1);
    expect(getState().doc.dailyLearned).toEqual(
      expect.objectContaining({ [new Date().toISOString().slice(0, 10)]: 1 }),
    );
    const before = getState().doc.reviewCards[0];
    const beforeDue = before.due;
    const { nextDue, state } = submitReview(`rc_local_${gpId}`, 3);
    expect(state).toBeGreaterThanOrEqual(0);
    expect(new Date(nextDue).getTime()).toBeGreaterThan(new Date(beforeDue).getTime());
    expect(getState().doc.reviewCards[0].reps).toBe(1);
    expect(getState().doc.reviewLogs).toHaveLength(1);
    expect(getState().doc.reviewLogs[0].grammarPointId).toBe(gpId);
  });
});

describe('mergeServerDoc', () => {
  it('the later lastReview wins, and logs union without duplicates', () => {
    const local = getState().doc;
    local.reviewCards = [card({ lastReview: '2026-11-08T20:00:00.000Z', reps: 3 })];
    local.reviewLogs = [{ id: 'rl_1', grammarPointId: gpId, rating: 3, reviewedAt: '2026-11-08T20:00:00.000Z', stability: 1, difficulty: 5, elapsedDays: 0, scheduledDays: 1 }];
    const server = emptyDoc();
    server.reviewCards = [card({ lastReview: '2026-11-09T20:00:00.000Z', reps: 5 })];
    server.reviewLogs = [
      { id: 'rl_1', grammarPointId: gpId, rating: 3, reviewedAt: '2026-11-08T20:00:00.000Z', stability: 1, difficulty: 5, elapsedDays: 0, scheduledDays: 1 },
      { id: 'rl_2', grammarPointId: gpId, rating: 1, reviewedAt: '2026-11-09T20:00:00.000Z', stability: 0.5, difficulty: 6, elapsedDays: 1, scheduledDays: 1 },
    ];
    expect(mergeServerDoc(server)).toBe(true);
    expect(local.reviewCards[0].reps).toBe(5);
    expect(local.reviewLogs).toHaveLength(2);
  });

  it('streaks and daily-learned take the max', () => {
    const local = getState().doc;
    local.streak = { currentStreak: 4, longestStreak: 9, lastStudiedDate: '2026-11-08' };
    local.dailyLearned = { '2026-11-08': 5 };
    const server = emptyDoc();
    server.streak = { currentStreak: 2, longestStreak: 12, lastStudiedDate: '2026-11-09' };
    server.dailyLearned = { '2026-11-08': 2, '2026-11-09': 3 };
    mergeServerDoc(server);
    expect(local.streak).toEqual({ currentStreak: 4, longestStreak: 12, lastStudiedDate: '2026-11-09' });
    expect(local.dailyLearned).toEqual({ '2026-11-08': 5, '2026-11-09': 3 });
  });
});

describe('getDashboardStats', () => {
  it('counts learned and due points from the doc', () => {
    getState().doc.reviewCards = [card()];
    const stats = getDashboardStats();
    expect(stats.totalGrammarPoints).toBe(CONTENT_POINTS.length);
    expect(stats.learnedCount).toBe(1);
    expect(stats.dueCount).toBe(1);
    expect(stats.learnedToday).toBe(0);
  });
});

describe('4am day gate', () => {
  const boundary = () => dayBoundary4am();
  const iso = (d: Date) => d.toISOString();
  const hour = 3600_000;

  it('a card answered correctly since 4am is done until tomorrow', () => {
    const b = boundary();
    getState().doc.reviewCards = [card()];
    getState().doc.reviewLogs = [
      { id: 'rl_1', grammarPointId: gpId, rating: 3, reviewedAt: iso(new Date(b.getTime() + hour)), stability: 2, difficulty: 5, elapsedDays: 1, scheduledDays: 2 },
    ];
    expect(getDueQueue()).toHaveLength(0);
    expect(getDashboardStats().dueCount).toBe(0);
  });

  it('a card answered correctly before 4am is due again today', () => {
    const b = boundary();
    getState().doc.reviewCards = [card()];
    getState().doc.reviewLogs = [
      { id: 'rl_1', grammarPointId: gpId, rating: 3, reviewedAt: iso(new Date(b.getTime() - hour)), stability: 2, difficulty: 5, elapsedDays: 1, scheduledDays: 2 },
    ];
    expect(getDueQueue()).toHaveLength(1);
  });

  it('a card answered wrong today is still due (it must be gotten right)', () => {
    const b = boundary();
    getState().doc.reviewCards = [card()];
    getState().doc.reviewLogs = [
      { id: 'rl_1', grammarPointId: gpId, rating: 1, reviewedAt: iso(new Date(b.getTime() + hour)), stability: 0.5, difficulty: 6, elapsedDays: 0, scheduledDays: 0 },
    ];
    expect(getDueQueue()).toHaveLength(1);
  });

  it('a point learned today goes straight into today’s reviews', () => {
    // New card, never reviewed, due = its creation time (today). It is
    // NOT gated: the Learn + quiz was the first exposure, and the review
    // queue is the second review on day 1.
    getState().doc.reviewCards = [card({ state: 0, reps: 0, lastReview: null, due: new Date().toISOString() })];
    expect(getDueQueue()).toHaveLength(1);
  });

  it('a point learned before today 4am is due (its first review)', () => {
    const b = boundary();
    getState().doc.reviewCards = [
      card({ state: 0, reps: 0, lastReview: null, due: iso(new Date(b.getTime() - hour)) }),
    ];
    expect(getDueQueue()).toHaveLength(1);
  });

  it('getNextReviewAt for a gated card is tomorrow 4am, not its 10-minute due', () => {
    const b = boundary();
    const tomorrow4am = new Date(b.getTime() + 24 * hour);
    getState().doc.reviewCards = [
      card({ due: iso(new Date(Date.now() + 10 * 60_000)) }),
    ];
    getState().doc.reviewLogs = [
      { id: 'rl_1', grammarPointId: gpId, rating: 3, reviewedAt: iso(new Date(b.getTime() + hour)), stability: 2, difficulty: 5, elapsedDays: 1, scheduledDays: 2 },
    ];
    const next = getNextReviewAt();
    expect(next).toBe(tomorrow4am.toISOString());
  });

  it('dayBoundary4am is 4am today, or yesterday 4am before 4am', () => {
    const at = (h: number) => {
      const d = new Date();
      d.setHours(h, 0, 0, 0);
      return d;
    };
    expect(dayBoundary4am(at(13)).getHours()).toBe(4);
    expect(dayBoundary4am(at(13)).getDate()).toBe(at(13).getDate());
    const before = dayBoundary4am(at(2));
    expect(before.getHours()).toBe(4);
    expect(before.getDate()).toBe(at(2).getDate() - 1 === 0 ? new Date(at(2).getFullYear(), at(2).getMonth(), 0).getDate() : at(2).getDate() - 1);
  });
});

describe('getCycledQueueItem', () => {
  it('returns a different sentence for the same grammar point', () => {
    // Find a point with at least two cloze cards.
    const point = CONTENT_POINTS.find((p) => getContentCards(p.gp.id).length >= 2);
    expect(point).toBeDefined();
    const gp = point!.gp.id;
    const cards = getContentCards(gp);
    getState().doc.reviewCards = [card({ grammarPointId: gp })];
    const cycled = getCycledQueueItem(gp, cards[0].id);
    expect(cycled).not.toBeNull();
    expect(cycled!.grammarPointId).toBe(gp);
    expect(cycled!.clozeCardId).not.toBe(cards[0].id);
    expect(cards.map((c) => c.id)).toContain(cycled!.clozeCardId);
  });

  it('reuses the only card when the point has just one', () => {
    const point = CONTENT_POINTS.find((p) => getContentCards(p.gp.id).length === 1);
    if (!point) return; // every point has 2+ cards; skip if none has exactly one
    const gp = point.gp.id;
    const only = getContentCards(gp)[0];
    getState().doc.reviewCards = [card({ grammarPointId: gp })];
    const cycled = getCycledQueueItem(gp, only.id);
    expect(cycled).not.toBeNull();
    expect(cycled!.clozeCardId).toBe(only.id);
  });
});
