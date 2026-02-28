# Phase 11b — TOPIK I Level 1 Content

> **Status:** 📋 Planned
> **Depends on:** Phase 11a (schema migration must be applied first)

## Overview

Populate the TOPIK I Level 1 deck with a complete, pedagogically-sequenced set of grammar points. Every grammar point gets:
- 2–3 `LessonExample` records (N+1 constrained; shown during learn phase)
- 3–5 `ClozeCard` records (may use any grammar, but carry `prerequisiteGpIds`)

The curriculum follows a **lesson-first** order rather than a category-first order — grammar points that naturally appear in real sentences together are grouped together even if they span traditional linguistic categories (particles, verb endings, demonstratives, etc.).

---

## TOPIK I Level 1 Curriculum

### Lesson 1 — Identity and Basic Structure

| # | Grammar | Function | Register | Tense |
|---|---------|----------|----------|-------|
| 1 | 이에요/예요 | Identification ("To be") | Polite Informal | Present |
| 2 | 이다 | Identification ("To be") | Plain/Dictionary | Present |
| 3 | 은/는 | Topic Marker ("As for…") | N/A | N/A |
| 4 | 이것 | Demonstrative (This — near speaker) | N/A | N/A |
| 5 | 그것 | Demonstrative (That — near listener) | N/A | N/A |
| 6 | 저것 | Demonstrative (That — far from both) | N/A | N/A |
| 7 | 의 | Possessive Marker ('s / of) | N/A | N/A |
| 8 | 도 | Inclusion ("Also/Too") | N/A | N/A |

**Lesson 1 N+1 scope:** Lesson examples for grammar point #8 (도) may use 이에요/예요, 이다, 은/는, 이것/그것/저것, 의, and 도 itself — but not any grammar from Lesson 2 onward.

---

### Lesson 2 — Basic Actions and Sentence Dynamics

| # | Grammar | Function | Register | Tense |
|---|---------|----------|----------|-------|
| 9  | 이/가 | Subject Marker | N/A | N/A |
| 10 | 을/를 | Object Marker | N/A | N/A |
| 11 | 아요/어요 | Polite Verb Ending | Polite Informal | Present |
| 12 | 안 [Verb] | Negative ("Not") | Polite Informal | Present |
| 13 | 하고 | Connective ("And/With") | N/A | N/A |
| 14 | 여기 | Here (near speaker) | N/A | N/A |
| 15 | 거기 | There (near listener) | N/A | N/A |
| 16 | 저기 | Over there (far) | N/A | N/A |
| 17 | 네요 | Surprise/Realization | Polite Informal | Present |
| 18 | 지요(죠) | Confirmation ("Right?") | Polite Informal | Present |

**Lesson 2 N+1 scope:** Lesson examples for grammar point #18 (죠) may use any grammar from positions 1–18, but not grammar from Lesson 3 onward.

---

### Lessons 3–N — (To Be Authored)

Subsequent lessons will be sequenced following the same approach: introduce grammar that naturally co-occurs together rather than by linguistic category. Likely next lessons:

| Lesson | Theme | Grammar (Provisional) |
|--------|-------|-----------------------|
| 3 | Location and Existence | 에 있다/없다, 에서, 위/아래/앞/뒤/옆 |
| 4 | Time and Scheduling | 에 (temporal), 부터, 까지, 전에, 후에 |
| 5 | Past Tense | -았어요/-었어요, 어제/오늘/내일, 아까 |
| 6 | Describing Things | -아/어요 (descriptive), 아주/너무/좀, -ㄴ 것 같다 |
| 7 | Want and Ability | -고 싶다, -(으)ㄹ 수 있다/없다, 잘/못 |
| 8 | Obligation and Requests | -아/어야 하다, -(으)세요, -아/어 주세요 |
| 9 | Reason and Cause | -아/어서, -(으)니까, 그래서 |
| 10 | Condition | -(으)면, -지만, 하지만 |
| 11 | Sequential Actions | -고, -(으)ㄹ게요, -(으)ㄹ 거예요 |
| 12–13 | Review & Edge Cases | Remaining TOPIK I Level 1 grammar |

> Exact composition of Lessons 3–13 will be determined when authoring begins in a sub-task. The above is provisional.

---

## Seed Data Structure

Restructure `prisma/seed.ts` into a modular pattern. Each lesson is a separate file:

```
prisma/
  seed.ts                         # orchestrator — imports and runs modules in order
  seed-data/
    topik1-level1/
      lesson-01.ts                # GP data + lessonExamples + clozeCards for Lesson 1
      lesson-02.ts                # Lesson 2
      lesson-03.ts                # Lesson 3
      ...
    topik1-level2/                # Phase 11c
      ...
    decks.ts                      # Deck definitions + DeckGrammarPoint ordering
    test-user.ts                  # Dev test user + progress
```

### Module Shape (example: `lesson-01.ts`)

```ts
export const lesson01GrammarPoints = [
  {
    id: 'gp_ieyo_yeyo',         // stable cuid-style slug
    slug: 'ieyo-yeyo',
    title: '이에요/예요',
    titleRomanized: 'ieyo/yeyo',
    meaning: 'To be (polite informal, present)',
    structurePattern: '[Noun]이에요 / [Noun]예요',
    description: 'Attaches to a noun to mean "is/am/are". Use 이에요 after a consonant, 예요 after a vowel.',
    notes: [],                  // tip/caution/funfact objects
    topikLevel: 1,
    lessonExamples: [
      {
        id: 'le_ieyo_01',
        fullSentence: '이것은 책이에요.',
        sentenceWithBlank: '이것은 책___.',
        answer: '이에요',
        englishHint: { text: 'This is a book.', highlightType: null },
        order: 0,
      },
      {
        id: 'le_ieyo_02',
        fullSentence: '저것은 가방이에요.',
        sentenceWithBlank: '저것은 가방___.',
        answer: '이에요',
        englishHint: { text: 'That (over there) is a bag.', highlightType: null },
        order: 1,
      },
    ],
    clozeCards: [
      {
        id: 'cc_ieyo_01',
        fullSentence: '저는 학생이에요.',
        sentenceWithBlank: '저는 학생___.',
        answer: '이에요',
        alternateAnswers: [],
        englishHint: { text: 'I am a student.', highlightType: null },
        prerequisiteGpIds: [],  // no prerequisites for Lesson 1
      },
      // ... more cards
    ],
  },
  // ... more grammar points
];
```

---

## N+1 Verification Checklist (Per Lesson Example)

Before committing any `lessonExample`, verify:

- [ ] Every grammar construct in `fullSentence` is from a GP at position ≤ current GP's position.
- [ ] No future tense markers, connectors, or endings from later lessons appear.
- [ ] Vocabulary is basic (TOPIK I common words). No obscure vocabulary that distracts from the grammar target.
- [ ] The blank (___) isolates only the target grammar point — not a whole phrase.
- [ ] The `englishHint` translation is natural English, not a word-for-word gloss.

---

## Prerequisite Mapping for `ClozeCard` Records

Review cards can use richer, more natural Korean. When they do, declare prerequisites:

| Card Context | Typical Prerequisites |
|-------------|----------------------|
| Uses -았어요 in surrounding text | gp_id of -았어요 GP |
| Uses -(으)면 | gp_id of -(으)면 GP |
| Uses a Level 2 grammar in context | Appropriate Level 2 GP id |

For Level 1 Lesson 1–2 review cards, prerequisites are likely empty or minimal because the sentences are inherently simple. Richer prerequisite usage will appear in Lessons 6+.

---

## ClozeCard Allomorph Coverage

Each particle / verb ending with allomorphs must be covered with cards for *each* allomorph:

| Grammar | Allomorphs | Cards needed |
|---------|-----------|-------------|
| 이에요/예요 | 이에요 (after consonant), 예요 (after vowel) | At least 2 per allomorph |
| 은/는 | 은 (after consonant), 는 (after vowel) | 3+ each — already partially seeded |
| 이/가 | 이 (after consonant), 가 (after vowel) | 3+ each |
| 을/를 | 을 (after consonant), 를 (after vowel) | 3+ each |
| 아요/어요 | varies by verb stem vowel | 3–5 varied verbs |

---

## Acceptance Criteria for Phase 11b

- [ ] All Lesson 1 grammar points seeded with `lessonExamples` and `clozeCards`.
- [ ] All Lesson 2 grammar points seeded with `lessonExamples` and `clozeCards`.
- [ ] Lessons 3–13 grammar points seeded (provisional sequencing may shift during authoring).
- [ ] Each GP has ≥ 2 lesson examples (N+1 verified) and ≥ 3 review cloze cards.
- [ ] Allomorph coverage: every allomorph variant has ≥ 2 dedicated cards.
- [ ] Seed remains idempotent (upsert all records by stable ID).
- [ ] Learn page renders `lessonExamples` correctly (depends on 11a code changes).
- [ ] Review queue gates cards with prerequisites correctly (depends on 11a code changes).
- [ ] TOPIK I Level 1 deck has all GPs linked in `DeckGrammarPoint` with correct `sortOrder`.
- [ ] TOPIK I label in deck UI correctly displays "TOPIK I" (not "TOPIK 1" or "TOPIK II").
