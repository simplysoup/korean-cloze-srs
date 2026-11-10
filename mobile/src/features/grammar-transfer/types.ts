/** Practice types are independent of the grammar review/SRS, store and account sync. */
export type ReviewStatus = 'editorial-draft';
export type EducatorApproval = 'pending' | 'approved';
export type NearMissDiagnosis = 'wrong-register' | 'wrong-tense' | 'wrong-particle' | 'wrong-meaning';
export interface AnswerVariant { value: string; scope: string }
export interface BaseExercise {
  id: string;
  unit: string;
  level: number;
  prerequisiteGrammarIds: string[];
  availableAfterLesson: number;
  contextKorean: string;
  contextEnglish: string;
  task: string;
  objective: string;
  explanation: string;
  accepted: AnswerVariant[];
  registerConstraint: string;
  tenseConstraint: string;
  sourceRef: string;
  reviewStatus: ReviewStatus;
  educatorApproval: EducatorApproval;
  ambiguityReview: string;
}
export interface ChoiceOption {
  id: string;
  text: string;
  explanation: string;
  /** Editorial judgement: if true, this option MUST be in accepted[]. */
  validInContext: boolean;
}
export interface ContrastExercise extends BaseExercise {
  type: 'contrast';
  contrastGroup: string;
  format: 'choice';
  choices: ChoiceOption[];
}
export interface NearMiss { value: string; diagnosis: NearMissDiagnosis; explanation: string }
export interface TransferExercise extends BaseExercise {
  type: 'transfer';
  format: 'text';
  nearMisses: NearMiss[];
}
export type Exercise = ContrastExercise | TransferExercise;
export interface PracticeUnit {
  id: string;
  title: string;
  description: string;
  level: number;
  sessionSize: number;
}
export interface PracticeCollection {
  schemaVersion: 1;
  kind: 'grammar-transfer-pilot';
  educatorApproval: EducatorApproval;
  provenance: string;
  units: PracticeUnit[];
  exercises: Exercise[];
}
