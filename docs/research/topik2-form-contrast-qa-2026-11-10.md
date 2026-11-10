# TOPIK II form/contrast curriculum QA — 2026-11-10

**Editorial status:** Content-only corrective iteration on top of PR #5. Original grammar-point IDs, example IDs, card IDs, lesson order, review positions, 229-point total and 721-card total are preserved. The app runtime, grading policy, FSRS data, migrations, and topic/vocabulary owners are unchanged. **None of the revised Korean sentences has yet been signed off by a native-speaking educator.**

## Why this iteration

A flat set of three grammatical clozes per point is not sufficient when all three drill the same conjugation or when a single form has multiple discourse uses. Production reviews must cover *allomorphy and meaning contrast*, not simply three synonymous lexical examples. The corrections here prioritize demonstrable learning value over growing the point count.

| Level | Stable grammar point | Editorial change | Review target |
|---|---|---|---|
| 3 | `gp_t2l3_dorok` | Replaced two repetitive/tautological purpose sentences with an understanding goal and an audible-result goal | `않도록`, `이해하도록`, `들리도록` across distinct contexts |
| 5 | `gp_t2l5_eumeurosseo` | Mixed 하다, consonant and vowel stems, including `읽음으로써` and `봄으로써` | Producing -(으)ㅁ + 으로써, not memorizing three `함으로써` |
| 5 | `gp_t2l5_e_ttaraseo` | Explicitly separates variation by factor from acting according to a rule; varies `에 따라/에 따라서` | Choose a natural variant in either sense |
| 6 | `gp_t2l6_dason_chideorado` | Adds verb conjugation `-ㄴ다손/-는다손`; fixes an illogical 'even if expensive' concession | `싸다손`, `출발한다손`, `먹는다손` |
| 6 | `gp_t2l6_makronhago` | Adds `나이를 막론하고` to test 를 alongside 을 | Particle selection after a vowel-final noun |
| 6 | `gp_t2l6_dasipi` | Restricts misleading 'verb/adjective stem' description to perception/knowledge predicates | Contrast evidence `-다시피` vs near-extreme `-다시피 하다` |

## Source verification strength

- **Direct official form-specific support:** NIKL's explanation of `-다손` and `-ㄴ다손/-는다손`, with its own separately authored examples, establishes the action/descriptive conjugation distinction: https://www.korean.go.kr/nkview/nklife/2006_2/2006_0214.pdf (pp. 181–182).
- **Direct official means/role contrast:** NIKL explains `-(으)로써` as instrument/means and `-(으)로서` as capacity or role: https://www.korean.go.kr/front/onlineQna/onlineQnaView.do?mn_id=216&pageIndex=1&qna_seq=306389
- **Curriculum staging, not form-level certification:** Online King Sejong Institute teaches beginner, intermediate and advanced curricular bands: https://mngr.iksi.or.kr/lms/main/curriculum.do
- **Pending educator checks:** Exact naturalness of *our original* sentences and nuance of `에 따라/에 따라서`; these are editorial judgments, not officially certified by the links above. Do not imply publisher texts were reproduced or that TOPIK score levels mandate these precise forms.

## Contextual alternative-answer decisions

These are **three newly provisioned, per-sentence acceptable alternatives** in TOPIK II Level 5, separate from the 12 cards/18 alternatives in the earlier 31-point grammar-gap audit.

| Review ID | Canonical | Alternative | Reconstructed meaning |
|---|---|---|---|
| `cc_t2l5_e_ttaraseo_01` | `에 따라` | `에 따라서` | Opinions differ from person to person |
| `cc_t2l5_e_ttaraseo_02` | `에 따라서` | `에 따라` | Please process it according to the rules |
| `cc_t2l5_e_ttaraseo_03` | `에 따라` | `에 따라서` | Schedule may vary with the weather |

**Approval boundary:** Accepting a variant here does not authorize blindly replacing `에 따라` with `따라서` (without 에), or accepting `때문에` as equivalent. The card accepts exactly the listed context-specific strings. The distinction between correct Korean and correctly demonstrated *target form* remains in `docs/planning/answer-evaluation-and-feedback-spec.md`. The current app still reports binary correctness; per-answer explanation and close-answer hints await the integration maintainer.

## Near-miss examples for editor and grader design (not active grader rules)

| Card | Input to test | Outcome to explain |
|---|---|---|
| `cc_t2l6_dason_chideorado_02` | `출발다손 치더라도` | Action verb needs `출발한다손`; don't attach descriptive `-다손` directly |
| `cc_t2l6_dason_chideorado_03` | `먹다손 치더라도` | Consonant-final verb needs `먹는다손` |
| `cc_t2l5_eumeurosseo_02` | `읽음으로서` | Means is `읽음으로써`; `-으로서` denotes status/capacity |
| `cc_t2l5_e_ttaraseo_02` | `에 따라` | **Correct alternative**, not a near miss |
| `cc_t2l3_dorok_02` | `이해하느라고` | Wrong relationship; it marks a reason/burden, not the intended goal |
| `cc_t2l6_makronhago_02` | `을 막론하고` | Wrong particle after `나이`; use 를 |

A future evaluator should show the valid reconstructed sentence first, explain the **specific** difference after answering, and let learners retry on near misses. These diagnostic examples require editorial adjudication before automated class labels are considered authoritative.

## Verification and handoff

1. `bun scripts/port-content.ts` must regenerate all six existing mobile grammar bundles without a diff; the Level 3 mobile bundle *additionally* includes eight gap-overlay grammar points not in `topik2/level-3.json` alone.
2. `node scripts/validate-content.mjs` and `node scripts/validate-topik2-contrast.mjs` check counts, cloze reconstruction, stable IDs, alternative-card alignment and the new contrast cases.
3. CI and educator review are independent gates. A passing structural validator is **not** linguistic approval.
4. This PR stacks after #2 → #3 → #4 → #5; review/merge in order. No SRS or deployed application changes are made by this research note.
