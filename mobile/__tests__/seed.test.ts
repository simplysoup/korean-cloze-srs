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
  it('has 11 lessons, 48 grammar points, 178 cloze cards, 109 lesson examples', () => {
    expect(bundle.lessons.length).toBe(11);
    expect(grammarPoints.length).toBe(48);
    expect(cards.length).toBe(178);
    expect(examples.length).toBe(109);
  });
});

describe('seed content integrity', () => {
  it('every cloze card answer appears in its sentence', () => {
    for (const card of cards) {
      expect(card.fullSentence).toContain(card.answer);
      expect(card.sentenceWithBlank).toContain('___');
    }
  });

  /**
   * The English hint is a plain string, with no highlighting. (Build 25
   * removed it: English often has no equivalent for Korean particles —
   * 은/는, 이/가, 을/를 — so any highlighted English word is a guess.)
   */
  it('englishHint is a plain unhighlighted string', () => {
    for (const item of [...cards, ...examples]) {
      expect(typeof item.englishHint).toBe('string');
      expect(item.englishHint.length).toBeGreaterThan(0);
    }
    // The translations themselves are unchanged by the removal.
    expect(cards.find((c) => c.id === 'cc_ieyo_01')!.englishHint).toBe('I am a student.');
    expect(cards.find((c) => c.id === 'cc_ieyo_03')!.englishHint).toBe("It's a teacher.");
    expect(examples.find((e) => e.id === 'le_eun_neun_01')!.englishHint).toBe('As for me, I am a student.');
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
