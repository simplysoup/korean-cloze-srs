import type { LessonSeed } from '../types';
import { grammarGapPoints } from '../grammar-gaps';

// Lesson 1 — Introducing Yourself
// Grammar points (positions 1–6):
//   1. ieyo_yeyo
//   2. ani_eyo
//   3. eun_neun
//   4. igeos
//   5. geugeos
//   6. jeogeos
// Examples and cards use only grammar through their target position.

export const lesson01: LessonSeed = {
	lessonNumber: 1,
	title: "Introducing Yourself",
	grammarPoints: [
		// 1. gp_ieyo_yeyo
		{
			id: 'gp_ieyo_yeyo',
			title: '이에요/예요',
			category: 'copula',
			tense: 'present',
			register: 'polite informal',
			hint: 'to be (polite)',
			description:
				'Attaches to a noun to mean "is/am/are" in polite informal speech. ' +
				'Use 이에요 after a noun ending in a consonant (받침), 예요 after a noun ending in a vowel.',
			level: 1,
			tags: ['copula', 'beginner', 'TOPIK1'],
			structurePattern: '[Noun]이에요 / [Noun]예요',
			notes: [
				{ type: 'tip', title: 'Consonant vs Vowel', content: 'Use 이에요 after consonant-ending nouns (학생이에요) and 예요 after vowel-ending nouns (의사예요).' },
				{ type: 'funfact', title: 'Contracted Form', content: '이예요 is a common misspelling. Write 이에요 after a final consonant and 예요 after a vowel; 아니에요 is a separate correct form.' }
			],
			relatedPointIds: ['gp_ida', 'gp_ani_eyo', 'gp_imnida_imnikka'],
			lessonExamples: [
				{
					id: 'le_ieyo_01',
					fullSentence: '학생이에요.',
					sentenceWithBlank: '학생___.',
					answer: '이에요',
					englishHint: 'I am a student.',
					order: 0
				},
				{
					id: 'le_ieyo_02',
					fullSentence: '사과예요.',
					sentenceWithBlank: '사과___.',
					answer: '예요',
					englishHint: "It's an apple.",
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_ieyo_01',
					fullSentence: '학생이에요.',
					sentenceWithBlank: '학생___.',
					answer: '이에요',
					alternateAnswers: [],
					vocabBaseForm: '이에요/예요',
					englishHint: 'I am a student.',
					introducedAtPosition: 1
				},
				{
					id: 'cc_ieyo_02',
					fullSentence: '의사예요.',
					sentenceWithBlank: '의사___.',
					answer: '예요',
					alternateAnswers: [],
					vocabBaseForm: '이에요/예요',
					englishHint: 'I am a doctor.',
					introducedAtPosition: 1
				},
				{
					id: 'cc_ieyo_03',
					fullSentence: '선생님이에요.',
					sentenceWithBlank: '선생님___.',
					answer: '이에요',
					alternateAnswers: [],
					vocabBaseForm: '이에요/예요',
					englishHint: "It's a teacher.",
					introducedAtPosition: 1
				},
				{
					id: 'cc_ieyo_04',
					fullSentence: '커피예요.',
					sentenceWithBlank: '커피___.',
					answer: '예요',
					alternateAnswers: [],
					vocabBaseForm: '이에요/예요',
					englishHint: "It's coffee.",
					introducedAtPosition: 1
				}
			]
		},

		// 2. gp_ani_eyo (negative copula)
		grammarGapPoints.gp_ani_eyo,

		// 3. gp_eun_neun
		{
			id: 'gp_eun_neun',
			title: '은/는',
			category: 'particle',
			tense: null,
			register: null,
			hint: 'topic marker ("as for…")',
			description:
				'Marks the topic of the sentence — "As for X…". ' +
				'Use 은 after a noun ending in a consonant (받침), 는 after a noun ending in a vowel. ' +
				'Often sets contrast or introduces a known topic.',
			level: 1,
			tags: ['particle', 'beginner', 'TOPIK1'],
			structurePattern: '[Noun]은 / [Noun]는',
			notes: [
				{ type: 'tip', title: 'Consonant vs Vowel', content: 'Use 은 after consonant-ending nouns (이름은) and 는 after vowel-ending nouns (저는).' },
				{ type: 'funfact', title: 'Topic vs Subject', content: 'The topic particle marks "what we\'re talking about." The subject particle 이/가 (Lesson 2) marks "who/what does the action." They overlap but aren\'t the same.' }
			],
			relatedPointIds: ['gp_i_ga'],
			lessonExamples: [
				{
					id: 'le_eun_neun_01',
					fullSentence: '저는 학생이에요.',
					sentenceWithBlank: '저___ 학생이에요.',
					answer: '는',
					englishHint: 'As for me, I am a student.',
					order: 0,
					notes: 'Uses 이에요/예요 (GP1). 저 ends in vowel → 는.'
				},
				{
					id: 'le_eun_neun_02',
					fullSentence: '이름은 민수예요.',
					sentenceWithBlank: '이름___ 민수예요.',
					answer: '은',
					englishHint: "As for the name, it's Minsu.",
					order: 1,
					notes: 'Uses 예요 (GP1). 이름 ends in consonant ㅁ → 은.'
				}
			],
			cards: [
				{
					id: 'cc_eun_neun_01',
					fullSentence: '저는 학생이에요.',
					sentenceWithBlank: '저___ 학생이에요.',
					answer: '는',
					alternateAnswers: [],
					vocabBaseForm: '은/는',
					englishHint: 'I am a student.',
					introducedAtPosition: 3
				},
				{
					id: 'cc_eun_neun_02',
					fullSentence: '이름은 민수예요.',
					sentenceWithBlank: '이름___ 민수예요.',
					answer: '은',
					alternateAnswers: [],
					vocabBaseForm: '은/는',
					englishHint: 'The name is Minsu.',
					introducedAtPosition: 3
				},
				{
					id: 'cc_eun_neun_03',
					fullSentence: '오늘은 월요일이에요.',
					sentenceWithBlank: '오늘___ 월요일이에요.',
					answer: '은',
					alternateAnswers: [],
					vocabBaseForm: '은/는',
					englishHint: 'Today is Monday.',
					introducedAtPosition: 3
				},
				{
					id: 'cc_eun_neun_04',
					fullSentence: "이름은 수진이에요.",
					sentenceWithBlank: "이름___ 수진이에요.",
					answer: "은",
					alternateAnswers: [],
					vocabBaseForm: '은/는',
					englishHint: "The name is Sujin.",
					introducedAtPosition: 3
				}
			]
		},

		// 4. gp_igeos
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
					introducedAtPosition: 4
				},
				{
					id: 'cc_igeos_02',
					fullSentence: '이것은 뭐예요?',
					sentenceWithBlank: '___은 뭐예요?',
					answer: '이것',
					alternateAnswers: [],
					vocabBaseForm: '이것',
					englishHint: 'What is this?',
					introducedAtPosition: 4
				},
				{
					id: 'cc_igeos_03',
					fullSentence: '이것은 사과예요.',
					sentenceWithBlank: '___은 사과예요.',
					answer: '이것',
					alternateAnswers: [],
					vocabBaseForm: '이것',
					englishHint: 'This is an apple.',
					introducedAtPosition: 4
				}
			]
		},

		// 5. gp_geugeos
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
					introducedAtPosition: 5
				},
				{
					id: 'cc_geugeos_02',
					fullSentence: '그것은 뭐예요?',
					sentenceWithBlank: '___은 뭐예요?',
					answer: '그것',
					alternateAnswers: [],
					vocabBaseForm: '그것',
					englishHint: 'What is that?',
					introducedAtPosition: 5
				},
				{
					id: 'cc_geugeos_03',
					fullSentence: '그것은 지갑이에요.',
					sentenceWithBlank: '___은 지갑이에요.',
					answer: '그것',
					alternateAnswers: [],
					vocabBaseForm: '그것',
					englishHint: 'That is a wallet.',
					introducedAtPosition: 5
				}
			]
		},

		// 6. gp_jeogeos
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
					introducedAtPosition: 6
				},
				{
					id: 'cc_jeogeos_02',
					fullSentence: '저것은 뭐예요?',
					sentenceWithBlank: '___은 뭐예요?',
					answer: '저것',
					alternateAnswers: [],
					vocabBaseForm: '저것',
					englishHint: 'What is that over there?',
					introducedAtPosition: 6
				},
				{
					id: 'cc_jeogeos_03',
					fullSentence: '저것은 병원이에요.',
					sentenceWithBlank: '___은 병원이에요.',
					answer: '저것',
					alternateAnswers: [],
					vocabBaseForm: '저것',
					englishHint: 'That over there is a hospital.',
					introducedAtPosition: 6
				}
			]
		}
	]
};
