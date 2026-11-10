import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import pilot from '../../../content/practice-pilot.json';
import { ambiguousChoices, gradeExercise, normalizeAnswer } from '../scoring';
import { availableExercises, availableUnits, currentExercise, practiceLayoutWidth, recordAttempt, reviewMissed, startSession, summarizeSession } from '../session';
import type { ContrastExercise, Exercise, PracticeCollection } from '../types';
const collection = pilot as unknown as PracticeCollection;
const { exercises, units } = collection;
function item(id: string): Exercise { const result = exercises.find(e => e.id === id); if (!result) throw Error(id); return result; }
test('all authored pilot items load and sessions interleave modes', () => {
  expect(exercises).toHaveLength(52);
  const s = startSession(units, exercises, 'level-2')!;
  expect(s.exerciseIds).toHaveLength(6);
  expect(item(s.exerciseIds[0]).type).toBe('contrast');
  expect(item(s.exerciseIds[1]).type).toBe('transfer');
});
test('accepted choices are scored correctly and distractors explain the confusion', () => {
  const e = item('ct-003') as ContrastExercise;
  expect(gradeExercise(e, e.accepted[0].value).status).toBe('correct');
  expect(gradeExercise(e, 'o2').status).toBe('incorrect');
  expect(gradeExercise(e, 'o2').feedback).toMatch(/에/);
});
test('text answer variants and normalization preserve meaningful grammar', () => {
  const e = item('tr-004');
  expect(normalizeAnswer('  학생들이  체육관에서 춤을 연습해요.  ')).toBe('학생들이 체육관에서 춤을 연습해요');
  expect(gradeExercise(e, '학생들이 체육관에서 춤을 연습해요').accepted).toBe(true);
  expect(gradeExercise(e, '학생들은 체육관에 춤을 연습해요.').accepted).toBe(false);
});
test('known wrong register produces targeted feedback', () => {
  const g = gradeExercise(item('tr-002'), '지난주에 창고를 청소했다.');
  expect(g.status).toBe('wrong-register');
  expect(g.feedback).toMatch(/해요체/);
});
test('known wrong tense produces targeted feedback', () => {
  const g = gradeExercise(item('tr-002'), '지난주에 창고를 청소해요.');
  expect(g.status).toBe('wrong-tense');
});
test('genuinely valid second option must be accepted, not marked wrong', () => {
  const a = item('ct-003') as ContrastExercise;
  const edited: ContrastExercise = {
    ...a, choices: a.choices.map(c => ({ ...c, validInContext: true })),
    accepted: [...a.accepted, { value: 'o2', scope: 'Also valid under the separately reviewed context.' }],
  };
  expect(ambiguousChoices(edited)).toEqual([]);
  expect(gradeExercise(edited, 'o2').status).toBe('correct');
});
test('unaccepted but genuinely valid option blocks scoring as ambiguous', () => {
  const a = item('ct-003') as ContrastExercise;
  const edited: ContrastExercise = { ...a, choices: a.choices.map(c => ({ ...c, validInContext: true })) };
  expect(ambiguousChoices(edited)).toEqual(['o2']);
  expect(gradeExercise(edited, 'o2').status).toBe('missing');
});
test('grammar prerequisites filter out unlearned units', () => {
  const known = new Set(item('tr-001').prerequisiteGrammarIds);
  expect(availableExercises(exercises, known).some(e => e.id === 'tr-001')).toBe(true);
  expect(availableUnits(units, exercises, known).some(u => u.id === 'level-1')).toBe(true);
  expect(availableUnits(units, exercises, known).some(u => u.id === 'level-4')).toBe(false);
});
test('session completion, missed answers, and replay are deterministic and local', () => {
  let s = startSession(units, exercises, 'level-1')!;
  for (const [i, id] of s.exerciseIds.entries()) {
    const ex = item(id);
    const response = i === 0 ? 'incorrect' : ex.accepted[0].value;
    s = recordAttempt(s, ex, response).session;
  }
  const summary = summarizeSession(s);
  expect(summary.complete).toBe(true);
  expect(summary.total).toBe(6);
  expect(summary.correct).toBe(5);
  expect(summary.missedIds).toHaveLength(1);
  const missed = reviewMissed(s)!;
  expect(missed.mode).toBe('missed-review');
  expect(missed.exerciseIds).toEqual(summary.missedIds);
  expect(missed.attempts).toHaveLength(0);
});
test('missing unit or exercise cannot silently create an attempt', () => {
  expect(startSession(units, exercises, 'does-not-exist')).toBeNull();
  const s = startSession(units, exercises, 'level-1')!;
  expect(currentExercise({ ...s, exerciseIds: ['missing'] }, exercises)).toBeNull();
  const attempt = recordAttempt(s, undefined, 'some answer');
  expect(attempt.grade.status).toBe('missing');
  expect(attempt.session.cursor).toBe(0);
});
test('responsive single-column panel fits phone, tablet and desktop widths', () => {
  for (const width of [280, 320, 375, 768, 1024, 1920]) {
    expect(practiceLayoutWidth(width)).toBeLessThanOrEqual(width);
    expect(practiceLayoutWidth(width)).toBeLessThanOrEqual(720);
    expect(practiceLayoutWidth(width)).toBeGreaterThan(0);
  }
});

// Run the repository-wide authoring validator in the existing mobile Jest CI job.
// This avoids editing Agent 00's shared workflow configuration.
test('practice source, existing grammar references, and editorial constraints validate end to end', () => {
  const script = resolve(__dirname, '../../../../../scripts/validate-practice.mjs');
  const output = execFileSync(process.execPath, [script], { encoding: 'utf8' });
  expect(output).toMatch(/^OK: 52 exercises/m);
});
