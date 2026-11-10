import type { LessonSeed } from '../types';
import { teachLesson } from '../teaching-guides';
import { grammarGapPoints } from '../grammar-gaps';

// Lesson 13 — Formal Speech and Everyday Rules
// Grammar points (positions 56–61):
//   56. -ㅂ니다/-습니다
//   57. -ㅂ니까/-습니까?
//   58. N입니다/입니까?
//   59. -아/어도 되다
//   60. -(으)면 안 되다
//   61. -지 마세요
// Available: all Level 1 grammar (positions 1–50); Level 2 is cumulative.
export const lesson13: LessonSeed = teachLesson({
  lessonNumber: 13,
  title: "Formal Speech and Everyday Rules",
  grammarPoints: [
    {
      id: "gp_seumnida",
      title: "-ㅂ니다/-습니다",
      category: "formal ending",
      tense: null,
      register: "formal polite",
      hint: "formal statement",
      description: "Attach -ㅂ니다 after vowel-ending stems and -습니다 after consonant-ending stems; ㄹ-final stems drop ㄹ (살다 → 삽니다). This is the formal polite declarative style used in announcements and presentations; 있다 becomes 있습니다. Example: 저는 매일 한국어를 공부합니다. (I study Korean every day.)",
      level: 2,
      tags: ["formal ending", "TOPIK1"],
      structurePattern: "[Verb/Adj stem]ㅂ니다 / 습니다",
      notes: [],
      relatedPointIds: ["gp_ayo_eoyo", "gp_imnida_imnikka"],
      lessonExamples: [
        { id: "le_seumnida_01", fullSentence: "저는 매일 한국어를 공부합니다.", sentenceWithBlank: "저는 매일 한국어를 공부___.", answer: "합니다", englishHint: "I study Korean every day.", order: 0 },
        { id: "le_seumnida_02", fullSentence: "버스가 곧 옵니다.", sentenceWithBlank: "버스가 곧 ___.", answer: "옵니다", englishHint: "The bus will arrive soon.", order: 1 },
      ],
      cards: [
        { id: "cc_seumnida_01", fullSentence: "저는 회사에 다닙니다.", sentenceWithBlank: "저는 회사에 ___.", answer: "다닙니다", alternateAnswers: [], vocabBaseForm: "-ㅂ니다/-습니다", englishHint: "I work for a company.", introducedAtPosition: 56 },
        { id: "cc_seumnida_02", fullSentence: "오늘은 날씨가 좋습니다.", sentenceWithBlank: "오늘은 날씨가 ___.", answer: "좋습니다", alternateAnswers: [], vocabBaseForm: "-ㅂ니다/-습니다", englishHint: "The weather is nice today.", introducedAtPosition: 56 },
        { id: "cc_seumnida_03", fullSentence: "지금 시간이 없습니다.", sentenceWithBlank: "지금 시간이 ___.", answer: "없습니다", alternateAnswers: [], vocabBaseForm: "-ㅂ니다/-습니다", englishHint: "I do not have time now.", introducedAtPosition: 56 },
      ]
    },
    {
      id: "gp_seumnikka",
      title: "-ㅂ니까/-습니까?",
      category: "formal ending",
      tense: null,
      register: "formal polite",
      hint: "formal question",
      description: "Attach -ㅂ니까 after vowel-ending stems or -습니까 after consonant-ending stems; ㄹ-final stems drop ㄹ (살다 → 삽니까?). Noun + 입니까? is the formal copula question. Example: 지금 어디에 갑니까? (Where are you going now?)",
      level: 2,
      tags: ["formal ending", "TOPIK1"],
      structurePattern: "[Verb/Adj stem]ㅂ니까? / 습니까?",
      notes: [],
      relatedPointIds: ["gp_imnida_imnikka"],
      lessonExamples: [
        { id: "le_seumnikka_01", fullSentence: "지금 어디에 갑니까?", sentenceWithBlank: "지금 어디에 ___?", answer: "갑니까", englishHint: "Where are you going now?", order: 0 },
        { id: "le_seumnikka_02", fullSentence: "한국어를 공부합니까?", sentenceWithBlank: "한국어를 ___?", answer: "공부합니까", englishHint: "Do you study Korean?", order: 1 },
      ],
      cards: [
        { id: "cc_seumnikka_01", fullSentence: "어디에 삽니까?", sentenceWithBlank: "어디에 ___?", answer: "삽니까", alternateAnswers: [], vocabBaseForm: "-ㅂ니까/-습니까?", englishHint: "Where do you live?", introducedAtPosition: 57 },
        { id: "cc_seumnikka_02", fullSentence: "이 책이 좋습니까?", sentenceWithBlank: "이 책이 ___?", answer: "좋습니까", alternateAnswers: [], vocabBaseForm: "-ㅂ니까/-습니까?", englishHint: "Is this book good?", introducedAtPosition: 57 },
        { id: "cc_seumnikka_03", fullSentence: "시간이 있습니까?", sentenceWithBlank: "시간이 ___?", answer: "있습니까", alternateAnswers: [], vocabBaseForm: "-ㅂ니까/-습니까?", englishHint: "Do you have time?", introducedAtPosition: 57 },
      ]
    },
    grammarGapPoints.gp_imnida_imnikka,
    {
      id: "gp_eodo_doeda",
      title: "-아/어도 되다",
      category: "permission",
      tense: null,
      register: null,
      hint: "may, be allowed to",
      description: "Combine the -아/어 form of an action verb with -도 되다 to ask or give permission. Conjugate 되다 at the end: 여기 앉아도 돼요 means \"You may sit here.\" Example: 여기 앉아도 돼요? (May I sit here?)",
      level: 2,
      tags: ["permission", "TOPIK1"],
      structurePattern: "[Verb stem]아/어도 되다",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_eodo_doeda_01", fullSentence: "여기 앉아도 돼요?", sentenceWithBlank: "여기 ___?", answer: "앉아도 돼요", englishHint: "May I sit here?", order: 0 },
        { id: "le_eodo_doeda_02", fullSentence: "사진을 찍어도 돼요.", sentenceWithBlank: "사진을 ___.", answer: "찍어도 돼요", englishHint: "You may take pictures.", order: 1 },
      ],
      cards: [
        { id: "cc_eodo_doeda_01", fullSentence: "여기에서 물을 마셔도 돼요?", sentenceWithBlank: "여기에서 물을 ___?", answer: "마셔도 돼요", alternateAnswers: [], vocabBaseForm: "-아/어도 되다", englishHint: "May I drink water here?", introducedAtPosition: 59 },
        { id: "cc_eodo_doeda_02", fullSentence: "지금 가도 돼요.", sentenceWithBlank: "지금 ___.", answer: "가도 돼요", alternateAnswers: [], vocabBaseForm: "-아/어도 되다", englishHint: "You may go now.", introducedAtPosition: 59 },
        { id: "cc_eodo_doeda_03", fullSentence: "이 책을 읽어도 돼요?", sentenceWithBlank: "이 책을 ___?", answer: "읽어도 돼요", alternateAnswers: [], vocabBaseForm: "-아/어도 되다", englishHint: "May I read this book?", introducedAtPosition: 59 },
      ]
    },
    {
      id: "gp_eumyeon_an_doeda",
      title: "-(으)면 안 되다",
      category: "prohibition",
      tense: null,
      register: null,
      hint: "must not",
      description: "Attach -으면 to consonant-ending stems and -면 to vowel-ending stems, then add 안 되다. It prohibits an action rather than expressing inability. Example: 여기에서 담배를 피우면 안 돼요. (You must not smoke here.)",
      level: 2,
      tags: ["prohibition", "TOPIK1"],
      structurePattern: "[Verb stem](으)면 안 되다",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_eumyeon_an_doeda_01", fullSentence: "여기에서 담배를 피우면 안 돼요.", sentenceWithBlank: "여기에서 ___.", answer: "담배를 피우면 안 돼요", englishHint: "You must not smoke here.", order: 0 },
        { id: "le_eumyeon_an_doeda_02", fullSentence: "수업에 늦으면 안 돼요.", sentenceWithBlank: "수업에 ___.", answer: "늦으면 안 돼요", englishHint: "You must not be late for class.", order: 1 },
      ],
      cards: [
        { id: "cc_eumyeon_an_doeda_01", fullSentence: "여기에서 사진을 찍으면 안 돼요.", sentenceWithBlank: "여기에서 사진을 ___.", answer: "찍으면 안 돼요", alternateAnswers: [], vocabBaseForm: "-(으)면 안 되다", englishHint: "You must not take pictures here.", introducedAtPosition: 60 },
        { id: "cc_eumyeon_an_doeda_02", fullSentence: "여기에 들어가면 안 돼요.", sentenceWithBlank: "여기에 ___.", answer: "들어가면 안 돼요", alternateAnswers: [], vocabBaseForm: "-(으)면 안 되다", englishHint: "You must not enter here.", introducedAtPosition: 60 },
        { id: "cc_eumyeon_an_doeda_03", fullSentence: "수업 시간에 전화하면 안 돼요.", sentenceWithBlank: "수업 시간에 전화___.", answer: "하면 안 돼요", alternateAnswers: [], vocabBaseForm: "-(으)면 안 되다", englishHint: "You must not use your phone during class.", introducedAtPosition: 60 },
      ]
    },
    {
      id: "gp_ji_maseyo",
      title: "-지 마세요",
      category: "prohibition",
      tense: null,
      register: null,
      hint: "please do not",
      description: "Attach -지 마세요 directly to an action verb stem to make a polite negative request. Do not combine it with 안 or 못. Example: 여기에서 뛰지 마세요. (Please do not run here.)",
      level: 2,
      tags: ["prohibition", "TOPIK1"],
      structurePattern: "[Verb stem]지 마세요",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_ji_maseyo_01", fullSentence: "여기에서 뛰지 마세요.", sentenceWithBlank: "여기에서 ___.", answer: "뛰지 마세요", englishHint: "Please do not run here.", order: 0 },
        { id: "le_ji_maseyo_02", fullSentence: "걱정하지 마세요.", sentenceWithBlank: "걱정___.", answer: "하지 마세요", englishHint: "Please do not worry.", order: 1 },
      ],
      cards: [
        { id: "cc_ji_maseyo_01", fullSentence: "지금 떠나지 마세요.", sentenceWithBlank: "지금 ___.", answer: "떠나지 마세요", alternateAnswers: [], vocabBaseForm: "-지 마세요", englishHint: "Please don't leave now.", introducedAtPosition: 61 },
        { id: "cc_ji_maseyo_02", fullSentence: "너무 많이 먹지 마세요.", sentenceWithBlank: "너무 많이 ___.", answer: "먹지 마세요", alternateAnswers: [], vocabBaseForm: "-지 마세요", englishHint: "Please do not eat too much.", introducedAtPosition: 61 },
        { id: "cc_ji_maseyo_03", fullSentence: "지금 문을 열지 마세요.", sentenceWithBlank: "지금 문을 ___.", answer: "열지 마세요", alternateAnswers: [], vocabBaseForm: "-지 마세요", englishHint: "Please do not open the door now.", introducedAtPosition: 61 },
      ]
    },
  ]
});
