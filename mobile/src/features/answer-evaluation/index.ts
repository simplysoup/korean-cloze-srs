import authoredMetadata from '../../content/answer-feedback.json';
import { evaluateAnswer } from './evaluator';
import { createAnswerEvaluator } from './contract-adapter';
import type { AnswerFeedbackCatalog, EvaluateAnswerInput } from './types';

export { evaluateAnswer, normalizeKoreanAnswer } from './evaluator';
export { createAnswerEvaluator } from './contract-adapter';
export { AnswerFeedbackPanel } from './AnswerFeedbackPanel';
export type * from './types';

/** Bundled, deterministic editorial metadata. Safe to call from the review adapter. */
export const bundledAnswerEvaluator = createAnswerEvaluator(authoredMetadata as AnswerFeedbackCatalog);

export function evaluateGrammarAnswer(input: EvaluateAnswerInput) {
  return evaluateAnswer(input, authoredMetadata as AnswerFeedbackCatalog);
}
