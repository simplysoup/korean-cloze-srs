/**
 * romanToHangul.ts
 *
 * Converts romanized (English) text to assembled Hangul syllable blocks.
 *
 * Architecture
 * ────────────
 * Three position-aware index tables (INITIAL, MEDIAL, FINAL) are derived
 * from the standard Unicode Hangul syllable formula:
 *
 *   codepoint = initial × 588 + medial × 28 + final + 0xAC00
 *
 * A three-state machine (NEED_INITIAL → NEED_MEDIAL → NEED_FINAL) processes
 * the input left-to-right with greedy longest-match at each state.
 *
 * Coda / onset disambiguation
 * ───────────────────────────
 * When a valid final consonant is found but the next characters start a valid
 * medial vowel, the consonant must be the onset of the *next* syllable, not
 * the coda of the current one.  For compound clusters (e.g. "ng" in "hangug")
 * the cluster is split: the leading part stays as coda and the trailing part
 * is pushed back as the next onset.
 *
 * Romanization conventions supported
 * ───────────────────────────────────
 * • Revised Romanization: g/d/b/r (basic), k/t/p (also ㄱ/ㄷ/ㅂ intuitive)
 * • Yale / IPA-adjacent: c=ㅈ, cc/jj=ㅉ, ch=ㅊ, kh=ㅋ, ph=ㅍ, th=ㅌ
 * • MR intuitive English: k=ㅋ is NOT used; k=ㄱ, kh=ㅋ
 * • Vowel alternates: ae/ai/ay, eo/eu, wae/wai/way, oe/oi/oy, ui/uy/eui …
 * • Special: "-" = syllable separator (consumed), "\-" = literal hyphen,
 *            "." = separator (consumed),             "\." = literal period
 */

// ─────────────────────────────────────────────────────────────────────────────
// Unicode Hangul syllable formula
//   codepoint = INITIAL[i] × 588 + MEDIAL[m] × 28 + FINAL[f] + 0xAC00
//
// Index ordering matches the Unicode Hangul Compatibility Jamo block exactly:
//   Initial (19):  ㄱ0 ㄲ1 ㄴ2 ㄷ3 ㄸ4 ㄹ5 ㅁ6 ㅂ7 ㅃ8 ㅅ9 ㅆ10 ㅇ11 ㅈ12 ㅉ13 ㅊ14 ㅋ15 ㅌ16 ㅍ17 ㅎ18
//   Medial  (21):  ㅏ0 ㅐ1 ㅑ2 ㅒ3 ㅓ4 ㅔ5 ㅕ6 ㅖ7 ㅗ8 ㅘ9 ㅙ10 ㅚ11 ㅛ12 ㅜ13 ㅝ14 ㅞ15 ㅟ16 ㅠ17 ㅡ18 ㅢ19 ㅣ20
//   Final   (28):  (none)0 ㄱ1 ㄲ2 ㄳ3 ㄴ4 ㄵ5 ㄶ6 ㄷ7 ㄹ8 ㄺ9 ㄻ10 ㄼ11 ㄽ12 ㄾ13 ㄿ14 ㅀ15 ㅁ16 ㅂ17 ㅄ18 ㅅ19 ㅆ20 ㅇ21 ㅈ22 ㅊ23 ㅋ24 ㅌ25 ㅍ26 ㅎ27
// ─────────────────────────────────────────────────────────────────────────────

const HANGUL_BASE = 0xac00;
const MAX_LEN = 4; // longest romanization sequence to try ("wae"=3, "tsch"=4 etc)

