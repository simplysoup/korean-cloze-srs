import type { LessonSeed } from '../types';

// Lesson 4 — Everyday Actions and Negation
// Positions 15–19
// 15. ayo_eoyo
// 16. eul_reul
// 17. an
// 18. ji_anha
// 19. mos
export const lesson04: LessonSeed = {
	lessonNumber: 4,
	title: "Everyday Actions and Negation",
	grammarPoints: [
		// 15. gp_ayo_eoyo
		{
			id: 'gp_ayo_eoyo',
			title: '-아요/어요',
			category: 'verb-ending',
			tense: 'present',
			register: 'polite informal',
			hint: 'polite present tense verb ending',
			description:
				'The most common verb ending in everyday polite Korean. ' +
				'For regular stems, -아요 follows ㅏ/ㅗ and -어요 usually follows other vowels; contractions and irregular stems need special care. ' +
				'하다 verbs become 해요. Expresses present actions, habits, and general truths.',
			level: 1,
			tags: ['verb-ending', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + 아요/어요',
			notes: [
				{ type: 'tip', title: 'Vowel Harmony', content: 'Regular stems usually take -아요 after ㅏ or ㅗ and -어요 after other vowels. 하다 → 해요; contractions and irregulars need separate attention.' },
				{ type: 'tip', title: 'Examples', content: '가다 → 가요 (go), 먹다 → 먹어요 (eat), 공부하다 → 공부해요 (study).' }
			],
			lessonExamples: [
				{
					id: 'le_ayo_eoyo_01',
					fullSentence: "저는 공부해요.",
					sentenceWithBlank: "저는 공부___.",
					answer: '해요',
					englishHint: "I study.",
					order: 0,
					notes: 'Uses 은/는 (GP3), 을/를 (GP10). 공부하다 → 공부해요.'
				},
				{
					id: 'le_ayo_eoyo_02',
					fullSentence: "저는 먹어요.",
					sentenceWithBlank: "저는 먹___.",
					answer: '어요',
					englishHint: "I eat.",
					order: 1,
					notes: 'Uses 은/는 (GP3), 을/를 (GP10). 먹다 → 먹어요 (stem 먹 has ㅓ vowel).'
				},
				{
					id: 'le_ayo_eoyo_03',
					fullSentence: "오늘 가요.",
					sentenceWithBlank: "오늘 ___.",
					answer: "가요",
					englishHint: "I am going today.",
					order: 2,
					notes: '가다 → 가요 (stem 가 has ㅏ vowel → 아요 contracts to 가요).'
				}
			],
			cards: [
				{
					id: 'cc_ayo_eoyo_01',
					fullSentence: "저는 공부해요.",
					sentenceWithBlank: "저는 공부___.",
					answer: '해요',
					alternateAnswers: [],
					vocabBaseForm: '공부하다',
					englishHint: "I study.",
					introducedAtPosition: 15
				},
				{
					id: 'cc_ayo_eoyo_02',
					fullSentence: "저는 먹어요.",
					sentenceWithBlank: "저는 먹___.",
					answer: '어요',
					alternateAnswers: [],
					vocabBaseForm: '먹다',
					englishHint: "I eat.",
					introducedAtPosition: 15
				},
				{
					id: 'cc_ayo_eoyo_03',
					fullSentence: "저는 마셔요.",
					sentenceWithBlank: "저는 마___.",
					answer: '셔요',
					alternateAnswers: ['시어요'],
					vocabBaseForm: '마시다',
					englishHint: "I drink.",
					introducedAtPosition: 15
				},
				{
					id: 'cc_ayo_eoyo_04',
					fullSentence: "오늘 가요.",
					sentenceWithBlank: "오늘 ___.",
					answer: "가요",
					alternateAnswers: [],
					vocabBaseForm: '가다',
					englishHint: "I am going today.",
					introducedAtPosition: 15
				},
				{
					id: 'cc_ayo_eoyo_05',
					fullSentence: "저는 봐요.",
					sentenceWithBlank: "저는 ___.",
					answer: '봐요',
					alternateAnswers: [],
					vocabBaseForm: '보다',
					englishHint: "I watch TV.",
					introducedAtPosition: 15
				}
			]
		},

		// 16. gp_eul_reul
		{
			id: 'gp_eul_reul',
			title: '을/를',
			category: 'particle',
			tense: null,
			register: null,
			hint: 'object marker',
			description:
				'Marks the direct object of a verb — what the action is done to. ' +
				'Use 을 after a noun ending in a consonant, 를 after a noun ending in a vowel.',
			level: 1,
			tags: ['particle', 'beginner', 'TOPIK1'],
			structurePattern: '[Noun]을 / [Noun]를',
			notes: [
				{ type: 'tip', title: 'Consonant vs Vowel', content: 'Use 을 after consonant-ending nouns (음악을) and 를 after vowel-ending nouns (커피를).' }
			],
			lessonExamples: [
				{
					id: 'le_eul_reul_01',
					fullSentence: '커피를 마셔요.',
					sentenceWithBlank: '커피___ 마셔요.',
					answer: '를',
					englishHint: 'I drink coffee.',
					order: 0,
					notes: '커피 ends in vowel → 를.'
				},
				{
					id: 'le_eul_reul_02',
					fullSentence: '책을 읽어요.',
					sentenceWithBlank: '책___ 읽어요.',
					answer: '을',
					englishHint: 'I read a book.',
					order: 1,
					notes: '책 ends in consonant ㄱ → 을.'
				}
			],
			cards: [
				{
					id: 'cc_eul_reul_01',
					fullSentence: '저는 커피를 마셔요.',
					sentenceWithBlank: '저는 커피___ 마셔요.',
					answer: '를',
					alternateAnswers: [],
					vocabBaseForm: '을/를',
					englishHint: 'I drink coffee.',
					introducedAtPosition: 16
				},
				{
					id: 'cc_eul_reul_02',
					fullSentence: '책을 읽어요.',
					sentenceWithBlank: '책___ 읽어요.',
					answer: '을',
					alternateAnswers: [],
					vocabBaseForm: '을/를',
					englishHint: 'I read a book.',
					introducedAtPosition: 16
				},
				{
					id: 'cc_eul_reul_03',
					fullSentence: '음악을 들어요.',
					sentenceWithBlank: '음악___ 들어요.',
					answer: '을',
					alternateAnswers: [],
					vocabBaseForm: '을/를',
					englishHint: 'I listen to music.',
					introducedAtPosition: 16
				},
				{
					id: 'cc_eul_reul_04',
					fullSentence: '영화를 봐요.',
					sentenceWithBlank: '영화___ 봐요.',
					answer: '를',
					alternateAnswers: [],
					vocabBaseForm: '을/를',
					englishHint: 'I watch a movie.',
					introducedAtPosition: 16
				}
			]
		},

		// 17. gp_an
		{
			id: 'gp_an',
			title: '안',
			category: 'adverb',
			tense: null,
			register: 'polite informal',
			hint: 'not (short negation)',
			description:
				'Placed directly before a verb to negate it: "안 + verb" means "not verb." ' +
				'The simplest and most common way to negate in spoken Korean. ' +
				'For 하다 verbs, it goes between the noun and 하다: 공부 안 해요.',
			level: 1,
			tags: ['negation', 'beginner', 'TOPIK1'],
			structurePattern: '안 + [Verb]',
			notes: [
				{ type: 'tip', title: '하다 Verbs', content: 'For noun+하다 verbs, 안 goes between: 공부 안 해요 is the usual spoken placement for 공부하다.' },
				{ type: 'caution', title: '안 vs -지 않다', content: '안 is the short form. The long form -지 않다 is taught later and used in formal/written contexts.' }
			],
			lessonExamples: [
				{
					id: 'le_an_01',
					fullSentence: '저는 커피를 안 마셔요.',
					sentenceWithBlank: '저는 커피를 ___ 마셔요.',
					answer: '안',
					englishHint: "I don't drink coffee.",
					order: 0,
					notes: 'Uses 은/는 (GP3), 을/를 (GP10), -아요/어요 (GP11).'
				},
				{
					id: 'le_an_02',
					fullSentence: '오늘은 공부 안 해요.',
					sentenceWithBlank: '오늘은 공부 ___ 해요.',
					answer: '안',
					englishHint: "I'm not studying today.",
					order: 1,
					notes: 'Uses 은/는 (GP3), -아요/어요 (GP11). 하다 verb split: 공부 안 해요.'
				}
			],
			cards: [
				{
					id: 'cc_an_01',
					fullSentence: '저는 커피를 안 마셔요.',
					sentenceWithBlank: '저는 커피를 ___ 마셔요.',
					answer: '안',
					alternateAnswers: [],
					vocabBaseForm: '안',
					englishHint: "I don't drink coffee.",
					introducedAtPosition: 17
				},
				{
					id: 'cc_an_02',
					fullSentence: '오늘은 공부 안 해요.',
					sentenceWithBlank: '오늘은 공부 ___ 해요.',
					answer: '안',
					alternateAnswers: [],
					vocabBaseForm: '안',
					englishHint: "I'm not studying today.",
					introducedAtPosition: 17
				},
				{
					id: 'cc_an_03',
					fullSentence: '저는 고기를 안 먹어요.',
					sentenceWithBlank: '저는 고기를 ___ 먹어요.',
					answer: '안',
					alternateAnswers: [],
					vocabBaseForm: '안',
					englishHint: "I don't eat meat.",
					introducedAtPosition: 17
				}
			]
		},

		// 18. gp_ji_anha
		{
			id: 'gp_ji_anha',
			title: '-지 않다',
			category: 'verb-ending',
			tense: null,
			register: 'polite informal',
			hint: 'long-form negation ("do not")',
			description:
				'The long-form negation pattern. Verb stem + 지 않다: 먹다 → 먹지 않아요 "do not eat." ' +
				'Often a little more formal or measured than short 안 negation, without necessarily adding emphasis. ' +
				'Works with all verb types including 하다 verbs: 공부하지 않아요.',
			level: 1,
			tags: ['negation', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + 지 않다',
			notes: [
				{ type: 'tip', title: '안 vs -지 않다', content: '안 먹어요 and 먹지 않아요 mean the same thing. -지 않다 can sound a little more formal or measured, but is not automatically stronger.' },
				{ type: 'tip', title: '하다 Verbs', content: 'For 하다 verbs, -지 않다 is simpler: 공부하지 않아요 (compare: 공부 안 해요).' }
			],
			lessonExamples: [
				{
					id: 'le_ji_anha_01',
					fullSentence: '저는 고기를 먹지 않아요.',
					sentenceWithBlank: '저는 고기를 먹지 ___.',
					answer: '않아요',
					englishHint: 'I do not eat meat.',
					order: 0
				},
				{
					id: 'le_ji_anha_02',
					fullSentence: '오늘은 공부하지 않아요.',
					sentenceWithBlank: '오늘은 공부하지 ___.',
					answer: '않아요',
					englishHint: 'I am not studying today.',
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
					englishHint: 'I do not eat meat.',
					introducedAtPosition: 18
				},
				{
					id: 'cc_ji_anha_02',
					fullSentence: '오늘은 운동하지 않아요.',
					sentenceWithBlank: '오늘은 운동하지 ___.',
					answer: '않아요',
					alternateAnswers: [],
					vocabBaseForm: '-지 않다',
					englishHint: 'I am not exercising today.',
					introducedAtPosition: 18
				},
				{
					id: 'cc_ji_anha_03',
					fullSentence: '이 음식은 맛있지 않아요.',
					sentenceWithBlank: '이 음식은 맛있지 ___.',
					answer: '않아요',
					alternateAnswers: [],
					vocabBaseForm: '-지 않다',
					englishHint: 'This food is not delicious.',
					introducedAtPosition: 18
				}
			]
		},

		// 19. gp_mos
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
					englishHint: "I can't eat spicy food.",
					order: 0
				},
				{
					id: 'le_mos_02',
					fullSentence: '오늘은 운동 못 해요.',
					sentenceWithBlank: '오늘은 운동 ___ 해요.',
					answer: '못',
					englishHint: "I can't exercise today.",
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
					englishHint: "I can't eat spicy food.",
					introducedAtPosition: 19
				},
				{
					id: 'cc_mos_02',
					fullSentence: '한국어를 못 읽어요.',
					sentenceWithBlank: '한국어를 ___ 읽어요.',
					answer: '못',
					alternateAnswers: [],
					vocabBaseForm: '못',
					englishHint: "I can't read Korean.",
					introducedAtPosition: 19
				},
				{
					id: 'cc_mos_03',
					fullSentence: '오늘 수영 못 해요.',
					sentenceWithBlank: '오늘 수영 ___ 해요.',
					answer: '못',
					alternateAnswers: [],
					vocabBaseForm: '못',
					englishHint: "I can't swim today.",
					introducedAtPosition: 19
				}
			]
		}
	]
};
