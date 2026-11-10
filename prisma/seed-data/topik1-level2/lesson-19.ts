import type { LessonSeed } from '../types';
import { teachLesson } from '../teaching-guides';

// Lesson 19 — Changes and Prepared Results
// Grammar points (positions 85–88):
//   85. -아/어지다
//   86. -게
//   87. -게 되다
//   88. -아/어 두다
// Available: all Level 1 grammar (positions 1–50); Level 2 is cumulative.
export const lesson19: LessonSeed = teachLesson({
  lessonNumber: 19,
  title: "Changes and Prepared Results",
  grammarPoints: [
    {
      id: "gp_eojida",
      title: "-아/어지다",
      category: "change",
      tense: null,
      register: null,
      hint: "become",
      description: "Attach -아/어지다 to an adjective stem to express a change of state. Conjugate 지다 at the end: 추워지다 becomes 추워졌어요 in the past. Example: 날씨가 많이 추워졌어요. (The weather got much colder.)",
      level: 2,
      tags: ["change", "TOPIK1"],
      structurePattern: "[Adjective stem]아/어지다",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_eojida_01", fullSentence: "날씨가 많이 추워졌어요.", sentenceWithBlank: "날씨가 많이 추워___.", answer: "졌어요", englishHint: "The weather got much colder.", order: 0 },
        { id: "le_eojida_02", fullSentence: "한국어가 조금 쉬워졌어요.", sentenceWithBlank: "한국어가 조금 쉬워___.", answer: "졌어요", englishHint: "Korean has become a little easier.", order: 1 },
      ],
      cards: [
        { id: "cc_eojida_01", fullSentence: "날씨가 시원해졌어요.", sentenceWithBlank: "날씨가 시원해___.", answer: "졌어요", alternateAnswers: [], vocabBaseForm: "-아/어지다", englishHint: "The weather has gotten cooler.", introducedAtPosition: 85 },
        { id: "cc_eojida_02", fullSentence: "날이 따뜻해졌어요.", sentenceWithBlank: "날이 따뜻해___.", answer: "졌어요", alternateAnswers: [], vocabBaseForm: "-아/어지다", englishHint: "The weather got warmer.", introducedAtPosition: 85 },
        { id: "cc_eojida_03", fullSentence: "방이 깨끗해졌어요.", sentenceWithBlank: "방이 깨끗해___.", answer: "졌어요", alternateAnswers: [], vocabBaseForm: "-아/어지다", englishHint: "The room became clean.", introducedAtPosition: 85 },
      ]
    },
    {
      id: "gp_ge_adverb",
      title: "-게",
      category: "adverb",
      tense: null,
      register: null,
      hint: "-ly, in a ... way",
      description: "Attach -게 to an adjective stem to describe how an action is performed. It functions adverbially: 빠르게 걷다 means \"walk quickly.\" Example: 조용하게 말해 주세요. (Please speak quietly.)",
      level: 2,
      tags: ["adverb", "TOPIK1"],
      structurePattern: "[Adjective stem]게 + [Verb]",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_ge_adverb_01", fullSentence: "조용하게 말해 주세요.", sentenceWithBlank: "___ 말해 주세요.", answer: "조용하게", englishHint: "Please speak quietly.", order: 0 },
        { id: "le_ge_adverb_02", fullSentence: "정확하게 읽으세요.", sentenceWithBlank: "___ 읽으세요.", answer: "정확하게", englishHint: "Please read accurately.", order: 1 },
      ],
      cards: [
        { id: "cc_ge_adverb_01", fullSentence: "문을 조용하게 닫아 주세요.", sentenceWithBlank: "문을 ___ 닫아 주세요.", answer: "조용하게", alternateAnswers: [], vocabBaseForm: "-게", englishHint: "Please close the door quietly.", introducedAtPosition: 86 },
        { id: "cc_ge_adverb_02", fullSentence: "글씨를 크게 쓰세요.", sentenceWithBlank: "글씨를 ___ 쓰세요.", answer: "크게", alternateAnswers: [], vocabBaseForm: "-게", englishHint: "Please write in big letters.", introducedAtPosition: 86 },
        { id: "cc_ge_adverb_03", fullSentence: "음악을 작게 틀어 주세요.", sentenceWithBlank: "음악을 ___ 틀어 주세요.", answer: "작게", alternateAnswers: [], vocabBaseForm: "-게", englishHint: "Please play the music quietly.", introducedAtPosition: 86 },
      ]
    },
    {
      id: "gp_ge_doeda",
      title: "-게 되다",
      category: "change",
      tense: null,
      register: null,
      hint: "come to, end up",
      description: "Attach -게 되다 to an action verb stem to describe a change in circumstances or an outcome. It often suggests the change was not simply a direct personal decision. Example: 다음 달부터 서울에서 살게 됐어요. (I ended up moving to Seoul starting next month.)",
      level: 2,
      tags: ["change", "TOPIK1"],
      structurePattern: "[Verb stem]게 되다",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_ge_doeda_01", fullSentence: "다음 달부터 서울에서 살게 됐어요.", sentenceWithBlank: "다음 달부터 서울에서 살게 ___.", answer: "됐어요", englishHint: "I ended up moving to Seoul starting next month.", order: 0 },
        { id: "le_ge_doeda_02", fullSentence: "새 회사에서 일하게 됐어요.", sentenceWithBlank: "새 회사에서 일하게 ___.", answer: "됐어요", englishHint: "I got a job at a new company.", order: 1 },
      ],
      cards: [
        { id: "cc_ge_doeda_01", fullSentence: "다음 주부터 야근하게 됐어요.", sentenceWithBlank: "다음 주부터 야근하게 ___.", answer: "됐어요", alternateAnswers: [], vocabBaseForm: "-게 되다", englishHint: "I have ended up having to work overtime starting next week.", introducedAtPosition: 87 },
        { id: "cc_ge_doeda_02", fullSentence: "한국 친구를 만나서 한국어를 배우게 됐어요.", sentenceWithBlank: "한국 친구를 만나서 한국어를 배우게 ___.", answer: "됐어요", alternateAnswers: [], vocabBaseForm: "-게 되다", englishHint: "I started learning Korean after meeting a Korean friend.", introducedAtPosition: 87 },
        { id: "cc_ge_doeda_03", fullSentence: "이제 아침에 일찍 일어나게 됐어요.", sentenceWithBlank: "이제 아침에 일찍 일어나게 ___.", answer: "됐어요", alternateAnswers: [], vocabBaseForm: "-게 되다", englishHint: "I have come to get up early in the morning.", introducedAtPosition: 87 },
      ]
    },
    {
      id: "gp_eoduda",
      title: "-아/어 두다",
      category: "result",
      tense: null,
      register: null,
      hint: "do in advance, leave done",
      description: "Attach -아/어 두다 to an action verb stem when doing something now for later use or leaving its result in place. For example, 문을 열어 두세요 means \"Please leave the door open.\" Example: 문을 열어 두세요. (Please leave the door open.)",
      level: 2,
      tags: ["result", "TOPIK1"],
      structurePattern: "[Verb stem]아/어 두다",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_eoduda_01", fullSentence: "문을 열어 두세요.", sentenceWithBlank: "문을 열어 ___.", answer: "두세요", englishHint: "Please leave the door open.", order: 0 },
        { id: "le_eoduda_02", fullSentence: "내일 먹을 밥을 만들어 뒀어요.", sentenceWithBlank: "내일 먹을 밥을 만들어 ___.", answer: "뒀어요", englishHint: "I prepared tomorrow's meal in advance.", order: 1 },
      ],
      cards: [
        { id: "cc_eoduda_01", fullSentence: "미리 숙제를 해 뒀어요.", sentenceWithBlank: "미리 숙제를 해 ___.", answer: "뒀어요", alternateAnswers: [], vocabBaseForm: "-아/어 두다", englishHint: "I did my homework ahead of time.", introducedAtPosition: 88 },
        { id: "cc_eoduda_02", fullSentence: "전화번호를 적어 뒀어요.", sentenceWithBlank: "전화번호를 적어 ___.", answer: "뒀어요", alternateAnswers: [], vocabBaseForm: "-아/어 두다", englishHint: "I wrote down the phone number for later.", introducedAtPosition: 88 },
        { id: "cc_eoduda_03", fullSentence: "물을 미리 사 뒀어요.", sentenceWithBlank: "물을 미리 사 ___.", answer: "뒀어요", alternateAnswers: [], vocabBaseForm: "-아/어 두다", englishHint: "I bought water in advance.", introducedAtPosition: 88 },
      ]
    },
  ]
});
