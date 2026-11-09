// Local SQLite database — offline-first, local accounts (v2).
// Drizzle ORM over the expo-sqlite driver. No server: accounts live in the
// local `users` table, passwords are salted + iterated SHA-256 (see
// lib/auth.ts), and the session is a user id stored in the `meta` table.
// Per-user rows (review cards, logs, deck progress, streaks) are keyed by
// user id; pre-auth data keyed 'local' migrates to the first account.
import { openDatabaseSync } from 'expo-sqlite';
import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { and, asc, eq, lte, sql } from 'drizzle-orm';
import * as schema from './schema';
import contentBundle from '../content/topik1-level1.json';
import { flattenContent, type ContentBundle } from '../content/types';
import { checkAnswers, computeFsrsReview, correctAnswersForCard, newFsrsState, stageForCard, type Grade } from '../lib/srs';
import { calculateLevel } from '../lib/levels';
import { generateSalt, hashPassword, isLogoutGraceActive, usernameFromEmail } from '../lib/auth';

export const LOCAL_USER_ID = 'local';
export const CONTENT_VERSION = 'topik1-level1-v3';

/** The id of the currently logged-in user; all queries below are scoped to
 * it. Defaults to 'local' until the auth layer sets the real account. */
let currentUserId = LOCAL_USER_ID;

export function setCurrentUserId(id: string): void {
  currentUserId = id;
}

export function getCurrentUserId(): string {
  return currentUserId;
}

