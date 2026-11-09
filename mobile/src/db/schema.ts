// Drizzle schema for the local SQLite database (expo-sqlite driver).
// Mirrors prisma/schema.prisma from the old app, minus the server/auth
// tables (User/Session/Account/Verification) — v1 is offline-first with a
// single local user, no auth/server yet. See mobile/README.md.
import { integer, real, text, sqliteTable, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const grammarPoints = sqliteTable('grammar_points', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  tense: text('tense'),
  register: text('register'),
  hint: text('hint').notNull(),
  description: text('description').notNull(),
  level: integer('level').notNull().default(1),
  tags: text('tags').notNull().default('[]'), // JSON string[]
  structurePattern: text('structure_pattern'),
  notes: text('notes'), // JSON NoteSeed[] | null
  relatedPointIds: text('related_point_ids').notNull().default('[]'), // JSON string[]
  lessonNumber: integer('lesson_number').notNull(),
  position: integer('position').notNull(), // global curriculum position, 1-based
});

export const clozeCards = sqliteTable('cloze_cards', {
  id: text('id').primaryKey(),
  grammarPointId: text('grammar_point_id').notNull(),
  fullSentence: text('full_sentence').notNull(),
  sentenceWithBlank: text('sentence_with_blank').notNull(),
  vocabBaseForm: text('vocab_base_form').notNull(),
  answer: text('answer').notNull(),
  alternateAnswers: text('alternate_answers').notNull().default('[]'), // JSON string[]
  englishHint: text('english_hint').notNull().default('""'), // JSON string
  introducedAtPosition: integer('introduced_at_position').notNull().default(0),
});

export const clozeCardGrammarTargets = sqliteTable('cloze_card_grammar_targets', {
  id: text('id').primaryKey(),
  clozeCardId: text('cloze_card_id').notNull(),
  grammarPointId: text('grammar_point_id').notNull(),
  wordReplacement: text('word_replacement').notNull(),
  blankIndex: integer('blank_index').notNull().default(0),
}, (t) => [uniqueIndex('cloze_card_grammar_target_unique').on(t.clozeCardId, t.grammarPointId)]);

export const lessonExamples = sqliteTable('lesson_examples', {
  id: text('id').primaryKey(),
  grammarPointId: text('grammar_point_id').notNull(),
  fullSentence: text('full_sentence').notNull(),
  sentenceWithBlank: text('sentence_with_blank').notNull(),
  answer: text('answer').notNull(),
  englishHint: text('english_hint').notNull().default('""'), // JSON string
  order: integer('order').notNull().default(0),
  notes: text('notes'),
});

export const reviewCards = sqliteTable('review_cards', {
  id: text('id').primaryKey(),
  // Single local user in v1; userId is kept for a future sync/auth layer.
  userId: text('user_id').notNull().default('local'),
  grammarPointId: text('grammar_point_id').notNull(),
  stability: real('stability').notNull().default(0),
  difficulty: real('difficulty').notNull().default(0),
  reps: integer('reps').notNull().default(0),
  lapses: integer('lapses').notNull().default(0),
  state: integer('state').notNull().default(0),
  due: text('due').notNull(), // ISO date string
  lastReview: text('last_review'),
  streakCorrect: integer('streak_correct').notNull().default(0),
  masteredAt: text('mastered_at'),
  peakStability: real('peak_stability').notNull().default(0),
  lastClozeCardId: text('last_cloze_card_id'),
}, (t) => [uniqueIndex('review_card_user_gp_unique').on(t.userId, t.grammarPointId)]);

export const reviewLogs = sqliteTable('review_logs', {
  id: text('id').primaryKey(),
  reviewCardId: text('review_card_id').notNull(),
  userId: text('user_id').notNull().default('local'),
  rating: integer('rating').notNull(),
  reviewedAt: text('reviewed_at').notNull(), // ISO date string
  stability: real('stability').notNull(),
  difficulty: real('difficulty').notNull(),
  elapsedDays: real('elapsed_days').notNull(),
  scheduledDays: real('scheduled_days').notNull(),
});

export const decks = sqliteTable('decks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  description: text('description').notNull().default(''),
  level: integer('level').notNull().default(1),
  topikLevel: text('topik_level').notNull().default('topik1-1'),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const deckGrammarPoints = sqliteTable('deck_grammar_points', {
  id: text('id').primaryKey(),
  deckId: text('deck_id').notNull(),
  grammarPointId: text('grammar_point_id').notNull(),
  sortOrder: integer('sort_order').notNull(),
  lessonNumber: integer('lesson_number').notNull(),
}, (t) => [uniqueIndex('deck_gp_unique').on(t.deckId, t.grammarPointId)]);

/** The user's library: the decks they chose to run. Learn, Review, and
 * Cram pull from all library decks in dependency order (deck sortOrder,
 * then curriculum position), deduped by grammar point. A deck with no
 * content cannot be added. */
export const libraryDecks = sqliteTable('library_decks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default('local'),
  deckId: text('deck_id').notNull(),
  addedAt: text('added_at').notNull(),
}, (t) => [uniqueIndex('library_decks_unique').on(t.userId, t.deckId)]);

/** Legacy: per-deck learn progress (last learned index). Superseded by
 * the library model — "learned" is now "has a review card" — and no
 * longer written to. Kept so existing devices need no migration. */
export const userDeckProgress = sqliteTable('user_deck_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default('local'),
  deckId: text('deck_id').notNull(),
  lastLearnedIndex: integer('last_learned_index').notNull().default(-1),
  lastStudiedAt: text('last_studied_at'),
}, (t) => [uniqueIndex('user_deck_progress_unique').on(t.userId, t.deckId)]);

export const userStreaks = sqliteTable('user_streaks', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default('local'),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastStudiedDate: text('last_studied_date'), // YYYY-MM-DD
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  email: text('email').notNull(),
  // Password is optional (email-code auth is the preferred route): an empty
  // hash means "no password set". Never NULL in the raw DDL, so existing
  // installs need no migration.
  passwordHash: text('password_hash').notNull(),
  salt: text('salt').notNull(),
  createdAt: text('created_at').notNull(), // ISO date string
}, (t) => [uniqueIndex('users_email_unique').on(t.email)]);

/** Devices a user has verified by email code. A row means "this device has
 * proven it can read this user's email". Logging out stamps lastLogoutAt
 * (starting the 30-minute grace); verifying again clears it. */
export const deviceTrust = sqliteTable('device_trust', {
  userId: text('user_id').notNull(),
  deviceId: text('device_id').notNull(),
  lastVerifiedAt: text('last_verified_at').notNull(), // ISO date string
  lastLogoutAt: text('last_logout_at'), // ISO date string | null
}, (t) => [uniqueIndex('device_trust_user_device_unique').on(t.userId, t.deviceId)]);

export const meta = sqliteTable('meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
