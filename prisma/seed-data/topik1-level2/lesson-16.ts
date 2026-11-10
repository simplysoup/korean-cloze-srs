import type { LessonSeed } from '../types';
import { teachLesson } from '../teaching-guides';

// Lesson 16 — Describing People and Things
// Grammar points (positions 71–74):
//   71. -는 N
//   72. -(으)ㄴ N (action)
//   73. -(으)ㄹ N
//   74. -는 것
// Available: all Level 1 grammar (positions 1–50); Level 2 is cumulative.
export const lesson16: LessonSeed = teachLesson({
  lessonNumber: 16,
  title: "Describing People and Things",
  grammarPoints: [
    {
      id: "gp_neun_modifier",
      title: "-는 N",
      category: "relative clause",
      tense: null,
      register: null,
      hint: "person or thing that does",
      description: "Attach -는 to an action verb stem before a noun to describe a present or habitual action. For stems ending in ㄹ, drop ㄹ before -는: 살다 becomes 사는. Example: 저기에서 책을 읽는 사람은 제 친구예요. (The person reading over there is my friend.)",
      level: 2,
      tags: ["relative clause", "TOPIK1"],
      structurePattern: "[Action verb stem]는 [Noun]",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_neun_modifier_01", fullSentence: "저기에서 책을 읽는 사람은 제 친구예요.", sentenceWithBlank: "저기에서 책을 ___ 사람은 제 친구예요.", answer: "읽는", englishHint: "The person reading over there is my friend.", order: 0 },
        { id: "le_neun_modifier_02", fullSentence: "한국어를 배우는 학생이 많아요.", sentenceWithBlank: "한국어를 ___ 학생이 많아요.", answer: "배우는", englishHint: "There are many students who study Korean.", order: 1 },
      ],
      cards: [
        { id: "cc_neun_modifier_01", fullSentence: "저기 웃는 사람은 우리 선생님이에요.", sentenceWithBlank: "저기 ___ 사람은 우리 선생님이에요.", answer: "웃는", alternateAnswers: [], vocabBaseForm: "-는 N", englishHint: "The person smiling over there is our teacher.", introducedAtPosition: 71 },
        { id: "cc_neun_modifier_02", fullSentence: "매일 운동하는 사람은 건강해요.", sentenceWithBlank: "매일 ___ 사람은 건강해요.", answer: "운동하는", alternateAnswers: [], vocabBaseForm: "-는 N", englishHint: "People who exercise daily are healthy.", introducedAtPosition: 71 },
        { id: "cc_neun_modifier_03", fullSentence: "제가 자주 가는 카페는 여기예요.", sentenceWithBlank: "제가 자주 ___ 카페는 여기예요.", answer: "가는", alternateAnswers: [], vocabBaseForm: "-는 N", englishHint: "This is the café I often go to.", introducedAtPosition: 71 },
      ]
    },
    {
      id: "gp_eun_past_modifier",
      title: "-(으)ㄴ N (action)",
      category: "relative clause",
      tense: null,
      register: null,
      hint: "thing that was done",
      description: "Attach -은 after a consonant-ending action verb stem or -ㄴ after a vowel-ending stem before a noun; final ㄹ drops (살다 → 산). This describes a completed action, unlike the present adjective modifier from Level 1. Example: 어제 산 옷이 예뻐요. (The clothes I bought yesterday are pretty.)",
      level: 2,
      tags: ["relative clause", "TOPIK1"],
      structurePattern: "[Action verb stem](으)ㄴ [Noun]",
      notes: [],
      relatedPointIds: ["gp_eun_modifier"],
      lessonExamples: [
        { id: "le_eun_past_modifier_01", fullSentence: "어제 산 옷이 예뻐요.", sentenceWithBlank: "어제 ___ 옷이 예뻐요.", answer: "산", englishHint: "The clothes I bought yesterday are pretty.", order: 0 },
        { id: "le_eun_past_modifier_02", fullSentence: "제가 만든 음식은 맛있어요.", sentenceWithBlank: "제가 ___ 음식은 맛있어요.", answer: "만든", englishHint: "The food I made is delicious.", order: 1 },
      ],
      cards: [
        { id: "cc_eun_past_modifier_01", fullSentence: "어제 읽은 책이 재미있었어요.", sentenceWithBlank: "어제 ___ 책이 재미있었어요.", answer: "읽은", alternateAnswers: [], vocabBaseForm: "-(으)ㄴ N (action)", englishHint: "The book I read yesterday was interesting.", introducedAtPosition: 72 },
        { id: "cc_eun_past_modifier_02", fullSentence: "어제 본 영화는 재미있었어요.", sentenceWithBlank: "어제 ___ 영화는 재미있었어요.", answer: "본", alternateAnswers: [], vocabBaseForm: "-(으)ㄴ N (action)", englishHint: "The movie I watched yesterday was interesting.", introducedAtPosition: 72 },
        { id: "cc_eun_past_modifier_03", fullSentence: "아침에 먹은 음식은 김밥이에요.", sentenceWithBlank: "아침에 ___ 음식은 김밥이에요.", answer: "먹은", alternateAnswers: [], vocabBaseForm: "-(으)ㄴ N (action)", englishHint: "I ate gimbap for breakfast.", introducedAtPosition: 72 },
      ]
    },
    {
      id: "gp_eul_future_modifier",
      title: "-(으)ㄹ N",
      category: "relative clause",
      tense: null,
      register: null,
      hint: "thing to do, future noun modifier",
      description: "Attach -을 after a consonant-ending action verb stem or -ㄹ after a vowel-ending stem before a noun; ㄹ-final stems keep their ㄹ (살다 → 살 집). It describes an anticipated or intended action involving the noun. Example: 내일 만날 사람은 제 친구예요. (The person I will meet tomorrow is my friend.)",
      level: 2,
      tags: ["relative clause", "TOPIK1"],
      structurePattern: "[Action verb stem](으)ㄹ [Noun]",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_eul_future_modifier_01", fullSentence: "내일 만날 사람은 제 친구예요.", sentenceWithBlank: "내일 ___ 사람은 제 친구예요.", answer: "만날", englishHint: "The person I will meet tomorrow is my friend.", order: 0 },
        { id: "le_eul_future_modifier_02", fullSentence: "오늘 먹을 음식은 뭐예요?", sentenceWithBlank: "오늘 ___ 음식은 뭐예요?", answer: "먹을", englishHint: "What are we eating today?", order: 1 },
      ],
      cards: [
        { id: "cc_eul_future_modifier_01", fullSentence: "내일 입을 옷을 준비했어요.", sentenceWithBlank: "내일 ___ 옷을 준비했어요.", answer: "입을", alternateAnswers: [], vocabBaseForm: "-(으)ㄹ N", englishHint: "I prepared the clothes I'll wear tomorrow.", introducedAtPosition: 73 },
        { id: "cc_eul_future_modifier_02", fullSentence: "주말에 볼 영화를 정했어요.", sentenceWithBlank: "주말에 ___ 영화를 정했어요.", answer: "볼", alternateAnswers: [], vocabBaseForm: "-(으)ㄹ N", englishHint: "I chose the movie I will watch this weekend.", introducedAtPosition: 73 },
        { id: "cc_eul_future_modifier_03", fullSentence: "내일 읽을 책을 샀어요.", sentenceWithBlank: "내일 ___ 책을 샀어요.", answer: "읽을", alternateAnswers: [], vocabBaseForm: "-(으)ㄹ N", englishHint: "I bought the book I will read tomorrow.", introducedAtPosition: 73 },
      ]
    },
    {
      id: "gp_neun_geot",
      title: "-는 것",
      category: "nominalization",
      tense: null,
      register: null,
      hint: "doing something (as a noun)",
      description: "Put -는 것 after an action verb stem to turn the action into a noun phrase. In speech, 것이 often contracts to 게 and 것을 to 걸. Example: 저는 책을 읽는 것을 좋아해요. (I like reading books.)",
      level: 2,
      tags: ["nominalization", "TOPIK1"],
      structurePattern: "[Action verb stem]는 것",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_neun_geot_01", fullSentence: "저는 책을 읽는 것을 좋아해요.", sentenceWithBlank: "저는 책을 ___ 좋아해요.", answer: "읽는 것을", englishHint: "I like reading books.", order: 0 },
        { id: "le_neun_geot_02", fullSentence: "일찍 일어나는 것이 어려워요.", sentenceWithBlank: "일찍 ___ 어려워요.", answer: "일어나는 것이", englishHint: "Getting up early is hard.", order: 1 },
      ],
      cards: [
        { id: "cc_neun_geot_01", fullSentence: "저는 음악 듣는 것을 좋아해요.", sentenceWithBlank: "저는 음악 ___ 좋아해요.", answer: "듣는 것을", alternateAnswers: [], vocabBaseForm: "-는 것", englishHint: "I like listening to music.", introducedAtPosition: 74 },
        { id: "cc_neun_geot_02", fullSentence: "운동하는 것은 건강에 좋아요.", sentenceWithBlank: "___ 건강에 좋아요.", answer: "운동하는 것은", alternateAnswers: [], vocabBaseForm: "-는 것", englishHint: "Exercising is good for your health.", introducedAtPosition: 74 },
        { id: "cc_neun_geot_03", fullSentence: "저는 요리하는 것이 재미있어요.", sentenceWithBlank: "저는 ___ 재미있어요.", answer: "요리하는 것이", alternateAnswers: [], vocabBaseForm: "-는 것", englishHint: "I find cooking fun.", introducedAtPosition: 74 },
      ]
    },
  ]
});
