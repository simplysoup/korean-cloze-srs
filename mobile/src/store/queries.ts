// Read (query) functions for the web store — ported from db/index.ts.
//
// The web store keeps progress in an in-memory SyncDocument (state.ts)
// and reads static content from the JSON bundles (content.ts). No SQLite,
// no OPFS: every query here is a plain object/array access, so the app
// never blocks on a database opening.
//
// Return shapes match the DB versions exactly, so the screens can switch
// to these without changes. Content fields the DB stored as JSON strings
// (englishHint, alternateAnswers, tags, notes) are already parsed in the
// bundles — they are used as-is, never JSON.parse'd.
//
// The userDeckProgress table is not read by any of these queries (the DB
// comments say "no per-deck progress tracking") and is not ported.

import { checkAnswers, correctAnswersForCard, stageForCard } from '../lib/srs';
import { orderLibraryPoints } from '../lib/library';
import { calculateLevel } from '../lib/levels';
import {
  CONTENT_POINTS,
  DECKS,
  getContentCards,
  getContentExamples,
  getContentPoint,
  getContentTarget,
} from './content';
import { currentUid, getState } from './state';
import {
  DEFAULT_USER_SETTINGS,
  type CramCounts,
  type CramLessonRow,
  type CramSetKind,
  type DashboardStats,
  type DeckInfo,
  type GrammarListItem,
  type LearnSession,
  type ReviewQueueItem,
  type UserSettings,
} from './types';

export { checkAnswers, correctAnswersForCard } from '../lib/srs';

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.min(max, Math.max(min, n));
}

/** ISO date strings sort lexicographically in chronological order. */
function byDueAsc(a: { due: string }, b: { due: string }): number {
  return a.due < b.due ? -1 : a.due > b.due ? 1 : 0;
}

/**
 * One review-queue item for a grammar point: the most-advanced cloze card
 * (highest introducedAtPosition), with its grammar target and answers.
 * Returns null when the point has no content (the DB versions skip it).
 * Shared by getDueQueue (real SRS fields) and getCramQueue (zeroed fields).
 */
function buildQueueItem(
  grammarPointId: string,
  reviewCardId: string,
  streakCorrect: number,
  masteredAt: string | null,
  fsrsState: number,
  stability: number,
): ReviewQueueItem | null {
  const point = getContentPoint(grammarPointId);
  if (!point) return null;
  const cards = [...getContentCards(grammarPointId)].sort(
    (a, b) => b.introducedAtPosition - a.introducedAtPosition,
  );
  if (cards.length === 0) return null;
  const card = cards[0];
  const target = getContentTarget(card.id, grammarPointId);
  const gp = point.gp;
  return {
    reviewCardId,
    clozeCardId: card.id,
    grammarPointId: gp.id,
    fullSentence: card.fullSentence,
    sentenceWithBlank: card.sentenceWithBlank,
    vocabBaseForm: card.vocabBaseForm,
    answers: correctAnswersForCard(
      { answer: card.answer, alternateAnswers: card.alternateAnswers },
      target?.wordReplacement,
    ),
    wordReplacement: target?.wordReplacement ?? card.answer,
    englishHint: card.englishHint,
    grammar: { title: gp.title, category: gp.category, tense: gp.tense, register: gp.register, hint: gp.hint, description: gp.description },
    streakCorrect,
    masteredAt,
    fsrsState,
    stability,
  };
}

export function getDueQueue(limit = 10): ReviewQueueItem[] {
  const settings = getUserSettings();
  // Vacation mode pauses reviews entirely.
  if (settings.vacationMode) return [];
  // Max reviews per day caps the queue by what is left of today's allowance.
  let effectiveLimit = limit;
  if (settings.maxReviewsPerDay != null) {
    const today = new Date().toISOString().slice(0, 10);
    const reviewedToday = getState().doc.reviewLogs.filter(
      (l) => l.reviewedAt.slice(0, 10) === today,
    ).length;
    effectiveLimit = Math.min(limit, Math.max(0, settings.maxReviewsPerDay - reviewedToday));
  }
  if (effectiveLimit <= 0) return [];
  const nowIso = new Date().toISOString();
  // Only points in library decks are reviewable: a deck removed from
  // the library pauses its reviews (its progress is kept). The limit
  // applies after the library filter, so a removed deck can't starve
  // the queue.
  const libraryGpIds = new Set(getLibraryGrammarPointIds());
  const due = getState()
    .doc.reviewCards.filter(
      (rc) => rc.due <= nowIso && !rc.masteredAt && libraryGpIds.has(rc.grammarPointId),
    )
    .sort(byDueAsc)
    .slice(0, effectiveLimit);

  const queue: ReviewQueueItem[] = [];
  for (const rc of due) {
    const item = buildQueueItem(
      rc.grammarPointId,
      `rc_${currentUid()}_${rc.grammarPointId}`,
      rc.streakCorrect,
      rc.masteredAt,
      rc.state,
      rc.stability,
    );
    if (item) queue.push(item);
  }
  return queue;
}

