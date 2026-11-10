import type { LessonSeed } from '../types';
import { teachLesson } from '../teaching-guides';

// Lesson 21 — Unexpected Results and Concessions
// Grammar points (positions 94–98):
//   94. -아/어 버리다
//   95. -아/어도
//   96. 그런데
//   97. -고 난 후에
//   98. -아/어서 (sequence)
// Available: all Level 1 grammar (positions 1–50); Level 2 is cumulative.
export const lesson21: LessonSeed = teachLesson({
  lessonNumber: 21,
  title: "Unexpected Results and Concessions",
  grammarPoints: [
    {
      id: "gp_eobeorida",
      title: "-아/어 버리다",
      category: "aspect",
      tense: null,
      register: null,
      hint: "end up doing, finish completely",
      description: "Attach -아/어 버리다 to an action verb stem to express completion, often with regret or relief. The auxiliary 버리다 is then conjugated for tense and politeness. Example: 숙제를 다 해 버렸어요. (I finished all my homework.)",
      level: 2,
      tags: ["aspect", "TOPIK1"],
      structurePattern: "[Verb stem]아/어 버리다",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_eobeorida_01", fullSentence: "숙제를 다 해 버렸어요.", sentenceWithBlank: "숙제를 다 해 ___.", answer: "버렸어요", englishHint: "I finished all my homework.", order: 0 },
        { id: "le_eobeorida_02", fullSentence: "실수로 사진을 지워 버렸어요.", sentenceWithBlank: "실수로 사진을 지워 ___.", answer: "버렸어요", englishHint: "I accidentally deleted the photo.", order: 1 },
      ],
      cards: [
        { id: "cc_eobeorida_01", fullSentence: "돈을 다 써 버렸어요.", sentenceWithBlank: "돈을 다 써 ___.", answer: "버렸어요", alternateAnswers: [], vocabBaseForm: "-아/어 버리다", englishHint: "I ended up spending all the money.", introducedAtPosition: 94 },
        { id: "cc_eobeorida_02", fullSentence: "케이크를 다 먹어 버렸어요.", sentenceWithBlank: "케이크를 다 먹어 ___.", answer: "버렸어요", alternateAnswers: [], vocabBaseForm: "-아/어 버리다", englishHint: "I ate the entire cake.", introducedAtPosition: 94 },
        { id: "cc_eobeorida_03", fullSentence: "물을 다 마셔 버렸어요.", sentenceWithBlank: "물을 다 마셔 ___.", answer: "버렸어요", alternateAnswers: [], vocabBaseForm: "-아/어 버리다", englishHint: "I drank all the water.", introducedAtPosition: 94 },
      ]
    },
    {
      id: "gp_eodo_concession",
      title: "-아/어도",
      category: "concession",
      tense: null,
      register: null,
      hint: "even if, although",
      description: "Attach -아/어도 to a predicate stem for a condition that does not change the main outcome. Distinguish this concessive use from -아/어도 되다, which expresses permission. Example: 비가 와도 가요. (I will go even if it rains.)",
      level: 2,
      tags: ["concession", "TOPIK1"],
      structurePattern: "[Verb/Adj stem]아/어도",
      notes: [],
      relatedPointIds: ["gp_eumyeon"],
      lessonExamples: [
        { id: "le_eodo_concession_01", fullSentence: "비가 와도 가요.", sentenceWithBlank: "비가 와___ 가요.", answer: "도", englishHint: "I will go even if it rains.", order: 0 },
        { id: "le_eodo_concession_02", fullSentence: "피곤해도 공부해요.", sentenceWithBlank: "피곤해___ 공부해요.", answer: "도", englishHint: "I study even when I am tired.", order: 1 },
      ],
      cards: [
        { id: "cc_eodo_concession_01", fullSentence: "추워도 밖에 나가요.", sentenceWithBlank: "추워___ 밖에 나가요.", answer: "도", alternateAnswers: [], vocabBaseForm: "-아/어도", englishHint: "I go outside even when it's cold.", introducedAtPosition: 95 },
        { id: "cc_eodo_concession_02", fullSentence: "조금 비싸도 살 거예요.", sentenceWithBlank: "조금 비싸___ 살 거예요.", answer: "도", alternateAnswers: [], vocabBaseForm: "-아/어도", englishHint: "I will buy it even if it is a little expensive.", introducedAtPosition: 95 },
        { id: "cc_eodo_concession_03", fullSentence: "시간이 없어도 괜찮아요.", sentenceWithBlank: "시간이 없어___ 괜찮아요.", answer: "도", alternateAnswers: [], vocabBaseForm: "-아/어도", englishHint: "It is okay even if you do not have time.", introducedAtPosition: 95 },
      ]
    },
    {
      id: "gp_geureonde",
      title: "그런데",
      category: "discourse",
      tense: null,
      register: null,
      hint: "but, by the way",
      description: "Use 그런데 at the beginning of a new sentence to introduce a contrast or a shift in topic. It can mean \"but\" or \"by the way,\" depending on context. Example: 오늘은 추워요. 그런데 코트가 없어요. (It is cold today, but I do not have a coat.)",
      level: 2,
      tags: ["discourse", "TOPIK1"],
      structurePattern: "[Sentence]. 그런데 [Sentence].",
      notes: [],
      relatedPointIds: ["gp_hajiman"],
      lessonExamples: [
        { id: "le_geureonde_01", fullSentence: "오늘은 추워요. 그런데 코트가 없어요.", sentenceWithBlank: "오늘은 추워요. ___ 코트가 없어요.", answer: "그런데", englishHint: "It is cold today, but I do not have a coat.", order: 0 },
        { id: "le_geureonde_02", fullSentence: "그 영화는 재미있어요. 그런데 너무 길어요.", sentenceWithBlank: "그 영화는 재미있어요. ___ 너무 길어요.", answer: "그런데", englishHint: "That movie is interesting, but it is too long.", order: 1 },
      ],
      cards: [
        { id: "cc_geureonde_01", fullSentence: "저는 커피를 좋아해요. 그런데 오늘은 차를 마셔요.", sentenceWithBlank: "저는 커피를 좋아해요. ___ 오늘은 차를 마셔요.", answer: "그런데", alternateAnswers: [], vocabBaseForm: "그런데", englishHint: "I like coffee, but today I am drinking tea.", introducedAtPosition: 96 },
        { id: "cc_geureonde_02", fullSentence: "한국어를 공부해요. 그런데 아직 어려워요.", sentenceWithBlank: "한국어를 공부해요. ___ 아직 어려워요.", answer: "그런데", alternateAnswers: [], vocabBaseForm: "그런데", englishHint: "I study Korean, but it is still hard.", introducedAtPosition: 96 },
        { id: "cc_geureonde_03", fullSentence: "저는 서울에 살아요. 그런데 고향은 부산이에요.", sentenceWithBlank: "저는 서울에 살아요. ___ 고향은 부산이에요.", answer: "그런데", alternateAnswers: [], vocabBaseForm: "그런데", englishHint: "I live in Seoul, but my hometown is Busan.", introducedAtPosition: 96 },
      ]
    },
    {
      id: "gp_go_nan_hue",
      title: "-고 난 후에",
      category: "time",
      tense: null,
      register: null,
      hint: "after finishing",
      description: "Attach -고 난 후에 after an action verb stem to emphasize that one action has finished before the next begins. It is close in meaning to -고 나서. Example: 운동하고 난 후에 물을 마셔요. (I drink water after exercising.)",
      level: 2,
      tags: ["time", "TOPIK1"],
      structurePattern: "[Verb stem]고 난 후에",
      notes: [],
      relatedPointIds: ["gp_go_seq"],
      lessonExamples: [
        { id: "le_go_nan_hue_01", fullSentence: "운동하고 난 후에 물을 마셔요.", sentenceWithBlank: "운동하고 난 ___ 물을 마셔요.", answer: "후에", englishHint: "I drink water after exercising.", order: 0 },
        { id: "le_go_nan_hue_02", fullSentence: "시험을 보고 난 후에 쉬었어요.", sentenceWithBlank: "시험을 보고 난 ___ 쉬었어요.", answer: "후에", englishHint: "I rested after taking the exam.", order: 1 },
      ],
      cards: [
        { id: "cc_go_nan_hue_01", fullSentence: "영화를 보고 난 후에 집에 갔어요.", sentenceWithBlank: "영화를 보고 난 ___ 집에 갔어요.", answer: "후에", alternateAnswers: [], vocabBaseForm: "-고 난 후에", englishHint: "I went home after watching the movie.", introducedAtPosition: 97 },
        { id: "cc_go_nan_hue_02", fullSentence: "밥을 먹고 난 후에 설거지를 해요.", sentenceWithBlank: "밥을 먹고 난 ___ 설거지를 해요.", answer: "후에", alternateAnswers: [], vocabBaseForm: "-고 난 후에", englishHint: "I wash the dishes after eating.", introducedAtPosition: 97 },
        { id: "cc_go_nan_hue_03", fullSentence: "일을 끝내고 난 후에 집에 갔어요.", sentenceWithBlank: "일을 끝내고 난 ___ 집에 갔어요.", answer: "후에", alternateAnswers: [], vocabBaseForm: "-고 난 후에", englishHint: "I went home after finishing work.", introducedAtPosition: 97 },
      ]
    },
    {
      id: "gp_aseo_sequence",
      title: "-아/어서 (sequence)",
      category: "connective",
      tense: null,
      register: null,
      hint: "do and then",
      description: "The familiar -아/어서 form can also connect actions in time order, especially when the first leads into the second. For example, 일어나서 세수해요 means \"I get up and wash my face.\" Example: 아침에 일어나서 세수해요. (I get up and then wash my face in the morning.)",
      level: 2,
      tags: ["connective", "TOPIK1"],
      structurePattern: "[Verb stem]아/어서 + [next action]",
      notes: [],
      relatedPointIds: ["gp_aseo"],
      lessonExamples: [
        { id: "le_aseo_sequence_01", fullSentence: "아침에 일어나서 세수해요.", sentenceWithBlank: "아침에 일어나___ 세수해요.", answer: "서", englishHint: "I get up and then wash my face in the morning.", order: 0 },
        { id: "le_aseo_sequence_02", fullSentence: "집에 가서 쉬었어요.", sentenceWithBlank: "집에 가___ 쉬었어요.", answer: "서", englishHint: "I went home and rested.", order: 1 },
      ],
      cards: [
        { id: "cc_aseo_sequence_01", fullSentence: "집에 들어가서 손을 씻어요.", sentenceWithBlank: "집에 들어가___ 손을 씻어요.", answer: "서", alternateAnswers: [], vocabBaseForm: "-아/어서 (sequence)", englishHint: "I go inside and wash my hands.", introducedAtPosition: 98 },
        { id: "cc_aseo_sequence_02", fullSentence: "시장에서 과일을 사서 집에 왔어요.", sentenceWithBlank: "시장에서 과일을 사___ 집에 왔어요.", answer: "서", alternateAnswers: [], vocabBaseForm: "-아/어서 (sequence)", englishHint: "I bought fruit at the market and came home.", introducedAtPosition: 98 },
        { id: "cc_aseo_sequence_03", fullSentence: "버스를 타서 학교에 갔어요.", sentenceWithBlank: "버스를 타___ 학교에 갔어요.", answer: "서", alternateAnswers: [], vocabBaseForm: "-아/어서 (sequence)", englishHint: "I took the bus and went to school.", introducedAtPosition: 98 },
      ]
    },
  ]
});
