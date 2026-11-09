import type { LessonSeed } from '../types';

// ══════════════════════════════════════════════════════════════════════════════
// Lesson 1 — Identity and Basic Structure
//
// Grammar points (positions 1–8):
//   1. 이에요/예요   To be (polite informal)
//   2. 이다          To be (plain/dictionary)
//   3. 은/는         Topic marker
//   4. 이것          This (near speaker)
//   5. 그것          That (near listener)
//   6. 저것          That over there (far)
//   7. 의            Possessive marker
//   8. 도            Also/Too
//
// N+1 scope: lesson examples for GP N may only use grammar from positions 1–N.
// ══════════════════════════════════════════════════════════════════════════════


export const lesson01: LessonSeed = {
	lessonNumber: 1,
	title: 'Identity and Basic Structure',
	grammarPoints: [
		// ── 1. 이에요/예요 — To be (polite informal, present) ────────────────
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

		// ── 2. 이다 — To be (plain/dictionary form) ─────────────────────────
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
					introducedAtPosition: 2
				},
				{
					id: 'cc_ida_02',
					fullSentence: '선생님이다.',
					sentenceWithBlank: '선생님___.',
					answer: '이다',
					alternateAnswers: [],
					vocabBaseForm: '이다',
					englishHint: 'She is a teacher.',
					introducedAtPosition: 2
				},
				{
					id: 'cc_ida_03',
					fullSentence: '사과이다.',
					sentenceWithBlank: '사과___.',
					answer: '이다',
					alternateAnswers: [],
					vocabBaseForm: '이다',
					englishHint: 'It is an apple.',
					introducedAtPosition: 2
				}
			]
		},

		// ── 3. 은/는 — Topic Marker ─────────────────────────────────────────
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

		// ── 4. 이것 — This (near speaker) ───────────────────────────────────
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

		// ── 5. 그것 — That (near listener) ──────────────────────────────────
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

		// ── 6. 저것 — That over there (far from both) ───────────────────────
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
		},

		// ── 7. 의 — Possessive Marker ───────────────────────────────────────
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

		// ── 8. 도 — Also/Too ────────────────────────────────────────────────
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
		}
	]
};
