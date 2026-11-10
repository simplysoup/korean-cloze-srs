# Munpro Curriculum v1 — editorial readiness and staged rollout

**Audit date:** 2026-11-10  
**Pinned Phase 2 source SHA:** `ba94b9ee7ae9374cb6e92d8bab17db38f095f9b6`  
**Audit branch:** `qa/curriculum-v1-readiness`  
**Decision:** **HOLD** for public release; **PILOT ONLY is a conditional proposal**, not an authorization.  
**Owner policy:** undecided; no Korean educator sign-off recorded. **No flags changed.**

## Scope, source inventory and readiness

Readiness meanings: `draft` is internally authored but not sufficiently independently reviewed; `editor_reviewed` means documented internal corrections/checks (never Korean educator certification); `educator_approved` requires authentic individual sign-off on matching fingerprints; `blocked` means a known release gate is unmet. A subset may be `editor_reviewed` while its full workstream remains `draft`.

| Content set | Verified source inventory | Status | Gate before public release |
| --- | --- | --- | --- |
| TOPIK 1 Levels 1–2 grammar | 124 grammar points, 406 clozes, 261 worked examples (791 reviewable items) | `draft`; 193 flagged cloze dispositions are `editor_reviewed` individually | Educator confirmation of prompts, alternatives, register and explanations; preserve existing history |
| TOPIK II Levels 3–6 grammar | 105 points, 315 clozes, 210 examples (630 items) | `draft` / public feature `blocked` | Educator form/level/curriculum assessment, feature-OFF regression, native exclusion policy |
| Contextual answer feedback | Metadata for 721 overlapping clozes; 44 cards / 54 accepted alternate strings; 16 cards / 16 near misses | `editor_reviewed` as curation only, `blocked` for enablement | Resolve whether accepted answers demonstrate target mastery, verify near misses; Agent 12 + 00 runtime bridge and acceptance |
| Foundational vocabulary | Seven decks, 145 unique lexical entries (145 items) | `draft` / live persistence `blocked` | Educator number/counter/usage review; Agent 10 isolation, Agent 08 + persistent adapter; Agent 09 before server sync |
| Language topics + Hangul | Four modules, 14 instructional sections + 12 checks (26 items; 7 Hangul-specific) | `draft` | Verify phonology, register, explanation, correct keys, any audio provenance and accessibility |
| Contrast and transfer pilot | 52 exercises = 32 contrasts / 20 transfers, Levels 1–4 (52 items) | `draft` | Human verify situation/unique answer/distractors; standalone practice validator; no SRS-mastery awards |
| Reading comprehension pilot | Six passages (two each at Levels 1–3) + 24 questions (30 items) | `draft` | Human verify fluency, level, inferential answers, evidence, distractors and rights; no unverified audio |
| **Full distinct educator review census** | **1,674 unique item IDs**, including 471 worked examples and all six passages | **1,674 unsigned / 0 approved** | Signed individual review or explicit owner-authorized clearly labeled pilot |

**Important:** TOPIK denotes approximate level targets, not official TOPIK endorsement. Non-flagged grammar cards are **not** implicitly approved. Existing build-36 experiences must not be treated as newly certified content.

## Inspection evidence and reproducibility

These are **read-only source inspections performed against the pinned SHA through GitHub**, not successful executions of the repository Node/Expo test commands. The current agent environment had no checkout or executable Node dependencies. Do not convert this section into a “validators green” claim.

| Inspection | Outcome |
| --- | --- |
| Source/mobile content drift | **Byte-identical** JSON text for: vocabulary `prisma/seed-data/vocabulary/foundations.json` ↔ `mobile/src/content/vocabulary-foundations.json`; practice `prisma/seed-data/practice/pilot.json` ↔ `mobile/src/content/practice-pilot.json`; comprehension `prisma/seed-data/comprehension/pilot.json` ↔ `mobile/src/content/comprehension-pilot.json`; language topics `prisma/seed-data/language-topics/foundations.json` ↔ `mobile/src/content/language-topics.json` |
| Six generated grammar bundles | 229 unique grammar IDs, 721 unique cloze IDs, 471 examples; 11+11+6+6+6+6 lessons; per-level point/cloze/example counts: L1 65/229/143; L2 59/177/118; L3 32/96/64; L4 25/75/50; L5 24/72/48; L6 24/72/48 |
| Historical remediation | 193/193 distinct flagged IDs resolve in current grammar bundles; all have an editorial disposition; 187 revised/clarified prompts, six heuristic false positives, six cloze-scope repairs (categories overlap; not additive) |
| Answer metadata | All 721 cards indexed; 44 variant-bearing cards (54 strings), 16 near-miss cards (16 strings); 32/44 variant cards overlap flagged backlog, other 12 are new grammar-gap cards |
| Evidence coverage | Source ledger has 229 grammar point records, 229 marked pending educator review; **227 have no item-level source evidence**. Two ledger entries with evidence do not certify full examples |
| Vocabulary edge cases | `6월 → 유월`, `10월 → 시월`, `스물 → 스무` before counters present in authored data; this only checks presence, not every use case |
| Practice and reading integrity | 52 unique practice exercise IDs; 13/17/11/11 by level; all marked `editorial-draft`; 6 unique passages, 24 distinct question IDs and 24 explicit evidence fields; passages remain `editorial-draft` |
| Human approval registry | `docs/research/educator-review/review-records.json` has `reviews: []`, `defaultStatus: not_reviewed`. **0 educator approvals** |
| Priority queue | `docs/research/educator-review/curriculum-v1-priority-queue.json`: **1,674** unique IDs, **18 P0**, **1,206 P1**, **450 P2**; no synthetic approvals |

