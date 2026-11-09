import type { LessonSeed } from '../types';

// Lesson 2 — Things Around You
// Positions 5–7
// 5. igeos
// 6. geugeos
// 7. jeogeos
export const lesson02: LessonSeed = {
	lessonNumber: 2,
	title: "Things Around You",
	grammarPoints: [
		// 5. gp_igeos
		{
			id: 'gp_igeos',
			title: '이것',
			category: 'demonstrative',
			tense: null,
			register: null,
			hint: 'this thing (near speaker)',
			description:
				'A demonstrative pronoun meaning "this (thing)" — refers to something near the speaker. ' +
				'Often shortened to 이거 in casual speech. ' +
				'Part of a three-way system: 이것 (near me), 그것 (near you), 저것 (over there).',
			level: 1,
			tags: ['demonstrative', 'beginner', 'TOPIK1'],
			structurePattern: '이것 + particle',
			notes: [
				{ type: 'tip', title: 'Casual Form', content: '이것 → 이거 in casual speech. Both are correct.' },
				{ type: 'funfact', title: 'Three-Way System', content: 'Korean has three demonstratives based on distance: 이 (near speaker), 그 (near listener), 저 (far from both).' }
			],
			lessonExamples: [
				{
					id: 'le_igeos_01',
					fullSentence: '이것은 책이에요.',
					sentenceWithBlank: '___은 책이에요.',
					answer: '이것',
					englishHint: 'This is a book.',
					order: 0,
					notes: 'Uses 은/는 (GP3), 이에요/예요 (GP1).'
				},
				{
					id: 'le_igeos_02',
					fullSentence: '이것은 가방이에요.',
					sentenceWithBlank: '___은 가방이에요.',
					answer: '이것',
					englishHint: 'This is a bag.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_igeos_01',
					fullSentence: '이것은 책이에요.',
					sentenceWithBlank: '___은 책이에요.',
					answer: '이것',
					alternateAnswers: [],
					vocabBaseForm: '이것',
					englishHint: 'This is a book.',
					introducedAtPosition: 5
				},
				{
					id: 'cc_igeos_02',
					fullSentence: '이것은 뭐예요?',
					sentenceWithBlank: '___은 뭐예요?',
					answer: '이것',
					alternateAnswers: [],
					vocabBaseForm: '이것',
					englishHint: 'What is this?',
					introducedAtPosition: 5
				},
				{
					id: 'cc_igeos_03',
					fullSentence: '이것은 사과예요.',
					sentenceWithBlank: '___은 사과예요.',
					answer: '이것',
					alternateAnswers: [],
					vocabBaseForm: '이것',
					englishHint: 'This is an apple.',
					introducedAtPosition: 5
				}
			]
		},

		// 6. gp_geugeos
		{
			id: 'gp_geugeos',
			title: '그것',
			category: 'demonstrative',
			tense: null,
			register: null,
			hint: 'that thing (near listener)',
			description:
				'A demonstrative pronoun meaning "that (thing)" — refers to something near the listener ' +
				'or something already mentioned. Often shortened to 그거 in casual speech.',
			level: 1,
			tags: ['demonstrative', 'beginner', 'TOPIK1'],
			structurePattern: '그것 + particle',
			notes: [
				{ type: 'tip', title: 'Casual Form', content: '그것 → 그거 in casual speech.' },
				{ type: 'tip', title: 'Referencing Earlier Topics', content: '그것 can also refer to something previously mentioned in conversation, like English "that" or "it."' }
			],
			lessonExamples: [
				{
					id: 'le_geugeos_01',
					fullSentence: '그것은 연필이에요.',
					sentenceWithBlank: '___은 연필이에요.',
					answer: '그것',
					englishHint: 'That is a pencil.',
					order: 0
				},
				{
					id: 'le_geugeos_02',
					fullSentence: '그것은 우유예요.',
					sentenceWithBlank: '___은 우유예요.',
					answer: '그것',
					englishHint: 'That is milk.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_geugeos_01',
					fullSentence: '그것은 연필이에요.',
					sentenceWithBlank: '___은 연필이에요.',
					answer: '그것',
					alternateAnswers: [],
					vocabBaseForm: '그것',
					englishHint: 'That is a pencil.',
					introducedAtPosition: 6
				},
				{
					id: 'cc_geugeos_02',
					fullSentence: '그것은 뭐예요?',
					sentenceWithBlank: '___은 뭐예요?',
					answer: '그것',
					alternateAnswers: [],
					vocabBaseForm: '그것',
					englishHint: 'What is that?',
					introducedAtPosition: 6
				},
				{
					id: 'cc_geugeos_03',
					fullSentence: '그것은 지갑이에요.',
					sentenceWithBlank: '___은 지갑이에요.',
					answer: '그것',
					alternateAnswers: [],
					vocabBaseForm: '그것',
					englishHint: 'That is a wallet.',
					introducedAtPosition: 6
				}
			]
		},

		// 7. gp_jeogeos
		{
			id: 'gp_jeogeos',
			title: '저것',
			category: 'demonstrative',
			tense: null,
			register: null,
			hint: 'that thing over there (far)',
			description:
				'A demonstrative pronoun meaning "that (thing) over there" — refers to something far from ' +
				'both the speaker and listener. Often shortened to 저거 in casual speech.',
			level: 1,
			tags: ['demonstrative', 'beginner', 'TOPIK1'],
			structurePattern: '저것 + particle',
			notes: [
				{ type: 'tip', title: 'Casual Form', content: '저것 → 저거 in casual speech.' },
				{ type: 'caution', title: 'Don\'t Confuse', content: '저것 (that over there) is different from 저 (I, humble). Context makes it clear.' }
			],
			lessonExamples: [
				{
					id: 'le_jeogeos_01',
					fullSentence: '저것은 학교예요.',
					sentenceWithBlank: '___은 학교예요.',
					answer: '저것',
					englishHint: 'That over there is a school.',
					order: 0
				},
				{
					id: 'le_jeogeos_02',
					fullSentence: '저것은 산이에요.',
					sentenceWithBlank: '___은 산이에요.',
					answer: '저것',
					englishHint: 'That over there is a mountain.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_jeogeos_01',
					fullSentence: '저것은 학교예요.',
					sentenceWithBlank: '___은 학교예요.',
					answer: '저것',
					alternateAnswers: [],
					vocabBaseForm: '저것',
					englishHint: 'That over there is a school.',
					introducedAtPosition: 7
				},
				{
					id: 'cc_jeogeos_02',
					fullSentence: '저것은 뭐예요?',
					sentenceWithBlank: '___은 뭐예요?',
					answer: '저것',
					alternateAnswers: [],
					vocabBaseForm: '저것',
					englishHint: 'What is that over there?',
					introducedAtPosition: 7
				},
				{
					id: 'cc_jeogeos_03',
					fullSentence: '저것은 병원이에요.',
					sentenceWithBlank: '___은 병원이에요.',
					answer: '저것',
					alternateAnswers: [],
					vocabBaseForm: '저것',
					englishHint: 'That over there is a hospital.',
					introducedAtPosition: 7
				}
			]
		}
	]
};
