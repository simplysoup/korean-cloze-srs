# TOPIK II grammar decks — Levels 3–6

**Status:** Original editorial draft for native/educator review. This is a usable grammar-catalogue expansion, **not** a claim that 24 patterns at each level constitute the full TOPIK syllabus. The official exam awards Level 3–6 by performance on the same TOPIK II exam. Level placement of individual grammar structures is a learning-design decision, not an official published checklist.

Official examination structure: https://www.niied.go.kr/web/NIIED/contents/niiedEng/eng_topikOverview

## Curriculum and counts

This work extends the existing Bunpro-style grammar SRS, **not a vocabulary deck**. The existing TOPIK I Levels 1–2 are unchanged in content or identity.

| Deck | Lesson numbers | Global GP positions | Lessons | Grammar points | Worked examples | Review clozes |
|---|---:|---:|---:|---:|---:|---:|
| TOPIK II Level 3 | 23–28 | 103–126 | 6 | 24 | 48 | 72 |
| TOPIK II Level 4 | 29–34 | 127–150 | 6 | 24 | 48 | 72 |
| TOPIK II Level 5 | 35–40 | 151–174 | 6 | 24 | 48 | 72 |
| TOPIK II Level 6 | 41–46 | 175–198 | 6 | 24 | 48 | 72 |
| **New total** | **23–46** | **103–198** | **24** | **96** | **192** | **288** |
| **All six levels** | **1–46** | **1–198** | **46** | **198** | **409** | **628** |

### Level 3 — intermediate structures

| Lesson | Core learning objective |
|---|---|
| 23 | Interrupted actions, leaving results, ongoing development, overlapping time |
| 24 | Tendencies, appearance, possibility and expected situations |
| 25 | Commitment, near misses, self-directed decisions and practical skills |
| 26 | Immediate sequence, purpose, proportional change and accumulated discovery |
| 27 | Bad and good causes, inconvenience, and alternatives |
| 28 | Contrast, embedded questions and retrospective modifiers |

### Level 4 — nuanced relationships and reporting

| Lesson | Core learning objective |
|---|---|
| 29 | Shared knowledge, reasons, retrospective observations and discoveries |
| 30 | Pretense, impossibility, no alternative and persistent state |
| 31 | Worthwhile actions, ineffective attempts, blame and opportunity |
| 32 | Fears, equivalence, accumulating factors and retrospective regret |
| 33 | Counterfactual past, concessions, conditions and preferences |
| 34 | Quoting suggestions, commands and questions, and shortened reports |

### Level 5 — written and formal reasoning

| Lesson | Core learning objective |
|---|---|
| 35 | Formal causation, instrumental explanation and cited information |
| 36 | Matched degree, natural patterns, inevitability and limitation |
| 37 | Elevated concessions and rejecting undesirable choices |
| 38 | Emphatic exclusion, lack of time, instant action and extreme particles |
| 39 | Measured comparisons, cited statements and limited scope |
| 40 | Formal intention, ultimately happening, futility and likely undesirable outcomes |

### Level 6 — literary, rhetorical and high-register recognition

| Lesson | Core learning objective |
|---|---|
| 41 | High-register causes, universal scope, adding arguments and formal endpoints |
| 42 | Emphatic concession, accepting a point with restrictions and criticism |
| 43 | Strongly preferred choices, rejected expectations and futility |
| 44 | Extreme evaluation, repeated undesirable behaviors and limits |
| 45 | Practically doing something, observed evidence and counterposed situations |
| 46 | Method-dependent outcomes, plausible behavior and literary forecasts |

## Teaching contract (each grammar point)

Every point has:
- a **plain-English meaning** focused on what the construction expresses, not vocabulary;
- a **formation rule** that shows where the pattern attaches and any choice of form;
- **two worked examples** with distinct Korean sentences and English meanings;
- a **worked-example explanation** identifying how the construction functions in the first example;
- a **Common trap** emphasizing a likely error, nuance, register or contrasting construction;
- **three separate review clozes** (not copied from worked examples), with the target answer and a useful base form;
- **related grammar links** to earlier and later points where relevant.

