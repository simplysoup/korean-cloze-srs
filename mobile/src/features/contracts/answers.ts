/**
 * Curriculum v1 answer-evaluation contract.
 *
 * Natural Korean and demonstration of the current *target* are separate
 * judgments. The historical Boolean grammar grader remains the production
 * grader until this evaluator is independently verified and enabled.
 */
export type AnswerOutcome =
  | 'target_correct'
  | 'valid_off_target'
  | 'near_miss'
  | 'incorrect'
  | 'unclassified';

export type AnswerErrorType =
  | 'tense'
  | 'register'
  | 'honorific'
  | 'aspect'
  | 'irregular_inflection'
  | 'construction'
  | 'meaning'
  | 'spelling'
  | 'other';

export interface AcceptedAnswerAlternative {
  answer: string;
  /** Difference in usage/register/nuance, when actually established. */
  note?: string;
}

interface AnswerEvaluationBase {
  outcome: AnswerOutcome;
  canonicalAnswer: string;
  /** Only variants approved for the exact sentence and target context. */
  acceptedAlternatives: readonly AcceptedAnswerAlternative[];
  explanation: string;
  /** Optional when a supported diagnostic exists; never infer blindly. */
  errorType?: AnswerErrorType;
  /** Only true when a narrow, actionable retry hint is supported. */
  retryAllowed: boolean;
}

/** No unknown, off-target or near-miss answer may grant target mastery. */
export type AnswerEvaluation =
  | (AnswerEvaluationBase & {
      outcome: 'target_correct';
      targetMasteryEligible: true;
    })
  | (AnswerEvaluationBase & {
      outcome: Exclude<AnswerOutcome, 'target_correct'>;
      targetMasteryEligible: false;
    });

export interface AnswerEvaluationRequest {
  exerciseId: string;
  targetGrammarIds: readonly string[];
  canonicalAnswer: string;
  acceptedAlternatives: readonly AcceptedAnswerAlternative[];
  submittedAnswer: string;
  /** Full context to evaluate Korean, not just an isolated blank. */
  sentenceContext: string;
  register?: string | null;
  tense?: string | null;
}

export interface AnswerEvaluator {
  evaluate(request: AnswerEvaluationRequest): AnswerEvaluation;
}
