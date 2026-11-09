import type { LessonSeed } from '../types';

// ══════════════════════════════════════════════════════════════════════════════
// Lesson 6 — Modifiers and Degree
//
// Grammar points (positions 31–33):
//  31. -(으)ㄴ          Adjective modifier (makes adj → noun modifier)
//  32. 만               Only / just (particle)
//  33. -ㄴ 것 같다      Seems like / appears to (present state guess)
//
// Available: all L1–L5 grammar (pos 1–30).
// ══════════════════════════════════════════════════════════════════════════════

const h = (text: string, highlightType: 'none' | 'direct' | 'related' = 'none') => ({ text, highlightType });

export const lesson06: LessonSeed = {
	lessonNumber: 6,
	title: 'Modifiers and Degree',
	grammarPoints: [
		// ── 31. -(으)ㄴ — Adjective modifier form ───────────────────────────
		{
			id: 'gp_eun_modifier',
			title: '-(으)ㄴ',
			category: 'modifier',
			tense: 'present',
			register: null,
			hint: 'adjective → noun modifier',
			description:
				'Turns a descriptive verb (adjective) into a noun modifier. ' +
				'After a consonant stem → -은: 작다 → 작은. After a vowel stem → -ㄴ: 크다 → 큰. ' +
				'Compare 좋다 → 좋은 (regular), 길다 → 긴 (the stem-final ㄹ drops), and 빠르다 → 빠른.',
			level: 1,
			tags: ['modifier', 'beginner', 'TOPIK1'],
			structurePattern: 'Adj stem + (으)ㄴ + Noun',
			notes: [
				{ type: 'tip', title: 'ㄹ-Irregular', content: 'If the stem ends in ㄹ, drop ㄹ and add -ㄴ: 길다 → 긴, 멀다 → 먼.' },
				{ type: 'caution', title: 'Action Verbs Differ', content: 'Action verbs generally take -는 for present modification. They can take -(으)ㄴ for a completed action. Forms such as 있는 and 없는 also use -는.' }
			],
			lessonExamples: [
				{
					id: 'le_eun_mod_01',
					fullSentence: '큰 가방이 있어요.',
					sentenceWithBlank: '___ 가방이 있어요.',
					answer: '큰',
					englishHint: [h('There is a ', 'none'), h('big', 'direct'), h(' bag.', 'none')],
					order: 0
				},
				{
					id: 'le_eun_mod_02',
					fullSentence: '작은 고양이가 있어요.',
					sentenceWithBlank: '___ 고양이가 있어요.',
					answer: '작은',
					englishHint: [h('There is a ', 'none'), h('small', 'direct'), h(' cat.', 'none')],
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_eun_mod_01',
					fullSentence: '큰 가방을 샀어요.',
					sentenceWithBlank: '___ 가방을 샀어요.',
					answer: '큰',
					alternateAnswers: [],
					vocabBaseForm: '크다',
					englishHint: [h('I bought a ', 'none'), h('big', 'direct'), h(' bag.', 'none')],
					introducedAtPosition: 31
				},
				{
					id: 'cc_eun_mod_02',
					fullSentence: '작은 집에 살아요.',
					sentenceWithBlank: '___ 집에 살아요.',
					answer: '작은',
					alternateAnswers: [],
					vocabBaseForm: '작다',
					englishHint: [h('I live in a ', 'none'), h('small', 'direct'), h(' house.', 'none')],
					introducedAtPosition: 31
				},
				{
					id: 'cc_eun_mod_03',
					fullSentence: '좋은 음식을 먹었어요.',
					sentenceWithBlank: '___ 음식을 먹었어요.',
					answer: '좋은',
					alternateAnswers: [],
					vocabBaseForm: '좋다',
					englishHint: [h('I ate ', 'none'), h('good', 'direct'), h(' food.', 'none')],
					introducedAtPosition: 31
				},
				{
					id: 'cc_eun_mod_04',
					fullSentence: '비싼 옷은 안 사요.',
					sentenceWithBlank: '___ 옷은 안 사요.',
					answer: '비싼',
					alternateAnswers: [],
					vocabBaseForm: '비싸다',
					englishHint: [h("I don't buy ", 'none'), h('expensive', 'direct'), h(' clothes.', 'none')],
					introducedAtPosition: 31
				}
			]
		},

		// ── 32. 만 — Only / just ────────────────────────────────────────────
		{
			id: 'gp_man',
			title: '만',
			category: 'particle',
			tense: null,
			register: null,
			hint: 'only, just',
			description:
				'Attaches to a noun to mean "only" or "just." Replaces 은/는, 이/가, or 을/를 in most cases: ' +
				'물만 마셔요 "I only drink water." Can stack with other particles: 에서만 "only at."',
			level: 1,
			tags: ['particle', 'beginner', 'TOPIK1'],
			structurePattern: '[Noun]만',
			notes: [
				{ type: 'tip', title: 'Replaces Markers', content: '만 typically replaces 은/는, 이/가, 을/를. 물을 마셔요 → 물만 마셔요.' },
				{ type: 'tip', title: 'Stacking', content: '만 can combine with location particles: 집에서만 (only at home), 학교에만 (only to school).' }
			],
			lessonExamples: [
				{
					id: 'le_man_01',
					fullSentence: '물만 마셔요.',
					sentenceWithBlank: '물___ 마셔요.',
					answer: '만',
					englishHint: [h('I drink ', 'none'), h('only', 'direct'), h(' water.', 'none')],
					order: 0
				},
				{
					id: 'le_man_02',
					fullSentence: '저는 한국어만 공부해요.',
					sentenceWithBlank: '저는 한국어___ 공부해요.',
					answer: '만',
					englishHint: [h('I study ', 'none'), h('only', 'direct'), h(' Korean.', 'none')],
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_man_01',
					fullSentence: '물만 마셔요.',
					sentenceWithBlank: '물___ 마셔요.',
					answer: '만',
					alternateAnswers: [],
					vocabBaseForm: '만',
					englishHint: [h('I drink ', 'none'), h('only', 'direct'), h(' water.', 'none')],
					introducedAtPosition: 32
				},
				{
					id: 'cc_man_02',
					fullSentence: '하나만 주세요.',
					sentenceWithBlank: '하나___ 주세요.',
					answer: '만',
					alternateAnswers: [],
					vocabBaseForm: '만',
					englishHint: [h('Please give me ', 'none'), h('just', 'direct'), h(' one.', 'none')],
					introducedAtPosition: 32
				},
				{
					id: 'cc_man_03',
					fullSentence: '주말에만 쉬어요.',
					sentenceWithBlank: '주말에___ 쉬어요.',
					answer: '만',
					alternateAnswers: [],
					vocabBaseForm: '만',
					englishHint: [h('I rest ', 'none'), h('only', 'direct'), h(' on weekends.', 'none')],
					introducedAtPosition: 32
				}
			]
		},

		// ── 33. -ㄴ 것 같다 — Seems like / appears to ──────────────────────
		{
			id: 'gp_n_geos_gatda',
			title: '-ㄴ 것 같다',
			category: 'expression',
			tense: 'present',
			register: 'polite informal',
			hint: 'seems like, I think (present observation)',
			description:
				'Expresses a guess or soft opinion about a present state. ' +
				'Descriptive verb stem + (으)ㄴ 것 같다: 비싼 것 같아요 "It seems expensive." ' +
				'For nouns: Noun + 인 것 같아요 "It seems to be [noun]."',
			level: 1,
			tags: ['expression', 'beginner', 'TOPIK1'],
			structurePattern: 'Adj stem + (으)ㄴ 것 같다',
			notes: [
				{ type: 'tip', title: 'Soft Opinion', content: 'Korean speakers often use -ㄴ 것 같다 for politeness even when they are sure, to soften the statement.' },
				{ type: 'caution', title: 'Tense Matters', content: 'For past: -ㄴ 것 같다 (same form for adj). For action verbs in present: -는 것 같다 (different ending, later lesson).' }
			],
			relatedPointIds: ['gp_eun_modifier'],
			lessonExamples: [
				{
					id: 'le_geos_gatda_01',
					fullSentence: '이 음식은 비싼 것 같아요.',
					sentenceWithBlank: '이 음식은 비싼 것 ___.',
					answer: '같아요',
					englishHint: [h('This food ', 'none'), h('seems', 'direct'), h(' expensive.', 'none')],
					order: 0
				},
				{
					id: 'le_geos_gatda_02',
					fullSentence: '오늘은 추운 것 같아요.',
					sentenceWithBlank: '오늘은 추운 것 ___.',
					answer: '같아요',
					englishHint: [h('Today ', 'none'), h('seems', 'direct'), h(' cold.', 'none')],
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_geos_gatda_01',
					fullSentence: '이 가방은 비싼 것 같아요.',
					sentenceWithBlank: '이 가방은 비싼 것 ___.',
					answer: '같아요',
					alternateAnswers: [],
					vocabBaseForm: '-ㄴ 것 같다',
					englishHint: [h('This bag ', 'none'), h('seems', 'direct'), h(' expensive.', 'none')],
					introducedAtPosition: 33
				},
				{
					id: 'cc_geos_gatda_02',
					fullSentence: '날씨가 좋은 것 같아요.',
					sentenceWithBlank: '날씨가 좋은 것 ___.',
					answer: '같아요',
					alternateAnswers: [],
					vocabBaseForm: '-ㄴ 것 같다',
					englishHint: [h('The weather ', 'none'), h('seems', 'direct'), h(' nice.', 'none')],
					introducedAtPosition: 33
				},
				{
					id: 'cc_geos_gatda_03',
					fullSentence: '그 사람은 한국 사람인 것 같아요.',
					sentenceWithBlank: '그 사람은 한국 사람인 것 ___.',
					answer: '같아요',
					alternateAnswers: [],
					vocabBaseForm: '-ㄴ 것 같다',
					englishHint: [h('That person ', 'none'), h('seems', 'direct'), h(' to be Korean.', 'none')],
					introducedAtPosition: 33
				}
			]
		}
	]
};
