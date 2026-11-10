import type { AnswerEvaluation, AnswerEvaluationRequest } from '../../contracts/answers';
import type { ReviewQueueItem } from '../../../store/types';
import type { completeLearnSession } from '../../../store/mutations';
import { createAnswerEvaluator } from '../contract-adapter';
import { evaluateAnswer, normalizeKoreanAnswer } from '../evaluator';
import type { AnswerEvaluationResult, AnswerFeedbackCatalog, CardAnswerMetadata } from '../types';

/** The actual objects consumed by the two live screens; runtime imports are type-only. */
export type ReviewAnswerItem = Pick<ReviewQueueItem,
  'clozeCardId' | 'grammarPointId' | 'sentenceWithBlank' | 'fullSentence' |
  'answers' | 'wordReplacement' | 'grammar'>;
export type LearnAnswerItem = Pick<ReturnType<typeof completeLearnSession>[number],
  'id' | 'grammarPointId' | 'sentenceWithBlank' | 'fullSentence' |
  'answer' | 'alternateAnswers' | 'grammar'>;

export type LiveAnswerSource =
  | { kind: 'review'; item: ReviewAnswerItem }
  | { kind: 'learn'; item: LearnAnswerItem };

export type BridgeUnavailableReason =
  | 'missing_exercise_id' | 'missing_grammar_point_id' | 'missing_sentence_context'
  | 'missing_full_sentence' | 'missing_authored_metadata' | 'missing_canonical_answer'
  | 'stale_grammar_point' | 'stale_sentence_context' | 'stale_full_sentence'
  | 'stale_canonical_answer' | 'stale_accepted_alternatives'
  | 'unsupported_blank_count' | 'unsupported_target_count' | 'unsupported_submission_count';

export interface AnswerBridgeDiagnostics {
  /** The old Boolean grader accepts these, but no authored target-equivalence exists. */
  unvettedLegacyAnswers: readonly string[];
  educatorReview: 'pending' | 'unknown';
}

export type PreparedAnswerRequest =
  | { status: 'ready'; request: AnswerEvaluationRequest; diagnostics: AnswerBridgeDiagnostics }
  | { status: 'unavailable'; reason: BridgeUnavailableReason; diagnostics: AnswerBridgeDiagnostics };

function equalSurface(a: string, b: string): boolean {
  return normalizeKoreanAnswer(a) === normalizeKoreanAnswer(b);
}

/**
 * Build a request from real screen data, cross-checking the immutable editorial catalogue.
 * Never infer a canonical answer from a review array or a word replacement.
 * Single-blank only until a per-blank authored target/mapping contract exists.
 */
export function prepareLiveAnswerRequest(
  source: LiveAnswerSource,
  submittedAnswers: readonly string[],
  catalog: AnswerFeedbackCatalog,
): PreparedAnswerRequest {
  const item = source.item;
  const exerciseId = source.kind === 'review' ? source.item.clozeCardId : source.item.id;
  const card = exerciseId ? catalog.cards[exerciseId] : undefined;
  const emptyDiagnostics: AnswerBridgeDiagnostics = {
    unvettedLegacyAnswers: [], educatorReview: card?.educatorReview ?? 'unknown',
  };
  const unavailable = (reason: BridgeUnavailableReason): PreparedAnswerRequest =>
    ({ status: 'unavailable', reason, diagnostics: emptyDiagnostics });
  if (!exerciseId?.trim()) return unavailable('missing_exercise_id');
  if (!item.grammarPointId?.trim()) return unavailable('missing_grammar_point_id');
  if (!item.sentenceWithBlank?.trim()) return unavailable('missing_sentence_context');
  if (!item.fullSentence?.trim()) return unavailable('missing_full_sentence');
  if (!card) return unavailable('missing_authored_metadata');
  if (!card.canonicalAnswer?.trim()) return unavailable('missing_canonical_answer');
  if (item.sentenceWithBlank.split('___').length !== 2) return unavailable('unsupported_blank_count');
  // The current screen/store shapes hold ONE grammar target. A future multi-target
  // screen must supply an explicit per-blank mapping, not duplicate this target.
  if (item.grammarPointId.trim().split(/\s*,\s*/u).length !== 1) return unavailable('unsupported_target_count');
  if (submittedAnswers.length !== 1) return unavailable('unsupported_submission_count');
  if (card.grammarPointId !== item.grammarPointId) return unavailable('stale_grammar_point');
  if (!equalSurface(card.sentenceWithBlank, item.sentenceWithBlank)) return unavailable('stale_sentence_context');
  if (!equalSurface(card.fullSentence, item.fullSentence)) return unavailable('stale_full_sentence');

  const legacyAnswers = source.kind === 'review'
    ? source.item.answers
    : [source.item.answer, ...source.item.alternateAnswers];
  const canonicalOnScreen = source.kind === 'review'
    ? source.item.answers.some((answer) => equalSurface(answer, card.canonicalAnswer))
    : equalSurface(source.item.answer, card.canonicalAnswer);
  if (!canonicalOnScreen) return unavailable('stale_canonical_answer');
  if (!card.acceptedAlternatives.every((alt) => legacyAnswers.some((answer) => equalSurface(answer, alt.value)))) {
    return unavailable('stale_accepted_alternatives');
  }
  const curated = [card.canonicalAnswer, ...card.acceptedAlternatives.map((alt) => alt.value)];
  const diagnostics: AnswerBridgeDiagnostics = {
    unvettedLegacyAnswers: legacyAnswers.filter((answer) =>
      !curated.some((accepted) => equalSurface(accepted, answer))),
    educatorReview: card.educatorReview,
  };
  const request: AnswerEvaluationRequest = {
    exerciseId,
    targetGrammarIds: [item.grammarPointId],
    canonicalAnswer: card.canonicalAnswer,
    acceptedAlternatives: card.acceptedAlternatives.map((alt) => ({
      answer: alt.value, note: alt.explanation,
    })),
    submittedAnswer: submittedAnswers[0],
    sentenceContext: item.sentenceWithBlank,
    register: item.grammar.register,
    tense: item.grammar.tense,
  };
  return { status: 'ready', request, diagnostics };
}

