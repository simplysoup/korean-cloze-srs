/**
 * Unicode Hangul syllable decomposition (U+AC00..U+D7A3).
 * This decodes the WRITTEN block only. It does not pretend to derive actual
 * spoken Korean by concatenating letters: liaison, coda neutralization,
 * assimilation and ㅎ effects require separate phonological rules.
 */
const INITIALS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

const MEDIALS = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
] as const;

const FINALS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

export interface DecodedSyllable {
  syllable: string;
  initial: string;
  medial: string;
  final: string | null;
  silentInitial: boolean;
}

export function decodeSyllable(syllable: string): DecodedSyllable | null {
  if (Array.from(syllable).length !== 1) return null;
  const codepoint = syllable.codePointAt(0);
  if (codepoint === undefined || codepoint < 0xac00 || codepoint > 0xd7a3) return null;
  const offset = codepoint - 0xac00;
  const initial = INITIALS[Math.floor(offset / 588)];
  const medial = MEDIALS[Math.floor((offset % 588) / 28)];
  const final = FINALS[offset % 28];
  return {
    syllable,
    initial,
    medial,
    final: final || null,
    silentInitial: initial === 'ㅇ',
  };
}

export function decodeWrittenWord(word: string): DecodedSyllable[] {
  return Array.from(word).map(decodeSyllable).filter(
    (value): value is DecodedSyllable => value !== null,
  );
}

export function isHangulSyllable(character: string): boolean {
  return decodeSyllable(character) !== null;
}
