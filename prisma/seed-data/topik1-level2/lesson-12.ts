import type { LessonSeed } from '../types';

// Lesson 12 — Plans, Invitations and Purposes
// Grammar points (positions 51–55):
//   51. -(으)ㄹ까요?
//   52. -(으)ㄹ래요
//   53. -(으)려고 하다
//   54. -(으)러 가다
//   55. -(으)ㅂ시다
// Available: all corrected Level 1 grammar (positions 3–50); Level 2 is cumulative.
export const lesson12: LessonSeed = {
  lessonNumber: 12,
  title: "Plans, Invitations and Purposes",
  grammarPoints: [
    {
      id: "gp_eulkkayo",
      title: "-(으)ㄹ까요?",
      category: "proposal",
      tense: null,
      register: null,
      hint: "shall we, shall I",
      description: "Attach -을까요 after a consonant stem or -ㄹ까요 after a vowel stem; ㄹ-final stems take 까요 (살까요?). It proposes a shared action, offers help, or asks for the listener's opinion. Example: 같이 갈까요? (Shall we go together?)",
      level: 2,
      tags: ["proposal", "TOPIK1"],
      structurePattern: "[Verb stem](으)ㄹ까요?",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_eulkkayo_01", fullSentence: "같이 갈까요?", sentenceWithBlank: "같이 ___?", answer: "갈까요", englishHint: "Shall we go together?", order: 0 },
        { id: "le_eulkkayo_02", fullSentence: "무슨 영화를 볼까요?", sentenceWithBlank: "무슨 영화를 ___?", answer: "볼까요", englishHint: "What movie shall we watch?", order: 1 },
      ],
      cards: [
        { id: "cc_eulkkayo_01", fullSentence: "이제 출발할까요?", sentenceWithBlank: "이제 ___?", answer: "출발할까요", alternateAnswers: [], vocabBaseForm: "-(으)ㄹ까요?", englishHint: "Shall we leave now?", introducedAtPosition: 51 },
        { id: "cc_eulkkayo_02", fullSentence: "제가 문을 열까요?", sentenceWithBlank: "제가 문을 ___?", answer: "열까요", alternateAnswers: [], vocabBaseForm: "-(으)ㄹ까요?", englishHint: "Shall I open the door?", introducedAtPosition: 51 },
        { id: "cc_eulkkayo_03", fullSentence: "지금 점심을 먹을까요?", sentenceWithBlank: "지금 점심을 ___?", answer: "먹을까요", alternateAnswers: [], vocabBaseForm: "-(으)ㄹ까요?", englishHint: "Shall we eat lunch now?", introducedAtPosition: 51 },
      ]
    },
    {
      id: "gp_eullaeyo",
      title: "-(으)ㄹ래요",
      category: "intention",
      tense: null,
      register: null,
      hint: "want to, will (choice)",
      description: "Attach -을래요 to consonant stems or -ㄹ래요 to vowel stems; ㄹ-final stems take 래요 (살래요). It expresses a conversational choice or preference, not a neutral future prediction. Example: 저는 차를 마실래요. (I will have tea.)",
      level: 2,
      tags: ["intention", "TOPIK1"],
      structurePattern: "[Verb stem](으)ㄹ래요",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_eullaeyo_01", fullSentence: "저는 차를 마실래요.", sentenceWithBlank: "저는 차를 ___.", answer: "마실래요", englishHint: "I will have tea.", order: 0 },
        { id: "le_eullaeyo_02", fullSentence: "주말에 뭐 할래요?", sentenceWithBlank: "주말에 뭐 ___?", answer: "할래요", englishHint: "What do you want to do this weekend?", order: 1 },
      ],
      cards: [
        { id: "cc_eullaeyo_01", fullSentence: "저는 물을 마실래요.", sentenceWithBlank: "저는 물을 ___.", answer: "마실래요", alternateAnswers: [], vocabBaseForm: "-(으)ㄹ래요", englishHint: "I will have water.", introducedAtPosition: 52 },
        { id: "cc_eullaeyo_02", fullSentence: "이것을 살래요?", sentenceWithBlank: "이것을 ___?", answer: "살래요", alternateAnswers: [], vocabBaseForm: "-(으)ㄹ래요", englishHint: "Do you want to buy this?", introducedAtPosition: 52 },
        { id: "cc_eullaeyo_03", fullSentence: "저는 집에서 쉴래요.", sentenceWithBlank: "저는 집에서 ___.", answer: "쉴래요", alternateAnswers: [], vocabBaseForm: "-(으)ㄹ래요", englishHint: "I want to rest at home.", introducedAtPosition: 52 },
      ]
    },
    {
      id: "gp_euryeogo_hada",
      title: "-(으)려고 하다",
      category: "intention",
      tense: null,
      register: null,
      hint: "plan to, intend to",
      description: "Attach -으려고 to consonant stems or -려고 to vowel stems, then 하다; ㄹ-final stems take 려고 (살려고 해요). It describes an intention or plan, not a completed action. Example: 내일 한국어를 공부하려고 해요. (I plan to study Korean tomorrow.)",
      level: 2,
      tags: ["intention", "TOPIK1"],
      structurePattern: "[Verb stem](으)려고 하다",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_euryeogo_hada_01", fullSentence: "내일 한국어를 공부하려고 해요.", sentenceWithBlank: "내일 한국어를 ___.", answer: "공부하려고 해요", englishHint: "I plan to study Korean tomorrow.", order: 0 },
        { id: "le_euryeogo_hada_02", fullSentence: "주말에 친구를 만나려고 해요.", sentenceWithBlank: "주말에 친구를 ___.", answer: "만나려고 해요", englishHint: "I plan to meet a friend this weekend.", order: 1 },
      ],
      cards: [
        { id: "cc_euryeogo_hada_01", fullSentence: "오늘 장을 보려고 해요.", sentenceWithBlank: "오늘 장을 ___.", answer: "보려고 해요", alternateAnswers: [], vocabBaseForm: "-(으)려고 하다", englishHint: "I'm planning to buy groceries today.", introducedAtPosition: 53 },
        { id: "cc_euryeogo_hada_02", fullSentence: "저녁에 책을 읽으려고 해요.", sentenceWithBlank: "저녁에 책을 ___.", answer: "읽으려고 해요", alternateAnswers: [], vocabBaseForm: "-(으)려고 하다", englishHint: "I plan to read a book tonight.", introducedAtPosition: 53 },
        { id: "cc_euryeogo_hada_03", fullSentence: "내년에 한국에 가려고 해요.", sentenceWithBlank: "내년에 한국에 ___.", answer: "가려고 해요", alternateAnswers: [], vocabBaseForm: "-(으)려고 하다", englishHint: "I plan to go to Korea next year.", introducedAtPosition: 53 },
      ]
    },
    {
      id: "gp_eureo_gada",
      title: "-(으)러 가다",
      category: "purpose",
      tense: null,
      register: null,
      hint: "go or come to do",
      description: "Attach -으러 to a consonant-ending action verb stem or -러 to a vowel-ending stem before 가다 or 오다; ㄹ-final stems take 러 (놀러 가요). It gives the purpose of going or coming. Example: 밥을 먹으러 가요. (I am going to eat.)",
      level: 2,
      tags: ["purpose", "TOPIK1"],
      structurePattern: "[Verb stem](으)러 가다 / 오다",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_eureo_gada_01", fullSentence: "밥을 먹으러 가요.", sentenceWithBlank: "밥을 ___.", answer: "먹으러 가요", englishHint: "I am going to eat.", order: 0 },
        { id: "le_eureo_gada_02", fullSentence: "친구를 만나러 가요.", sentenceWithBlank: "친구를 ___.", answer: "만나러 가요", englishHint: "I am going to meet a friend.", order: 1 },
      ],
      cards: [
        { id: "cc_eureo_gada_01", fullSentence: "커피를 마시러 가요.", sentenceWithBlank: "커피를 ___.", answer: "마시러 가요", alternateAnswers: [], vocabBaseForm: "-(으)러 가다", englishHint: "I'm going to get coffee.", introducedAtPosition: 54 },
        { id: "cc_eureo_gada_02", fullSentence: "책을 사러 갔어요.", sentenceWithBlank: "책을 ___.", answer: "사러 갔어요", alternateAnswers: [], vocabBaseForm: "-(으)러 가다", englishHint: "I went to buy a book.", introducedAtPosition: 54 },
        { id: "cc_eureo_gada_03", fullSentence: "수영을 하러 가요.", sentenceWithBlank: "수영을 ___.", answer: "하러 가요", alternateAnswers: [], vocabBaseForm: "-(으)러 가다", englishHint: "I am going swimming.", introducedAtPosition: 54 },
      ]
    },
    {
      id: "gp_eupsida",
      title: "-(으)ㅂ시다",
      category: "proposal",
      tense: null,
      register: null,
      hint: "let us (formal)",
      description: "Attach -읍시다 after consonant-ending stems or -ㅂ시다 after vowel-ending stems; final ㄹ drops (살다 → 삽시다). This makes a formal suggestion to do something together. Example: 이제 갑시다. (Let us go now.)",
      level: 2,
      tags: ["proposal", "TOPIK1"],
      structurePattern: "[Verb stem](으)ㅂ시다",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_eupsida_01", fullSentence: "이제 갑시다.", sentenceWithBlank: "이제 ___.", answer: "갑시다", englishHint: "Let us go now.", order: 0 },
        { id: "le_eupsida_02", fullSentence: "같이 점심을 먹읍시다.", sentenceWithBlank: "같이 점심을 ___.", answer: "먹읍시다", englishHint: "Let us eat lunch together.", order: 1 },
      ],
      cards: [
        { id: "cc_eupsida_01", fullSentence: "같이 공부합시다.", sentenceWithBlank: "같이 ___.", answer: "공부합시다", alternateAnswers: [], vocabBaseForm: "-(으)ㅂ시다", englishHint: "Let's study together.", introducedAtPosition: 55 },
        { id: "cc_eupsida_02", fullSentence: "내일 다시 만납시다.", sentenceWithBlank: "내일 다시 ___.", answer: "만납시다", alternateAnswers: [], vocabBaseForm: "-(으)ㅂ시다", englishHint: "Let us meet again tomorrow.", introducedAtPosition: 55 },
        { id: "cc_eupsida_03", fullSentence: "여기에서 잠깐 쉽시다.", sentenceWithBlank: "여기에서 잠깐 ___.", answer: "쉽시다", alternateAnswers: [], vocabBaseForm: "-(으)ㅂ시다", englishHint: "Let us rest here for a moment.", introducedAtPosition: 55 },
      ]
    },
  ]
};
