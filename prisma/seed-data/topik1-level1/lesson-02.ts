import type { LessonSeed } from '../types';

// Lesson 2 — People, Possession and Existence
// Grammar points (positions 7–12):
//   7. ui
//   8. do
//   9. ida
//   10. i_ga
//   11. isseoyo
//   12. eopseoyo
// Examples and cards use only grammar through their target position.

export const lesson02: LessonSeed = {
	lessonNumber: 2,
	title: "People, Possession and Existence",
	grammarPoints: [
		// 7. gp_ui
		{
			id: 'gp_ui',
			title: '의',
			category: 'particle',
			tense: null,
			register: null,
			hint: "possessive ('s / of)",
			description:
				"Connects two nouns to show possession, like English \"'s\" or \"of.\" " +
				'저의 책 = "my book", 한국의 음식 = "Korean food." ' +
				'In casual speech, 저의 is often shortened to 제, and 나의 to 내.',
			level: 1,
			tags: ['particle', 'beginner', 'TOPIK1'],
			structurePattern: '[Noun]의 [Noun]',
			notes: [
				{ type: 'tip', title: 'Pronunciation', content: 'Though written 의, it is often pronounced 에 in casual speech.' },
				{ type: 'funfact', title: 'Contractions', content: '저의 → 제 (my, polite), 나의 → 내 (my, casual). These contracted forms are very common.' }
			],
			lessonExamples: [
				{
					id: 'le_ui_01',
					fullSentence: '저의 이름은 민수예요.',
					sentenceWithBlank: '저___ 이름은 민수예요.',
					answer: '의',
					englishHint: 'My name is Minsu.',
					order: 0,
					notes: 'Uses 은/는 (GP3), 예요 (GP1).'
				},
				{
					id: 'le_ui_02',
					fullSentence: '이것은 저의 책이에요.',
					sentenceWithBlank: '이것은 저___ 책이에요.',
					answer: '의',
					englishHint: 'This is my book.',
					order: 1,
					notes: 'Uses 이것 (GP4), 은/는 (GP3), 이에요 (GP1).'
				}
			],
			cards: [
				{
					id: 'cc_ui_01',
					fullSentence: '저의 이름은 수진이에요.',
					sentenceWithBlank: '저___ 이름은 수진이에요.',
					answer: '의',
					alternateAnswers: [],
					vocabBaseForm: '의',
					englishHint: 'My name is Sujin.',
					introducedAtPosition: 7
				},
				{
					id: 'cc_ui_02',
					fullSentence: "이것은 한국의 음식이에요.",
					sentenceWithBlank: "이것은 한국___ 음식이에요.",
					answer: "의",
					alternateAnswers: [],
					vocabBaseForm: '의',
					englishHint: "This is Korean food.",
					introducedAtPosition: 7
				},
				{
					id: 'cc_ui_03',
					fullSentence: '이것은 누구의 가방이에요?',
					sentenceWithBlank: '이것은 누구___ 가방이에요?',
					answer: '의',
					alternateAnswers: [],
					vocabBaseForm: '의',
					englishHint: 'Whose bag is this?',
					introducedAtPosition: 7
				}
			]
		},

		// 8. gp_do
		{
			id: 'gp_do',
			title: '도',
			category: 'particle',
			tense: null,
			register: null,
			hint: 'also, too',
			description:
				'Replaces 은/는 or 이/가 to add the meaning "also" or "too." ' +
				'Attaches directly after the noun: 저도 = "me too." ' +
				'Does not change form — always 도 regardless of the preceding syllable.',
			level: 1,
			tags: ['particle', 'beginner', 'TOPIK1'],
			structurePattern: '[Noun]도',
			notes: [
				{ type: 'tip', title: 'Replaces Other Particles', content: '도 replaces 은/는, 이/가, or 을/를 — don\'t stack them (✗ 저는도, ✓ 저도).' },
				{ type: 'caution', title: 'Position Matters', content: '도 attaches to the noun it modifies: 저도 학생이에요 = "I am also a student" (emphasis on "I"), 학생도 = "a student too."' }
			],
			lessonExamples: [
				{
					id: 'le_do_01',
					fullSentence: '저도 학생이에요.',
					sentenceWithBlank: '저___ 학생이에요.',
					answer: '도',
					englishHint: 'I am also a student.',
					order: 0,
					notes: 'Uses 이에요 (GP1). N+1 OK: only uses GPs 1–8.'
				},
				{
					id: 'le_do_02',
					fullSentence: '이것도 저의 책이에요.',
					sentenceWithBlank: '이것___ 저의 책이에요.',
					answer: '도',
					englishHint: 'This is also my book.',
					order: 1,
					notes: 'Uses 이것 (GP4), 의 (GP7), 이에요 (GP1).'
				}
			],
			cards: [
				{
					id: 'cc_do_01',
					fullSentence: '저도 학생이에요.',
					sentenceWithBlank: '저___ 학생이에요.',
					answer: '도',
					alternateAnswers: [],
					vocabBaseForm: '도',
					englishHint: 'I am also a student.',
					introducedAtPosition: 8
				},
				{
					id: 'cc_do_02',
					fullSentence: "그것도 책이에요.",
					sentenceWithBlank: "그것___ 책이에요.",
					answer: "도",
					alternateAnswers: [],
					vocabBaseForm: '도',
					englishHint: "That is also a book.",
					introducedAtPosition: 8
				},
				{
					id: 'cc_do_03',
					fullSentence: "커피도 음료예요.",
					sentenceWithBlank: "커피___ 음료예요.",
					answer: "도",
					alternateAnswers: [],
					vocabBaseForm: '도',
					englishHint: "Coffee is also a drink.",
					introducedAtPosition: 8
				}
			]
		},

		// 9. gp_ida
		{
			id: 'gp_ida',
			title: '이다',
			category: 'copula',
			tense: 'present',
			register: 'plain',
			hint: 'to be (plain form)',
			description:
				'The dictionary/plain form of the copula "to be." Attaches directly to a noun. ' +
				'Used in writing, dictionary entries, and plain speech. ' +
				'Conjugates to 이에요/예요 (polite informal) and -입니다 (formal).',
			level: 1,
			tags: ['copula', 'beginner', 'TOPIK1'],
			structurePattern: '[Noun]이다',
			notes: [
				{ type: 'tip', title: 'Base Form', content: '이다 is the base form you\'ll find in dictionaries. In conversation, use its conjugated forms (이에요/예요 or 입니다).' },
				{ type: 'caution', title: 'No Space', content: '이다 attaches directly to the noun with no space: 학생이다, not 학생 이다.' }
			],
			relatedPointIds: ['gp_ieyo_yeyo'],
			lessonExamples: [
				{
					id: 'le_ida_01',
					fullSentence: '학생이다.',
					sentenceWithBlank: '학생___.',
					answer: '이다',
					englishHint: 'He is a student.',
					order: 0
				},
				{
					id: 'le_ida_02',
					fullSentence: '한국 사람이다.',
					sentenceWithBlank: '한국 사람___.',
					answer: '이다',
					englishHint: 'They are Korean.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_ida_01',
					fullSentence: '학생이다.',
					sentenceWithBlank: '학생___.',
					answer: '이다',
					alternateAnswers: [],
					vocabBaseForm: '이다',
					englishHint: 'He is a student.',
					introducedAtPosition: 9
				},
				{
					id: 'cc_ida_02',
					fullSentence: '선생님이다.',
					sentenceWithBlank: '선생님___.',
					answer: '이다',
					alternateAnswers: [],
					vocabBaseForm: '이다',
					englishHint: 'She is a teacher.',
					introducedAtPosition: 9
				},
				{
					id: 'cc_ida_03',
					fullSentence: '사과이다.',
					sentenceWithBlank: '사과___.',
					answer: '이다',
					alternateAnswers: [],
					vocabBaseForm: '이다',
					englishHint: 'It is an apple.',
					introducedAtPosition: 9
				}
			]
		},

		// 10. gp_i_ga
		{
			id: 'gp_i_ga',
			title: '이/가',
			category: 'particle',
			tense: null,
			register: null,
			hint: 'subject marker',
			description:
				'Marks the grammatical subject of a sentence. ' +
				'Use 이 after a noun ending in a consonant (받침), 가 after a noun ending in a vowel. ' +
				'Often used for new information or to answer "who/what."',
			level: 1,
			tags: ['particle', 'beginner', 'TOPIK1'],
			structurePattern: '[Noun]이 / [Noun]가',
			notes: [
				{ type: 'tip', title: 'Consonant vs Vowel', content: 'Use 이 after consonant-ending nouns (물이) and 가 after vowel-ending nouns (날씨가).' },
				{ type: 'caution', title: 'Subject vs Topic', content: '이/가 marks new or emphasized information ("Who came?" → 민수가 왔어요). 은/는 marks the general topic ("As for Minsu, he came").' }
			],
			lessonExamples: [
				{
					id: 'le_i_ga_01',
					fullSentence: "이름이 민수예요.",
					sentenceWithBlank: "이름___ 민수예요.",
					answer: "이",
					englishHint: "The name is Minsu.",
					order: 0,
					notes: '날씨 ends in vowel → 가. Uses vocab 좋아요 (good).'
				},
				{
					id: 'le_i_ga_02',
					fullSentence: "그것이 책이에요.",
					sentenceWithBlank: "그것___ 책이에요.",
					answer: "이",
					englishHint: "That is a book.",
					order: 1,
					notes: '물 ends in consonant ㄹ → 이.'
				}
			],
			cards: [
				{
					id: 'cc_i_ga_01',
					fullSentence: "이름이 민수예요.",
					sentenceWithBlank: "이름___ 민수예요.",
					answer: "이",
					alternateAnswers: [],
					vocabBaseForm: '이/가',
					englishHint: "The name is Minsu.",
					introducedAtPosition: 10
				},
				{
					id: 'cc_i_ga_02',
					fullSentence: "이것이 물이에요.",
					sentenceWithBlank: "이것___ 물이에요.",
					answer: "이",
					alternateAnswers: [],
					vocabBaseForm: '이/가',
					englishHint: "This is water.",
					introducedAtPosition: 10
				},
				{
					id: 'cc_i_ga_03',
					fullSentence: "저것이 고양이예요.",
					sentenceWithBlank: "저것___ 고양이예요.",
					answer: "이",
					alternateAnswers: [],
					vocabBaseForm: '이/가',
					englishHint: "That over there is a cat.",
					introducedAtPosition: 10
				},
				{
					id: 'cc_i_ga_04',
					fullSentence: "그 사람이 의사예요.",
					sentenceWithBlank: "그 사람___ 의사예요.",
					answer: "이",
					alternateAnswers: [],
					vocabBaseForm: '이/가',
					englishHint: "That person is a doctor.",
					introducedAtPosition: 10
				}
			]
		},

		// 11. gp_isseoyo
		{
			id: 'gp_isseoyo',
			title: '있다/있어요',
			category: 'verb-ending',
			tense: 'present',
			register: 'polite informal',
			hint: 'to exist, to have',
			description:
				'Means "to exist" or "to have." Plain form: 있다. Polite: 있어요. ' +
				'Used for: (1) existence — 고양이가 있어요 "There is a cat"; ' +
				'(2) possession — 시간이 있어요 "I have time"; ' +
				'(3) location — 집에 있어요 "I am at home."',
			level: 1,
			tags: ['verb-ending', 'beginner', 'TOPIK1'],
			structurePattern: '[Noun]이/가 있어요 · [Place]에 있어요',
			notes: [
				{ type: 'tip', title: 'Three Meanings', content: 'Existence: 의자가 있어요 (there is a chair). Possession: 돈이 있어요 (I have money). Location: 여기에 있어요 (I am here).' },
				{ type: 'caution', title: 'Subject Particle', content: '이/가 introduces what exists: 고양이가 있어요 (there is a cat). 은/는 is possible when making it the topic or contrasting it: 고양이는 있어요 (as for a cat, there is one).' }
			],
			lessonExamples: [
				{
					id: 'le_isseoyo_01',
					fullSentence: '고양이가 있어요.',
					sentenceWithBlank: '고양이가 ___.',
					answer: '있어요',
					englishHint: 'There is a cat.',
					order: 0
				},
				{
					id: 'le_isseoyo_02',
					fullSentence: '저는 시간이 있어요.',
					sentenceWithBlank: '저는 시간이 ___.',
					answer: '있어요',
					englishHint: 'I have time.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_isseoyo_01',
					fullSentence: '고양이가 있어요.',
					sentenceWithBlank: '고양이가 ___.',
					answer: '있어요',
					alternateAnswers: [],
					vocabBaseForm: '있다',
					englishHint: 'There is a cat.',
					introducedAtPosition: 11
				},
				{
					id: 'cc_isseoyo_02',
					fullSentence: '저는 시간이 있어요.',
					sentenceWithBlank: '저는 시간이 ___.',
					answer: '있어요',
					alternateAnswers: [],
					vocabBaseForm: '있다',
					englishHint: 'I have time.',
					introducedAtPosition: 11
				},
				{
					id: 'cc_isseoyo_03',
					fullSentence: "책이 있어요.",
					sentenceWithBlank: "책이 ___.",
					answer: "있어요",
					alternateAnswers: [],
					vocabBaseForm: '있다',
					englishHint: "There is a book.",
					introducedAtPosition: 11
				}
			]
		},

		// 12. gp_eopseoyo
		{
			id: 'gp_eopseoyo',
			title: '없다/없어요',
			category: 'verb-ending',
			tense: 'present',
			register: 'polite informal',
			hint: 'to not exist, to not have',
			description:
				'The negative counterpart of 있다. Means "to not exist" or "to not have." ' +
				'Plain form: 없다. Polite: 없어요. ' +
				'돈이 없어요 "I don\'t have money"; 사람이 없어요 "There is no one."',
			level: 1,
			tags: ['verb-ending', 'beginner', 'TOPIK1'],
			structurePattern: '[Noun]이/가 없어요',
			notes: [
				{ type: 'tip', title: 'Pair with 있다', content: '있다 (have/exist) ↔ 없다 (don\'t have / doesn\'t exist). They are a pair, not verb + negation.' },
				{ type: 'caution', title: 'Not 안 있다', content: 'For absence or lack of possession, use 없어요: 돈이 없어요 (I don’t have money). Learn it as the usual opposite of 있어요 in these examples.' }
			],
			lessonExamples: [
				{
					id: 'le_eopseoyo_01',
					fullSentence: '시간이 없어요.',
					sentenceWithBlank: '시간이 ___.',
					answer: '없어요',
					englishHint: "I don't have time.",
					order: 0
				},
				{
					id: 'le_eopseoyo_02',
					fullSentence: "사람이 없어요.",
					sentenceWithBlank: "사람이 ___.",
					answer: '없어요',
					englishHint: "There is nobody here.",
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_eopseoyo_01',
					fullSentence: '시간이 없어요.',
					sentenceWithBlank: '시간이 ___.',
					answer: '없어요',
					alternateAnswers: [],
					vocabBaseForm: '없다',
					englishHint: "I don't have time.",
					introducedAtPosition: 12
				},
				{
					id: 'cc_eopseoyo_02',
					fullSentence: '돈이 없어요.',
					sentenceWithBlank: '돈이 ___.',
					answer: '없어요',
					alternateAnswers: [],
					vocabBaseForm: '없다',
					englishHint: "I don't have money.",
					introducedAtPosition: 12
				},
				{
					id: 'cc_eopseoyo_03',
					fullSentence: "의자가 없어요.",
					sentenceWithBlank: "의자가 ___.",
					answer: '없어요',
					alternateAnswers: [],
					vocabBaseForm: '없다',
					englishHint: "There is no chair.",
					introducedAtPosition: 12
				}
			]
		}
	]
};
