import type { AnswerOutcome } from '../../contracts/answers';
import { reviewActionForOutcome, type AnswerAction } from './policy';

/** Pure per-presentation state. A cycled or retried card starts a NEW attempt. */
export interface AnswerAttempt {
  exerciseId: string;
  submitted: boolean;
  revealed: boolean;
  outcome: AnswerOutcome | null;
  commitPending: boolean;
  committed: boolean;
}

export function beginAnswerAttempt(exerciseId: string): AnswerAttempt {
  return { exerciseId, submitted: false, revealed: false, outcome: null, commitPending: false, committed: false };
}

/** First submit wins until an explicit undo/retry; repeated taps do nothing. */
export function submitAnswerAttempt(state: AnswerAttempt, outcome: AnswerOutcome): AnswerAttempt {
  if (state.submitted || state.revealed || state.commitPending || state.committed) return state;
  return { ...state, submitted: true, outcome };
}

/** Reveal always fails the target test, even if a previously typed answer matched. */
export function revealAnswerAttempt(state: AnswerAttempt): AnswerAttempt {
  if (state.revealed || state.commitPending || state.committed) return state;
  return { ...state, revealed: true, submitted: true, outcome: null };
}

/** Undo/retry is an in-memory edit only; no persistent SRS mutation. */
export function undoAnswerAttempt(state: AnswerAttempt): AnswerAttempt {
  if (!state.submitted || state.revealed || state.commitPending || state.committed) return state;
  return { ...state, submitted: false, outcome: null };
}

export interface ReviewCommitIntent {
  exerciseId: string;
  grade: 1 | 3;
  recycleMiss: boolean;
}

/** Do not call submitReview until this function returns an intent. */
export function prepareReviewCommit(state: AnswerAttempt): {
  state: AnswerAttempt; intent: ReviewCommitIntent | null; disposition: AnswerAction | null;
} {
  if (!state.submitted || state.commitPending || state.committed) {
    return { state, intent: null, disposition: null };
  }
  const action = reviewActionForOutcome(state.outcome ?? 'unclassified', state.revealed);
  if (action.action !== 'record_review') return { state, intent: null, disposition: action };
  return {
    state: { ...state, commitPending: true }, disposition: action,
    intent: { exerciseId: state.exerciseId, grade: action.grade as 1 | 3,
      recycleMiss: action.recycleMiss },
  };
}

/** Call after submitReview succeeds or fails. Failed persistence can be retried. */
export function settleReviewCommit(state: AnswerAttempt, succeeded: boolean): AnswerAttempt {
  if (!state.commitPending) return state;
  return { ...state, commitPending: false, committed: succeeded };
}
