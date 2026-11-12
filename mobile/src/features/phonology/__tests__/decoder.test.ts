import { decodeSyllable, decodeWrittenWord, isHangulSyllable } from '../decoder';

describe('Unicode syllable block decoding', () => {
  it('identifies initial, medial and final for basic syllables', () => {
    expect(decodeSyllable('가')).toEqual({
      syllable: '가', initial: 'ㄱ', medial: 'ㅏ', final: null, silentInitial: false,
    });
    expect(decodeSyllable('강')).toEqual({
      syllable: '강', initial: 'ㄱ', medial: 'ㅏ', final: 'ㅇ', silentInitial: false,
    });
    expect(decodeSyllable('꽃')).toEqual({
      syllable: '꽃', initial: 'ㄲ', medial: 'ㅗ', final: 'ㅊ', silentInitial: false,
    });
    expect(decodeSyllable('책')).toEqual({
      syllable: '책', initial: 'ㅊ', medial: 'ㅐ', final: 'ㄱ', silentInitial: false,
    });
  });

  it('distinguishes initial silent ㅇ from final nasal ㅇ', () => {
    expect(decodeSyllable('아')?.silentInitial).toBe(true);
    expect(decodeSyllable('아')?.final).toBeNull();
    expect(decodeSyllable('강')?.silentInitial).toBe(false);
    expect(decodeSyllable('강')?.final).toBe('ㅇ');
  });

  it('handles compound vowels and compound 받침 without false phonetic respelling', () => {
    expect(decodeSyllable('읽')).toMatchObject({ initial: 'ㅇ', medial: 'ㅣ', final: 'ㄺ' });
    expect(decodeSyllable('괜')).toMatchObject({ initial: 'ㄱ', medial: 'ㅙ', final: 'ㄴ' });
    expect(decodeWrittenWord('국물')).toHaveLength(2);
    expect(decodeWrittenWord('국물').map((item) => item.final)).toEqual(['ㄱ', 'ㄹ']);
    expect(decodeWrittenWord('꽃이').map((item) => item.initial)).toEqual(['ㄲ', 'ㅇ']);
    expect(decodeWrittenWord('꽃이').map((item) => item.final)).toEqual(['ㅊ', null]);
  });

  it('ignores non-Hangul characters and rejects non-syllable inputs', () => {
    expect(decodeSyllable('ㅏ')).toBeNull();
    expect(decodeSyllable('a')).toBeNull();
    expect(decodeSyllable('가나')).toBeNull();
    expect(decodeWrittenWord('국물! 10')).toHaveLength(2);
    expect(decodeWrittenWord('')).toEqual([]);
    expect(isHangulSyllable('힣')).toBe(true);
    expect(isHangulSyllable('ㄱ')).toBe(false);
  });
});
