import type { LessonSeed } from '../types';

// Lesson 11 — Requests, Needs and Wants
// Positions 49–52
// 49. euseyo
// 50. a_juseyo
// 51. aya_hada
// 52. go_sipda
export const lesson11: LessonSeed = {
	lessonNumber: 11,
	title: "Requests, Needs and Wants",
	grammarPoints: [
		// 49. gp_euseyo
		{
			id: 'gp_euseyo',
			title: '-(으)세요',
			category: 'verb-ending',
			tense: null,
			register: 'polite',
			hint: 'please (do) / polite imperative',
			description:
				'Polite imperative form used for requests and instructions. ' +
				'After consonant stem → -으세요: 읽다 → 읽으세요. After vowel stem → -세요: 가다 → 가세요. ' +
				'Also used as honorific present: 어머니가 가세요 "Mother goes/is going."',
			level: 1,
			tags: ['verb-ending', 'honorific', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + (으)세요',
			notes: [
				{ type: 'tip', title: 'Dual Use', content: '-(으)세요 is both a polite imperative ("please do") and an honorific form. Context determines meaning.' },
				{ type: 'tip', title: 'Irregular', content: 'ㄹ-ending stems drop ㄹ: 만들다 → 만드세요. 듣다 → 들으세요 (ㄷ-irregular).' }
			],
			lessonExamples: [
				{
					id: 'le_euseyo_01',
					fullSentence: '여기에 앉으세요.',
					sentenceWithBlank: '여기에 ___.',
					answer: '앉으세요',
					englishHint: 'Please sit here.',
					order: 0
				},
				{
					id: 'le_euseyo_02',
					fullSentence: '이것을 보세요.',
					sentenceWithBlank: '이것을 ___.',
					answer: '보세요',
					englishHint: 'Please look at this.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_euseyo_01',
					fullSentence: '여기에 앉으세요.',
					sentenceWithBlank: '여기에 ___.',
					answer: '앉으세요',
					alternateAnswers: [],
					vocabBaseForm: '앉다',
					englishHint: 'Please sit here.',
					introducedAtPosition: 49
				},
				{
					id: 'cc_euseyo_02',
					fullSentence: '천천히 가세요.',
					sentenceWithBlank: '천천히 ___.',
					answer: '가세요',
					alternateAnswers: [],
					vocabBaseForm: '가다',
					englishHint: 'Please go slowly.',
					introducedAtPosition: 49
				},
				{
					id: 'cc_euseyo_03',
					fullSentence: '이 책을 읽으세요.',
					sentenceWithBlank: '이 책을 ___.',
					answer: '읽으세요',
					alternateAnswers: [],
					vocabBaseForm: '읽다',
					englishHint: 'Please read this book.',
					introducedAtPosition: 49
				}
			]
		},

		// 50. gp_a_juseyo
		{
			id: 'gp_a_juseyo',
			title: '-아/어 주세요',
			category: 'expression',
			tense: null,
			register: 'polite',
			hint: 'please do (for me)',
			description:
				'Polite request asking someone to do something as a favor. ' +
				'Verb stem + 아/어 주세요: 가르치다 → 가르쳐 주세요 "please teach me." ' +
				'Same vowel harmony as -아요/어요. More specifically requesting action for the speaker\'s benefit.',
			level: 1,
			tags: ['expression', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + 아/어 주세요',
			notes: [
				{ type: 'tip', title: '-(으)세요 vs -아/어 주세요', content: '-(으)세요 is a general polite command. -아/어 주세요 specifically asks "please do this for me" — implies a favor.' },
				{ type: 'tip', title: 'Common Phrases', content: '도와주세요 (please help), 알려 주세요 (please let me know), 기다려 주세요 (please wait).' }
			],
			relatedPointIds: ['gp_euseyo'],
			lessonExamples: [
				{
					id: 'le_a_juseyo_01',
					fullSentence: '사진을 찍어 주세요.',
					sentenceWithBlank: '사진을 찍어 ___.',
					answer: '주세요',
					englishHint: 'Please take a photo (for me).',
					order: 0
				},
				{
					id: 'le_a_juseyo_02',
					fullSentence: '천천히 말해 주세요.',
					sentenceWithBlank: '천천히 말해 ___.',
					answer: '주세요',
					englishHint: 'Please speak slowly (for me).',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_a_juseyo_01',
					fullSentence: '사진을 찍어 주세요.',
					sentenceWithBlank: '사진을 찍어 ___.',
					answer: '주세요',
					alternateAnswers: [],
					vocabBaseForm: '-아/어 주세요',
					englishHint: 'Please take a photo (for me).',
					introducedAtPosition: 50
				},
				{
					id: 'cc_a_juseyo_02',
					fullSentence: '문을 열어 주세요.',
					sentenceWithBlank: '문을 열어 ___.',
					answer: '주세요',
					alternateAnswers: [],
					vocabBaseForm: '-아/어 주세요',
					englishHint: 'Please open the door (for me).',
					introducedAtPosition: 50
				},
				{
					id: 'cc_a_juseyo_03',
					fullSentence: '한국어로 말해 주세요.',
					sentenceWithBlank: '한국어로 말해 ___.',
					answer: '주세요',
					alternateAnswers: [],
					vocabBaseForm: '-아/어 주세요',
					englishHint: 'Please speak in Korean (for me).',
					introducedAtPosition: 50
				}
			]
		},

		// 51. gp_aya_hada
		{
			id: 'gp_aya_hada',
			title: '-아/어야 하다',
			category: 'expression',
			tense: null,
			register: 'polite informal',
			hint: 'must, have to',
			description:
				'Expresses obligation or necessity. Verb stem + 아야/어야 하다: ' +
				'가다 → 가야 해요 "must go." 먹다 → 먹어야 해요 "must eat." ' +
				'하다 → 해야 해요 "must do." Same vowel harmony as -아요/어요.',
			level: 1,
			tags: ['expression', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + 아야/어야 하다',
			notes: [
				{ type: 'tip', title: 'Vowel Harmony', content: 'Same as -아요/어요: stem ㅏ/ㅗ → 아야 해요; otherwise → 어야 해요. 하다 → 해야 해요.' },
				{ type: 'tip', title: 'Negative', content: '-지 않아도 돼요 means "don\'t have to" (no obligation). Not covered here but useful to know.' }
			],
			lessonExamples: [
				{
					id: 'le_aya_hada_01',
					fullSentence: '내일 학교에 가야 해요.',
					sentenceWithBlank: '내일 학교에 가야 ___.',
					answer: '해요',
					englishHint: 'I have to go to school tomorrow.',
					order: 0
				},
				{
					id: 'le_aya_hada_02',
					fullSentence: '숙제를 해야 해요.',
					sentenceWithBlank: '숙제를 해야 ___.',
					answer: '해요',
					englishHint: 'I have to do homework.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_aya_hada_01',
					fullSentence: '내일 학교에 가야 해요.',
					sentenceWithBlank: '내일 학교에 ___ 해요.',
					answer: '가야',
					alternateAnswers: [],
					vocabBaseForm: '가다',
					englishHint: 'I have to go to school tomorrow.',
					introducedAtPosition: 51
				},
				{
					id: 'cc_aya_hada_02',
					fullSentence: '약을 먹어야 해요.',
					sentenceWithBlank: '약을 ___ 해요.',
					answer: '먹어야',
					alternateAnswers: [],
					vocabBaseForm: '먹다',
					englishHint: 'I have to take medicine.',
					introducedAtPosition: 51
				},
				{
					id: 'cc_aya_hada_03',
					fullSentence: '지금 공부해야 해요.',
					sentenceWithBlank: '지금 ___ 해요.',
					answer: '공부해야',
					alternateAnswers: [],
					vocabBaseForm: '공부하다',
					englishHint: 'I have to study now.',
					introducedAtPosition: 51
				}
			]
		},

		// 52. gp_go_sipda
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
				'Use it to express your own desire or ask the listener what they want. To describe someone else’s visible desire, the usual form is -고 싶어하다.',
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
					englishHint: 'I want to go to Korea.',
					order: 0
				},
				{
					id: 'le_go_sipda_02',
					fullSentence: '커피를 마시고 싶어요.',
					sentenceWithBlank: '커피를 마시고 ___.',
					answer: '싶어요',
					englishHint: 'I want to drink coffee.',
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
					englishHint: 'I want to go to Korea.',
					introducedAtPosition: 52
				},
				{
					id: 'cc_go_sipda_02',
					fullSentence: '불고기를 먹고 싶어요.',
					sentenceWithBlank: '불고기를 먹고 ___.',
					answer: '싶어요',
					alternateAnswers: [],
					vocabBaseForm: '-고 싶다',
					englishHint: 'I want to eat bulgogi.',
					introducedAtPosition: 52
				},
				{
					id: 'cc_go_sipda_03',
					fullSentence: '영화를 보고 싶어요.',
					sentenceWithBlank: '영화를 보고 ___.',
					answer: '싶어요',
					alternateAnswers: [],
					vocabBaseForm: '-고 싶다',
					englishHint: 'I want to watch a movie.',
					introducedAtPosition: 52
				}
			]
		}
	]
};
