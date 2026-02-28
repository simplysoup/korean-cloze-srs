import type { LessonSeed } from '../types';

// ══════════════════════════════════════════════════════════════════════════════
// Lesson 9 — Reason and Cause
//
// Grammar points (positions 40–42):
//  40. -아/어서        Because / so (sequential cause, no tense in 1st clause)
//  41. -(으)니까       Because / since (subjective reason, allows tense)
//  42. 그래서          So / therefore (sentence-initial connector)
//
// Available: all L1–L8 grammar (pos 1–39).
// ══════════════════════════════════════════════════════════════════════════════

const h = (text: string, highlightType: 'none' | 'direct' | 'related' = 'none') => ({ text, highlightType });

export const lesson09: LessonSeed = {
	lessonNumber: 9,
	title: 'Reason and Cause',
	grammarPoints: [
		// ── 40. -아/어서 — Because / so ─────────────────────────────────────
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
				'Same vowel harmony as -아요/어요. The first clause CANNOT take past tense — tense is on the final verb only.',
			level: 1,
			tags: ['connective', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + 아서/어서 + [result clause]',
			notes: [
				{ type: 'caution', title: 'No Tense in 1st Clause', content: '-아/어서 clause cannot have past/future tense markers. Use -(으)니까 if you need tense in the reason clause.' },
				{ type: 'tip', title: 'Common Combinations', content: '만나서 반갑습니다 (Nice to meet you — lit. "meeting, I am pleased"). 늦어서 죄송합니다 (Sorry for being late).' }
			],
			relatedPointIds: ['gp_eunikka'],
			lessonExamples: [
				{
					id: 'le_aseo_01',
					fullSentence: '배가 고파서 밥을 먹었어요.',
					sentenceWithBlank: '배가 ___ 밥을 먹었어요.',
					answer: '고파서',
					englishHint: [h('I ate ', 'none'), h('because', 'direct'), h(' I was hungry.', 'none')],
					order: 0
				},
				{
					id: 'le_aseo_02',
					fullSentence: '피곤해서 집에 있었어요.',
					sentenceWithBlank: '___ 집에 있었어요.',
					answer: '피곤해서',
					englishHint: [h('I stayed home ', 'none'), h('because', 'direct'), h(' I was tired.', 'none')],
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
					englishHint: [h('I ate ', 'none'), h('because', 'direct'), h(' I was hungry.', 'none')],
					introducedAtPosition: 40
				},
				{
					id: 'cc_aseo_02',
					fullSentence: '비가 와서 우산을 가져갔어요.',
					sentenceWithBlank: '비가 와___ 우산을 가져갔어요.',
					answer: '서',
					alternateAnswers: [],
					vocabBaseForm: '-아/어서',
					englishHint: [h('I took an umbrella ', 'none'), h('because', 'direct'), h(' it was raining.', 'none')],
					introducedAtPosition: 40
				},
				{
					id: 'cc_aseo_03',
					fullSentence: '늦어서 택시를 탔어요.',
					sentenceWithBlank: '늦어___ 택시를 탔어요.',
					answer: '서',
					alternateAnswers: [],
					vocabBaseForm: '-아/어서',
					englishHint: [h('I took a taxi ', 'none'), h('because', 'direct'), h(' I was late.', 'none')],
					introducedAtPosition: 40
				}
			]
		},

		// ── 41. -(으)니까 — Because / since ─────────────────────────────────
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
				{ type: 'tip', title: '-(으)니까 vs -아/어서', content: '-(으)니까 is more subjective and can precede commands: 시간이 없으니까 빨리 가세요. -아/어서 cannot precede commands.' },
				{ type: 'tip', title: 'Past OK', content: '-(으)니까 allows past tense: 이미 먹었으니까 안 먹어요 (I already ate, so I\'m not eating).' }
			],
			relatedPointIds: ['gp_aseo'],
			lessonExamples: [
				{
					id: 'le_eunikka_01',
					fullSentence: '시간이 없으니까 빨리 가세요.',
					sentenceWithBlank: '시간이 ___ 빨리 가세요.',
					answer: '없으니까',
					englishHint: [h('Please go quickly ', 'none'), h('because', 'direct'), h(" there's no time.", 'none')],
					order: 0
				},
				{
					id: 'le_eunikka_02',
					fullSentence: '날씨가 추우니까 옷을 많이 입으세요.',
					sentenceWithBlank: '날씨가 ___ 옷을 많이 입으세요.',
					answer: '추우니까',
					englishHint: [h('Please dress warmly ', 'none'), h('because', 'direct'), h(" it's cold.", 'none')],
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
					englishHint: [h('Please go quickly ', 'none'), h('because', 'direct'), h(" there's no time.", 'none')],
					introducedAtPosition: 41
				},
				{
					id: 'cc_eunikka_02',
					fullSentence: '비가 오니까 우산을 가져가세요.',
					sentenceWithBlank: '비가 오___ 우산을 가져가세요.',
					answer: '니까',
					alternateAnswers: [],
					vocabBaseForm: '-(으)니까',
					englishHint: [h('Take an umbrella ', 'none'), h('because', 'direct'), h(" it's raining.", 'none')],
					introducedAtPosition: 41
				},
				{
					id: 'cc_eunikka_03',
					fullSentence: '맛있으니까 많이 드세요.',
					sentenceWithBlank: '맛있으___ 많이 드세요.',
					answer: '니까',
					alternateAnswers: [],
					vocabBaseForm: '-(으)니까',
					englishHint: [h('Please eat a lot ', 'none'), h('because', 'direct'), h(" it's delicious.", 'none')],
					introducedAtPosition: 41
				}
			]
		},

		// ── 42. 그래서 — So / therefore ─────────────────────────────────────
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
					englishHint: [h('I was hungry. ', 'none'), h('So', 'direct'), h(' I ate.', 'none')],
					order: 0
				},
				{
					id: 'le_geuraeseo_02',
					fullSentence: '비가 왔어요. 그래서 집에 있었어요.',
					sentenceWithBlank: '비가 왔어요. ___ 집에 있었어요.',
					answer: '그래서',
					englishHint: [h('It rained. ', 'none'), h('So', 'direct'), h(' I stayed home.', 'none')],
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
					englishHint: [h('I was hungry. ', 'none'), h('So', 'direct'), h(' I ate.', 'none')],
					introducedAtPosition: 42
				},
				{
					id: 'cc_geuraeseo_02',
					fullSentence: '시간이 없었어요. 그래서 택시를 탔어요.',
					sentenceWithBlank: '시간이 없었어요. ___ 택시를 탔어요.',
					answer: '그래서',
					alternateAnswers: [],
					vocabBaseForm: '그래서',
					englishHint: [h('I had no time. ', 'none'), h('So', 'direct'), h(' I took a taxi.', 'none')],
					introducedAtPosition: 42
				},
				{
					id: 'cc_geuraeseo_03',
					fullSentence: '한국어를 좋아해요. 그래서 매일 공부해요.',
					sentenceWithBlank: '한국어를 좋아해요. ___ 매일 공부해요.',
					answer: '그래서',
					alternateAnswers: [],
					vocabBaseForm: '그래서',
					englishHint: [h('I like Korean. ', 'none'), h('So', 'direct'), h(' I study every day.', 'none')],
					introducedAtPosition: 42
				}
			]
		}
	]
};
