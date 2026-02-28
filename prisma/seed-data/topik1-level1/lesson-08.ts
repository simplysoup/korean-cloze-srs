import type { LessonSeed } from '../types';

// ══════════════════════════════════════════════════════════════════════════════
// Lesson 8 — Obligation and Requests
//
// Grammar points (positions 37–39):
//  37. -아/어야 하다     Must / have to
//  38. -(으)세요         Polite imperative / honorific request
//  39. -아/어 주세요     Please do (for me)
//
// Available: all L1–L7 grammar (pos 1–36).
// ══════════════════════════════════════════════════════════════════════════════

const h = (text: string, highlightType: 'none' | 'direct' | 'related' = 'none') => ({ text, highlightType });

export const lesson08: LessonSeed = {
	lessonNumber: 8,
	title: 'Obligation and Requests',
	grammarPoints: [
		// ── 37. -아/어야 하다 — Must / have to ──────────────────────────────
		{
			id: 'gp_aya_hada',
			title: '-아/어야 하다',
			category: 'expression',
			tense: null,
			register: 'polite informal',
			hint: 'must, have to',
			description:
				'Expresses obligation or necessity. Verb stem + 아야/어야 하다: ' +
				'가다 → 가야 해요 "must go." 먹다 → 먹어야 해요 "must eat." ' +
				'하다 → 해야 해요 "must do." Same vowel harmony as -아요/어요.',
			level: 1,
			tags: ['expression', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + 아야/어야 하다',
			notes: [
				{ type: 'tip', title: 'Vowel Harmony', content: 'Same as -아요/어요: stem ㅏ/ㅗ → 아야 해요; otherwise → 어야 해요. 하다 → 해야 해요.' },
				{ type: 'tip', title: 'Negative', content: '-지 않아도 돼요 means "don\'t have to" (no obligation). Not covered here but useful to know.' }
			],
			lessonExamples: [
				{
					id: 'le_aya_hada_01',
					fullSentence: '내일 학교에 가야 해요.',
					sentenceWithBlank: '내일 학교에 가야 ___.',
					answer: '해요',
					englishHint: [h('I ', 'none'), h('have to', 'direct'), h(' go to school tomorrow.', 'none')],
					order: 0
				},
				{
					id: 'le_aya_hada_02',
					fullSentence: '숙제를 해야 해요.',
					sentenceWithBlank: '숙제를 해야 ___.',
					answer: '해요',
					englishHint: [h('I ', 'none'), h('have to', 'direct'), h(' do homework.', 'none')],
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_aya_hada_01',
					fullSentence: '내일 학교에 가야 해요.',
					sentenceWithBlank: '내일 학교에 ___ 해요.',
					answer: '가야',
					alternateAnswers: [],
					vocabBaseForm: '가다',
					englishHint: [h('I ', 'none'), h('have to go', 'direct'), h(' to school tomorrow.', 'none')],
					introducedAtPosition: 37
				},
				{
					id: 'cc_aya_hada_02',
					fullSentence: '약을 먹어야 해요.',
					sentenceWithBlank: '약을 ___ 해요.',
					answer: '먹어야',
					alternateAnswers: [],
					vocabBaseForm: '먹다',
					englishHint: [h('I ', 'none'), h('have to take', 'direct'), h(' medicine.', 'none')],
					introducedAtPosition: 37
				},
				{
					id: 'cc_aya_hada_03',
					fullSentence: '지금 공부해야 해요.',
					sentenceWithBlank: '지금 ___ 해요.',
					answer: '공부해야',
					alternateAnswers: [],
					vocabBaseForm: '공부하다',
					englishHint: [h('I ', 'none'), h('have to study', 'direct'), h(' now.', 'none')],
					introducedAtPosition: 37
				}
			]
		},

		// ── 38. -(으)세요 — Polite imperative / honorific ───────────────────
		{
			id: 'gp_euseyo',
			title: '-(으)세요',
			category: 'verb-ending',
			tense: null,
			register: 'polite',
			hint: 'please (do) / polite imperative',
			description:
				'Polite imperative form used for requests and instructions. ' +
				'After consonant stem → -으세요: 읽다 → 읽으세요. After vowel stem → -세요: 가다 → 가세요. ' +
				'Also used as honorific present: 어머니가 가세요 "Mother goes/is going."',
			level: 1,
			tags: ['verb-ending', 'honorific', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + (으)세요',
			notes: [
				{ type: 'tip', title: 'Dual Use', content: '-(으)세요 is both a polite imperative ("please do") and an honorific form. Context determines meaning.' },
				{ type: 'tip', title: 'Irregular', content: 'ㄹ-ending stems drop ㄹ: 만들다 → 만드세요. 듣다 → 들으세요 (ㄷ-irregular).' }
			],
			lessonExamples: [
				{
					id: 'le_euseyo_01',
					fullSentence: '여기에 앉으세요.',
					sentenceWithBlank: '여기에 ___.',
					answer: '앉으세요',
					englishHint: [h('Please ', 'direct'), h('sit', 'direct'), h(' here.', 'none')],
					order: 0
				},
				{
					id: 'le_euseyo_02',
					fullSentence: '이것을 보세요.',
					sentenceWithBlank: '이것을 ___.',
					answer: '보세요',
					englishHint: [h('Please ', 'direct'), h('look at', 'direct'), h(' this.', 'none')],
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_euseyo_01',
					fullSentence: '여기에 앉으세요.',
					sentenceWithBlank: '여기에 ___.',
					answer: '앉으세요',
					alternateAnswers: [],
					vocabBaseForm: '앉다',
					englishHint: [h('Please ', 'direct'), h('sit', 'direct'), h(' here.', 'none')],
					introducedAtPosition: 38
				},
				{
					id: 'cc_euseyo_02',
					fullSentence: '천천히 가세요.',
					sentenceWithBlank: '천천히 ___.',
					answer: '가세요',
					alternateAnswers: [],
					vocabBaseForm: '가다',
					englishHint: [h('Please ', 'direct'), h('go', 'direct'), h(' slowly.', 'none')],
					introducedAtPosition: 38
				},
				{
					id: 'cc_euseyo_03',
					fullSentence: '이 책을 읽으세요.',
					sentenceWithBlank: '이 책을 ___.',
					answer: '읽으세요',
					alternateAnswers: [],
					vocabBaseForm: '읽다',
					englishHint: [h('Please ', 'direct'), h('read', 'direct'), h(' this book.', 'none')],
					introducedAtPosition: 38
				}
			]
		},

		// ── 39. -아/어 주세요 — Please do (for me) ─────────────────────────
		{
			id: 'gp_a_juseyo',
			title: '-아/어 주세요',
			category: 'expression',
			tense: null,
			register: 'polite',
			hint: 'please do (for me)',
			description:
				'Polite request asking someone to do something as a favor. ' +
				'Verb stem + 아/어 주세요: 가르치다 → 가르쳐 주세요 "please teach me." ' +
				'Same vowel harmony as -아요/어요. More specifically requesting action for the speaker\'s benefit.',
			level: 1,
			tags: ['expression', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + 아/어 주세요',
			notes: [
				{ type: 'tip', title: '-(으)세요 vs -아/어 주세요', content: '-(으)세요 is a general polite command. -아/어 주세요 specifically asks "please do this for me" — implies a favor.' },
				{ type: 'tip', title: 'Common Phrases', content: '도와주세요 (please help), 알려 주세요 (please let me know), 기다려 주세요 (please wait).' }
			],
			relatedPointIds: ['gp_euseyo'],
			lessonExamples: [
				{
					id: 'le_a_juseyo_01',
					fullSentence: '사진을 찍어 주세요.',
					sentenceWithBlank: '사진을 찍어 ___.',
					answer: '주세요',
					englishHint: [h('Please ', 'direct'), h('take', 'none'), h(' a photo (for me).', 'none')],
					order: 0
				},
				{
					id: 'le_a_juseyo_02',
					fullSentence: '천천히 말해 주세요.',
					sentenceWithBlank: '천천히 말해 ___.',
					answer: '주세요',
					englishHint: [h('Please ', 'direct'), h('speak slowly (for me).', 'none')],
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_a_juseyo_01',
					fullSentence: '사진을 찍어 주세요.',
					sentenceWithBlank: '사진을 찍어 ___.',
					answer: '주세요',
					alternateAnswers: [],
					vocabBaseForm: '-아/어 주세요',
					englishHint: [h('Please ', 'direct'), h('take a photo (for me).', 'none')],
					introducedAtPosition: 39
				},
				{
					id: 'cc_a_juseyo_02',
					fullSentence: '문을 열어 주세요.',
					sentenceWithBlank: '문을 열어 ___.',
					answer: '주세요',
					alternateAnswers: [],
					vocabBaseForm: '-아/어 주세요',
					englishHint: [h('Please ', 'direct'), h('open the door (for me).', 'none')],
					introducedAtPosition: 39
				},
				{
					id: 'cc_a_juseyo_03',
					fullSentence: '한국어로 말해 주세요.',
					sentenceWithBlank: '한국어로 말해 ___.',
					answer: '주세요',
					alternateAnswers: [],
					vocabBaseForm: '-아/어 주세요',
					englishHint: [h('Please ', 'direct'), h('speak in Korean (for me).', 'none')],
					introducedAtPosition: 39
				}
			]
		}
	]
};
