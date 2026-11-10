// Write (mutation) functions for the web store — ports of the write
// functions in db/index.ts, with the same exported names, signatures, and
// return shapes. The in-memory SyncDocument IS the store: mutations edit
// state.doc directly, then call markDirty() once at the end (it persists
// to IndexedDB debounced and refreshes doc.updatedAt). No SQL, no
// drizzle, no expo-sqlite — the web bundle never imports the DB module.

import { CONTENT_POINTS, DECKS, getContentCards, getContentPoint } from './content';
import { getUserSettings } from './queries';
import { currentUid, getState, markDirty, mergeServerDoc } from './state';
import { computeFsrsReview, newFsrsState, type Grade } from '../lib/srs';
import type { SyncDocument, SyncReviewCard } from '../lib/sync-types';
import type { UserSettings } from './types';

// Re-export the DB module's sync bookkeeping surface, so the store barrel
// can offer the full surface the screens used to get from db/index.ts.
export {
  clearSyncDirty,
  getLastSyncedAt,
  getLastSyncedVersion,
  getSyncSnapshot,
  isSyncDirty,
  markSyncDirty,
  setLastSyncedAt,
  setLastSyncedVersion,
} from './state';

// ── Learn ──────────────────────────────────────────────────────────────────

/** One Learn session: create FSRS cards for the points (onConflictDoNothing
 * — only genuinely new cards count toward newlyLearned) and build one quiz
 * card per point from its first/intro cloze card (lowest
 * introducedAtPosition), matching Bunpro's one-card-per-new-point review
 * stage. Points with no cards (or not in the content) get a review card
 * but no quiz card, exactly as the DB version did. */
export function completeLearnSession(grammarPointIds: string[]) {
  const doc = getState().doc;
  const now = new Date();
  const quizCards: { id: string; grammarPointId: string; fullSentence: string; sentenceWithBlank: string; answer: string; alternateAnswers: string[]; englishHint: string; grammar: { title: string; category: string; tense: string | null; register: string | null; hint: string; description: string } }[] = [];
  let newlyLearned = 0;
  const existingIds = new Set(doc.reviewCards.map((c) => c.grammarPointId));
  for (const gpId of grammarPointIds) {
    if (!existingIds.has(gpId)) {
      const state = newFsrsState(now);
      doc.reviewCards.push({
        grammarPointId: gpId,
        stability: state.stability, difficulty: state.difficulty, reps: state.reps,
        lapses: state.lapses, state: state.state, due: state.due.toISOString(),
        lastReview: null, streakCorrect: 0, masteredAt: null, peakStability: 0, lastClozeCardId: null,
      });
      existingIds.add(gpId);
      // Count only genuinely new cards: a retry after a partially
      // committed attempt re-runs the inserts as conflicts, and must not
      // double-count.
      newlyLearned += 1;
    }
    const point = getContentPoint(gpId);
    if (!point) continue;
    const cards = getContentCards(gpId);
    if (cards.length === 0) continue;
    // Copy before sorting: getContentCards returns the bundle's live array.
    const sorted = [...cards].sort((a, b) => a.introducedAtPosition - b.introducedAtPosition);
    const c = sorted[0];
    const gp = point.gp;
    quizCards.push({
      id: c.id, grammarPointId: gpId, fullSentence: c.fullSentence, sentenceWithBlank: c.sentenceWithBlank,
      answer: c.answer, alternateAnswers: c.alternateAnswers,
      englishHint: c.englishHint,
      grammar: { title: gp.title, category: gp.category, tense: gp.tense, register: gp.register, hint: gp.hint, description: gp.description },
    });
  }
  // addLearnedTodayTx is a no-op for n <= 0 in the DB version.
  if (newlyLearned > 0) {
    const today = now.toISOString().slice(0, 10);
    doc.dailyLearned[today] = (doc.dailyLearned[today] ?? 0) + newlyLearned;
  }
  markDirty();
  return quizCards;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isSyncTimeout(e: unknown): boolean {
  return e instanceof Error && e.message.includes('Sync operation timeout');
}

/** completeLearnSession with retries on the worker spin-budget timeout.
 * The web store has no sync worker, so 'Sync operation timeout' cannot
 * happen here — in practice this just calls through once. The loop is
 * kept for signature compatibility with the DB version. */
export async function completeLearnSessionWithRetry(grammarPointIds: string[]) {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return completeLearnSession(grammarPointIds);
    } catch (e) {
      lastError = e;
      if (!isSyncTimeout(e) || attempt === 3) throw e;
      await sleep(500);
    }
  }
  throw lastError;
}

// ── Review submission ────────────────────────────────────────────────────────

/** Resolve a review-card id to its card. Screens pass `rc_<uid>_<gpId>`;
 * the fallback takes the suffix after the last '_' (which never resolves
 * for `cram_<gpId>` ids — Cram never submits — so those throw 'Review
 * card not found', as the DB did for an unknown id). */
function findReviewCard(reviewCardId: string): SyncReviewCard {
  const doc = getState().doc;
  const prefix = `rc_${currentUid()}_`;
  let gpId: string;
  if (reviewCardId.startsWith(prefix)) {
    gpId = reviewCardId.slice(prefix.length);
  } else {
    const idx = reviewCardId.lastIndexOf('_');
    gpId = idx >= 0 ? reviewCardId.slice(idx + 1) : reviewCardId;
  }
  const card = doc.reviewCards.find((c) => c.grammarPointId === gpId);
  if (!card) throw new Error('Review card not found');
  return card;
}

