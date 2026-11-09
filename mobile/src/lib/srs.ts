// Pure SRS logic — ported from the old app's
// src/routes/api/reviews/+server.ts and check/+server.ts.
// No database or native imports here, so this file is unit-testable in Jest.
import { createEmptyCard, fsrs, type Card } from 'ts-fsrs';

export type Grade = 1 | 2 | 3 | 4;

export interface FsrsState {
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: number; // 0 New, 1 Learning, 2 Review, 3 Relearning (ts-fsrs State)
  due: Date;
  lastReview: Date | null;
  streakCorrect: number;
  masteredAt: Date | null;
  peakStability: number;
}

export function newFsrsState(now: Date): FsrsState {
  const card = createEmptyCard(now);
  return {
    stability: card.stability,
    difficulty: card.difficulty,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    due: card.due,
    lastReview: null,
    streakCorrect: 0,
    masteredAt: null,
    peakStability: 0,
  };
}

export interface FsrsReviewResult {
  state: FsrsState;
  log: { rating: Grade; stability: number; difficulty: number; elapsedDays: number; scheduledDays: number };
}

/**
 * Port of POST /api/reviews: run one FSRS step, plus the mastery layer
 * (8 correct in a row masters a grammar point) and peak-stability tracking.
 * `rating` 1 = Again, 2 = Hard, 3 = Good, 4 = Easy.
 */
export function computeFsrsReview(prev: FsrsState, rating: Grade, now: Date): FsrsReviewResult {
  const scheduler = fsrs();
  const card: Card = {
    due: prev.due,
    stability: prev.stability,
    difficulty: prev.difficulty,
    scheduled_days: 0,
    reps: prev.reps,
    lapses: prev.lapses,
    state: prev.state as Card['state'],
    last_review: prev.lastReview ?? undefined,
    learning_steps: 0,
  };
  const elapsedDays = prev.lastReview
    ? (now.getTime() - prev.lastReview.getTime()) / 86_400_000
    : 0;
  // ts-fsrs v6: `next` returns the single RecordLogItem for a grade
  // (repeat/preview are deprecated and their index type is awkward).
  const result = scheduler.next(card, now, rating);
  const updated = result.card;
  const isCorrect = rating >= 3;
  const streakCorrect = isCorrect ? prev.streakCorrect + 1 : 0;
  const masteredAt = streakCorrect >= 8 && prev.masteredAt === null ? now : prev.masteredAt;
  return {
    state: {
      stability: updated.stability,
      difficulty: updated.difficulty,
      reps: updated.reps,
      lapses: updated.lapses,
      state: updated.state,
      due: updated.due,
      lastReview: now,
      streakCorrect,
      masteredAt,
      peakStability: Math.max(prev.peakStability, updated.stability),
    },
    log: {
      rating,
      stability: updated.stability,
      difficulty: updated.difficulty,
      elapsedDays,
      scheduledDays: updated.scheduled_days,
    },
  };
}

/**
 * Port of POST /api/reviews/check: every submitted blank must exactly
 * match one of the correct answers (after trimming). No close-answer /
 * Levenshtein handling in this increment — that is a listed next step.
 */
export function checkAnswers(submitted: string[], correctAnswers: string[]): boolean {
  if (submitted.length === 0) return false;
  return submitted.every((a) =>
    correctAnswers.some((ca) => normalizeAnswer(ca) === normalizeAnswer(a)),
  );
}

/**
 * Port of the old app's answers.ts (Codex Level 1 patch): normalize
 * before comparing, so a stray space or a decomposed Hangul sequence
 * does not fail an otherwise-correct answer. The Expo input is already
 * Hangul (roman input converts live), so there is no roman mode here.
 */
export function normalizeAnswer(input: string): string {
  return input.normalize('NFC').trim().replace(/\s+/g, ' ');
}

/**
 * Port of answers.ts answerExplanation: a targeted hint for the most
 * common confusions, shown after a wrong answer. Returns undefined when
 * there is no specific explanation for this point/answer.
 */
