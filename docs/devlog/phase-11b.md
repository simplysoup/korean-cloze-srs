# Phase 11b Devlog — TOPIK I Level 1 Content

> **Status:** ✅ Complete
> **Started:** 2026-02-28
> **Completed:** 2026-02-28

## Overview

Replacing all previous grammar points with a complete, pedagogically-sequenced TOPIK I Level 1 curriculum. Each lesson is authored one at a time in modular seed files under `prisma/seed-data/topik1-level1/`.

### Curriculum Summary

| Lesson | Theme | GP Count | Positions |
|--------|-------|----------|-----------|
| 1 | Identity and Basic Structure | 8 | 1–8 |
| 2 | Basic Actions and Sentence Dynamics | 10 | 9–18 |
| 3 | Location and Existence | 5 | 19–23 |
| 4 | Time and Scheduling | 5 | 24–28 |
| 5 | Past Tense and Negation | 2 | 29–30 |
| 6 | Modifiers and Degree | 3 | 31–33 |
| 7 | Want and Ability | 3 | 34–36 |
| 8 | Obligation and Requests | 3 | 37–39 |
| 9 | Reason and Cause | 3 | 40–42 |
| 10 | Condition and Contrast | 3 | 43–45 |
| 11 | Future and Sequential Actions | 3 | 46–48 |

---

## Progress Log

### Lesson 1 — Identity and Basic Structure ✅
- **8 grammar points:** 이에요/예요, 이다, 은/는, 이것, 그것, 저것, 의, 도
- **16 lesson examples** (2 per GP, all N+1 verified)
- **26 cloze cards** (3–4 per GP, allomorph coverage for 이에요/예요 and 은/는)
- Related point IDs: 이에요/예요 ↔ 이다 (register variants)
- File: `prisma/seed-data/topik1-level1/lesson-01.ts`

### Lesson 2 — Basic Actions and Sentence Dynamics ✅
- **10 grammar points:** 이/가, 을/를, -아요/어요, 안, 하고, 여기, 거기, 저기, -네요, -지요/죠
- **20 lesson examples** (2 per GP, plus 3 for -아요/어요; all N+1 verified)
- **34 cloze cards** (3–5 per GP, allomorph coverage for 이/가, 을/를, -아요/어요)
- 하고 cards accept 와/과/(이)랑 as alternate answers
- -지요/죠 cards accept both full and contracted forms
- File: `prisma/seed-data/topik1-level1/lesson-02.ts`

### Lesson 3 — Location and Existence ✅
- **5 grammar points:** 에 (장소), 있다/있어요, 없다/없어요, 에서, 위/아래/앞/뒤/옆
- **10 lesson examples** (2 per GP, all N+1 verified)
- **16 cloze cards** (3–4 per GP; position words cover 위/아래/앞/옆)
- 에 vs 에서 contrast explicitly noted in descriptions
- File: `prisma/seed-data/topik1-level1/lesson-03.ts`

### Lesson 4 — Time and Scheduling ✅
- **5 grammar points:** 에 (시간), 부터, 까지, 전에, 후에
- **10 lesson examples** (2 per GP, all N+1 verified)
- **15 cloze cards** (3 per GP)
- 부터~까지 pairing demonstrated across examples
- 전에/후에 cover both noun and verb patterns
- File: `prisma/seed-data/topik1-level1/lesson-04.ts`

### Lesson 5 — Past Tense and Negation ✅
- **2 grammar points:** -았어요/-었어요, -지 않다
- **5 lesson examples** (2–3 per GP, all N+1 verified)
- **8 cloze cards** (5 for past tense covering 갔/먹었/봤/마셨/했 allomorphs; 3 for -지 않다)
- Past tense cards cover ㅏ-stem, ㅓ-stem, 하다 contraction
- File: `prisma/seed-data/topik1-level1/lesson-05.ts`

### Lesson 6 — Modifiers and Degree ✅
- **3 grammar points:** -(으)ㄴ (adj modifier), 만 (only), -ㄴ 것 같다 (seems like)
- **6 lesson examples** (2 per GP, all N+1 verified)
- **10 cloze cards** (4 for -(으)ㄴ with 큰/작은/좋은/비싼 allomorphs; 3 for 만; 3 for -ㄴ 것 같다)
- -ㄴ 것 같다 linked as related to -(으)ㄴ modifier
- File: `prisma/seed-data/topik1-level1/lesson-06.ts`

### Lesson 7 — Want and Ability ✅
- **3 grammar points:** -고 싶다, -(으)ㄹ 수 있다/없다, 못
- **6 lesson examples** (2 per GP, all N+1 verified)
- **9 cloze cards** (3 per GP)
- 못 linked as related to 안 (L2) and -(으)ㄹ 수 있다; ability pair cross-referenced
- File: `prisma/seed-data/topik1-level1/lesson-07.ts`

### Lesson 8 — Obligation and Requests ✅
- **3 grammar points:** -아/어야 하다, -(으)세요, -아/어 주세요
- **6 lesson examples** (2 per GP, all N+1 verified)
- **9 cloze cards** (3 per GP); -아/어야 하다 blanks test conjugated stem (가야, 먹어야, 공부해야)
- -(으)세요 and -아/어 주세요 cross-referenced as related
- File: `prisma/seed-data/topik1-level1/lesson-08.ts`

### Lesson 9 — Reason and Cause ✅
- **3 grammar points:** -아/어서, -(으)니까, 그래서
- **6 lesson examples** (2 per GP, all N+1 verified)
- **9 cloze cards** (3 per GP); -아/어서 and -(으)니까 cross-referenced; 그래서 uses two-sentence format
- Cloze blanks for connectives isolate the connective morpheme (서, 니까, 그래서)
- File: `prisma/seed-data/topik1-level1/lesson-09.ts`

### Lesson 10 — Condition and Contrast ✅
- **3 grammar points:** -(으)면, -지만, 하지만
- **6 lesson examples** (2 per GP, all N+1 verified)
- **9 cloze cards** (3 per GP); -지만 and 하지만 cross-referenced as related
- -(으)면 blanks isolate 면; -지만 blanks isolate 지만; 하지만 is full-word blank
- File: `prisma/seed-data/topik1-level1/lesson-10.ts`

### Lesson 11 — Future and Sequential Actions ✅
- **3 grammar points:** -고 (sequential), -(으)ㄹ게요, -(으)ㄹ 거예요
- **6 lesson examples** (2 per GP, all N+1 verified)
- **9 cloze cards** (3 per GP); -(으)ㄹ게요 and -(으)ㄹ 거예요 cross-referenced
- -고 (sequential) linked to 하고 (L2); future endings include both first-person-only and all-person forms
- File: `prisma/seed-data/topik1-level1/lesson-11.ts`

---

## All 11 lessons complete! 48 grammar points total.

### Seed Orchestrator & Testing ✅
- Rewrote `prisma/seed.ts` from 1036-line monolith to 262-line orchestrator importing lesson modules
- Created `prisma/seed-data/topik1-level1/index.ts` re-exporting all lessons + `allLessons` array
- Fixed migration SQL (had stray `Loaded Prisma config...` line in preamble)
- Verified: `bun prisma/seed.ts` runs cleanly, idempotent on re-run
- **Final counts:** 48 GPs, 154 cloze cards, 98 lesson examples, 48 deck grammar points, 5 review cards for test user
