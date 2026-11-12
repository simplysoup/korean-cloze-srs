import type {
  AnswerEvaluation,
  AnswerEvaluationRequest,
  AnswerEvaluator,
  AnswerErrorType,
} from '../contracts/answers';
import { evaluateAnswer, normalizeKoreanAnswer } from './evaluator';
import type { AnswerFeedbackCatalog, ErrorCategory } from './types';

const ERROR_MAP: Record<ErrorCategory, AnswerErrorType> = {
  tense: 'tense',
  register: 'register',
  honorific: 'honorific',
  particle: 'construction',
  irregular: 'irregular_inflection',
  aspect: 'aspect',
  perspective: 'meaning',
};

/**
 * Bridge to Agent 00's frozen contract. This does NOT grade or persist reviews.
 * Verify the request against our static snapshot before trusting its card ID.
 */
export function createAnswerEvaluator(catalog: AnswerFeedbackCatalog): AnswerEvaluator {
  return {
    evaluate(request: AnswerEvaluationRequest): AnswerEvaluation {
      const card = catalog.cards[request.exerciseId];
      const contextMatches = card && [card.sentenceWithBlank, card.fullSentence]
        .some((context) => normalizeKoreanAnswer(context) === normalizeKoreanAnswer(request.sentenceContext));
      const alternativesMatch = card &&
        request.acceptedAlternatives.length === card.acceptedAlternatives.length &&
        request.acceptedAlternatives.every((alt) => card.acceptedAlternatives.some(
          (curated) => normalizeKoreanAnswer(alt.answer) === normalizeKoreanAnswer(curated.value),
        ));
      const metadataMatches = Boolean(card &&
        request.targetGrammarIds.includes(card.grammarPointId) &&
        normalizeKoreanAnswer(request.canonicalAnswer) === normalizeKoreanAnswer(card.canonicalAnswer) &&
        contextMatches && alternativesMatch);

      const judgement = metadataMatches
        ? evaluateAnswer({
            cardId: request.exerciseId,
            submittedAnswer: request.submittedAnswer,
            grammarPointId: card?.grammarPointId,
          }, catalog)
        : evaluateAnswer({ cardId: request.exerciseId, submittedAnswer: request.submittedAnswer }, {
            ...catalog,
            cards: {},
          });
      const common = {
        canonicalAnswer: card?.canonicalAnswer ?? request.canonicalAnswer,
        acceptedAlternatives: (card?.acceptedAlternatives ?? []).map((alt) => ({
          answer: alt.value,
          note: alt.explanation,
        })),
        explanation: judgement.feedback,
        ...(judgement.errorCategory ? { errorType: ERROR_MAP[judgement.errorCategory] } : {}),
        retryAllowed: judgement.classification === 'near_miss' ||
          judgement.classification === 'valid_off_target',
      };
      if (judgement.classification === 'target_correct') {
        return { ...common, outcome: 'target_correct', targetMasteryEligible: true };
      }
      return {
        ...common,
        outcome: judgement.classification,
        targetMasteryEligible: false,
      };
    },
  };
}
