import type { LessonSeed } from '../types';

// Lesson 20 — Comparisons and Everyday Quantities
// Grammar points (positions 86–90):
//   86. 보다
//   87. 처럼
//   88. (으)로
//   89. 마다
//   90. 밖에
// Available: all corrected Level 1 grammar (positions 1–48); Level 2 is cumulative.
export const lesson20: LessonSeed = {
  lessonNumber: 20,
  title: "Comparisons and Everyday Quantities",
  grammarPoints: [
    {
      id: "gp_boda_compare",
      title: "보다",
      category: "comparison",
      tense: null,
      register: null,
      hint: "than",
      description: "Attach 보다 to the thing used as the comparison standard. The other thing is often marked by 이/가 or 은/는: 버스보다 지하철이 빨라요. Example: 버스보다 지하철이 빨라요. (The subway is faster than the bus.)",
      level: 2,
      tags: ["comparison", "TOPIK1"],
      structurePattern: "[Noun]보다 + [comparison]",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_boda_compare_01", fullSentence: "버스보다 지하철이 빨라요.", sentenceWithBlank: "버스___ 지하철이 빨라요.", answer: "보다", englishHint: "The subway is faster than the bus.", order: 0 },
        { id: "le_boda_compare_02", fullSentence: "오늘은 어제보다 더 추워요.", sentenceWithBlank: "오늘은 어제___ 더 추워요.", answer: "보다", englishHint: "Today is colder than yesterday.", order: 1 },
      ],
      cards: [
        { id: "cc_boda_compare_01", fullSentence: "오늘은 어제보다 따뜻해요.", sentenceWithBlank: "오늘은 어제___ 따뜻해요.", answer: "보다", alternateAnswers: [], vocabBaseForm: "보다", englishHint: "It's warmer today than yesterday.", introducedAtPosition: 86 },
        { id: "cc_boda_compare_02", fullSentence: "저는 커피보다 차를 더 좋아해요.", sentenceWithBlank: "저는 커피___ 차를 더 좋아해요.", answer: "보다", alternateAnswers: [], vocabBaseForm: "보다", englishHint: "I prefer tea to coffee.", introducedAtPosition: 86 },
        { id: "cc_boda_compare_03", fullSentence: "이 가방은 저것보다 가벼워요.", sentenceWithBlank: "이 가방은 저것___ 가벼워요.", answer: "보다", alternateAnswers: [], vocabBaseForm: "보다", englishHint: "This bag is lighter than that one.", introducedAtPosition: 86 },
      ]
    },
    {
      id: "gp_cheoreom",
      title: "처럼",
      category: "comparison",
      tense: null,
      register: null,
      hint: "like, as",
      description: "Attach 처럼 directly to a noun to mean \"like\" or \"in the same way as.\" It compares manner or resemblance, not a numerical difference. Example: 그 사람은 가수처럼 노래해요. (That person sings like a singer.)",
      level: 2,
      tags: ["comparison", "TOPIK1"],
      structurePattern: "[Noun]처럼",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_cheoreom_01", fullSentence: "그 사람은 가수처럼 노래해요.", sentenceWithBlank: "그 사람은 가수___ 노래해요.", answer: "처럼", englishHint: "That person sings like a singer.", order: 0 },
        { id: "le_cheoreom_02", fullSentence: "아이처럼 웃어요.", sentenceWithBlank: "아이___ 웃어요.", answer: "처럼", englishHint: "She laughs like a child.", order: 1 },
      ],
      cards: [
        { id: "cc_cheoreom_01", fullSentence: "선생님처럼 천천히 말해요.", sentenceWithBlank: "선생님___ 천천히 말해요.", answer: "처럼", alternateAnswers: [], vocabBaseForm: "처럼", englishHint: "I speak slowly, like the teacher.", introducedAtPosition: 87 },
        { id: "cc_cheoreom_02", fullSentence: "저도 친구처럼 한국어를 잘하고 싶어요.", sentenceWithBlank: "저도 친구___ 한국어를 잘하고 싶어요.", answer: "처럼", alternateAnswers: [], vocabBaseForm: "처럼", englishHint: "I want to speak Korean well like my friend.", introducedAtPosition: 87 },
        { id: "cc_cheoreom_03", fullSentence: "오늘도 어제처럼 바빠요.", sentenceWithBlank: "오늘도 어제___ 바빠요.", answer: "처럼", alternateAnswers: [], vocabBaseForm: "처럼", englishHint: "I am busy today, just like yesterday.", introducedAtPosition: 87 },
      ]
    },
    {
      id: "gp_euro_means",
      title: "(으)로",
      category: "particle",
      tense: null,
      register: null,
      hint: "by, using, toward",
      description: "Attach -으로 after consonants except ㄹ, and -로 after vowels or ㄹ. It marks means, instrument, or direction: 버스로 가요 means \"I go by bus.\" Example: 학교에 버스로 가요. (I go to school by bus.)",
      level: 2,
      tags: ["particle", "TOPIK1"],
      structurePattern: "[Noun](으)로",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_euro_means_01", fullSentence: "버스로 학교에 가요.", sentenceWithBlank: "버스___ 학교에 가요.", answer: "로", englishHint: "I go to school by bus.", order: 0 },
        { id: "le_euro_means_02", fullSentence: "연필로 이름을 써요.", sentenceWithBlank: "연필___ 이름을 써요.", answer: "로", englishHint: "I write my name with a pencil.", order: 1 },
      ],
      cards: [
        { id: "cc_euro_means_01", fullSentence: "서울에 기차로 가요.", sentenceWithBlank: "서울에 기차___ 가요.", answer: "로", alternateAnswers: [], vocabBaseForm: "(으)로", englishHint: "I go to Seoul by train.", introducedAtPosition: 88 },
        { id: "cc_euro_means_02", fullSentence: "오른쪽으로 가세요.", sentenceWithBlank: "오른쪽___ 가세요.", answer: "으로", alternateAnswers: [], vocabBaseForm: "(으)로", englishHint: "Please go to the right.", introducedAtPosition: 88 },
        { id: "cc_euro_means_03", fullSentence: "지하철로 회사에 가요.", sentenceWithBlank: "지하철___ 회사에 가요.", answer: "로", alternateAnswers: [], vocabBaseForm: "(으)로", englishHint: "I take the subway to work.", introducedAtPosition: 88 },
      ]
    },
    {
      id: "gp_mada",
      title: "마다",
      category: "frequency",
      tense: null,
      register: null,
      hint: "every, each",
      description: "Attach 마다 to a noun for recurring time periods or each member of a group. It does not change according to the final consonant. Example: 저는 아침마다 운동해요. (I exercise every morning.)",
      level: 2,
      tags: ["frequency", "TOPIK1"],
      structurePattern: "[Noun]마다",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_mada_01", fullSentence: "저는 아침마다 운동해요.", sentenceWithBlank: "저는 아침___ 운동해요.", answer: "마다", englishHint: "I exercise every morning.", order: 0 },
        { id: "le_mada_02", fullSentence: "주말마다 친구를 만나요.", sentenceWithBlank: "주말___ 친구를 만나요.", answer: "마다", englishHint: "I meet friends every weekend.", order: 1 },
      ],
      cards: [
        { id: "cc_mada_01", fullSentence: "수업마다 숙제가 있어요.", sentenceWithBlank: "수업___ 숙제가 있어요.", answer: "마다", alternateAnswers: [], vocabBaseForm: "마다", englishHint: "Every class has homework.", introducedAtPosition: 89 },
        { id: "cc_mada_02", fullSentence: "이 버스는 정류장마다 서요.", sentenceWithBlank: "이 버스는 정류장___ 서요.", answer: "마다", alternateAnswers: [], vocabBaseForm: "마다", englishHint: "This bus stops at every stop.", introducedAtPosition: 89 },
        { id: "cc_mada_03", fullSentence: "날마다 한국어를 공부해요.", sentenceWithBlank: "날___ 한국어를 공부해요.", answer: "마다", alternateAnswers: [], vocabBaseForm: "마다", englishHint: "I study Korean every day.", introducedAtPosition: 89 },
      ]
    },
    {
      id: "gp_bakke",
      title: "밖에",
      category: "limitation",
      tense: null,
      register: null,
      hint: "only, no more than",
      description: "Attach 밖에 to a noun meaning \"nothing other than.\" In this limiting use it requires a negative predicate such as 없다, 안, or 못. Example: 지갑에 천 원밖에 없어요. (I only have 1,000 won in my wallet.)",
      level: 2,
      tags: ["limitation", "TOPIK1"],
      structurePattern: "[Noun]밖에 + [negative predicate]",
      notes: [],
      relatedPointIds: [],
      lessonExamples: [
        { id: "le_bakke_01", fullSentence: "지갑에 천 원밖에 없어요.", sentenceWithBlank: "지갑에 천 원___ 없어요.", answer: "밖에", englishHint: "I only have 1,000 won in my wallet.", order: 0 },
        { id: "le_bakke_02", fullSentence: "시간이 십 분밖에 없어요.", sentenceWithBlank: "시간이 십 분___ 없어요.", answer: "밖에", englishHint: "I only have ten minutes.", order: 1 },
      ],
      cards: [
        { id: "cc_bakke_01", fullSentence: "여기에는 물밖에 없어요.", sentenceWithBlank: "여기에는 물___ 없어요.", answer: "밖에", alternateAnswers: [], vocabBaseForm: "밖에", englishHint: "There is only water here.", introducedAtPosition: 90 },
        { id: "cc_bakke_02", fullSentence: "오늘은 물밖에 안 마셨어요.", sentenceWithBlank: "오늘은 물___ 안 마셨어요.", answer: "밖에", alternateAnswers: [], vocabBaseForm: "밖에", englishHint: "I only drank water today.", introducedAtPosition: 90 },
        { id: "cc_bakke_03", fullSentence: "저는 한국어밖에 못 해요.", sentenceWithBlank: "저는 한국어___ 못 해요.", answer: "밖에", alternateAnswers: [], vocabBaseForm: "밖에", englishHint: "I can only speak Korean.", introducedAtPosition: 90 },
      ]
    },
  ]
};
