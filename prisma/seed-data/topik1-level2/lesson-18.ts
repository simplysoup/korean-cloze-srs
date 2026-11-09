import type { LessonSeed } from '../types';

// Lesson 18 — Giving Reasons and Background
// Grammar points (positions 80–84):
//   80. -기 때문에
//   81. -는데
//   82. -(으)ㄴ데
//   83. -(이)ㄴ데
//   84. -(으)면서
// Available: all corrected Level 1 grammar (positions 3–50); Level 2 is cumulative.
export const lesson18: LessonSeed = {
  lessonNumber: 18,
  title: "Giving Reasons and Background",
  grammarPoints: [
    {
      id: "gp_gi_ttaemune",
      title: "-기 때문에",
      category: "reason",
      tense: null,
      register: null,
      hint: "because",
      description: "Attach -기 때문에 to a verb or adjective stem to give a reason. It is more explicit and often more written-sounding than -아/어서; noun + 때문에 does not need -기. Example: 비가 오기 때문에 집에 있어요. (I am staying home because it is raining.)",
      level: 2,
      tags: ["reason", "TOPIK1"],
      structurePattern: "[Verb/Adj stem]기 때문에",
      notes: [],
      relatedPointIds: ["gp_aseo", "gp_eunikka"],
      lessonExamples: [
        { id: "le_gi_ttaemune_01", fullSentence: "비가 오기 때문에 집에 있어요.", sentenceWithBlank: "비가 오기 ___ 집에 있어요.", answer: "때문에", englishHint: "I am staying home because it is raining.", order: 0 },
        { id: "le_gi_ttaemune_02", fullSentence: "시험이 있기 때문에 공부해요.", sentenceWithBlank: "시험이 있기 ___ 공부해요.", answer: "때문에", englishHint: "I study because I have an exam.", order: 1 },
      ],
      cards: [
        { id: "cc_gi_ttaemune_01", fullSentence: "배가 아프기 때문에 못 갔어요.", sentenceWithBlank: "배가 아프기 ___ 못 갔어요.", answer: "때문에", alternateAnswers: [], vocabBaseForm: "-기 때문에", englishHint: "I couldn't go because my stomach hurt.", introducedAtPosition: 80 },
        { id: "cc_gi_ttaemune_02", fullSentence: "너무 춥기 때문에 밖에 안 나가요.", sentenceWithBlank: "너무 춥기 ___ 밖에 안 나가요.", answer: "때문에", alternateAnswers: [], vocabBaseForm: "-기 때문에", englishHint: "I am not going outside because it is too cold.", introducedAtPosition: 80 },
        { id: "cc_gi_ttaemune_03", fullSentence: "시간이 없기 때문에 택시를 탔어요.", sentenceWithBlank: "시간이 없기 ___ 택시를 탔어요.", answer: "때문에", alternateAnswers: [], vocabBaseForm: "-기 때문에", englishHint: "I took a taxi because I had no time.", introducedAtPosition: 80 },
      ]
    },
    {
      id: "gp_neunde",
      title: "-는데",
      category: "connective",
      tense: null,
      register: null,
      hint: "but, and (background)",
      description: "Attach -는데 to an action verb stem to give background or set up a contrast. For a stem ending in ㄹ, drop ㄹ: 살다 becomes 사는데. Example: 비가 오는데 우산이 없어요. (It is raining, but I do not have an umbrella.)",
      level: 2,
      tags: ["connective", "TOPIK1"],
      structurePattern: "[Action verb stem]는데",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_neunde_01", fullSentence: "비가 오는데 우산이 없어요.", sentenceWithBlank: "비가 오___ 우산이 없어요.", answer: "는데", englishHint: "It is raining, but I do not have an umbrella.", order: 0 },
        { id: "le_neunde_02", fullSentence: "친구를 기다리는데 아직 안 와요.", sentenceWithBlank: "친구를 기다리___ 아직 안 와요.", answer: "는데", englishHint: "I am waiting for my friend, but they have not come yet.", order: 1 },
      ],
      cards: [
        { id: "cc_neunde_01", fullSentence: "밖에 비가 오는데 우산이 없어요.", sentenceWithBlank: "밖에 비가 오___ 우산이 없어요.", answer: "는데", alternateAnswers: [], vocabBaseForm: "-는데", englishHint: "It's raining outside, but I don't have an umbrella.", introducedAtPosition: 81 },
        { id: "cc_neunde_02", fullSentence: "저는 커피를 마시는데 친구는 차를 마셔요.", sentenceWithBlank: "저는 커피를 마시___ 친구는 차를 마셔요.", answer: "는데", alternateAnswers: [], vocabBaseForm: "-는데", englishHint: "I drink coffee, but my friend drinks tea.", introducedAtPosition: 81 },
        { id: "cc_neunde_03", fullSentence: "지금 공부하는데 조금 후에 전화할게요.", sentenceWithBlank: "지금 공부하___ 조금 후에 전화할게요.", answer: "는데", alternateAnswers: [], vocabBaseForm: "-는데", englishHint: "I am studying now, so I will call a little later.", introducedAtPosition: 81 },
      ]
    },
    {
      id: "gp_eunde",
      title: "-(으)ㄴ데",
      category: "connective",
      tense: null,
      register: null,
      hint: "but, and (state background)",
      description: "Use -은데 after a consonant-ending adjective stem or -ㄴ데 after a vowel-ending stem to give background or contrast. Stem-final ㄹ drops, and ㅂ-irregular adjectives use -운데: 춥다 becomes 추운데. Example: 날씨가 추운데 밖에 갈까요? (It is cold, but shall we go outside?)",
      level: 2,
      tags: ["connective", "TOPIK1"],
      structurePattern: "[Adjective stem](으)ㄴ데",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_eunde_01", fullSentence: "날씨가 추운데 밖에 갈까요?", sentenceWithBlank: "날씨가 ___ 밖에 갈까요?", answer: "추운데", englishHint: "It is cold, but shall we go outside?", order: 0 },
        { id: "le_eunde_02", fullSentence: "이 식당은 비싼데 음식이 맛있어요.", sentenceWithBlank: "이 식당은 ___ 음식이 맛있어요.", answer: "비싼데", englishHint: "This restaurant is expensive, but the food is good.", order: 1 },
      ],
      cards: [
        { id: "cc_eunde_01", fullSentence: "그 옷은 비싼데 예뻐요.", sentenceWithBlank: "그 옷은 ___ 예뻐요.", answer: "비싼데", alternateAnswers: [], vocabBaseForm: "-(으)ㄴ데", englishHint: "Those clothes are expensive but pretty.", introducedAtPosition: 82 },
        { id: "cc_eunde_02", fullSentence: "방은 작은데 아주 깨끗해요.", sentenceWithBlank: "방은 ___ 아주 깨끗해요.", answer: "작은데", alternateAnswers: [], vocabBaseForm: "-(으)ㄴ데", englishHint: "The room is small but very clean.", introducedAtPosition: 82 },
        { id: "cc_eunde_03", fullSentence: "오늘은 바쁜데 내일은 시간이 있어요.", sentenceWithBlank: "오늘은 ___ 내일은 시간이 있어요.", answer: "바쁜데", alternateAnswers: [], vocabBaseForm: "-(으)ㄴ데", englishHint: "I am busy today, but I have time tomorrow.", introducedAtPosition: 82 },
      ]
    },
    {
      id: "gp_inde",
      title: "-(이)ㄴ데",
      category: "connective",
      tense: null,
      register: null,
      hint: "but, and (noun background)",
      description: "Attach -인데 to a noun to introduce background information or a contrast. The same form is used after consonant- and vowel-ending nouns. Example: 오늘은 일요일인데 회사에 가요. (It is Sunday, but I am going to work.)",
      level: 2,
      tags: ["connective", "TOPIK1"],
      structurePattern: "[Noun]인데",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_inde_01", fullSentence: "오늘은 일요일인데 회사에 가요.", sentenceWithBlank: "오늘은 일요일___ 회사에 가요.", answer: "인데", englishHint: "It is Sunday, but I am going to work.", order: 0 },
        { id: "le_inde_02", fullSentence: "제 친구인데 한국어를 잘해요.", sentenceWithBlank: "제 친구___ 한국어를 잘해요.", answer: "인데", englishHint: "This is my friend, and they speak Korean well.", order: 1 },
      ],
      cards: [
        { id: "cc_inde_01", fullSentence: "내일 시험인데 아직 공부 안 했어요.", sentenceWithBlank: "내일 시험___ 아직 공부 안 했어요.", answer: "인데", alternateAnswers: [], vocabBaseForm: "-(이)ㄴ데", englishHint: "I have an exam tomorrow, but I haven't studied yet.", introducedAtPosition: 83 },
        { id: "cc_inde_02", fullSentence: "지금 점심시간인데 같이 먹을까요?", sentenceWithBlank: "지금 점심시간___ 같이 먹을까요?", answer: "인데", alternateAnswers: [], vocabBaseForm: "-(이)ㄴ데", englishHint: "It is lunchtime; shall we eat together?", introducedAtPosition: 83 },
        { id: "cc_inde_03", fullSentence: "여기는 도서관인데 아주 조용해요.", sentenceWithBlank: "여기는 도서관___ 아주 조용해요.", answer: "인데", alternateAnswers: [], vocabBaseForm: "-(이)ㄴ데", englishHint: "This is a library, and it is very quiet.", introducedAtPosition: 83 },
      ]
    },
    {
      id: "gp_eumyeonseo",
      title: "-(으)면서",
      category: "connective",
      tense: null,
      register: null,
      hint: "while doing",
      description: "Attach -으면서 after consonant-ending action verb stems or -면서 after vowel-ending stems. The two actions normally have the same subject and happen at the same time; ㄹ-final stems take -면서. Example: 음악을 들으면서 공부해요. (I study while listening to music.)",
      level: 2,
      tags: ["connective", "TOPIK1"],
      structurePattern: "[Action verb stem](으)면서",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_eumyeonseo_01", fullSentence: "음악을 들으면서 공부해요.", sentenceWithBlank: "음악을 들으___ 공부해요.", answer: "면서", englishHint: "I study while listening to music.", order: 0 },
        { id: "le_eumyeonseo_02", fullSentence: "밥을 먹으면서 텔레비전을 봐요.", sentenceWithBlank: "밥을 먹으___ 텔레비전을 봐요.", answer: "면서", englishHint: "I watch TV while eating.", order: 1 },
      ],
      cards: [
        { id: "cc_eumyeonseo_01", fullSentence: "커피를 마시면서 책을 읽어요.", sentenceWithBlank: "커피를 마시___ 책을 읽어요.", answer: "면서", alternateAnswers: [], vocabBaseForm: "-(으)면서", englishHint: "I read while drinking coffee.", introducedAtPosition: 84 },
        { id: "cc_eumyeonseo_02", fullSentence: "걸으면서 전화하지 마세요.", sentenceWithBlank: "걸으___ 전화하지 마세요.", answer: "면서", alternateAnswers: [], vocabBaseForm: "-(으)면서", englishHint: "Please do not talk on the phone while walking.", introducedAtPosition: 84 },
        { id: "cc_eumyeonseo_03", fullSentence: "친구하고 이야기하면서 걸어요.", sentenceWithBlank: "친구하고 이야기하___ 걸어요.", answer: "면서", alternateAnswers: [], vocabBaseForm: "-(으)면서", englishHint: "I walk while talking with a friend.", introducedAtPosition: 84 },
      ]
    },
  ]
};
