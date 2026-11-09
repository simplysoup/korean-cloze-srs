import type { LessonSeed } from '../types';

// Lesson 10 — Connecting Actions and Making Plans
// Grammar points (positions 43–45):
//   43. go_seq
//   44. eulgeyo
//   45. eul_geoyeyo
// Examples and cards use only grammar through their target position.

export const lesson10: LessonSeed = {
	lessonNumber: 10,
	title: "Connecting Actions and Making Plans",
	grammarPoints: [
		// 43. gp_go_seq
		{
			id: 'gp_go_seq',
			title: '-고',
			category: 'connective',
			tense: null,
			register: null,
			hint: 'and, and then (sequential/listing)',
			description:
				'Connects two actions sequentially or lists parallel actions. ' +
				'Verb stem + 고: 밥을 먹고 커피를 마셔요 "I eat and (then) drink coffee." ' +
				'No vowel harmony — always 고. Can express time order or simple listing.',
			level: 1,
			tags: ['connective', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + 고 + [next action]',
			notes: [
				{ type: 'tip', title: 'No Conjugation', content: '-고 attaches directly to any verb stem. No consonant/vowel rules: 먹고, 가고, 하고. Same form as 하고 (and/with) for nouns.' },
				{ type: 'tip', title: 'Order Matters', content: 'When sequential: 손을 씻고 밥을 먹어요 (wash hands THEN eat). When listing: 노래하고 춤을 춰요 (sing AND dance — simultaneous).' }
			],
			relatedPointIds: ['gp_hago'],
			lessonExamples: [
				{
					id: 'le_go_seq_01',
					fullSentence: '아침을 먹고 학교에 가요.',
					sentenceWithBlank: '아침을 먹___ 학교에 가요.',
					answer: '고',
					englishHint: 'I eat breakfast and then go to school.',
					order: 0
				},
				{
					id: 'le_go_seq_02',
					fullSentence: '숙제를 하고 텔레비전을 봐요.',
					sentenceWithBlank: '숙제를 하___ 텔레비전을 봐요.',
					answer: '고',
					englishHint: 'I do homework and then watch TV.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_go_seq_01',
					fullSentence: '아침을 먹고 학교에 가요.',
					sentenceWithBlank: '아침을 먹___ 학교에 가요.',
					answer: '고',
					alternateAnswers: [],
					vocabBaseForm: '-고',
					englishHint: 'I eat breakfast and then go to school.',
					introducedAtPosition: 43
				},
				{
					id: 'cc_go_seq_02',
					fullSentence: '샤워하고 옷을 입었어요.',
					sentenceWithBlank: '샤워하___ 옷을 입었어요.',
					answer: '고',
					alternateAnswers: [],
					vocabBaseForm: '-고',
					englishHint: 'I showered and then got dressed.',
					introducedAtPosition: 43
				},
				{
					id: 'cc_go_seq_03',
					fullSentence: '커피를 마시고 일을 시작해요.',
					sentenceWithBlank: '커피를 마시___ 일을 시작해요.',
					answer: '고',
					alternateAnswers: [],
					vocabBaseForm: '-고',
					englishHint: 'I drink coffee and then start work.',
					introducedAtPosition: 43
				}
			]
		},

		// 44. gp_eulgeyo
		{
			id: 'gp_eulgeyo',
			title: '-(으)ㄹ게요',
			category: 'verb-ending',
			tense: 'future',
			register: 'polite informal',
			hint: 'I will (promise to listener)',
			description:
				'Expresses the speaker\'s intention or promise, with consideration for the listener. ' +
				'After consonant stem → -을게요: 먹다 → 먹을게요. After vowel stem → -ㄹ게요: 가다 → 갈게요. ' +
				'First person only. Implies "I will (and you should know / it affects you)."',
			level: 1,
			tags: ['verb-ending', 'future', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + (으)ㄹ게요',
			notes: [
				{ type: 'tip', title: 'First Person Only', content: '-(으)ㄹ게요 is ONLY for "I will." For "you/he/she will," use -(으)ㄹ 거예요.' },
				{ type: 'tip', title: 'vs -(으)ㄹ 거예요', content: '-(으)ㄹ게요 = promise/consideration for listener. -(으)ㄹ 거예요 = plan/prediction (any person).' }
			],
			relatedPointIds: ['gp_eul_geoyeyo'],
			lessonExamples: [
				{
					id: 'le_eulgeyo_01',
					fullSentence: '제가 할게요.',
					sentenceWithBlank: '제가 ___.',
					answer: '할게요',
					englishHint: "I'll do it.",
					order: 0
				},
				{
					id: 'le_eulgeyo_02',
					fullSentence: '내일 전화할게요.',
					sentenceWithBlank: '내일 ___.',
					answer: '전화할게요',
					englishHint: "I'll call (you) tomorrow.",
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_eulgeyo_01',
					fullSentence: '제가 할게요.',
					sentenceWithBlank: '제가 ___.',
					answer: '할게요',
					alternateAnswers: [],
					vocabBaseForm: '하다',
					englishHint: "I'll do it.",
					introducedAtPosition: 44
				},
				{
					id: 'cc_eulgeyo_02',
					fullSentence: '내일 갈게요.',
					sentenceWithBlank: '내일 ___.',
					answer: '갈게요',
					alternateAnswers: [],
					vocabBaseForm: '가다',
					englishHint: "I'll go tomorrow.",
					introducedAtPosition: 44
				},
				{
					id: 'cc_eulgeyo_03',
					fullSentence: '다음에 더 열심히 할게요.',
					sentenceWithBlank: '다음에 더 열심히 ___.',
					answer: '할게요',
					alternateAnswers: [],
					vocabBaseForm: '하다',
					englishHint: "I'll try harder next time.",
					introducedAtPosition: 44
				}
			]
		},

		// 45. gp_eul_geoyeyo
		{
			id: 'gp_eul_geoyeyo',
			title: '-(으)ㄹ 거예요',
			category: 'verb-ending',
			tense: 'future',
			register: 'polite informal',
			hint: 'will, going to (plan/prediction)',
			description:
				'Expresses a future plan or prediction. Works for all persons. ' +
				'After consonant stem → -을 거예요: 먹다 → 먹을 거예요. After vowel stem → -ㄹ 거예요: 가다 → 갈 거예요. ' +
				'내일 뭐 할 거예요? "What will you do tomorrow?"',
			level: 1,
			tags: ['verb-ending', 'future', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + (으)ㄹ 거예요',
			notes: [
				{ type: 'tip', title: 'All Persons', content: '저는 갈 거예요 (I will go). 친구는 갈 거예요 (My friend will go). 비가 올 거예요 (It will rain). Any subject works.' },
				{ type: 'tip', title: 'Questions', content: '뭐 할 거예요? (What will you do?), 어디 갈 거예요? (Where will you go?) — very common question patterns.' }
			],
			relatedPointIds: ['gp_eulgeyo'],
			lessonExamples: [
				{
					id: 'le_eul_geoyeyo_01',
					fullSentence: '내일 한국어를 공부할 거예요.',
					sentenceWithBlank: '내일 한국어를 공부할 ___.',
					answer: '거예요',
					englishHint: "I'm going to study Korean tomorrow.",
					order: 0
				},
				{
					id: 'le_eul_geoyeyo_02',
					fullSentence: '주말에 친구를 만날 거예요.',
					sentenceWithBlank: '주말에 친구를 만날 ___.',
					answer: '거예요',
					englishHint: "I'm going to meet a friend on the weekend.",
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_eul_geoyeyo_01',
					fullSentence: '내일 한국어를 공부할 거예요.',
					sentenceWithBlank: '내일 한국어를 공부할 ___.',
					answer: '거예요',
					alternateAnswers: [],
					vocabBaseForm: '-(으)ㄹ 거예요',
					englishHint: "I'm going to study Korean tomorrow.",
					introducedAtPosition: 45
				},
				{
					id: 'cc_eul_geoyeyo_02',
					fullSentence: '오늘 저녁에 뭐 먹을 거예요?',
					sentenceWithBlank: '오늘 저녁에 뭐 먹을 ___?',
					answer: '거예요',
					alternateAnswers: [],
					vocabBaseForm: '-(으)ㄹ 거예요',
					englishHint: 'What are you going to eat tonight?',
					introducedAtPosition: 45
				},
				{
					id: 'cc_eul_geoyeyo_03',
					fullSentence: '내년에 한국에 갈 거예요.',
					sentenceWithBlank: '내년에 한국에 갈 ___.',
					answer: '거예요',
					alternateAnswers: [],
					vocabBaseForm: '-(으)ㄹ 거예요',
					englishHint: "I'm going to go to Korea next year.",
					introducedAtPosition: 45
				}
			]
		}
	]
};
