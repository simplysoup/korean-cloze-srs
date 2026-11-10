# Munpro Korean grammar catalogue — revised 2026-11-09

## Product decision: grammar first

Munpro's TOPIK catalogue is a **grammar deck**, modeled on Bunpro's separation of grammar and vocabulary. Its unit of progress is a *reusable grammatical construction* (particle, ending, connective, modifier, conjugation, honorific or syntactic pattern), not an isolated Korean word, set of counting words, or conversation topic.

Content is editorially researched, **not an official exhaustive TOPIK list**. Korean-educator review is still required for public accuracy claims.

### Grammar-point admission rule

A candidate earns a grammar point when its main learning objective involves a productive **formation, distribution, contrast, syntactic relationship, tense/aspect, or register**. Its cloze needs to test that rule in more than one sentence and distinguish it from a nearby construction.

- **Grammar points:** `N이/가 아니에요` (negative copula), `-(으)시-` (subject honorific), `N입니다/입니까?` (formal copula), `에` vs `에서`, `-지 않다`, `-아/어서`, `-(으)니까`.
- **Vocabulary/sentence material, not new grammar points:** `뭐`, `언제`, `왜`, individual Sino-/native-number words, `개`, `명`, `마리` as standalone counters, shopping or greeting sentence lists.
- **Borderline grammatical systems:** deictic paradigms (이것/그것/저것, 여기/거기/저기) may reasonably appear in an introductory grammar catalogue when they teach a **contrastive system**, rather than just isolated translations. Existing IDs are retained; reassess their grouping during a future migration, not by deleting learners' SRS histories.

The model deliberately mirrors Bunpro's successful pattern: **meaning → formation → nuance/register → related grammar → worked examples → unseen review clozes**. Grammar is assessed independently of the learner's vocabulary load as far as practical.

References: https://bunpro.jp/grammar_points ; https://api.bunpro.jp/support/getting-started/brief-overview ; https://community.bunpro.jp/t/bunpro-faq-frequently-asked-questions/876

## Current source curriculum

The draft PR preserves existing IDs and has **22 lessons, 102 grammar points, 217 worked examples and 340 review cards**, including Level 1 additions.

| TOPIK level | Lessons | Grammar points | Examples | Review cards | Positions |
|---|---:|---:|---:|---:|---|
| TOPIK I Level 1 | 11 | 50 | 113 | 184 | 1–50 |
| TOPIK I Level 2 | 11 | 52 | 104 | 156 | 51–102 |
| **Total** | **22** | **102** | **217** | **340** | **1–102** |

### Level 1: established grammar order

| Lesson | Theme | Position range |
|---|---|---|
| 1 | Introducing Yourself | 1–6 |
| 2 | People, Possession and Existence | 7–12 |
| 3 | Everyday Actions and Negation | 13–17 |
| 4 | Places, Movement and Position | 18–23 |
| 5 | Time, Starting and Finishing | 24–28 |
| 6 | Talking About the Past and Describing Things | 29–32 |
| 7 | Polite Requests, Needs and Wants | 33–37 |
| 8 | Ability and Giving Reasons | 38–41 |
| 9 | Conditions and Contrast | 42–44 |
| 10 | Connecting Actions and Making Plans | 45–47 |
| 11 | Reactions, Confirmation and Uncertainty | 48–50 |

The 48 existing Level 1 point IDs, all old worked-example IDs and review-card IDs remain unchanged. Two grammar points have been inserted:
- **Position 2, `gp_ani_eyo`**: `N이/가 아니다` / `아니에요`, contrasted with `N이에요/예요` and `안`.
- **Position 33, `gp_eusi_honorific`**: `-(으)시-`, contrasted with the already-existing `-(으)세요` imperative and listener-politeness `-요`.

### Level 2: established grammar order

| Lesson | Theme | Position range |
|---|---|---|
| 12 | Plans, Invitations and Purposes | 51–55 |
| 13 | Formal Speech and Everyday Rules | 56–61 |
| 14 | Before, After and When | 62–66 |
| 15 | Ongoing Actions and Choices | 67–70 |
| 16 | Describing People and Things | 71–74 |
| 17 | Trying Things and Talking About Experience | 75–79 |
| 18 | Giving Reasons and Background | 80–84 |
| 19 | Changes and Prepared Results | 85–88 |
| 20 | Comparisons and Everyday Quantities | 89–93 |
| 21 | Unexpected Results and Concessions | 94–98 |
| 22 | Reporting What People Say (**optional bridge**) | 99–102 |

The 51 earlier-drafted Level 2 point IDs are preserved. One grammar point has been inserted:
- **Position 58, `gp_imnida_imnikka`**: formal noun copula `N입니다 / N입니까?`, contrasted with verb formal endings `-ㅂ니다/-습니다`, `-ㅂ니까/-습니까?` and informal `이에요/예요`.

The reported-speech lesson is **optional enrichment**, not a claim that all reported-speech patterns are needed for TOPIK I.

## Learner progress without vocabulary masquerading as grammar

Keep one visible grammar catalogue and an SRS history **per grammar-point ID**. Show transparent progress for **New / Learning / Review / Mastered**, and group it by level and lesson. Do not equate finishing example sentences or seeing unfamiliar words with learning a grammar construction.

