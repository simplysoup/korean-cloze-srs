import type { AnswerEvaluation, AcceptedAnswerAlternative } from '../contracts/answers';
import type { ContentReadiness } from '../contracts/practice';

/** Vocabulary IDs are immutable lexical entry IDs, NEVER grammar point IDs. */
export type VocabEntryId = string;
export type VocabDeckId = string;
export type VocabSessionMode = 'learn' | 'review' | 'cram';
export type VocabPromptDirection = 'korean_to_english' | 'english_to_korean' | 'context';

export interface VocabDeckSummary {
  id: VocabDeckId;
  title: string;
  description: string;
  sortOrder: number;
  totalEntries: number;
  learnedEntries: number;
  dueEntries: number;
  contentReadiness: ContentReadiness;
}

export interface VocabPrompt {
  /** Stable, opaque prompt ID; do not use an array index. */
  id: string;
  entryId: VocabEntryId;
  deckId: VocabDeckId;
  mode: VocabSessionMode;
  direction: VocabPromptDirection;
  cue: string;
  contextKorean?: string;
  contextEnglish?: string;
  canonicalAnswer: string;
  acceptedAlternatives: readonly AcceptedAnswerAlternative[];
  explanation: string;
  contentReadiness: ContentReadiness;
}

export type VocabLearningState = 'new' | 'learning' | 'review' | 'relearning' | 'mastered';

export interface VocabProgress {
  entryId: VocabEntryId;
  deckId: VocabDeckId;
  state: VocabLearningState;
  dueAt: string | null;
  lastReviewedAt: string | null;
  reviewCount: number;
  lapseCount: number;
  stability: number;
  difficulty: number;
}

export interface VocabReviewResult {
  promptId: string;
  entryId: VocabEntryId;
  evaluation: AnswerEvaluation;
  attemptedAt: string;
  /** Null if not eligible for a schedule update or not persisted. */
  progress: VocabProgress | null;
}

export interface VocabAnswerReveal {
  promptId: string;
  canonicalAnswer: string;
  acceptedAlternatives: readonly AcceptedAnswerAlternative[];
  explanation: string;
  /** Reveal does not count as successful recall or mastery. */
  awardsMastery: false;
}

/**
 * Interface version 1. Any signature change requires lead review before
 * specialist branches merge. Promise-based so persistent implementations
 * may be async; callers must handle offline and auth errors explicitly.
 */
export interface VocabController {
  listDecks(): Promise<readonly VocabDeckSummary[]>;
  getSession(mode: VocabSessionMode, limit: number): Promise<readonly VocabPrompt[]>;
  submitAnswer(promptId: string, answer: string): Promise<VocabReviewResult>;
  revealAnswer(promptId: string): Promise<VocabAnswerReveal>;
  getProgress(deckId: VocabDeckId): Promise<readonly VocabProgress[]>;
}
