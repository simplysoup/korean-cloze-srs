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
   * The English hint's 'direct' highlight must be the English word for the
   * blanked Korean grammar — not the noun it attaches to. (Build 17: the
   * copula highlighted the noun, "I am a [student]", and prepositions
   * highlighted the whole phrase, "I go [to school]".)
   */
  it("highlights the grammar's English word, not the noun", () => {
    const directOf = (id: string) => {
      const item = [...cards, ...examples].find((x) => x.id === id);
      expect(item).toBeDefined();
      const direct = item!.englishHint.filter((p) => p.highlightType === 'direct');
      expect(direct).toHaveLength(1);
      return direct[0].text;
    };
    expect(directOf('cc_ieyo_01')).toBe('am');
    expect(directOf('cc_ieyo_03')).toBe("'s");
    expect(directOf('cc_ida_01')).toBe('Is');
    expect(directOf('cc_do_01')).toBe('also');
    expect(directOf('cc_hago_01')).toBe('and');
    expect(directOf('cc_hago_02')).toBe('with');
    expect(directOf('cc_neyo_01')).toBe('Oh,');
    expect(directOf('cc_e_loc_01')).toBe('to');
    expect(directOf('cc_e_loc_02')).toBe('at');
    expect(directOf('cc_eseo_01')).toBe('at');
    expect(directOf('cc_e_time_01')).toBe('on');
    expect(directOf('cc_buteo_01')).toBe('from');
    expect(directOf('cc_kkaji_01')).toBe('until');
    expect(directOf('cc_jeone_01')).toBe('before');
    expect(directOf('cc_hue_01')).toBe('after');
    // The hint sentence itself is unchanged by the re-split.
    const ieyo = cards.find((c) => c.id === 'cc_ieyo_01')!;
    expect(ieyo.englishHint.map((p) => p.text).join('')).toBe('I am a student.');
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
