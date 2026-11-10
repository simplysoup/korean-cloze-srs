import { allPassages, passageById } from '../catalog';

describe('reading pilot catalogue', () => {
  const passages = allPassages();

  test('all six passages load at two per level', () => {
    expect(passages).toHaveLength(6);
    for (const level of [1, 2, 3]) expect(passages.filter((p) => p.level === level)).toHaveLength(2);
    for (const passage of passages) expect(passageById(passage.id)).toBe(passage);
    expect(passageById('not-an-id')).toBeUndefined();
  });

  test('every ID stays unique and all answers are valid', () => {
    const ids = new Set<string>();
    for (const p of passages) {
      expect(ids.has(p.id)).toBe(false); ids.add(p.id);
      expect(p.prerequisiteGrammarIds.length).toBeGreaterThan(0);
      expect(p.prerequisiteGrammarLabels).toHaveLength(p.prerequisiteGrammarIds.length);
      expect(p.editorialStatus).toBe('editorial-draft');
      expect(p.educatorReviewed).toBe(false);
      for (const q of p.questions) {
        expect(ids.has(q.id)).toBe(false); ids.add(q.id);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.choices.length);
        expect(p.paragraphs.join(' ')).toContain(q.evidence);
      }
    }
    expect(ids.size).toBe(30);
  });

  test('inference and potential ambiguity have documented editorial rationale', () => {
    const inferential = passages.flatMap((p) => p.questions).filter((q) => q.type === 'inference');
    expect(inferential).toHaveLength(5);
    for (const question of inferential) {
      expect(question.interpretationNote?.length).toBeGreaterThan(80);
    }
    // The Level 3 future event question explicitly avoids claiming certainty.
    expect(passages[5].questions[3].prompt).toContain('most likely');
  });

  test('audio is optional; reading-only sessions never require playback', () => {
    expect(passages.every((p) => p.audio === null)).toBe(true);
  });

  test('all questions have explanations and English answer choices', () => {
    expect(passages.flatMap((p) => p.questions)).toHaveLength(24);
    for (const q of passages.flatMap((p) => p.questions)) {
      expect(q.explanation.length).toBeGreaterThan(44);
      expect(q.answerLanguage).toBe('en');
      expect(q.choices).toHaveLength(4);
    }
  });
});
