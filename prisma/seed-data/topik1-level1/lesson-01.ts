import type { LessonSeed } from '../types';
import { foundationPoints } from './foundations';

// Lesson 1 — Introduce Yourself
// Positions 1–4
// 1. ieyo_yeyo
// 2. anida
// 3. eun_neun
// 4. mwo
export const lesson01: LessonSeed = {
	lessonNumber: 1,
	title: "Introduce Yourself",
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
			relatedPointIds: ['gp_ida'],
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

		// 2. gp_anida
		foundationPoints.gp_anida,

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

		// 4. gp_mwo
		foundationPoints.gp_mwo
	]
};