export function getNextReviewAt(): string | null {
  const libraryGpIds = new Set(getLibraryGrammarPointIds());
  const cards = [...getState().doc.reviewCards].sort(byDueAsc);
  return cards.find((c) => libraryGpIds.has(c.grammarPointId))?.due ?? null;
}

export function getDashboardStats(): DashboardStats {
  const doc = getState().doc;
  const nowIso = new Date().toISOString();
  const allCards = doc.reviewCards;
  const logs = doc.reviewLogs;
  const settings = getUserSettings();
  const today = nowIso.slice(0, 10);
  const reviewedToday = logs.filter((l) => l.reviewedAt.slice(0, 10) === today).length;
  // The due count is what the user can actually review: only points in
  // library decks count (a deck removed from the library pauses its
  // reviews), 0 on vacation, capped by the daily max otherwise.
  const libraryGpIds = new Set(getLibraryGrammarPointIds());
  const rawDueCount = allCards.filter(
    (c) => c.due <= nowIso && !c.masteredAt && libraryGpIds.has(c.grammarPointId),
  ).length;
  const dueCount = settings.vacationMode
    ? 0
    : settings.maxReviewsPerDay != null
      ? Math.min(rawDueCount, Math.max(0, settings.maxReviewsPerDay - reviewedToday))
      : rawDueCount;
  const totalReviews = logs.length;
  const levelInfo = calculateLevel(totalReviews);
  const streak = doc.streak;
  const dist = { new: 0, learning: 0, review: 0, relearning: 0, mastered: 0 };
  for (const c of allCards) {
    if (c.masteredAt) dist.mastered += 1;
    else if (c.state === 0) dist.new += 1;
    else if (c.state === 1) dist.learning += 1;
    else if (c.state === 2) dist.review += 1;
    else dist.relearning += 1;
  }
  // Last 7 days of review history, oldest → newest.
  const history: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = d.toISOString().slice(0, 10);
    history.push({ date: day, count: logs.filter((l) => l.reviewedAt.slice(0, 10) === day).length });
  }
  // Stats bar: distinct days studied + accuracy of the most recent session.
  const daysStudied = new Set(logs.map((l) => l.reviewedAt.slice(0, 10))).size;
  const sessionDates = [...new Set(logs.map((l) => l.reviewedAt.slice(0, 10)))].sort().reverse();
  const lastDate = sessionDates[0];
  let lastSessionAccuracy: number | null = null;
  if (lastDate) {
    const sessionLogs = logs.filter((l) => l.reviewedAt.slice(0, 10) === lastDate);
    const correct = sessionLogs.filter((l) => l.rating >= 3).length;
    lastSessionAccuracy =
      sessionLogs.length > 0 ? Math.round((correct / sessionLogs.length) * 100) : null;
  }
  // Bunpro-style SRS stages (from FSRS stability) + ghosts (lapses).
  const stageCounts = { beginner: 0, adept: 0, seasoned: 0, expert: 0, master: 0, selfStudy: 0, ghost: 0 };
  for (const c of allCards) {
    const stage = stageForCard(c.state, c.stability, c.masteredAt !== null);
    stageCounts[stage] += 1;
    if (c.lapses > 0 && !c.masteredAt) stageCounts.ghost += 1;
  }
  const totalGrammarPoints = CONTENT_POINTS.length;
  // Per-level progress: learned = grammar point has a review card. Each
  // TOPIK level is its own deck, so progress is grouped by deck — a new
  // level is just a new deck with its grammar points.
  const learnedIds = new Set(allCards.map((c) => c.grammarPointId));
  const levelProgress = DECKS.map((deck) => {
    const points = CONTENT_POINTS.filter((p) => p.deckId === deck.id);
    const lessons = new Map<number, { lessonTitle: string; total: number; learned: number }>();
    let learned = 0;
    for (const point of points) {
      const entry = lessons.get(point.lessonNumber) ?? {
        lessonTitle: point.lessonTitle,
        total: 0,
        learned: 0,
      };
      entry.total += 1;
      if (learnedIds.has(point.gp.id)) {
        entry.learned += 1;
        learned += 1;
      }
      lessons.set(point.lessonNumber, entry);
    }
    const lessonRows = [...lessons.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([lessonNumber, entry]) => ({ lessonNumber, ...entry }));
    return {
      deckId: deck.id,
      level: deck.topikLevel,
      title: deck.title,
      learned,
      total: points.length,
      lessons: lessonRows,
    };
  });
  return {
    dueCount, totalReviews,
    level: levelInfo.level, currentXP: levelInfo.currentXP, xpForNextLevel: levelInfo.xpForNextLevel,
    progress: levelInfo.progress, totalXP: levelInfo.totalXP,
    currentStreak: streak?.currentStreak ?? 0, longestStreak: streak?.longestStreak ?? 0,
    srsDistribution: dist, history,
    learnedCount: allCards.length, totalGrammarPoints,
    newCount: Math.max(0, totalGrammarPoints - allCards.length),
    nextReviewAt: getNextReviewAt(),
    learnedToday: getLearnedToday(), dailyLearnLimit: settings.dailyNewLimit,
    libraryCount: getLibraryDeckIds().length,
    levelProgress,
    vacationMode: settings.vacationMode,
    daysStudied,
    lastSessionAccuracy,
    stageCounts,
  };
}

