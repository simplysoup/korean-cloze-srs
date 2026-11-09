// Sync document types. The document is a full snapshot of one user's
// per-user state — not an incremental log. Keys are stable,
// content-derived identifiers (grammarPointId, deckId, date), NEVER
// local random ids: a review card's local id is `rc_<userId>_<gpId>` and
// the user id differs per device, so local ids must not leak into the
// document. The receiver recomputes local ids from its own user id.
//
// See docs/planning/sync-server-accounts.md for the protocol and the
// per-table merge rules.

export interface SyncReviewCard {
  grammarPointId: string;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: number;
  due: string;
  lastReview: string | null;
  streakCorrect: number;
  masteredAt: string | null;
  peakStability: number;
  lastClozeCardId: string | null;
}

export interface SyncReviewLog {
  /** The log's own id (random, stable once created) — the dedup key. */
  id: string;
  grammarPointId: string;
  rating: number;
  reviewedAt: string;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
}

export interface SyncLibraryDeck {
  deckId: string;
  addedAt: string;
}

export interface SyncStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudiedDate: string | null;
}

export interface SyncDocument {
  /** Server-assigned version (increments on every push). */
  version: number;
  /** ISO timestamp of the last local change included in this document. */
  updatedAt: string;
  user: { username: string; email: string };
  reviewCards: SyncReviewCard[];
  reviewLogs: SyncReviewLog[];
  libraryDecks: SyncLibraryDeck[];
  streak: SyncStreak | null;
  /** The getUserSettings() blob, or null when the user never changed one. */
  settings: Record<string, unknown> | null;
  /** date (YYYY-MM-DD) -> new points learned that day. */
  dailyLearned: Record<string, number>;
}
