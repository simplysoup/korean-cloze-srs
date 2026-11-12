/** An editorial judgement about *this cloze*, not a general Korean grammar checker. */
export type AnswerClassification =
  | 'target_correct'
  | 'valid_off_target'
  | 'near_miss'
  | 'incorrect'
  | 'unclassified';

export type ErrorCategory =
  | 'tense'
  | 'register'
  | 'honorific'
  | 'particle'
  | 'irregular'
  | 'aspect'
  | 'perspective';

/** Do not interpret these labels as independent native-speaker certification. */
export type SentenceStatus =
  | 'exercise_accepted'
  | 'different_grammatical_form'
  | 'formation_error'
  | 'context_sensitive'
  | 'not_assessed';

export interface CuratedAlternative {
  value: string;
  classification: 'target_correct' | 'valid_off_target';
  explanation: string;
  source: 'gap_audit' | 'flagged_remediation';
  educatorReview: 'pending';
}

export interface CuratedNearMiss {
  value: string;
  category: ErrorCategory;
  explanation: string;
  sentenceStatus: 'different_grammatical_form' | 'formation_error' | 'context_sensitive';
  source: 'gap_audit' | 'corpus_contrast';
  educatorReview: 'pending';
}

export interface CardAnswerMetadata {
  grammarPointId: string;
  canonicalAnswer: string;
  sentenceWithBlank: string;
  fullSentence: string;
  acceptedAlternatives: CuratedAlternative[];
  nearMisses: CuratedNearMiss[];
  /** A flagged prompt without sufficient editorial disambiguation must abstain. */
  ambiguity: 'not_flagged' | 'resolved_by_prompt' | 'needs_editorial_resolution';
  editorialFlags: string[];
  educatorReview: 'pending';
}

export interface AnswerFeedbackCatalog {
  schemaVersion: 1;
  provenance: string;
  counts: {
    cards: number;
    alternativeCards: number;
    alternativeStrings: number;
    nearMissCards: number;
    nearMissStrings: number;
  };
  cards: Record<string, CardAnswerMetadata>;
}

export interface EvaluateAnswerInput {
  cardId: string;
  submittedAnswer: string;
  /** Optional guard against stale/wrong-card integration. */
  grammarPointId?: string;
}

export interface AnswerEvaluationResult {
  cardId: string;
  submittedAnswer: string;
  normalizedAnswer: string;
  expectedCanonicalAnswer: string | null;
  curatedAlternatives: CuratedAlternative[];
  targetGrammarPointId: string | null;
  classification: AnswerClassification;
  targetMasteryEligible: boolean;
  feedback: string;
  relevantAlternativeForms: string[];
  errorCategory: ErrorCategory | null;
  sentenceStatus: SentenceStatus;
  editorialReview: 'pending' | 'unknown';
}