export function getGrammarList(): GrammarListItem[] {
  const reviewByGp = new Map(
    getState().doc.reviewCards.map((rc) => [rc.grammarPointId, rc] as const),
  );
  return CONTENT_POINTS.map((point) => {
    const rc = reviewByGp.get(point.gp.id);
    return {
      id: point.gp.id, title: point.gp.title, hint: point.gp.hint, category: point.gp.category,
      lessonNumber: point.lessonNumber, lessonTitle: point.lessonTitle, position: point.position,
      status: rc ? (rc.masteredAt ? 'mastered' : 'learning') : 'new',
      streakCorrect: rc?.streakCorrect ?? 0,
      deckId: point.deckId, deckTitle: point.deckTitle, topikLevel: point.topikLevel,
    };
  });
}

export function getGrammarDetail(id: string) {
  const point = getContentPoint(id);
  if (!point) return null;
  const gp = point.gp;
  const reviewCard = getState().doc.reviewCards.find((c) => c.grammarPointId === id);
  return {
    id: gp.id, title: gp.title, category: gp.category, tense: gp.tense, register: gp.register,
    hint: gp.hint, description: gp.description, level: gp.level,
    tags: gp.tags,
    structurePattern: gp.structurePattern,
    notes: gp.notes,
    relatedPointIds: gp.relatedPointIds ?? [],
    lessonNumber: point.lessonNumber, position: point.position,
    cards: getContentCards(id),
    examples: getContentExamples(id),
    reviewCard: reviewCard
      ? {
          ...reviewCard,
          id: `rc_${currentUid()}_${id}`,
          userId: currentUid(),
        }
      : null,
  };
}

// ── Learn flow ───────────────────────────────────────────────────────────────

/** Points learned today via Learn sessions ("I already know this" does not count). */
export function getLearnedToday(): number {
  const today = new Date().toISOString().slice(0, 10);
  return getState().doc.dailyLearned[today] ?? 0;
}

/** The deck catalogue (TOPIK 1–6 + Non-TOPIK) with per-user progress
 * and library membership. */
export function getDecks(): DeckInfo[] {
  const nowIso = new Date().toISOString();
  const cards = getState().doc.reviewCards;
  const gpToDeck = new Map(CONTENT_POINTS.map((p) => [p.gp.id, p.deckId] as const));
  const libraryIds = new Set(getLibraryDeckIds());
  return DECKS.map((deck) => {
    const deckGps = CONTENT_POINTS.filter((p) => p.deckId === deck.id);
    const deckCards = cards.filter((c) => gpToDeck.get(c.grammarPointId) === deck.id);
    return {
      id: deck.id,
      title: deck.title,
      slug: deck.slug,
      description: deck.description,
      level: deck.level,
      topikLevel: deck.topikLevel,
      sortOrder: deck.sortOrder,
      totalPoints: deckGps.length,
      learnedPoints: deckCards.length,
      dueCount: deckCards.filter((c) => c.due <= nowIso && !c.masteredAt).length,
      inLibrary: libraryIds.has(deck.id),
    };
  });
}

