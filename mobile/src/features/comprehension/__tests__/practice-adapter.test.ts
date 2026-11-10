import { allPassages } from '../catalog';
import { toPracticeExercise, toPracticeFeedback, toPracticeReadingPassage } from '../practiceAdapter';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Agent 00 comprehension contract integration', () => {
  const passage = allPassages()[0];
  const question = passage.questions[0];

  test('passage readiness is draft; it does not advertise a translation', () => {
    const contract = toPracticeReadingPassage(passage);
    expect(contract.contentReadiness).toBe('draft');
    expect(contract.questionIds).toEqual(passage.questions.map((q) => q.id));
    expect(contract.prerequisiteGrammarIds).toEqual(passage.prerequisiteGrammarIds);
    expect(contract.englishSupport).toBeUndefined();
    expect(contract.koreanText).toContain(passage.paragraphs[0]);
  });

  test('exercise uses stable option IDs and evidence-based teaching feedback', () => {
    const exercise = toPracticeExercise(passage, question);
    expect(exercise.kind).toBe('reading_comprehension');
    expect(exercise.contentReadiness).toBe('draft');
    expect(exercise.responseType).toBe('single_choice');
    expect(exercise.options).toHaveLength(4);
    expect(exercise.canonicalAnswer).toBe(question.id + ':option:' + question.correctIndex);
    expect(exercise.explanation).toEqual({
      type: 'passage',
      text: question.explanation,
      evidenceExcerpt: question.evidence,
    });
  });

  test('correct, incorrect and unknown reading responses cannot award grammar mastery', () => {
    const right = toPracticeFeedback(question, question.correctIndex);
    const wrong = toPracticeFeedback(question, (question.correctIndex + 1) % 4);
    const unknown = toPracticeFeedback(question, 99);
    expect(right.status).toBe('correct');
    expect(wrong.status).toBe('incorrect');
    expect(unknown.status).toBe('unclassified');
    for (const response of [right, wrong, unknown]) expect(response.awardsGrammarMastery).toBe(false);
  });

  test('both standalone routes remain behind the frozen default-off reading flag', () => {
    for (const filename of ['index.tsx', '[id].tsx']) {
      const source = readFileSync(join(__dirname, '../../../app/comprehension', filename), 'utf8');
      expect(source).toContain("isCurriculumFeatureEnabled('readingComprehension')");
      expect(source).toContain('<Redirect');
    }
  });
});
