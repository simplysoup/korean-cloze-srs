/**
 * Frozen exercise/comprehension interfaces for parallel implementation.
 * Draft or unapproved teaching content is not educator-certified.
 */
export type ContentReadiness =
  | 'draft'
  | 'editor_reviewed'
  | 'educator_approved'
  | 'blocked';

export type ExerciseKind =
  | 'contrast'
  | 'transfer'
  | 'reading_comprehension'
  | 'topic_checkpoint';

export type ExerciseResponseType = 'short_text' | 'single_choice' | 'multiple_choice';

export type ExerciseExplanation =
  | { type: 'text'; text: string }
  | { type: 'contrast'; text: string; comparedGrammarIds: readonly string[] }
  | { type: 'passage'; text: string; evidenceExcerpt: string };

export interface PracticeExercise {
  id: string;
  kind: ExerciseKind;
  prerequisiteGrammarIds: readonly string[];
  prerequisiteVocabEntryIds?: readonly string[];
  contentReadiness: ContentReadiness;
  prompt: string;
  responseType: ExerciseResponseType;
  options?: readonly { id: string; label: string }[];
  canonicalAnswer: string;
  acceptedAlternatives: readonly string[];
  explanation: ExerciseExplanation;
  /** Draft material requires signoff; never infer certification from validity. */
  educatorApprovalId?: string;
}

export interface ReadingPassage {
  id: string;
  title: string;
  koreanText: string;
  englishSupport?: string;
  prerequisiteGrammarIds: readonly string[];
  prerequisiteVocabEntryIds?: readonly string[];
  contentReadiness: ContentReadiness;
  questionIds: readonly string[];
  educatorApprovalId?: string;
}

export interface PracticeResponse {
  exerciseId: string;
  responseType: ExerciseResponseType;
  /** Option ID(s) or the submitted text, depending on responseType. */
  value: string | readonly string[];
}

export interface PracticeFeedback {
  exerciseId: string;
  response: PracticeResponse;
  explanation: ExerciseExplanation;
  /** Never grant grammar mastery merely for completing mixed-skill work. */
  awardsGrammarMastery: false;
  status: 'correct' | 'incorrect' | 'unclassified';
}
