import type { LessonSeed } from '../types';

// ══════════════════════════════════════════════════════════════════════════════
// Lesson 7 — Want and Ability
//
// Grammar points (positions 34–36):
//  34. -고 싶다          Want to (desire)
//  35. -(으)ㄹ 수 있다   Can / able to
//  36. 못               Cannot (short-form inability)
//
// Available: all L1–L6 grammar (pos 1–33).
// ══════════════════════════════════════════════════════════════════════════════

const h = (text: string, highlightType: 'none' | 'direct' | 'related' = 'none') => ({ text, highlightType });

export const lesson07: LessonSeed = {
	lessonNumber: 7,
	title: 'Want and Ability',
	grammarPoints: [
		// ── 34. -고 싶다 — Want to ──────────────────────────────────────────
		{
			id: 'gp_go_sipda',
			title: '-고 싶다',
			category: 'expression',
			tense: 'present',
			register: 'polite informal',
			hint: 'want to (do)',
			description:
				'Expresses a desire or wish. Verb stem + 고 싶다: 먹다 → 먹고 싶어요 "I want to eat." ' +
				'Past form: -고 싶었어요 "I wanted to." ' +
				'Only used for first person (I want) or second person questions (Do you want?).',
			level: 1,
			tags: ['expression', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + 고 싶다',
			notes: [
				{ type: 'tip', title: 'First/Second Person', content: '-고 싶다 is for "I want" or "Do you want?" For third person desires, use -고 싶어하다.' },
				{ type: 'tip', title: 'No Conjugation Needed', content: 'The verb stem stays unchanged: 가다 → 가고 싶어요, 먹다 → 먹고 싶어요. No vowel harmony rules.' }
			],
			lessonExamples: [
				{
					id: 'le_go_sipda_01',
					fullSentence: '한국에 가고 싶어요.',
					sentenceWithBlank: '한국에 가고 ___.',
					answer: '싶어요',
					englishHint: [h('I ', 'none'), h('want to', 'direct'), h(' go to Korea.', 'none')],
					order: 0
				},
				{
					id: 'le_go_sipda_02',
					fullSentence: '커피를 마시고 싶어요.',
					sentenceWithBlank: '커피를 마시고 ___.',
					answer: '싶어요',
					englishHint: [h('I ', 'none'), h('want to', 'direct'), h(' drink coffee.', 'none')],
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_go_sipda_01',
					fullSentence: '한국에 가고 싶어요.',
					sentenceWithBlank: '한국에 가고 ___.',
					answer: '싶어요',
					alternateAnswers: [],
					vocabBaseForm: '-고 싶다',
					englishHint: [h('I ', 'none'), h('want to', 'direct'), h(' go to Korea.', 'none')],
					introducedAtPosition: 34
				},
				{
					id: 'cc_go_sipda_02',
					fullSentence: '불고기를 먹고 싶어요.',
					sentenceWithBlank: '불고기를 먹고 ___.',
					answer: '싶어요',
					alternateAnswers: [],
					vocabBaseForm: '-고 싶다',
					englishHint: [h('I ', 'none'), h('want to', 'direct'), h(' eat bulgogi.', 'none')],
					introducedAtPosition: 34
				},
				{
					id: 'cc_go_sipda_03',
					fullSentence: '영화를 보고 싶어요.',
					sentenceWithBlank: '영화를 보고 ___.',
					answer: '싶어요',
					alternateAnswers: [],
					vocabBaseForm: '-고 싶다',
					englishHint: [h('I ', 'none'), h('want to', 'direct'), h(' watch a movie.', 'none')],
					introducedAtPosition: 34
				}
			]
		},

		// ── 35. -(으)ㄹ 수 있다 — Can / able to ────────────────────────────
		{
			id: 'gp_eul_su_issda',
			title: '-(으)ㄹ 수 있다',
			category: 'expression',
			tense: null,
			register: 'polite informal',
			hint: 'can, able to / cannot, unable to',
			description:
				'Expresses ability or possibility. Verb stem + (으)ㄹ 수 있다: 먹을 수 있어요 "can eat." ' +
				'Negative: -(으)ㄹ 수 없다: 먹을 수 없어요 "cannot eat." ' +
				'After consonant stem → -을 수 있다; after vowel stem → -ㄹ 수 있다.',
			level: 1,
			tags: ['expression', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + (으)ㄹ 수 있다/없다',
			notes: [
				{ type: 'tip', title: 'Allomorphs', content: 'Consonant stem: 먹다 → 먹을 수 있어요. Vowel stem: 가다 → 갈 수 있어요. ㄹ stem: 만들다 → 만들 수 있어요 (ㄹ stays).' },
				{ type: 'tip', title: '있다 vs 없다', content: '수 있다 = can/able. 수 없다 = cannot/unable. Both conjugate normally: 있어요/없어요.' }
			],
			relatedPointIds: ['gp_mos'],
			lessonExamples: [
				{
					id: 'le_eul_su_01',
					fullSentence: '한국어를 읽을 수 있어요.',
					sentenceWithBlank: '한국어를 읽을 수 ___.',
					answer: '있어요',
					englishHint: [h('I ', 'none'), h('can', 'direct'), h(' read Korean.', 'none')],
					order: 0
				},
				{
					id: 'le_eul_su_02',
					fullSentence: '매운 음식을 먹을 수 없어요.',
					sentenceWithBlank: '매운 음식을 먹을 수 ___.',
					answer: '없어요',
					englishHint: [h('I ', 'none'), h('cannot', 'direct'), h(' eat spicy food.', 'none')],
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_eul_su_01',
					fullSentence: '한국어를 읽을 수 있어요.',
					sentenceWithBlank: '한국어를 읽을 ___ 있어요.',
					answer: '수',
					alternateAnswers: [],
					vocabBaseForm: '-(으)ㄹ 수 있다',
					englishHint: [h('I ', 'none'), h('can', 'direct'), h(' read Korean.', 'none')],
					introducedAtPosition: 35
				},
				{
					id: 'cc_eul_su_02',
					fullSentence: '내일 갈 수 있어요.',
					sentenceWithBlank: '내일 갈 ___ 있어요.',
					answer: '수',
					alternateAnswers: [],
					vocabBaseForm: '-(으)ㄹ 수 있다',
					englishHint: [h('I ', 'none'), h('can', 'direct'), h(' go tomorrow.', 'none')],
					introducedAtPosition: 35
				},
				{
					id: 'cc_eul_su_03',
					fullSentence: '여기에서 수영할 수 없어요.',
					sentenceWithBlank: '여기에서 수영할 ___ 없어요.',
					answer: '수',
					alternateAnswers: [],
					vocabBaseForm: '-(으)ㄹ 수 있다',
					englishHint: [h('You ', 'none'), h('cannot', 'direct'), h(' swim here.', 'none')],
					introducedAtPosition: 35
				}
			]
		},

		// ── 36. 못 — Cannot (short-form inability) ─────────────────────────
		{
			id: 'gp_mos',
			title: '못',
			category: 'adverb',
			tense: null,
			register: null,
			hint: 'cannot, unable to (short negation)',
			description:
				'Short-form inability negation. Placed before the verb: 못 먹어요 "cannot eat." ' +
				'For 하다 verbs, 못 goes between the noun and 하다: 운동 못 해요. ' +
				'Indicates inability (cannot), not refusal (won\'t). Compare with 안 (choice not to).',
			level: 1,
			tags: ['adverb', 'negation', 'beginner', 'TOPIK1'],
			structurePattern: '못 + Verb',
			notes: [
				{ type: 'tip', title: '못 vs 안', content: '못 = cannot (inability/impossibility). 안 = do not (choice/preference). 못 먹어요 (can\'t eat) vs 안 먹어요 (don\'t eat).' },
				{ type: 'tip', title: '하다 Split', content: 'For Noun+하다 verbs: 공부 못 해요 (cannot study), not 못 공부해요.' }
			],
			relatedPointIds: ['gp_an', 'gp_eul_su_issda'],
			lessonExamples: [
				{
					id: 'le_mos_01',
					fullSentence: '저는 매운 음식을 못 먹어요.',
					sentenceWithBlank: '저는 매운 음식을 ___ 먹어요.',
					answer: '못',
					englishHint: [h('I ', 'none'), h("can't", 'direct'), h(' eat spicy food.', 'none')],
					order: 0
				},
				{
					id: 'le_mos_02',
					fullSentence: '오늘은 운동 못 해요.',
					sentenceWithBlank: '오늘은 운동 ___ 해요.',
					answer: '못',
					englishHint: [h('I ', 'none'), h("can't", 'direct'), h(' exercise today.', 'none')],
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_mos_01',
					fullSentence: '저는 매운 음식을 못 먹어요.',
					sentenceWithBlank: '저는 매운 음식을 ___ 먹어요.',
					answer: '못',
					alternateAnswers: [],
					vocabBaseForm: '못',
					englishHint: [h('I ', 'none'), h("can't", 'direct'), h(' eat spicy food.', 'none')],
					introducedAtPosition: 36
				},
				{
					id: 'cc_mos_02',
					fullSentence: '한국어를 못 읽어요.',
					sentenceWithBlank: '한국어를 ___ 읽어요.',
					answer: '못',
					alternateAnswers: [],
					vocabBaseForm: '못',
					englishHint: [h('I ', 'none'), h("can't", 'direct'), h(' read Korean.', 'none')],
					introducedAtPosition: 36
				},
				{
					id: 'cc_mos_03',
					fullSentence: '오늘 수영 못 해요.',
					sentenceWithBlank: '오늘 수영 ___ 해요.',
					answer: '못',
					alternateAnswers: [],
					vocabBaseForm: '못',
					englishHint: [h('I ', 'none'), h("can't", 'direct'), h(' swim today.', 'none')],
					introducedAtPosition: 36
				}
			]
		}
	]
};
