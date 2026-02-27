import { PrismaClient, Prisma } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash, type Options } from '@node-rs/argon2';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Argon2id options matching src/lib/server/password.ts
const argon2Opts: Options = {
	memoryCost: 65536,
	timeCost: 3,
	parallelism: 4,
	outputLen: 32,
	algorithm: 2
};

// ══════════════════════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════════════════════

interface EnglishHintPart {
	text: string;
	highlightType: 'none' | 'direct' | 'related';
}

interface ClozeCardSeed {
	id: string;
	fullSentence: string;
	sentenceWithBlank: string;
	vocabBaseForm: string;
	answer: string;
	alternateAnswers: string[];
	englishHint: EnglishHintPart[];
}

interface NoteSeed {
	type: 'caution' | 'funfact' | 'tip';
	title: string;
	content: string;
}

interface GrammarPointSeed {
	id: string;
	title: string;
	category: string;
	tense: string | null;
	register: string | null;
	hint: string;
	description: string;
	level: number;
	tags: string[];
	structurePattern: string | null;
	notes: NoteSeed[] | null;
	cards: ClozeCardSeed[];
}

// ══════════════════════════════════════════════════════════════════════════════
// Seed data — 11 Grammar Points (Part 3 Particles) with 3–5 cards each
// ══════════════════════════════════════════════════════════════════════════════

