import type { LessonSeed } from '../types';

// Lesson 17 — Trying Things and Talking About Experience
// Grammar points (positions 72–76):
//   72. -아/어 보다
//   73. -(으)ㄴ 적이 있다
//   74. -아/어 본 적이 있다
//   75. -기로 하다
//   76. -(으)ㄹ 것 같다
// Available: all corrected Level 1 grammar (positions 1–48); Level 2 is cumulative.
export const lesson17: LessonSeed = {
  lessonNumber: 17,
  title: "Trying Things and Talking About Experience",
  grammarPoints: [
    {
      id: "gp_eoboda",
      title: "-아/어 보다",
      category: "modal",
      tense: null,
      register: null,
      hint: "try doing",
      description: "Attach -아/어 보다 to an action verb stem to mean trying or experiencing an action. The auxiliary 보다 can be conjugated: 먹어 봤어요 means \"I tried eating it.\" Example: 이 음식을 먹어 보세요. (Please try this food.)",
      level: 2,
      tags: ["modal", "TOPIK1"],
      structurePattern: "[Verb stem]아/어 보다",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_eoboda_01", fullSentence: "이 음식을 먹어 보세요.", sentenceWithBlank: "이 음식을 먹어 ___.", answer: "보세요", englishHint: "Please try this food.", order: 0 },
        { id: "le_eoboda_02", fullSentence: "한국 음식을 만들어 봤어요.", sentenceWithBlank: "한국 음식을 만들어 ___.", answer: "봤어요", englishHint: "I tried making Korean food.", order: 1 },
      ],
      cards: [
        { id: "cc_eoboda_01", fullSentence: "김치를 먹어 봤어요.", sentenceWithBlank: "김치를 먹어 ___.", answer: "봤어요", alternateAnswers: [], vocabBaseForm: "-아/어 보다", englishHint: "I've tried kimchi.", introducedAtPosition: 72 },
        { id: "cc_eoboda_02", fullSentence: "한번 입어 보세요.", sentenceWithBlank: "한번 입어 ___.", answer: "보세요", alternateAnswers: [], vocabBaseForm: "-아/어 보다", englishHint: "Please try it on.", introducedAtPosition: 72 },
        { id: "cc_eoboda_03", fullSentence: "그 옷을 입어 봤어요.", sentenceWithBlank: "그 옷을 입어 ___.", answer: "봤어요", alternateAnswers: [], vocabBaseForm: "-아/어 보다", englishHint: "I tried wearing those clothes.", introducedAtPosition: 72 },
      ]
    },
    {
      id: "gp_eun_jeok",
      title: "-(으)ㄴ 적이 있다",
      category: "experience",
      tense: null,
      register: null,
      hint: "have done before",
      description: "Attach -은 적이 있다 after a consonant-ending action verb stem or -ㄴ 적이 있다 after a vowel-ending stem; ㄹ-final stems drop ㄹ. Use 없다 for no experience; the construction refers to having done something before. Example: 한국에 간 적이 있어요. (I have been to Korea.)",
      level: 2,
      tags: ["experience", "TOPIK1"],
      structurePattern: "[Action verb stem](으)ㄴ 적이 있다/없다",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_eun_jeok_01", fullSentence: "한국에 간 적이 있어요.", sentenceWithBlank: "한국에 간 ___.", answer: "적이 있어요", englishHint: "I have been to Korea.", order: 0 },
        { id: "le_eun_jeok_02", fullSentence: "혼자 여행한 적이 있어요.", sentenceWithBlank: "혼자 여행한 ___.", answer: "적이 있어요", englishHint: "I have traveled alone before.", order: 1 },
      ],
      cards: [
        { id: "cc_eun_jeok_01", fullSentence: "부산에 간 적이 있어요.", sentenceWithBlank: "부산에 간 ___.", answer: "적이 있어요", alternateAnswers: [], vocabBaseForm: "-(으)ㄴ 적이 있다", englishHint: "I've been to Busan before.", introducedAtPosition: 73 },
        { id: "cc_eun_jeok_02", fullSentence: "그 음식을 먹은 적이 없어요.", sentenceWithBlank: "그 음식을 먹은 ___.", answer: "적이 없어요", alternateAnswers: [], vocabBaseForm: "-(으)ㄴ 적이 있다", englishHint: "I have never eaten that food.", introducedAtPosition: 73 },
        { id: "cc_eun_jeok_03", fullSentence: "서울에 산 적이 있어요.", sentenceWithBlank: "서울에 산 ___.", answer: "적이 있어요", alternateAnswers: [], vocabBaseForm: "-(으)ㄴ 적이 있다", englishHint: "I have lived in Seoul before.", introducedAtPosition: 73 },
      ]
    },
    {
      id: "gp_eobon_jeok",
      title: "-아/어 본 적이 있다",
      category: "experience",
      tense: null,
      register: null,
      hint: "have tried before",
      description: "Combine -아/어 보다 with the past modifier 본 적이 있다 to describe having tried something. Use 없다 to say you have never tried it. Example: 김치를 먹어 본 적이 있어요. (I have tried kimchi before.)",
      level: 2,
      tags: ["experience", "TOPIK1"],
      structurePattern: "[Verb stem]아/어 본 적이 있다/없다",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_eobon_jeok_01", fullSentence: "김치를 먹어 본 적이 있어요.", sentenceWithBlank: "김치를 먹어 ___.", answer: "본 적이 있어요", englishHint: "I have tried kimchi before.", order: 0 },
        { id: "le_eobon_jeok_02", fullSentence: "한복을 입어 본 적이 없어요.", sentenceWithBlank: "한복을 입어 ___.", answer: "본 적이 없어요", englishHint: "I have never tried wearing a hanbok.", order: 1 },
      ],
      cards: [
        { id: "cc_eobon_jeok_01", fullSentence: "제주도에서 운전해 본 적이 있어요.", sentenceWithBlank: "제주도에서 운전해 ___.", answer: "본 적이 있어요", alternateAnswers: [], vocabBaseForm: "-아/어 본 적이 있다", englishHint: "I've tried driving on Jeju Island.", introducedAtPosition: 74 },
        { id: "cc_eobon_jeok_02", fullSentence: "그 책을 읽어 본 적이 있어요.", sentenceWithBlank: "그 책을 읽어 ___.", answer: "본 적이 있어요", alternateAnswers: [], vocabBaseForm: "-아/어 본 적이 있다", englishHint: "I have read that book before.", introducedAtPosition: 74 },
        { id: "cc_eobon_jeok_03", fullSentence: "제주도에 가 본 적이 있어요.", sentenceWithBlank: "제주도에 가 ___.", answer: "본 적이 있어요", alternateAnswers: [], vocabBaseForm: "-아/어 본 적이 있다", englishHint: "I have visited Jeju Island before.", introducedAtPosition: 74 },
      ]
    },
    {
      id: "gp_giro_hada",
      title: "-기로 하다",
      category: "decision",
      tense: null,
      register: null,
      hint: "decide to",
      description: "Attach -기로 하다 to an action verb stem to state a decision or agreement. The decision can be past even when the action is planned for the future. Example: 내일부터 운동하기로 했어요. (I decided to exercise starting tomorrow.)",
      level: 2,
      tags: ["decision", "TOPIK1"],
      structurePattern: "[Verb stem]기로 하다",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_giro_hada_01", fullSentence: "내일부터 운동하기로 했어요.", sentenceWithBlank: "내일부터 운동하___ 했어요.", answer: "기로", englishHint: "I decided to exercise starting tomorrow.", order: 0 },
        { id: "le_giro_hada_02", fullSentence: "친구하고 같이 가기로 했어요.", sentenceWithBlank: "친구하고 같이 가___ 했어요.", answer: "기로", englishHint: "I decided to go with my friend.", order: 1 },
      ],
      cards: [
        { id: "cc_giro_hada_01", fullSentence: "이번 주에는 일찍 자기로 했어요.", sentenceWithBlank: "이번 주에는 일찍 자___ 했어요.", answer: "기로", alternateAnswers: [], vocabBaseForm: "-기로 하다", englishHint: "I've decided to go to bed early this week.", introducedAtPosition: 75 },
        { id: "cc_giro_hada_02", fullSentence: "오늘은 집에서 쉬기로 했어요.", sentenceWithBlank: "오늘은 집에서 쉬___ 했어요.", answer: "기로", alternateAnswers: [], vocabBaseForm: "-기로 하다", englishHint: "I decided to rest at home today.", introducedAtPosition: 75 },
        { id: "cc_giro_hada_03", fullSentence: "다음 주에 만나기로 했어요.", sentenceWithBlank: "다음 주에 만나___ 했어요.", answer: "기로", alternateAnswers: [], vocabBaseForm: "-기로 하다", englishHint: "We decided to meet next week.", introducedAtPosition: 75 },
      ]
    },
    {
      id: "gp_eul_geot_gatda",
      title: "-(으)ㄹ 것 같다",
      category: "conjecture",
      tense: null,
      register: null,
      hint: "seems likely to, probably",
      description: "Attach -을 것 같다 after a consonant-ending predicate stem or -ㄹ 것 같다 after a vowel-ending stem; ㄹ-final stems keep their ㄹ. It expresses a tentative prediction, unlike present-state -(으)ㄴ 것 같다. Example: 내일 비가 올 것 같아요. (I think it will rain tomorrow.)",
      level: 2,
      tags: ["conjecture", "TOPIK1"],
      structurePattern: "[Verb/Adj stem](으)ㄹ 것 같다",
      notes: [],
      relatedPointIds: ["gp_n_geos_gatda"],
      lessonExamples: [
        { id: "le_eul_geot_gatda_01", fullSentence: "내일 비가 올 것 같아요.", sentenceWithBlank: "내일 비가 ___.", answer: "올 것 같아요", englishHint: "I think it will rain tomorrow.", order: 0 },
        { id: "le_eul_geot_gatda_02", fullSentence: "주말에는 바쁠 것 같아요.", sentenceWithBlank: "주말에는 ___.", answer: "바쁠 것 같아요", englishHint: "I think I will be busy this weekend.", order: 1 },
      ],
      cards: [
        { id: "cc_eul_geot_gatda_01", fullSentence: "내일은 눈이 올 것 같아요.", sentenceWithBlank: "내일은 눈이 ___.", answer: "올 것 같아요", alternateAnswers: [], vocabBaseForm: "-(으)ㄹ 것 같다", englishHint: "I think it might snow tomorrow.", introducedAtPosition: 76 },
        { id: "cc_eul_geot_gatda_02", fullSentence: "이 음식은 매울 것 같아요.", sentenceWithBlank: "이 음식은 ___.", answer: "매울 것 같아요", alternateAnswers: [], vocabBaseForm: "-(으)ㄹ 것 같다", englishHint: "I think this food will be spicy.", introducedAtPosition: 76 },
        { id: "cc_eul_geot_gatda_03", fullSentence: "친구가 곧 올 것 같아요.", sentenceWithBlank: "친구가 곧 ___.", answer: "올 것 같아요", alternateAnswers: [], vocabBaseForm: "-(으)ㄹ 것 같다", englishHint: "I think my friend will arrive soon.", introducedAtPosition: 76 },
      ]
    },
  ]
};
