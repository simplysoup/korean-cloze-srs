/** In-app six-deck seed integrity, including source-level grammar gap integrations. */
import b1 from '../src/content/topik1-level1.json';
import b2 from '../src/content/topik1-level2.json';
import b3 from '../src/content/topik2-level3.json';
import b4 from '../src/content/topik2-level4.json';
import b5 from '../src/content/topik2-level5.json';
import b6 from '../src/content/topik2-level6.json';
import { flattenContent, type ContentBundle } from '../src/content/types';

const bundles = [b1,b2,b3,b4,b5,b6];
const expected = [
  { points: 65, examples: 143, cards: 229, start: 1, end: 65, lessons: 11 },
  { points: 59, examples: 118, cards: 177, start: 66, end: 124, lessons: 11 },
  { points: 32, examples: 64, cards: 96, start: 125, end: 156, lessons: 6 },
  { points: 25, examples: 50, cards: 75, start: 157, end: 181, lessons: 6 },
  { points: 24, examples: 48, cards: 72, start: 182, end: 205, lessons: 6 },
  { points: 24, examples: 48, cards: 72, start: 206, end: 229, lessons: 6 },
];
const all = bundles.flatMap((bundle, i) =>
  flattenContent(bundle as unknown as ContentBundle).grammarPoints.map(entry => ({
    ...entry, level: i + 1, position: expected[i].start + entry.position - 1,
  })),
);
const cards = all.flatMap(({ gp }) => gp.cards);
const examples = all.flatMap(({ gp }) => gp.lessonExamples);
const allIds = new Set(all.map(({ gp }) => gp.id));

describe('grammar source coverage across six decks', () => {
  it('has expected levels, worked examples and cards, without changing the original point IDs', () => {
    bundles.forEach((bundle, i) => {
      const points = flattenContent(bundle as unknown as ContentBundle).grammarPoints.map(x => x.gp);
      expect(bundle.lessons.length).toBe(expected[i].lessons);
      expect(points.length).toBe(expected[i].points);
      expect(points.flatMap(g => g.lessonExamples).length).toBe(expected[i].examples);
      expect(points.flatMap(g => g.cards).length).toBe(expected[i].cards);
    });
    expect(all.length).toBe(229);
    expect(cards.length).toBe(721);
    expect(examples.length).toBe(471);
    expect(allIds.has('gp_ieyo_yeyo')).toBe(true);
    expect(allIds.has('gp_gap_b_irregular')).toBe(true);
    expect(allIds.has('gp_gap_passive_suffix')).toBe(true);
  });

  it('uses 229 continuous one-based positions in six levels', () => {
    expect(all.map(x => x.position)).toEqual(Array.from({ length: 229 }, (_, i) => i + 1));
  });

  it('uses unique stable IDs for point, example, and review card', () => {
    const ids = [...all.map(({ gp }) => gp.id), ...cards.map(c => c.id), ...examples.map(e => e.id)];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every cloze reconstructs exactly and every card has a plain-English explanation', () => {
    for (const c of [...cards, ...examples]) {
      expect(c.sentenceWithBlank.split('___').length).toBe(2);
      expect(c.sentenceWithBlank.replace('___', c.answer)).toBe(c.fullSentence);
      expect(typeof c.englishHint).toBe('string');
      expect(c.englishHint.trim().length).toBeGreaterThan(0);
    }
    expect(cards.find(c=>c.id==='cc_ieyo_01')!.englishHint).toBe('I am a student.');
    expect(cards.find(c=>c.id==='cc_ieyo_03')!.englishHint).toBe("It's a teacher.");
  });

  it('every point explains meaning, formation, worked example and the common trap', () => {
    for (const { gp } of all) {
      expect(gp.description.length).toBeGreaterThan(0);
      expect(gp.lessonExamples.length).toBeGreaterThanOrEqual(2);
      expect(gp.cards.length).toBeGreaterThanOrEqual(3);
      const titles = (gp.notes ?? []).map(x => x.title);
      for (const name of ['Build it step by step','Worked example','Common trap']) {
        expect(titles).toContain(name);
      }
    }
  });

  it('all related targets exist and card positions reflect owning and extra targets', () => {
    const positions = new Map(all.map(x => [x.gp.id,x.position] as const));
    for (const { gp,level,position } of all) {
      for (const id of gp.relatedPointIds ?? []) expect(allIds.has(id)).toBe(true);
      const spec = expected[level-1];
      for (const card of gp.cards) {
        const targets = (card.extraTargets ?? []).map(x => {
          expect(allIds.has(x.grammarPointId)).toBe(true);
          return positions.get(x.grammarPointId)!;
        });
        expect(card.introducedAtPosition).toBe(Math.max(position,...targets));
        expect(card.introducedAtPosition).toBeGreaterThanOrEqual(spec.start);
        // Multi-target cards may draw on a later deck, so they may exceed
        // their owning deck's end; a single-target card never does.
        if (!targets.length) expect(card.introducedAtPosition).toBeLessThanOrEqual(spec.end);
      }
    }
  });
});
