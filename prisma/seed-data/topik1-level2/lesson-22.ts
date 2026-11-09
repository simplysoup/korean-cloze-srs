import type { LessonSeed } from '../types';

// Lesson 22 — Optional Bridge: Reporting What People Say
// Grammar points (positions 96–99):
//   96. -ㄴ/는다고 하다
//   97. -다고 하다 (adjective)
//   98. (이)라고 하다
//   99. -다고요?
// Available: all corrected Level 1 grammar (positions 1–48); Level 2 is cumulative.
export const lesson22: LessonSeed = {
  lessonNumber: 22,
  title: "Optional Bridge: Reporting What People Say",
  grammarPoints: [
    {
      id: "gp_neundago_hada",
      title: "-ㄴ/는다고 하다",
      category: "reportative",
      tense: null,
      register: null,
      hint: "say that someone does",
      description: "For present action-verb statements, attach -는다고 after consonant-ending stems and -ㄴ다고 after vowel-ending stems, then 하다. Use -ㄴ다고 after ㄹ-final stems too, dropping ㄹ; reported speech is usually more advanced than core TOPIK I. Example: 친구가 매일 운동한다고 해요. (My friend says they exercise every day.)",
      level: 2,
      tags: ["reportative", "TOPIK1", "optional-bridge"],
      structurePattern: "[Action verb stem]ㄴ/는다고 하다",
      notes: [{ type: "caution", title: "Optional bridge", content: "Reported speech is often covered after core beginner grammar. This lesson is enrichment, not required for basic TOPIK I practice." }],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_neundago_hada_01", fullSentence: "친구가 매일 운동한다고 해요.", sentenceWithBlank: "친구가 매일 ___.", answer: "운동한다고 해요", englishHint: "My friend says they exercise every day.", order: 0 },
        { id: "le_neundago_hada_02", fullSentence: "민수가 지금 책을 읽는다고 해요.", sentenceWithBlank: "민수가 지금 책을 ___.", answer: "읽는다고 해요", englishHint: "Minsu says he is reading a book now.", order: 1 },
      ],
      cards: [
        { id: "cc_neundago_hada_01", fullSentence: "친구가 내일 온다고 해요.", sentenceWithBlank: "친구가 내일 ___.", answer: "온다고 해요", alternateAnswers: [], vocabBaseForm: "-ㄴ/는다고 하다", englishHint: "My friend says they are coming tomorrow.", introducedAtPosition: 96 },
        { id: "cc_neundago_hada_02", fullSentence: "동생이 학교에 간다고 했어요.", sentenceWithBlank: "동생이 학교에 ___.", answer: "간다고 했어요", alternateAnswers: [], vocabBaseForm: "-ㄴ/는다고 하다", englishHint: "My younger sibling said they were going to school.", introducedAtPosition: 96 },
        { id: "cc_neundago_hada_03", fullSentence: "친구가 저녁을 먹는다고 해요.", sentenceWithBlank: "친구가 저녁을 ___.", answer: "먹는다고 해요", alternateAnswers: [], vocabBaseForm: "-ㄴ/는다고 하다", englishHint: "My friend says they are eating dinner.", introducedAtPosition: 96 },
      ]
    },
    {
      id: "gp_dago_hada_adj",
      title: "-다고 하다 (adjective)",
      category: "reportative",
      tense: null,
      register: null,
      hint: "say that it is",
      description: "Attach -다고 하다 to descriptive verb stems to report someone's statement about a state. The usual polite form is -다고 해요. Example: 친구가 오늘 바쁘다고 해요. (My friend says they are busy today.)",
      level: 2,
      tags: ["reportative", "TOPIK1", "optional-bridge"],
      structurePattern: "[Adjective stem]다고 하다",
      notes: [{ type: "caution", title: "Optional bridge", content: "Reported speech is often covered after core beginner grammar. This lesson is enrichment, not required for basic TOPIK I practice." }],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_dago_hada_adj_01", fullSentence: "친구가 오늘 바쁘다고 해요.", sentenceWithBlank: "친구가 오늘 ___.", answer: "바쁘다고 해요", englishHint: "My friend says they are busy today.", order: 0 },
        { id: "le_dago_hada_adj_02", fullSentence: "엄마가 음식이 맛있다고 해요.", sentenceWithBlank: "엄마가 음식이 ___.", answer: "맛있다고 해요", englishHint: "Mom says the food is delicious.", order: 1 },
      ],
      cards: [
        { id: "cc_dago_hada_adj_01", fullSentence: "민수가 오늘 피곤하다고 해요.", sentenceWithBlank: "민수가 오늘 ___.", answer: "피곤하다고 해요", alternateAnswers: [], vocabBaseForm: "-다고 하다 (adjective)", englishHint: "Minsu says he is tired today.", introducedAtPosition: 97 },
        { id: "cc_dago_hada_adj_02", fullSentence: "동생이 너무 춥다고 했어요.", sentenceWithBlank: "동생이 너무 ___.", answer: "춥다고 했어요", alternateAnswers: [], vocabBaseForm: "-다고 하다 (adjective)", englishHint: "My younger sibling said it was very cold.", introducedAtPosition: 97 },
        { id: "cc_dago_hada_adj_03", fullSentence: "선생님이 시험이 쉽다고 해요.", sentenceWithBlank: "선생님이 시험이 ___.", answer: "쉽다고 해요", alternateAnswers: [], vocabBaseForm: "-다고 하다 (adjective)", englishHint: "The teacher says the exam is easy.", introducedAtPosition: 97 },
      ]
    },
    {
      id: "gp_irago_hada",
      title: "(이)라고 하다",
      category: "reportative",
      tense: null,
      register: null,
      hint: "say it is called, say it is a noun",
      description: "Use -이라고 after consonant-ending nouns and -라고 after vowel-ending nouns, followed by 하다. It reports a noun identification or someone's name. Example: 저는 민수라고 해요. (My name is Minsu.)",
      level: 2,
      tags: ["reportative", "TOPIK1", "optional-bridge"],
      structurePattern: "[Noun](이)라고 하다",
      notes: [{ type: "caution", title: "Optional bridge", content: "Reported speech is often covered after core beginner grammar. This lesson is enrichment, not required for basic TOPIK I practice." }],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_irago_hada_01", fullSentence: "저는 민수라고 해요.", sentenceWithBlank: "저는 민수___ 해요.", answer: "라고", englishHint: "My name is Minsu.", order: 0 },
        { id: "le_irago_hada_02", fullSentence: "그 사람은 선생님이라고 해요.", sentenceWithBlank: "그 사람은 선생님___ 해요.", answer: "이라고", englishHint: "They say that person is a teacher.", order: 1 },
      ],
      cards: [
        { id: "cc_irago_hada_01", fullSentence: "제 이름은 수진이라고 해요.", sentenceWithBlank: "제 이름은 수진___ 해요.", answer: "이라고", alternateAnswers: [], vocabBaseForm: "(이)라고 하다", englishHint: "My name is Sujin.", introducedAtPosition: 98 },
        { id: "cc_irago_hada_02", fullSentence: "이 음식은 김치라고 해요.", sentenceWithBlank: "이 음식은 김치___ 해요.", answer: "라고", alternateAnswers: [], vocabBaseForm: "(이)라고 하다", englishHint: "This food is called kimchi.", introducedAtPosition: 98 },
        { id: "cc_irago_hada_03", fullSentence: "친구 이름은 수진이라고 해요.", sentenceWithBlank: "친구 이름은 수진___ 해요.", answer: "이라고", alternateAnswers: [], vocabBaseForm: "(이)라고 하다", englishHint: "My friend's name is Sujin.", introducedAtPosition: 98 },
      ]
    },
    {
      id: "gp_dagoyo",
      title: "-다고요?",
      category: "reportative",
      tense: null,
      register: null,
      hint: "did you say ...?",
      description: "Add -다고요? to a reported statement to ask for confirmation or repeat something surprising. Action verbs normally take their reported -ㄴ/는다고 form first. Example: 내일 비가 온다고요? (Did you say it will rain tomorrow?)",
      level: 2,
      tags: ["reportative", "TOPIK1", "optional-bridge"],
      structurePattern: "[Reported clause]다고요?",
      notes: [{ type: "caution", title: "Optional bridge", content: "Reported speech is often covered after core beginner grammar. This lesson is enrichment, not required for basic TOPIK I practice." }],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_dagoyo_01", fullSentence: "내일 비가 온다고요?", sentenceWithBlank: "내일 비가 온___?", answer: "다고요", englishHint: "Did you say it will rain tomorrow?", order: 0 },
        { id: "le_dagoyo_02", fullSentence: "그 식당이 비싸다고요?", sentenceWithBlank: "그 식당이 비싸___?", answer: "다고요", englishHint: "Did you say that restaurant is expensive?", order: 1 },
      ],
      cards: [
        { id: "cc_dagoyo_01", fullSentence: "내일 수업이 없다고요?", sentenceWithBlank: "내일 수업이 없___?", answer: "다고요", alternateAnswers: [], vocabBaseForm: "-다고요?", englishHint: "Did you say there is no class tomorrow?", introducedAtPosition: 99 },
        { id: "cc_dagoyo_02", fullSentence: "친구가 오늘 간다고요?", sentenceWithBlank: "친구가 오늘 간___?", answer: "다고요", alternateAnswers: [], vocabBaseForm: "-다고요?", englishHint: "Did you say your friend is going today?", introducedAtPosition: 99 },
        { id: "cc_dagoyo_03", fullSentence: "그 영화가 재미있다고요?", sentenceWithBlank: "그 영화가 재미있___?", answer: "다고요", alternateAnswers: [], vocabBaseForm: "-다고요?", englishHint: "Did you say that movie is interesting?", introducedAtPosition: 99 },
      ]
    },
  ]
};
