import type { LessonSeed } from '../types';

// ══════════════════════════════════════════════════════════════════════════════
// Lesson 5 — Past Tense and Negation
//
// Grammar points (positions 29–30):
//  29. -았어요/-었어요   Past tense (polite informal)
//  30. -지 않다          Long-form negation ("do not")
//
// Available: all L1–L4 grammar (pos 1–28).
// ══════════════════════════════════════════════════════════════════════════════

const h = (text: string, highlightType: 'none' | 'direct' | 'related' = 'none') => ({ text, highlightType });

export const lesson05: LessonSeed = {
	lessonNumber: 5,
	title: 'Past Tense and Negation',
	grammarPoints: [
		// ── 29. -았어요/-었어요 — Past tense (polite informal) ───────────────
		{
			id: 'gp_asseoyo',
			title: '-았어요/-었어요',
			category: 'verb-ending',
			tense: 'past',
			register: 'polite informal',
			hint: 'past tense (polite)',
			description:
				'The polite informal past tense ending. ' +
				'If the stem\'s last vowel is ㅏ or ㅗ → -았어요; otherwise → -었어요. ' +
				'하다 verbs → 했어요. 가다 → 갔어요, 먹다 → 먹었어요, 공부하다 → 공부했어요.',
			level: 1,
			tags: ['verb-ending', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + 았어요/었어요',
			notes: [
				{ type: 'tip', title: 'Vowel Harmony', content: 'Last vowel ㅏ/ㅗ → 았어요. Other vowels → 었어요. 하다 → 했어요 (special).' },
				{ type: 'tip', title: 'Contraction', content: '가 + 았어요 → 갔어요, 보 + 았어요 → 봤어요, 마시 + 었어요 → 마셨어요. The vowels merge.' }
			],
			lessonExamples: [
				{
					id: 'le_asseoyo_01',
					fullSentence: '어제 학교에 갔어요.',
					sentenceWithBlank: '어제 학교에 ___.',
					answer: '갔어요',
					englishHint: [h('I ', 'none'), h('went', 'direct'), h(' to school yesterday.', 'none')],
					order: 0
				},
				{
					id: 'le_asseoyo_02',
					fullSentence: '저는 밥을 먹었어요.',
					sentenceWithBlank: '저는 밥을 ___.',
					answer: '먹었어요',
					englishHint: [h('I ', 'none'), h('ate', 'direct'), h(' rice.', 'none')],
					order: 1
				},
				{
					id: 'le_asseoyo_03',
					fullSentence: '어제 한국어를 공부했어요.',
					sentenceWithBlank: '어제 한국어를 ___.',
					answer: '공부했어요',
					englishHint: [h('I ', 'none'), h('studied', 'direct'), h(' Korean yesterday.', 'none')],
					order: 2
				}
			],
			cards: [
				{
					id: 'cc_asseoyo_01',
					fullSentence: '어제 학교에 갔어요.',
					sentenceWithBlank: '어제 학교에 ___.',
					answer: '갔어요',
					alternateAnswers: [],
					vocabBaseForm: '가다',
					englishHint: [h('I ', 'none'), h('went', 'direct'), h(' to school yesterday.', 'none')],
					introducedAtPosition: 29
				},
				{
					id: 'cc_asseoyo_02',
					fullSentence: '저는 밥을 먹었어요.',
					sentenceWithBlank: '저는 밥을 ___.',
					answer: '먹었어요',
					alternateAnswers: [],
					vocabBaseForm: '먹다',
					englishHint: [h('I ', 'none'), h('ate', 'direct'), h(' rice.', 'none')],
					introducedAtPosition: 29
				},
				{
					id: 'cc_asseoyo_03',
					fullSentence: '어제 영화를 봤어요.',
					sentenceWithBlank: '어제 영화를 ___.',
					answer: '봤어요',
					alternateAnswers: [],
					vocabBaseForm: '보다',
					englishHint: [h('I ', 'none'), h('watched', 'direct'), h(' a movie yesterday.', 'none')],
					introducedAtPosition: 29
				},
				{
					id: 'cc_asseoyo_04',
					fullSentence: '커피를 마셨어요.',
					sentenceWithBlank: '커피를 ___.',
					answer: '마셨어요',
					alternateAnswers: [],
					vocabBaseForm: '마시다',
					englishHint: [h('I ', 'none'), h('drank', 'direct'), h(' coffee.', 'none')],
					introducedAtPosition: 29
				},
				{
					id: 'cc_asseoyo_05',
					fullSentence: '숙제를 했어요.',
					sentenceWithBlank: '숙제를 ___.',
					answer: '했어요',
					alternateAnswers: [],
					vocabBaseForm: '하다',
					englishHint: [h('I ', 'none'), h('did', 'direct'), h(' (my) homework.', 'none')],
					introducedAtPosition: 29
				}
			]
		},

		// ── 30. -지 않다 — Long-form negation ───────────────────────────────
		{
			id: 'gp_ji_anha',
			title: '-지 않다',
			category: 'verb-ending',
			tense: null,
			register: 'polite informal',
			hint: 'long-form negation ("do not")',
			description:
				'The long-form negation pattern. Verb stem + 지 않다: 먹다 → 먹지 않아요 "do not eat." ' +
				'More formal/emphatic than the short 안 negation. ' +
				'Works with all verb types including 하다 verbs: 공부하지 않아요.',
			level: 1,
			tags: ['negation', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + 지 않다',
			notes: [
				{ type: 'tip', title: '안 vs -지 않다', content: '안 먹어요 and 먹지 않아요 mean the same thing. -지 않다 is slightly more formal or emphatic.' },
				{ type: 'tip', title: '하다 Verbs', content: 'For 하다 verbs, -지 않다 is simpler: 공부하지 않아요 (compare: 공부 안 해요).' }
			],
			lessonExamples: [
				{
					id: 'le_ji_anha_01',
					fullSentence: '저는 고기를 먹지 않아요.',
					sentenceWithBlank: '저는 고기를 먹지 ___.',
					answer: '않아요',
					englishHint: [h('I ', 'none'), h('do not', 'direct'), h(' eat meat.', 'none')],
					order: 0
				},
				{
					id: 'le_ji_anha_02',
					fullSentence: '오늘은 공부하지 않아요.',
					sentenceWithBlank: '오늘은 공부하지 ___.',
					answer: '않아요',
					englishHint: [h('I am ', 'none'), h('not', 'direct'), h(' studying today.', 'none')],
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_ji_anha_01',
					fullSentence: '저는 고기를 먹지 않아요.',
					sentenceWithBlank: '저는 고기를 먹지 ___.',
					answer: '않아요',
					alternateAnswers: [],
					vocabBaseForm: '-지 않다',
					englishHint: [h('I ', 'none'), h('do not', 'direct'), h(' eat meat.', 'none')],
					introducedAtPosition: 30
				},
				{
					id: 'cc_ji_anha_02',
					fullSentence: '오늘은 운동하지 않아요.',
					sentenceWithBlank: '오늘은 운동하지 ___.',
					answer: '않아요',
					alternateAnswers: [],
					vocabBaseForm: '-지 않다',
					englishHint: [h('I am ', 'none'), h('not', 'direct'), h(' exercising today.', 'none')],
					introducedAtPosition: 30
				},
				{
					id: 'cc_ji_anha_03',
					fullSentence: '이 음식은 맛있지 않아요.',
					sentenceWithBlank: '이 음식은 맛있지 ___.',
					answer: '않아요',
					alternateAnswers: [],
					vocabBaseForm: '-지 않다',
					englishHint: [h('This food is ', 'none'), h('not', 'direct'), h(' delicious.', 'none')],
					introducedAtPosition: 30
				}
			]
		}
	]
};
