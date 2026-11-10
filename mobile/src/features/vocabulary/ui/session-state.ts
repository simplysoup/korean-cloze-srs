import type { VocabAnswerReveal, VocabPrompt, VocabReviewResult } from '../contracts';
import type { VocabularyMode } from './presentation';

export type SessionPhase = 'introduction' | 'question' | 'feedback' | 'complete';
export type SessionFeedback =
  | { kind: 'graded'; result: VocabReviewResult }
  | { kind: 'revealed'; result: VocabAnswerReveal };

export interface VocabularySessionState {
  key: string;
  deckId: string | null;
  mode: VocabularyMode;
  prompts: readonly VocabPrompt[];
  index: number;
  phase: SessionPhase;
  feedback: SessionFeedback | null;
  attempts: number;
  correct: number;
  nearMiss: number;
  missedPromptIds: readonly string[];
}

export function sessionKey(mode: VocabularyMode, deckId: string | null): string {
  return mode + ':' + (deckId ?? 'all');
}

export function createSession(
  mode: VocabularyMode,
  deckId: string | null,
  prompts: readonly VocabPrompt[],
): VocabularySessionState {
  return {
    key: sessionKey(mode, deckId), deckId, mode, prompts, index: 0,
    phase: prompts.length === 0 ? 'complete' : mode === 'learn' ? 'introduction' : 'question',
    feedback: null, attempts: 0, correct: 0, nearMiss: 0, missedPromptIds: [],
  };
}

export function currentPrompt(state: VocabularySessionState): VocabPrompt | null {
  return state.prompts[state.index] ?? null;
}

export function withFeedback(
  state: VocabularySessionState,
  feedback: SessionFeedback,
): VocabularySessionState {
  if (state.phase !== 'question') return state;
  const prompt = currentPrompt(state);
  if (!prompt) return state;
  const outcome = feedback.kind === 'graded'
    ? feedback.result.evaluation.outcome
    : 'incorrect';
  const wasCorrect = outcome === 'target_correct';
  return {
    ...state, phase: 'feedback', feedback,
    attempts: state.attempts + (feedback.kind === 'graded' ? 1 : 0),
    correct: state.correct + (wasCorrect ? 1 : 0),
    nearMiss: state.nearMiss + (outcome === 'near_miss' ? 1 : 0),
    missedPromptIds: !wasCorrect && !state.missedPromptIds.includes(prompt.id)
      ? [...state.missedPromptIds, prompt.id]
      : state.missedPromptIds,
  };
}

export function retryNearMiss(state: VocabularySessionState): VocabularySessionState {
  if (
    state.phase !== 'feedback' ||
    state.feedback?.kind !== 'graded' ||
    !state.feedback.result.evaluation.retryAllowed ||
    state.feedback.result.evaluation.outcome !== 'near_miss'
  ) return state;
  return { ...state, phase: 'question', feedback: null };
}

export function advanceSession(state: VocabularySessionState): VocabularySessionState {
  if (state.phase === 'introduction') {
    return { ...state, phase: 'question' };
  }
  if (state.phase !== 'feedback') return state;
  const next = state.index + 1;
  return {
    ...state,
    index: next,
    feedback: null,
    phase: next >= state.prompts.length
      ? 'complete'
      : state.mode === 'learn' ? 'introduction' : 'question',
  };
}

export function repeatMissed(state: VocabularySessionState): VocabularySessionState {
  const ids = new Set(state.missedPromptIds);
  const missed = state.prompts.filter((prompt) => ids.has(prompt.id));
  return createSession('missed', state.deckId, missed);
}
