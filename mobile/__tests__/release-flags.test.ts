/** Agent 13: shipped default-OFF and isolated TOPIK II flag-ON regression. */
import { CURRICULUM_FLAGS, isCurriculumFeatureEnabled } from '../src/features/flags';
import { CONTENT_POINTS, DECKS, getDeckPointIds } from '../src/store/content';

describe('release: flags OFF (live default)', () => {
  it('ships exactly eight immutable, disabled workstreams', () => {
    expect(Object.keys(CURRICULUM_FLAGS).sort()).toEqual([
      'answerFeedback', 'contrastPractice', 'hangulEnhancements', 'readingComprehension',
      'topics', 'topik2Grammar', 'transferPractice', 'vocabulary',
    ]);
    expect(Object.isFrozen(CURRICULUM_FLAGS)).toBe(true);
    for (const key of Object.keys(CURRICULUM_FLAGS) as (keyof typeof CURRICULUM_FLAGS)[]) {
      expect(isCurriculumFeatureEnabled(key)).toBe(false);
    }
  });
  it('preserves TOPIK I grammar, excludes draft points and keeps placeholder deck IDs unique', () => {
    expect(CONTENT_POINTS.length).toBeGreaterThan(0);
    expect(CONTENT_POINTS.every(p => p.deckId.startsWith('deck_topik1_'))).toBe(true);
    expect(new Set(CONTENT_POINTS.map(p => p.gp.id)).size).toBe(CONTENT_POINTS.length);
    expect(CONTENT_POINTS.map(p => p.position)).toEqual(
      Array.from({ length: CONTENT_POINTS.length }, (_, i) => i + 1),
    );
    expect(DECKS.map(d => d.id)).toEqual([
      'deck_topik1_level1', 'deck_topik1_level2', 'deck_topik2_level3',
      'deck_topik2_level4', 'deck_topik2_level5', 'deck_topik2_level6', 'deck_non_topik',
    ]);
    for (const level of [3, 4, 5, 6]) {
      expect(DECKS.filter(d => d.id === 'deck_topik2_level' + level)).toHaveLength(1);
      expect(getDeckPointIds('deck_topik2_level' + level)).toHaveLength(0);
    }
  });
});

describe('release: isolated TOPIK II gate ON (not a shipped build)', () => {
  it('activates six ordered decks with 229 unique grammar IDs and no catalogue duplicates', () => {
    let points: typeof CONTENT_POINTS = [];
    let decks: typeof DECKS = [];
    try {
      jest.isolateModules(() => {
        jest.doMock('../src/features/flags', () => ({
          CURRICULUM_FLAGS: Object.freeze({ ...CURRICULUM_FLAGS, topik2Grammar: true }),
        }));
        const content = require('../src/store/content') as typeof import('../src/store/content');
        points = content.CONTENT_POINTS;
        decks = content.DECKS;
      });
    } finally {
      jest.dontMock('../src/features/flags');
    }
    expect(points).toHaveLength(229);
    expect(new Set(points.map(p => p.gp.id)).size).toBe(229);
    expect(points.map(p => p.position)).toEqual(Array.from({ length: 229 }, (_, i) => i + 1));
    expect(decks).toHaveLength(7);
    expect(new Set(decks.map(d => d.id)).size).toBe(7);
    const levels = points.map(p => Number(p.deckId.slice(-1)));
    expect(levels).toEqual([...levels].sort((a, b) => a - b));
    for (let level = 1; level <= 6; level++) {
      const id = 'deck_topik' + (level <= 2 ? '1' : '2') + '_level' + level;
      expect(points.some(p => p.deckId === id)).toBe(true);
      expect(decks.filter(d => d.id === id)).toHaveLength(1);
    }
  });
});
