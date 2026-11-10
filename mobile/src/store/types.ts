// Shared types for the web store — copied from db/index.ts so the
// web bundle never imports the DB module (which pulls in expo-sqlite).
// Keep in sync with db/index.ts when the shapes change.

export const DAILY_NEW_LIMIT = 5;

export interface ReviewQueueItem {
  reviewCardId: string;
  clozeCardId: string;
  grammarPointId: string;
  fullSentence: string;
  sentenceWithBlank: string;
  vocabBaseForm: string;
  answers: string[];
  wordReplacement: string;
  englishHint: string;
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
  /** Decks in the user's library (0 = they haven't added one yet). */
  libraryCount: number;
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
  inLibrary: boolean;
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

export interface LearnSession {
  /** True when every point in the library has been learned. */
  deckComplete: boolean;
  /** True when the library is empty — no decks added yet. */
  libraryEmpty: boolean;
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

export type CramSetKind = 'masters' | 'reviews' | 'ghosts' | 'difficult';

export interface CramCounts {
  masters: number;
  reviews: number;
  ghosts: number;
  difficult: number;
}

export interface CramLessonRow {
  deckId: string;
  deckTitle: string;
  lessonNumber: number;
  lessonTitle: string;
  learned: number;
  total: number;
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