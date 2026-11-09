/**
 * Answer checking ported from the old app's answers.ts (Codex Level 1
 * patch): normalization before comparing, and targeted explanations for
 * the most common confusions after a wrong answer.
 */
import {
  answerExplanation,
  checkAnswers,
  normalizeAnswer,
} from '../src/lib/srs';

describe('normalizeAnswer', () => {
  it('trims and collapses whitespace', () => {
    expect(normalizeAnswer('  이에요  ')).toBe('이에요');
    expect(normalizeAnswer('수  없어요')).toBe('수 없어요');
  });

  it('normalizes decomposed Hangul to NFC', () => {
    const decomposed = '이에요'.normalize('NFD');
    expect(normalizeAnswer(decomposed)).toBe('이에요');
  });
});

describe('checkAnswers', () => {
  it('accepts an answer with stray whitespace', () => {
    expect(checkAnswers([' 이에요 '], ['이에요'])).toBe(true);
  });

  it('accepts a decomposed-Hangul answer', () => {
    expect(checkAnswers(['이에요'.normalize('NFD')], ['이에요'])).toBe(true);
  });

  it('still rejects a wrong particle', () => {
    expect(checkAnswers(['에서'], ['에'])).toBe(false);
  });
});

describe('answerExplanation', () => {
  it('explains 에 vs 에서 when 에서 was expected and 에 was typed', () => {
    const text = answerExplanation('gp_eseo', '에서', '에');
    expect(text).toMatch(/where an action happens/);
  });

  it('explains 에 vs 에서 when 에 was expected and 에서 was typed', () => {
    const text = answerExplanation('gp_e_loc', '에', '에서');
    expect(text).toMatch(/destination or where something is/);
  });

  it('gives the consonant/vowel rule for particle pairs', () => {
    expect(answerExplanation('gp_eun_neun', '은', '는')).toMatch(/받침/);
    expect(answerExplanation('gp_i_ga', '가', '이')).toMatch(/받침/);
    expect(answerExplanation('gp_ieyo_yeyo', '예요', '이에요')).toMatch(/받침/);
  });

  it('returns undefined for points with no specific explanation', () => {
    expect(answerExplanation('gp_an', '안', '못')).toBeUndefined();
  });
});
