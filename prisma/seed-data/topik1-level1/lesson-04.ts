import type { LessonSeed } from '../types';

// Lesson 4 — Places, Movement and Position
// Grammar points (positions 18–23):
//   18. yeogi
//   19. geogi
//   20. jeogi
//   21. e_loc
//   22. eseo
//   23. position
// Examples and cards use only grammar through their target position.

export const lesson04: LessonSeed = {
	lessonNumber: 4,
	title: "Places, Movement and Position",
	grammarPoints: [
		// 18. gp_yeogi
		{
			id: 'gp_yeogi',
			title: '여기',
			category: 'demonstrative',
			tense: null,
			register: null,
			hint: 'here (near speaker)',
			description:
				'Means "here" — a place near the speaker. ' +
				'Part of a three-way system: 여기 (here, near me), 거기 (there, near you), 저기 (over there). ' +
				'Can take particles: 여기에 (at here), 여기는 (as for here).',
			level: 1,
			tags: ['demonstrative', 'beginner', 'TOPIK1'],
			structurePattern: '여기 + particle',
			notes: [
				{ type: 'funfact', title: 'Three-Way Places', content: '여기/거기/저기 follow the same 이/그/저 pattern as 이것/그것/저것.' }
			],
			lessonExamples: [
				{
					id: 'le_yeogi_01',
					fullSentence: '여기는 학교예요.',
					sentenceWithBlank: '___는 학교예요.',
					answer: '여기',
					englishHint: 'Here is a school.',
					order: 0,
					notes: 'Uses 은/는 (GP3), 예요 (GP1).'
				},
				{
					id: 'le_yeogi_02',
					fullSentence: "여기 앉아요.",
					sentenceWithBlank: "___ 앉아요.",
					answer: "여기",
					englishHint: "I sit here.",
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_yeogi_01',
					fullSentence: '여기는 학교예요.',
					sentenceWithBlank: '___는 학교예요.',
					answer: '여기',
					alternateAnswers: [],
					vocabBaseForm: '여기',
					englishHint: 'Here is a school.',
					introducedAtPosition: 18
				},
				{
					id: 'cc_yeogi_02',
					fullSentence: "여기 앉아요.",
					sentenceWithBlank: "___ 앉아요.",
					answer: "여기",
					alternateAnswers: [],
					vocabBaseForm: '여기',
					englishHint: "I sit here.",
					introducedAtPosition: 18
				},
				{
					id: 'cc_yeogi_03',
					fullSentence: '여기가 좋아요.',
					sentenceWithBlank: '___가 좋아요.',
					answer: '여기',
					alternateAnswers: [],
					vocabBaseForm: '여기',
					englishHint: 'Here is good.',
					introducedAtPosition: 18
				}
			]
		},

		// 19. gp_geogi
		{
			id: 'gp_geogi',
			title: '거기',
			category: 'demonstrative',
			tense: null,
			register: null,
			hint: 'there (near listener)',
			description:
				'Means "there" — a place near the listener or a previously mentioned place. ' +
				'Part of the 여기/거기/저기 system.',
			level: 1,
			tags: ['demonstrative', 'beginner', 'TOPIK1'],
			structurePattern: '거기 + particle',
			notes: [
				{ type: 'tip', title: 'Reference', content: '거기 can also refer to a place already mentioned in the conversation, similar to English "there" or "that place."' }
			],
			lessonExamples: [
				{
					id: 'le_geogi_01',
					fullSentence: "거기는 학교예요?",
					sentenceWithBlank: "___는 학교예요?",
					answer: "거기",
					englishHint: "Is that place a school?",
					order: 0
				},
				{
					id: 'le_geogi_02',
					fullSentence: '거기도 좋아요.',
					sentenceWithBlank: '___도 좋아요.',
					answer: '거기',
					englishHint: "That place is nice too.",
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_geogi_01',
					fullSentence: "거기는 학교예요?",
					sentenceWithBlank: "___는 학교예요?",
					answer: "거기",
					alternateAnswers: [],
					vocabBaseForm: '거기',
					englishHint: "Is that place a school?",
					introducedAtPosition: 19
				},
				{
					id: 'cc_geogi_02',
					fullSentence: '거기도 좋아요.',
					sentenceWithBlank: '___도 좋아요.',
					answer: '거기',
					alternateAnswers: [],
					vocabBaseForm: '거기',
					englishHint: "That place is nice too.",
					introducedAtPosition: 19
				},
				{
					id: 'cc_geogi_03',
					fullSentence: '거기는 카페예요.',
					sentenceWithBlank: '___는 카페예요.',
					answer: '거기',
					alternateAnswers: [],
					vocabBaseForm: '거기',
					englishHint: "That place is a café.",
					introducedAtPosition: 19
				}
			]
		},

		// 20. gp_jeogi
		{
			id: 'gp_jeogi',
			title: '저기',
			category: 'demonstrative',
			tense: null,
			register: null,
			hint: 'over there (far from both)',
			description:
				'Means "over there" — a place far from both the speaker and listener. ' +
				'Also used to get someone\'s attention: 저기요! = "Excuse me!"',
			level: 1,
			tags: ['demonstrative', 'beginner', 'TOPIK1'],
			structurePattern: '저기 + particle',
			notes: [
				{ type: 'funfact', title: 'Attention Getter', content: '저기요! is a common way to get a stranger\'s attention, like "Excuse me!" at a restaurant.' }
			],
			lessonExamples: [
				{
					id: 'le_jeogi_01',
					fullSentence: '저기는 공원이에요.',
					sentenceWithBlank: '___는 공원이에요.',
					answer: '저기',
					englishHint: 'Over there is a park.',
					order: 0
				},
				{
					id: 'le_jeogi_02',
					fullSentence: '저기가 학교예요.',
					sentenceWithBlank: '___가 학교예요.',
					answer: '저기',
					englishHint: 'Over there is the school.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_jeogi_01',
					fullSentence: '저기는 공원이에요.',
					sentenceWithBlank: '___는 공원이에요.',
					answer: '저기',
					alternateAnswers: [],
					vocabBaseForm: '저기',
					englishHint: 'Over there is a park.',
					introducedAtPosition: 20
				},
				{
					id: 'cc_jeogi_02',
					fullSentence: '저기가 학교예요.',
					sentenceWithBlank: '___가 학교예요.',
					answer: '저기',
					alternateAnswers: [],
					vocabBaseForm: '저기',
					englishHint: 'Over there is the school.',
					introducedAtPosition: 20
				},
				{
					id: 'cc_jeogi_03',
					fullSentence: '저기도 식당이에요.',
					sentenceWithBlank: '___도 식당이에요.',
					answer: '저기',
					alternateAnswers: [],
					vocabBaseForm: '저기',
					englishHint: "That place over there is also a restaurant.",
					introducedAtPosition: 20
				}
			]
		},

		// 21. gp_e_loc
		{
			id: 'gp_e_loc',
			title: '에 (장소)',
			category: 'particle',
			tense: null,
			register: null,
			hint: 'at, to (location/destination)',
			description:
				'Marks a location or destination. Used with: ' +
				'(1) existence verbs (있다/없다): 집에 있어요 "I\'m at home"; ' +
				'(2) movement verbs (가다/오다): 학교에 가요 "I go to school." ' +
				'Does not change form.',
			level: 1,
			tags: ['particle', 'beginner', 'TOPIK1'],
			structurePattern: '[Place]에',
			notes: [
				{ type: 'caution', title: '에 vs 에서', content: '에 marks destination or static location (with 있다). 에서 marks where an action happens (with action verbs like 공부하다).' },
				{ type: 'tip', title: 'Two Uses', content: 'Destination: 학교에 가요 (go to school). Static location: 집에 있어요 (am at home).' }
			],
			relatedPointIds: ['gp_eseo'],
			lessonExamples: [
				{
					id: 'le_e_loc_01',
					fullSentence: '학교에 가요.',
					sentenceWithBlank: '학교___ 가요.',
					answer: '에',
					englishHint: 'I go to school.',
					order: 0
				},
				{
					id: 'le_e_loc_02',
					fullSentence: "집에 와요.",
					sentenceWithBlank: "집___ 와요.",
					answer: "에",
					englishHint: "I come home.",
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_e_loc_01',
					fullSentence: '학교에 가요.',
					sentenceWithBlank: '학교___ 가요.',
					answer: '에',
					alternateAnswers: ['로'],
					vocabBaseForm: '에',
					englishHint: 'I go to school.',
					introducedAtPosition: 21
				},
				{
					id: 'cc_e_loc_02',
					fullSentence: "집에 와요.",
					sentenceWithBlank: "집___ 와요.",
					answer: "에",
					alternateAnswers: [],
					vocabBaseForm: '에',
					englishHint: "I come home.",
					introducedAtPosition: 21
				},
				{
					id: 'cc_e_loc_03',
					fullSentence: '회사에 가요.',
					sentenceWithBlank: '회사___ 가요.',
					answer: '에',
					alternateAnswers: ['로'],
					vocabBaseForm: '에',
					englishHint: 'I go to work.',
					introducedAtPosition: 21
				}
			]
		},

		// 22. gp_eseo
		{
			id: 'gp_eseo',
			title: '에서',
			category: 'particle',
			tense: null,
			register: null,
			hint: 'at (location of action)',
			description:
				'Marks the location where an action takes place. ' +
				'Used with action verbs: 도서관에서 공부해요 "I study at the library." ' +
				'Contrast with 에, which marks destination or static location.',
			level: 1,
			tags: ['particle', 'beginner', 'TOPIK1'],
			structurePattern: '[Place]에서 + action verb',
			notes: [
				{ type: 'caution', title: '에서 vs 에', content: 'Use 에서 for the location of an action (에서 공부해요 = study at). Use 에 for destination or static existence (에 가요 = go to, 에 있어요 = am at).' }
			],
			relatedPointIds: ['gp_e_loc'],
			lessonExamples: [
				{
					id: 'le_eseo_01',
					fullSentence: '도서관에서 공부해요.',
					sentenceWithBlank: '도서관___ 공부해요.',
					answer: '에서',
					englishHint: 'I study at the library.',
					order: 0
				},
				{
					id: 'le_eseo_02',
					fullSentence: '카페에서 커피를 마셔요.',
					sentenceWithBlank: '카페___ 커피를 마셔요.',
					answer: '에서',
					englishHint: 'I drink coffee at the café.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_eseo_01',
					fullSentence: '도서관에서 공부해요.',
					sentenceWithBlank: '도서관___ 공부해요.',
					answer: '에서',
					alternateAnswers: [],
					vocabBaseForm: '에서',
					englishHint: 'I study at the library.',
					introducedAtPosition: 22
				},
				{
					id: 'cc_eseo_02',
					fullSentence: '카페에서 커피를 마셔요.',
					sentenceWithBlank: '카페___ 커피를 마셔요.',
					answer: '에서',
					alternateAnswers: [],
					vocabBaseForm: '에서',
					englishHint: 'I drink coffee at the café.',
					introducedAtPosition: 22
				},
				{
					id: 'cc_eseo_03',
					fullSentence: '회사에서 일해요.',
					sentenceWithBlank: '회사___ 일해요.',
					answer: '에서',
					alternateAnswers: [],
					vocabBaseForm: '에서',
					englishHint: 'I work at the office.',
					introducedAtPosition: 22
				}
			]
		},

		// 23. gp_position
		{
			id: 'gp_position',
			title: '위/아래/앞/뒤/옆',
			category: 'expression',
			tense: null,
			register: null,
			hint: 'above, below, front, behind, beside',
			description:
				'Position nouns that combine with 에 to describe spatial relationships. ' +
				'Pattern: [Reference Noun] + 위/아래/앞/뒤/옆 + 에. ' +
				'책상 위에 = "on the desk", 의자 아래에 = "under the chair."',
			level: 1,
			tags: ['expression', 'beginner', 'TOPIK1'],
			structurePattern: '[Noun] 위/아래/앞/뒤/옆 + 에',
			notes: [
				{ type: 'tip', title: 'Five Position Words', content: '위 (above/on), 아래 (below/under), 앞 (in front), 뒤 (behind), 옆 (beside/next to).' },
				{ type: 'tip', title: 'Word Order', content: 'Reference noun comes first, then the position: 책상 위에 = "desk above-at" = on the desk.' }
			],
			lessonExamples: [
				{
					id: 'le_position_01',
					fullSentence: '책이 책상 위에 있어요.',
					sentenceWithBlank: '책이 책상 ___에 있어요.',
					answer: '위',
					englishHint: 'The book is on the desk.',
					order: 0
				},
				{
					id: 'le_position_02',
					fullSentence: '고양이가 의자 아래에 있어요.',
					sentenceWithBlank: '고양이가 의자 ___에 있어요.',
					answer: '아래',
					englishHint: 'The cat is under the chair.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_position_01',
					fullSentence: '책이 책상 위에 있어요.',
					sentenceWithBlank: '책이 책상 ___에 있어요.',
					answer: '위',
					alternateAnswers: [],
					vocabBaseForm: '위/아래/앞/뒤/옆',
					englishHint: 'The book is on the desk.',
					introducedAtPosition: 23
				},
				{
					id: 'cc_position_02',
					fullSentence: '고양이가 의자 아래에 있어요.',
					sentenceWithBlank: '고양이가 의자 ___에 있어요.',
					answer: '아래',
					alternateAnswers: ['밑'],
					vocabBaseForm: '위/아래/앞/뒤/옆',
					englishHint: 'The cat is under the chair.',
					introducedAtPosition: 23
				},
				{
					id: 'cc_position_03',
					fullSentence: '학교 앞에 가게가 있어요.',
					sentenceWithBlank: '학교 ___에 가게가 있어요.',
					answer: '앞',
					alternateAnswers: [],
					vocabBaseForm: '위/아래/앞/뒤/옆',
					englishHint: 'There is a store in front of the school.',
					introducedAtPosition: 23
				},
				{
					id: 'cc_position_04',
					fullSentence: '은행 옆에 카페가 있어요.',
					sentenceWithBlank: '은행 ___에 카페가 있어요.',
					answer: '옆',
					alternateAnswers: [],
					vocabBaseForm: '위/아래/앞/뒤/옆',
					englishHint: 'There is a café next to the bank.',
					introducedAtPosition: 23
				}
			]
		}
	]
};
