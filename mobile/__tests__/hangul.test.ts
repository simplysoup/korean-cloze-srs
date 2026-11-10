/**
 * Hangul Practice data + romanization matching.
 * The cram quiz types a romanization for a shown jamo; the canonical answer
 * is Revised Romanization, with common alternates accepted (ㄱ 'g'/'k',
 * ㅇ 'ng'/'silent').
 */
import { HANGUL_BATCHES, HANGUL_JAMO_COUNT, isCorrectRomanization } from '../src/content/hangul';
import { hangulToRoman } from '../src/lib/hangulToRoman';

// Decompose composed Hangul syllables into their jamo, so the test can
// check an example word really contains its jamo. A compatibility jamo
// (e.g. 'ㅏ') never appears as a literal substring of a composed syllable
// (e.g. '나'), so String.includes is the wrong check here.
const INITIALS = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const MEDIALS = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const FINALS = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

function jamoInWord(word: string, jamo: string): boolean {
  for (const char of word) {
    const code = char.codePointAt(0)!;
    if (code >= 0xac00 && code < 0xac00 + 11172) {
      const offset = code - 0xac00;
      const initialIdx = Math.floor(offset / (21 * 28));
      const medialIdx = Math.floor((offset % (21 * 28)) / 28);
      const finalIdx = offset % 28;
      if (
        INITIALS[initialIdx] === jamo ||
        MEDIALS[medialIdx] === jamo ||
        FINALS[finalIdx] === jamo
      ) {
        return true;
      }
    } else if (char === jamo) {
      return true;
    }
  }
  return false;
}

function findJamo(char: string) {
  for (const batch of HANGUL_BATCHES) {
    const found = batch.jamo.find((j) => j.jamo === char);
    if (found) return found;
  }
  throw new Error(`jamo ${char} not found`);
}

describe('isCorrectRomanization', () => {
  it('accepts the canonical romanization', () => {
    expect(isCorrectRomanization(findJamo('ㅏ'), 'a')).toBe(true);
    expect(isCorrectRomanization(findJamo('ㅓ'), 'eo')).toBe(true);
    expect(isCorrectRomanization(findJamo('ㅃ'), 'pp')).toBe(true);
  });

  it('accepts listed alternates', () => {
    // Lenis consonants sound closer to the voiceless stop at word start.
    expect(isCorrectRomanization(findJamo('ㄱ'), 'k')).toBe(true);
    expect(isCorrectRomanization(findJamo('ㄷ'), 't')).toBe(true);
    expect(isCorrectRomanization(findJamo('ㅂ'), 'p')).toBe(true);
    // ㅇ is silent initially and 'ng' finally — both are accepted.
    expect(isCorrectRomanization(findJamo('ㅇ'), 'ng')).toBe(true);
    expect(isCorrectRomanization(findJamo('ㅇ'), 'silent')).toBe(true);
    expect(isCorrectRomanization(findJamo('ㅓ'), 'uh')).toBe(true);
  });

  it('is case-insensitive and trims whitespace', () => {
    expect(isCorrectRomanization(findJamo('ㅏ'), ' A ')).toBe(true);
    expect(isCorrectRomanization(findJamo('ㄱ'), 'G')).toBe(true);
  });

  it('rejects empty input and wrong answers', () => {
    expect(isCorrectRomanization(findJamo('ㅏ'), '')).toBe(false);
    expect(isCorrectRomanization(findJamo('ㅏ'), '   ')).toBe(false);
    expect(isCorrectRomanization(findJamo('ㅏ'), 'o')).toBe(false);
    // ㅊ is 'ch' — ㅈ is not.
    expect(isCorrectRomanization(findJamo('ㅈ'), 'ch')).toBe(false);
    // ㅐ is 'ae' — ㅔ is not.
    expect(isCorrectRomanization(findJamo('ㅐ'), 'e')).toBe(false);
  });
});

describe('HANGUL_BATCHES data', () => {
  it('covers the full jamo set in 4 batches, vowels first', () => {
    expect(HANGUL_BATCHES).toHaveLength(4);
    expect(HANGUL_JAMO_COUNT).toBe(40);
    expect(HANGUL_BATCHES.map((b) => b.id)).toEqual([
      'vowels',
      'consonants',
      'y-vowels',
      'doubles',
    ]);
    expect(HANGUL_BATCHES[0].jamo).toHaveLength(10);
    expect(HANGUL_BATCHES[1].jamo).toHaveLength(14);
    expect(HANGUL_BATCHES[2].jamo).toHaveLength(11);
    expect(HANGUL_BATCHES[3].jamo).toHaveLength(5);
  });

  it('has no duplicate jamo and every entry is complete', () => {
    const seen = new Set<string>();
    for (const batch of HANGUL_BATCHES) {
      for (const j of batch.jamo) {
        expect(seen.has(j.jamo)).toBe(false);
        seen.add(j.jamo);
        expect(j.romanization.length).toBeGreaterThan(0);
        expect(j.sound.length).toBeGreaterThan(0);
        expect(j.example.hangul.length).toBeGreaterThan(0);
        expect(j.example.romanization.length).toBeGreaterThan(0);
        expect(j.example.english.length).toBeGreaterThan(0);
        // The example word actually contains the jamo (decomposed).
        expect(jamoInWord(j.example.hangul, j.jamo)).toBe(true);
      }
    }
    expect(seen.size).toBe(40);
  });

  it('canonical romanizations match hangulToRoman, except ㅇ', () => {
    // hangulToRoman maps a silent initial ㅇ to '' (search use); the drill
    // teaches its sound 'ng' instead.
    for (const batch of HANGUL_BATCHES) {
      for (const j of batch.jamo) {
        if (j.jamo === 'ㅇ') {
          expect(j.romanization).toBe('ng');
        } else {
          expect(hangulToRoman(j.jamo)).toBe(j.romanization);
        }
      }
    }
  });
});
