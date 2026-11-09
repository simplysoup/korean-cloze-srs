import type { LessonSeed } from '../types';

// Lesson 9 — Conditions and Contrast
// Grammar points (positions 40–42):
//   40. eumyeon
//   41. jiman
//   42. hajiman
// Examples and cards use only grammar through their target position.

export const lesson09: LessonSeed = {
	lessonNumber: 9,
	title: "Conditions and Contrast",
	grammarPoints: [
		// 40. gp_eumyeon
		{
			id: 'gp_eumyeon',
			title: '-(으)면',
			category: 'connective',
			tense: null,
			register: null,
			hint: 'if, when (conditional)',
			description:
				'Conditional connector meaning "if" or "when." ' +
				'After consonant stem → -으면: 먹다 → 먹으면. After vowel stem → -면: 가다 → 가면. ' +
				'시간이 있으면 같이 가요 "If you have time, let\'s go together."',
			level: 1,
			tags: ['connective', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb stem + (으)면 + [result clause]',
			notes: [
				{ type: 'tip', title: 'Hypothetical & Habitual', content: '-(으)면 covers both hypothetical (if it rains) and habitual (whenever I eat). Context determines which.' },
				{ type: 'tip', title: 'ㄹ-Irregular', content: 'Stems ending in ㄹ: drop ㄹ, add -면. 살다 → 살면, 알다 → 알면.' }
			],
			lessonExamples: [
				{
					id: 'le_eumyeon_01',
					fullSentence: '시간이 있으면 같이 가요.',
					sentenceWithBlank: '시간이 ___ 같이 가요.',
					answer: '있으면',
					englishHint: "If you have time, let's go together.",
					order: 0
				},
				{
					id: 'le_eumyeon_02',
					fullSentence: '비가 오면 집에 있어요.',
					sentenceWithBlank: '비가 ___ 집에 있어요.',
					answer: '오면',
					englishHint: 'If it rains, I stay home.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_eumyeon_01',
					fullSentence: '시간이 있으면 같이 가요.',
					sentenceWithBlank: '시간이 있으___ 같이 가요.',
					answer: '면',
					alternateAnswers: [],
					vocabBaseForm: '-(으)면',
					englishHint: "If you have time, let's go together.",
					introducedAtPosition: 40
				},
				{
					id: 'cc_eumyeon_02',
					fullSentence: '한국에 가면 불고기를 먹고 싶어요.',
					sentenceWithBlank: '한국에 가___ 불고기를 먹고 싶어요.',
					answer: '면',
					alternateAnswers: [],
					vocabBaseForm: '-(으)면',
					englishHint: 'If I go to Korea, I want to eat bulgogi.',
					introducedAtPosition: 40
				},
				{
					id: 'cc_eumyeon_03',
					fullSentence: '날씨가 좋으면 공원에 가요.',
					sentenceWithBlank: '날씨가 좋으___ 공원에 가요.',
					answer: '면',
					alternateAnswers: [],
					vocabBaseForm: '-(으)면',
					englishHint: 'If the weather is nice, I go to the park.',
					introducedAtPosition: 40
				}
			]
		},

		// 41. gp_jiman
		{
			id: 'gp_jiman',
			title: '-지만',
			category: 'connective',
			tense: null,
			register: null,
			hint: 'but, however (connects clauses)',
			description:
				'Clause-level contrast connector. Verb/Adj stem + 지만: ' +
				'비싸지만 맛있어요 "It\'s expensive but delicious." ' +
				'Can also take tense: 갔지만 "went but." Always attaches directly to the stem (no vowel harmony).',
			level: 1,
			tags: ['connective', 'beginner', 'TOPIK1'],
			structurePattern: 'Verb/Adj stem + 지만 + [contrasting clause]',
			notes: [
				{ type: 'tip', title: 'No Vowel Harmony', content: '-지만 attaches directly to any stem. No consonant/vowel distinction. 먹다 → 먹지만, 가다 → 가지만.' },
				{ type: 'tip', title: 'With Tense', content: 'Past: 갔지만, 먹었지만. The tense goes between the stem and -지만.' }
			],
			relatedPointIds: ['gp_hajiman'],
			lessonExamples: [
				{
					id: 'le_jiman_01',
					fullSentence: '비싸지만 맛있어요.',
					sentenceWithBlank: '비싸___ 맛있어요.',
					answer: '지만',
					englishHint: "It's expensive but it's delicious.",
					order: 0
				},
				{
					id: 'le_jiman_02',
					fullSentence: '한국어는 어렵지만 재미있어요.',
					sentenceWithBlank: '한국어는 어렵___ 재미있어요.',
					answer: '지만',
					englishHint: 'Korean is difficult but fun.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_jiman_01',
					fullSentence: '비싸지만 맛있어요.',
					sentenceWithBlank: '비싸___ 맛있어요.',
					answer: '지만',
					alternateAnswers: [],
					vocabBaseForm: '-지만',
					englishHint: "It's expensive but it's delicious.",
					introducedAtPosition: 41
				},
				{
					id: 'cc_jiman_02',
					fullSentence: '피곤하지만 공부해야 해요.',
					sentenceWithBlank: '피곤하___ 공부해야 해요.',
					answer: '지만',
					alternateAnswers: [],
					vocabBaseForm: '-지만',
					englishHint: "I'm tired but I have to study.",
					introducedAtPosition: 41
				},
				{
					id: 'cc_jiman_03',
					fullSentence: '작지만 좋은 집이에요.',
					sentenceWithBlank: '작___ 좋은 집이에요.',
					answer: '지만',
					alternateAnswers: [],
					vocabBaseForm: '-지만',
					englishHint: "It's small but a nice house.",
					introducedAtPosition: 41
				}
			]
		},

		// 42. gp_hajiman
		{
			id: 'gp_hajiman',
			title: '하지만',
			category: 'connective',
			tense: null,
			register: null,
			hint: 'but, however (sentence connector)',
			description:
				'Sentence-initial contrast connector meaning "but" or "however." ' +
				'Links two sentences: 한국어는 어려워요. 하지만 재미있어요. ' +
				'"Korean is hard. But it\'s fun." Compare with -지만 which connects clauses within one sentence.',
			level: 1,
			tags: ['connective', 'beginner', 'TOPIK1'],
			structurePattern: '[Sentence A]. 하지만 [contrasting sentence B].',
			notes: [
				{ type: 'tip', title: '-지만 vs 하지만', content: '-지만 connects clauses within one sentence. 하지만 connects two separate sentences. Same meaning, different scope.' },
				{ type: 'tip', title: 'Similar Words', content: '하지만, 그런데, 그렇지만 all mean "but/however." 하지만 is the most common in writing.' }
			],
			relatedPointIds: ['gp_jiman'],
			lessonExamples: [
				{
					id: 'le_hajiman_01',
					fullSentence: '한국어는 어려워요. 하지만 재미있어요.',
					sentenceWithBlank: '한국어는 어려워요. ___ 재미있어요.',
					answer: '하지만',
					englishHint: "Korean is hard. But it's fun.",
					order: 0
				},
				{
					id: 'le_hajiman_02',
					fullSentence: '비가 왔어요. 하지만 공원에 갔어요.',
					sentenceWithBlank: '비가 왔어요. ___ 공원에 갔어요.',
					answer: '하지만',
					englishHint: 'It rained. But I went to the park.',
					order: 1
				}
			],
			cards: [
				{
					id: 'cc_hajiman_01',
					fullSentence: '한국어는 어려워요. 하지만 재미있어요.',
					sentenceWithBlank: '한국어는 어려워요. ___ 재미있어요.',
					answer: '하지만',
					alternateAnswers: [],
					vocabBaseForm: '하지만',
					englishHint: "Korean is hard. But it's fun.",
					introducedAtPosition: 42
				},
				{
					id: 'cc_hajiman_02',
					fullSentence: '그 식당은 비싸요. 하지만 맛있어요.',
					sentenceWithBlank: '그 식당은 비싸요. ___ 맛있어요.',
					answer: '하지만',
					alternateAnswers: [],
					vocabBaseForm: '하지만',
					englishHint: "That restaurant is expensive. But it's delicious.",
					introducedAtPosition: 42
				},
				{
					id: 'cc_hajiman_03',
					fullSentence: '피곤해요. 하지만 공부해야 해요.',
					sentenceWithBlank: '피곤해요. ___ 공부해야 해요.',
					answer: '하지만',
					alternateAnswers: [],
					vocabBaseForm: '하지만',
					englishHint: "I'm tired. But I have to study.",
					introducedAtPosition: 42
				}
			]
		}
	]
};
