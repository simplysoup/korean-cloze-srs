import type { LessonSeed } from '../types';

// ══════════════════════════════════════════════════════════════════════════════
// Lesson 2 — Basic Actions and Sentence Dynamics
//
// Grammar points (positions 9–18):
//   9.  이/가        Subject marker
//  10.  을/를        Object marker
//  11.  -아요/어요   Polite verb ending (present)
//  12.  안           Short negation ("not")
//  13.  하고         And/With
//  14.  여기         Here (near speaker)
//  15.  거기         There (near listener)
//  16.  저기         Over there (far)
//  17.  -네요        Surprise/Realization ending
//  18.  -지요/죠     Confirmation tag ("right?")
//
// N+1 scope: lesson examples for GP N may use grammar from positions 1–N.
// Available from L1: 이에요/예요, 이다, 은/는, 이것/그것/저것, 의, 도
// ══════════════════════════════════════════════════════════════════════════════


export const lesson02: LessonSeed = {
	lessonNumber: 2,
	title: 'Basic Actions and Sentence Dynamics',
	grammarPoints: [
		// ── 9. 이/가 — Subject Marker ───────────────────────────────────────
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
					introducedAtPosition: 9
				},
				{
					id: 'cc_i_ga_02',
					fullSentence: "이것이 물이에요.",
					sentenceWithBlank: "이것___ 물이에요.",
					answer: "이",
					alternateAnswers: [],
					vocabBaseForm: '이/가',
					englishHint: "This is water.",
					introducedAtPosition: 9
				},
				{
					id: 'cc_i_ga_03',
					fullSentence: "저것이 고양이예요.",
					sentenceWithBlank: "저것___ 고양이예요.",
					answer: "이",
					alternateAnswers: [],
					vocabBaseForm: '이/가',
					englishHint: "That over there is a cat.",
					introducedAtPosition: 9
				},
				{
					id: 'cc_i_ga_04',
					fullSentence: "오늘이 월요일이에요.",
					sentenceWithBlank: "오늘___ 월요일이에요.",
					answer: "이",
					alternateAnswers: [],
					vocabBaseForm: '이/가',
					englishHint: "Today is Monday.",
					introducedAtPosition: 9
				}
			]
		},

		// FLAG (N+1): This point precedes the first polite verb-ending point (pos 11).\n		// Its object-particle sentences necessarily use an otherwise unintroduced predicate.\n		// ── 10. 을/를 — Object Marker ───────────────────────────────────────
		{
			id: 'gp_eul_reul',
			title: '을/를',
			category: 'particle',
			tense: null,
			register: null,
			hint: 'object marker',
			description:
				'Marks the direct object of a verb — what the action is done to. ' +
				'Use 을 after a noun ending in a consonant, 를 after a noun ending in a vowel.',
			level: 1,
			tags: ['particle', 'beginner', 'TOPIK1'],
			structurePattern: '[Noun]을 / [Noun]를',
			notes: [
				{ type: 'tip', title: 'Consonant vs Vowel', content: 'Use 을 after consonant-ending nouns (음악을) and 를 after vowel-ending nouns (커피를).' }
			],
			lessonExamples: [
				{
					id: 'le_eul_reul_01',
					fullSentence: '커피를 마셔요.',
					sentenceWithBlank: '커피___ 마셔요.',
					answer: '를',
					englishHint: 'I drink coffee.',
					order: 0,
					notes: '커피 ends in vowel → 를.'
				},
				{
					id: 'le_eul_reul_02',
					fullSentence: '책을 읽어요.',
					sentenceWithBlank: '책___ 읽어요.',
					answer: '을',
					englishHint: 'I read a book.',
					order: 1,
					notes: '책 ends in consonant ㄱ → 을.'
				}
			],
			cards: [
				{
					id: 'cc_eul_reul_01',
					fullSentence: '저는 커피를 마셔요.',
					sentenceWithBlank: '저는 커피___ 마셔요.',
					answer: '를',
					alternateAnswers: [],
					vocabBaseForm: '을/를',
					englishHint: 'I drink coffee.',
					introducedAtPosition: 10
				},
				{
					id: 'cc_eul_reul_02',
					fullSentence: '책을 읽어요.',
					sentenceWithBlank: '책___ 읽어요.',
					answer: '을',
					alternateAnswers: [],
					vocabBaseForm: '을/를',
					englishHint: 'I read a book.',
					introducedAtPosition: 10
				},
				{
					id: 'cc_eul_reul_03',
					fullSentence: '음악을 들어요.',
					sentenceWithBlank: '음악___ 들어요.',
					answer: '을',
					alternateAnswers: [],
					vocabBaseForm: '을/를',
					englishHint: 'I listen to music.',
					introducedAtPosition: 10
				},
				{
					id: 'cc_eul_reul_04',
					fullSentence: '영화를 봐요.',
					sentenceWithBlank: '영화___ 봐요.',
					answer: '를',
					alternateAnswers: [],
					vocabBaseForm: '을/를',
					englishHint: 'I watch a movie.',
					introducedAtPosition: 10
				}
			]
		},

		// ── 11. -아요/어요 — Polite Verb Ending (present) ───────────────────
		{
			id: 'gp_ayo_eoyo',
			title: '-아요/어요',
			category: 'verb-ending',
			tense: 'present',
			register: 'polite informal',
			hint: 'polite present tense verb ending',
			description:
				'The most common verb ending in everyday polite Korean. ' +
				'For regular stems, -아요 follows ㅏ/ㅗ and -어요 usually follows other vowels; contractions and irregular stems need special care. ' +
				'하다 verbs become 해요. Expresses present actions, habits, and general truths.',
			level: 1,
			tags: ['verb-ending', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + 아요/어요',
			notes: [
				{ type: 'tip', title: 'Vowel Harmony', content: 'If the last vowel of the stem is ㅏ or ㅗ → 아요. Otherwise → 어요. 하다 → 해요 (special).' },
				{ type: 'tip', title: 'Examples', content: '가다 → 가요 (go), 먹다 → 먹어요 (eat), 공부하다 → 공부해요 (study).' }
			],
			lessonExamples: [
				{
					id: 'le_ayo_eoyo_01',
					fullSentence: '저는 한국어를 공부해요.',
					sentenceWithBlank: '저는 한국어를 공부___.',
					answer: '해요',
					englishHint: 'I study Korean.',
					order: 0,
					notes: 'Uses 은/는 (GP3), 을/를 (GP10). 공부하다 → 공부해요.'
				},
				{
					id: 'le_ayo_eoyo_02',
					fullSentence: '저는 밥을 먹어요.',
					sentenceWithBlank: '저는 밥을 먹___.',
					answer: '어요',
					englishHint: 'I eat rice.',
					order: 1,
					notes: 'Uses 은/는 (GP3), 을/를 (GP10). 먹다 → 먹어요 (stem 먹 has ㅓ vowel).'
				},
				{
					id: 'le_ayo_eoyo_03',
					fullSentence: "오늘 가요.",
					sentenceWithBlank: "오늘 ___.",
					answer: "가요",
					englishHint: "I am going today.",
					order: 2,
					notes: '가다 → 가요 (stem 가 has ㅏ vowel → 아요 contracts to 가요).'
				}
			],
			cards: [
				{
					id: 'cc_ayo_eoyo_01',
					fullSentence: '저는 한국어를 공부해요.',
					sentenceWithBlank: '저는 한국어를 공부___.',
					answer: '해요',
					alternateAnswers: [],
					vocabBaseForm: '공부하다',
					englishHint: 'I study Korean.',
					introducedAtPosition: 11
				},
				{
					id: 'cc_ayo_eoyo_02',
					fullSentence: '저는 밥을 먹어요.',
					sentenceWithBlank: '저는 밥을 먹___.',
					answer: '어요',
					alternateAnswers: [],
					vocabBaseForm: '먹다',
					englishHint: 'I eat rice.',
					introducedAtPosition: 11
				},
				{
					id: 'cc_ayo_eoyo_03',
					fullSentence: '물을 마셔요.',
					sentenceWithBlank: '물을 마___.',
					answer: '셔요',
					alternateAnswers: ['시어요'],
					vocabBaseForm: '마시다',
					englishHint: 'I drink water.',
					introducedAtPosition: 11
				},
				{
					id: 'cc_ayo_eoyo_04',
					fullSentence: "오늘 가요.",
					sentenceWithBlank: "오늘 ___.",
					answer: "가요",
					alternateAnswers: [],
					vocabBaseForm: '가다',
					englishHint: "I am going today.",
					introducedAtPosition: 11
				},
				{
					id: 'cc_ayo_eoyo_05',
					fullSentence: '텔레비전을 봐요.',
					sentenceWithBlank: '텔레비전을 ___.',
					answer: '봐요',
					alternateAnswers: [],
					vocabBaseForm: '보다',
					englishHint: 'I watch TV.',
					introducedAtPosition: 11
				}
			]
		},

		// ── 12. 안 — Short Negation ─────────────────────────────────────────
		{
			id: 'gp_an',
			title: '안',
			category: 'adverb',
			tense: null,
			register: 'polite informal',
			hint: 'not (short negation)',
			description:
				'Placed directly before a verb to negate it: "안 + verb" means "not verb." ' +
				'The simplest and most common way to negate in spoken Korean. ' +
				'For 하다 verbs, it goes between the noun and 하다: 공부 안 해요.',
			level: 1,
			tags: ['negation', 'beginner', 'TOPIK1'],
			structurePattern: '안 + [Verb]',
			notes: [
				{ type: 'tip', title: '하다 Verbs', content: 'For noun+하다 verbs, 안 goes between: 공부 안 해요 (not: 안 공부해요).' },
				{ type: 'caution', title: '안 vs -지 않다', content: '안 is the short form. The long form -지 않다 is taught later and used in formal/written contexts.' }
			],
			lessonExamples: [
				{
					id: 'le_an_01',
					fullSentence: '저는 커피를 안 마셔요.',
					sentenceWithBlank: '저는 커피를 ___ 마셔요.',
					answer: '안',
					englishHint: "I don't drink coffee.",
					order: 0,
					notes: 'Uses 은/는 (GP3), 을/를 (GP10), -아요/어요 (GP11).'
				},
				{
					id: 'le_an_02',
					fullSentence: '오늘은 공부 안 해요.',
					sentenceWithBlank: '오늘은 공부 ___ 해요.',
					answer: '안',
					englishHint: "I'm not studying today.",
					order: 1,
					notes: 'Uses 은/는 (GP3), -아요/어요 (GP11). 하다 verb split: 공부 안 해요.'
				}
			],
			cards: [
				{
					id: 'cc_an_01',
					fullSentence: '저는 커피를 안 마셔요.',
					sentenceWithBlank: '저는 커피를 ___ 마셔요.',
					answer: '안',
					alternateAnswers: [],
					vocabBaseForm: '안',
					englishHint: "I don't drink coffee.",
					introducedAtPosition: 12
				},
				{
					id: 'cc_an_02',
					fullSentence: '오늘은 공부 안 해요.',
					sentenceWithBlank: '오늘은 공부 ___ 해요.',
					answer: '안',
					alternateAnswers: [],
					vocabBaseForm: '안',
					englishHint: "I'm not studying today.",
					introducedAtPosition: 12
				},
				{
					id: 'cc_an_03',
					fullSentence: '저는 고기를 안 먹어요.',
					sentenceWithBlank: '저는 고기를 ___ 먹어요.',
					answer: '안',
					alternateAnswers: [],
					vocabBaseForm: '안',
					englishHint: "I don't eat meat.",
					introducedAtPosition: 12
				}
			]
		},

		// ── 13. 하고 — And/With ─────────────────────────────────────────────
		{
			id: 'gp_hago',
			title: '하고',
			category: 'particle',
			tense: null,
			register: null,
			hint: 'and, with (connecting nouns)',
			description:
				'Connects two nouns meaning "and" or "with." ' +
				'Used in everyday speech after any noun regardless of ending. ' +
				'친구하고 같이 = "together with a friend", 빵하고 우유 = "bread and milk."',
			level: 1,
			tags: ['particle', 'beginner', 'TOPIK1'],
			structurePattern: '[Noun]하고 [Noun]',
			notes: [
				{ type: 'tip', title: 'Formal Alternatives', content: 'More formal/written: 과 (after consonant) / 와 (after vowel). Casual alternative: (이)랑.' },
				{ type: 'tip', title: 'No Allomorphs', content: '하고 doesn\'t change form — it\'s always 하고 regardless of the preceding syllable.' }
			],
			lessonExamples: [
				{
					id: 'le_hago_01',
					fullSentence: '빵하고 우유를 먹어요.',
					sentenceWithBlank: '빵___ 우유를 먹어요.',
					answer: '하고',
					englishHint: 'I eat bread and milk.',
					order: 0,
					notes: 'Uses 을/를 (GP10), -아요/어요 (GP11).'
				},
				{
					id: 'le_hago_02',
					fullSentence: '친구하고 같이 가요.',
					sentenceWithBlank: '친구___ 같이 가요.',
					answer: '하고',
					englishHint: 'I go with a friend.',
					order: 1,
					notes: 'Uses -아요/어요 (GP11).'
				}
			],
			cards: [
				{
					id: 'cc_hago_01',
					fullSentence: '빵하고 우유를 먹어요.',
					sentenceWithBlank: '빵___ 우유를 먹어요.',
					answer: '하고',
					alternateAnswers: ['과', '이랑'],
					vocabBaseForm: '하고',
					englishHint: 'I eat bread and milk.',
					introducedAtPosition: 13
				},
				{
					id: 'cc_hago_02',
					fullSentence: '친구하고 같이 가요.',
					sentenceWithBlank: '친구___ 같이 가요.',
					answer: '하고',
					alternateAnswers: ['와', '랑'],
					vocabBaseForm: '하고',
					englishHint: 'I go with a friend.',
					introducedAtPosition: 13
				},
				{
					id: 'cc_hago_03',
					fullSentence: "빵하고 케이크를 먹어요.",
					sentenceWithBlank: "빵___ 케이크를 먹어요.",
					answer: "하고",
					alternateAnswers: ['와', '랑'],
					vocabBaseForm: '하고',
					englishHint: "I eat bread and cake.",
					introducedAtPosition: 13
				}
			]
		},

		// ── 14. 여기 — Here ─────────────────────────────────────────────────
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
					introducedAtPosition: 14
				},
				{
					id: 'cc_yeogi_02',
					fullSentence: "여기 앉아요.",
					sentenceWithBlank: "___ 앉아요.",
					answer: "여기",
					alternateAnswers: [],
					vocabBaseForm: '여기',
					englishHint: "I sit here.",
					introducedAtPosition: 14
				},
				{
					id: 'cc_yeogi_03',
					fullSentence: '여기가 좋아요.',
					sentenceWithBlank: '___가 좋아요.',
					answer: '여기',
					alternateAnswers: [],
					vocabBaseForm: '여기',
					englishHint: 'Here is good.',
					introducedAtPosition: 14
				}
			]
		},

		// ── 15. 거기 — There (near listener) ────────────────────────────────
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
					introducedAtPosition: 15
				},
				{
					id: 'cc_geogi_02',
					fullSentence: '거기도 좋아요.',
					sentenceWithBlank: '___도 좋아요.',
					answer: '거기',
					alternateAnswers: [],
					vocabBaseForm: '거기',
					englishHint: "That place is nice too.",
					introducedAtPosition: 15
				},
				{
					id: 'cc_geogi_03',
					fullSentence: '거기는 카페예요.',
					sentenceWithBlank: '___는 카페예요.',
					answer: '거기',
					alternateAnswers: [],
					vocabBaseForm: '거기',
					englishHint: "That place is a café.",
					introducedAtPosition: 15
				}
			]
		},

		// ── 16. 저기 — Over there (far) ─────────────────────────────────────
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
					introducedAtPosition: 16
				},
				{
					id: 'cc_jeogi_02',
					fullSentence: '저기가 학교예요.',
					sentenceWithBlank: '___가 학교예요.',
					answer: '저기',
					alternateAnswers: [],
					vocabBaseForm: '저기',
					englishHint: 'Over there is the school.',
					introducedAtPosition: 16
				},
				{
					id: 'cc_jeogi_03',
					fullSentence: '저기도 식당이에요.',
					sentenceWithBlank: '___도 식당이에요.',
					answer: '저기',
					alternateAnswers: [],
					vocabBaseForm: '저기',
					englishHint: "That place over there is also a restaurant.",
					introducedAtPosition: 16
				}
			]
		},

		// ── 17. -네요 — Surprise/Realization ────────────────────────────────
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
					introducedAtPosition: 17
				},
				{
					id: 'cc_neyo_02',
					fullSentence: '이 음식은 맛있네요.',
					sentenceWithBlank: '이 음식은 맛있___.',
					answer: '네요',
					alternateAnswers: [],
					vocabBaseForm: '맛있다',
					englishHint: 'Oh, this food is delicious!',
					introducedAtPosition: 17
				},
				{
					id: 'cc_neyo_03',
					fullSentence: '한국어를 잘하네요.',
					sentenceWithBlank: '한국어를 잘하___.',
					answer: '네요',
					alternateAnswers: [],
					vocabBaseForm: '잘하다',
					englishHint: "Oh, you're good at Korean!",
					introducedAtPosition: 17
				}
			]
		},

		// ── 18. -지요/죠 — Confirmation Tag ─────────────────────────────────
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
					introducedAtPosition: 18
				},
				{
					id: 'cc_jiyo_02',
					fullSentence: '맛있죠?',
					sentenceWithBlank: '맛있___?',
					answer: '죠',
					alternateAnswers: ['지요'],
					vocabBaseForm: '맛있다',
					englishHint: "It's delicious, right?",
					introducedAtPosition: 18
				},
				{
					id: 'cc_jiyo_03',
					fullSentence: '이 영화는 재미있죠?',
					sentenceWithBlank: '이 영화는 재미있___?',
					answer: '죠',
					alternateAnswers: ['지요'],
					vocabBaseForm: '재미있다',
					englishHint: 'This movie is fun, right?',
					introducedAtPosition: 18
				}
			]
		}
	]
};
