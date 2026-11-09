import type { GrammarPointSeed } from './types';

/** True grammatical constructions absent from the original TOPIK I catalogue.
 * Stable new IDs; original grammar-point IDs and review histories are preserved.
 * A number or question word by itself is vocabulary, not a new grammar point.
 */
export const grammarGapPoints: Record<string, GrammarPointSeed> = {
  "gp_ani_eyo": {
    "id": "gp_ani_eyo",
    "title": "N이/가 아니다 (아니에요)",
    "category": "copula",
    "tense": "present",
    "register": "polite informal",
    "hint": "not be (noun negation)",
    "description": "To say someone or something is not a noun, use [Noun]이/가 아니다. Use 이 after a consonant-ending noun and 가 after a vowel-ending noun; the polite informal form is 아니에요 (not 아니예요). This differs from 안 + action verb and -지 않다.",
    "level": 1,
    "tags": [
      "copula",
      "negation",
      "beginner",
      "TOPIK1"
    ],
    "structurePattern": "N이/가 아니에요",
    "notes": [
      {
        "type": "tip",
        "title": "Compare",
        "content": "학생이에요 (I am a student) → 학생이 아니에요 (I am not a student). 의사예요 → 의사가 아니에요."
      },
      {
        "type": "caution",
        "title": "Not 안",
        "content": "Do not put 안 before a noun to make a negative copula. Use 아니에요 for noun identification."
      }
    ],
    "relatedPointIds": [
      "gp_ieyo_yeyo",
      "gp_an",
      "gp_ji_anha"
    ],
    "lessonExamples": [
      {
        "id": "le_ani_eyo_01",
        "fullSentence": "학생이 아니에요.",
        "sentenceWithBlank": "학생___ 아니에요.",
        "answer": "이",
        "englishHint": "I'm not a student.",
        "order": 0
      },
      {
        "id": "le_ani_eyo_02",
        "fullSentence": "의사가 아니에요.",
        "sentenceWithBlank": "의사___ 아니에요.",
        "answer": "가",
        "englishHint": "I'm not a doctor.",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_ani_eyo_01",
        "fullSentence": "책이 아니에요.",
        "sentenceWithBlank": "책___ 아니에요.",
        "answer": "이",
        "englishHint": "It isn't a book.",
        "alternateAnswers": [],
        "vocabBaseForm": "아니다",
        "introducedAtPosition": 2
      },
      {
        "id": "cc_ani_eyo_02",
        "fullSentence": "커피가 아니에요.",
        "sentenceWithBlank": "커피___ 아니에요.",
        "answer": "가",
        "englishHint": "It isn't coffee.",
        "alternateAnswers": [],
        "vocabBaseForm": "아니다",
        "introducedAtPosition": 2
      },
      {
        "id": "cc_ani_eyo_03",
        "fullSentence": "학교가 아니에요.",
        "sentenceWithBlank": "학교가 ___.",
        "answer": "아니에요",
        "englishHint": "It isn't a school.",
        "alternateAnswers": [],
        "vocabBaseForm": "아니다",
        "introducedAtPosition": 2
      }
    ]
  },
  "gp_eusi_honorific": {
    "id": "gp_eusi_honorific",
    "title": "-(으)시-",
    "category": "honorific",
    "tense": "present",
    "register": "subject honorific",
    "hint": "respect the subject",
    "description": "Insert -(으)시- after the stem when the person doing the action is someone the speaker treats respectfully. Consonant stems usually take -으시- and vowel stems take -시-; a stem-final ㄹ drops before -시-. In polite informal speech this often appears as -(으)세요. The subject-honorific marker is distinct from the listener-politeness ending -요, and -세요 may also function as a request.",
    "level": 1,
    "tags": [
      "honorific",
      "verb-ending",
      "beginner",
      "TOPIK1"
    ],
    "structurePattern": "[Verb stem] + (으)시 + [ending]",
    "notes": [
      {
        "type": "tip",
        "title": "Subject vs listener",
        "content": "선생님이 오세요 describes the teacher respectfully; the -요 polite ending separately addresses the listener."
      },
      {
        "type": "caution",
        "title": "Two readings of -세요",
        "content": "가세요 can be an honorific statement ('[A respected person] goes') or a polite request ('Please go'); context and subject determine which."
      },
      {
        "type": "tip",
        "title": "Stem-final ㄹ",
        "content": "Stems ending in ㄹ lose ㄹ before -시-: 살다 → 사세요; 만들다 → 만드세요."
      }
    ],
    "relatedPointIds": [
      "gp_euseyo",
      "gp_ayo_eoyo"
    ],
    "lessonExamples": [
      {
        "id": "le_eusi_hon_01",
        "fullSentence": "선생님이 오세요.",
        "sentenceWithBlank": "선생님이 ___.",
        "answer": "오세요",
        "englishHint": "The teacher is coming.",
        "order": 0
      },
      {
        "id": "le_eusi_hon_02",
        "fullSentence": "아버지가 책을 읽으세요.",
        "sentenceWithBlank": "아버지가 책을 ___.",
        "answer": "읽으세요",
        "englishHint": "My father is reading a book.",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_eusi_hon_01",
        "fullSentence": "할머니가 쉬세요.",
        "sentenceWithBlank": "할머니가 ___.",
        "answer": "쉬세요",
        "englishHint": "Grandmother is resting.",
        "alternateAnswers": [],
        "vocabBaseForm": "쉬다",
        "introducedAtPosition": 33
      },
      {
        "id": "cc_eusi_hon_02",
        "fullSentence": "어머니가 일하세요.",
        "sentenceWithBlank": "어머니가 ___.",
        "answer": "일하세요",
        "englishHint": "Mother is working.",
        "alternateAnswers": [],
        "vocabBaseForm": "일하다",
        "introducedAtPosition": 33
      },
      {
        "id": "cc_eusi_hon_03",
        "fullSentence": "선생님이 앉으세요.",
        "sentenceWithBlank": "선생님이 ___.",
        "answer": "앉으세요",
        "englishHint": "The teacher is sitting down.",
        "alternateAnswers": [],
        "vocabBaseForm": "앉다",
        "introducedAtPosition": 33
      }
    ]
  },
  "gp_imnida_imnikka": {
    "id": "gp_imnida_imnikka",
    "title": "N입니다 / N입니까?",
    "category": "formal copula",
    "tense": "present",
    "register": "formal polite",
    "hint": "is / is it? (formal)",
    "description": "For formal polite noun identification, attach 입니다 directly to a noun (a statement) or 입니까? (a question). These are copula forms, not the general verb endings -ㅂ니다/-습니다 and -ㅂ니까/-습니까. Compare 저는 학생이에요 with 저는 학생입니다.",
    "level": 2,
    "tags": [
      "copula",
      "formal",
      "TOPIK1"
    ],
    "structurePattern": "[Noun]입니다 / [Noun]입니까?",
    "notes": [
      {
        "type": "tip",
        "title": "Copula, not verb stem",
        "content": "학생 + 입니다 → 학생입니다. For a verb, use the separate formal ending, e.g. 갑니다."
      },
      {
        "type": "tip",
        "title": "Register",
        "content": "This register is common in speeches, formal introductions, announcements and some customer-facing situations."
      }
    ],
    "relatedPointIds": [
      "gp_ieyo_yeyo",
      "gp_seumnida",
      "gp_seumnikka"
    ],
    "lessonExamples": [
      {
        "id": "le_imnida_01",
        "fullSentence": "저는 학생입니다.",
        "sentenceWithBlank": "저는 학생___.",
        "answer": "입니다",
        "englishHint": "I am a student.",
        "order": 0
      },
      {
        "id": "le_imnida_02",
        "fullSentence": "저분은 선생님입니까?",
        "sentenceWithBlank": "저분은 선생님___?",
        "answer": "입니까",
        "englishHint": "Is that person a teacher?",
        "order": 1
      }
    ],
    "cards": [
      {
        "id": "cc_imnida_01",
        "fullSentence": "저는 의사입니다.",
        "sentenceWithBlank": "저는 의사___.",
        "answer": "입니다",
        "englishHint": "I am a doctor.",
        "alternateAnswers": [],
        "vocabBaseForm": "이다",
        "introducedAtPosition": 58
      },
      {
        "id": "cc_imnida_02",
        "fullSentence": "이것은 책입니까?",
        "sentenceWithBlank": "이것은 책___?",
        "answer": "입니까",
        "englishHint": "Is this a book?",
        "alternateAnswers": [],
        "vocabBaseForm": "이다",
        "introducedAtPosition": 58
      },
      {
        "id": "cc_imnida_03",
        "fullSentence": "여기는 병원입니다.",
        "sentenceWithBlank": "여기는 병원___.",
        "answer": "입니다",
        "englishHint": "This place is a hospital.",
        "alternateAnswers": [],
        "vocabBaseForm": "이다",
        "introducedAtPosition": 58
      }
    ]
  }
};