export function answerExplanation(
  grammarPointId: string,
  expected: string,
  input: string,
): string | undefined {
  const typed = normalizeAnswer(input);
  const particle = ['에', '에서'].find((p) => typed === p);
  if (grammarPointId === 'gp_eseo' && expected === '에서') {
    return particle === '에'
      ? '에 can mark a destination or where something is. This sentence says where an action happens, so use 에서.'
      : '에서 marks where the action happens. Compare 도서관에서 공부해요 (study at the library) with 도서관에 가요 (go to the library).';
  }
  if (grammarPointId === 'gp_e_loc' && expected === '에') {
    return particle === '에서'
      ? '에서 can mark where an action happens. Here 에 marks a destination or where something is.'
      : '에 marks a destination or where something is. Use 에서 for the place where an action happens.';
  }
  const forms: Record<string, [string, string]> = {
    gp_eun_neun: ['은', '는'],
    gp_i_ga: ['이', '가'],
    gp_eul_reul: ['을', '를'],
    gp_ieyo_yeyo: ['이에요', '예요'],
  };
  const pair = forms[grammarPointId];
  if (pair && pair.includes(expected)) {
    const [consonant, vowel] = pair;
    return `Use ${consonant} after a noun ending in a consonant (받침) and ${vowel} after a noun ending in a vowel.`;
  }
  return undefined;
}

/** Correct answers for a cloze card: target word replacement (if any), answer, alternates — deduped. */
export function correctAnswersForCard(
  card: { answer: string; alternateAnswers: string[] },
  wordReplacement?: string,
): string[] {
  return [...new Set([wordReplacement, card.answer, ...card.alternateAnswers].filter((a): a is string => Boolean(a)))];
}

/** Rating implied by a check, as in the old app: correct → Good (3), wrong → Again (1). */
export function ratingForCheck(correct: boolean): Grade {
  return correct ? 3 : 1;
}

export function formatNextReview(due: Date | null, now: Date = new Date()): string {
  if (!due) return '';
  const diffMin = Math.round((due.getTime() - now.getTime()) / 60_000);
  if (diffMin < 1) return 'less than a minute';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'}`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'}`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay} day${diffDay === 1 ? '' : 's'}`;
}

/**
 * Bunpro-style SRS rank label for a review card, from its FSRS state and
 * stability (in days). Bands are a simple, honest mapping — not Bunpro's
 * exact thresholds, which are not public:
 *   New → "New", Learning/Relearning → "Beginner I",
 *   Review → Beginner II–IV, then Seasoned I–III by stability, then Master.
 * A card mastered by 8 correct answers in a row is always "Master".
 */
export function srsRankLabel(state: number, stabilityDays: number, mastered: boolean): string {
  if (mastered) return 'Master';
  if (state === 0) return 'New';
  if (state === 1 || state === 3) return 'Beginner I';
  if (stabilityDays < 3) return 'Beginner II';
  if (stabilityDays < 7) return 'Beginner III';
  if (stabilityDays < 14) return 'Beginner IV';
  if (stabilityDays < 30) return 'Seasoned I';
  if (stabilityDays < 90) return 'Seasoned II';
  if (stabilityDays < 180) return 'Seasoned III';
  return 'Master';
}

/** Bunpro-style SRS stage from FSRS state + stability (days). Used by the
 * dashboard Progress card and Cram's quick counts. The thresholds sit in
 * the same ballpark as Bunpro's intervals (Adept 2/4/8 days, Seasoned
 * 12/24/48 days, Expert 3/6 months) — stability is the FSRS interval, so
 * it is the honest analogue. */
export type SrsStage = 'beginner' | 'adept' | 'seasoned' | 'expert' | 'master';

export function stageForCard(state: number, stabilityDays: number, mastered: boolean): SrsStage {
  if (mastered || stabilityDays >= 180) return 'master';
  if (state === 0 || state === 1 || state === 3 || stabilityDays < 1) return 'beginner';
  if (stabilityDays < 7) return 'adept';
  if (stabilityDays < 30) return 'seasoned';
  return 'expert';
}

