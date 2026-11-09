import type { LessonSeed } from '../types';

// Lesson 14 — Before, After and When
// Grammar points (positions 59–63):
//   59. -기
//   60. -고 나서
//   61. -(으)ㄴ 후에
//   62. -기 전에
//   63. -(으)ㄹ 때
// Available: all corrected Level 1 grammar (positions 1–48); Level 2 is cumulative.
export const lesson14: LessonSeed = {
  lessonNumber: 14,
  title: "Before, After and When",
  grammarPoints: [
    {
      id: "gp_gi_nominal",
      title: "-기",
      category: "nominalization",
      tense: null,
      register: null,
      hint: "doing (an action as a noun)",
      description: "Attach -기 to an action verb stem to form a noun-like expression for an activity. A particle can follow it: 걷기가 좋아요 means \"Walking is pleasant.\" Example: 저는 책 읽기를 좋아해요. (I like reading books.)",
      level: 2,
      tags: ["nominalization", "TOPIK1"],
      structurePattern: "[Action verb stem]기 + [particle]",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_gi_nominal_01", fullSentence: "저는 책 읽기를 좋아해요.", sentenceWithBlank: "저는 책 읽___ 좋아해요.", answer: "기를", englishHint: "I like reading books.", order: 0 },
        { id: "le_gi_nominal_02", fullSentence: "일찍 일어나기가 어려워요.", sentenceWithBlank: "일찍 일어나___ 어려워요.", answer: "기가", englishHint: "Getting up early is difficult.", order: 1 },
      ],
      cards: [
        { id: "cc_gi_nominal_01", fullSentence: "저는 요리하기를 좋아해요.", sentenceWithBlank: "저는 ___ 좋아해요.", answer: "요리하기를", alternateAnswers: [], vocabBaseForm: "-기", englishHint: "I like cooking.", introducedAtPosition: 59 },
        { id: "cc_gi_nominal_02", fullSentence: "매일 걷기를 좋아해요.", sentenceWithBlank: "매일 걷___ 좋아해요.", answer: "기를", alternateAnswers: [], vocabBaseForm: "-기", englishHint: "I like walking every day.", introducedAtPosition: 59 },
        { id: "cc_gi_nominal_03", fullSentence: "한국어를 배우기가 재미있어요.", sentenceWithBlank: "한국어를 배우___ 재미있어요.", answer: "기가", alternateAnswers: [], vocabBaseForm: "-기", englishHint: "Learning Korean is fun.", introducedAtPosition: 59 },
      ]
    },
    {
      id: "gp_go_naseo",
      title: "-고 나서",
      category: "time",
      tense: null,
      register: null,
      hint: "after doing",
      description: "Add -고 나서 to an action verb stem when the second action follows the completed first action. Unlike plain -고, this form explicitly marks the order. Example: 밥을 먹고 나서 커피를 마셔요. (After eating, I drink coffee.)",
      level: 2,
      tags: ["time", "TOPIK1"],
      structurePattern: "[Verb stem]고 나서",
      notes: [],
      relatedPointIds: ["gp_go_seq"],
      lessonExamples: [
        { id: "le_go_naseo_01", fullSentence: "밥을 먹고 나서 커피를 마셔요.", sentenceWithBlank: "밥을 먹고 ___ 커피를 마셔요.", answer: "나서", englishHint: "After eating, I drink coffee.", order: 0 },
        { id: "le_go_naseo_02", fullSentence: "숙제를 하고 나서 친구를 만났어요.", sentenceWithBlank: "숙제를 하고 ___ 친구를 만났어요.", answer: "나서", englishHint: "After doing my homework, I met a friend.", order: 1 },
      ],
      cards: [
        { id: "cc_go_naseo_01", fullSentence: "커피를 마시고 나서 출근해요.", sentenceWithBlank: "커피를 마시고 ___ 출근해요.", answer: "나서", alternateAnswers: [], vocabBaseForm: "-고 나서", englishHint: "After drinking coffee, I go to work.", introducedAtPosition: 60 },
        { id: "cc_go_naseo_02", fullSentence: "운동하고 나서 샤워해요.", sentenceWithBlank: "운동하고 ___ 샤워해요.", answer: "나서", alternateAnswers: [], vocabBaseForm: "-고 나서", englishHint: "After exercising, I shower.", introducedAtPosition: 60 },
        { id: "cc_go_naseo_03", fullSentence: "손을 씻고 나서 밥을 먹어요.", sentenceWithBlank: "손을 씻고 ___ 밥을 먹어요.", answer: "나서", alternateAnswers: [], vocabBaseForm: "-고 나서", englishHint: "After washing my hands, I eat.", introducedAtPosition: 60 },
      ]
    },
    {
      id: "gp_eun_hue",
      title: "-(으)ㄴ 후에",
      category: "time",
      tense: null,
      register: null,
      hint: "after doing",
      description: "Attach -은 후에 to a consonant-ending action verb stem or -ㄴ 후에 to a vowel-ending stem. It places the following event after that action; it is different from noun + 후에. Example: 밥을 먹은 후에 약을 먹어요. (I take medicine after eating.)",
      level: 2,
      tags: ["time", "TOPIK1"],
      structurePattern: "[Verb stem](으)ㄴ 후에",
      notes: [],
      relatedPointIds: ["gp_hue"],
      lessonExamples: [
        { id: "le_eun_hue_01", fullSentence: "밥을 먹은 후에 약을 먹어요.", sentenceWithBlank: "밥을 먹은 ___ 약을 먹어요.", answer: "후에", englishHint: "I take medicine after eating.", order: 0 },
        { id: "le_eun_hue_02", fullSentence: "일을 끝낸 후에 집에 갔어요.", sentenceWithBlank: "일을 끝낸 ___ 집에 갔어요.", answer: "후에", englishHint: "I went home after finishing work.", order: 1 },
      ],
      cards: [
        { id: "cc_eun_hue_01", fullSentence: "수업이 끝난 후에 집에 갔어요.", sentenceWithBlank: "수업이 끝난 ___ 집에 갔어요.", answer: "후에", alternateAnswers: [], vocabBaseForm: "-(으)ㄴ 후에", englishHint: "I went home after class ended.", introducedAtPosition: 61 },
        { id: "cc_eun_hue_02", fullSentence: "영화를 본 후에 커피를 마셨어요.", sentenceWithBlank: "영화를 본 ___ 커피를 마셨어요.", answer: "후에", alternateAnswers: [], vocabBaseForm: "-(으)ㄴ 후에", englishHint: "After watching a movie, I drank coffee.", introducedAtPosition: 61 },
        { id: "cc_eun_hue_03", fullSentence: "책을 읽은 후에 잠을 자요.", sentenceWithBlank: "책을 읽은 ___ 잠을 자요.", answer: "후에", alternateAnswers: [], vocabBaseForm: "-(으)ㄴ 후에", englishHint: "After reading a book, I go to sleep.", introducedAtPosition: 61 },
      ]
    },
    {
      id: "gp_gi_jeone",
      title: "-기 전에",
      category: "time",
      tense: null,
      register: null,
      hint: "before doing",
      description: "Attach -기 전에 to an action verb stem to express \"before doing\" an action. For a noun, simply use noun + 전에, which was introduced earlier. Example: 자기 전에 이를 닦아요. (I brush my teeth before sleeping.)",
      level: 2,
      tags: ["time", "TOPIK1"],
      structurePattern: "[Verb stem]기 전에",
      notes: [],
      relatedPointIds: ["gp_jeone"],
      lessonExamples: [
        { id: "le_gi_jeone_01", fullSentence: "자기 전에 이를 닦아요.", sentenceWithBlank: "자기 ___ 이를 닦아요.", answer: "전에", englishHint: "I brush my teeth before sleeping.", order: 0 },
        { id: "le_gi_jeone_02", fullSentence: "밥을 먹기 전에 손을 씻어요.", sentenceWithBlank: "밥을 먹기 ___ 손을 씻어요.", answer: "전에", englishHint: "I wash my hands before eating.", order: 1 },
      ],
      cards: [
        { id: "cc_gi_jeone_01", fullSentence: "외출하기 전에 문을 닫아요.", sentenceWithBlank: "외출하기 ___ 문을 닫아요.", answer: "전에", alternateAnswers: [], vocabBaseForm: "-기 전에", englishHint: "I close the door before going out.", introducedAtPosition: 62 },
        { id: "cc_gi_jeone_02", fullSentence: "학교에 가기 전에 아침을 먹어요.", sentenceWithBlank: "학교에 가기 ___ 아침을 먹어요.", answer: "전에", alternateAnswers: [], vocabBaseForm: "-기 전에", englishHint: "I eat breakfast before going to school.", introducedAtPosition: 62 },
        { id: "cc_gi_jeone_03", fullSentence: "운동하기 전에 물을 마셔요.", sentenceWithBlank: "운동하기 ___ 물을 마셔요.", answer: "전에", alternateAnswers: [], vocabBaseForm: "-기 전에", englishHint: "I drink water before exercising.", introducedAtPosition: 62 },
      ]
    },
    {
      id: "gp_eul_ttae",
      title: "-(으)ㄹ 때",
      category: "time",
      tense: null,
      register: null,
      hint: "when, at the time of",
      description: "Attach -을 때 after a consonant-ending stem or -ㄹ 때 after a vowel-ending stem. It describes the time at which an event happens; ㄹ-ending stems take 때 directly. Example: 집에 갈 때 버스를 타요. (When I go home, I take the bus.)",
      level: 2,
      tags: ["time", "TOPIK1"],
      structurePattern: "[Verb/Adj stem](으)ㄹ 때",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_eul_ttae_01", fullSentence: "집에 갈 때 버스를 타요.", sentenceWithBlank: "집에 갈 ___ 버스를 타요.", answer: "때", englishHint: "When I go home, I take the bus.", order: 0 },
        { id: "le_eul_ttae_02", fullSentence: "시간이 있을 때 책을 읽어요.", sentenceWithBlank: "시간이 있을 ___ 책을 읽어요.", answer: "때", englishHint: "I read when I have time.", order: 1 },
      ],
      cards: [
        { id: "cc_eul_ttae_01", fullSentence: "아플 때 쉬어요.", sentenceWithBlank: "아플 ___ 쉬어요.", answer: "때", alternateAnswers: [], vocabBaseForm: "-(으)ㄹ 때", englishHint: "I rest when I am sick.", introducedAtPosition: 63 },
        { id: "cc_eul_ttae_02", fullSentence: "밥을 먹을 때 텔레비전을 안 봐요.", sentenceWithBlank: "밥을 먹을 ___ 텔레비전을 안 봐요.", answer: "때", alternateAnswers: [], vocabBaseForm: "-(으)ㄹ 때", englishHint: "I do not watch TV while eating.", introducedAtPosition: 63 },
        { id: "cc_eul_ttae_03", fullSentence: "추울 때 따뜻한 차를 마셔요.", sentenceWithBlank: "추울 ___ 따뜻한 차를 마셔요.", answer: "때", alternateAnswers: [], vocabBaseForm: "-(으)ㄹ 때", englishHint: "When it is cold, I drink warm tea.", introducedAtPosition: 63 },
      ]
    },
  ]
};