/** The decks in the current user's library, in catalogue order. */
export function getLibraryDeckIds(): string[] {
  const order = new Map(DECKS.map((d, i) => [d.id, i] as const));
  return getState()
    .doc.libraryDecks.map((d) => d.deckId)
    .sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
}

export function isDeckInLibrary(deckId: string): boolean {
  return getState().doc.libraryDecks.some((d) => d.deckId === deckId);
}

/** The grammar points in the user's library, in dependency order
 * (deck sortOrder, then curriculum position), deduped by grammar point
 * id — a point in two library decks appears once. */
export function getLibraryGrammarPointIds(): string[] {
  const libraryIds = new Set(getLibraryDeckIds());
  if (libraryIds.size === 0) return [];
  const sortOrder = new Map(DECKS.map((d) => [d.id, d.sortOrder] as const));
  const entries = CONTENT_POINTS.filter((p) => libraryIds.has(p.deckId)).map((p) => ({
    deckSortOrder: sortOrder.get(p.deckId) ?? 0,
    position: p.position,
    grammarPointId: p.gp.id,
  }));
  return orderLibraryPoints(entries);
}

// ── Settings ───────────────────────────────────────────────────────────────

/** Per-user settings, stored as one blob in the doc. Unknown or invalid
 * values fall back to the defaults (same clamping as the DB version). */
export function getUserSettings(): UserSettings {
  const raw = getState().doc.settings;
  if (!raw) return { ...DEFAULT_USER_SETTINGS };
  const parsed = raw as Partial<UserSettings>;
  const dailyNewLimit = clampInt(parsed.dailyNewLimit, 1, 10, DEFAULT_USER_SETTINGS.dailyNewLimit);
  return {
    ...DEFAULT_USER_SETTINGS,
    ...parsed,
    dailyNewLimit,
    batchSize: Math.min(
      clampInt(parsed.batchSize, 1, 10, DEFAULT_USER_SETTINGS.batchSize),
      dailyNewLimit,
    ),
    maxReviewsPerDay:
      parsed.maxReviewsPerDay == null
        ? null
        : clampInt(parsed.maxReviewsPerDay, 5, 100, 10),
  };
}

/** The next Learn batch, pulled from all library decks in dependency
 * order (deck sortOrder, then curriculum position), deduped by grammar
 * point. "Learned" is "has a review card" — no per-deck progress
 * tracking. Daily queue: the global limit and batch size from Settings.
 * Learn only offers today's remaining quota unless the user explicitly
 * opts into self-study. Vacation mode pauses learning entirely. */
export function getLearnSession(selfStudy = false): LearnSession {
  const settings = getUserSettings();
  const dailyLimit = settings.dailyNewLimit;
  const batchSize = settings.batchSize;
  const vacation = settings.vacationMode;
  const learnedToday = getLearnedToday();
  const libraryIds = getLibraryDeckIds();
  if (libraryIds.length === 0) {
    return {
      deckComplete: false, libraryEmpty: true, totalRemaining: 0,
      grammarPoints: [], learnedToday, dailyLimit, queueDone: false, vacation,
    };
  }
  const learnedIds = new Set(getState().doc.reviewCards.map((c) => c.grammarPointId));
  const orderedIds = getLibraryGrammarPointIds().filter((id) => !learnedIds.has(id));
  const quota = vacation ? 0 : selfStudy ? batchSize : Math.max(0, dailyLimit - learnedToday);
  const batch = orderedIds.slice(0, Math.min(batchSize, quota));
  const grammarPoints = batch.map((gpId) => {
    const point = getContentPoint(gpId)!;
    const gp = point.gp;
    return {
      id: gp.id, title: gp.title, hint: gp.hint, category: gp.category, tense: gp.tense,
      register: gp.register, description: gp.description, level: gp.level,
      tags: gp.tags, structurePattern: gp.structurePattern,
      notes: gp.notes, sortOrder: point.position,
    };
  });
  return {
    deckComplete: batch.length === 0 && orderedIds.length === 0,
    libraryEmpty: false,
    totalRemaining: orderedIds.length,
    grammarPoints,
    learnedToday,
    dailyLimit,
    queueDone: batch.length === 0 && orderedIds.length > 0,
    vacation,
  };
}

export function checkQueueItem(item: ReviewQueueItem, submittedHangul: string[]): boolean {
  return checkAnswers(submittedHangul, item.answers);
}

// ── Cram ───────────────────────────────────────────────────────────────────

