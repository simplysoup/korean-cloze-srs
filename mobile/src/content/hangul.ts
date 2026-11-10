/**
 * Hangul Practice — hand-authored reference data for the jamo drills.
 *
 * No SRS, no database: Hangul Practice is free practice (like Cram).
 * The jamo are grouped into batches, vowels first, then consonants, then
 * the advanced vowels and double consonants. Canonical romanization follows
 * Revised Romanization and matches `hangulToRoman` (except ㅇ, whose
 * search mapping is the empty string for a silent initial — here its sound
 * is 'ng', the sound it makes as a final consonant).
 */

export interface HangulExample {
  /** Korean word using the jamo, e.g. '나'. */
  hangul: string;
  /** Romanization of the word, e.g. 'na'. */
  romanization: string;
  /** English meaning, e.g. 'I, me'. */
  english: string;
}

export interface HangulJamo {
  /** The jamo character, e.g. 'ㅏ'. */
  jamo: string;
  /** Canonical romanization (Revised Romanization), e.g. 'a'. */
  romanization: string;
  /** Other accepted spellings in the Cram quiz, e.g. ['k'] for ㄱ. */
  alternates: string[];
  /** How the sound is made, in plain English, e.g. "a as in 'father'". */
  sound: string;
  /** A common word using the jamo. */
  example: HangulExample;
}

export interface HangulBatch {
  id: string;
  title: string;
  description: string;
  jamo: HangulJamo[];
}

