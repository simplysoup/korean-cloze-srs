/**
 * Simplified Hangul → romanized conversion for search matching.
 * NOT proper Revised Romanization — just maps each jamo to its most common
 * romanized representation so users can search "neun" and find "는".
 */

const HANGUL_BASE = 0xac00;

// Initial consonants (19 jamo, index 0–18)
const INITIALS = [
	'g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp',
	's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'
];

// Medial vowels (21 jamo, index 0–20)
const MEDIALS = [
	'a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye',
	'o', 'wa', 'wae', 'oe', 'yo', 'u', 'weo', 'we',
	'wi', 'yu', 'eu', 'ui', 'i'
];

// Final consonants (28 values, index 0 = none, 1–27)
const FINALS = [
	'', 'k', 'kk', 'ks', 'n', 'nj', 'nh', 't', 'l',
	'lk', 'lm', 'lb', 'ls', 'lt', 'lp', 'lh', 'm', 'p',
	'ps', 's', 'ss', 'ng', 'j', 'ch', 'k', 't', 'p', 'h'
];

// Compatibility jamo (ㄱ–ㅎ, ㅏ–ㅣ) — used in grammar point titles like "은/는"
const COMPAT_CONSONANTS: Record<string, string> = {
	'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt',
	'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp', 'ㅅ': 's',
	'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch',
	'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h'
};

const COMPAT_VOWELS: Record<string, string> = {
	'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'eo',
	'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye', 'ㅗ': 'o', 'ㅘ': 'wa',
	'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'weo',
	'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui', 'ㅣ': 'i'
};

/**
 * Convert a string containing Hangul syllables and/or jamo into a
 * romanized representation suitable for search matching.
 * Non-Hangul characters pass through as-is (lowercased).
 */
export function hangulToRoman(text: string): string {
	let result = '';

	for (const char of text) {
		const code = char.codePointAt(0)!;

		// Composed Hangul syllable (가–힣)
		if (code >= HANGUL_BASE && code < HANGUL_BASE + 11172) {
			const offset = code - HANGUL_BASE;
			const initialIdx = Math.floor(offset / (21 * 28));
			const medialIdx = Math.floor((offset % (21 * 28)) / 28);
			const finalIdx = offset % 28;

			result += INITIALS[initialIdx] + MEDIALS[medialIdx] + FINALS[finalIdx];
		}
		// Compatibility consonant jamo (ㄱ–ㅎ, U+3131–U+314E)
		else if (COMPAT_CONSONANTS[char] !== undefined) {
			result += COMPAT_CONSONANTS[char];
		}
		// Compatibility vowel jamo (ㅏ–ㅣ, U+314F–U+3163)
		else if (COMPAT_VOWELS[char] !== undefined) {
			result += COMPAT_VOWELS[char];
		}
		// Pass through non-Hangul (spaces, hyphens, slashes, etc.)
		else {
			result += char.toLowerCase();
		}
	}

	return result;
}