**Recorded predecessor validation**, not rerun for this audit: Agent 00's handoff at `06985c8` reports `bun scripts/port-content.ts` produced byte-identical generated content; `validate-content`, `validate-flagged-card-fixes`, `validate-topik2-contrast`, `validate-answer-audit`, `validate-vocabulary`, and `validate-language-topics` passed. Its previous full mobile tests, typecheck and web export also passed. The Phase 2 kickoff added type-only seams; **none of this replaces a fresh CI run on the later integrated candidate**.

### Commands that still MUST be executed on a real repository checkout

From repository root, capture stdout/stderr, exit status, timestamp, exact head SHA, and any generated diff:

```sh
bun scripts/port-content.ts
node scripts/validate-content.mjs
node scripts/validate-flagged-card-fixes.mjs
node scripts/validate-topik2-contrast.mjs
node scripts/validate-answer-audit.mjs
node scripts/validate-answer-feedback.mjs
node scripts/validate-vocabulary.mjs
node scripts/validate-language-topics.mjs
node scripts/validate-practice.mjs
node scripts/validate-comprehension.mjs
node scripts/validate-linguistic-qa.mjs --check-only
node scripts/validate-linguistic-qa.mjs --tier=1 --out=/tmp/munpro-educator-tier1
git diff --exit-code -- mobile/src/content prisma/seed-data
cd mobile
npm run lint
npm run typecheck
npm test -- --ci
npx expo export --platform web
```

**Execution status for this Agent 14 audit:** all above CLI commands **NOT RUN** in this session. The read-only inventory above does not exercise the Node validator assertions or the TypeScript seed generator. The release lead/Agent 13 must run and attach exact logs on a frozen integration SHA; any nonzero exit blocks rollout. Do not edit generated source merely to make a check pass.

### Cross-validator coverage gap (action required)

`scripts/validate-linguistic-qa.mjs` detects pilot questions with `prompt`, `question`, or `questionText` fields. The 52 practice exercises use `task`, `accepted` and `contextKorean`, so the generic scanner does **not** enumerate them as reviewable items. It can detect the 24 reading questions through `prompt` but not the six passage records. The separate `scripts/validate-practice.mjs` and `scripts/validate-comprehension.mjs` cover their source-specific structural contracts. **Do not rely on a generic QA green result as coverage of all 1,674.** Agent 00 should obtain Agent 07/validator-maintainer approval for scanner support or wire a dedicated release census check; Agent 14 does not modify that other workstream's script or release CI without approval.

## Prioritized educator queue and substantive decisions

Machine-readable priority queue: `docs/research/educator-review/curriculum-v1-priority-queue.json` (one row per stable ID, source, risk signal and no claimed review). Existing `scripts/validate-linguistic-qa.mjs` is still the source of full Korean/English educator packets and per-item SHA-256 fingerprints; refresh it after any content edit.

- **P0, 18 items:** 11 explicitly flagged natural-but-off-target accepted-answer cases (`cc_e_loc_01`, `cc_e_loc_03`, `cc_e_variant_park`, `cc_e_variant_store`, `cc_hue_01`, `cc_hue_02`, `cc_hue_03`, `cc_hago_01`, `cc_hago_02`, `cc_hago_03`, `cc_and_variant`), and four Hangul sound-change sections / three checks. For each alternative, ask BOTH whether the sentence is natural Korean and whether the target grammar was used; a valid off-target response cannot earn grammar mastery.
- **P1, 1,206 items:** historic flags, remaining curated alternatives/near misses, 31 new grammar forms and their dependent examples, TOPIK II points, all pilot questions/exercises, number/counter vocabulary and missing item-level evidence. Risk flag does not prove incorrect content.
- **P2, 450 items:** remaining authored items. A lower priority is **not** permission to certify or publish them as educator-approved.

