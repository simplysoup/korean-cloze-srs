import { allPassages } from '../catalog';
import { chooseAnswer, scoreReading } from '../assessment';
import type { ReadingResponse } from '../types';

describe('reading comprehension scoring', () => {
  const passage = allPassages()[0];

  test('does not treat missing answers as incorrect attempts', () => {
    const score = scoreReading(passage, {});
    expect(score.answered).toBe(0);
    expect(score.correct).toBe(0);
    expect(score.complete).toBe(false);
    expect(score.missedQuestionIds).toEqual([]);
  });

  test('finishes with 100% when every answer is correct', () => {
    const answers = Object.fromEntries(passage.questions.map((q) => [q.id, q.correctIndex])) as ReadingResponse;
    const score = scoreReading(passage, answers);
    expect(score.complete).toBe(true);
    expect(score.answered).toBe(passage.questions.length);
    expect(score.percentage).toBe(100);
    expect(score.missedQuestionIds).toHaveLength(0);
  });

  test('tracks misses, not invalid choices or unrelated question IDs', () => {
    const q = passage.questions[0];
    const wrong = (q.correctIndex + 1) % q.choices.length;
    const wrongOnly = scoreReading(passage, { [q.id]: wrong, unrelated: 0 });
    expect(wrongOnly.answered).toBe(1);
    expect(wrongOnly.missedQuestionIds).toEqual([q.id]);
    expect(scoreReading(passage, { [q.id]: 99 }).answered).toBe(0);
  });

  test('copies responses without mutating the prior answer state', () => {
    const q = passage.questions[0];
    const initial: ReadingResponse = {};
    const next = chooseAnswer(initial, q, q.correctIndex);
    expect(initial).toEqual({});
    expect(next[q.id]).toBe(q.correctIndex);
    expect(chooseAnswer(next, q, -1)).toBe(next);
  });
});
