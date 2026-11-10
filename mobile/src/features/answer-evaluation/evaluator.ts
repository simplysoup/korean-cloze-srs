import type {
  AnswerEvaluationResult,
  AnswerFeedbackCatalog,
  CardAnswerMetadata,
  EvaluateAnswerInput,
  SentenceStatus,
} from './types';

/** Only NFC and surface whitespace normalization; never strip meaningful Korean particles. */
export function normalizeKoreanAnswer(answer: string): string {
  return answer.normalize('NFC').trim().replace(/\s+/gu, ' ');
}

function resultBase(input: EvaluateAnswerInput, card?: CardAnswerMetadata): AnswerEvaluationResult {
  return {
    cardId: input.cardId,
    submittedAnswer: input.submittedAnswer,
    normalizedAnswer: normalizeKoreanAnswer(input.submittedAnswer),
    expectedCanonicalAnswer: card?.canonicalAnswer ?? null,
    curatedAlternatives: card?.acceptedAlternatives ?? [],
    targetGrammarPointId: card?.grammarPointId ?? null,
    classification: 'unclassified',
    targetMasteryEligible: false,
    feedback: 'This response needs editorial review before it can be graded. No target mastery has been awarded.',
    relevantAlternativeForms: card
      ? [card.canonicalAnswer, ...card.acceptedAlternatives.map((a) => a.value)]
      : [],
    errorCategory: null,
    sentenceStatus: 'not_assessed',
    editorialReview: card?.educatorReview ?? 'unknown',
  };
}

/**
 * Pure, deterministic per-card judgement; no FSRS, storage, network, or React imports.
 * Only canonical and individually-curated alternate strings can earn target mastery.
 * An `incorrect` result is *not* a claim that the input is ungrammatical Korean.
 */
export function evaluateAnswer(
  input: EvaluateAnswerInput,
  catalog: AnswerFeedbackCatalog,
): AnswerEvaluationResult {
  const card = catalog?.cards?.[input.cardId];
  const base = resultBase(input, card);
  if (!card || !card.grammarPointId || !card.canonicalAnswer ||
      (input.grammarPointId && input.grammarPointId !== card.grammarPointId)) {
    return base;
  }

  const actual = base.normalizedAnswer;
  if (actual === normalizeKoreanAnswer(card.canonicalAnswer)) {
    return {
      ...base,
      classification: 'target_correct',
      targetMasteryEligible: true,
      feedback: 'Correct: this is the expected form for the grammar point being practised.',
      sentenceStatus: 'exercise_accepted',
    };
  }

  // In a genuinely under-specified prompt, do not penalize a distinct answer,
  // including any alternative that was annotated before the prompt was resolved.
  if (card.ambiguity === 'needs_editorial_resolution') {
    return {
      ...base,
      feedback: 'More than one interpretation may fit this prompt. An editor must clarify the context before this answer is graded.',
    };
  }

  const alternative = card.acceptedAlternatives.find((a) => normalizeKoreanAnswer(a.value) === actual);
  if (alternative) {
    const isTarget = alternative.classification === 'target_correct';
    return {
      ...base,
      classification: alternative.classification,
      targetMasteryEligible: isTarget,
      sentenceStatus: isTarget ? 'exercise_accepted' : 'different_grammatical_form',
      feedback: isTarget
        ? `Accepted target-equivalent form. ${alternative.explanation}`
        : `This is a curated alternative for this sentence, but it does not demonstrate the target construction. ${alternative.explanation} It is wrong for target mastery, not necessarily ungrammatical Korean.`,
    };
  }

  const nearMiss = card.nearMisses.find((n) => normalizeKoreanAnswer(n.value) === actual);
  if (nearMiss) {
    const sentenceStatus: SentenceStatus = nearMiss.sentenceStatus;
    return {
      ...base,
      classification: 'near_miss',
      targetMasteryEligible: false,
      sentenceStatus,
      errorCategory: nearMiss.category,
      feedback: `${nearMiss.explanation}${sentenceStatus === 'different_grammatical_form'
        ? ' This can be grammatical Korean, but it is not the requested form.'
        : sentenceStatus === 'context_sensitive'
          ? ' This distinction depends on the intended sentence context.'
          : ' This is a formation error in the tested construction.'}`,
    };
  }

  if (actual.length === 0) {
    return {
      ...base,
      classification: 'incorrect',
      feedback: 'Enter an answer to demonstrate this grammar point.',
    };
  }
  return {
    ...base,
    classification: 'incorrect',
    feedback: 'This answer is not among the curated responses for this exercise. That does not establish that it is generally ungrammatical Korean.',
  };
}