/** Port of the DB's submitReview: FSRS update + review log + streak. */
export function submitReview(reviewCardId: string, rating: Grade, clozeCardId?: string): { nextDue: string; state: number } {
  const doc = getState().doc;
  const rc = findReviewCard(reviewCardId);
  const now = new Date();
  const result = computeFsrsReview(
    {
      stability: rc.stability, difficulty: rc.difficulty, reps: rc.reps, lapses: rc.lapses,
      state: rc.state, due: new Date(rc.due), lastReview: rc.lastReview ? new Date(rc.lastReview) : null,
      streakCorrect: rc.streakCorrect, masteredAt: rc.masteredAt ? new Date(rc.masteredAt) : null,
      peakStability: rc.peakStability,
    },
    rating,
    now,
  );
  rc.stability = result.state.stability;
  rc.difficulty = result.state.difficulty;
  rc.reps = result.state.reps;
  rc.lapses = result.state.lapses;
  rc.state = result.state.state;
  rc.due = result.state.due.toISOString();
  rc.lastReview = now.toISOString();
  rc.streakCorrect = result.state.streakCorrect;
  rc.peakStability = result.state.peakStability;
  rc.masteredAt = result.state.masteredAt?.toISOString() ?? null;
  rc.lastClozeCardId = clozeCardId ?? rc.lastClozeCardId;
  doc.reviewLogs.push({
    id: `rl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`,
    grammarPointId: rc.grammarPointId, rating,
    reviewedAt: now.toISOString(), stability: result.log.stability, difficulty: result.log.difficulty,
    elapsedDays: result.log.elapsedDays, scheduledDays: result.log.scheduledDays,
  });
  updateStreak(doc, now);
  markDirty();
  return { nextDue: result.state.due.toISOString(), state: result.state.state };
}

/** Port of the DB's updateStreak, using YYYY-MM-DD dates. */
function updateStreak(doc: SyncDocument, now: Date): void {
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const existing = doc.streak;
  if (!existing) {
    doc.streak = { currentStreak: 1, longestStreak: 1, lastStudiedDate: today };
    return;
  }
  if (existing.lastStudiedDate === today) return;
  const next = existing.lastStudiedDate === yesterdayStr ? existing.currentStreak + 1 : 1;
  existing.currentStreak = next;
  existing.longestStreak = Math.max(next, existing.longestStreak);
  existing.lastStudiedDate = today;
}

// ── "I already know this" ────────────────────────────────────────────────────

/** Master a point outright (8-correct streak, due in a year). Only when
 * no card exists yet — onConflictDoNothing, as in the DB version. */
export function markPointKnown(grammarPointId: string): void {
  const doc = getState().doc;
  const now = new Date();
  if (!doc.reviewCards.some((c) => c.grammarPointId === grammarPointId)) {
    doc.reviewCards.push({
      grammarPointId,
      stability: 30,
      difficulty: 5,
      reps: 1,
      lapses: 0,
      state: 2,
      due: new Date(now.getTime() + 365 * 86_400_000).toISOString(),
      lastReview: now.toISOString(),
      streakCorrect: 8,
      masteredAt: now.toISOString(),
      peakStability: 30,
      lastClozeCardId: null,
    });
  }
  markDirty();
}

// ── Settings ─────────────────────────────────────────────────────────────────

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.min(max, Math.max(min, n));
}

export function updateUserSettings(patch: Partial<UserSettings>): void {
  const doc = getState().doc;
  const prev = getUserSettings();
  const dailyNewLimit = clampInt(
    patch.dailyNewLimit ?? prev.dailyNewLimit, 1, 10, prev.dailyNewLimit,
  );
  const next: UserSettings = {
    ...prev,
    ...patch,
    dailyNewLimit,
    batchSize: Math.min(
      clampInt(patch.batchSize ?? prev.batchSize, 1, 10, prev.batchSize),
      dailyNewLimit,
    ),
    maxReviewsPerDay:
      (patch.maxReviewsPerDay ?? prev.maxReviewsPerDay) == null
        ? null
        : clampInt(patch.maxReviewsPerDay ?? prev.maxReviewsPerDay, 5, 100, 10),
  };
  // Turning vacation mode off bridges the streak: the last studied date
  // moves to yesterday, so the gap spent on vacation doesn't reset it.
  if (prev.vacationMode && next.vacationMode === false) {
    const streak = doc.streak;
    if (streak?.lastStudiedDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      if (streak.lastStudiedDate < yesterdayStr) {
        streak.lastStudiedDate = yesterdayStr;
      }
    }
  }
  // Spread into a fresh object literal: doc.settings is
  // Record<string, unknown> | null, and an interface without an index
  // signature is not directly assignable to it.
  doc.settings = { ...next };
  markDirty();
}

// ── Library decks ────────────────────────────────────────────────────────────

/** Add a deck to the library. Only decks with content can be added. */
export function addDeckToLibrary(deckId: string): void {
  const doc = getState().doc;
  const deck = DECKS.find((d) => d.id === deckId);
  if (!deck) return;
  const hasContent = CONTENT_POINTS.some((p) => p.deckId === deckId);
  if (!hasContent) return;
  if (!doc.libraryDecks.some((d) => d.deckId === deckId)) {
    doc.libraryDecks.push({ deckId, addedAt: new Date().toISOString() });
  }
  markDirty();
}

export function removeDeckFromLibrary(deckId: string): void {
  const doc = getState().doc;
  const idx = doc.libraryDecks.findIndex((d) => d.deckId === deckId);
  if (idx >= 0) doc.libraryDecks.splice(idx, 1);
  markDirty();
}

// ── Sync ─────────────────────────────────────────────────────────────────────

/** The web sync layer calls mergeServerDoc directly; this export exists
 * for callers of the old DB surface. Returns whether anything changed. */
export function applySyncSnapshot(doc: SyncDocument): boolean {
  return mergeServerDoc(doc);
}
