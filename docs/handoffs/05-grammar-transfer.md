# Agent 05 handoff — Grammar contrast & productive transfer

**Branch:** `feat/grammar-transfer`  
**PR:** https://github.com/simplysoup/korean-cloze-srs/pull/15 (draft; base `integration/curriculum-v1`)  
**Baseline:** `c17cfab84f978056e55665b40fbeaec92ca044ce`  
**Owner:** Agent 05 only; Agent 00 owns navigation, persistence, integration and release.

## What is implemented

The practice pilot is **52 editorial-draft exercises**:

| TOPIK level | Contrast selection | Productive transfer | Total |
| --- | ---: | ---: | ---: |
| 1 | 8 | 5 | 13 |
| 2 | 12 | 5 | 17 |
| 3 | 6 | 5 | 11 |
| 4 | 6 | 5 | 11 |
| **Total** | **32** | **20** | **52** |

**16 contrast groups:** topic vs subject, action location vs destination, intentional negation vs inability, reason before directive, speech register, speaker intent vs inference, ongoing vs resultant state, trying vs past experience, before vs after, instrument vs location, passive vs causative, ongoing interval vs immediate succession, adverse vs beneficial cause, personal experiment vs observed change, reported speech-act, shared vs newly provided information.

Primary authoring file: `prisma/seed-data/practice/pilot.json`.

Deterministic mobile export: `mobile/src/content/practice-pilot.json`.

Each exercise has a stable ID, existing grammar-point prerequisites, an availability-after-lesson gate, complete Korean scene, optional English scene, a prompt that **does not reveal the target lesson title**, curated accepted forms and scopes, answer and distractor explanations, editorial status, educator approval, register/tense constraints and source reference. The multiple-choice format uses full Korean sentences instead of fragments. Both alternative acceptance and situations where a valid alternative is not accepted are explicitly handled by the scoring engine.

## UI and architecture

- **Standalone route:** `/grammar-transfer` (Expo Router file `mobile/src/app/grammar-transfer/index.tsx`).
- **Feature:** `mobile/src/features/grammar-transfer/`. The controller has local React state only.
- Select one of four level units; view explicit prerequisite names and grammar IDs; begin a **six-item** short session alternating contrast and transfer; see specific feedback and curated accepted responses; replay missed items; view session summary.
- The page explicitly states it is an **editorial pilot** and does **not** award SRS mastery, change streaks, read/write account history or sync.
- Availability helpers accept a caller-provided set of learned grammar IDs, but the standalone preview deliberately opens all four units until Agent 00 wires a reviewed mastery contract.
- On a narrow phone, the UI remains single-column with 44px+ controls, fluid width and wrapped buttons. `practiceLayoutWidth` guards width calculations (logic test, not visual-snapshot verification).
- **No edits** to existing grammar seeds, shared navigation, global review, `mobile/src/store`, `mobile/src/db`, authentication, or other agents' files.

## Validate and test

Run from repo root:

```sh
node scripts/port-practice.mjs
node scripts/validate-practice.mjs
cd mobile
npm test -- --runInBand grammar-transfer
npm run typecheck
```

Expected scripted validator checks include: stable IDs, 229 existing grammar IDs, lesson/level prerequisite ordering, complete Korean context, full-sentence options, nonempty feedback, accepted-variant uniqueness, an explicit editorial status, matching accepted-choice validity flags, exact inherited SRS prompt exclusions and source/export parity.

An independent structural/data check over the checked-out remote branch contents was executed by the agent and returned **0 issues**. **Node scripts, Jest, TypeScript compiler, native device rendering and browser visual checks were not executed** in the current connector environment. These remain integration gates; CI result should supersede this handoff.

Unit tests live in `mobile/src/features/grammar-transfer/__tests__/scoring.test.ts` and cover: accepted MC answers, distractors, accepted text variant, wrong register, wrong tense, genuinely valid second options, ambiguous-option blocking, prerequisite filtering, complete session, missed-item replay, missing item/unit and responsive layout width.

## Known linguistic ambiguities and instructional risks

1. **Topic vs subject:** `은/는` and `이/가` reflect discourse and information focus. A topic sentence is not ungrammatical simply because a subject-focus sentence better answers `누가`. Review `ct-001`–`ct-002` with authentic context and consider accepting both when the distinction is not reliable.
2. **Reasons and directives:** `-아/어서` in commands/proposals is restricted in many textbook accounts but colloquial exceptions exist. Review `ct-007`–`ct-008` for pedagogical and dialect/register accuracy.
3. **-겠- functions:** Intention and inference may share identical surface forms. `ct-011`–`ct-012` currently distinguish use through participant roles and speech-act context, not a form-only trick.
4. **Observed vs speaker-experienced changes:** `-더니` and `-았/었더니` have person/subject and evidential constraints. Review `ct-027`–`ct-028`; reject or broaden contexts if another reading is genuine.
5. **Shared vs new information:** `-잖아요` vs `-거든요` is pragmatically nuanced; `ct-031`–`ct-032` require a native-speaker conversation check.
6. **Passive/causative:** `ct-021`–`ct-022` test event role assignment, but some unselected propositions are factually possible in a different context. Keep actor/patient commitments explicit.
7. **Production text answers:** All accepted variants are curated, not automatically generated. A correct unlisted Korean sentence will be marked unverified with an explicit editorial-review message; do not treat this as proof of grammatical incorrectness. A future educator-assisted alternative bank and learner flagging workflow would improve fairness.

**All 52 items have `educatorApproval: "pending"`. No claims of independent linguistic verification are made.**

## Instructor review questions

- Does every distractor *change the intended meaning, tense, register or speech act* rather than merely sound less common?
- Which exact prompts permit **multiple genuinely correct** forms, and what additional context (listener knowledge, agent, time, command strength, discourse focus) would remove that ambiguity?
- Are the selected grammar prerequisites sufficient for learners to handle each new verb, subject and particle?
- Are the explained form/register constraints pedagogically and dialectally accurate for Standard Korean?
- Which new typed response variants should count as equal mastery, and which should remain correct Korean but **not** count as the target skill?
- Are the level and post-lesson gates appropriate after a Korean educator reviews the ordering?

## Integration contract requested from Agent 00

Agent 00 may add a navigation entry to `/grammar-transfer` and, only through an explicitly agreed separate state contract, pass learned grammar IDs into `availableExercises` / `availableUnits`. **Do not** splice session outcomes into grammar review history, SRS scheduling, account sync or mastery without a separately reviewed persistence design. Do not merge to main or deploy from this PR without authorization.