Triage specifically includes particle/destination/direction distinctions, tense/register/aspect near misses, TOPIK II passive/causative/formal contrasts, `한/두/세/네/스무` counter usage, `유월/시월`, syllable-final consonants and sound changes, reading inference/answer uniqueness, original author provenance, and plausible context-specific contrast distractors.

## Release gates, staged proposal and reversal

**Non-negotiable gates for ANY user-facing enablement:** owner chooses draft-pilot versus educator-sign-off policy; fresh validators + CI on a frozen SHA; feature-OFF parity to build-36; no regressions to grammar review history; QA of routes and accessibility; clear feedback/report path; correct release copy; no unapproved claims.

For **any persisted vocabulary** additionally require account isolation (issue #10), durable persistence and stale-lease protection (Agent 08/00). For **server-synced vocabulary** require actual authorized backend unknown-field, CAS, race and recovery proof (issue #9). For **native** require independent monotonic migration and old-profile preservation (issue #11), separately authorized. These are not editorial decisions Agent 14 may waive.

Proposed **one-workstream-at-a-time, web-only limited-pilot** sequence *if and only if owner explicitly selects the draft-pilot policy and each gate passes*:

| Stage | Proposed flag change by Agent 00 only | Specific acceptance observation / kill trigger |
| --- | --- | --- |
| 0 | All eight remain `false` | Collect complete QA and immutable candidate SHA; no new content exposed |
| 1 | `topics`, then separately `hangulEnhancements` | Educator checks pronunciation/transcription and teaching clarity; disable on verified incorrect rule/example or inaccessible presentation |
| 2 | `readingComprehension` | All 24 answer keys/evidence spans and six passages individually checked; disable on ambiguous/inaccurate key or reading route fault |
| 3 | `contrastPractice`, then `transferPractice` | All 52 exercises pass standalone QA and human distractor/acceptance check; ensure scores do **not** mutate grammar SRS |
| 4 | `answerFeedback` | Explicit target/off-target/unclassified handling, near misses and legacy OFF behavior; immediately disable on incorrect mastery write |
| 5 | `topik2Grammar` | Level-specific content/lesson prerequisites verified, grammar history preserved, existing user progression tested; any unsafe unlock or regression stops |
| 6 | `vocabulary` | Account-isolated durable local adapter, reload/offline/recovery proof; server sync only after issue #9, explicitly label local-only if authorized |

Do not interpret a table row as instruction to turn the flag on. Each stage requires an explicit owner/lead release decision and follow-up observation before the next. Keep native excluded. Because `CURRICULUM_FLAGS` is a static compile-time object, reversal means Agent 00 changes the flag in a **new tested/redeployed build or reverts the specific release**; there is no remote emergency switch in this contract.

Monitor per content ID/workstream: report rate and verified linguistic severity; `target_correct` vs `valid_off_target` vs `unclassified` distribution and mastery eligibility; failed sessions, review history deltas, vocabulary event durability and missing progress; account cross-contamination; sync conflict/data-loss and device restoration; route errors and accessibility reports. Do not log personal answers or account identifiers into public reports. **Any confirmed cross-account leak, loss of learner history or incorrect mastery credit is an immediate STOP and rollback.** Content defects require disabling the affected workstream or documented fix-and-revalidation. Preserve local/remote user data on reversal; never “rollback” by deleting a store or snapshot.

## Release copy and owner decision needed

Before enablement, owner must choose exactly one:

**A. HOLD for educator sign-off:** no new curriculum surfaced publicly until relevant items have authentic approved records matching current fingerprints, zero open blocking corrections, and safety/release gates pass.

**B. LIMITED DRAFT PILOT:** explicitly authorize small web-only cohort, visible **“Editorial preview — educator review in progress”** labels, noncertification disclosure, feedback link, staged flags and acceptance/rollback gates. No claim of educator approval or official TOPIK affiliation. Individual high-risk content may still be withheld; B does not waive runtime/account/sync safety.

**Current recommendation:** **HOLD**. A pilot is a proposal contingent on the owner's policy decision, fresh tests, successful integration and a separate explicit flag authorization. **GO is not supported** by present evidence.

## Content review record / change control

Follow `docs/research/educator-review/rubric-and-intake.md`. The unsigned example is in `educator-signoff-template.json`, not in the active registry. Require actual identity/role, date, source SHA and per-item fingerprint, reviewed IDs, seven dimension judgments, accepted/near-miss decisions, checked source scope, corrections and append-only decision history. A revision invalidates old approval until re-reviewed. Send proposed corrections as a prioritized source-ID backlog to Agent 00/content owner; do not silently edit seed data, UI, flags, syncing, or other agents' code.
