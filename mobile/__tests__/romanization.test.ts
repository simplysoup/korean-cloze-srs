import { romanToHangul, parseRoman } from '../src/lib/romanToHangul';
import { hangulToRoman } from '../src/lib/hangulToRoman';

describe('romanToHangul', () => {
  it.each([
    ['neun', '는'],
    ['eun', '은'],
    ['i', '이'],
    ['ga', '가'],
    ['eul', '을'],
    ['reul', '를'],
    ['hangug', '한국'],
    ['annyeong', '안녕'],
    ['haksaeng', '학생'],
    ['seonsaengnim', '선생님'],
    ['mannaseo', '만나서'],
  ])('converts %s to %s', (input, expected) => {
    expect(romanToHangul(input)).toBe(expected);
  });

  it('returns empty string for empty input', () => {
    expect(romanToHangul('')).toBe('');
  });

  it('passes through a bare vowel onset with silent ㅇ', () => {
    expect(romanToHangul('a')).toBe('아');
  });
});

describe('parseRoman', () => {
  it('returns the individual jamo for romanized input', () => {
    expect(parseRoman('hangug')).toEqual(['ㅎ', 'ㅏ', 'ㄴ', 'ㄱ', 'ㅜ', 'ㄱ']);
  });
});

describe('hangulToRoman (search helper)', () => {
  it('romanizes Hangul syllables for search matching', () => {
    expect(hangulToRoman('는')).toBe('neun');
    expect(hangulToRoman('학생')).toBe('haksaeng');
  });
});