// ── Initial consonant map (roman → index 0–18) ───────────────────────────────
// Supports: basic revised romanization, Yale (c=ㅈ), IPA-adjacent aspirate
// notation (kh/ph/th = ㅋ/ㅍ/ㅌ), and intuitive English k/p/t (= ㄱ/ㅂ/ㄷ).
const INITIAL: Readonly<Record<string, number>> = {
	g: 0,  gg: 1, kk: 1,
	n: 2,
	d: 3,  dd: 4, tt: 4,
	r: 5,  l: 5,
	m: 6,
	b: 7,  bb: 8, pp: 8,
	s: 9,  ss: 10,
	// ㅇ silent onset — only used internally (see SILENT_ONSET); not a user input
	j: 12, c: 12, jj: 13, cc: 13, tch: 13, tss: 13,
	ch: 14, jh: 14, tsh: 14,  "ch'": 14,
	k: 15,  kh: 15, "k'": 15,
	t: 16,  th: 16, "t'": 16,
	p: 17, ph: 17, "p'": 17,
	h: 18,
	ts: 12,
};

const SILENT_ONSET = 11; // ㅇ — used when a syllable begins with a vowel

// ── Medial vowel map (roman → index 0–20) ────────────────────────────────────
// Note: j-prefix Yale vowels (ja=ㅑ, ju=ㅠ etc.) are intentionally excluded.
// They conflict with j=ㅈ and cause false `startsMedial` detections that break
// the coda/onset lookahead logic (e.g. "gyeongju": ng before ju would be
// mis-split because ju=ㅠ appears to start a medial sequence).
// Use y-prefix forms (ya, yeo, yo, yu) instead — they are unambiguous.
const MEDIAL: Readonly<Record<string, number>> = {
	a: 0,
	ae: 1,   ai: 1,   ay: 1,
	ya: 2,
	yae: 3,  yai: 3,  yay: 3,
	eo: 4,
	e: 5,    ey: 5,
	yeo: 6,
	ye: 7,   yey: 7,
	o: 8,
	wa: 9,
	wae: 10, wai: 10, way: 10,
	oe: 11,  oi: 11,  oy: 11,
	yo: 12,
	u: 13,
	weo: 14, wo: 14,
	we: 15,  wey: 15,
	wi: 16,
	yu: 17,
	eu: 18,
	ui: 19,  uy: 19,  eui: 19,
	i: 20,
};

// ── Final consonant map (roman → index 0–27, 0 = no coda) ───────────────────
// Compound clusters (ㄳ, ㄵ, ㄺ … ㅄ) are included; the coda-split logic
// (see below) handles ambiguous boundaries when followed by a vowel.
const FINAL: Readonly<Record<string, number>> = {
	g: 1,   k: 1,
	gg: 2,  kk: 2,
	gs: 3,  ks: 3,
	n: 4,
	nj: 5,  nc: 5,
	nh: 6,  nch: 6,
	d: 7,   t: 7,
	l: 8,   r: 8,
	lg: 9,  lk: 9,
	lm: 10,
	lb: 11, lp: 11,
	ls: 12,
	lt: 13, lth: 13,
	lph: 14,
	lh: 15,
	m: 16,
	b: 17,  p: 17,
	bs: 18, ps: 18,
	s: 19,
	ss: 20,
	ng: 21,
	j: 22,  c: 22,  ts: 22,
	ch: 23, jh: 23, tsh: 23, "ch'": 23,
	kh: 24, "k'": 24,
	th: 25, "t'": 25,
	ph: 26, "p'": 26,
	h: 27,
};

// ── Special replacement sequences ────────────────────────────────────────────
const SPECIAL: Readonly<Record<string, string>> = {
	'-':   '',   // syllable boundary separator (consumed)
	'\\-': '-',  // literal hyphen
	'.':   '',   // sentence/word boundary (consumed)
	'\\.': '.',  // literal period
};

