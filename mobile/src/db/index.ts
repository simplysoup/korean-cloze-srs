// Local SQLite database — offline-first, single local user (v1).
// Drizzle ORM over the expo-sqlite driver. No server, no auth yet.
import { openDatabaseSync } from 'expo-sqlite';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { and, asc, eq, lte } from 'drizzle-orm';
import * as schema from './schema';
import contentBundle from '../content/topik1-level1.json';
import { flattenContent, type ContentBundle } from '../content/types';
import { checkAnswers, computeFsrsReview, correctAnswersForCard, newFsrsState, type Grade } from '../lib/srs';
import { calculateLevel } from '../lib/levels';

export const LOCAL_USER_ID = 'local';
export const CONTENT_VERSION = 'topik1-level1-v1';

type Db = ExpoSQLiteDatabase<typeof schema>;

let db: Db | null = null;
let sqliteDb: ReturnType<typeof openDatabaseSync> | null = null;

export function getDb(): Db {
  if (!db) {
    sqliteDb = openDatabaseSync('korean-cloze-srs.db');
    db = drizzle(sqliteDb, { schema });
  }
  return db;
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS grammar_points (id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT NOT NULL, tense TEXT, register TEXT, hint TEXT NOT NULL, description TEXT NOT NULL, level INTEGER NOT NULL DEFAULT 1, tags TEXT NOT NULL DEFAULT '[]', structure_pattern TEXT, notes TEXT, related_point_ids TEXT NOT NULL DEFAULT '[]', lesson_number INTEGER NOT NULL, position INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS cloze_cards (id TEXT PRIMARY KEY, grammar_point_id TEXT NOT NULL, full_sentence TEXT NOT NULL, sentence_with_blank TEXT NOT NULL, vocab_base_form TEXT NOT NULL, answer TEXT NOT NULL, alternate_answers TEXT NOT NULL DEFAULT '[]', english_hint TEXT NOT NULL DEFAULT '[]', introduced_at_position INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS cloze_card_grammar_targets (id TEXT PRIMARY KEY, cloze_card_id TEXT NOT NULL, grammar_point_id TEXT NOT NULL, word_replacement TEXT NOT NULL, blank_index INTEGER NOT NULL DEFAULT 0, UNIQUE(cloze_card_id, grammar_point_id));
CREATE TABLE IF NOT EXISTS lesson_examples (id TEXT PRIMARY KEY, grammar_point_id TEXT NOT NULL, full_sentence TEXT NOT NULL, sentence_with_blank TEXT NOT NULL, answer TEXT NOT NULL, english_hint TEXT NOT NULL DEFAULT '[]', "order" INTEGER NOT NULL DEFAULT 0, notes TEXT);
CREATE TABLE IF NOT EXISTS review_cards (id TEXT PRIMARY KEY, user_id TEXT NOT NULL DEFAULT 'local', grammar_point_id TEXT NOT NULL, stability REAL NOT NULL DEFAULT 0, difficulty REAL NOT NULL DEFAULT 0, reps INTEGER NOT NULL DEFAULT 0, lapses INTEGER NOT NULL DEFAULT 0, state INTEGER NOT NULL DEFAULT 0, due TEXT NOT NULL, last_review TEXT, streak_correct INTEGER NOT NULL DEFAULT 0, mastered_at TEXT, peak_stability REAL NOT NULL DEFAULT 0, last_cloze_card_id TEXT, UNIQUE(user_id, grammar_point_id));
CREATE TABLE IF NOT EXISTS review_logs (id TEXT PRIMARY KEY, review_card_id TEXT NOT NULL, user_id TEXT NOT NULL DEFAULT 'local', rating INTEGER NOT NULL, reviewed_at TEXT NOT NULL, stability REAL NOT NULL, difficulty REAL NOT NULL, elapsed_days REAL NOT NULL, scheduled_days REAL NOT NULL);
CREATE TABLE IF NOT EXISTS decks (id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', level INTEGER NOT NULL DEFAULT 1, topik_level TEXT NOT NULL DEFAULT 'topik1-1', sort_order INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS deck_grammar_points (id TEXT PRIMARY KEY, deck_id TEXT NOT NULL, grammar_point_id TEXT NOT NULL, sort_order INTEGER NOT NULL, lesson_number INTEGER NOT NULL, UNIQUE(deck_id, grammar_point_id));
CREATE TABLE IF NOT EXISTS user_deck_progress (id TEXT PRIMARY KEY, user_id TEXT NOT NULL DEFAULT 'local', deck_id TEXT NOT NULL, last_learned_index INTEGER NOT NULL DEFAULT -1, last_studied_at TEXT, UNIQUE(user_id, deck_id));
CREATE TABLE IF NOT EXISTS user_streaks (id TEXT PRIMARY KEY, user_id TEXT NOT NULL DEFAULT 'local', current_streak INTEGER NOT NULL DEFAULT 0, longest_streak INTEGER NOT NULL DEFAULT 0, last_studied_date TEXT);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`;

/** Create tables and seed the provisional TOPIK I Level 1 content (verbatim port). Idempotent. */
export function initDb(): Db {
  const database = getDb();
  // execSync lives on the raw expo-sqlite handle, not on the Drizzle wrapper.
  sqliteDb!.execSync(CREATE_TABLES_SQL);
  const version = database
    .select()
    .from(schema.meta)
    .where(eq(schema.meta.key, 'contentVersion'))
    .get();
  if (version?.value === CONTENT_VERSION) return database;

  const bundle = contentBundle as unknown as ContentBundle;
  const { grammarPoints } = flattenContent(bundle);
  const nowIso = new Date().toISOString();

  database.insert(schema.decks).values({
    id: bundle.deck.id,
    title: bundle.deck.title,
    slug: bundle.deck.slug,
    description: 'TOPIK I Level 1 grammar — provisional content, see mobile/README.md.',
    level: bundle.deck.level,
    topikLevel: bundle.deck.topikLevel,
    sortOrder: 0,
  }).onConflictDoNothing().run();

  for (const { gp, lessonNumber, position } of grammarPoints) {
    database.insert(schema.grammarPoints).values({
      id: gp.id, title: gp.title, category: gp.category, tense: gp.tense, register: gp.register,
      hint: gp.hint, description: gp.description, level: gp.level,
      tags: JSON.stringify(gp.tags), structurePattern: gp.structurePattern,
      notes: gp.notes ? JSON.stringify(gp.notes) : null,
      relatedPointIds: JSON.stringify(gp.relatedPointIds ?? []),
      lessonNumber, position,
    }).onConflictDoNothing().run();

    database.insert(schema.deckGrammarPoints).values({
      id: `dgp_${bundle.deck.id}_${gp.id}`,
      deckId: bundle.deck.id, grammarPointId: gp.id,
      sortOrder: position - 1, lessonNumber,
    }).onConflictDoNothing().run();

    for (const card of gp.cards) {
      database.insert(schema.clozeCards).values({
        id: card.id, grammarPointId: gp.id, fullSentence: card.fullSentence,
        sentenceWithBlank: card.sentenceWithBlank, vocabBaseForm: card.vocabBaseForm,
        answer: card.answer, alternateAnswers: JSON.stringify(card.alternateAnswers),
        englishHint: JSON.stringify(card.englishHint), introducedAtPosition: card.introducedAtPosition,
      }).onConflictDoNothing().run();
      database.insert(schema.clozeCardGrammarTargets).values({
        id: `tgt_${card.id}_${gp.id}`, clozeCardId: card.id, grammarPointId: gp.id,
        wordReplacement: card.answer, blankIndex: 0,
      }).onConflictDoNothing().run();
      for (const extra of card.extraTargets ?? []) {
        database.insert(schema.clozeCardGrammarTargets).values({
          id: `tgt_${card.id}_${extra.grammarPointId}`, clozeCardId: card.id,
          grammarPointId: extra.grammarPointId, wordReplacement: extra.wordReplacement,
          blankIndex: extra.blankIndex,
        }).onConflictDoNothing().run();
      }
    }
    for (const ex of gp.lessonExamples) {
      database.insert(schema.lessonExamples).values({
        id: ex.id, grammarPointId: gp.id, fullSentence: ex.fullSentence,
        sentenceWithBlank: ex.sentenceWithBlank, answer: ex.answer,
        englishHint: JSON.stringify(ex.englishHint), order: ex.order, notes: ex.notes ?? null,
      }).onConflictDoNothing().run();
    }
  }

  database.insert(schema.meta).values({ key: 'contentVersion', value: CONTENT_VERSION })
    .onConflictDoUpdate({ target: schema.meta.key, set: { value: CONTENT_VERSION } }).run();
  void nowIso;
  return database;
}

// ── Types for screens ────────────────────────────────────────────────────────

export interface ReviewQueueItem {
  reviewCardId: string;
  clozeCardId: string;
  grammarPointId: string;
  fullSentence: string;
  sentenceWithBlank: string;
  vocabBaseForm: string;
  answers: string[];
  wordReplacement: string;
  englishHint: { text: string; highlightType: string }[];
  grammar: { title: string; category: string; tense: string | null; register: string | null; hint: string; description: string };
  streakCorrect: number;
  masteredAt: string | null;
}

export interface GrammarListItem {
  id: string;
  title: string;
  hint: string;
  category: string;
  lessonNumber: number;
  lessonTitle: string;
  position: number;
  status: 'new' | 'learning' | 'mastered';
  streakCorrect: number;
}

export interface DashboardStats {
  dueCount: number;
  totalReviews: number;
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  progress: number;
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  srsDistribution: { new: number; learning: number; review: number; relearning: number; mastered: number };
  history: { date: string; count: number }[];
  learnedCount: number;
  totalGrammarPoints: number;
  nextReviewAt: string | null;
}

// ── Queries ──────────────────────────────────────────────────────────────────

export function getDueQueue(limit = 10): ReviewQueueItem[] {
  const database = getDb();
  const nowIso = new Date().toISOString();
  const due = database
    .select()
    .from(schema.reviewCards)
    .where(and(eq(schema.reviewCards.userId, LOCAL_USER_ID), lte(schema.reviewCards.due, nowIso)))
    .orderBy(asc(schema.reviewCards.due))
    .limit(limit)
    .all()
    .filter((rc) => !rc.masteredAt);

  const queue: ReviewQueueItem[] = [];
  for (const rc of due) {
    const gp = database.select().from(schema.grammarPoints).where(eq(schema.grammarPoints.id, rc.grammarPointId)).get();
    if (!gp) continue;
    // Most-advanced cloze card for this grammar point (highest introducedAtPosition).
    const cards = database.select().from(schema.clozeCards).where(eq(schema.clozeCards.grammarPointId, gp.id)).all();
    if (cards.length === 0) continue;
    cards.sort((a, b) => b.introducedAtPosition - a.introducedAtPosition);
    const card = cards[0];
    const target = database
      .select().from(schema.clozeCardGrammarTargets)
      .where(and(eq(schema.clozeCardGrammarTargets.clozeCardId, card.id), eq(schema.clozeCardGrammarTargets.grammarPointId, gp.id)))
      .get();
    queue.push({
      reviewCardId: rc.id,
      clozeCardId: card.id,
      grammarPointId: gp.id,
      fullSentence: card.fullSentence,
      sentenceWithBlank: card.sentenceWithBlank,
      vocabBaseForm: card.vocabBaseForm,
      answers: correctAnswersForCard(
        { answer: card.answer, alternateAnswers: JSON.parse(card.alternateAnswers) as string[] },
        target?.wordReplacement,
      ),
      wordReplacement: target?.wordReplacement ?? card.answer,
      englishHint: JSON.parse(card.englishHint) as ReviewQueueItem['englishHint'],
      grammar: { title: gp.title, category: gp.category, tense: gp.tense, register: gp.register, hint: gp.hint, description: gp.description },
      streakCorrect: rc.streakCorrect,
      masteredAt: rc.masteredAt,
    });
  }
  return queue;
}

export function getNextReviewAt(): string | null {
  const database = getDb();
  const next = database
    .select().from(schema.reviewCards)
    .where(eq(schema.reviewCards.userId, LOCAL_USER_ID))
    .orderBy(asc(schema.reviewCards.due))
    .limit(1)
    .get();
  return next?.due ?? null;
}

export function getDashboardStats(): DashboardStats {
  const database = getDb();
  const nowIso = new Date().toISOString();
  const allCards = database.select().from(schema.reviewCards).where(eq(schema.reviewCards.userId, LOCAL_USER_ID)).all();
  const dueCount = allCards.filter((c) => c.due <= nowIso && !c.masteredAt).length;
  const logs = database.select().from(schema.reviewLogs).where(eq(schema.reviewLogs.userId, LOCAL_USER_ID)).all();
  const totalReviews = logs.length;
  const levelInfo = calculateLevel(totalReviews);
  const streak = database.select().from(schema.userStreaks).where(eq(schema.userStreaks.userId, LOCAL_USER_ID)).get();
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
  const totalGrammarPoints = database.select().from(schema.grammarPoints).all().length;
  return {
    dueCount, totalReviews,
    level: levelInfo.level, currentXP: levelInfo.currentXP, xpForNextLevel: levelInfo.xpForNextLevel,
    progress: levelInfo.progress, totalXP: levelInfo.totalXP,
    currentStreak: streak?.currentStreak ?? 0, longestStreak: streak?.longestStreak ?? 0,
    srsDistribution: dist, history,
    learnedCount: allCards.length, totalGrammarPoints,
    nextReviewAt: getNextReviewAt(),
  };
}

export function getGrammarList(): GrammarListItem[] {
  const database = getDb();
  const bundle = contentBundle as unknown as ContentBundle;
  const { grammarPoints } = flattenContent(bundle);
  const reviewByGp = new Map(
    database.select().from(schema.reviewCards).where(eq(schema.reviewCards.userId, LOCAL_USER_ID)).all()
      .map((rc) => [rc.grammarPointId, rc] as const),
  );
  return grammarPoints.map(({ gp, lessonNumber, lessonTitle, position }) => {
    const rc = reviewByGp.get(gp.id);
    return {
      id: gp.id, title: gp.title, hint: gp.hint, category: gp.category,
      lessonNumber, lessonTitle, position,
      status: rc ? (rc.masteredAt ? 'mastered' : 'learning') : 'new',
      streakCorrect: rc?.streakCorrect ?? 0,
    };
  });
}

export function getGrammarDetail(id: string) {
  const database = getDb();
  const gp = database.select().from(schema.grammarPoints).where(eq(schema.grammarPoints.id, id)).get();
  if (!gp) return null;
  const cards = database.select().from(schema.clozeCards).where(eq(schema.clozeCards.grammarPointId, id)).all();
  const examples = database.select().from(schema.lessonExamples).where(eq(schema.lessonExamples.grammarPointId, id)).all()
    .sort((a, b) => a.order - b.order);
  const reviewCard = database.select().from(schema.reviewCards)
    .where(and(eq(schema.reviewCards.userId, LOCAL_USER_ID), eq(schema.reviewCards.grammarPointId, id))).get();
  return {
    id: gp.id, title: gp.title, category: gp.category, tense: gp.tense, register: gp.register,
    hint: gp.hint, description: gp.description, level: gp.level,
    tags: JSON.parse(gp.tags) as string[],
    structurePattern: gp.structurePattern,
    notes: gp.notes ? (JSON.parse(gp.notes) as { type: string; title: string; content: string }[]) : null,
    relatedPointIds: JSON.parse(gp.relatedPointIds) as string[],
    lessonNumber: gp.lessonNumber, position: gp.position,
    cards: cards.map((c) => ({
      ...c,
      alternateAnswers: JSON.parse(c.alternateAnswers) as string[],
      englishHint: JSON.parse(c.englishHint) as { text: string; highlightType: string }[],
    })),
    examples: examples.map((e) => ({
      ...e,
      englishHint: JSON.parse(e.englishHint) as { text: string; highlightType: string }[],
    })),
    reviewCard: reviewCard ?? null,
  };
}

// ── Learn flow ───────────────────────────────────────────────────────────────

export interface LearnSession {
  deckComplete: boolean;
  deckId: string;
  deckTitle: string;
  totalRemaining: number;
  grammarPoints: { id: string; title: string; hint: string; category: string; tense: string | null; register: string | null; description: string; level: number; tags: string[]; structurePattern: string | null; notes: unknown; sortOrder: number }[];
}

export function getLearnSession(deckId: string, size = 5): LearnSession {
  const database = getDb();
  const deck = database.select().from(schema.decks).where(eq(schema.decks.id, deckId)).get();
  const progress = database.select().from(schema.userDeckProgress)
    .where(and(eq(schema.userDeckProgress.userId, LOCAL_USER_ID), eq(schema.userDeckProgress.deckId, deckId))).get();
  const nextIndex = (progress?.lastLearnedIndex ?? -1) + 1;
  const ordered = database.select().from(schema.deckGrammarPoints).where(eq(schema.deckGrammarPoints.deckId, deckId)).all()
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const remaining = ordered.filter((d) => d.sortOrder >= nextIndex);
  const batch = remaining.slice(0, size);
  const grammarPoints = batch.map((d) => {
    const gp = database.select().from(schema.grammarPoints).where(eq(schema.grammarPoints.id, d.grammarPointId)).get()!;
    return {
      id: gp.id, title: gp.title, hint: gp.hint, category: gp.category, tense: gp.tense,
      register: gp.register, description: gp.description, level: gp.level,
      tags: JSON.parse(gp.tags) as string[], structurePattern: gp.structurePattern,
      notes: gp.notes ? JSON.parse(gp.notes) : null, sortOrder: d.sortOrder,
    };
  });
  return {
    deckComplete: batch.length === 0,
    deckId,
    deckTitle: deck?.title ?? 'TOPIK I Level 1 Grammar',
    totalRemaining: remaining.length,
    grammarPoints,
  };
}

/** Create FSRS review cards for the learned grammar points and advance deck progress. Returns their cloze cards for the post-session quiz. */
export function completeLearnSession(deckId: string, grammarPointIds: string[]) {
  const database = getDb();
  const now = new Date();
  const quizCards: { id: string; grammarPointId: string; fullSentence: string; sentenceWithBlank: string; answer: string; alternateAnswers: string[]; englishHint: { text: string; highlightType: string }[] }[] = [];
  let maxSortOrder = -1;
  for (const gpId of grammarPointIds) {
    const dgp = database.select().from(schema.deckGrammarPoints)
      .where(and(eq(schema.deckGrammarPoints.deckId, deckId), eq(schema.deckGrammarPoints.grammarPointId, gpId))).get();
    if (dgp) maxSortOrder = Math.max(maxSortOrder, dgp.sortOrder);
    const state = newFsrsState(now);
    database.insert(schema.reviewCards).values({
      id: `rc_${LOCAL_USER_ID}_${gpId}`,
      userId: LOCAL_USER_ID, grammarPointId: gpId,
      stability: state.stability, difficulty: state.difficulty, reps: state.reps,
      lapses: state.lapses, state: state.state, due: state.due.toISOString(),
      lastReview: null, streakCorrect: 0, masteredAt: null, peakStability: 0, lastClozeCardId: null,
    }).onConflictDoNothing().run();
    const cards = database.select().from(schema.clozeCards).where(eq(schema.clozeCards.grammarPointId, gpId)).all();
    for (const c of cards) {
      quizCards.push({
        id: c.id, grammarPointId: gpId, fullSentence: c.fullSentence, sentenceWithBlank: c.sentenceWithBlank,
        answer: c.answer, alternateAnswers: JSON.parse(c.alternateAnswers) as string[],
        englishHint: JSON.parse(c.englishHint) as { text: string; highlightType: string }[],
      });
    }
  }
  const progress = database.select().from(schema.userDeckProgress)
    .where(and(eq(schema.userDeckProgress.userId, LOCAL_USER_ID), eq(schema.userDeckProgress.deckId, deckId))).get();
  if (progress) {
    database.update(schema.userDeckProgress).set({
      lastLearnedIndex: Math.max(progress.lastLearnedIndex, maxSortOrder),
      lastStudiedAt: now.toISOString(),
    }).where(eq(schema.userDeckProgress.id, progress.id)).run();
  } else {
    database.insert(schema.userDeckProgress).values({
      id: `udp_${LOCAL_USER_ID}_${deckId}`, userId: LOCAL_USER_ID, deckId,
      lastLearnedIndex: maxSortOrder, lastStudiedAt: now.toISOString(),
    }).run();
  }
  return quizCards;
}

// ── Review submission ────────────────────────────────────────────────────────

/** Port of POST /api/reviews (FSRS update + log + streak), local and synchronous. */
export function submitReview(reviewCardId: string, rating: Grade, clozeCardId?: string): { nextDue: string; state: number } {
  const database = getDb();
  const rc = database.select().from(schema.reviewCards).where(eq(schema.reviewCards.id, reviewCardId)).get();
  if (!rc) throw new Error('Review card not found');
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
  database.update(schema.reviewCards).set({
    stability: result.state.stability, difficulty: result.state.difficulty,
    reps: result.state.reps, lapses: result.state.lapses, state: result.state.state,
    due: result.state.due.toISOString(), lastReview: now.toISOString(),
    streakCorrect: result.state.streakCorrect, peakStability: result.state.peakStability,
    masteredAt: result.state.masteredAt?.toISOString() ?? null,
    lastClozeCardId: clozeCardId ?? rc.lastClozeCardId,
  }).where(eq(schema.reviewCards.id, reviewCardId)).run();
  database.insert(schema.reviewLogs).values({
    id: newId('rl'), reviewCardId: rc.id, userId: LOCAL_USER_ID, rating,
    reviewedAt: now.toISOString(), stability: result.log.stability, difficulty: result.log.difficulty,
    elapsedDays: result.log.elapsedDays, scheduledDays: result.log.scheduledDays,
  }).run();
  updateStreak(database, now);
  return { nextDue: result.state.due.toISOString(), state: result.state.state };
}

/** Port of the old streak logic, using YYYY-MM-DD dates. */
function updateStreak(database: Db, now: Date) {
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const existing = database.select().from(schema.userStreaks).where(eq(schema.userStreaks.userId, LOCAL_USER_ID)).get();
  if (!existing) {
    database.insert(schema.userStreaks).values({
      id: `streak_${LOCAL_USER_ID}`, userId: LOCAL_USER_ID, currentStreak: 1, longestStreak: 1, lastStudiedDate: today,
    }).run();
    return;
  }
  if (existing.lastStudiedDate === today) return;
  const next = existing.lastStudiedDate === yesterdayStr ? existing.currentStreak + 1 : 1;
  database.update(schema.userStreaks).set({
    currentStreak: next, longestStreak: Math.max(next, existing.longestStreak), lastStudiedDate: today,
  }).where(eq(schema.userStreaks.id, existing.id)).run();
}

/** Answer check for a queue item — exact match against answer + alternates (+ target word). */
export function checkQueueItem(item: ReviewQueueItem, submittedHangul: string[]): boolean {
  return checkAnswers(submittedHangul, item.answers);
}

export { checkAnswers, correctAnswersForCard };
