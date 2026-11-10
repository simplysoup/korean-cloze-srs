import pilot from '../../content/practice-pilot.json';
import lv1 from '../../content/topik1-level1.json';
import lv2 from '../../content/topik1-level2.json';
import lv3 from '../../content/topik2-level3.json';
import lv4 from '../../content/topik2-level4.json';
import lv5 from '../../content/topik2-level5.json';
import lv6 from '../../content/topik2-level6.json';
import type { PracticeCollection } from './types';
export { gradeExercise, ambiguousChoices, normalizeAnswer } from './scoring';
export { startSession, currentExercise, recordAttempt, summarizeSession, reviewMissed, availableExercises, availableUnits, unitPrerequisites, practiceLayoutWidth } from './session';
export type { Exercise, PracticeUnit, PracticeCollection, ContrastExercise, TransferExercise } from './types';
export const practice = pilot as unknown as PracticeCollection;
const catalogues = [lv1,lv2,lv3,lv4,lv5,lv6];
const titles = new Map(catalogues.flatMap(deck =>
  deck.lessons.flatMap(lesson => lesson.grammarPoints.map(point => [point.id, point.title] as const))));
export function prerequisiteTitle(id: string): string { return titles.get(id) ?? `Unknown: ${id}`; }
