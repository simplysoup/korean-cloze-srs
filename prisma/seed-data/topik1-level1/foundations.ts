import type { GrammarPointSeed } from '../types';

/** Beginner foundations inserted into Level 1. Stable IDs; positions match curriculum order. */
export const foundationPoints: Record<string, GrammarPointSeed> = {
  "gp_anida": {
    "id": "gp_anida",
    "title": "아니에요",
    "category": "copula",
    "tense": null,
    "register": null,
    "hint": "not a noun",
    "description": "With nouns, use N이/가 아니에요 to say someone or something is not that noun. A consonant-ending noun takes 이, a vowel-ending noun takes 가; write 아니에요, not 아니예요.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "copula"
    ],
    "structurePattern": "[Noun]이/가 아니에요",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "For noun negation, use 아니에요, not 안 + noun."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_anida_01",
        "fullSentence": "저는 학생이 아니에요.",
        "sentenceWithBlank": "저는 학생이 ___.",
        "answer": "아니에요",
        "englishHint": "I'm not a student.",
        "order": 0
      },
      {
        "id": "le_anida_02",
        "fullSentence": "이것은 커피가 아니에요.",
        "sentenceWithBlank": "이것은 커피가 ___.",
        "answer": "아니에요",
        "englishHint": "This isn't coffee.",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_anida_01",
        "fullSentence": "저는 의사가 아니에요.",
        "sentenceWithBlank": "저는 의사가 ___.",
        "answer": "아니에요",
        "englishHint": "I'm not a doctor.",
        "alternateAnswers": [],
        "vocabBaseForm": "아니에요",
        "introducedAtPosition": 2
      },
      {
        "id": "cc_anida_02",
        "fullSentence": "그것은 책이 아니에요.",
        "sentenceWithBlank": "그것은 책이 ___.",
        "answer": "아니에요",
        "englishHint": "That isn't a book.",
        "alternateAnswers": [],
        "vocabBaseForm": "아니에요",
        "introducedAtPosition": 2
      },
      {
        "id": "cc_anida_03",
        "fullSentence": "오늘은 금요일이 아니에요.",
        "sentenceWithBlank": "오늘은 금요일이 ___.",
        "answer": "아니에요",
        "englishHint": "Today isn't Friday.",
        "alternateAnswers": [],
        "vocabBaseForm": "아니에요",
        "introducedAtPosition": 2
      }
    ]
  },
  "gp_mwo": {
    "id": "gp_mwo",
    "title": "뭐/무엇",
    "category": "question word",
    "tense": null,
    "register": null,
    "hint": "what",
    "description": "뭐 means 'what' in everyday polite questions; 무엇 is more formal. The rest of the sentence usually keeps its ordinary question-ending form: 이것은 뭐예요? means 'What is this?'.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "question word"
    ],
    "structurePattern": "뭐 / 무엇 + [sentence]",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "무엇 is more formal; 뭐 is the usual spoken word."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_mwo_01",
        "fullSentence": "이것은 뭐예요?",
        "sentenceWithBlank": "이것은 ___예요?",
        "answer": "뭐",
        "englishHint": "What is this?",
        "order": 0
      },
      {
        "id": "le_mwo_02",
        "fullSentence": "이름이 뭐예요?",
        "sentenceWithBlank": "이름이 ___예요?",
        "answer": "뭐",
        "englishHint": "What's the name?",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_mwo_01",
        "fullSentence": "그것은 뭐예요?",
        "sentenceWithBlank": "그것은 ___예요?",
        "answer": "뭐",
        "englishHint": "What is that?",
        "alternateAnswers": [],
        "vocabBaseForm": "뭐/무엇",
        "introducedAtPosition": 4
      },
      {
        "id": "cc_mwo_02",
        "fullSentence": "저것은 뭐예요?",
        "sentenceWithBlank": "저것은 ___예요?",
        "answer": "뭐",
        "englishHint": "What is that over there?",
        "alternateAnswers": [],
        "vocabBaseForm": "뭐/무엇",
        "introducedAtPosition": 4
      },
      {
        "id": "cc_mwo_03",
        "fullSentence": "그 사람의 이름은 뭐예요?",
        "sentenceWithBlank": "그 사람의 이름은 ___예요?",
        "answer": "뭐",
        "englishHint": "What's that person's name?",
        "alternateAnswers": [],
        "vocabBaseForm": "뭐/무엇",
        "introducedAtPosition": 4
      }
    ]
  },
  "gp_nugu": {
    "id": "gp_nugu",
    "title": "누구",
    "category": "question word",
    "tense": null,
    "register": null,
    "hint": "who",
    "description": "누구 asks about a person's identity. With the subject marker 가, 누구 contracts to 누가: 누가 선생님이에요? means 'Who is the teacher?'.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "question word"
    ],
    "structurePattern": "누구 / 누가 + [question]",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "누구 + 가 contracts to 누가; 누구가 is not standard."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_nugu_01",
        "fullSentence": "저 사람은 누구예요?",
        "sentenceWithBlank": "저 사람은 ___예요?",
        "answer": "누구",
        "englishHint": "Who is that person?",
        "order": 0
      },
      {
        "id": "le_nugu_02",
        "fullSentence": "누가 선생님이에요?",
        "sentenceWithBlank": "___ 선생님이에요?",
        "answer": "누가",
        "englishHint": "Who is the teacher?",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_nugu_01",
        "fullSentence": "이 사람은 누구예요?",
        "sentenceWithBlank": "이 사람은 ___예요?",
        "answer": "누구",
        "englishHint": "Who is this person?",
        "alternateAnswers": [],
        "vocabBaseForm": "누구",
        "introducedAtPosition": 5
      },
      {
        "id": "cc_nugu_02",
        "fullSentence": "누가 학생이에요?",
        "sentenceWithBlank": "___ 학생이에요?",
        "answer": "누가",
        "englishHint": "Who is the student?",
        "alternateAnswers": [],
        "vocabBaseForm": "누구",
        "introducedAtPosition": 5
      },
      {
        "id": "cc_nugu_03",
        "fullSentence": "그분은 누구예요?",
        "sentenceWithBlank": "그분은 ___예요?",
        "answer": "누구",
        "englishHint": "Who is that person?",
        "alternateAnswers": [],
        "vocabBaseForm": "누구",
        "introducedAtPosition": 5
      }
    ]
  },
  "gp_wae": {
    "id": "gp_wae",
    "title": "왜",
    "category": "question word",
    "tense": null,
    "register": null,
    "hint": "why",
    "description": "왜 asks for a reason: 왜 안 가요? means 'Why aren't you going?'. Put 왜 before the action or description being questioned.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "question word"
    ],
    "structurePattern": "왜 + [question]",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "A full sentence can answer 왜 even before reason connectors are introduced."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_wae_01",
        "fullSentence": "왜 안 가요?",
        "sentenceWithBlank": "___ 안 가요?",
        "answer": "왜",
        "englishHint": "Why aren't you going?",
        "order": 0
      },
      {
        "id": "le_wae_02",
        "fullSentence": "왜 공부해요?",
        "sentenceWithBlank": "___ 공부해요?",
        "answer": "왜",
        "englishHint": "Why are you studying?",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_wae_01",
        "fullSentence": "왜 안 먹어요?",
        "sentenceWithBlank": "___ 안 먹어요?",
        "answer": "왜",
        "englishHint": "Why aren't you eating?",
        "alternateAnswers": [],
        "vocabBaseForm": "왜",
        "introducedAtPosition": 20
      },
      {
        "id": "cc_wae_02",
        "fullSentence": "오늘은 왜 쉬어요?",
        "sentenceWithBlank": "오늘은 ___ 쉬어요?",
        "answer": "왜",
        "englishHint": "Why are you resting today?",
        "alternateAnswers": [],
        "vocabBaseForm": "왜",
        "introducedAtPosition": 20
      },
      {
        "id": "cc_wae_03",
        "fullSentence": "왜 못 와요?",
        "sentenceWithBlank": "___ 못 와요?",
        "answer": "왜",
        "englishHint": "Why can't you come?",
        "alternateAnswers": [],
        "vocabBaseForm": "왜",
        "introducedAtPosition": 20
      }
    ]
  },
  "gp_eotteoke": {
    "id": "gp_eotteoke",
    "title": "어떻게",
    "category": "question word",
    "tense": null,
    "register": null,
    "hint": "how",
    "description": "어떻게 asks how to do something or how an action happens: 이거 어떻게 해요? means 'How do I do this?'. Do not confuse the adverb 어떻게 with 어떡해 ('What should I do?').",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "question word"
    ],
    "structurePattern": "어떻게 + [action]",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "어떻게 is 'how'; 어떡해 is a contraction of 어떻게 해."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_eotteoke_01",
        "fullSentence": "이거 어떻게 해요?",
        "sentenceWithBlank": "이거 ___ 해요?",
        "answer": "어떻게",
        "englishHint": "How do I do this?",
        "order": 0
      },
      {
        "id": "le_eotteoke_02",
        "fullSentence": "한국어를 어떻게 공부해요?",
        "sentenceWithBlank": "한국어를 ___ 공부해요?",
        "answer": "어떻게",
        "englishHint": "How do you study Korean?",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_eotteoke_01",
        "fullSentence": "이름을 어떻게 써요?",
        "sentenceWithBlank": "이름을 ___ 써요?",
        "answer": "어떻게",
        "englishHint": "How do you write the name?",
        "alternateAnswers": [],
        "vocabBaseForm": "어떻게",
        "introducedAtPosition": 21
      },
      {
        "id": "cc_eotteoke_02",
        "fullSentence": "이거 어떻게 먹어요?",
        "sentenceWithBlank": "이거 ___ 먹어요?",
        "answer": "어떻게",
        "englishHint": "How do you eat this?",
        "alternateAnswers": [],
        "vocabBaseForm": "어떻게",
        "introducedAtPosition": 21
      },
      {
        "id": "cc_eotteoke_03",
        "fullSentence": "집에서 어떻게 공부해요?",
        "sentenceWithBlank": "집에서 ___ 공부해요?",
        "answer": "어떻게",
        "englishHint": "How do you study at home?",
        "alternateAnswers": [],
        "vocabBaseForm": "어떻게",
        "introducedAtPosition": 21
      }
    ]
  },
  "gp_eodi": {
    "id": "gp_eodi",
    "title": "어디",
    "category": "question word",
    "tense": null,
    "register": null,
    "hint": "where",
    "description": "어디 means 'where'. 어디에 asks about a destination or location, and 어디에서 asks where an action happens: 어디에 가요? means 'Where are you going?'.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "question word"
    ],
    "structurePattern": "어디 / 어디에 / 어디에서",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "Use 어디에 for a destination and 어디에서 for the location of an action."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_eodi_01",
        "fullSentence": "여기는 어디예요?",
        "sentenceWithBlank": "여기는 ___예요?",
        "answer": "어디",
        "englishHint": "Where is this place?",
        "order": 0
      },
      {
        "id": "le_eodi_02",
        "fullSentence": "집이 어디예요?",
        "sentenceWithBlank": "집이 ___예요?",
        "answer": "어디",
        "englishHint": "Where is your home?",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_eodi_01",
        "fullSentence": "학교가 어디예요?",
        "sentenceWithBlank": "학교가 ___예요?",
        "answer": "어디",
        "englishHint": "Where is the school?",
        "alternateAnswers": [],
        "vocabBaseForm": "어디",
        "introducedAtPosition": 25
      },
      {
        "id": "cc_eodi_02",
        "fullSentence": "어디에 가요?",
        "sentenceWithBlank": "___에 가요?",
        "answer": "어디",
        "englishHint": "Where are you going?",
        "alternateAnswers": [],
        "vocabBaseForm": "어디",
        "introducedAtPosition": 25
      },
      {
        "id": "cc_eodi_03",
        "fullSentence": "어디에서 공부해요?",
        "sentenceWithBlank": "___에서 공부해요?",
        "answer": "어디",
        "englishHint": "Where do you study?",
        "alternateAnswers": [],
        "vocabBaseForm": "어디",
        "introducedAtPosition": 25
      }
    ]
  },
  "gp_eonje": {
    "id": "gp_eonje",
    "title": "언제",
    "category": "question word",
    "tense": null,
    "register": null,
    "hint": "when",
    "description": "언제 asks when something happens: 언제 와요? means 'When are you coming?'. An answer can give a day or a clock time.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "question word"
    ],
    "structurePattern": "언제 + [time question]",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "For a day or time, time particle 에 may be used in the answer."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_eonje_01",
        "fullSentence": "언제 와요?",
        "sentenceWithBlank": "___ 와요?",
        "answer": "언제",
        "englishHint": "When are you coming?",
        "order": 0
      },
      {
        "id": "le_eonje_02",
        "fullSentence": "언제 공부해요?",
        "sentenceWithBlank": "___ 공부해요?",
        "answer": "언제",
        "englishHint": "When do you study?",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_eonje_01",
        "fullSentence": "언제 출발해요?",
        "sentenceWithBlank": "___ 출발해요?",
        "answer": "언제",
        "englishHint": "When are you leaving?",
        "alternateAnswers": [],
        "vocabBaseForm": "언제",
        "introducedAtPosition": 30
      },
      {
        "id": "cc_eonje_02",
        "fullSentence": "언제 집에 가요?",
        "sentenceWithBlank": "___ 집에 가요?",
        "answer": "언제",
        "englishHint": "When are you going home?",
        "alternateAnswers": [],
        "vocabBaseForm": "언제",
        "introducedAtPosition": 30
      },
      {
        "id": "cc_eonje_03",
        "fullSentence": "학교에 언제 가요?",
        "sentenceWithBlank": "학교에 ___ 가요?",
        "answer": "언제",
        "englishHint": "When do you go to school?",
        "alternateAnswers": [],
        "vocabBaseForm": "언제",
        "introducedAtPosition": 30
      }
    ]
  },
  "gp_sino_numbers": {
    "id": "gp_sino_numbers",
    "title": "한자어 수",
    "category": "number",
    "tense": null,
    "register": null,
    "hint": "Sino-Korean numbers",
    "description": "Use Sino-Korean numbers for money, minutes, dates and numbered labels. For example, 삼천 원 means 3,000 won; in print the price is usually written 3,000원.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "number"
    ],
    "structurePattern": "일, 이, 삼 ... 십, 백, 천",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "일=1, 이=2, 삼=3, 사=4, 오=5, 육=6, 칠=7, 팔=8, 구=9, 십=10."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_sino_numbers_01",
        "fullSentence": "삼천 원이에요.",
        "sentenceWithBlank": "___ 원이에요.",
        "answer": "삼천",
        "englishHint": "It's 3,000 won.",
        "order": 0
      },
      {
        "id": "le_sino_numbers_02",
        "fullSentence": "오천 원이에요.",
        "sentenceWithBlank": "___ 원이에요.",
        "answer": "오천",
        "englishHint": "It's 5,000 won.",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_sino_numbers_01",
        "fullSentence": "이천 원이에요.",
        "sentenceWithBlank": "___ 원이에요.",
        "answer": "이천",
        "englishHint": "It's 2,000 won.",
        "alternateAnswers": [],
        "vocabBaseForm": "한자어 수",
        "introducedAtPosition": 31
      },
      {
        "id": "cc_sino_numbers_02",
        "fullSentence": "천 원이에요.",
        "sentenceWithBlank": "___ 원이에요.",
        "answer": "천",
        "englishHint": "It's 1,000 won.",
        "alternateAnswers": [],
        "vocabBaseForm": "한자어 수",
        "introducedAtPosition": 31
      },
      {
        "id": "cc_sino_numbers_03",
        "fullSentence": "육천 원이에요.",
        "sentenceWithBlank": "___ 원이에요.",
        "answer": "육천",
        "englishHint": "It's 6,000 won.",
        "alternateAnswers": [],
        "vocabBaseForm": "한자어 수",
        "introducedAtPosition": 31
      }
    ]
  },
  "gp_native_numbers": {
    "id": "gp_native_numbers",
    "title": "고유어 수",
    "category": "number",
    "tense": null,
    "register": null,
    "hint": "native Korean numbers",
    "description": "Native Korean numbers are used for many everyday quantities and clock hours. When counting before a noun counter, 하나, 둘, 셋, 넷 usually shorten to 한, 두, 세, 네.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "number"
    ],
    "structurePattern": "하나, 둘, 셋 ... / 한, 두, 세 + counter",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "The standalone forms are 하나, 둘, 셋, 넷. Before counters use 한, 두, 세, 네."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_native_numbers_01",
        "fullSentence": "하나 있어요.",
        "sentenceWithBlank": "___ 있어요.",
        "answer": "하나",
        "englishHint": "There is one.",
        "order": 0
      },
      {
        "id": "le_native_numbers_02",
        "fullSentence": "둘 있어요.",
        "sentenceWithBlank": "___ 있어요.",
        "answer": "둘",
        "englishHint": "There are two.",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_native_numbers_01",
        "fullSentence": "셋 있어요.",
        "sentenceWithBlank": "___ 있어요.",
        "answer": "셋",
        "englishHint": "There are three.",
        "alternateAnswers": [],
        "vocabBaseForm": "고유어 수",
        "introducedAtPosition": 32
      },
      {
        "id": "cc_native_numbers_02",
        "fullSentence": "넷 있어요.",
        "sentenceWithBlank": "___ 있어요.",
        "answer": "넷",
        "englishHint": "There are four.",
        "alternateAnswers": [],
        "vocabBaseForm": "고유어 수",
        "introducedAtPosition": 32
      },
      {
        "id": "cc_native_numbers_03",
        "fullSentence": "다섯 있어요.",
        "sentenceWithBlank": "___ 있어요.",
        "answer": "다섯",
        "englishHint": "There are five.",
        "alternateAnswers": [],
        "vocabBaseForm": "고유어 수",
        "introducedAtPosition": 32
      }
    ]
  },
  "gp_si_hour": {
    "id": "gp_si_hour",
    "title": "시",
    "category": "time",
    "tense": null,
    "register": null,
    "hint": "clock hours",
    "description": "Use native Korean numbers with 시 for clock hours: 두 시 means 2 o'clock. Add 에 to say when an action happens: 세 시에 가요.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "time"
    ],
    "structurePattern": "[Native number] 시(에)",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "Hours use native numbers (두 시), while minutes use Sino-Korean numbers (이 분)."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_si_hour_01",
        "fullSentence": "지금 두 시예요.",
        "sentenceWithBlank": "지금 ___예요.",
        "answer": "두 시",
        "englishHint": "It's two o'clock now.",
        "order": 0
      },
      {
        "id": "le_si_hour_02",
        "fullSentence": "세 시에 가요.",
        "sentenceWithBlank": "___에 가요.",
        "answer": "세 시",
        "englishHint": "I'm going at three o'clock.",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_si_hour_01",
        "fullSentence": "지금 네 시예요.",
        "sentenceWithBlank": "지금 ___예요.",
        "answer": "네 시",
        "englishHint": "It's four o'clock now.",
        "alternateAnswers": [],
        "vocabBaseForm": "시",
        "introducedAtPosition": 33
      },
      {
        "id": "cc_si_hour_02",
        "fullSentence": "다섯 시에 와요.",
        "sentenceWithBlank": "___에 와요.",
        "answer": "다섯 시",
        "englishHint": "I'm coming at five o'clock.",
        "alternateAnswers": [],
        "vocabBaseForm": "시",
        "introducedAtPosition": 33
      },
      {
        "id": "cc_si_hour_03",
        "fullSentence": "아홉 시에 학교에 가요.",
        "sentenceWithBlank": "___에 학교에 가요.",
        "answer": "아홉 시",
        "englishHint": "I go to school at nine o'clock.",
        "alternateAnswers": [],
        "vocabBaseForm": "시",
        "introducedAtPosition": 33
      }
    ]
  },
  "gp_bun_minute": {
    "id": "gp_bun_minute",
    "title": "분 (minutes)",
    "category": "time",
    "tense": null,
    "register": null,
    "hint": "clock minutes",
    "description": "Use Sino-Korean numbers with 분 to say minutes: 두 시 십 분 means 2:10. Clock hours use native numbers, but minutes use Sino-Korean numbers.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "time"
    ],
    "structurePattern": "[Sino number] 분",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "The minute counter 분 and the honorific person counter 분 have different uses."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_bun_minute_01",
        "fullSentence": "두 시 십 분이에요.",
        "sentenceWithBlank": "두 시 ___이에요.",
        "answer": "십 분",
        "englishHint": "It's 2:10.",
        "order": 0
      },
      {
        "id": "le_bun_minute_02",
        "fullSentence": "세 시 이십 분이에요.",
        "sentenceWithBlank": "세 시 ___이에요.",
        "answer": "이십 분",
        "englishHint": "It's 3:20.",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_bun_minute_01",
        "fullSentence": "한 시 삼십 분이에요.",
        "sentenceWithBlank": "한 시 ___이에요.",
        "answer": "삼십 분",
        "englishHint": "It's 1:30.",
        "alternateAnswers": [],
        "vocabBaseForm": "분 (minutes)",
        "introducedAtPosition": 34
      },
      {
        "id": "cc_bun_minute_02",
        "fullSentence": "다섯 시 오 분이에요.",
        "sentenceWithBlank": "다섯 시 ___이에요.",
        "answer": "오 분",
        "englishHint": "It's 5:05.",
        "alternateAnswers": [],
        "vocabBaseForm": "분 (minutes)",
        "introducedAtPosition": 34
      },
      {
        "id": "cc_bun_minute_03",
        "fullSentence": "여섯 시 사십 분이에요.",
        "sentenceWithBlank": "여섯 시 ___이에요.",
        "answer": "사십 분",
        "englishHint": "It's 6:40.",
        "alternateAnswers": [],
        "vocabBaseForm": "분 (minutes)",
        "introducedAtPosition": 34
      }
    ]
  },
  "gp_gae_counter": {
    "id": "gp_gae_counter",
    "title": "개",
    "category": "counter",
    "tense": null,
    "register": null,
    "hint": "counting things",
    "description": "개 counts ordinary objects. Put a native number before it, using shortened forms like 한 개 and 두 개: 사과가 두 개 있어요 means 'There are two apples'.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "counter"
    ],
    "structurePattern": "[Native number] 개",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "개 is a general object counter; people and animals have their own counters."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_gae_counter_01",
        "fullSentence": "사과가 두 개 있어요.",
        "sentenceWithBlank": "사과가 두 ___ 있어요.",
        "answer": "개",
        "englishHint": "There are two apples.",
        "order": 0
      },
      {
        "id": "le_gae_counter_02",
        "fullSentence": "책이 세 개 있어요.",
        "sentenceWithBlank": "책이 세 ___ 있어요.",
        "answer": "개",
        "englishHint": "There are three books.",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_gae_counter_01",
        "fullSentence": "사과가 한 개 있어요.",
        "sentenceWithBlank": "사과가 한 ___ 있어요.",
        "answer": "개",
        "englishHint": "There is one apple.",
        "alternateAnswers": [],
        "vocabBaseForm": "개",
        "introducedAtPosition": 35
      },
      {
        "id": "cc_gae_counter_02",
        "fullSentence": "의자가 네 개 있어요.",
        "sentenceWithBlank": "의자가 네 ___ 있어요.",
        "answer": "개",
        "englishHint": "There are four chairs.",
        "alternateAnswers": [],
        "vocabBaseForm": "개",
        "introducedAtPosition": 35
      },
      {
        "id": "cc_gae_counter_03",
        "fullSentence": "가방이 두 개 있어요.",
        "sentenceWithBlank": "가방이 두 ___ 있어요.",
        "answer": "개",
        "englishHint": "There are two bags.",
        "alternateAnswers": [],
        "vocabBaseForm": "개",
        "introducedAtPosition": 35
      }
    ]
  },
  "gp_myeong_counter": {
    "id": "gp_myeong_counter",
    "title": "명 (people)",
    "category": "counter",
    "tense": null,
    "register": null,
    "hint": "counting people",
    "description": "명 counts people in ordinary speech. 학생이 세 명 있어요 means 'There are three students'. The more respectful counter for people is 분.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "counter"
    ],
    "structurePattern": "[Native number] 명",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "For respected people you can say 한 분 instead of 한 명."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_myeong_counter_01",
        "fullSentence": "학생이 세 명 있어요.",
        "sentenceWithBlank": "학생이 세 ___ 있어요.",
        "answer": "명",
        "englishHint": "There are three students.",
        "order": 0
      },
      {
        "id": "le_myeong_counter_02",
        "fullSentence": "친구가 두 명 있어요.",
        "sentenceWithBlank": "친구가 두 ___ 있어요.",
        "answer": "명",
        "englishHint": "I have two friends.",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_myeong_counter_01",
        "fullSentence": "학생이 한 명 있어요.",
        "sentenceWithBlank": "학생이 한 ___ 있어요.",
        "answer": "명",
        "englishHint": "There is one student.",
        "alternateAnswers": [],
        "vocabBaseForm": "명 (people)",
        "introducedAtPosition": 36
      },
      {
        "id": "cc_myeong_counter_02",
        "fullSentence": "친구가 네 명 있어요.",
        "sentenceWithBlank": "친구가 네 ___ 있어요.",
        "answer": "명",
        "englishHint": "I have four friends.",
        "alternateAnswers": [],
        "vocabBaseForm": "명 (people)",
        "introducedAtPosition": 36
      },
      {
        "id": "cc_myeong_counter_03",
        "fullSentence": "사람이 다섯 명 있어요.",
        "sentenceWithBlank": "사람이 다섯 ___ 있어요.",
        "answer": "명",
        "englishHint": "There are five people.",
        "alternateAnswers": [],
        "vocabBaseForm": "명 (people)",
        "introducedAtPosition": 36
      }
    ]
  },
  "gp_mari_counter": {
    "id": "gp_mari_counter",
    "title": "마리",
    "category": "counter",
    "tense": null,
    "register": null,
    "hint": "counting animals",
    "description": "Use 마리 to count animals: 고양이가 한 마리 있어요 means 'There is one cat'. Use native numbers such as 한, 두, 세 before it.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "counter"
    ],
    "structurePattern": "[Native number] 마리",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "마리 is for animals; do not use 개 when specifically counting pets."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_mari_counter_01",
        "fullSentence": "고양이가 한 마리 있어요.",
        "sentenceWithBlank": "고양이가 한 ___ 있어요.",
        "answer": "마리",
        "englishHint": "There is one cat.",
        "order": 0
      },
      {
        "id": "le_mari_counter_02",
        "fullSentence": "강아지가 두 마리 있어요.",
        "sentenceWithBlank": "강아지가 두 ___ 있어요.",
        "answer": "마리",
        "englishHint": "There are two puppies.",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_mari_counter_01",
        "fullSentence": "새가 세 마리 있어요.",
        "sentenceWithBlank": "새가 세 ___ 있어요.",
        "answer": "마리",
        "englishHint": "There are three birds.",
        "alternateAnswers": [],
        "vocabBaseForm": "마리",
        "introducedAtPosition": 37
      },
      {
        "id": "cc_mari_counter_02",
        "fullSentence": "고양이가 네 마리 있어요.",
        "sentenceWithBlank": "고양이가 네 ___ 있어요.",
        "answer": "마리",
        "englishHint": "There are four cats.",
        "alternateAnswers": [],
        "vocabBaseForm": "마리",
        "introducedAtPosition": 37
      },
      {
        "id": "cc_mari_counter_03",
        "fullSentence": "강아지가 한 마리 있어요.",
        "sentenceWithBlank": "강아지가 한 ___ 있어요.",
        "answer": "마리",
        "englishHint": "There is one puppy.",
        "alternateAnswers": [],
        "vocabBaseForm": "마리",
        "introducedAtPosition": 37
      }
    ]
  },
  "gp_myeot": {
    "id": "gp_myeot",
    "title": "몇",
    "category": "question word",
    "tense": null,
    "register": null,
    "hint": "how many",
    "description": "몇 asks 'how many' before a counter: 사과가 몇 개 있어요? means 'How many apples are there?'. It can also ask about clock hours (몇 시) or someone's age (몇 살).",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "question word"
    ],
    "structurePattern": "몇 + counter",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "몇 combines with a suitable counter: 몇 개, 몇 명, 몇 마리."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_myeot_01",
        "fullSentence": "사과가 몇 개 있어요?",
        "sentenceWithBlank": "사과가 ___ 개 있어요?",
        "answer": "몇",
        "englishHint": "How many apples are there?",
        "order": 0
      },
      {
        "id": "le_myeot_02",
        "fullSentence": "친구가 몇 명 있어요?",
        "sentenceWithBlank": "친구가 ___ 명 있어요?",
        "answer": "몇",
        "englishHint": "How many friends do you have?",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_myeot_01",
        "fullSentence": "고양이가 몇 마리 있어요?",
        "sentenceWithBlank": "고양이가 ___ 마리 있어요?",
        "answer": "몇",
        "englishHint": "How many cats are there?",
        "alternateAnswers": [],
        "vocabBaseForm": "몇",
        "introducedAtPosition": 38
      },
      {
        "id": "cc_myeot_02",
        "fullSentence": "책이 몇 개 있어요?",
        "sentenceWithBlank": "책이 ___ 개 있어요?",
        "answer": "몇",
        "englishHint": "How many books are there?",
        "alternateAnswers": [],
        "vocabBaseForm": "몇",
        "introducedAtPosition": 38
      },
      {
        "id": "cc_myeot_03",
        "fullSentence": "사람이 몇 명 있어요?",
        "sentenceWithBlank": "사람이 ___ 명 있어요?",
        "answer": "몇",
        "englishHint": "How many people are there?",
        "alternateAnswers": [],
        "vocabBaseForm": "몇",
        "introducedAtPosition": 38
      }
    ]
  },
  "gp_eolma": {
    "id": "gp_eolma",
    "title": "얼마",
    "category": "question word",
    "tense": null,
    "register": null,
    "hint": "how much",
    "description": "얼마 asks about a price or amount: 이거 얼마예요? means 'How much is this?'. It normally takes the same polite copula ending as other short noun questions.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "question word"
    ],
    "structurePattern": "[Thing] 얼마예요?",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "이거 얼마예요? is useful in shops and markets."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_eolma_01",
        "fullSentence": "이거 얼마예요?",
        "sentenceWithBlank": "이거 ___예요?",
        "answer": "얼마",
        "englishHint": "How much is this?",
        "order": 0
      },
      {
        "id": "le_eolma_02",
        "fullSentence": "사과는 얼마예요?",
        "sentenceWithBlank": "사과는 ___예요?",
        "answer": "얼마",
        "englishHint": "How much are the apples?",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_eolma_01",
        "fullSentence": "이 가방은 얼마예요?",
        "sentenceWithBlank": "이 가방은 ___예요?",
        "answer": "얼마",
        "englishHint": "How much is this bag?",
        "alternateAnswers": [],
        "vocabBaseForm": "얼마",
        "introducedAtPosition": 39
      },
      {
        "id": "cc_eolma_02",
        "fullSentence": "커피는 얼마예요?",
        "sentenceWithBlank": "커피는 ___예요?",
        "answer": "얼마",
        "englishHint": "How much is the coffee?",
        "alternateAnswers": [],
        "vocabBaseForm": "얼마",
        "introducedAtPosition": 39
      },
      {
        "id": "cc_eolma_03",
        "fullSentence": "이 책은 얼마예요?",
        "sentenceWithBlank": "이 책은 ___예요?",
        "answer": "얼마",
        "englishHint": "How much is this book?",
        "alternateAnswers": [],
        "vocabBaseForm": "얼마",
        "introducedAtPosition": 39
      }
    ]
  },
  "gp_sal_age": {
    "id": "gp_sal_age",
    "title": "살 (age)",
    "category": "counter",
    "tense": null,
    "register": null,
    "hint": "years old",
    "description": "Use native Korean numbers with 살 to express age: 스무 살 means twenty years old. Ask 몇 살이에요? in an appropriate social context.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "counter"
    ],
    "structurePattern": "[Native number] 살",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "스물 shortens to 스무 before 살 when it means exactly twenty, but 스물한 살 keeps 스물."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_sal_age_01",
        "fullSentence": "저는 스무 살이에요.",
        "sentenceWithBlank": "저는 스무 ___이에요.",
        "answer": "살",
        "englishHint": "I'm twenty years old.",
        "order": 0
      },
      {
        "id": "le_sal_age_02",
        "fullSentence": "동생은 다섯 살이에요.",
        "sentenceWithBlank": "동생은 다섯 ___이에요.",
        "answer": "살",
        "englishHint": "My younger sibling is five years old.",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_sal_age_01",
        "fullSentence": "형은 스물한 살이에요.",
        "sentenceWithBlank": "형은 스물한 ___이에요.",
        "answer": "살",
        "englishHint": "My older brother is twenty-one.",
        "alternateAnswers": [],
        "vocabBaseForm": "살 (age)",
        "introducedAtPosition": 40
      },
      {
        "id": "cc_sal_age_02",
        "fullSentence": "아기는 한 살이에요.",
        "sentenceWithBlank": "아기는 한 ___이에요.",
        "answer": "살",
        "englishHint": "The baby is one year old.",
        "alternateAnswers": [],
        "vocabBaseForm": "살 (age)",
        "introducedAtPosition": 40
      },
      {
        "id": "cc_sal_age_03",
        "fullSentence": "저는 스물다섯 살이에요.",
        "sentenceWithBlank": "저는 스물다섯 ___이에요.",
        "answer": "살",
        "englishHint": "I'm twenty-five years old.",
        "alternateAnswers": [],
        "vocabBaseForm": "살 (age)",
        "introducedAtPosition": 40
      }
    ]
  },
  "gp_si_honorific": {
    "id": "gp_si_honorific",
    "title": "-(으)시-",
    "category": "honorific",
    "tense": null,
    "register": "respectful",
    "hint": "respectful subject",
    "description": "Use -(으)시- to respect the subject of a sentence. In polite -어요 speech, 가다 becomes 가세요 and 읽다 becomes 읽으세요; the -요 ending separately respects the listener.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "honorific"
    ],
    "structurePattern": "[Verb stem] + (으)시 + ending",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "When followed by 시, a stem-final ㄹ drops: 살다→사세요. A respectful statement is different from a polite command."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_si_honorific_01",
        "fullSentence": "선생님이 오세요.",
        "sentenceWithBlank": "선생님이 ___.",
        "answer": "오세요",
        "englishHint": "The teacher is coming.",
        "order": 0
      },
      {
        "id": "le_si_honorific_02",
        "fullSentence": "할머니가 가세요.",
        "sentenceWithBlank": "할머니가 ___.",
        "answer": "가세요",
        "englishHint": "Grandmother is going.",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_si_honorific_01",
        "fullSentence": "아버지가 일하세요.",
        "sentenceWithBlank": "아버지가 ___.",
        "answer": "일하세요",
        "englishHint": "Father is working.",
        "alternateAnswers": [],
        "vocabBaseForm": "-(으)시-",
        "introducedAtPosition": 53
      },
      {
        "id": "cc_si_honorific_02",
        "fullSentence": "선생님이 책을 읽으세요.",
        "sentenceWithBlank": "선생님이 책을 ___.",
        "answer": "읽으세요",
        "englishHint": "The teacher is reading a book.",
        "alternateAnswers": [],
        "vocabBaseForm": "-(으)시-",
        "introducedAtPosition": 53
      },
      {
        "id": "cc_si_honorific_03",
        "fullSentence": "할아버지가 웃으세요.",
        "sentenceWithBlank": "할아버지가 ___.",
        "answer": "웃으세요",
        "englishHint": "Grandfather is smiling.",
        "alternateAnswers": [],
        "vocabBaseForm": "-(으)시-",
        "introducedAtPosition": 53
      }
    ]
  },
  "gp_kyesida": {
    "id": "gp_kyesida",
    "title": "계시다",
    "category": "honorific",
    "tense": null,
    "register": "respectful",
    "hint": "be present (respectful)",
    "description": "계시다 is the honorific form of 있다 when a respected person is present somewhere. Use 계세요 for someone's presence or location: 할머니가 집에 계세요.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "honorific"
    ],
    "structurePattern": "[Respected person]이/가 [Place]에 계세요",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "계시다 is for respected people's presence, not every possession use of 있다."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_kyesida_01",
        "fullSentence": "할머니가 집에 계세요.",
        "sentenceWithBlank": "할머니가 집에 ___.",
        "answer": "계세요",
        "englishHint": "Grandmother is at home.",
        "order": 0
      },
      {
        "id": "le_kyesida_02",
        "fullSentence": "선생님이 학교에 계세요.",
        "sentenceWithBlank": "선생님이 학교에 ___.",
        "answer": "계세요",
        "englishHint": "The teacher is at school.",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_kyesida_01",
        "fullSentence": "할아버지가 방에 계세요.",
        "sentenceWithBlank": "할아버지가 방에 ___.",
        "answer": "계세요",
        "englishHint": "Grandfather is in the room.",
        "alternateAnswers": [],
        "vocabBaseForm": "계시다",
        "introducedAtPosition": 54
      },
      {
        "id": "cc_kyesida_02",
        "fullSentence": "어머니가 집에 계세요.",
        "sentenceWithBlank": "어머니가 집에 ___.",
        "answer": "계세요",
        "englishHint": "Mother is at home.",
        "alternateAnswers": [],
        "vocabBaseForm": "계시다",
        "introducedAtPosition": 54
      },
      {
        "id": "cc_kyesida_03",
        "fullSentence": "아버지가 회사에 계세요.",
        "sentenceWithBlank": "아버지가 회사에 ___.",
        "answer": "계세요",
        "englishHint": "Father is at work.",
        "alternateAnswers": [],
        "vocabBaseForm": "계시다",
        "introducedAtPosition": 54
      }
    ]
  },
  "gp_deusida": {
    "id": "gp_deusida",
    "title": "드시다",
    "category": "honorific",
    "tense": null,
    "register": "respectful",
    "hint": "eat or drink (respectful)",
    "description": "드시다 is used instead of 먹다 or 마시다 when respecting the person who eats or drinks. It conjugates to 드세요: 할머니가 밥을 드세요 means 'Grandmother is eating'.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "honorific"
    ],
    "structurePattern": "[Respected person]이/가 [food]을/를 드세요",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "Respect comes from the subject (the eater), not just the person being addressed."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_deusida_01",
        "fullSentence": "할머니가 밥을 드세요.",
        "sentenceWithBlank": "할머니가 밥을 ___.",
        "answer": "드세요",
        "englishHint": "Grandmother is eating.",
        "order": 0
      },
      {
        "id": "le_deusida_02",
        "fullSentence": "선생님이 차를 드세요.",
        "sentenceWithBlank": "선생님이 차를 ___.",
        "answer": "드세요",
        "englishHint": "The teacher is drinking tea.",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_deusida_01",
        "fullSentence": "아버지가 아침을 드세요.",
        "sentenceWithBlank": "아버지가 아침을 ___.",
        "answer": "드세요",
        "englishHint": "Father is having breakfast.",
        "alternateAnswers": [],
        "vocabBaseForm": "드시다",
        "introducedAtPosition": 55
      },
      {
        "id": "cc_deusida_02",
        "fullSentence": "할아버지가 물을 드세요.",
        "sentenceWithBlank": "할아버지가 물을 ___.",
        "answer": "드세요",
        "englishHint": "Grandfather is drinking water.",
        "alternateAnswers": [],
        "vocabBaseForm": "드시다",
        "introducedAtPosition": 55
      },
      {
        "id": "cc_deusida_03",
        "fullSentence": "어머니가 점심을 드세요.",
        "sentenceWithBlank": "어머니가 점심을 ___.",
        "answer": "드세요",
        "englishHint": "Mother is having lunch.",
        "alternateAnswers": [],
        "vocabBaseForm": "드시다",
        "introducedAtPosition": 55
      }
    ]
  },
  "gp_egae_hante": {
    "id": "gp_egae_hante",
    "title": "에게/한테",
    "category": "particle",
    "tense": null,
    "register": null,
    "hint": "to a person",
    "description": "에게 and 한테 mark the person receiving a message or other action. 한테 is common in conversation; 에게 appears more in writing: 친구한테 전화해요 means 'I call a friend'.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "particle"
    ],
    "structurePattern": "[Person]에게 / [Person]한테",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "에게/한테 usually mark a person, not a place; respectful 께 is another option."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_egae_hante_01",
        "fullSentence": "친구한테 전화해요.",
        "sentenceWithBlank": "친구___ 전화해요.",
        "answer": "한테",
        "englishHint": "I call a friend.",
        "order": 0
      },
      {
        "id": "le_egae_hante_02",
        "fullSentence": "엄마에게 편지를 써요.",
        "sentenceWithBlank": "엄마___ 편지를 써요.",
        "answer": "에게",
        "englishHint": "I write a letter to Mom.",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_egae_hante_01",
        "fullSentence": "동생한테 말해요.",
        "sentenceWithBlank": "동생___ 말해요.",
        "answer": "한테",
        "englishHint": "I tell my younger sibling.",
        "alternateAnswers": [],
        "vocabBaseForm": "에게/한테",
        "introducedAtPosition": 56
      },
      {
        "id": "cc_egae_hante_02",
        "fullSentence": "친구에게 편지를 써요.",
        "sentenceWithBlank": "친구___ 편지를 써요.",
        "answer": "에게",
        "englishHint": "I write a letter to a friend.",
        "alternateAnswers": [],
        "vocabBaseForm": "에게/한테",
        "introducedAtPosition": 56
      },
      {
        "id": "cc_egae_hante_03",
        "fullSentence": "선생님한테 질문해요.",
        "sentenceWithBlank": "선생님___ 질문해요.",
        "answer": "한테",
        "englishHint": "I ask the teacher a question.",
        "alternateAnswers": [],
        "vocabBaseForm": "에게/한테",
        "introducedAtPosition": 56
      }
    ]
  },
  "gp_juda": {
    "id": "gp_juda",
    "title": "주다",
    "category": "exchange",
    "tense": null,
    "register": null,
    "hint": "give",
    "description": "주다 means 'give'. Use 을/를 for what is given and 한테/에게 for the recipient: 친구한테 책을 줘요 means 'I give a book to a friend'.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "exchange"
    ],
    "structurePattern": "[Giver]이/가 [Recipient]한테 [Object]을/를 줘요",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "주다→줘요 (present) and 줬어요 (past)."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_juda_01",
        "fullSentence": "친구한테 책을 줘요.",
        "sentenceWithBlank": "친구한테 책을 ___.",
        "answer": "줘요",
        "englishHint": "I give a book to a friend.",
        "order": 0
      },
      {
        "id": "le_juda_02",
        "fullSentence": "엄마한테 꽃을 줘요.",
        "sentenceWithBlank": "엄마한테 꽃을 ___.",
        "answer": "줘요",
        "englishHint": "I give flowers to Mom.",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_juda_01",
        "fullSentence": "동생한테 사과를 줘요.",
        "sentenceWithBlank": "동생한테 사과를 ___.",
        "answer": "줘요",
        "englishHint": "I give my younger sibling an apple.",
        "alternateAnswers": [],
        "vocabBaseForm": "주다",
        "introducedAtPosition": 57
      },
      {
        "id": "cc_juda_02",
        "fullSentence": "친구한테 선물을 줬어요.",
        "sentenceWithBlank": "친구한테 선물을 ___.",
        "answer": "줬어요",
        "englishHint": "I gave a present to a friend.",
        "alternateAnswers": [],
        "vocabBaseForm": "주다",
        "introducedAtPosition": 57
      },
      {
        "id": "cc_juda_03",
        "fullSentence": "선생님한테 편지를 줘요.",
        "sentenceWithBlank": "선생님한테 편지를 ___.",
        "answer": "줘요",
        "englishHint": "I give the teacher a letter.",
        "alternateAnswers": [],
        "vocabBaseForm": "주다",
        "introducedAtPosition": 57
      }
    ]
  },
  "gp_batda": {
    "id": "gp_batda",
    "title": "받다",
    "category": "exchange",
    "tense": null,
    "register": null,
    "hint": "receive",
    "description": "받다 means 'receive'. The object takes 을/를: 선물을 받아요 means 'I receive a present'. When naming the sender, 한테서/에게서 means 'from a person'.",
    "level": 1,
    "tags": [
      "TOPIK1",
      "beginner",
      "exchange"
    ],
    "structurePattern": "[Receiver]이/가 [Object]을/를 받아요",
    "notes": [
      {
        "type": "tip",
        "title": "Remember",
        "content": "받다→받아요 (present), 받았어요 (past)."
      }
    ],
    "relatedPointIds": [],
    "lessonExamples": [
      {
        "id": "le_batda_01",
        "fullSentence": "선물을 받아요.",
        "sentenceWithBlank": "선물을 ___.",
        "answer": "받아요",
        "englishHint": "I receive a present.",
        "order": 0
      },
      {
        "id": "le_batda_02",
        "fullSentence": "친구한테서 책을 받아요.",
        "sentenceWithBlank": "친구한테서 책을 ___.",
        "answer": "받아요",
        "englishHint": "I receive a book from a friend.",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_batda_01",
        "fullSentence": "선물을 받았어요.",
        "sentenceWithBlank": "선물을 ___.",
        "answer": "받았어요",
        "englishHint": "I received a present.",
        "alternateAnswers": [],
        "vocabBaseForm": "받다",
        "introducedAtPosition": 58
      },
      {
        "id": "cc_batda_02",
        "fullSentence": "친구한테서 편지를 받았어요.",
        "sentenceWithBlank": "친구한테서 편지를 ___.",
        "answer": "받았어요",
        "englishHint": "I received a letter from a friend.",
        "alternateAnswers": [],
        "vocabBaseForm": "받다",
        "introducedAtPosition": 58
      },
      {
        "id": "cc_batda_03",
        "fullSentence": "동생한테서 사진을 받아요.",
        "sentenceWithBlank": "동생한테서 사진을 ___.",
        "answer": "받아요",
        "englishHint": "I receive a photo from my younger sibling.",
        "alternateAnswers": [],
        "vocabBaseForm": "받다",
        "introducedAtPosition": 58
      }
    ]
  }
};
