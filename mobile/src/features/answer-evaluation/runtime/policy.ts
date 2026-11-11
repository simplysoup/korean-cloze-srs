import { checkAnswers, ratingForCheck, type Grade } from '../../../lib/srs';
import type { AnswerOutcome } from '../../contracts/answers';

export type AnswerAction =
  | { action: 'record_review'; grade: Grade; recycleMiss: boolean; targetMasteryEligible: boolean }
  | { action: 'learn_advance'; targetMasteryEligible: true }
  | { action: 'learn_recycle'; targetMasteryEligible: false }
  | { action: 'defer_without_review'; targetMasteryEligible: false };

/** No outcome except a non-revealed target-correct answer earns mastery. */
export function reviewActionForOutcome(outcome: AnswerOutcome, revealed: boolean): AnswerAction {
  if (revealed) return { action: 'record_review', grade: 1, recycleMiss: true, targetMasteryEligible: false };
  if (outcome === 'unclassified') return { action: 'defer_without_review', targetMasteryEligible: false };
  if (outcome === 'target_correct') {
    return { action: 'record_review', grade: 3, recycleMiss: false, targetMasteryEligible: true };
  }
  return { action: 'record_review', grade: 1, recycleMiss: true, targetMasteryEligible: false };
}

export function learnActionForOutcome(outcome: AnswerOutcome, revealed: boolean): AnswerAction {
  if (revealed) return { action: 'learn_recycle', targetMasteryEligible: false };
  if (outcome === 'unclassified') return { action: 'defer_without_review', targetMasteryEligible: false };
  return outcome === 'target_correct'
    ? { action: 'learn_advance', targetMasteryEligible: true }
    : { action: 'learn_recycle', targetMasteryEligible: false };
}

/**
 * Flag-OFF path: exactly the historical comparison/FSRS choice. It does not
 * import or invoke answer-feedback or change multi-blank matching semantics.
 */
export function legacyReviewAction(
  submitted: string[], correctAnswers: string[], revealed: boolean,
): Extract<AnswerAction, { action: 'record_review' }> {
  const correct = !revealed && checkAnswers(submitted, correctAnswers);
  return { action: 'record_review', grade: revealed ? 1 : ratingForCheck(correct),
    recycleMiss: !correct, targetMasteryEligible: correct };
}

/** Legacy Learn has no FSRS log. Same Boolean check, same queue disposition. */
export function legacyLearnAction(
  submitted: string[], correctAnswers: string[], revealed: boolean,
): Extract<AnswerAction, { action: 'learn_advance' | 'learn_recycle' }> {
  return !revealed && checkAnswers(submitted, correctAnswers)
    ? { action: 'learn_advance', targetMasteryEligible: true }
    : { action: 'learn_recycle', targetMasteryEligible: false };
}
