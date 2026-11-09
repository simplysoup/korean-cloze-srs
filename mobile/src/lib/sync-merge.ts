// Pure merge-decision helpers for the sync protocol. No DB, no I/O —
// unit-testable in Jest. The DB apply in db/index.ts uses these so the
// "which side wins" decision is in one place, not buried in SQL.
//
// The merge never loses a review: review cards keep the later lastReview
// (tie → higher reps), logs and library decks are unions (by id), streaks
// take the max, daily counts take the max. Settings are the one
// last-write-wins case (see applySyncSnapshot).

import type { SyncReviewCard, SyncStreak } from './sync-types';

/** True when the server's review card is the more recent state and
 * should replace the local one. ISO strings compare chronologically;
 * null (never reviewed) sorts before any date. */
export function serverCardWins(
  local: Pick<SyncReviewCard, 'lastReview' | 'reps'>,
  server: Pick<SyncReviewCard, 'lastReview' | 'reps'>,
): boolean {
  if ((server.lastReview ?? '') > (local.lastReview ?? '')) return true;
  if (server.lastReview === local.lastReview && server.reps > local.reps) return true;
  return false;
}

/** Merge two streak rows: max of each count, later last-studied date. */
export function mergeStreaks(local: SyncStreak, server: SyncStreak): SyncStreak {
  return {
    currentStreak: Math.max(local.currentStreak, server.currentStreak),
    longestStreak: Math.max(local.longestStreak, server.longestStreak),
    lastStudiedDate:
      (server.lastStudiedDate ?? '') > (local.lastStudiedDate ?? '')
        ? server.lastStudiedDate
        : local.lastStudiedDate,
  };
}

/** Merge two daily-learned maps: max count per date. */
export function mergeDailyLearned(
  local: Record<string, number>,
  server: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = { ...local };
  for (const [date, count] of Object.entries(server)) {
    out[date] = Math.max(out[date] ?? 0, count);
  }
  return out;
}