Use **contrast reviews** as a second kind of evidence of progress:
- 은/는 vs 이/가 — topic/contrast vs identifying a subject
- 에 vs 에서 — destination/static place vs location of an action
- 안 vs 못 vs -지 않다 vs N이/가 아니다 — choice/negation, inability, long negation, noun negation
- -(으)세요 vs -(으)시- — polite instruction vs respected subject
- -아/어서 vs -(으)니까 — reason clauses and compatibility with requests
- -(으)ㄹ게요 vs -(으)ㄹ 거예요 — speaker's commitment vs future plan/prediction
- -ㅂ니다/-습니다 vs N입니다 — verb-formal ending vs noun copula

For each GP page, expose **Meaning**, **Structure**, **Formation**, **Register / Nuance**, **Similar and contrasting grammar** and **Examples**. The review should first ask for production in a *new* sentence, then show a compact why-this-form explanation and related grammar. A separate vocabulary layer may provide word glosses and pre-learning, but should not add fake grammar-point progress.

Suggested progress evidence: **number of mastered grammar points**, **percent of lesson points mastered**, and **mixed-review accuracy on recently learned contrasts**, with neutral presentation (not unsupported 'fluent' or 'can speak Korean' claims).

## Beginner-readable grammar-page teaching contract

Each of the **102 grammar points** now has an authored teaching guide in:
- `prisma/seed-data/teaching-guides/level1.ts` (50 entries)
- `prisma/seed-data/teaching-guides/level2.ts` (52 entries)

`teachLesson()` in `prisma/seed-data/teaching-guides/index.ts` uses these guides for every lesson's **description** and the first three **notes**. It keeps the existing lesson, grammar-point, worked-example, and cloze-card IDs unchanged. This is a source-data change: both the old port script and the lesson-detail UI already support a description plus typed notes, but a regenerated JSON snapshot is required before the updated teaching text appears in the mobile app.

Every grammar page now has the same learning order:
1. **What it means** in everyday English, with a communicative use.
2. **Structure**, from the original `structurePattern`.
3. **Build it step by step**, naming where to attach the ending, particle, or connective, including relevant final-consonant cases.
4. **Worked example**, using an actual example sentence from the point, its English meaning, and an explanation of how the construction was formed and why it is used there.
5. **Common trap**, naming a specific wrong formation or a nearby confusing grammar point.
6. Original extra tips and cautions, when useful, followed by independent SRS review cards.

**Example — noun negation:** the learn sentence `학생이 아니에요.` is filled as `학생___` → `이 아니에요`, not merely `이`. The explanation says that 학생 ends in a final consonant, so the noun uses 이 before 아니에요. The trap distinguishes this from `안 + verb` and the misspelling `아니예요`.

**Example — subject honorific:** `선생님이 오세요.` uses `-(으)시-` to respect the teacher who is coming. The trap contrasts an honorific statement about the subject with a polite instruction `가세요` to the listener.

**Example — formal noun copula:** `저는 학생입니다.` has `학생 + 입니다`. The trap contrasts the noun ending `입니다` with the ordinary verb formal endings `-ㅂ니다/-습니다`.

New review cards are not just copies of the lesson example. They still use the original `sentenceWithBlank` mechanics and are intended to test form production in a fresh sentence.

### Source quality gates

`bun scripts/validate-grammar-catalogue.ts` now checks:
- every point has a complete authored guide, not just a translation;
- four distinct guide elements—meaning, formation, worked reasoning, common trap—meet a minimal instructional-length check;
- enriched lessons expose the notes and the worked note references its actual first lesson example;
- noun-negation review cards test `아니에요`, rather than only the subject particle;
- all existing ID, cloze, order, link and content-count invariants still hold.

A minimum length check cannot detect all Korean inaccuracies or confusing explanations. Independent educator QA, especially of honorific and subtle clause-connection nuances, is still needed.

## Repo implementation and QA

Source files:
- `prisma/seed-data/topik1-level1/lesson-01.ts … lesson-11.ts`
- `prisma/seed-data/topik1-level1/additions.ts`
- `prisma/seed-data/topik1-level2/lesson-12.ts … lesson-22.ts`
- `prisma/seed-data/grammar-gaps.ts` — just the three newly added constructions

Run `bun scripts/validate-grammar-catalogue.ts` to check distinct IDs, expected counts, continuous positions, blank reconstruction, minimum worked/review examples, related-point references, and absence of the removed vocabulary-only IDs. The GitHub mobile workflow now includes this check on source-content PR changes.

**Important:** The currently checked-in Expo JSON is *not regenerated* from this source; simply adding TypeScript lesson files does not deploy them. The old mobile app still uses its prior Level 1 JSON and does not yet ingest Level 2.

### Safe deployment blockers

1. Run `bun scripts/port-content.ts` to regenerate and verify Level 1 JSON with the updated source, then add an equivalent Level 2 port/registration process.
2. Review `mobile/src/db/index.ts` before content sync: the existing `deck_grammar_points` insert uses `onConflictDoNothing()`, meaning a content version bump alone does **not** update existing row ordering. It needs a migration/upsert keyed by stable deck+grammar IDs. Keep review cards and logs untouched.
3. Handle position-based queues/checkpoints and replay safely for existing users; a stable GP ID does not make changed position values automatically safe.
4. Validate alternate answers against the *whole Korean sentence*, not just the blank, and test recent confusion pairs with different sentence contexts.
5. Run app typecheck, test suite and web export; arrange independent Korean-language educator review.

### Future candidate grammar (not added as vocabulary substitutes)

Assess **에게/한테** as recipient particles, **께/께서** honorific particles, **-지 못하다** long inability, and whether to expand the existing `하고` point to cover **(이)랑 / 와/과** explicitly. Each must pass the same grammar-point admission criteria and should not be added merely to increase the catalogue's count.

This branch is intentionally a **draft PR**, not a deployable language-course release.
