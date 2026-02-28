# Phase 11c — TOPIK I Level 2 Content

> **Status:** 📋 Planned
> **Depends on:** Phase 11b (Level 1 content must be complete first)

## Overview

Extend the curriculum to cover TOPIK I Level 2 grammar. Level 2 is still administered under the TOPIK I exam paper (alongside Level 1), but the grammar is more complex: connective endings, more nuanced politeness, and a wider range of tense/aspect markers.

> **Taxonomy reminder:** TOPIK I covers Levels 1 and 2. TOPIK II covers Levels 3–6. A learner who completes this phase will be prepared for the TOPIK I exam at the Level 2 standard. They have not yet touched TOPIK II content.

---

## Content Scope

TOPIK I Level 2 grammar roughly builds on Level 1 as follows:

| Category | Examples (Provisional) |
|----------|------------------------|
| Connective endings — sequential/contrast | -고 나서, -지만, -(으)면서, -(으)ㄴ데/는데 |
| Connective endings — reason/cause (extended) | -(으)니까 (all contexts), -아/어서 (extended), -기 때문에 |
| Modal/auxiliary expressions | -아/어 보다, -아/어 버리다, -아/어 두다, -게 되다 |
| Nominalization | -기, -(으)ㅁ |
| Relative clauses | -(으)ㄴ N (past modifier), -(으)ㄹ N (future modifier), -는 N (present modifier) |
| Formal register | -ㅂ/습니다, -ㅂ/습니까? |
| Descriptive pattern extension | -아/어지다 (become), -게 (adverbially) |
| Contrast and concession | -아/어도, -(으)ㄹ지라도, 그런데 |
| Time expressions | -(으)ㄹ 때, -기 전에, -고 난 후에 |
| Evidential / reportative | -(으)ㄴ/는다고 하다, -다고요? |

> Exact lesson groupings for Level 2 will be determined during authoring, following the same lesson-first (not category-first) sequencing principle established in Phase 11b.

---

## TOPIK I Level 2 Curriculum Sequencing Principles

Level 2 grammar is introduced building on every Level 1 point. The N+1 rule still applies to `LessonExample` sentences:

- A Level 2 lesson example may use any Level 1 grammar freely.
- It may use Level 2 grammar from the current or earlier lesson positions only.
- It must not use Level 2 grammar from later lessons.

This is a stricter constraint than Level 1 because learners arrive at Level 2 with a complete Level 1 foundation. Lesson examples can therefore be more natural and complex while still being pedagogically gated.

---

## Seed Data Structure

Following the same modular pattern as Phase 11b:

```
prisma/seed-data/
  topik1-level2/
    lesson-14.ts    # First Level 2 lesson (continues numbering from Level 1)
    lesson-15.ts
    ...
    lesson-N.ts
```

> Lesson numbering continues sequentially from Level 1 to make `sortOrder` in `DeckGrammarPoint` unambiguous. Level 1 ends at some lesson M; Level 2 begins at M+1.

---

## Deck Configuration

TOPIK I Level 1 and TOPIK I Level 2 grammar points will be in the **same deck** ("TOPIK I") or in **separate decks** — to be decided during Phase 11b authoring based on UX considerations.

Arguments for a single deck:
- Learners progress naturally without having to "enroll" in a new deck at the Level 1/2 boundary.
- The boundary is invisible in the TOPIK I exam itself (it sorts you into Level 1 or 2 based on score, not on what you studied).

Arguments for separate decks:
- Users can clearly see their TOPIK I Level 1 vs Level 2 progress.
- A user who only wants Level 1 preparation can enroll in just that deck.

> **Decision deferred to Phase 11b.** Document the outcome here once made.

---

## Acceptance Criteria for Phase 11c

- [ ] All TOPIK I Level 2 grammar points sequenced into lessons (provisional lesson plan finalised).
- [ ] All Level 2 grammar points seeded with `lessonExamples` (N+1 verified) and `clozeCards` (prerequisites declared).
- [ ] Each GP has ≥ 2 lesson examples and ≥ 3 review cloze cards.
- [ ] Level 2 deck (or deck extension) configured with correct `sortOrder` continuing from Level 1.
- [ ] UI correctly labels the deck/content as "TOPIK I — Level 2" (not TOPIK II).
- [ ] Review queue gating works for Level 2 cards with Level 1 prerequisites.
- [ ] Seed remains idempotent.
