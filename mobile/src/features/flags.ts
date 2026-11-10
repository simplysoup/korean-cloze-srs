/**
 * Curriculum v1 kill switches. Default deny for all unapproved workstreams.
 * Keep these static until integration tests, sync verification and educator
 * readiness checks have passed. Do not enable from an untrusted URL/localStorage.
 */
export const CURRICULUM_FLAGS = Object.freeze({
  topik2Grammar: false,
  vocabulary: false,
  answerFeedback: false,
  topics: false,
  hangulEnhancements: false,
  contrastPractice: false,
  transferPractice: false,
  readingComprehension: false,
} as const);

export type CurriculumFeatureFlag = keyof typeof CURRICULUM_FLAGS;

export function isCurriculumFeatureEnabled(flag: CurriculumFeatureFlag): boolean {
  return CURRICULUM_FLAGS[flag];
}
