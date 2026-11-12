import { gradeExercise, type Grade, type GradeStatus } from './scoring';
import type { Exercise, PracticeUnit } from './types';
export interface SessionAttempt { exerciseId: string; status: GradeStatus; accepted: boolean; answer: string }
export interface PracticeSession {
  unitId: string;
  exerciseIds: string[];
  cursor: number;
  attempts: SessionAttempt[];
  /** Browser memory only: no SRS, IndexedDB, sync, account or streak changes. */
  mode: 'standard' | 'missed-review';
}
export interface SessionSummary {
  complete: boolean;
  total: number;
  correct: number;
  missedIds: string[];
  diagnoses: Partial<Record<GradeStatus, number>>;
}
export function availableExercises(exercises: Exercise[], learnedGrammarIds: ReadonlySet<string>): Exercise[] {
  return exercises.filter(e => e.prerequisiteGrammarIds.every(id => learnedGrammarIds.has(id)));
}
export function availableUnits(units: PracticeUnit[], exercises: Exercise[], learnedGrammarIds: ReadonlySet<string>): PracticeUnit[] {
  const ids = new Set(availableExercises(exercises, learnedGrammarIds).map(e => e.unit));
  return units.filter(u => ids.has(u.id));
}
export function unitPrerequisites(exercises: Exercise[], unitId: string): string[] {
  return [...new Set(exercises.filter(e => e.unit === unitId).flatMap(e => e.prerequisiteGrammarIds))];
}
/** Alternate contrast and productive transfer; a short session includes both. */
export function startSession(units: PracticeUnit[], exercises: Exercise[], unitId: string): PracticeSession | null {
  const unit = units.find(u => u.id === unitId);
  if (!unit) return null;
  const selection = exercises.filter(e => e.unit === unitId);
  if (!selection.length) return null;
  const contrast = selection.filter(e => e.type === 'contrast');
  const transfer = selection.filter(e => e.type === 'transfer');
  const ordered: Exercise[] = [];
  for (let i = 0; i < Math.max(contrast.length, transfer.length); i++) {
    if (contrast[i]) ordered.push(contrast[i]);
    if (transfer[i]) ordered.push(transfer[i]);
  }
  return { unitId, exerciseIds: ordered.slice(0, unit.sessionSize).map(e => e.id), cursor: 0, attempts: [], mode: 'standard' };
}
export function currentExercise(session: PracticeSession, exercises: Exercise[]): Exercise | null {
  const id = session.exerciseIds[session.cursor];
  return id ? exercises.find(e => e.id === id) ?? null : null;
}
export function recordAttempt(session: PracticeSession, exercise: Exercise | undefined, answer: string): { session: PracticeSession; grade: Grade } {
  const grade = gradeExercise(exercise, answer);
  const expected = session.exerciseIds[session.cursor];
  if (!expected || !exercise || exercise.id !== expected || grade.status === 'missing') {
    return { session, grade: { status: 'missing', accepted: false, feedback: 'No matching active exercise or answer.', acceptedValues: grade.acceptedValues } };
  }
  return { grade, session: {
    ...session,
    cursor: session.cursor + 1,
    attempts: [...session.attempts, { exerciseId: exercise.id, answer, status: grade.status, accepted: grade.accepted }],
  } };
}
export function summarizeSession(session: PracticeSession): SessionSummary {
  const diagnoses: Partial<Record<GradeStatus, number>> = {};
  for (const attempt of session.attempts) diagnoses[attempt.status] = (diagnoses[attempt.status] ?? 0) + 1;
  return {
    complete: session.cursor === session.exerciseIds.length,
    total: session.attempts.length,
    correct: session.attempts.filter(a => a.accepted).length,
    missedIds: [...new Set(session.attempts.filter(a => !a.accepted).map(a => a.exerciseId))],
    diagnoses,
  };
}
export function reviewMissed(session: PracticeSession): PracticeSession | null {
  const missed = summarizeSession(session).missedIds;
  return missed.length ? { unitId: session.unitId, exerciseIds: missed, cursor: 0, attempts: [], mode: 'missed-review' } : null;
}
export function practiceLayoutWidth(windowWidth: number): number {
  // Single-column scroll area that never extends past the available screen.
  return Math.max(0, Math.min(720, windowWidth - (windowWidth < 600 ? 24 : 48)));
}
