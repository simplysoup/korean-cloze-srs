import type { Exercise, ContrastExercise, NearMissDiagnosis } from './types';

/** Normalize typography only; never silently erase Korean particles, endings or spacing. */
export function normalizeAnswer(text: string): string {
  return text.normalize('NFC')
    .replace(/[\u200b-\u200d\ufeff]/gu, '')
    .trim()
    .replace(/\s+/gu, ' ')
    .replace(/[.!?。？！]+$/gu, '');
}

export type GradeStatus = 'correct' | NearMissDiagnosis | 'incorrect' | 'missing';
export interface Grade {
  status: GradeStatus;
  accepted: boolean;
  feedback: string;
  acceptedValues: string[];
  matchedScope?: string;
}
export function ambiguousChoices(exercise: ContrastExercise): string[] {
  const accepted = new Set(exercise.accepted.map(a => normalizeAnswer(a.value)));
  return exercise.choices.filter(c => c.validInContext && !accepted.has(normalizeAnswer(c.id)))
    .map(c => c.id);
}
/** Deterministic curated-answer checker: NOT a Korean grammar model or SRS score. */
export function gradeExercise(exercise: Exercise | undefined, input: string): Grade {
  if (!exercise) {
    return { status: 'missing', accepted: false, feedback: 'This exercise is unavailable.', acceptedValues: [] };
  }
  const acceptedValues = exercise.accepted.map(a =>
    exercise.type === 'contrast' ? exercise.choices.find(c => c.id === a.value)?.text ?? a.value : a.value
  );
  const answer = normalizeAnswer(input);
  if (!answer) return { status: 'missing', accepted: false, feedback: 'Select or enter an answer first.', acceptedValues };
  // An editorially marked valid MC option is NEVER silently scored wrong.
  if (exercise.type === 'contrast' && ambiguousChoices(exercise).length) {
    return { status: 'missing', accepted: false, feedback: 'This item needs ambiguity review. No score was recorded.', acceptedValues };
  }
  const matched = exercise.accepted.find(a => normalizeAnswer(a.value) === answer);
  if (matched) return { status: 'correct', accepted: true, feedback: exercise.explanation, acceptedValues, matchedScope: matched.scope };
  if (exercise.type === 'contrast') {
    const choice = exercise.choices.find(c => normalizeAnswer(c.id) === answer);
    if (!choice) return { status: 'incorrect', accepted: false, feedback: 'Choose one of the displayed sentences.', acceptedValues };
    return { status: 'incorrect', accepted: false, feedback: choice.explanation, acceptedValues };
  }
  const miss = exercise.nearMisses?.find(m => normalizeAnswer(m.value) === answer);
  if (miss) {
    return { status: miss.diagnosis, accepted: false, feedback: miss.explanation, acceptedValues };
  }
  return {
    status: 'incorrect',
    accepted: false,
    feedback: 'That answer is not in the curated response set. This does not prove your Korean is invalid; compare the model and flag valid alternatives for editorial review.',
    acceptedValues,
  };
}
