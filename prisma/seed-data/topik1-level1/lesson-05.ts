import type { LessonSeed } from '../types';

// Lesson 5 — Time, Starting and Finishing
// Grammar points (positions 23–27):
//   23. e_time
//   24. buteo
//   25. kkaji
//   26. jeone
//   27. hue
// Examples and cards use only grammar through their target position.

export const lesson05: LessonSeed = {
	lessonNumber: 5,
	title: "Time, Starting and Finishing",
	grammarPoints: [
		// 23. gp_e_time
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
					fullSentence: '9시에 학교에 가요.',
					sentenceWithBlank: '9시___ 학교에 가요.',
					answer: '에',
					englishHint: "I go to school at 9 o'clock.",
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
					introducedAtPosition: 23
				},
				{
					id: 'cc_e_time_02',
					fullSentence: '아침에 운동해요.',
					sentenceWithBlank: '아침___ 운동해요.',
					answer: '에',
					alternateAnswers: [],
					vocabBaseForm: '에',
					englishHint: 'I exercise in the morning.',
					introducedAtPosition: 23
				},
				{
					id: 'cc_e_time_03',
					fullSentence: '저녁 7시에 밥을 먹어요.',
					sentenceWithBlank: '저녁 7시___ 밥을 먹어요.',
					answer: '에',
					alternateAnswers: [],
					vocabBaseForm: '에',
					englishHint: 'I eat at 7 PM.',
					introducedAtPosition: 23
				}
			]
		},

		// 24. gp_buteo
		{
			id: 'gp_buteo',
			title: '부터',
			category: 'particle',
			tense: null,
			register: null,
			hint: 'from, since (starting point)',
			description:
				'Marks the starting point in time: "from" or "since." ' +
				'Often paired with 까지 (until): 9시부터 6시까지 = "from 9 to 6." ' +
				'Can also be used alone: 내일부터 = "starting from tomorrow."',
			level: 1,
			tags: ['particle', 'beginner', 'TOPIK1'],
			structurePattern: '[Time]부터',
			notes: [
				{ type: 'tip', title: 'Often Paired', content: '부터 often pairs with 까지: 부터~까지 = "from~until."' },
				{ type: 'tip', title: 'Time Only', content: '부터 is mainly used for time. For place "from," use 에서.' }
			],
			lessonExamples: [
				{
					id: 'le_buteo_01',
					fullSentence: '9시부터 일해요.',
					sentenceWithBlank: '9시___ 일해요.',
					answer: '부터',
					englishHint: 'I work from 9.',
					order: 0
				},
				{
					id: 'le_buteo_02',
					fullSentence: "월요일부터 공부해요.",
					sentenceWithBlank: "월요일___ 공부해요.",
					answer: "부터",
					englishHint: "I start studying on Monday.",
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_buteo_01',
					fullSentence: "9시부터 일해요.",
					sentenceWithBlank: "9시___ 일해요.",
					answer: "부터",
					alternateAnswers: [],
					vocabBaseForm: '부터',
					englishHint: "I start work at nine.",
					introducedAtPosition: 24
				},
				{
					id: 'cc_buteo_02',
					fullSentence: "월요일부터 수업이 있어요.",
					sentenceWithBlank: "월요일___ 수업이 있어요.",
					answer: "부터",
					alternateAnswers: [],
					vocabBaseForm: '부터',
					englishHint: "I have classes starting Monday.",
					introducedAtPosition: 24
				},
				{
					id: 'cc_buteo_03',
					fullSentence: "아침부터 공부해요.",
					sentenceWithBlank: "아침___ 공부해요.",
					answer: "부터",
					alternateAnswers: [],
					vocabBaseForm: '부터',
					englishHint: "I start studying in the morning.",
					introducedAtPosition: 24
				}
			]
		},

		// 25. gp_kkaji
		{
			id: 'gp_kkaji',
			title: '까지',
			category: 'particle',
			tense: null,
			register: null,
			hint: 'until, to (ending point)',
			description:
				'Marks the ending point in time or space: "until" or "to." ' +
				'Often paired with 부터: 부터~까지 = "from~until." ' +
				'Can also mark extent: 여기까지 = "up to here."',
			level: 1,
			tags: ['particle', 'beginner', 'TOPIK1'],
			structurePattern: '[Time/Place]까지',
			notes: [
				{ type: 'tip', title: 'Time & Place', content: '까지 works for both time (6시까지 "until 6") and place (서울까지 "to Seoul").' }
			],
			lessonExamples: [
				{
					id: 'le_kkaji_01',
					fullSentence: '6시까지 일해요.',
					sentenceWithBlank: '6시___ 일해요.',
					answer: '까지',
					englishHint: 'I work until 6.',
					order: 0
				},
				{
					id: 'le_kkaji_02',
					fullSentence: '아침부터 저녁까지 공부해요.',
					sentenceWithBlank: '아침부터 저녁___ 공부해요.',
					answer: '까지',
					englishHint: 'I study from morning until evening.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_kkaji_01',
					fullSentence: '9시부터 6시까지 일해요.',
					sentenceWithBlank: '9시부터 6시___ 일해요.',
					answer: '까지',
					alternateAnswers: [],
					vocabBaseForm: '까지',
					englishHint: 'I work from 9 until 6.',
					introducedAtPosition: 25
				},
				{
					id: 'cc_kkaji_02',
					fullSentence: "서울에서 부산까지 가요.",
					sentenceWithBlank: "서울에서 부산___ 가요.",
					answer: "까지",
					alternateAnswers: [],
					vocabBaseForm: '까지',
					englishHint: "I travel from Seoul to Busan.",
					introducedAtPosition: 25
				},
				{
					id: 'cc_kkaji_03',
					fullSentence: '금요일까지 숙제를 해요.',
					sentenceWithBlank: '금요일___ 숙제를 해요.',
					answer: '까지',
					alternateAnswers: [],
					vocabBaseForm: '까지',
					englishHint: 'I do homework by Friday.',
					introducedAtPosition: 25
				}
			]
		},

		// 26. gp_jeone
		{
			id: 'gp_jeone',
			title: '전에',
			category: 'expression',
			tense: null,
			register: null,
			hint: 'before',
			description:
				'Means "before" a time or action. ' +
				'수업 전에 = "before class." ' +
				'The verb pattern -기 전에 is taught separately at Level 2; here, use a noun + 전에.',
			level: 1,
			tags: ['expression', 'beginner', 'TOPIK1'],
			structurePattern: '[Noun] 전에',
			notes: [
				{ type: 'tip', title: 'Two Patterns', content: 'With nouns: 수업 전에 (before class). With verbs: 먹기 전에 (before eating) — uses the -기 nominalizer.' }
			],
			lessonExamples: [
				{
					id: 'le_jeone_01',
					fullSentence: '수업 전에 커피를 마셔요.',
					sentenceWithBlank: '수업 ___ 커피를 마셔요.',
					answer: '전에',
					englishHint: 'I drink coffee before class.',
					order: 0
				},
				{
					id: 'le_jeone_02',
					fullSentence: '12시 전에 점심을 먹어요.',
					sentenceWithBlank: '12시 ___ 점심을 먹어요.',
					answer: '전에',
					englishHint: 'I eat lunch before 12.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_jeone_01',
					fullSentence: '수업 전에 커피를 마셔요.',
					sentenceWithBlank: '수업 ___ 커피를 마셔요.',
					answer: '전에',
					alternateAnswers: [],
					vocabBaseForm: '전에',
					englishHint: 'I drink coffee before class.',
					introducedAtPosition: 26
				},
				{
					id: 'cc_jeone_02',
					fullSentence: "운동 전에 물을 마셔요.",
					sentenceWithBlank: "운동 ___ 물을 마셔요.",
					answer: "전에",
					alternateAnswers: [],
					vocabBaseForm: '전에',
					englishHint: "I drink water before exercising.",
					introducedAtPosition: 26
				},
				{
					id: 'cc_jeone_03',
					fullSentence: '10시 전에 집에 가요.',
					sentenceWithBlank: '10시 ___ 집에 가요.',
					answer: '전에',
					alternateAnswers: [],
					vocabBaseForm: '전에',
					englishHint: 'I go home before 10.',
					introducedAtPosition: 26
				}
			]
		},

		// 27. gp_hue
		{
			id: 'gp_hue',
			title: '후에',
			category: 'expression',
			tense: null,
			register: null,
			hint: 'after',
			description:
				'Means "after" a time or action. ' +
				'수업 후에 = "after class." ' +
				'The verb modifier + 후에 is taught separately at Level 2; here, use a noun + 후에.',
			level: 1,
			tags: ['expression', 'beginner', 'TOPIK1'],
			structurePattern: '[Noun] 후에',
			notes: [
				{ type: 'tip', title: 'Synonym', content: '다음에 is a more casual alternative meaning "after" or "next time."' },
				{ type: 'tip', title: 'Two Patterns', content: 'With nouns: 수업 후에 (after class). With verbs: 먹은 후에 (after eating).' }
			],
			lessonExamples: [
				{
					id: 'le_hue_01',
					fullSentence: '수업 후에 운동해요.',
					sentenceWithBlank: '수업 ___ 운동해요.',
					answer: '후에',
					englishHint: 'I exercise after class.',
					order: 0
				},
				{
					id: 'le_hue_02',
					fullSentence: '점심 후에 커피를 마셔요.',
					sentenceWithBlank: '점심 ___ 커피를 마셔요.',
					answer: '후에',
					englishHint: 'I drink coffee after lunch.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_hue_01',
					fullSentence: '수업 후에 운동해요.',
					sentenceWithBlank: '수업 ___ 운동해요.',
					answer: '후에',
					alternateAnswers: ['다음에'],
					vocabBaseForm: '후에',
					englishHint: 'I exercise after class.',
					introducedAtPosition: 27
				},
				{
					id: 'cc_hue_02',
					fullSentence: "퇴근 후에 친구를 만나요.",
					sentenceWithBlank: "퇴근 ___ 친구를 만나요.",
					answer: "후에",
					alternateAnswers: ['다음에'],
					vocabBaseForm: '후에',
					englishHint: "I meet a friend after work.",
					introducedAtPosition: 27
				},
				{
					id: 'cc_hue_03',
					fullSentence: "저녁 식사 후에 산책해요.",
					sentenceWithBlank: "저녁 식사 ___ 산책해요.",
					answer: "후에",
					alternateAnswers: ['다음에'],
					vocabBaseForm: '후에',
					englishHint: "I take a walk after dinner.",
					introducedAtPosition: 27
				}
			]
		}
	]
};