function abstention(exerciseId: string, submittedAnswer: string, card?: CardAnswerMetadata, reason?: string): AnswerEvaluationResult {
  return {
    cardId: exerciseId,
    submittedAnswer,
    normalizedAnswer: normalizeKoreanAnswer(submittedAnswer),
    expectedCanonicalAnswer: card?.canonicalAnswer ?? null,
    curatedAlternatives: card?.acceptedAlternatives ?? [],
    targetGrammarPointId: card?.grammarPointId ?? null,
    classification: 'unclassified', targetMasteryEligible: false,
    feedback: reason ?? 'This response has not been classified. No target mastery or negative review has been recorded.',
    relevantAlternativeForms: card ? [card.canonicalAnswer, ...card.acceptedAlternatives.map((alt) => alt.value)] : [],
    errorCategory: null, sentenceStatus: 'not_assessed', editorialReview: card?.educatorReview ?? 'unknown',
  };
}

export type LiveAnswerEvaluation =
  | { status: 'evaluated'; request: AnswerEvaluationRequest; evaluation: AnswerEvaluation;
      feedback: AnswerEvaluationResult; diagnostics: AnswerBridgeDiagnostics }
  | { status: 'unavailable'; reason: BridgeUnavailableReason; feedback: AnswerEvaluationResult;
      diagnostics: AnswerBridgeDiagnostics };

/**
 * The existing deterministic evaluator calls unrecognized nonempty Korean "incorrect"
 * meaning not in the accepted set. That is insufficient evidence for a *negative*
 * review; in the live bridge we abstain instead. Empty/punctuation-only submissions
 * are demonstrably not answers to a Korean cloze and remain incorrect.
 */
export function evaluateLiveAnswer(
  source: LiveAnswerSource,
  submittedAnswers: readonly string[],
  catalog: AnswerFeedbackCatalog,
): LiveAnswerEvaluation {
  const prepared = prepareLiveAnswerRequest(source, submittedAnswers, catalog);
  if (prepared.status === 'unavailable') {
    const exerciseId = source.kind === 'review' ? source.item.clozeCardId : source.item.id;
    const reason = 'Cannot safely evaluate this card (' + prepared.reason + '). The content or screen contract needs review.';
    return {
      ...prepared,
      feedback: abstention(exerciseId ?? '', submittedAnswers.join(' | '), undefined, reason),
    };
  }
  const { request } = prepared;
  const contract = createAnswerEvaluator(catalog).evaluate(request);
  const raw = evaluateAnswer({ cardId: request.exerciseId, submittedAnswer: request.submittedAnswer,
    grammarPointId: request.targetGrammarIds[0] }, catalog);
  // Reject a stale or future evaluator mismatch instead of trusting one side.
  if (contract.outcome !== raw.classification || contract.targetMasteryEligible !== raw.targetMasteryEligible) {
    const feedback = abstention(request.exerciseId, request.submittedAnswer, catalog.cards[request.exerciseId],
      'Evaluator contracts disagree; this response is awaiting editorial/engineering review.');
    return { status: 'evaluated', request, diagnostics: prepared.diagnostics,
      feedback, evaluation: { outcome: 'unclassified', targetMasteryEligible: false,
        canonicalAnswer: request.canonicalAnswer, acceptedAlternatives: request.acceptedAlternatives,
        explanation: feedback.feedback, retryAllowed: false } };
  }
  if (raw.classification === 'incorrect' && /[\p{L}\p{N}]/u.test(raw.normalizedAnswer)) {
    const feedback: AnswerEvaluationResult = {
      ...raw, classification: 'unclassified', targetMasteryEligible: false,
      feedback: 'This form is not yet classified for this exact sentence. It may be valid Korean; no review grade is recorded. Educator review is pending.',
    };
    return { status: 'evaluated', request, diagnostics: prepared.diagnostics,
      feedback, evaluation: { ...contract, outcome: 'unclassified', targetMasteryEligible: false,
        retryAllowed: false, explanation: feedback.feedback } };
  }
  return { status: 'evaluated', request, evaluation: contract, feedback: raw,
    diagnostics: prepared.diagnostics };
}
