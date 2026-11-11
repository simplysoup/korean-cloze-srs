# Agent 14 — Curriculum v1 content readiness handoff

**Repository:** `simplysoup/korean-cloze-srs`  
**Branch:** `qa/curriculum-v1-readiness`  
**Draft PR:** https://github.com/simplysoup/korean-cloze-srs/pull/24 → `integration/curriculum-v1`; only Agent 00 may merge.  
**Correct Phase 2 start SHA:** `ba94b9ee7ae9374cb6e92d8bab17db38f095f9b6`.  
**As-of:** 2026-11-10. No release, main merge, deploy, flags or curriculum writes authorized.

## Release disposition

**Public release: HOLD.** A **PILOT ONLY** option exists if the owner explicitly permits clearly labeled editorial-draft content and each integration/feature acceptance gate passes. **GO is not evidenced.** Zero educator-approved records exist; 1,674 unique content items are unsigned. Machine checks and historical editorial dispositions are not Korean educator certification.

**Owner decision required (NOT decided by Agent 14):**
- **A — Hold** all new curriculum features pending real item-level educator sign-off.
- **B — Permit a bounded web-only, visibly editorial-draft pilot**, with explicit warning, no educator/TOPIK official claims, independent runtime/account/sync tests, monitoring, cancellation and stage-by-stage approval.

Both A and B still require explicit integration/flag authorization. Neither authorizes native or unsafe vocabulary sync.

## Changed-file inventory (exclusive owned scope)

1. `docs/research/educator-review/curriculum-v1-priority-queue.json` — deduplicated risk-ordered full 1,674-item coverage and sources; 18 P0 / 1,206 P1 / 450 P2, zero synthetic approvals.
2. `docs/research/educator-review/rubric-and-intake.md` — seven linguistic dimensions, five curricular/accessibility checks, educator intake and record protocol, source evidence rules, public release copy.
3. `docs/research/educator-review/educator-signoff-template.json` — unsigned sample; identity and qualifications are null until actual review, matching source hashes required.
4. `docs/research/educator-review/validation-evidence.json` — machine-readable logs of read-only source audits and explicit NOT RUN CLI status.
5. `docs/qa/curriculum-v1/content-readiness.md` — audited inventory/table, drift results, risk decisions, proposed staged enablement, rollback, owner policy gate.
6. `docs/handoffs/14-content-readiness.md` — this handoff.

**Unchanged:** `review-records.json`, all source seeds, generated bundles, validators, flags, sync, UI, DB, API, packages and other agent handoffs. No new editorial-only validator was added without Agent 00 approval.

## What was actually checked

Read-only repository JSON inspections at the Phase 2 kickoff SHA:
- Four source/mobile pairs **byte-identical**: vocabulary, practice, reading and language topics; **zero observed drift in these pairs**.
- Unique grammar inventory: **229 points, 721 clozes, 471 examples**; 193/193 flagged IDs have dispositions; 44 cards/54 accepted variants and 16 cards/16 near misses in feedback metadata.
- **227/229 grammar points** lack item-specific ledger evidence; all 229 list educator pending.
- **145 vocabulary entries**, 52 practice exercises (32 contrast, 20 transfer), six passages/24 questions, four topics/14 sections/12 checks; 1,674 deduplicated review IDs across all sets.
- `review-records.json` has `reviews: []`: **0 genuine human educator decisions**.
- Inspected code of generic `validate-linguistic-qa.mjs`: its pilot question detection misses practice `task` shape and passage-level units; use dedicated `validate-practice` and `validate-comprehension` plus explicit census. Ask the owning validator maintainer/Agent 00 to resolve coverage before asserting complete linguistic QA.

**Original Node/Expo validators and generation commands NOT executed in this tool environment.** See `validation-evidence.json` for commands and `content-readiness.md` for the exact gating checklist. Earlier passes reported by Agent 00 at `06985c8` are useful predecessor evidence but not fresh results on an integrated candidate.

## Required conditions before proposing a flag change

1. Agent 00 reruns full content port + all applicable validators, and uploads exact stdout/stderr, exit code and SHA. No generated drift, broken ID, invalid key or stale answers allowed.
2. Obtain actual educator judgments or the explicit owner B pilot policy. High-risk off-target/mastery cases and Hangul sound changes need priority review. Preserve signed item hashes and correction history; route any proposed data fix to the content owner, never silently patch source.
3. Agent 13 validates a frozen integration SHA including feature-OFF build-36 parity and manual accessibility/usability evidence.
4. Block vocabulary persistent writes until #10/08/00 persistence acceptance; block vocabulary server sync until #9 actual backend race/CAS/recovery proof. Block native until #11 independently tested migration.
5. Agent 00 alone authorizes and changes one flag at a time, following order: `topics` → `hangulEnhancements` → `readingComprehension` → `contrastPractice` → `transferPractice` → `answerFeedback` → `topik2Grammar` → `vocabulary`, each after prior stage monitoring. This is proposed sequencing, not a command or simultaneous enablement.

## Blockers and reviewer decisions remaining

- **Educator sign-off:** 1,674 unsigned review IDs; 193 formerly flagged clozes are editor-remediated, not independently certified. 11 natural/off-target alternatives need explicit target-mastery decision.
- **Evidence:** 227 grammar points have no item-level ledger citation; references are form leads only.
- **Coverage:** generic QA scanner misses practice task records and passage records. Dedicated validators must be executed and maintainers should close census gap.
- **Execution:** fresh command logs, CI and integrated candidate acceptance not supplied by this agent; **HOLD** until attached.
- **Owner:** choose A (hold) or B (limited labeled draft pilot) and separately authorize each rollout stage.
- **Runtime:** Issues #9 server sync, #10 account isolation, #11 native parity and Agents 08/12 wiring remain independently required. This handoff does not assert they are resolved.

## Monitoring, rollback and safety

When an authorized pilot exists, monitor content-ID reports (including language/explanation accuracy), grading/mastery classification, lost/duplicate progress, sync conflicts, cross-account exposure, inaccessible UI and restoration failures. Any verified account mixing, history loss or bad mastery credit is an immediate STOP. Only Agent 00 reverts the individual **static compile-time flag** in a tested build or rolls back deployment; do not delete IndexedDB, server snapshots, grammar review history or native data. If this documentation PR must be backed out, revert its docs-only commits; no runtime or data migration was applied.

**No educator certification, no flag enablement, no deployment, no `main` merge.**
