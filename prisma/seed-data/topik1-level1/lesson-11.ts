import type { LessonSeed } from '../types';

// Lesson 11 — Reactions, Confirmation and Uncertainty
// Grammar points (positions 48–50):
//   48. neyo
//   49. jiyo
//   50. n_geos_gatda
// Examples and cards use only grammar through their target position.

export const lesson11: LessonSeed = {
	lessonNumber: 11,
	title: "Reactions, Confirmation and Uncertainty",
	grammarPoints: [
		// 48. gp_neyo
		{
			id: 'gp_neyo',
			title: '-네요',
			category: 'verb-ending',
			tense: 'present',
			register: 'polite informal',
			hint: 'surprise / realization ending',
			description:
				'A sentence-ending expressing mild surprise or a new realization. ' +
				'Attaches to verb/adjective stems: 크다 → 크네요 ("Oh, it\'s big!"), 맛있다 → 맛있네요. ' +
				'Shows the speaker is noticing something for the first time.',
			level: 1,
			tags: ['verb-ending', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb/Adj stem + 네요',
			notes: [
				{ type: 'tip', title: 'Direct Attachment', content: '-네요 attaches directly to the verb stem with no modification: 먹다 → 먹네요, 크다 → 크네요.' },
				{ type: 'funfact', title: 'Feeling', content: '-네요 conveys "Oh, I see!" or "Oh, how nice!" — a warm, observational tone.' }
			],
			lessonExamples: [
				{
					id: 'le_neyo_01',
					fullSentence: '날씨가 좋네요.',
					sentenceWithBlank: '날씨가 좋___.',
					answer: '네요',
					englishHint: 'Oh, the weather is nice!',
					order: 0,
					notes: 'Uses 이/가 (GP9). Stem 좋 + 네요.'
				},
				{
					id: 'le_neyo_02',
					fullSentence: '이것은 맛있네요.',
					sentenceWithBlank: '이것은 맛있___.',
					answer: '네요',
					englishHint: 'Oh, this is delicious!',
					order: 1,
					notes: 'Uses 이것 (GP4), 은/는 (GP3). Stem 맛있 + 네요.'
				}
			],
			cards: [
				{
					id: 'cc_neyo_01',
					fullSentence: '날씨가 좋네요.',
					sentenceWithBlank: '날씨가 좋___.',
					answer: '네요',
					alternateAnswers: [],
					vocabBaseForm: '좋다',
					englishHint: 'Oh, the weather is nice!',
					introducedAtPosition: 48
				},
				{
					id: 'cc_neyo_02',
					fullSentence: '이 음식은 맛있네요.',
					sentenceWithBlank: '이 음식은 맛있___.',
					answer: '네요',
					alternateAnswers: [],
					vocabBaseForm: '맛있다',
					englishHint: 'Oh, this food is delicious!',
					introducedAtPosition: 48
				},
				{
					id: 'cc_neyo_03',
					fullSentence: '한국어를 잘하네요.',
					sentenceWithBlank: '한국어를 잘하___.',
					answer: '네요',
					alternateAnswers: [],
					vocabBaseForm: '잘하다',
					englishHint: "Oh, you're good at Korean!",
					introducedAtPosition: 48
				}
			]
		},

		// 49. gp_jiyo
		{
			id: 'gp_jiyo',
			title: '-지요/죠',
			category: 'verb-ending',
			tense: 'present',
			register: 'polite informal',
			hint: 'confirmation ("…right?")',
			description:
				'A sentence-ending that seeks confirmation or states something assumed to be common knowledge. ' +
				'죠 is the contracted form of 지요 and is more common in speech. ' +
				'Equivalent to English "…right?" or "…isn\'t it?"',
			level: 1,
			tags: ['verb-ending', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb/Adj stem + 지요(죠)',
			notes: [
				{ type: 'tip', title: 'Contraction', content: '지요 → 죠 in casual speech. Both are polite. 죠 is overwhelmingly more common in conversation.' },
				{ type: 'tip', title: 'Usage', content: 'Use when you believe the listener already knows or agrees: "한국 음식 좋아하죠?" = "You like Korean food, right?"' }
			],
			lessonExamples: [
				{
					id: 'le_jiyo_01',
					fullSentence: '한국어는 재미있지요?',
					sentenceWithBlank: '한국어는 재미있___?',
					answer: '지요',
					englishHint: 'Korean is fun, right?',
					order: 0,
					notes: 'Uses 은/는 (GP3). Stem 재미있 + 지요.'
				},
				{
					id: 'le_jiyo_02',
					fullSentence: '이것은 좋죠?',
					sentenceWithBlank: '이것은 좋___?',
					answer: '죠',
					englishHint: 'This is good, right?',
					order: 1,
					notes: 'Uses 이것 (GP4), 은/는 (GP3). Contracted form 죠.'
				}
			],
			cards: [
				{
					id: 'cc_jiyo_01',
					fullSentence: '한국어는 재미있지요?',
					sentenceWithBlank: '한국어는 재미있___?',
					answer: '지요',
					alternateAnswers: ['죠'],
					vocabBaseForm: '재미있다',
					englishHint: 'Korean is fun, right?',
					introducedAtPosition: 49
				},
				{
					id: 'cc_jiyo_02',
					fullSentence: '맛있죠?',
					sentenceWithBlank: '맛있___?',
					answer: '죠',
					alternateAnswers: ['지요'],
					vocabBaseForm: '맛있다',
					englishHint: "It's delicious, right?",
					introducedAtPosition: 49
				},
				{
					id: 'cc_jiyo_03',
					fullSentence: '이 영화는 재미있죠?',
					sentenceWithBlank: '이 영화는 재미있___?',
					answer: '죠',
					alternateAnswers: ['지요'],
					vocabBaseForm: '재미있다',
					englishHint: 'This movie is fun, right?',
					introducedAtPosition: 49
				}
			]
		},

		// 50. gp_n_geos_gatda
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
					englishHint: 'This food seems expensive.',
					order: 0
				},
				{
					id: 'le_geos_gatda_02',
					fullSentence: '오늘은 추운 것 같아요.',
					sentenceWithBlank: '오늘은 추운 것 ___.',
					answer: '같아요',
					englishHint: 'Today seems cold.',
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
					englishHint: 'This bag seems expensive.',
					introducedAtPosition: 50
				},
				{
					id: 'cc_geos_gatda_02',
					fullSentence: '날씨가 좋은 것 같아요.',
					sentenceWithBlank: '날씨가 좋은 것 ___.',
					answer: '같아요',
					alternateAnswers: [],
					vocabBaseForm: '-ㄴ 것 같다',
					englishHint: 'The weather seems nice.',
					introducedAtPosition: 50
				},
				{
					id: 'cc_geos_gatda_03',
					fullSentence: '그 사람은 한국 사람인 것 같아요.',
					sentenceWithBlank: '그 사람은 한국 사람인 것 ___.',
					answer: '같아요',
					alternateAnswers: [],
					vocabBaseForm: '-ㄴ 것 같다',
					englishHint: 'That person seems to be Korean.',
					introducedAtPosition: 50
				}
			]
		}
	]
};