/** Quick-Cram sets: Masters (Master stage), Reviews (all learned, not
 * mastered), Ghosts (lapses — trouble items), Difficult (lapses ≥ 2 or
 * stability under a day). All are proxies from the FSRS card data. */
export function getCramCounts(): CramCounts {
  const libraryGpIds = new Set(getLibraryGrammarPointIds());
  const cards = getState().doc.reviewCards.filter((c) => libraryGpIds.has(c.grammarPointId));
  let masters = 0;
  let ghosts = 0;
  let difficult = 0;
  for (const c of cards) {
    if (stageForCard(c.state, c.stability, c.masteredAt !== null) === 'master') masters += 1;
    if (c.lapses > 0 && !c.masteredAt) ghosts += 1;
    if (!c.masteredAt && (c.lapses >= 2 || (c.stability < 1 && c.reps >= 1))) difficult += 1;
  }
  return {
    masters,
    reviews: cards.filter((c) => !c.masteredAt).length,
    ghosts,
    difficult,
  };
}

/** Grammar point ids in a Quick-Cram set (library decks only). */
export function getCramPointIds(kind: CramSetKind): string[] {
  const libraryGpIds = new Set(getLibraryGrammarPointIds());
  const cards = getState().doc.reviewCards.filter((c) => libraryGpIds.has(c.grammarPointId));
  return cards
    .filter((c) => {
      if (kind === 'masters') return stageForCard(c.state, c.stability, c.masteredAt !== null) === 'master';
      if (kind === 'reviews') return !c.masteredAt;
      if (kind === 'ghosts') return c.lapses > 0 && !c.masteredAt;
      return !c.masteredAt && (c.lapses >= 2 || (c.stability < 1 && c.reps >= 1));
    })
    .map((c) => c.grammarPointId);
}

/** Per-lesson learned/total for every library deck (the Custom Cram
 * table), ordered by deck then lesson. A point in two library decks is
 * counted once per deck here (per-deck progress), but the Cram queue
 * itself dedupes by grammar point id. */
export function getCramLessonRows(): CramLessonRow[] {
  const learnedIds = new Set(getState().doc.reviewCards.map((c) => c.grammarPointId));
  const libraryIds = getLibraryDeckIds();
  if (libraryIds.length === 0) return [];
  const deckById = new Map(DECKS.map((d) => [d.id, d] as const));
  const lessons = new Map<string, { deckId: string; deckTitle: string; lessonNumber: number; lessonTitle: string; total: number; learned: number }>();
  for (const point of CONTENT_POINTS) {
    if (!libraryIds.includes(point.deckId)) continue;
    const key = `${point.deckId}:${point.lessonNumber}`;
    const entry = lessons.get(key) ?? {
      deckId: point.deckId,
      deckTitle: deckById.get(point.deckId)?.title ?? point.deckId,
      lessonNumber: point.lessonNumber,
      lessonTitle: point.lessonTitle,
      total: 0,
      learned: 0,
    };
    entry.total += 1;
    if (learnedIds.has(point.gp.id)) entry.learned += 1;
    lessons.set(key, entry);
  }
  const deckOrder = new Map(libraryIds.map((id, i) => [id, i] as const));
  return [...lessons.values()].sort(
    (a, b) => (deckOrder.get(a.deckId) ?? 0) - (deckOrder.get(b.deckId) ?? 0) || a.lessonNumber - b.lessonNumber,
  );
}

/** Grammar point ids learned in a lesson of a deck (for Custom Cram). */
export function getCramPointIdsForLesson(deckId: string, lessonNumber: number): string[] {
  const learnedIds = new Set(getState().doc.reviewCards.map((c) => c.grammarPointId));
  return CONTENT_POINTS.filter(
    (p) => p.deckId === deckId && p.lessonNumber === lessonNumber,
  )
    .map((p) => p.gp.id)
    .filter((id) => learnedIds.has(id));
}

/** A Cram queue: one cloze card per grammar point (the most-advanced card,
 * as in Reviews), shuffled, up to `limit`. The items reuse the review
 * queue shape so the quiz UI is shared — but a Cram session never calls
 * submitReview, so nothing here touches SRS state. */
export function getCramQueue(grammarPointIds: string[], limit: number): ReviewQueueItem[] {
  const ids = [...grammarPointIds].sort(() => Math.random() - 0.5).slice(0, limit);
  const queue: ReviewQueueItem[] = [];
  for (const gpId of ids) {
    const item = buildQueueItem(gpId, `cram_${gpId}`, 0, null, 0, 0);
    if (item) queue.push(item);
  }
  return queue;
}
