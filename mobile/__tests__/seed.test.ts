/**
 * Seed-content validation as a Jest test (same rules as
 * scripts/validate-content.mjs, so CI catches a bad content port).
 * Level 1 was audited and reorganised into a learner-first curriculum
 * on 2026-11-09; Level 2 was authored fresh in the same overhaul
 * (docs/planning/korean-curriculum-overhaul-2026-11-09.md).
 */
import bundle1 from '../src/content/topik1-level1.json';
import bundle2 from '../src/content/topik1-level2.json';
import { flattenContent, type ContentBundle } from '../src/content/types';

const l1 = flattenContent(bundle1 as unknown as ContentBundle).grammarPoints.map((g) => ({ ...g, level: 1 }));
const l2 = flattenContent(bundle2 as unknown as ContentBundle).grammarPoints.map((g) => ({ ...g, level: 2 }));

// Global positions run across both bundles in order (Level 1: 1-48,
// Level 2: 49-99), matching the validator.
const all = [...l1, ...l2].map((entry, i) => ({ ...entry, position: i + 1 }));
const grammarPoints = all;
const cards = grammarPoints.flatMap(({ gp }) => gp.cards);
const examples = grammarPoints.flatMap(({ gp }) => gp.lessonExamples);
const l1Cards = l1.flatMap(({ gp }) => gp.cards);
const l1Examples = l1.flatMap(({ gp }) => gp.lessonExamples);
const l2Cards = l2.flatMap(({ gp }) => gp.cards);
const l2Examples = l2.flatMap(({ gp }) => gp.lessonExamples);

describe('seed content counts', () => {
  it('Level 1 has 11 lessons, 48 grammar points, 178 cloze cards, 109 lesson examples', () => {
    expect(bundle1.lessons.length).toBe(11);
    expect(l1.length).toBe(48);
    expect(l1Cards.length).toBe(178);
    expect(l1Examples.length).toBe(109);
  });

  it('Level 2 has 11 lessons, 51 grammar points, 153 cloze cards, 102 lesson examples', () => {
    expect(bundle2.lessons.length).toBe(11);
    expect(l2.length).toBe(51);
    expect(l2Cards.length).toBe(153);
    expect(l2Examples.length).toBe(102);
  });

  it('global positions are continuous 1-99', () => {
    expect(all.map((g) => g.position)).toEqual(Array.from({ length: 99 }, (_, i) => i + 1));
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
    // The translations themselves are unchanged by the removal (and by
    // the 2026-11-09 audit, which did not touch these three).
    expect(cards.find((c) => c.id === 'cc_ieyo_01')!.englishHint).toBe('I am a student.');
    expect(cards.find((c) => c.id === 'cc_ieyo_03')!.englishHint).toBe("It's a teacher.");
    expect(examples.find((e) => e.id === 'le_eun_neun_01')!.englishHint).toBe('As for me, I am a student.');
  });

  it('every grammar point has at least 2 lesson examples and 3 cloze cards', () => {
    for (const { gp } of grammarPoints) {
      expect(gp.lessonExamples.length).toBeGreaterThanOrEqual(2);
      expect(gp.cards.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('has no duplicate ids across both levels', () => {
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

  it('every card introducedAtPosition is in its level range and matches its point', () => {
    for (const { gp, level, position } of grammarPoints) {
      const [min, max] = level === 1 ? [1, 48] : [49, 99];
      for (const card of gp.cards) {
        expect(card.introducedAtPosition).toBeGreaterThanOrEqual(min);
        expect(card.introducedAtPosition).toBeLessThanOrEqual(max);
        if (!(card.extraTargets ?? []).length) {
          expect(card.introducedAtPosition).toBe(position);
        }
      }
    }
  });
});
