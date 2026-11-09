import type { LessonSeed } from '../types';
import { foundationPoints } from './foundations';

// Lesson 7 — Days, Numbers and Hours
// Positions 29–33
// 29. e_time
// 30. eonje
// 31. sino_numbers
// 32. native_numbers
// 33. si_hour
export const lesson07: LessonSeed = {
	lessonNumber: 7,
	title: "Days, Numbers and Hours",
	grammarPoints: [
		// 29. gp_e_time
		{
			id: 'gp_e_time',
			title: '에 (시간)',
			category: 'particle',
			tense: null,
			register: null,
			hint: 'at, on, in (time)',
			description:
				'Marks a point in time: "at, on, in." ' +
				'월요일에 = "on Monday", 3시에 = "at 3 o\'clock", 아침에 = "in the morning." ' +
				'Same particle as location 에, but attached to time nouns.',
			level: 1,
			tags: ['particle', 'beginner', 'TOPIK1'],
			structurePattern: '[Time noun]에',
			notes: [
				{ type: 'caution', title: 'Not with 오늘/내일/어제', content: '오늘, 내일, 어제, 지금 do NOT take 에 — they are already adverbs of time: ✗ 오늘에, ✓ 오늘.' },
				{ type: 'tip', title: 'Shared Particle', content: '에 serves both location and time. Context makes it clear.' }
			],
			lessonExamples: [
				{
					id: 'le_e_time_01',
					fullSentence: '월요일에 한국어를 공부해요.',
					sentenceWithBlank: '월요일___ 한국어를 공부해요.',
					answer: '에',
					englishHint: 'I study Korean on Monday.',
					order: 0
				},
				{
					id: 'le_e_time_02',
					fullSentence: "아침에 학교에 가요.",
					sentenceWithBlank: "아침___ 학교에 가요.",
					answer: "에",
					englishHint: "I go to school in the morning.",
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_e_time_01',
					fullSentence: '월요일에 한국어를 공부해요.',
					sentenceWithBlank: '월요일___ 한국어를 공부해요.',
					answer: '에',
					alternateAnswers: [],
					vocabBaseForm: '에',
					englishHint: 'I study Korean on Monday.',
					introducedAtPosition: 29
				},
				{
					id: 'cc_e_time_02',
					fullSentence: '아침에 운동해요.',
					sentenceWithBlank: '아침___ 운동해요.',
					answer: '에',
					alternateAnswers: [],
					vocabBaseForm: '에',
					englishHint: 'I exercise in the morning.',
					introducedAtPosition: 29
				},
				{
					id: 'cc_e_time_03',
					fullSentence: "저녁에 밥을 먹어요.",
					sentenceWithBlank: "저녁___ 밥을 먹어요.",
					answer: "에",
					alternateAnswers: [],
					vocabBaseForm: '에',
					englishHint: "I eat in the evening.",
					introducedAtPosition: 29
				}
			]
		},

		// 30. gp_eonje
		foundationPoints.gp_eonje,

		// 31. gp_sino_numbers
		foundationPoints.gp_sino_numbers,

		// 32. gp_native_numbers
		foundationPoints.gp_native_numbers,

		// 33. gp_si_hour
		foundationPoints.gp_si_hour
	]
};