// ── Coda split table ──────────────────────────────────────────────────────────
// When a compound final sequence is immediately followed by a medial vowel, it
// must be split: the leading part stays as the coda of the current syllable and
// the trailing part becomes the onset of the next syllable.
// e.g.  "hangug": ng+u  →  n (coda ㄴ) | g (onset of 국)
// Single-consonant clusters are not listed — they are always pushed to the next
// syllable entirely when followed by a vowel (coda = '', pushed = entire match).
const CODA_SPLIT: Readonly<Record<string, [codaRoman: string, pushedRoman: string]>> = {
	// Compound clusters → split at the natural consonant boundary
	ng:  ['n',  'g'],
	nj:  ['n',  'j'],
	nc:  ['n',  'c'],
	nh:  ['n',  'h'],
	nch: ['n',  'ch'],
	gs:  ['g',  's'],
	ks:  ['k',  's'],
	gg:  ['g',  'g'],
	kk:  ['k',  'k'],
	lg:  ['l',  'g'],
	lk:  ['l',  'k'],
	lm:  ['l',  'm'],
	lb:  ['l',  'b'],
	lp:  ['l',  'p'],
	ls:  ['l',  's'],
	lt:  ['l',  't'],
	lth: ['l',  'th'],
	lph: ['l',  'ph'],
	lh:  ['l',  'h'],
	bs:  ['b',  's'],
	ps:  ['p',  's'],
	ss:  ['s',  's'],
	// Aspirate digraphs used as finals → whole digraph pushes to next onset
	ch:  ['',   'ch'],
	jh:  ['',   'jh'],
	kh:  ['',   'kh'],
	th:  ['',   'th'],
	ph:  ['',   'ph'],
	ts:  ['',   'ts'],
	tsh: ['',   'tsh'],
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Return the longest matching key in `table` starting at `pos` in `s`. */
function greedyMatch(table: Readonly<Record<string, number>>, s: string, pos: number): string | null {
	for (let len = Math.min(MAX_LEN, s.length - pos); len > 0; len--) {
		const sub = s.substring(pos, pos + len);
		if (table[sub] !== undefined) return sub;
	}
	return null;
}

/** True when the substring of `s` starting at `pos` begins a valid medial vowel. */
function startsMedial(s: string, pos: number): boolean {
	return greedyMatch(MEDIAL, s, pos) !== null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core state machine
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a romanized string to assembled Hangul syllable blocks.
 *
 * @example
 *   romanToHangul('annyeonghaseyo') // → '안녕하세요'
 *   romanToHangul('hangug')         // → '한국'
 *   romanToHangul('jjigae')         // → '찌개'
 *   romanToHangul('bulgogi')        // → '불고기'
 *   romanToHangul('Seoul')          // → '서울'
 */
export function romanToHangul(input: string): string {
	if (!input) return '';

	// Append a sentinel space so any in-progress syllable is flushed at the end.
	const s = input.toLowerCase() + ' ';
	let pos = 0;
	let result = '';

	// State variables — -1 means "not yet found"
	let initialVal = -1;   // index into INITIAL (0–18)
	let initialRoman = ''; // the roman text consumed for the initial
	let medialVal = -1;    // index into MEDIAL (0–20)

	while (pos < s.length) {

		// ── STATE: NEED_INITIAL ─────────────────────────────────────────────
		if (initialVal === -1) {

			// 1. Try to match an initial consonant.
			const initMatch = greedyMatch(INITIAL, s, pos);
			if (initMatch !== null) {
				initialVal = INITIAL[initMatch];
				initialRoman = initMatch;
				pos += initMatch.length;
				continue;
			}

			// 2. No initial consonant — try to match a medial vowel directly.
			//    If found, use the silent ㅇ (index 11) as the implicit onset.
			const medMatch = greedyMatch(MEDIAL, s, pos);
			if (medMatch !== null) {
				initialVal = SILENT_ONSET;
				initialRoman = '';
				medialVal = MEDIAL[medMatch];
				pos += medMatch.length;
				continue; // skip straight to NEED_FINAL
			}

			// 3. No jamo match — try special sequences, then pass char through.
			let handled = false;
			for (let len = Math.min(MAX_LEN, s.length - pos); len > 0; len--) {
				const sub = s.substring(pos, pos + len);
				if (SPECIAL[sub] !== undefined) {
					result += SPECIAL[sub];
					pos += len;
					handled = true;
					break;
				}
			}
			if (!handled) {
				// Pass the character through as-is (spaces, digits, punctuation…)
				// but strip the sentinel space we appended.
				if (pos < s.length - 1) result += s[pos];
				pos++;
			}

		// ── STATE: NEED_MEDIAL ──────────────────────────────────────────────
		} else if (medialVal === -1) {

			const medMatch = greedyMatch(MEDIAL, s, pos);
			if (medMatch !== null) {
				medialVal = MEDIAL[medMatch];
				pos += medMatch.length;
				continue; // proceed to NEED_FINAL
			}

			// No medial found — the initial consonant cannot start a syllable.
			// Output its raw roman text and reset state.
			result += initialRoman;
			initialVal = -1;
			initialRoman = '';
			// Do NOT advance pos — re-process the same character.

		// ── STATE: NEED_FINAL ───────────────────────────────────────────────
		} else {

			// Try to match a final consonant sequence.
			const finalMatch = greedyMatch(FINAL, s, pos);

			if (finalMatch !== null) {
				const afterFinal = pos + finalMatch.length;

				if (startsMedial(s, afterFinal)) {
					// The next characters start a vowel → this consonant belongs to
					// the NEXT syllable's onset, not this syllable's coda.

					// For compound clusters, split at the natural boundary.
					const split = CODA_SPLIT[finalMatch];
					if (split) {
						const [codaRoman, pushedRoman] = split;
						const codaFinal = codaRoman ? (FINAL[codaRoman] ?? 0) : 0;
						// Emit current syllable with the leading part as coda.
						result += String.fromCharCode(
							initialVal * 588 + medialVal * 28 + codaFinal + HANGUL_BASE
						);
						// Push the trailing part back so it is picked up as the next onset.
						pos += finalMatch.length - pushedRoman.length;
					} else {
						// Single consonant before a vowel → it is purely the next onset.
						result += String.fromCharCode(
							initialVal * 588 + medialVal * 28 + HANGUL_BASE
						);
						// Leave pos unchanged so the consonant is re-processed as INITIAL.
					}
				} else {
					// No vowel follows → consume as coda and emit syllable.
					result += String.fromCharCode(
						initialVal * 588 + medialVal * 28 + FINAL[finalMatch] + HANGUL_BASE
					);
					pos = afterFinal;
				}
			} else {
				// No final consonant — emit syllable without coda.
				result += String.fromCharCode(
					initialVal * 588 + medialVal * 28 + HANGUL_BASE
				);
				// Leave pos unchanged so the current character is re-processed.
			}

			// Reset for next syllable.
			initialVal = -1;
			initialRoman = '';
			medialVal = -1;
		}
	}

	return result;
}

/**
 * Lower-level helper: returns the individual jamo characters (as Unicode
 * compatibility jamo codepoints) for the given romanized input, without
 * assembling them into syllable blocks.  Useful for debugging or display.
 */
export function parseRoman(input: string): string[] {
	// Run through the state machine syllable by syllable and disassemble each
	// block back to its constituent jamo using the Unicode arithmetic.
	const assembled = romanToHangul(input);
	const result: string[] = [];

	const CHO  = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
	const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
	const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

	for (const ch of assembled) {
		const cp = ch.codePointAt(0)!;
		if (cp >= 0xac00 && cp <= 0xd7a3) {
			const offset = cp - 0xac00;
			const jong = offset % 28;
			const jung = ((offset - jong) / 28) % 21;
			const cho  = Math.floor(offset / 588);
			result.push(CHO[cho], JUNG[jung]);
			if (jong) result.push(JONG[jong]);
		} else {
			result.push(ch);
		}
	}

	return result;
}