export const HANGUL_BATCHES: HangulBatch[] = [
  {
    id: 'vowels',
    title: 'Vowels',
    description: 'The 10 basic vowels — start here.',
    jamo: [
      {
        jamo: 'ㅏ', romanization: 'a', alternates: [],
        sound: "a as in 'father'",
        example: { hangul: '나', romanization: 'na', english: 'I, me' },
      },
      {
        jamo: 'ㅓ', romanization: 'eo', alternates: ['uh'],
        sound: "uh, like the 'u' in 'cut'",
        example: { hangul: '너', romanization: 'neo', english: 'you' },
      },
      {
        jamo: 'ㅗ', romanization: 'o', alternates: [],
        sound: "o as in 'go'",
        example: { hangul: '오', romanization: 'o', english: 'five' },
      },
      {
        jamo: 'ㅜ', romanization: 'u', alternates: [],
        sound: "oo as in 'food'",
        example: { hangul: '우유', romanization: 'uyu', english: 'milk' },
      },
      {
        jamo: 'ㅡ', romanization: 'eu', alternates: ['u'],
        sound: "like 'oo' but with lips flat, not rounded",
        example: { hangul: '그', romanization: 'geu', english: 'that' },
      },
      {
        jamo: 'ㅣ', romanization: 'i', alternates: [],
        sound: "ee as in 'see'",
        example: { hangul: '이', romanization: 'i', english: 'this' },
      },
      {
        jamo: 'ㅐ', romanization: 'ae', alternates: [],
        sound: "a as in 'cat'",
        example: { hangul: '개', romanization: 'gae', english: 'dog' },
      },
      {
        jamo: 'ㅔ', romanization: 'e', alternates: [],
        sound: "e as in 'bed'",
        example: { hangul: '네', romanization: 'ne', english: 'yes' },
      },
      {
        jamo: 'ㅚ', romanization: 'oe', alternates: ['we'],
        sound: "like 'we' without the w",
        example: { hangul: '외국', romanization: 'oeguk', english: 'foreign country' },
      },
      {
        jamo: 'ㅟ', romanization: 'wi', alternates: [],
        sound: "wee as in 'week'",
        example: { hangul: '위', romanization: 'wi', english: 'above' },
      },
    ],
  },
  {
    id: 'consonants',
    title: 'Consonants',
    description: 'The 14 basic consonants.',
    jamo: [
      {
        jamo: 'ㄱ', romanization: 'g', alternates: ['k'],
        sound: "g as in 'go'; at the start of a word it sounds closer to k",
        example: { hangul: '가', romanization: 'ga', english: 'to go' },
      },
      {
        jamo: 'ㄴ', romanization: 'n', alternates: [],
        sound: "n as in 'no'",
        example: { hangul: '나', romanization: 'na', english: 'I, me' },
      },
      {
        jamo: 'ㄷ', romanization: 'd', alternates: ['t'],
        sound: "d as in 'dog'; at the start of a word it sounds closer to t",
        example: { hangul: '도', romanization: 'do', english: 'also, too' },
      },
      {
        jamo: 'ㄹ', romanization: 'r', alternates: ['l'],
        sound: 'a quick tap of the tongue — between r and l',
        example: { hangul: '사람', romanization: 'saram', english: 'person' },
      },
      {
        jamo: 'ㅁ', romanization: 'm', alternates: [],
        sound: "m as in 'mom'",
        example: { hangul: '엄마', romanization: 'eomma', english: 'mom' },
      },
      {
        jamo: 'ㅂ', romanization: 'b', alternates: ['p'],
        sound: "b as in 'boy'; at the start of a word it sounds closer to p",
        example: { hangul: '밥', romanization: 'bap', english: 'rice, meal' },
      },
      {
        jamo: 'ㅅ', romanization: 's', alternates: [],
        sound: "s as in 'sun'",
        example: { hangul: '산', romanization: 'san', english: 'mountain' },
      },
      {
        jamo: 'ㅇ', romanization: 'ng', alternates: ['silent'],
        sound: "silent at the start of a syllable; 'ng' at the end, as in 'song'",
        example: { hangul: '안', romanization: 'an', english: 'inside' },
      },
      {
        jamo: 'ㅈ', romanization: 'j', alternates: [],
        sound: "j as in 'jump'",
        example: { hangul: '집', romanization: 'jip', english: 'house' },
      },
      {
        jamo: 'ㅊ', romanization: 'ch', alternates: [],
        sound: "ch as in 'chair' (aspirated, with a puff of air)",
        example: { hangul: '차', romanization: 'cha', english: 'tea, car' },
      },
      {
        jamo: 'ㅋ', romanization: 'k', alternates: [],
        sound: "k as in 'kite' (aspirated, with a puff of air)",
        example: { hangul: '코', romanization: 'ko', english: 'nose' },
      },
      {
        jamo: 'ㅌ', romanization: 't', alternates: [],
        sound: "t as in 'top' (aspirated, with a puff of air)",
        example: { hangul: '토마토', romanization: 'tomato', english: 'tomato' },
      },
      {
        jamo: 'ㅍ', romanization: 'p', alternates: [],
        sound: "p as in 'pin' (aspirated, with a puff of air)",
        example: { hangul: '포도', romanization: 'podo', english: 'grape' },
      },
      {
        jamo: 'ㅎ', romanization: 'h', alternates: [],
        sound: "h as in 'hat'",
        example: { hangul: '하나', romanization: 'hana', english: 'one' },
      },
    ],
  },
  {
    id: 'y-vowels',
    title: 'Y-vowels & diphthongs',
    description: 'Vowels that start with a y-glide, and two-vowel blends.',
    jamo: [
      {
        jamo: 'ㅑ', romanization: 'ya', alternates: [],
        sound: "ya as in 'yard'",
        example: { hangul: '야', romanization: 'ya', english: 'hey (calling someone)' },
      },
      {
        jamo: 'ㅕ', romanization: 'yeo', alternates: [],
        sound: "yuh, like 'yu' in 'young'",
        example: { hangul: '여자', romanization: 'yeoja', english: 'woman' },
      },
      {
        jamo: 'ㅛ', romanization: 'yo', alternates: [],
        sound: "yo as in 'yoga'",
        example: { hangul: '요리', romanization: 'yori', english: 'cooking' },
      },
      {
        jamo: 'ㅠ', romanization: 'yu', alternates: [],
        sound: "yu as in 'you'",
        example: { hangul: '유명', romanization: 'yumyeong', english: 'famous' },
      },
      {
        jamo: 'ㅒ', romanization: 'yae', alternates: [],
        sound: "yae, like 'ya' + the 'a' in 'cat'",
        example: { hangul: '얘', romanization: 'yae', english: 'kid (informal)' },
      },
      {
        jamo: 'ㅖ', romanization: 'ye', alternates: [],
        sound: "ye as in 'yes'",
        example: { hangul: '예', romanization: 'ye', english: 'yes' },
      },
      {
        jamo: 'ㅘ', romanization: 'wa', alternates: [],
        sound: "wa as in 'water'",
        example: { hangul: '와', romanization: 'wa', english: 'and' },
      },
      {
        jamo: 'ㅙ', romanization: 'wae', alternates: [],
        sound: "wae, 'wa' + the 'a' in 'cat'",
        example: { hangul: '왜', romanization: 'wae', english: 'why' },
      },
      {
        jamo: 'ㅝ', romanization: 'weo', alternates: [],
        sound: "wuh, like 'wo' in 'wonder'",
        example: { hangul: '월', romanization: 'weol', english: 'month' },
      },
      {
        jamo: 'ㅞ', romanization: 'we', alternates: [],
        sound: "we as in 'wet'",
        example: { hangul: '웨딩', romanization: 'weding', english: 'wedding' },
      },
      {
        jamo: 'ㅢ', romanization: 'ui', alternates: ['eui'],
        sound: "oo-ee blended together, quickly",
        example: { hangul: '의사', romanization: 'uisa', english: 'doctor' },
      },
    ],
  },
  {
    id: 'doubles',
    title: 'Double consonants',
    description: 'The 5 tense consonants — same mouth shape, held tight.',
    jamo: [
      {
        jamo: 'ㄲ', romanization: 'kk', alternates: [],
        sound: "tense k — say 'k' but hold it tight, no puff of air",
        example: { hangul: '꼭', romanization: 'kkok', english: 'surely' },
      },
      {
        jamo: 'ㄸ', romanization: 'tt', alternates: [],
        sound: "tense t — say 't' but hold it tight, no puff of air",
        example: { hangul: '딸', romanization: 'ttal', english: 'daughter' },
      },
      {
        jamo: 'ㅃ', romanization: 'pp', alternates: [],
        sound: "tense p — say 'p' but hold it tight, no puff of air",
        example: { hangul: '빵', romanization: 'ppang', english: 'bread' },
      },
      {
        jamo: 'ㅆ', romanization: 'ss', alternates: [],
        sound: "tense s — a sharp, hissing 's'",
        example: { hangul: '쌀', romanization: 'ssal', english: 'rice (uncooked)' },
      },
      {
        jamo: 'ㅉ', romanization: 'jj', alternates: [],
        sound: "tense j — say 'j' but hold it tight",
        example: { hangul: '쪽', romanization: 'jjok', english: 'side' },
      },
    ],
  },
];

/** Total jamo across all batches (40). */
export const HANGUL_JAMO_COUNT = HANGUL_BATCHES.reduce((n, b) => n + b.jamo.length, 0);

/**
 * Is this typed romanization an accepted answer for the jamo?
 * Case-insensitive, trims whitespace, accepts the canonical romanization
 * and any listed alternates (ㄱ accepts 'g' and 'k'; ㅇ accepts 'ng' and
 * 'silent'). An empty answer is never correct.
 */
export function isCorrectRomanization(jamo: HangulJamo, input: string): boolean {
  const normalized = input.trim().toLowerCase();
  if (normalized === '') return false;
  return normalized === jamo.romanization || jamo.alternates.includes(normalized);
}
