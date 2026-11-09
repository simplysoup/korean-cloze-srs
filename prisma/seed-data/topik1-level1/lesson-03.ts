import type { LessonSeed } from '../types';

// ══════════════════════════════════════════════════════════════════════════════
// Lesson 3 — Location and Existence
//
// Grammar points (positions 19–23):
//  19. 에 (location)     Location/destination particle
//  20. 있다/있어요       To exist / to have
//  21. 없다/없어요       To not exist / to not have
//  22. 에서              Location of action particle
//  23. 위/아래/앞/뒤/옆  Position words + 에
//
// N+1 scope: all L1 (1–8) + L2 (9–18) grammar available.
// ══════════════════════════════════════════════════════════════════════════════

const h = (text: string, highlightType: 'none' | 'direct' | 'related' = 'none') => ({ text, highlightType });

export const lesson03: LessonSeed = {
	lessonNumber: 3,
	title: 'Location and Existence',
	grammarPoints: [
		// ── 19. 에 (location) — At/To particle ──────────────────────────────
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
			lessonExamples: [
				{
					id: 'le_e_loc_01',
					fullSentence: '학교에 가요.',
					sentenceWithBlank: '학교___ 가요.',
					answer: '에',
					englishHint: [h('I go ', 'none'), h('to', 'direct'), h(' school.', 'none')],
					order: 0
				},
				{
					id: 'le_e_loc_02',
					fullSentence: '집에 있어요.',
					sentenceWithBlank: '집___ 있어요.',
					answer: '에',
					englishHint: [h('I am ', 'none'), h('at', 'direct'), h(' home.', 'none')],
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
					englishHint: [h('I go ', 'none'), h('to', 'direct'), h(' school.', 'none')],
					introducedAtPosition: 19
				},
				{
					id: 'cc_e_loc_02',
					fullSentence: '집에 있어요.',
					sentenceWithBlank: '집___ 있어요.',
					answer: '에',
					alternateAnswers: [],
					vocabBaseForm: '에',
					englishHint: [h('I am ', 'none'), h('at', 'direct'), h(' home.', 'none')],
					introducedAtPosition: 19
				},
				{
					id: 'cc_e_loc_03',
					fullSentence: '회사에 가요.',
					sentenceWithBlank: '회사___ 가요.',
					answer: '에',
					alternateAnswers: ['로'],
					vocabBaseForm: '에',
					englishHint: [h('I go ', 'none'), h('to', 'direct'), h(' work.', 'none')],
					introducedAtPosition: 19
				}
			]
		},

		// ── 20. 있다/있어요 — To exist / to have ────────────────────────────
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
					englishHint: [h('There is a ', 'none'), h('cat', 'direct'), h('.', 'none')],
					order: 0
				},
				{
					id: 'le_isseoyo_02',
					fullSentence: '저는 시간이 있어요.',
					sentenceWithBlank: '저는 시간이 ___.',
					answer: '있어요',
					englishHint: [h('I ', 'none'), h('have', 'direct'), h(' time.', 'none')],
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
					englishHint: [h('There ', 'none'), h('is', 'direct'), h(' a cat.', 'none')],
					introducedAtPosition: 20
				},
				{
					id: 'cc_isseoyo_02',
					fullSentence: '저는 시간이 있어요.',
					sentenceWithBlank: '저는 시간이 ___.',
					answer: '있어요',
					alternateAnswers: [],
					vocabBaseForm: '있다',
					englishHint: [h('I ', 'none'), h('have', 'direct'), h(' time.', 'none')],
					introducedAtPosition: 20
				},
				{
					id: 'cc_isseoyo_03',
					fullSentence: '책이 책상 위에 있어요.',
					sentenceWithBlank: '책이 책상 위에 ___.',
					answer: '있어요',
					alternateAnswers: [],
					vocabBaseForm: '있다',
					englishHint: [h('The book ', 'none'), h('is', 'direct'), h(' on the desk.', 'none')],
					introducedAtPosition: 20
				}
			]
		},

		// ── 21. 없다/없어요 — To not exist / to not have ────────────────────
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
					englishHint: [h('I ', 'none'), h("don't have", 'direct'), h(' time.', 'none')],
					order: 0
				},
				{
					id: 'le_eopseoyo_02',
					fullSentence: '여기에 사람이 없어요.',
					sentenceWithBlank: '여기에 사람이 ___.',
					answer: '없어요',
					englishHint: [h('There is ', 'none'), h('nobody', 'direct'), h(' here.', 'none')],
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
					englishHint: [h('I ', 'none'), h("don't have", 'direct'), h(' time.', 'none')],
					introducedAtPosition: 21
				},
				{
					id: 'cc_eopseoyo_02',
					fullSentence: '돈이 없어요.',
					sentenceWithBlank: '돈이 ___.',
					answer: '없어요',
					alternateAnswers: [],
					vocabBaseForm: '없다',
					englishHint: [h('I ', 'none'), h("don't have", 'direct'), h(' money.', 'none')],
					introducedAtPosition: 21
				},
				{
					id: 'cc_eopseoyo_03',
					fullSentence: '여기에 의자가 없어요.',
					sentenceWithBlank: '여기에 의자가 ___.',
					answer: '없어요',
					alternateAnswers: [],
					vocabBaseForm: '없다',
					englishHint: [h('There is ', 'none'), h('no chair', 'direct'), h(' here.', 'none')],
					introducedAtPosition: 21
				}
			]
		},

		// ── 22. 에서 — Location of action ────────────────────────────────────
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
			lessonExamples: [
				{
					id: 'le_eseo_01',
					fullSentence: '도서관에서 공부해요.',
					sentenceWithBlank: '도서관___ 공부해요.',
					answer: '에서',
					englishHint: [h('I study ', 'none'), h('at', 'direct'), h(' the library.', 'none')],
					order: 0
				},
				{
					id: 'le_eseo_02',
					fullSentence: '카페에서 커피를 마셔요.',
					sentenceWithBlank: '카페___ 커피를 마셔요.',
					answer: '에서',
					englishHint: [h('I drink coffee ', 'none'), h('at', 'direct'), h(' the café.', 'none')],
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
					englishHint: [h('I study ', 'none'), h('at', 'direct'), h(' the library.', 'none')],
					introducedAtPosition: 22
				},
				{
					id: 'cc_eseo_02',
					fullSentence: '카페에서 커피를 마셔요.',
					sentenceWithBlank: '카페___ 커피를 마셔요.',
					answer: '에서',
					alternateAnswers: [],
					vocabBaseForm: '에서',
					englishHint: [h('I drink coffee ', 'none'), h('at', 'direct'), h(' the café.', 'none')],
					introducedAtPosition: 22
				},
				{
					id: 'cc_eseo_03',
					fullSentence: '회사에서 일해요.',
					sentenceWithBlank: '회사___ 일해요.',
					answer: '에서',
					alternateAnswers: [],
					vocabBaseForm: '에서',
					englishHint: [h('I work ', 'none'), h('at', 'direct'), h(' the office.', 'none')],
					introducedAtPosition: 22
				}
			]
		},

		// ── 23. 위/아래/앞/뒤/옆 + 에 — Position words ──────────────────────
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
					englishHint: [h('The book is ', 'none'), h('on', 'direct'), h(' the desk.', 'none')],
					order: 0
				},
				{
					id: 'le_position_02',
					fullSentence: '고양이가 의자 아래에 있어요.',
					sentenceWithBlank: '고양이가 의자 ___에 있어요.',
					answer: '아래',
					englishHint: [h('The cat is ', 'none'), h('under', 'direct'), h(' the chair.', 'none')],
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
					englishHint: [h('The book is ', 'none'), h('on', 'direct'), h(' the desk.', 'none')],
					introducedAtPosition: 23
				},
				{
					id: 'cc_position_02',
					fullSentence: '고양이가 의자 아래에 있어요.',
					sentenceWithBlank: '고양이가 의자 ___에 있어요.',
					answer: '아래',
					alternateAnswers: ['밑'],
					vocabBaseForm: '위/아래/앞/뒤/옆',
					englishHint: [h('The cat is ', 'none'), h('under', 'direct'), h(' the chair.', 'none')],
					introducedAtPosition: 23
				},
				{
					id: 'cc_position_03',
					fullSentence: '학교 앞에 가게가 있어요.',
					sentenceWithBlank: '학교 ___에 가게가 있어요.',
					answer: '앞',
					alternateAnswers: [],
					vocabBaseForm: '위/아래/앞/뒤/옆',
					englishHint: [h('There is a store ', 'none'), h('in front of', 'direct'), h(' the school.', 'none')],
					introducedAtPosition: 23
				},
				{
					id: 'cc_position_04',
					fullSentence: '은행 옆에 카페가 있어요.',
					sentenceWithBlank: '은행 ___에 카페가 있어요.',
					answer: '옆',
					alternateAnswers: [],
					vocabBaseForm: '위/아래/앞/뒤/옆',
					englishHint: [h('There is a café ', 'none'), h('next to', 'direct'), h(' the bank.', 'none')],
					introducedAtPosition: 23
				}
			]
		}
	]
};
