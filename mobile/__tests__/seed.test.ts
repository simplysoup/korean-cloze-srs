/**
 * Seed-content validation as a Jest test (same rules as
 * scripts/validate-content.mjs, so CI catches a bad content port).
 * Content is PROVISIONAL — copied verbatim from the old app; see README.
 */
import bundle from '../src/content/topik1-level1.json';
import { flattenContent, type ContentBundle } from '../src/content/types';

const { grammarPoints } = flattenContent(bundle as unknown as ContentBundle);
const cards = grammarPoints.flatMap(({ gp }) => gp.cards);
const examples = grammarPoints.flatMap(({ gp }) => gp.lessonExamples);

describe('seed content counts', () => {
  it('has 11 lessons, 48 grammar points, 154 cloze cards, 98 lesson examples', () => {
    expect(bundle.lessons.length).toBe(11);
    expect(grammarPoints.length).toBe(48);
    expect(cards.length).toBe(154);
    expect(examples.length).toBe(98);
  });
});

describe('seed content integrity', () => {
  it('every cloze card answer appears in its sentence', () => {
    for (const card of cards) {
      expect(card.fullSentence).toContain(card.answer);
      expect(card.sentenceWithBlank).toContain('___');
    }
  });

  it('every grammar point has at least 2 lesson examples', () => {
    for (const { gp } of grammarPoints) {
      expect(gp.lessonExamples.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('has no duplicate ids', () => {
    const ids = [
      ...grammarPoints.map(({ gp }) => gp.id),
      ...cards.map((c) => c.id),
      ...examples.map((e) => e.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every related point id and extra-target id exists', () => {
    const gpIds = new Set(grammarPoints.map(({ gp }) => gp.id));
    for (const { gp } of grammarPoints) {
      for (const id of gp.relatedPointIds ?? []) expect(gpIds.has(id)).toBe(true);
      for (const card of gp.cards) {
        for (const t of card.extraTargets ?? []) expect(gpIds.has(t.grammarPointId)).toBe(true);
      }
    }
  });
});