/** Shorthand used by the queries below. */
function uid(): string {
  return currentUserId;
}

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
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT NOT NULL, email TEXT NOT NULL, password_hash TEXT NOT NULL, salt TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(email));
CREATE TABLE IF NOT EXISTS device_trust (user_id TEXT NOT NULL, device_id TEXT NOT NULL, last_verified_at TEXT NOT NULL, last_logout_at TEXT, UNIQUE(user_id, device_id));
`;

/** Create tables and seed the provisional TOPIK I Level 1 content (verbatim port). Idempotent. */
export function initDb(): Db {
  const database = getDb();
  // execSync lives on the raw expo-sqlite handle, not on the Drizzle wrapper.
  sqliteDb!.execSync(CREATE_TABLES_SQL);
  // One-time cleanup of the pre-v2 remembered session (see SESSION_META_KEY).
  database.delete(schema.meta).where(eq(schema.meta.key, 'sessionUserId')).run();
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

  // The deck catalogue: every TOPIK level is its own deck, plus a
  // Non-TOPIK deck. Only Level 1 has content so far; the rest are
  // catalogue entries (no grammar points yet) so the Decks page and the
  // library can list them as coming soon.
  const catalogue: {
    id: string; title: string; slug: string; description: string;
    level: number; topikLevel: string; sortOrder: number;
  }[] = [
    { id: 'deck_topik1_level2', title: 'TOPIK I Level 2', slug: 'topik-level-2', description: 'TOPIK I Level 2 grammar.', level: 2, topikLevel: 'topik1-2', sortOrder: 1 },
    { id: 'deck_topik2_level3', title: 'TOPIK II Level 3', slug: 'topik-level-3', description: 'TOPIK II Level 3 grammar.', level: 3, topikLevel: 'topik2-3', sortOrder: 2 },
    { id: 'deck_topik2_level4', title: 'TOPIK II Level 4', slug: 'topik-level-4', description: 'TOPIK II Level 4 grammar.', level: 4, topikLevel: 'topik2-4', sortOrder: 3 },
    { id: 'deck_topik2_level5', title: 'TOPIK II Level 5', slug: 'topik-level-5', description: 'TOPIK II Level 5 grammar.', level: 5, topikLevel: 'topik2-5', sortOrder: 4 },
    { id: 'deck_topik2_level6', title: 'TOPIK II Level 6', slug: 'topik-level-6', description: 'TOPIK II Level 6 grammar.', level: 6, topikLevel: 'topik2-6', sortOrder: 5 },
    { id: 'deck_non_topik', title: 'Non-TOPIK', slug: 'non-topik', description: 'Grammar outside the TOPIK syllabus.', level: 0, topikLevel: 'non-topik', sortOrder: 6 },
  ];
  for (const deck of catalogue) {
    database.insert(schema.decks).values(deck).onConflictDoNothing().run();
  }

  // Content sync on a version bump: new rows are inserted AND changed
  // text is updated (onConflictDoUpdate), so a content correction reaches
  // devices that already seeded an earlier version. Review progress lives
  // in review_cards / review_logs, which this never touches.
  for (const { gp, lessonNumber, position } of grammarPoints) {
    const gpRow = {
      title: gp.title, category: gp.category, tense: gp.tense, register: gp.register,
      hint: gp.hint, description: gp.description, level: gp.level,
      tags: JSON.stringify(gp.tags), structurePattern: gp.structurePattern,
      notes: gp.notes ? JSON.stringify(gp.notes) : null,
      relatedPointIds: JSON.stringify(gp.relatedPointIds ?? []),
      lessonNumber, position,
    };
    database.insert(schema.grammarPoints).values({ id: gp.id, ...gpRow })
      .onConflictDoUpdate({ target: schema.grammarPoints.id, set: gpRow }).run();

    database.insert(schema.deckGrammarPoints).values({
      id: `dgp_${bundle.deck.id}_${gp.id}`,
      deckId: bundle.deck.id, grammarPointId: gp.id,
      sortOrder: position - 1, lessonNumber,
    }).onConflictDoNothing().run();

    for (const card of gp.cards) {
      const cardRow = {
        grammarPointId: gp.id, fullSentence: card.fullSentence,
        sentenceWithBlank: card.sentenceWithBlank, vocabBaseForm: card.vocabBaseForm,
        answer: card.answer, alternateAnswers: JSON.stringify(card.alternateAnswers),
        englishHint: JSON.stringify(card.englishHint), introducedAtPosition: card.introducedAtPosition,
      };
      database.insert(schema.clozeCards).values({ id: card.id, ...cardRow })
        .onConflictDoUpdate({ target: schema.clozeCards.id, set: cardRow }).run();
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
      const exRow = {
        grammarPointId: gp.id, fullSentence: ex.fullSentence,
        sentenceWithBlank: ex.sentenceWithBlank, answer: ex.answer,
        englishHint: JSON.stringify(ex.englishHint), order: ex.order, notes: ex.notes ?? null,
      };
      database.insert(schema.lessonExamples).values({ id: ex.id, ...exRow })
        .onConflictDoUpdate({ target: schema.lessonExamples.id, set: exRow }).run();
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
  /** FSRS state (0 New, 1 Learning, 2 Review, 3 Relearning) + stability in days — for the SRS rank label. */
  fsrsState: number;
  stability: number;
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
  /** The TOPIK level (deck) this point belongs to. */
  deckId: string;
  deckTitle: string;
  topikLevel: string;
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
  /** Grammar points with no review card yet — available to learn. */
  newCount: number;
  nextReviewAt: string | null;
  /** Points learned today (Learn sessions only — "I already know this" does not count). */
  learnedToday: number;
  /** Daily new-points limit (Bunpro-style daily queue). */
  dailyLearnLimit: number;
  /** Vacation mode: reviews and learning are paused. */
  vacationMode: boolean;
  /** Distinct days with review activity (all time). */
  daysStudied: number;
  /** Accuracy of the most recent review session, or null when there is none. */
  lastSessionAccuracy: number | null;
  /** Bunpro-style SRS stages (from FSRS stability) + ghosts (lapses). */
  stageCounts: { beginner: number; adept: number; seasoned: number; expert: number; master: number; selfStudy: number; ghost: number };
  /** Per-level progress for the TOPIK Progress card. Each TOPIK level is
   * its own deck; a level's lessons are listed under it. */
  levelProgress: {
    deckId: string;
    level: string;
    title: string;
    learned: number;
    total: number;
    lessons: { lessonNumber: number; lessonTitle: string; learned: number; total: number }[];
  }[];
}

// ── Queries ──────────────────────────────────────────────────────────────────

export function getDueQueue(limit = 10): ReviewQueueItem[] {
  const settings = getUserSettings();
  // Vacation mode pauses reviews entirely.
  if (settings.vacationMode) return [];
  // Max reviews per day caps the queue by what is left of today's allowance.
  let effectiveLimit = limit;
  if (settings.maxReviewsPerDay != null) {
    const today = new Date().toISOString().slice(0, 10);
    const reviewedToday = getDb()
      .select()
      .from(schema.reviewLogs)
      .where(eq(schema.reviewLogs.userId, uid()))
      .all()
      .filter((l) => l.reviewedAt.slice(0, 10) === today).length;
    effectiveLimit = Math.min(limit, Math.max(0, settings.maxReviewsPerDay - reviewedToday));
  }
  if (effectiveLimit <= 0) return [];
  const database = getDb();
  const nowIso = new Date().toISOString();
  const due = database
    .select()
    .from(schema.reviewCards)
    .where(and(eq(schema.reviewCards.userId, uid()), lte(schema.reviewCards.due, nowIso)))
    .orderBy(asc(schema.reviewCards.due))
    .limit(effectiveLimit)
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
      fsrsState: rc.state,
      stability: rc.stability,
    });
  }
  return queue;
}

export function getNextReviewAt(): string | null {
  const database = getDb();
  const next = database
    .select().from(schema.reviewCards)
    .where(eq(schema.reviewCards.userId, uid()))
    .orderBy(asc(schema.reviewCards.due))
    .limit(1)
    .get();
  return next?.due ?? null;
}

export function getDashboardStats(): DashboardStats {
  const database = getDb();
  const nowIso = new Date().toISOString();
  const allCards = database.select().from(schema.reviewCards).where(eq(schema.reviewCards.userId, uid())).all();
  const logs = database.select().from(schema.reviewLogs).where(eq(schema.reviewLogs.userId, uid())).all();
  const settings = getUserSettings();
  const today = nowIso.slice(0, 10);
  const reviewedToday = logs.filter((l) => l.reviewedAt.slice(0, 10) === today).length;
  // The due count is what the user can actually review: 0 on vacation,
  // capped by the daily max otherwise.
  const rawDueCount = allCards.filter((c) => c.due <= nowIso && !c.masteredAt).length;
  const dueCount = settings.vacationMode
    ? 0
    : settings.maxReviewsPerDay != null
      ? Math.min(rawDueCount, Math.max(0, settings.maxReviewsPerDay - reviewedToday))
      : rawDueCount;
  const totalReviews = logs.length;
  const levelInfo = calculateLevel(totalReviews);
  const streak = database.select().from(schema.userStreaks).where(eq(schema.userStreaks.userId, uid())).get();
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
  const totalGrammarPoints = database.select().from(schema.grammarPoints).all().length;
  // Per-level progress: learned = grammar point has a review card. Each
  // TOPIK level is its own deck, so progress is grouped by deck (from the
  // decks table, not the content bundle) — a new level is just a new deck
  // row with its grammar points.
  const learnedIds = new Set(allCards.map((c) => c.grammarPointId));
  const bundle = contentBundle as unknown as ContentBundle;
  const lessonTitles = new Map<string, string>();
  for (const { gp, lessonTitle } of flattenContent(bundle).grammarPoints) {
    lessonTitles.set(gp.id, lessonTitle);
  }
  const decks = database.select().from(schema.decks).orderBy(asc(schema.decks.sortOrder)).all();
  const levelProgress = decks.map((deck) => {
    const dgps = database
      .select()
      .from(schema.deckGrammarPoints)
      .where(eq(schema.deckGrammarPoints.deckId, deck.id))
      .all();
    const lessons = new Map<number, { lessonTitle: string; total: number; learned: number }>();
    let learned = 0;
    for (const dgp of dgps) {
      const entry = lessons.get(dgp.lessonNumber) ?? {
        lessonTitle: lessonTitles.get(dgp.grammarPointId) ?? `Lesson ${dgp.lessonNumber}`,
        total: 0,
        learned: 0,
      };
      entry.total += 1;
      if (learnedIds.has(dgp.grammarPointId)) {
        entry.learned += 1;
        learned += 1;
      }
      lessons.set(dgp.lessonNumber, entry);
    }
    const lessonRows = [...lessons.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([lessonNumber, entry]) => ({ lessonNumber, ...entry }));
    return {
      deckId: deck.id,
      level: deck.topikLevel,
      title: deck.title,
      learned,
      total: dgps.length,
      lessons: lessonRows,
    };
  });
  const activeDeckId = getActiveDeckId();
  const effective = getEffectiveLearnSettings(activeDeckId);
  return {
    dueCount, totalReviews,
    level: levelInfo.level, currentXP: levelInfo.currentXP, xpForNextLevel: levelInfo.xpForNextLevel,
    progress: levelInfo.progress, totalXP: levelInfo.totalXP,
    currentStreak: streak?.currentStreak ?? 0, longestStreak: streak?.longestStreak ?? 0,
    srsDistribution: dist, history,
    learnedCount: allCards.length, totalGrammarPoints,
    newCount: Math.max(0, totalGrammarPoints - allCards.length),
    nextReviewAt: getNextReviewAt(),
    learnedToday: getLearnedToday(), dailyLearnLimit: effective.dailyLimit,
    levelProgress,
    vacationMode: settings.vacationMode,
    daysStudied,
    lastSessionAccuracy,
    stageCounts,
  };
}

export function getGrammarList(): GrammarListItem[] {
  const database = getDb();
  const bundle = contentBundle as unknown as ContentBundle;
  const { grammarPoints } = flattenContent(bundle);
  const reviewByGp = new Map(
    database.select().from(schema.reviewCards).where(eq(schema.reviewCards.userId, uid())).all()
      .map((rc) => [rc.grammarPointId, rc] as const),
  );
  // Grammar point -> its deck (TOPIK level).
  const deckByGp = new Map(
    database.select().from(schema.deckGrammarPoints).all()
      .map((d) => [d.grammarPointId, d.deckId] as const),
  );
  const deckById = new Map(
    database.select().from(schema.decks).all().map((d) => [d.id, d] as const),
  );
  return grammarPoints.map(({ gp, lessonNumber, lessonTitle, position }) => {
    const rc = reviewByGp.get(gp.id);
    const deck = deckById.get(deckByGp.get(gp.id) ?? '') ?? { id: '', title: '', topikLevel: '' };
    return {
      id: gp.id, title: gp.title, hint: gp.hint, category: gp.category,
      lessonNumber, lessonTitle, position,
      status: rc ? (rc.masteredAt ? 'mastered' : 'learning') : 'new',
      streakCorrect: rc?.streakCorrect ?? 0,
      deckId: deck.id, deckTitle: deck.title, topikLevel: deck.topikLevel,
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
    .where(and(eq(schema.reviewCards.userId, uid()), eq(schema.reviewCards.grammarPointId, id))).get();
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

/** Daily new-points limit — Bunpro's dashboard shows Learn as X/5, and the
 * queue resets each day. Self-study (explicit opt-in) bypasses it. */
export const DAILY_NEW_LIMIT = 5;

function dailyLearnedKey(date: string): string {
  return `dailyLearned:${uid()}:${date}`;
}

/** Points learned today via Learn sessions ("I already know this" does not count). */
export function getLearnedToday(): number {
  const today = new Date().toISOString().slice(0, 10);
  const row = getDb().select().from(schema.meta).where(eq(schema.meta.key, dailyLearnedKey(today))).get();
  return row ? parseInt(row.value, 10) || 0 : 0;
}

/** Increment today's learned count inside a transaction (atomic with the new cards). */
function addLearnedTodayTx(tx: Tx, date: string, n: number): void {
  if (n <= 0) return;
  const key = dailyLearnedKey(date);
  const row = tx.select().from(schema.meta).where(eq(schema.meta.key, key)).get();
  const next = (row ? parseInt(row.value, 10) || 0 : 0) + n;
  tx.insert(schema.meta).values({ key, value: String(next) })
    .onConflictDoUpdate({ target: schema.meta.key, set: { value: String(next) } }).run();
}

/** Run `fn` in a single transaction, recovering from a stale transaction
 * left open by an earlier attempt that timed out mid-flight. The sync
 * channel's spin budget can strike BEGIN itself — and Drizzle's
 * `transaction()` runs BEGIN outside its try/catch, so no rollback is
 * attempted and the worker's connection is left inside the transaction.
 * The next BEGIN then fails with "cannot start a transaction within a
 * transaction" (surfaced as "Failed to run the query 'begin'"). Rolling
 * back first clears it; the retry is safe because our transactional
 * writes are idempotent (onConflictDoNothing inserts, absolute updates). */
function withTransaction<T>(database: Db, fn: (tx: Tx) => T): T {
  try {
    return database.transaction(fn);
  } catch (e) {
    try {
      database.run(sql`rollback`);
    } catch {
      // No transaction was open, or the rollback itself timed out — the
      // retry below surfaces the real error if it still fails.
    }
    return database.transaction(fn);
  }
}

export interface DeckInfo {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: number;
  topikLevel: string;
  sortOrder: number;
  totalPoints: number;
  learnedPoints: number;
  dueCount: number;
}

/** The deck catalogue (TOPIK 1–6 + Non-TOPIK) with per-user progress. */
export function getDecks(): DeckInfo[] {
  const database = getDb();
  const nowIso = new Date().toISOString();
  const decks = database.select().from(schema.decks).orderBy(asc(schema.decks.sortOrder)).all();
  const dgps = database.select().from(schema.deckGrammarPoints).all();
  const cards = database.select().from(schema.reviewCards).where(eq(schema.reviewCards.userId, uid())).all();
  const gpToDeck = new Map(dgps.map((d) => [d.grammarPointId, d.deckId] as const));
  return decks.map((deck) => {
    const deckGps = dgps.filter((d) => d.deckId === deck.id);
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
    };
  });
}

const ACTIVE_DECK_META_KEY = 'activeDeckId';

/** The deck the user chose in the catalogue; defaults to the first deck
 * that has content (TOPIK I Level 1 today). */
export function getActiveDeckId(): string {
  const saved = getMeta(ACTIVE_DECK_META_KEY);
  if (saved) {
    const exists = getDb().select().from(schema.decks).where(eq(schema.decks.id, saved)).get();
    if (exists) return saved;
  }
  const withContent = getDecks().find((d) => d.totalPoints > 0);
  return withContent?.id ?? getDecks()[0]?.id ?? '';
}

export function setActiveDeckId(deckId: string): void {
  const exists = getDb().select().from(schema.decks).where(eq(schema.decks.id, deckId)).get();
  if (!exists) return;
  setMeta(ACTIVE_DECK_META_KEY, deckId);
}

// ── Settings ───────────────────────────────────────────────────────────────

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.min(max, Math.max(min, n));
}

export interface UserSettings {
  /** New grammar points per day (Bunpro's per-deck Daily Goal default). */
  dailyNewLimit: number;
  /** New points presented in a single Learn session (Bunpro's Batch Size). */
  batchSize: number;
  hideStreak: boolean;
  /** Show the SRS rank in the review HUD. */
  showSrsRank: boolean;
  /** Show the Undo button after answering a review. */
  undoEnabled: boolean;
  /** Hide the top navigation bar during reviews. */
  focusMode: boolean;
  /** Advance automatically on a correct review answer. */
  lightningMode: boolean;
  /** Max reviews per day (null = no cap). */
  maxReviewsPerDay: number | null;
  /** Pause reviews, learning, and streak counting. */
  vacationMode: boolean;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  dailyNewLimit: DAILY_NEW_LIMIT,
  batchSize: 5,
  hideStreak: false,
  showSrsRank: true,
  undoEnabled: true,
  focusMode: false,
  lightningMode: false,
  maxReviewsPerDay: null,
  vacationMode: false,
};

function settingsKey(): string {
  return `settings:${uid()}`;
}

/** Per-user settings, stored as one JSON blob in meta. Unknown or invalid
 * values fall back to the defaults. */
export function getUserSettings(): UserSettings {
  const raw = getMeta(settingsKey());
  if (!raw) return { ...DEFAULT_USER_SETTINGS };
  try {
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
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
  } catch {
    return { ...DEFAULT_USER_SETTINGS };
  }
}

export function updateUserSettings(patch: Partial<UserSettings>): void {
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
    const database = getDb();
    const streak = database
      .select()
      .from(schema.userStreaks)
      .where(eq(schema.userStreaks.userId, uid()))
      .get();
    if (streak?.lastStudiedDate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      if (streak.lastStudiedDate < yesterdayStr) {
        database
          .update(schema.userStreaks)
          .set({ lastStudiedDate: yesterdayStr })
          .where(eq(schema.userStreaks.id, streak.id))
          .run();
      }
    }
  }
  setMeta(settingsKey(), JSON.stringify(next));
}

/** Per-deck overrides (null = use the global setting). Bunpro's per-deck
 * Daily Goal (default 5, max 50) and Batch Size (cannot exceed the goal). */
export interface DeckSettings {
  dailyGoal: number | null;
  batchSize: number | null;
}

function deckSettingsKey(): string {
  return `deckSettings:${uid()}`;
}

export function getDeckSettings(deckId: string): DeckSettings {
  const raw = getMeta(deckSettingsKey());
  if (!raw) return { dailyGoal: null, batchSize: null };
  try {
    const map = JSON.parse(raw) as Record<string, DeckSettings>;
    const d = map[deckId];
    if (!d) return { dailyGoal: null, batchSize: null };
    const dailyGoal = d.dailyGoal == null ? null : clampInt(d.dailyGoal, 1, 50, 5);
    const batchSize = d.batchSize == null ? null : clampInt(d.batchSize, 1, 50, 5);
    return {
      dailyGoal,
      batchSize: dailyGoal != null && batchSize != null ? Math.min(batchSize, dailyGoal) : batchSize,
    };
  } catch {
    return { dailyGoal: null, batchSize: null };
  }
}

export function setDeckSettings(deckId: string, patch: Partial<DeckSettings>): void {
  const raw = getMeta(deckSettingsKey());
  let map: Record<string, DeckSettings> = {};
  try {
    map = raw ? (JSON.parse(raw) as Record<string, DeckSettings>) : {};
  } catch {
    map = {};
  }
  const prev = map[deckId] ?? { dailyGoal: null, batchSize: null };
  const dailyGoal =
    patch.dailyGoal === undefined
      ? prev.dailyGoal
      : patch.dailyGoal == null
        ? null
        : clampInt(patch.dailyGoal, 1, 50, 5);
  let batchSize =
    patch.batchSize === undefined
      ? prev.batchSize
      : patch.batchSize == null
        ? null
        : clampInt(patch.batchSize, 1, 50, 5);
  if (dailyGoal != null && batchSize != null) batchSize = Math.min(batchSize, dailyGoal);
  map[deckId] = { dailyGoal, batchSize };
  setMeta(deckSettingsKey(), JSON.stringify(map));
}

/** The daily limit and batch size that apply to a deck: its own override,
 * else the global settings. */
export function getEffectiveLearnSettings(deckId: string): { dailyLimit: number; batchSize: number } {
  const global = getUserSettings();
  const deck = getDeckSettings(deckId);
  const dailyLimit = deck.dailyGoal ?? global.dailyNewLimit;
  const batchSize = Math.min(deck.batchSize ?? global.batchSize, dailyLimit);
  return { dailyLimit, batchSize };
}

export interface LearnSession {
  deckComplete: boolean;
  deckId: string;
  deckTitle: string;
  totalRemaining: number;
  grammarPoints: { id: string; title: string; hint: string; category: string; tense: string | null; register: string | null; description: string; level: number; tags: string[]; structurePattern: string | null; notes: unknown; sortOrder: number }[];
  /** Points learned today so far (drives the dashboard's Learn X/5). */
  learnedToday: number;
  dailyLimit: number;
  /** True when the daily queue is exhausted but points remain (self-study can still proceed). */
  queueDone: boolean;
  /** Vacation mode: learning is paused. */
  vacation: boolean;
}

export function getLearnSession(deckId: string, selfStudy = false): LearnSession {
  const database = getDb();
  const deck = database.select().from(schema.decks).where(eq(schema.decks.id, deckId)).get();
  const progress = database.select().from(schema.userDeckProgress)
    .where(and(eq(schema.userDeckProgress.userId, uid()), eq(schema.userDeckProgress.deckId, deckId))).get();
  const nextIndex = (progress?.lastLearnedIndex ?? -1) + 1;
  const ordered = database.select().from(schema.deckGrammarPoints).where(eq(schema.deckGrammarPoints.deckId, deckId)).all()
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const remaining = ordered.filter((d) => d.sortOrder >= nextIndex);
  // Daily queue: the deck's effective limit and batch size (per-deck
  // override, else the global settings). Learn only offers today's
  // remaining quota unless the user explicitly opts into self-study.
  // Vacation mode pauses learning entirely.
  const { dailyLimit, batchSize } = getEffectiveLearnSettings(deckId);
  const vacation = getUserSettings().vacationMode;
  const learnedToday = getLearnedToday();
  const quota = vacation ? 0 : selfStudy ? batchSize : Math.max(0, dailyLimit - learnedToday);
  const batch = remaining.slice(0, Math.min(batchSize, quota));
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
    deckComplete: batch.length === 0 && remaining.length === 0,
    deckId,
    deckTitle: deck?.title ?? 'TOPIK I Level 1 Grammar',
    totalRemaining: remaining.length,
    grammarPoints,
    learnedToday,
    dailyLimit,
    queueDone: batch.length === 0 && remaining.length > 0,
    vacation,
  };
}

/** Create FSRS review cards for the learned grammar points and advance deck progress. Returns their cloze cards for the post-session quiz.
 * All writes run in one transaction: on expo-sqlite web every sync call
 * spins waiting on the worker, and each auto-commit write fsyncs to OPFS
 * — a burst of separate writes can exceed the spin budget ("Sync operation
 * timeout") on a phone. One transaction = one fsync at COMMIT. */
export function completeLearnSession(deckId: string, grammarPointIds: string[]) {
  const database = getDb();
  const now = new Date();
  return withTransaction(database, (tx) => {
    const quizCards: { id: string; grammarPointId: string; fullSentence: string; sentenceWithBlank: string; answer: string; alternateAnswers: string[]; englishHint: { text: string; highlightType: string }[] }[] = [];
    let maxSortOrder = -1;
    let newlyLearned = 0;
    for (const gpId of grammarPointIds) {
      const dgp = tx.select().from(schema.deckGrammarPoints)
        .where(and(eq(schema.deckGrammarPoints.deckId, deckId), eq(schema.deckGrammarPoints.grammarPointId, gpId))).get();
      if (dgp) maxSortOrder = Math.max(maxSortOrder, dgp.sortOrder);
      const state = newFsrsState(now);
      const inserted = tx.insert(schema.reviewCards).values({
        id: `rc_${uid()}_${gpId}`,
        userId: uid(), grammarPointId: gpId,
        stability: state.stability, difficulty: state.difficulty, reps: state.reps,
        lapses: state.lapses, state: state.state, due: state.due.toISOString(),
        lastReview: null, streakCorrect: 0, masteredAt: null, peakStability: 0, lastClozeCardId: null,
      }).onConflictDoNothing().run();
      // Count only genuinely new cards: a retry after a partially committed
      // attempt re-runs the inserts as conflicts, and must not double-count.
      newlyLearned += inserted.changes;
      const cards = tx.select().from(schema.clozeCards).where(eq(schema.clozeCards.grammarPointId, gpId)).all();
      // One quiz card per learned point: the first/intro card (lowest
      // introducedAtPosition), matching Bunpro's one-card-per-new-point
      // review stage. The remaining cards are used by the review queue.
      if (cards.length > 0) {
        cards.sort((a, b) => a.introducedAtPosition - b.introducedAtPosition);
        const c = cards[0];
        quizCards.push({
          id: c.id, grammarPointId: gpId, fullSentence: c.fullSentence, sentenceWithBlank: c.sentenceWithBlank,
          answer: c.answer, alternateAnswers: JSON.parse(c.alternateAnswers) as string[],
          englishHint: JSON.parse(c.englishHint) as { text: string; highlightType: string }[],
        });
      }
    }
    const progress = tx.select().from(schema.userDeckProgress)
      .where(and(eq(schema.userDeckProgress.userId, uid()), eq(schema.userDeckProgress.deckId, deckId))).get();
    if (progress) {
      tx.update(schema.userDeckProgress).set({
        lastLearnedIndex: Math.max(progress.lastLearnedIndex, maxSortOrder),
        lastStudiedAt: now.toISOString(),
      }).where(eq(schema.userDeckProgress.id, progress.id)).run();
    } else {
      tx.insert(schema.userDeckProgress).values({
        id: `udp_${uid()}_${deckId}`, userId: uid(), deckId,
        lastLearnedIndex: maxSortOrder, lastStudiedAt: now.toISOString(),
      }).run();
    }
    addLearnedTodayTx(tx, now.toISOString().slice(0, 10), newlyLearned);
    return quizCards;
  });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isSyncTimeout(e: unknown): boolean {
  return e instanceof Error && e.message.includes('Sync operation timeout');
}

/** completeLearnSession with retries on the worker spin-budget timeout.
 * Safe to retry: the inserts are onConflictDoNothing and the progress
 * update sets absolute values, so a re-run after a partial attempt is a
 * no-op for the parts that already landed. */
export async function completeLearnSessionWithRetry(deckId: string, grammarPointIds: string[]) {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return completeLearnSession(deckId, grammarPointIds);
    } catch (e) {
      lastError = e;
      if (!isSyncTimeout(e) || attempt === 3) throw e;
      await sleep(500);
    }
  }
  throw lastError;
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
  // One transaction = one OPFS fsync at COMMIT (see completeLearnSession).
  withTransaction(database, (tx) => {
    tx.update(schema.reviewCards).set({
      stability: result.state.stability, difficulty: result.state.difficulty,
      reps: result.state.reps, lapses: result.state.lapses, state: result.state.state,
      due: result.state.due.toISOString(), lastReview: now.toISOString(),
      streakCorrect: result.state.streakCorrect, peakStability: result.state.peakStability,
      masteredAt: result.state.masteredAt?.toISOString() ?? null,
      lastClozeCardId: clozeCardId ?? rc.lastClozeCardId,
    }).where(eq(schema.reviewCards.id, reviewCardId)).run();
    tx.insert(schema.reviewLogs).values({
      id: newId('rl'), reviewCardId: rc.id, userId: uid(), rating,
      reviewedAt: now.toISOString(), stability: result.log.stability, difficulty: result.log.difficulty,
      elapsedDays: result.log.elapsedDays, scheduledDays: result.log.scheduledDays,
    }).run();
    updateStreak(tx, now);
  });
  return { nextDue: result.state.due.toISOString(), state: result.state.state };
}

/** The transaction object type for updateStreak, which runs inside submitReview's transaction. */
type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

/** Port of the old streak logic, using YYYY-MM-DD dates. */
function updateStreak(database: Db | Tx, now: Date) {
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const existing = database.select().from(schema.userStreaks).where(eq(schema.userStreaks.userId, uid())).get();
  if (!existing) {
    database.insert(schema.userStreaks).values({
      id: `streak_${uid()}`, userId: uid(), currentStreak: 1, longestStreak: 1, lastStudiedDate: today,
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

// ── Cram ───────────────────────────────────────────────────────────────────

/** Quick-Cram sets: Masters (Master stage), Reviews (all learned, not
 * mastered), Ghosts (lapses — trouble items), Difficult (lapses ≥ 2 or
 * stability under a day). All are proxies from the FSRS card data. */
export type CramSetKind = 'masters' | 'reviews' | 'ghosts' | 'difficult';

export interface CramCounts {
  masters: number;
  reviews: number;
  ghosts: number;
  difficult: number;
}

export function getCramCounts(): CramCounts {
  const cards = getDb()
    .select()
    .from(schema.reviewCards)
    .where(eq(schema.reviewCards.userId, uid()))
    .all();
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

/** Grammar point ids in a Quick-Cram set. */
export function getCramPointIds(kind: CramSetKind): string[] {
  const cards = getDb()
    .select()
    .from(schema.reviewCards)
    .where(eq(schema.reviewCards.userId, uid()))
    .all();
  return cards
    .filter((c) => {
      if (kind === 'masters') return stageForCard(c.state, c.stability, c.masteredAt !== null) === 'master';
      if (kind === 'reviews') return !c.masteredAt;
      if (kind === 'ghosts') return c.lapses > 0 && !c.masteredAt;
      return !c.masteredAt && (c.lapses >= 2 || (c.stability < 1 && c.reps >= 1));
    })
    .map((c) => c.grammarPointId);
}

export interface CramLessonRow {
  lessonNumber: number;
  lessonTitle: string;
  learned: number;
  total: number;
}

/** Per-lesson learned/total for a deck (the Custom Cram table). */
export function getCramLessonRows(deckId: string): CramLessonRow[] {
  const database = getDb();
  const bundle = contentBundle as unknown as ContentBundle;
  const lessonTitles = new Map<string, string>();
  for (const { gp, lessonTitle } of flattenContent(bundle).grammarPoints) {
    lessonTitles.set(gp.id, lessonTitle);
  }
  const learnedIds = new Set(
    database
      .select()
      .from(schema.reviewCards)
      .where(eq(schema.reviewCards.userId, uid()))
      .all()
      .map((c) => c.grammarPointId),
  );
  const dgps = database
    .select()
    .from(schema.deckGrammarPoints)
    .where(eq(schema.deckGrammarPoints.deckId, deckId))
    .all();
  const lessons = new Map<number, { lessonTitle: string; total: number; learned: number }>();
  for (const dgp of dgps) {
    const entry = lessons.get(dgp.lessonNumber) ?? {
      lessonTitle: lessonTitles.get(dgp.grammarPointId) ?? `Lesson ${dgp.lessonNumber}`,
      total: 0,
      learned: 0,
    };
    entry.total += 1;
    if (learnedIds.has(dgp.grammarPointId)) entry.learned += 1;
    lessons.set(dgp.lessonNumber, entry);
  }
  return [...lessons.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([lessonNumber, entry]) => ({ lessonNumber, ...entry }));
}

/** Grammar point ids learned in a lesson of a deck (for Custom Cram). */
export function getCramPointIdsForLesson(deckId: string, lessonNumber: number): string[] {
  const database = getDb();
  const learnedIds = new Set(
    database
      .select()
      .from(schema.reviewCards)
      .where(eq(schema.reviewCards.userId, uid()))
      .all()
      .map((c) => c.grammarPointId),
  );
  return database
    .select()
    .from(schema.deckGrammarPoints)
    .where(
      and(
        eq(schema.deckGrammarPoints.deckId, deckId),
        eq(schema.deckGrammarPoints.lessonNumber, lessonNumber),
      ),
    )
    .all()
    .map((d) => d.grammarPointId)
    .filter((id) => learnedIds.has(id));
}

/** A Cram queue: one cloze card per grammar point (the most-advanced card,
 * as in Reviews), shuffled, up to `limit`. The items reuse the review
 * queue shape so the quiz UI is shared — but a Cram session never calls
 * submitReview, so nothing here touches SRS state. */
export function getCramQueue(grammarPointIds: string[], limit: number): ReviewQueueItem[] {
  const database = getDb();
  const ids = [...grammarPointIds].sort(() => Math.random() - 0.5).slice(0, limit);
  const queue: ReviewQueueItem[] = [];
  for (const gpId of ids) {
    const gp = database
      .select()
      .from(schema.grammarPoints)
      .where(eq(schema.grammarPoints.id, gpId))
      .get();
    if (!gp) continue;
    const cards = database
      .select()
      .from(schema.clozeCards)
      .where(eq(schema.clozeCards.grammarPointId, gp.id))
      .all();
    if (cards.length === 0) continue;
    cards.sort((a, b) => b.introducedAtPosition - a.introducedAtPosition);
    const card = cards[0];
    const target = database
      .select()
      .from(schema.clozeCardGrammarTargets)
      .where(
        and(
          eq(schema.clozeCardGrammarTargets.clozeCardId, card.id),
          eq(schema.clozeCardGrammarTargets.grammarPointId, gp.id),
        ),
      )
      .get();
    queue.push({
      reviewCardId: `cram_${gpId}`,
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
      grammar: {
        title: gp.title,
        category: gp.category,
        tense: gp.tense,
        register: gp.register,
        hint: gp.hint,
        description: gp.description,
      },
      streakCorrect: 0,
      masteredAt: null,
      fsrsState: 0,
      stability: 0,
    });
  }
  return queue;
}

// ── Local accounts ───────────────────────────────────────────────────────────

export interface DbUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
}

export function countUsers(): number {
  return getDb().select().from(schema.users).all().length;
}

export function getUserByEmail(email: string): DbUser | null {
  const database = getDb();
  return (
    database.select().from(schema.users).where(eq(schema.users.email, email.trim().toLowerCase())).get() ?? null
  );
}

export function getUserById(id: string): DbUser | null {
  return getDb().select().from(schema.users).where(eq(schema.users.id, id)).get() ?? null;
}

/** The single account on this device, or null when there are zero or
 * several. Used to prefill the email form on a one-account device. */
export function getSoleUser(): DbUser | null {
  const all = getDb().select().from(schema.users).all();
  return all.length === 1 ? all[0] : null;
}

/**
 * Create an account from an email address only (email-code auth). The
 * username is derived from the email; a password is optional and added
 * later with setUserPassword (empty hash = no password set).
 */
export function createUserByEmail(email: string): DbUser {
  const database = getDb();
  const normalized = email.trim().toLowerCase();
  const user: DbUser = {
    id: newId('u'),
    username: usernameFromEmail(normalized),
    email: normalized,
    passwordHash: '',
    salt: '',
    createdAt: new Date().toISOString(),
  };
  database.insert(schema.users).values(user).run();
  return user;
}

/** A password is optional: an empty hash means "no password set". */
export function userHasPassword(user: DbUser): boolean {
  return user.passwordHash !== '';
}

/** Set (or change) the optional password for an account. */
export function setUserPassword(userId: string, password: string): void {
  const salt = generateSalt();
  getDb()
    .update(schema.users)
    .set({ passwordHash: hashPassword(password, salt), salt })
    .where(eq(schema.users.id, userId))
    .run();
}

/**
 * Move pre-auth data (keyed 'local') to a real account. Runs once, when the
 * first account is created — existing installs keep their progress.
 */
export function migrateLocalDataToUser(userId: string): void {
  const database = getDb();
  database.update(schema.reviewCards).set({ userId }).where(eq(schema.reviewCards.userId, LOCAL_USER_ID)).run();
  database.update(schema.reviewLogs).set({ userId }).where(eq(schema.reviewLogs.userId, LOCAL_USER_ID)).run();
  database
    .update(schema.userDeckProgress)
    .set({ userId })
    .where(eq(schema.userDeckProgress.userId, LOCAL_USER_ID))
    .run();
  database.update(schema.userStreaks).set({ userId }).where(eq(schema.userStreaks.userId, LOCAL_USER_ID)).run();
}

// ── Session (persisted login, stored in the local DB's meta table) ──────────

// Bumped to v2 on 2026-11-08: sessions remembered under the old key (when
// Remember Me defaulted on and signup always remembered) are not restored,
// so the login screen actually appears until the user opts back in.
const SESSION_META_KEY = 'sessionUserId:v2';

export function getSessionUserId(): string | null {
  const row = getDb().select().from(schema.meta).where(eq(schema.meta.key, SESSION_META_KEY)).get();
  return row?.value ?? null;
}

export function setSessionUserId(userId: string): void {
  const database = getDb();
  database
    .insert(schema.meta)
    .values({ key: SESSION_META_KEY, value: userId })
    .onConflictDoUpdate({ target: schema.meta.key, set: { value: userId } })
    .run();
}

export function clearSessionUserId(): void {
  getDb().delete(schema.meta).where(eq(schema.meta.key, SESSION_META_KEY)).run();
}

// ── Device trust (email-code auth) ──────────────────────────────────────────
// A device is a random id stored in the meta table (per browser profile).
// Verifying an email code (or logging in with the password) marks the
// device trusted for that user. Logging out stamps the trust row, starting
// the 30-minute grace: within it the same device auto-logs the user back
// in; past it (or on a never-trusted device) the email-code route is
// required again.

const DEVICE_ID_META_KEY = 'deviceId';
const LAST_USER_META_KEY = 'lastUserId';

function getMeta(key: string): string | null {
  const row = getDb().select().from(schema.meta).where(eq(schema.meta.key, key)).get();
  return row?.value ?? null;
}

function setMeta(key: string, value: string): void {
  getDb()
    .insert(schema.meta)
    .values({ key, value })
    .onConflictDoUpdate({ target: schema.meta.key, set: { value } })
    .run();
}

/** Stable per-device id; generated once and kept in the meta table. */
export function getOrCreateDeviceId(): string {
  const existing = getMeta(DEVICE_ID_META_KEY);
  if (existing) return existing;
  const id = `d_${generateSalt()}`;
  setMeta(DEVICE_ID_META_KEY, id);
  return id;
}

export function getLastUserId(): string | null {
  return getMeta(LAST_USER_META_KEY);
}

export function setLastUserId(userId: string): void {
  setMeta(LAST_USER_META_KEY, userId);
}

export interface DeviceTrust {
  userId: string;
  deviceId: string;
  lastVerifiedAt: string;
  lastLogoutAt: string | null;
}

export function getDeviceTrust(userId: string, deviceId: string): DeviceTrust | null {
  const row = getDb()
    .select()
    .from(schema.deviceTrust)
    .where(
      and(eq(schema.deviceTrust.userId, userId), eq(schema.deviceTrust.deviceId, deviceId)),
    )
    .get();
  return row ?? null;
}

/** Mark this device trusted for the user (clears any logout stamp). */
export function trustDevice(userId: string, deviceId: string): void {
  const database = getDb();
  const now = new Date().toISOString();
  // Delete + insert instead of onConflictDoUpdate: bulletproof on the
  // sync driver for the composite unique key.
  database
    .delete(schema.deviceTrust)
    .where(
      and(eq(schema.deviceTrust.userId, userId), eq(schema.deviceTrust.deviceId, deviceId)),
    )
    .run();
  database
    .insert(schema.deviceTrust)
    .values({ userId, deviceId, lastVerifiedAt: now, lastLogoutAt: null })
    .run();
}

/** Log out on this device: stamps the trust row, starting the grace. */
export function markDeviceLogout(userId: string, deviceId: string): void {
  getDb()
    .update(schema.deviceTrust)
    .set({ lastLogoutAt: new Date().toISOString() })
    .where(
      and(eq(schema.deviceTrust.userId, userId), eq(schema.deviceTrust.deviceId, deviceId)),
    )
    .run();
}

/** True when this trusted device may auto-log the user in without a fresh
 * code (never logged out, or logged out within the grace window). */
export function deviceMayAutoLogin(trust: DeviceTrust | null, nowMs: number = Date.now()): boolean {
  if (!trust) return false;
  return isLogoutGraceActive(trust.lastLogoutAt, nowMs);
}

// ── "I already know this" ────────────────────────────────────────────────────

/**
 * Mark a grammar point as known: create its review card already mastered
 * (never tested again) and advance deck progress past it. The point still
 * counts as learned.
 */
export function markPointKnown(deckId: string, grammarPointId: string): void {
  const database = getDb();
  const now = new Date();
  // One transaction = one OPFS fsync at COMMIT (see completeLearnSession).
  withTransaction(database, (tx) => {
    tx
      .insert(schema.reviewCards)
      .values({
        id: `rc_${uid()}_${grammarPointId}`,
        userId: uid(),
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
      })
      .onConflictDoNothing()
      .run();
    const dgp = tx
      .select()
      .from(schema.deckGrammarPoints)
      .where(and(eq(schema.deckGrammarPoints.deckId, deckId), eq(schema.deckGrammarPoints.grammarPointId, grammarPointId)))
      .get();
    if (!dgp) return;
    const progress = tx
      .select()
      .from(schema.userDeckProgress)
      .where(and(eq(schema.userDeckProgress.userId, uid()), eq(schema.userDeckProgress.deckId, deckId)))
      .get();
    if (progress) {
      tx
        .update(schema.userDeckProgress)
        .set({ lastLearnedIndex: Math.max(progress.lastLearnedIndex, dgp.sortOrder), lastStudiedAt: now.toISOString() })
        .where(eq(schema.userDeckProgress.id, progress.id))
        .run();
    } else {
      tx.insert(schema.userDeckProgress).values({
        id: `udp_${uid()}_${deckId}`,
        userId: uid(),
        deckId,
        lastLearnedIndex: dgp.sortOrder,
        lastStudiedAt: now.toISOString(),
      }).run();
    }
  });
}
