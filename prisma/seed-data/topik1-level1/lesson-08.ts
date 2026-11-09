import type { LessonSeed } from '../types';

// Lesson 8 — Ability and Giving Reasons
// Grammar points (positions 36–39):
//   36. eul_su_issda
//   37. eunikka
//   38. aseo
//   39. geuraeseo
// Examples and cards use only grammar through their target position.

export const lesson08: LessonSeed = {
	lessonNumber: 8,
	title: "Ability and Giving Reasons",
	grammarPoints: [
		// 36. gp_eul_su_issda
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
					englishHint: 'I can read Korean.',
					order: 0
				},
				{
					id: 'le_eul_su_02',
					fullSentence: '매운 음식을 먹을 수 없어요.',
					sentenceWithBlank: '매운 음식을 먹을 수 ___.',
					answer: '없어요',
					englishHint: 'I cannot eat spicy food.',
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
					englishHint: 'I can read Korean.',
					introducedAtPosition: 36
				},
				{
					id: 'cc_eul_su_02',
					fullSentence: '내일 갈 수 있어요.',
					sentenceWithBlank: '내일 갈 ___ 있어요.',
					answer: '수',
					alternateAnswers: [],
					vocabBaseForm: '-(으)ㄹ 수 있다',
					englishHint: 'I can go tomorrow.',
					introducedAtPosition: 36
				},
				{
					id: 'cc_eul_su_03',
					fullSentence: '여기에서 수영할 수 없어요.',
					sentenceWithBlank: '여기에서 수영할 ___ 없어요.',
					answer: '수',
					alternateAnswers: [],
					vocabBaseForm: '-(으)ㄹ 수 있다',
					englishHint: 'You cannot swim here.',
					introducedAtPosition: 36
				}
			]
		},

		// 37. gp_eunikka
		{
			id: 'gp_eunikka',
			title: '-(으)니까',
			category: 'connective',
			tense: null,
			register: null,
			hint: 'because, since (subjective reason)',
			description:
				'Connects a reason clause to a result clause. More subjective than -아/어서. ' +
				'After consonant stem → -으니까: 읽다 → 읽으니까. After vowel stem → -니까: 가다 → 가니까. ' +
				'CAN take past tense: 갔으니까. Often used with commands/suggestions.',
			level: 1,
			tags: ['connective', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + (으)니까 + [result clause]',
			notes: [
				{ type: 'tip', title: '-(으)니까 vs -아/어서', content: '-(으)니까 is more subjective and can precede commands: 시간이 없으니까 빨리 가세요. Use -(으)니까 for a reason followed by a command or suggestion in this lesson.' },
				{ type: 'tip', title: 'Past OK', content: '-(으)니까 allows past tense: 이미 먹었으니까 안 먹어요 (I already ate, so I\'m not eating).' }
			],
			relatedPointIds: ['gp_aseo'],
			lessonExamples: [
				{
					id: 'le_eunikka_01',
					fullSentence: '시간이 없으니까 빨리 가세요.',
					sentenceWithBlank: '시간이 ___ 빨리 가세요.',
					answer: '없으니까',
					englishHint: "Please go quickly because there's no time.",
					order: 0
				},
				{
					id: 'le_eunikka_02',
					fullSentence: '날씨가 추우니까 옷을 많이 입으세요.',
					sentenceWithBlank: '날씨가 ___ 옷을 많이 입으세요.',
					answer: '추우니까',
					englishHint: "Please dress warmly because it's cold.",
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_eunikka_01',
					fullSentence: '시간이 없으니까 빨리 가세요.',
					sentenceWithBlank: '시간이 없으___ 빨리 가세요.',
					answer: '니까',
					alternateAnswers: [],
					vocabBaseForm: '-(으)니까',
					englishHint: "Please go quickly because there's no time.",
					introducedAtPosition: 37
				},
				{
					id: 'cc_eunikka_02',
					fullSentence: '비가 오니까 우산을 가져가세요.',
					sentenceWithBlank: '비가 오___ 우산을 가져가세요.',
					answer: '니까',
					alternateAnswers: [],
					vocabBaseForm: '-(으)니까',
					englishHint: "Take an umbrella because it's raining.",
					introducedAtPosition: 37
				},
				{
					id: 'cc_eunikka_03',
					fullSentence: '맛있으니까 많이 드세요.',
					sentenceWithBlank: '맛있으___ 많이 드세요.',
					answer: '니까',
					alternateAnswers: [],
					vocabBaseForm: '-(으)니까',
					englishHint: "Please eat a lot because it's delicious.",
					introducedAtPosition: 37
				}
			]
		},

		// 38. gp_aseo
		{
			id: 'gp_aseo',
			title: '-아/어서',
			category: 'connective',
			tense: null,
			register: null,
			hint: 'because, so (cause → result)',
			description:
				'Connects two clauses where the first is the reason for the second. ' +
				'Verb stem + 아서/어서: 배가 고파서 밥을 먹었어요 "Because I was hungry, I ate." ' +
				'Same vowel harmony as -아요/어요. In the pattern taught here, put tense on the final verb.',
			level: 1,
			tags: ['connective', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + 아서/어서 + [result clause]',
			notes: [
				{ type: 'caution', title: 'Where to put tense', content: 'For these beginner examples, leave the reason clause unmarked for tense and mark the main verb. Compare -(으)니까 when explicitly marking a past reason.' },
				{ type: 'tip', title: 'Common Combinations', content: '만나서 반갑습니다 (Nice to meet you — lit. "meeting, I am pleased"). 늦어서 죄송합니다 (Sorry for being late).' }
			],
			relatedPointIds: ['gp_eunikka'],
			lessonExamples: [
				{
					id: 'le_aseo_01',
					fullSentence: '배가 고파서 밥을 먹었어요.',
					sentenceWithBlank: '배가 ___ 밥을 먹었어요.',
					answer: '고파서',
					englishHint: 'I ate because I was hungry.',
					order: 0
				},
				{
					id: 'le_aseo_02',
					fullSentence: '피곤해서 집에 있었어요.',
					sentenceWithBlank: '___ 집에 있었어요.',
					answer: '피곤해서',
					englishHint: 'I stayed home because I was tired.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_aseo_01',
					fullSentence: '배가 고파서 밥을 먹었어요.',
					sentenceWithBlank: '배가 고파___ 밥을 먹었어요.',
					answer: '서',
					alternateAnswers: [],
					vocabBaseForm: '-아/어서',
					englishHint: 'I ate because I was hungry.',
					introducedAtPosition: 38
				},
				{
					id: 'cc_aseo_02',
					fullSentence: '비가 와서 우산을 가져갔어요.',
					sentenceWithBlank: '비가 와___ 우산을 가져갔어요.',
					answer: '서',
					alternateAnswers: [],
					vocabBaseForm: '-아/어서',
					englishHint: 'I took an umbrella because it was raining.',
					introducedAtPosition: 38
				},
				{
					id: 'cc_aseo_03',
					fullSentence: '늦어서 택시를 탔어요.',
					sentenceWithBlank: '늦어___ 택시를 탔어요.',
					answer: '서',
					alternateAnswers: [],
					vocabBaseForm: '-아/어서',
					englishHint: 'I took a taxi because I was late.',
					introducedAtPosition: 38
				}
			]
		},

		// 39. gp_geuraeseo
		{
			id: 'gp_geuraeseo',
			title: '그래서',
			category: 'connective',
			tense: null,
			register: null,
			hint: 'so, therefore (sentence connector)',
			description:
				'Sentence-initial connector meaning "so" or "therefore." ' +
				'Links two sentences where the first is the cause: 비가 왔어요. 그래서 집에 있었어요. ' +
				'"It rained. So I stayed home." Can also be used as a question: 그래서요? "So (what happened)?"',
			level: 1,
			tags: ['connective', 'beginner', 'TOPIK1'],
			structurePattern: '[Cause sentence]. 그래서 [result sentence].',
			notes: [
				{ type: 'tip', title: 'Sentence Connector', content: '그래서 connects two independent sentences. Unlike -아/어서 and -(으)니까, it doesn\'t connect clauses within one sentence.' },
				{ type: 'tip', title: 'Related Words', content: '그래서 (so/therefore), 그런데 (but/however), 그리고 (and/also) are the three most common sentence connectors.' }
			],
			lessonExamples: [
				{
					id: 'le_geuraeseo_01',
					fullSentence: '배가 고팠어요. 그래서 밥을 먹었어요.',
					sentenceWithBlank: '배가 고팠어요. ___ 밥을 먹었어요.',
					answer: '그래서',
					englishHint: 'I was hungry. So I ate.',
					order: 0
				},
				{
					id: 'le_geuraeseo_02',
					fullSentence: '비가 왔어요. 그래서 집에 있었어요.',
					sentenceWithBlank: '비가 왔어요. ___ 집에 있었어요.',
					answer: '그래서',
					englishHint: 'It rained. So I stayed home.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_geuraeseo_01',
					fullSentence: '배가 고팠어요. 그래서 밥을 먹었어요.',
					sentenceWithBlank: '배가 고팠어요. ___ 밥을 먹었어요.',
					answer: '그래서',
					alternateAnswers: [],
					vocabBaseForm: '그래서',
					englishHint: 'I was hungry. So I ate.',
					introducedAtPosition: 39
				},
				{
					id: 'cc_geuraeseo_02',
					fullSentence: '시간이 없었어요. 그래서 택시를 탔어요.',
					sentenceWithBlank: '시간이 없었어요. ___ 택시를 탔어요.',
					answer: '그래서',
					alternateAnswers: [],
					vocabBaseForm: '그래서',
					englishHint: 'I had no time. So I took a taxi.',
					introducedAtPosition: 39
				},
				{
					id: 'cc_geuraeseo_03',
					fullSentence: '한국어를 좋아해요. 그래서 매일 공부해요.',
					sentenceWithBlank: '한국어를 좋아해요. ___ 매일 공부해요.',
					answer: '그래서',
					alternateAnswers: [],
					vocabBaseForm: '그래서',
					englishHint: 'I like Korean. So I study every day.',
					introducedAtPosition: 39
				}
			]
		}
	]
};