const grammarPoints: GrammarPointSeed[] = [
	// ── 3.1 은/는 — Topic Particle ──────────────────────────────────────────
	{
		id: 'gp_topic',
		title: 'Topic Particle',
		category: 'particle',
		tense: null,
		register: null,
		hint: 'topic particle',
		description:
			'Attaches directly after a noun to mark it as the sentence topic. ' +
			'Use 은 after a noun ending in a consonant (받침), ' +
			'는 after a noun ending in a vowel. ' +
			'Sets contrast or emphasis relative to other things in the sentence.',
		level: 1,
		tags: ['particle', 'beginner', 'TOPIK1'],
		structurePattern: 'Noun + 은/는',
		notes: [
			{ type: 'tip', title: 'Consonant vs Vowel', content: 'Use 은 after consonant-ending nouns (받침) and 는 after vowel-ending nouns.' },
			{ type: 'funfact', title: 'Topic vs Subject', content: 'The topic particle sets contrast or emphasis relative to other things — "As for X..." — while the subject particle 이/가 simply identifies the grammatical subject.' }
		],
		cards: [
			{
				id: 'cc_topic_01',
				fullSentence: '저는 한국어를 공부해요.',
				sentenceWithBlank: '저___ 한국어를 공부해요.',
				answer: '는',
				alternateAnswers: [],
				vocabBaseForm: '은/는',
				englishHint: [
					{ text: 'I', highlightType: 'direct' },
					{ text: ' study Korean.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_topic_02',
				fullSentence: '날씨는 좋아요.',
				sentenceWithBlank: '날씨___ 좋아요.',
				answer: '는',
				alternateAnswers: [],
				vocabBaseForm: '은/는',
				englishHint: [
					{ text: 'The weather', highlightType: 'direct' },
					{ text: ' is nice.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_topic_03',
				fullSentence: '음식은 맛있어요.',
				sentenceWithBlank: '음식___ 맛있어요.',
				answer: '은',
				alternateAnswers: [],
				vocabBaseForm: '은/는',
				englishHint: [
					{ text: 'The food', highlightType: 'direct' },
					{ text: ' is delicious.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_topic_04',
				fullSentence: '오늘은 월요일이에요.',
				sentenceWithBlank: '오늘___ 월요일이에요.',
				answer: '은',
				alternateAnswers: [],
				vocabBaseForm: '은/는',
				englishHint: [
					{ text: 'Today', highlightType: 'direct' },
					{ text: ' is Monday.', highlightType: 'none' }
				]
			}
		]
	},

	// ── 3.2 이/가 — Subject Particle ────────────────────────────────────────
	{
		id: 'gp_subject',
		title: 'Subject Particle',
		category: 'particle',
		tense: null,
		register: null,
		hint: 'subject particle',
		description:
			'Marks the grammatical subject of a sentence. ' +
			'Use 이 after a noun ending in a consonant, ' +
			'가 after a noun ending in a vowel. ' +
			'Often used for new information or emphasis on who/what does the action.',
		level: 1,
		tags: ['particle', 'beginner', 'TOPIK1'],
		structurePattern: 'Noun + 이/가',
		notes: [
			{ type: 'tip', title: 'Consonant vs Vowel', content: 'Use 이 after consonant-ending nouns and 가 after vowel-ending nouns.' },
			{ type: 'caution', title: 'Subject vs Topic', content: '이/가 marks new or emphasized information, while 은/는 marks the general topic of the sentence.' }
		],
		cards: [
			{
				id: 'cc_subject_01',
				fullSentence: '날씨가 좋아요.',
				sentenceWithBlank: '날씨___ 좋아요.',
				answer: '가',
				alternateAnswers: [],
				vocabBaseForm: '이/가',
				englishHint: [
					{ text: 'The weather', highlightType: 'direct' },
					{ text: ' is nice.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_subject_02',
				fullSentence: '물이 차가워요.',
				sentenceWithBlank: '물___ 차가워요.',
				answer: '이',
				alternateAnswers: [],
				vocabBaseForm: '이/가',
				englishHint: [
					{ text: 'The water', highlightType: 'direct' },
					{ text: ' is cold.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_subject_03',
				fullSentence: '고양이가 자요.',
				sentenceWithBlank: '고양이___ 자요.',
				answer: '가',
				alternateAnswers: [],
				vocabBaseForm: '이/가',
				englishHint: [
					{ text: 'The cat', highlightType: 'direct' },
					{ text: ' is sleeping.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_subject_04',
				fullSentence: '시간이 없어요.',
				sentenceWithBlank: '시간___ 없어요.',
				answer: '이',
				alternateAnswers: [],
				vocabBaseForm: '이/가',
				englishHint: [
					{ text: 'There is no ', highlightType: 'none' },
					{ text: 'time', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			}
		]
	},

	// ── 3.3 을/를 — Object Particle ─────────────────────────────────────────
	{
		id: 'gp_object',
		title: 'Object Particle',
		category: 'particle',
		tense: null,
		register: null,
		hint: 'object particle',
		description:
			'Marks the direct object of a verb. ' +
			'Use 을 after a noun ending in a consonant, ' +
			'를 after a noun ending in a vowel. ' +
			'Indicates what the action is being done to.',
		level: 1,
		tags: ['particle', 'beginner', 'TOPIK1'],
		structurePattern: 'Noun + 을/를',
		notes: [
			{ type: 'tip', title: 'Consonant vs Vowel', content: 'Use 을 after consonant-ending nouns and 를 after vowel-ending nouns.' }
		],
		cards: [
			{
				id: 'cc_object_01',
				fullSentence: '저는 커피를 마셔요.',
				sentenceWithBlank: '저는 커피___ 마셔요.',
				answer: '를',
				alternateAnswers: [],
				vocabBaseForm: '을/를',
				englishHint: [
					{ text: 'I drink ', highlightType: 'none' },
					{ text: 'coffee', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_object_02',
				fullSentence: '책을 읽어요.',
				sentenceWithBlank: '책___ 읽어요.',
				answer: '을',
				alternateAnswers: [],
				vocabBaseForm: '을/를',
				englishHint: [
					{ text: 'I read a ', highlightType: 'none' },
					{ text: 'book', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_object_03',
				fullSentence: '음악을 들어요.',
				sentenceWithBlank: '음악___ 들어요.',
				answer: '을',
				alternateAnswers: [],
				vocabBaseForm: '을/를',
				englishHint: [
					{ text: 'I listen to ', highlightType: 'none' },
					{ text: 'music', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_object_04',
				fullSentence: '영화를 봐요.',
				sentenceWithBlank: '영화___ 봐요.',
				answer: '를',
				alternateAnswers: [],
				vocabBaseForm: '을/를',
				englishHint: [
					{ text: 'I watch a ', highlightType: 'none' },
					{ text: 'movie', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			}
		]
	},

	// ── 3.4 에 — Time/Place Particle ────────────────────────────────────────
	{
		id: 'gp_time_place',
		title: 'Time/Place Particle',
		category: 'particle',
		tense: null,
		register: null,
		hint: 'time/place particle',
		description:
			'Indicates a point in time or a location (destination/existence). ' +
			'Used after nouns of time (e.g. 월요일에 "on Monday") or place (e.g. 학교에 "at/to school"). ' +
			'Does not change form based on the preceding syllable.',
		level: 1,
		tags: ['particle', 'beginner', 'TOPIK1'],
		structurePattern: 'Noun + 에',
		notes: [
			{ type: 'tip', title: 'Time & Place', content: '에 marks both time (월요일에 "on Monday") and location/destination (학교에 "at/to school").' },
			{ type: 'caution', title: '에 vs 에서', content: '에 marks destination or existence. 에서 marks where an action takes place.' }
		],
		cards: [
			{
				id: 'cc_time_place_01',
				fullSentence: '학교에 가요.',
				sentenceWithBlank: '학교___ 가요.',
				answer: '에',
				alternateAnswers: [],
				vocabBaseForm: '에',
				englishHint: [
					{ text: 'I go ', highlightType: 'none' },
					{ text: 'to school', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_time_place_02',
				fullSentence: '월요일에 만나요.',
				sentenceWithBlank: '월요일___ 만나요.',
				answer: '에',
				alternateAnswers: [],
				vocabBaseForm: '에',
				englishHint: [
					{ text: 'We meet ', highlightType: 'none' },
					{ text: 'on Monday', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_time_place_03',
				fullSentence: '집에 있어요.',
				sentenceWithBlank: '집___ 있어요.',
				answer: '에',
				alternateAnswers: [],
				vocabBaseForm: '에',
				englishHint: [
					{ text: 'I am ', highlightType: 'none' },
					{ text: 'at home', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			}
		]
	},

	// ── 3.5 에서 — Location Particle (action) ───────────────────────────────
	{
		id: 'gp_place_at',
		title: 'Location Particle (action)',
		category: 'particle',
		tense: null,
		register: null,
		hint: 'place particle (action)',
		description:
			'Marks the location where an action takes place. ' +
			'Used with action verbs (e.g. 도서관에서 공부해요 "I study at the library"). ' +
			'Contrast with 에 which marks destination/existence.',
		level: 1,
		tags: ['particle', 'beginner', 'TOPIK1'],
		structurePattern: 'Noun + 에서',
		notes: [
			{ type: 'caution', title: '에서 vs 에', content: 'Use 에서 for the location of an action (에서 공부해요). Use 에 for destination or static existence (에 가요, 에 있어요).' }
		],
		cards: [
			{
				id: 'cc_place_at_01',
				fullSentence: '도서관에서 공부해요.',
				sentenceWithBlank: '도서관___ 공부해요.',
				answer: '에서',
				alternateAnswers: [],
				vocabBaseForm: '에서',
				englishHint: [
					{ text: 'I study ', highlightType: 'none' },
					{ text: 'at the library', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_place_at_02',
				fullSentence: '카페에서 커피를 마셔요.',
				sentenceWithBlank: '카페___ 커피를 마셔요.',
				answer: '에서',
				alternateAnswers: [],
				vocabBaseForm: '에서',
				englishHint: [
					{ text: 'I drink coffee ', highlightType: 'none' },
					{ text: 'at the café', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_place_at_03',
				fullSentence: '회사에서 일해요.',
				sentenceWithBlank: '회사___ 일해요.',
				answer: '에서',
				alternateAnswers: [],
				vocabBaseForm: '에서',
				englishHint: [
					{ text: 'I work ', highlightType: 'none' },
					{ text: 'at the office', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			}
		]
	},

	// ── 3.6 에서~까지 — From Place to Place ─────────────────────────────────
	{
		id: 'gp_from_to_place',
		title: 'From Place to Place',
		category: 'particle',
		tense: null,
		register: null,
		hint: 'from–to (place)',
		description:
			'에서 marks the starting point and 까지 marks the ending point for places. ' +
			'Used together: 집에서 학교까지 "from home to school". ' +
			'에서 here means "from" (not "at"), 까지 means "to/until".',
		level: 1,
		tags: ['particle', 'beginner', 'TOPIK1'],
		structurePattern: 'Place + 에서 ~ Place + 까지',
		notes: [
			{ type: 'funfact', title: 'Two Meanings of 에서', content: '에서 means "at" (location of action) when used alone, but "from" when paired with 까지.' }
		],
		cards: [
			{
				id: 'cc_from_to_place_01',
				fullSentence: '집에서 학교까지 걸어가요.',
				sentenceWithBlank: '집___ 학교까지 걸어가요.',
				answer: '에서',
				alternateAnswers: [],
				vocabBaseForm: '에서~까지',
				englishHint: [
					{ text: 'I walk ', highlightType: 'none' },
					{ text: 'from home', highlightType: 'direct' },
					{ text: ' to school.', highlightType: 'related' }
				]
			},
			{
				id: 'cc_from_to_place_02',
				fullSentence: '서울에서 부산까지 멀어요.',
				sentenceWithBlank: '서울에서 부산___ 멀어요.',
				answer: '까지',
				alternateAnswers: [],
				vocabBaseForm: '에서~까지',
				englishHint: [
					{ text: 'From Seoul ', highlightType: 'related' },
					{ text: 'to Busan', highlightType: 'direct' },
					{ text: " it's far.", highlightType: 'none' }
				]
			},
			{
				id: 'cc_from_to_place_03',
				fullSentence: '여기에서 역까지 가까워요.',
				sentenceWithBlank: '여기___ 역까지 가까워요.',
				answer: '에서',
				alternateAnswers: [],
				vocabBaseForm: '에서~까지',
				englishHint: [
					{ text: 'From here', highlightType: 'direct' },
					{ text: ' to the station', highlightType: 'related' },
					{ text: " it's close.", highlightType: 'none' }
				]
			}
		]
	},

	// ── 3.7 부터~까지 — From Time to Time ───────────────────────────────────
	{
		id: 'gp_from_to_time',
		title: 'From Time to Time',
		category: 'particle',
		tense: null,
		register: null,
		hint: 'from–to (time)',
		description:
			'부터 marks the starting time and 까지 marks the ending time. ' +
			'Used together: 9시부터 6시까지 "from 9 to 6". ' +
			'부터 means "from/since" (time), 까지 means "to/until".',
		level: 1,
		tags: ['particle', 'beginner', 'TOPIK1'],
		structurePattern: 'Time + 부터 ~ Time + 까지',
		notes: [
			{ type: 'tip', title: 'Time Only', content: '부터 is used exclusively for time ranges (not places). For places, use 에서~까지 instead.' }
		],
		cards: [
			{
				id: 'cc_from_to_time_01',
				fullSentence: '9시부터 6시까지 일해요.',
				sentenceWithBlank: '9시___ 6시까지 일해요.',
				answer: '부터',
				alternateAnswers: [],
				vocabBaseForm: '부터~까지',
				englishHint: [
					{ text: 'I work ', highlightType: 'none' },
					{ text: 'from 9', highlightType: 'direct' },
					{ text: ' to 6.', highlightType: 'related' }
				]
			},
			{
				id: 'cc_from_to_time_02',
				fullSentence: '월요일부터 금요일까지 수업이 있어요.',
				sentenceWithBlank: '월요일___ 금요일까지 수업이 있어요.',
				answer: '부터',
				alternateAnswers: [],
				vocabBaseForm: '부터~까지',
				englishHint: [
					{ text: 'I have class ', highlightType: 'none' },
					{ text: 'from Monday', highlightType: 'direct' },
					{ text: ' to Friday.', highlightType: 'related' }
				]
			},
			{
				id: 'cc_from_to_time_03',
				fullSentence: '아침부터 저녁까지 공부해요.',
				sentenceWithBlank: '아침부터 저녁___ 공부해요.',
				answer: '까지',
				alternateAnswers: [],
				vocabBaseForm: '부터~까지',
				englishHint: [
					{ text: 'I study from morning ', highlightType: 'related' },
					{ text: 'until evening', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			}
		]
	},

	// ── 3.8 도 — Also/Too Particle ──────────────────────────────────────────
	{
		id: 'gp_also',
		title: 'Also/Too Particle',
		category: 'particle',
		tense: null,
		register: null,
		hint: 'also, too',
		description:
			'Replaces 은/는, 이/가, or 을/를 to mean "also" or "too". ' +
			'Attaches directly after the noun: 저도 "me too", 커피도 "coffee too". ' +
			'Does not change form based on the preceding syllable.',
		level: 1,
		tags: ['particle', 'beginner', 'TOPIK1'],
		structurePattern: 'Noun + 도',
		notes: [
			{ type: 'tip', title: 'Replaces Other Particles', content: '도 replaces 은/는, 이/가, or 을/를 — you don\'t stack them (✗ 저는도, ✓ 저도).' }
		],
		cards: [
			{
				id: 'cc_also_01',
				fullSentence: '저도 한국어를 공부해요.',
				sentenceWithBlank: '저___ 한국어를 공부해요.',
				answer: '도',
				alternateAnswers: [],
				vocabBaseForm: '도',
				englishHint: [
					{ text: 'I', highlightType: 'direct' },
					{ text: ' ', highlightType: 'none' },
					{ text: 'also', highlightType: 'direct' },
					{ text: ' study Korean.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_also_02',
				fullSentence: '커피도 좋아해요.',
				sentenceWithBlank: '커피___ 좋아해요.',
				answer: '도',
				alternateAnswers: [],
				vocabBaseForm: '도',
				englishHint: [
					{ text: 'I like ', highlightType: 'none' },
					{ text: 'coffee too', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_also_03',
				fullSentence: '친구도 왔어요.',
				sentenceWithBlank: '친구___ 왔어요.',
				answer: '도',
				alternateAnswers: [],
				vocabBaseForm: '도',
				englishHint: [
					{ text: 'My friend', highlightType: 'direct' },
					{ text: ' came ', highlightType: 'none' },
					{ text: 'too', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			}
		]
	},

	// ── 3.9 만 — Only Particle ──────────────────────────────────────────────
	{
		id: 'gp_only',
		title: 'Only Particle',
		category: 'particle',
		tense: null,
		register: null,
		hint: 'only',
		description:
			'Replaces 은/는, 이/가, or 을/를 to mean "only" or "just". ' +
			'Attaches directly after the noun: 물만 "only water", 하나만 "just one". ' +
			'Does not change form based on the preceding syllable.',
		level: 1,
		tags: ['particle', 'beginner', 'TOPIK1'],
		structurePattern: 'Noun + 만',
		notes: [
			{ type: 'tip', title: 'Replaces Other Particles', content: '만 replaces 은/는, 이/가, or 을/를 — you don\'t stack them (✗ 물을만, ✓ 물만).' },
			{ type: 'funfact', title: 'Emphasis', content: '만 can also emphasize limits: 조금만 "just a little", 한 번만 "just once".' }
		],
		cards: [
			{
				id: 'cc_only_01',
				fullSentence: '물만 마셔요.',
				sentenceWithBlank: '물___ 마셔요.',
				answer: '만',
				alternateAnswers: [],
				vocabBaseForm: '만',
				englishHint: [
					{ text: 'I drink ', highlightType: 'none' },
					{ text: 'only water', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_only_02',
				fullSentence: '하나만 주세요.',
				sentenceWithBlank: '하나___ 주세요.',
				answer: '만',
				alternateAnswers: [],
				vocabBaseForm: '만',
				englishHint: [
					{ text: 'Please give me ', highlightType: 'none' },
					{ text: 'just one', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_only_03',
				fullSentence: '주말에만 쉬어요.',
				sentenceWithBlank: '주말에___ 쉬어요.',
				answer: '만',
				alternateAnswers: [],
				vocabBaseForm: '만',
				englishHint: [
					{ text: 'I rest ', highlightType: 'none' },
					{ text: 'only on weekends', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			}
		]
	},

	// ── 3.10 하고/와/과 — And/With (Nouns) ──────────────────────────────────
	{
		id: 'gp_and_with',
		title: 'And/With (Nouns)',
		category: 'particle',
		tense: null,
		register: null,
		hint: 'and, with',
		description:
			'Connects two nouns meaning "and" or "with". ' +
			'하고 is used in speech (any noun). ' +
			'과 follows a consonant-ending noun, 와 follows a vowel-ending noun (more formal/written). ' +
			'Example: 친구하고 "with a friend", 커피와 차 "coffee and tea".',
		level: 1,
		tags: ['particle', 'beginner', 'TOPIK1'],
		structurePattern: 'Noun + 하고 / 와 / 과',
		notes: [
			{ type: 'tip', title: 'Three Forms', content: '하고 works with any noun in speech. 와 follows vowels, 과 follows consonants — these are more formal/written.' }
		],
		cards: [
			{
				id: 'cc_and_with_01',
				fullSentence: '친구하고 같이 가요.',
				sentenceWithBlank: '친구___ 같이 가요.',
				answer: '하고',
				alternateAnswers: ['와'],
				vocabBaseForm: '하고/와/과',
				englishHint: [
					{ text: 'I go ', highlightType: 'none' },
					{ text: 'with a friend', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_and_with_02',
				fullSentence: '빵과 우유를 먹어요.',
				sentenceWithBlank: '빵___ 우유를 먹어요.',
				answer: '과',
				alternateAnswers: ['하고'],
				vocabBaseForm: '하고/와/과',
				englishHint: [
					{ text: 'I eat ', highlightType: 'none' },
					{ text: 'bread and', highlightType: 'direct' },
					{ text: ' milk.', highlightType: 'related' }
				]
			},
			{
				id: 'cc_and_with_03',
				fullSentence: '커피와 차가 있어요.',
				sentenceWithBlank: '커피___ 차가 있어요.',
				answer: '와',
				alternateAnswers: ['하고'],
				vocabBaseForm: '하고/와/과',
				englishHint: [
					{ text: 'There is ', highlightType: 'none' },
					{ text: 'coffee and', highlightType: 'direct' },
					{ text: ' tea.', highlightType: 'related' }
				]
			}
		]
	},

	// ── 3.11 (이)랑 — And/With (Casual) ─────────────────────────────────────
	{
		id: 'gp_and_casual',
		title: 'And/With (Casual)',
		category: 'particle',
		tense: null,
		register: 'informal',
		hint: 'and, with (casual)',
		description:
			'Casual/spoken form of "and" or "with" connecting nouns. ' +
			'이랑 follows a consonant-ending noun, 랑 follows a vowel-ending noun. ' +
			'More colloquial than 하고/와/과. ' +
			'Example: 친구랑 "with a friend (casual)", 빵이랑 "bread and (casual)".',
		level: 1,
		tags: ['particle', 'beginner', 'TOPIK1'],
		structurePattern: 'Noun + (이)랑',
		notes: [
			{ type: 'tip', title: 'Consonant vs Vowel', content: 'Use 이랑 after consonant-ending nouns and 랑 after vowel-ending nouns.' },
			{ type: 'caution', title: 'Register', content: '(이)랑 is casual/spoken. Use 하고 or 와/과 in formal writing or polite speech.' }
		],
		cards: [
			{
				id: 'cc_and_casual_01',
				fullSentence: '친구랑 영화를 봐요.',
				sentenceWithBlank: '친구___ 영화를 봐요.',
				answer: '랑',
				alternateAnswers: ['이랑'],
				vocabBaseForm: '(이)랑',
				englishHint: [
					{ text: 'I watch a movie ', highlightType: 'none' },
					{ text: 'with a friend', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			},
			{
				id: 'cc_and_casual_02',
				fullSentence: '밥이랑 김치를 먹어요.',
				sentenceWithBlank: '밥___ 김치를 먹어요.',
				answer: '이랑',
				alternateAnswers: ['하고', '과'],
				vocabBaseForm: '(이)랑',
				englishHint: [
					{ text: 'I eat ', highlightType: 'none' },
					{ text: 'rice and', highlightType: 'direct' },
					{ text: ' kimchi.', highlightType: 'related' }
				]
			},
			{
				id: 'cc_and_casual_03',
				fullSentence: '언니랑 쇼핑해요.',
				sentenceWithBlank: '언니___ 쇼핑해요.',
				answer: '랑',
				alternateAnswers: ['이랑'],
				vocabBaseForm: '(이)랑',
				englishHint: [
					{ text: 'I go shopping ', highlightType: 'none' },
					{ text: 'with my sister', highlightType: 'direct' },
					{ text: '.', highlightType: 'none' }
				]
			}
		]
	}
];

// ══════════════════════════════════════════════════════════════════════════════
// Main seed function
// ══════════════════════════════════════════════════════════════════════════════

async function main() {
	// ── 1. Seed test user with BetterAuth account (argon2id-hashed password) ──
	const passwordHash = await hash('testpassword123', argon2Opts);

	await prisma.user.upsert({
		where: { id: 'user_test' },
		update: {},
		create: {
			id: 'user_test',
			email: 'test@example.com',
			name: 'Test User',
			emailVerified: true
		}
	});

	// BetterAuth stores passwords in the Account table with providerId "credential"
	await prisma.account.upsert({
		where: { id: 'account_test' },
		update: {},
		create: {
			id: 'account_test',
			userId: 'user_test',
			accountId: 'user_test',
			providerId: 'credential',
			password: passwordHash
		}
	});
	console.log('✓ Test user + account seeded');

	// ── 2. Seed grammar points and cloze cards ───────────────────────────
	for (const gp of grammarPoints) {
		await prisma.grammarPoint.upsert({
			where: { id: gp.id },
			update: {},
			create: {
				id: gp.id,
				title: gp.title,
				category: gp.category,
				tense: gp.tense,
				register: gp.register,
				hint: gp.hint,
				description: gp.description,
				level: gp.level,
				tags: gp.tags,
				structurePattern: gp.structurePattern,
				notes: gp.notes as unknown as Prisma.InputJsonValue ?? undefined
			}
		});

		for (const card of gp.cards) {
			await prisma.clozeCard.upsert({
				where: { id: card.id },
				update: {},
				create: {
					id: card.id,
					grammarPointId: gp.id,
					fullSentence: card.fullSentence,
					sentenceWithBlank: card.sentenceWithBlank,
					vocabBaseForm: card.vocabBaseForm,
					answer: card.answer,
					alternateAnswers: card.alternateAnswers,
					englishHint: card.englishHint as unknown as Prisma.InputJsonValue
				}
			});
		}
	}
	console.log(`✓ ${grammarPoints.length} grammar points seeded`);

	const totalCards = grammarPoints.reduce((sum, gp) => sum + gp.cards.length, 0);
	console.log(`✓ ${totalCards} cloze cards seeded`);

	// ── 3. Seed 5 ReviewCards for test user (all due now) ────────────────
	const reviewClozeIds = [
		'cc_topic_01',
		'cc_subject_01',
		'cc_object_01',
		'cc_time_place_01',
		'cc_place_at_01'
	];

	for (const clozeCardId of reviewClozeIds) {
		await prisma.reviewCard.upsert({
			where: {
				userId_clozeCardId: {
					userId: 'user_test',
					clozeCardId
				}
			},
			update: {},
			create: {
				userId: 'user_test',
				clozeCardId,
				state: 0, // New
				due: new Date(),
				stability: 0,
				difficulty: 0,
				reps: 0,
				lapses: 0
			}
		});
	}
	console.log(`✓ ${reviewClozeIds.length} review cards seeded for test user`);

	// ── 4. Seed TOPIK Level 1 Grammar deck ───────────────────────────────
	await prisma.deck.upsert({
		where: { id: 'deck_topik1_grammar' },
		update: {},
		create: {
			id: 'deck_topik1_grammar',
			title: 'TOPIK Level 1 Grammar',
			slug: 'topik-1-grammar',
			description:
				'Essential Korean grammar patterns for TOPIK Level 1. Covers basic particles, verb endings, and sentence connectors.',
			level: 1,
			icon: '📘',
			isPublished: true,
			sortOrder: 0
		}
	});
	console.log('✓ TOPIK Level 1 Grammar deck seeded');

	// ── 5. Link grammar points to deck with lesson ordering ──────────────
	const deckGrammarOrder: { grammarPointId: string; sortOrder: number; lessonNumber: number }[] = [
		{ grammarPointId: 'gp_topic', sortOrder: 0, lessonNumber: 1 },
		{ grammarPointId: 'gp_subject', sortOrder: 1, lessonNumber: 1 },
		{ grammarPointId: 'gp_object', sortOrder: 2, lessonNumber: 1 },
		{ grammarPointId: 'gp_time_place', sortOrder: 3, lessonNumber: 2 },
		{ grammarPointId: 'gp_place_at', sortOrder: 4, lessonNumber: 2 },
		{ grammarPointId: 'gp_from_to_place', sortOrder: 5, lessonNumber: 2 },
		{ grammarPointId: 'gp_from_to_time', sortOrder: 6, lessonNumber: 3 },
		{ grammarPointId: 'gp_also', sortOrder: 7, lessonNumber: 3 },
		{ grammarPointId: 'gp_only', sortOrder: 8, lessonNumber: 3 },
		{ grammarPointId: 'gp_and_with', sortOrder: 9, lessonNumber: 4 },
		{ grammarPointId: 'gp_and_casual', sortOrder: 10, lessonNumber: 4 }
	];

	for (const entry of deckGrammarOrder) {
		const dgpId = `dgp_topik1_${entry.sortOrder}`;
		await prisma.deckGrammarPoint.upsert({
			where: { id: dgpId },
			update: {},
			create: {
				id: dgpId,
				deckId: 'deck_topik1_grammar',
				grammarPointId: entry.grammarPointId,
				sortOrder: entry.sortOrder,
				lessonNumber: entry.lessonNumber
			}
		});
	}
	console.log(`✓ ${deckGrammarOrder.length} deck grammar points linked`);

	// ── 6. Enroll test user in deck ──────────────────────────────────────
	await prisma.userDeckProgress.upsert({
		where: {
			userId_deckId: {
				userId: 'user_test',
				deckId: 'deck_topik1_grammar'
			}
		},
		update: {},
		create: {
			userId: 'user_test',
			deckId: 'deck_topik1_grammar',
			lastLearnedIndex: 4 // learned first 5 grammar points (0-4)
		}
	});
	console.log('✓ Test user enrolled in TOPIK Level 1 deck');

	// ── 7. Seed UserStreak for test user ─────────────────────────────────
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	await prisma.userStreak.upsert({
		where: { userId: 'user_test' },
		update: {},
		create: {
			userId: 'user_test',
			currentStreak: 3,
			longestStreak: 5,
			lastStudiedDate: today
		}
	});
	console.log('✓ Test user streak seeded');

	console.log('\n✓ Seed complete');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