The file format matches `ContentBundle` and `GrammarPointSeed`, preserving the existing app's Learn/Review/Grammar/Deck interfaces. Distinct points have stable `gp_t2lN_*` IDs, distinct example/card IDs, and continuous global positions. Related links are non-gating comparisons rather than hard prerequisites.

## Source-of-truth, generated app content, and commands

- Authoritative source bundles: `prisma/seed-data/topik2/level-3.json` through `level-6.json`.
- Generated mobile content: `mobile/src/content/topik2-level3.json` through `topik2-level6.json`.
- Run `bun scripts/port-content.ts` after editing any source bundle (also regenerates Levels 1–2).
- Run `node scripts/validate-content.mjs`, `bun scripts/validate-grammar-catalogue.ts`.
- From `mobile/`, run `npm ci && npm run typecheck && npm test -- --ci && npx expo export --platform web`.
- The content validator compares generated Level 3–6 JSON against authored source and checks all six levels' IDs, counts, card positions, cloze structure and cross-grammar references.

`mobile/src/db/index.ts` now loads all six content bundles, bumps `CONTENT_VERSION`, and upserts the four newly populated deck rows. The migration intentionally **does not delete or reset any review history** or replace existing TOPIK I point IDs. Existing progress for Levels 1–2 is preserved by ID.


## Editorial quality hardening (2026-11-10)

The 96 entries are no longer all filed under the unhelpful `grammar pattern` category. They now use functional labels such as **sequence**, **cause**, **contrast**, **reported speech**, **concession**, **counterfactual**, **limitation**, and **literary condition**. Every entry's plain-English `description` explains both what the pattern means and when it is useful; the separate worked and trap notes remain available in Learn.

The structure field now states whether the pattern follows a verb/adjective stem or a noun. The authored source and mobile-generated copies were edited together, preserving each existing grammar-point/example/card ID and all position numbers.

`scripts/validate-content.mjs` now blocks merging when Level 3–6 entries have generic categories, a one-line-only description, malformed cloze reconstruction, duplicated review-vs-worked sentences, missing teaching notes, or a worked note that does not refer to an actual example.

### Important coverage gaps for a second edition

This PR is a **curated initial grammar deck**, not comprehensive for TOPIK II. Priority patterns to add in subsequent content expansions include:
- The **plain style -ㄴ/는다** and **informal speech -아/어 / -자** rather than only formal/polite endings;
- **passive verbs** and **causative verbs**, which are productive grammatical systems, not vocabulary lists;
- **retrospective -더라고요** and indirect evidence forms such as **-(으)ㄴ가 보다 / -나 보다**;
- Written nominalization **-(으)ㅁ**, when distinguishing academic prose from conversational -기;
- Other useful connectors and discourse patterns based on learner confusion data.

These deserve full worked examples and explicit near-neighbor traps, not hurried single-card additions. The distinction matters because the official TOPIK II exam evaluates Levels 3–6 together; these app deck placements are curricular sequencing choices rather than an official NIIED-approved breakdown.

## Editorial cautions and release gates

1. **Independent Korean educator/native review required** before publication. Structure validation does not ensure naturalness, especially for high-register patterns. Prefer reviewing awkward or context-dependent Level 5–6 examples first.
2. **Level labels are approximate**. For TOPIK II, one exam yields Levels 3–6 based on performance, rather than requiring four separate grammar lists.
3. **This is curated coverage, not exhaustive coverage**. Expand beyond 24 points/level from reliable grammars, and prioritize grammar with demonstrable use in news, essays, listening and reading.
4. **Do not mistake SRS mastery for exam certification.** Quiz correctness measures production of the target cloze, not reading, listening, writing or speaking proficiency.
5. For high-register patterns, make **recognition-first** practice an option later; forcing literal production of very rare literary sentences is not necessarily best for every learner.

Other useful editorial references (not copied):
- https://hitopik.app/learn/grammar
- https://pocketkorean.com/en/grammar/
- https://hangeul.app/grammar

