import type { LessonSeed } from '../types';
import { teachLesson } from '../teaching-guides';

// Lesson 6 — Talking About the Past and Describing Things
// Grammar points (positions 29–32):
//   29. asseoyo
//   30. eun_modifier
//   31. man
//   32. hago
// Examples and cards use only grammar through their target position.

export const lesson06: LessonSeed = teachLesson({
	lessonNumber: 6,
	title: "Talking About the Past and Describing Things",
	grammarPoints: [
		// 29. gp_asseoyo
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
					englishHint: 'I went to school yesterday.',
					order: 0
				},
				{
					id: 'le_asseoyo_02',
					fullSentence: '저는 밥을 먹었어요.',
					sentenceWithBlank: '저는 밥을 ___.',
					answer: '먹었어요',
					englishHint: 'I ate rice.',
					order: 1
				},
				{
					id: 'le_asseoyo_03',
					fullSentence: '어제 한국어를 공부했어요.',
					sentenceWithBlank: '어제 한국어를 ___.',
					answer: '공부했어요',
					englishHint: 'I studied Korean yesterday.',
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
					englishHint: 'I went to school yesterday.',
					introducedAtPosition: 29
				},
				{
					id: 'cc_asseoyo_02',
					fullSentence: '저는 밥을 먹었어요.',
					sentenceWithBlank: '저는 밥을 ___.',
					answer: '먹었어요',
					alternateAnswers: [],
					vocabBaseForm: '먹다',
					englishHint: 'I ate rice.',
					introducedAtPosition: 29
				},
				{
					id: 'cc_asseoyo_03',
					fullSentence: '어제 영화를 봤어요.',
					sentenceWithBlank: '어제 영화를 ___.',
					answer: '봤어요',
					alternateAnswers: [],
					vocabBaseForm: '보다',
					englishHint: 'I watched a movie yesterday.',
					introducedAtPosition: 29
				},
				{
					id: 'cc_asseoyo_04',
					fullSentence: '커피를 마셨어요.',
					sentenceWithBlank: '커피를 ___.',
					answer: '마셨어요',
					alternateAnswers: [],
					vocabBaseForm: '마시다',
					englishHint: 'I drank coffee.',
					introducedAtPosition: 29
				},
				{
					id: 'cc_asseoyo_05',
					fullSentence: '숙제를 했어요.',
					sentenceWithBlank: '숙제를 ___.',
					answer: '했어요',
					alternateAnswers: [],
					vocabBaseForm: '하다',
					englishHint: 'I did (my) homework.',
					introducedAtPosition: 29
				}
			]
		},

		// 30. gp_eun_modifier
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
					englishHint: 'There is a big bag.',
					order: 0
				},
				{
					id: 'le_eun_mod_02',
					fullSentence: '작은 고양이가 있어요.',
					sentenceWithBlank: '___ 고양이가 있어요.',
					answer: '작은',
					englishHint: 'There is a small cat.',
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
					englishHint: 'I bought a big bag.',
					introducedAtPosition: 30
				},
				{
					id: 'cc_eun_mod_02',
					fullSentence: '작은 집에 살아요.',
					sentenceWithBlank: '___ 집에 살아요.',
					answer: '작은',
					alternateAnswers: [],
					vocabBaseForm: '작다',
					englishHint: 'I live in a small house.',
					introducedAtPosition: 30
				},
				{
					id: 'cc_eun_mod_03',
					fullSentence: '좋은 음식을 먹었어요.',
					sentenceWithBlank: '___ 음식을 먹었어요.',
					answer: '좋은',
					alternateAnswers: [],
					vocabBaseForm: '좋다',
					englishHint: 'I ate good food.',
					introducedAtPosition: 30
				},
				{
					id: 'cc_eun_mod_04',
					fullSentence: '비싼 옷은 안 사요.',
					sentenceWithBlank: '___ 옷은 안 사요.',
					answer: '비싼',
					alternateAnswers: [],
					vocabBaseForm: '비싸다',
					englishHint: "I don't buy expensive clothes.",
					introducedAtPosition: 30
				}
			]
		},

		// 31. gp_man
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
					englishHint: 'I drink only water.',
					order: 0
				},
				{
					id: 'le_man_02',
					fullSentence: '저는 한국어만 공부해요.',
					sentenceWithBlank: '저는 한국어___ 공부해요.',
					answer: '만',
					englishHint: 'I study only Korean.',
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
					englishHint: 'I drink only water.',
					introducedAtPosition: 31
				},
				{
					id: 'cc_man_02',
					fullSentence: '하나만 주세요.',
					sentenceWithBlank: '하나___ 주세요.',
					answer: '만',
					alternateAnswers: [],
					vocabBaseForm: '만',
					englishHint: 'Please give me just one.',
					introducedAtPosition: 31
				},
				{
					id: 'cc_man_03',
					fullSentence: '주말에만 쉬어요.',
					sentenceWithBlank: '주말에___ 쉬어요.',
					answer: '만',
					alternateAnswers: [],
					vocabBaseForm: '만',
					englishHint: 'I rest only on weekends.',
					introducedAtPosition: 31
				}
			]
		},

		// 32. gp_hago
		{
			id: 'gp_hago',
			title: '하고',
			category: 'particle',
			tense: null,
			register: null,
			hint: 'and, with (connecting nouns)',
			description:
				'Connects two nouns meaning "and" or "with." ' +
				'Used in everyday speech after any noun regardless of ending. ' +
				'친구하고 같이 = "together with a friend", 빵하고 우유 = "bread and milk."',
			level: 1,
			tags: ['particle', 'beginner', 'TOPIK1'],
			structurePattern: '[Noun]하고 [Noun]',
			notes: [
				{ type: 'tip', title: 'Formal Alternatives', content: 'More formal/written: 과 (after consonant) / 와 (after vowel). Casual alternative: (이)랑.' },
				{ type: 'tip', title: 'No Allomorphs', content: '하고 doesn\'t change form — it\'s always 하고 regardless of the preceding syllable.' }
			],
			lessonExamples: [
				{
					id: 'le_hago_01',
					fullSentence: "빵하고 우유를 사요.",
					sentenceWithBlank: "빵___ 우유를 사요.",
					answer: '하고',
					englishHint: "I buy bread and milk.",
					order: 0,
					notes: 'Uses 을/를 (GP10), -아요/어요 (GP11).'
				},
				{
					id: 'le_hago_02',
					fullSentence: '친구하고 같이 가요.',
					sentenceWithBlank: '친구___ 같이 가요.',
					answer: '하고',
					englishHint: 'I go with a friend.',
					order: 1,
					notes: 'Uses -아요/어요 (GP11).'
				}
			],
			cards: [
				{
					id: 'cc_hago_01',
					fullSentence: "빵하고 우유를 사요.",
					sentenceWithBlank: "빵___ 우유를 사요.",
					answer: '하고',
					alternateAnswers: ['과', '이랑'],
					vocabBaseForm: '하고',
					englishHint: "I buy bread and milk.",
					introducedAtPosition: 32
				},
				{
					id: 'cc_hago_02',
					fullSentence: '친구하고 같이 가요.',
					sentenceWithBlank: '친구___ 같이 가요.',
					answer: '하고',
					alternateAnswers: ['와', '랑'],
					vocabBaseForm: '하고',
					englishHint: 'I go with a friend.',
					introducedAtPosition: 32
				},
				{
					id: 'cc_hago_03',
					fullSentence: "빵하고 케이크를 먹어요.",
					sentenceWithBlank: "빵___ 케이크를 먹어요.",
					answer: "하고",
					alternateAnswers: ['와', '랑'],
					vocabBaseForm: '하고',
					englishHint: "I eat bread and cake.",
					introducedAtPosition: 32
				}
			]
		}
	]
});
