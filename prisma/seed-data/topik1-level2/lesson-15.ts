import type { LessonSeed } from '../types';
import { teachLesson } from '../teaching-guides';

// Lesson 15 — Ongoing Actions and Choices
// Grammar points (positions 67–70):
//   67. -고 있다
//   68. -는 중이다
//   69. -거나
//   70. (이)나
// Available: all Level 1 grammar (positions 1–50); Level 2 is cumulative.
export const lesson15: LessonSeed = teachLesson({
  lessonNumber: 15,
  title: "Ongoing Actions and Choices",
  grammarPoints: [
    {
      id: "gp_go_itda",
      title: "-고 있다",
      category: "aspect",
      tense: null,
      register: null,
      hint: "be doing",
      description: "Attach -고 있다 to an action verb stem to describe an action in progress. Conjugate 있다 for tense and politeness. Example: 지금 책을 읽고 있어요. (I am reading a book now.)",
      level: 2,
      tags: ["aspect", "TOPIK1"],
      structurePattern: "[Verb stem]고 있다",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_go_itda_01", fullSentence: "지금 책을 읽고 있어요.", sentenceWithBlank: "지금 책을 읽고 ___.", answer: "있어요", englishHint: "I am reading a book now.", order: 0 },
        { id: "le_go_itda_02", fullSentence: "친구가 공부하고 있어요.", sentenceWithBlank: "친구가 공부하고 ___.", answer: "있어요", englishHint: "My friend is studying.", order: 1 },
      ],
      cards: [
        { id: "cc_go_itda_01", fullSentence: "지금 음악을 듣고 있어요.", sentenceWithBlank: "지금 음악을 듣고 ___.", answer: "있어요", alternateAnswers: [], vocabBaseForm: "-고 있다", englishHint: "I'm listening to music right now.", introducedAtPosition: 67 },
        { id: "cc_go_itda_02", fullSentence: "엄마가 요리하고 있어요.", sentenceWithBlank: "엄마가 요리하고 ___.", answer: "있어요", alternateAnswers: [], vocabBaseForm: "-고 있다", englishHint: "Mom is cooking.", introducedAtPosition: 67 },
        { id: "cc_go_itda_03", fullSentence: "지금 비가 오고 있어요.", sentenceWithBlank: "지금 비가 오고 ___.", answer: "있어요", alternateAnswers: [], vocabBaseForm: "-고 있다", englishHint: "It is raining now.", introducedAtPosition: 67 },
      ]
    },
    {
      id: "gp_neun_jung",
      title: "-는 중이다",
      category: "aspect",
      tense: null,
      register: null,
      hint: "in the middle of doing",
      description: "Attach -는 중이다 to an action verb stem to emphasize being in the middle of an activity. ㄹ-final stems drop ㄹ before -는. Example: 지금 공부하는 중이에요. (I am in the middle of studying.)",
      level: 2,
      tags: ["aspect", "TOPIK1"],
      structurePattern: "[Verb stem]는 중이다",
      notes: [],
      relatedPointIds: ["gp_go_seq"],
      lessonExamples: [
        { id: "le_neun_jung_01", fullSentence: "지금 공부하는 중이에요.", sentenceWithBlank: "지금 공부하는 ___.", answer: "중이에요", englishHint: "I am in the middle of studying.", order: 0 },
        { id: "le_neun_jung_02", fullSentence: "저는 지금 일하는 중이에요.", sentenceWithBlank: "저는 지금 일하는 ___.", answer: "중이에요", englishHint: "I am working right now.", order: 1 },
      ],
      cards: [
        { id: "cc_neun_jung_01", fullSentence: "지금 청소하는 중이에요.", sentenceWithBlank: "지금 청소하는 ___.", answer: "중이에요", alternateAnswers: [], vocabBaseForm: "-는 중이다", englishHint: "I'm cleaning right now.", introducedAtPosition: 68 },
        { id: "cc_neun_jung_02", fullSentence: "친구가 밥을 먹는 중이에요.", sentenceWithBlank: "친구가 밥을 먹는 ___.", answer: "중이에요", alternateAnswers: [], vocabBaseForm: "-는 중이다", englishHint: "My friend is eating right now.", introducedAtPosition: 68 },
        { id: "cc_neun_jung_03", fullSentence: "우리는 지금 회의하는 중이에요.", sentenceWithBlank: "우리는 지금 회의하는 ___.", answer: "중이에요", alternateAnswers: [], vocabBaseForm: "-는 중이다", englishHint: "We are in a meeting now.", introducedAtPosition: 68 },
      ]
    },
    {
      id: "gp_geona",
      title: "-거나",
      category: "choice",
      tense: null,
      register: null,
      hint: "or (between actions)",
      description: "Attach -거나 directly to a verb or adjective stem to connect alternatives. Unlike noun + (이)나, it joins verbal predicates. Example: 주말에는 책을 읽거나 영화를 봐요. (On weekends I read books or watch movies.)",
      level: 2,
      tags: ["choice", "TOPIK1"],
      structurePattern: "[Verb/Adj stem]거나",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_geona_01", fullSentence: "주말에는 책을 읽거나 영화를 봐요.", sentenceWithBlank: "주말에는 책을 읽___ 영화를 봐요.", answer: "거나", englishHint: "On weekends I read books or watch movies.", order: 0 },
        { id: "le_geona_02", fullSentence: "집에서 쉬거나 산책해요.", sentenceWithBlank: "집에서 쉬___ 산책해요.", answer: "거나", englishHint: "I rest at home or take a walk.", order: 1 },
      ],
      cards: [
        { id: "cc_geona_01", fullSentence: "저는 주말에 요리하거나 쉬어요.", sentenceWithBlank: "저는 주말에 요리하___ 쉬어요.", answer: "거나", alternateAnswers: [], vocabBaseForm: "-거나", englishHint: "On weekends, I cook or rest.", introducedAtPosition: 69 },
        { id: "cc_geona_02", fullSentence: "아침에는 빵을 먹거나 밥을 먹어요.", sentenceWithBlank: "아침에는 빵을 먹___ 밥을 먹어요.", answer: "거나", alternateAnswers: [], vocabBaseForm: "-거나", englishHint: "For breakfast, I eat bread or rice.", introducedAtPosition: 69 },
        { id: "cc_geona_03", fullSentence: "저녁에 운동하거나 음악을 들어요.", sentenceWithBlank: "저녁에 운동하___ 음악을 들어요.", answer: "거나", alternateAnswers: [], vocabBaseForm: "-거나", englishHint: "In the evening, I exercise or listen to music.", introducedAtPosition: 69 },
      ]
    },
    {
      id: "gp_ina_choice",
      title: "(이)나",
      category: "choice",
      tense: null,
      register: null,
      hint: "or (between nouns)",
      description: "Use -이나 after consonant-ending nouns and -나 after vowel-ending nouns to present alternatives. For a simple choice, 커피나 차 means \"coffee or tea.\" Example: 커피나 차를 마실래요? (Would you like coffee or tea?)",
      level: 2,
      tags: ["choice", "TOPIK1"],
      structurePattern: "[Noun](이)나 [Noun]",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_ina_choice_01", fullSentence: "커피나 차를 마실래요?", sentenceWithBlank: "커피___ 차를 마실래요?", answer: "나", englishHint: "Would you like coffee or tea?", order: 0 },
        { id: "le_ina_choice_02", fullSentence: "주말에 영화나 드라마를 봐요.", sentenceWithBlank: "주말에 영화___ 드라마를 봐요.", answer: "나", englishHint: "On weekends, I watch movies or dramas.", order: 1 },
      ],
      cards: [
        { id: "cc_ina_choice_01", fullSentence: "책이나 신문을 읽어요.", sentenceWithBlank: "책___ 신문을 읽어요.", answer: "이나", alternateAnswers: [], vocabBaseForm: "(이)나", englishHint: "I read books or newspapers.", introducedAtPosition: 70 },
        { id: "cc_ina_choice_02", fullSentence: "점심에 김밥이나 라면을 먹어요.", sentenceWithBlank: "점심에 김밥___ 라면을 먹어요.", answer: "이나", alternateAnswers: [], vocabBaseForm: "(이)나", englishHint: "For lunch, I eat kimbap or ramen.", introducedAtPosition: 70 },
        { id: "cc_ina_choice_03", fullSentence: "버스나 지하철을 타요.", sentenceWithBlank: "버스___ 지하철을 타요.", answer: "나", alternateAnswers: [], vocabBaseForm: "(이)나", englishHint: "I take the bus or subway.", introducedAtPosition: 70 },
      ]
    },
  ]
});
