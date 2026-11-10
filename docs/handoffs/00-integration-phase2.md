# Agent 00 — Curriculum v1 Phase 2 integration handoff (interim)

**Status:** coordination and TypeScript seam published; no Phase 2 specialist PR merged; **RELEASE NO-GO**.  
**Date:** 2026-11-10 (America/Toronto)  
**Repository:** https://github.com/simplysoup/korean-cloze-srs  
**Integration branch:** `integration/curriculum-v1`  
**Phase 2 coordination SHA:** `ba94b9ee7ae9374cb6e92d8bab17db38f095f9b6`  
**Draft integration PR:** https://github.com/simplysoup/korean-cloze-srs/pull/8  
**Original checked parent:** `06985c8dbf72fd58e5431652ebc8bc42f083bafa`

This is **not** a finished release signoff. Update this document after each new Phase 2 merge, test pass and release decision.

## 1. Completed work and scope

- Verified current branch and draft PR #8 before work; confirmed branch head was exactly the stated parent SHA.
- Verified all seven prior Phase 1 specialist PRs #12–#18 already merged into integration; their implementation is NOT repeated here. Historical stacked draft PRs #2–#7 are still ancestors.
- Published `ba94b9ee7ae9374cb6e92d8bab17db38f095f9b6` with **only**:
  - `mobile/src/features/contracts/phase2.ts` — type-only account epoch lease, durable vocabulary review events, injected storage seam and future-only sync envelope.
  - `docs/planning/curriculum-v1-phase2-coordination.md` — ownership, dependencies, explicit branch SHA, PR ledger, test/release gates.
- Updated draft PR #8 description from outdated Phase 1 status; posted an agent kickoff comment. No feature flags, runtime storage/sync behavior, SQLite schema, package manifests or server behavior changed.
- Agent 00 is sole integrator for new PRs. Agents 08–14 must branch from the exact kickoff commit; new PR URLs are **not yet recorded**.

## 2. Verified automated checks

**Head `ba94b9ee7ae9374cb6e92d8bab17db38f095f9b6`:**

- [GitHub Actions push run 42925256858](https://github.com/simplysoup/korean-cloze-srs/actions/runs/42925256858): **completed / success**.
- [GitHub Actions PR run 42925265074](https://github.com/simplysoup/korean-cloze-srs/actions/runs/42925265074): **completed / success**.
- Both job logs report successful `npm ci`, content-generation reproducibility, grammar catalogue validation, `validate-content.mjs`, `validate-vocabulary.mjs`, `validate-answer-audit.mjs`, `validate-topik2-contrast.mjs`, `validate-flagged-card-fixes.mjs`, `validate-language-topics.mjs`, `npm run typecheck`, `npm test -- --ci` and `npx expo export --platform web`.
- **Limitations:** This CI workflow does **not** execute `npm run lint`; its pass must not be claimed for the new commit. No local source checkout was possible in the execution environment (GitHub DNS unavailable), so no local command run is claimed. No manual browser, account-switch, offline, two-device, reinstall/recovery, native emulator/device or real-backend acceptance test has been performed in this pass.
- The preceding integration checkpoint `06985c8...` reported 26 Jest suites / 222 tests, lint/typecheck and 11 validators passing. Those reported figures are historical, not independently counted for the kickoff head.

## 3. Live code / contract observations

- `mobile/src/store/state.ts` still uses shared IndexedDB `state-v1` and restores a cached document before assured account ownership.
- `mobile/src/store/sync.ts` currently performs pull/merge/push without a server version precondition. `mobile/src/lib/api.ts` posts the full document with `updatedAt`, not a compare-and-swap version.
- The real auth/sync implementation is external `~/korean-auth/server.js` and was **not** accessed. Unknown-field preservation, two-device races and recovery remain unverified.
- `mobile/src/features/vocabulary/core/**` has pure FSRS logic but no wired persistent `VocabController` facade. The existing `VocabularyProvider` explicitly supports a null controller.
- `mobile/src/features/contracts/answers.ts` requires `target_correct` to be the only mastery-eligible outcome; the live Learn/Review screens still use legacy grading.
- Eight static `CURRICULUM_FLAGS` in `mobile/src/features/flags.ts` are all `false`. TOPIK II remains gated. No feature was enabled.
- Native content versioning is separately unresolved; do not equate web content parity with native reseeding.

## 4. `main` drift and release ancestry

At kickoff, comparison showed `integration/curriculum-v1` **161 commits ahead and 2 behind** `main`, merge base `19aea4f716c463bfc8ce33f895ad5e2c34cfe678`. After the Phase 2 kickoff, the reverse comparison reported two independent `main` commits touching:

- `mobile/__tests__/store.test.ts`
- `mobile/src/app/(tabs)/learn.tsx`
- `mobile/src/app/(tabs)/review.tsx`
- `mobile/src/app/hangul.tsx`
- `mobile/src/lib/use-enter-advance.ts` (new build-36 Enter-to-advance behavior)
- `mobile/src/store/queries.ts`

**No merge/rebase/squash of `main` has occurred.** Resolve behavior/test parity at the integration stage with preserved ancestry and a separate test matrix; do not silently override build-36 changes.

## 5. Agent dependencies / PR ledger

| Agent | Work | PR | Merge disposition |
|---|---|---|---|
| 08 | Durable vocabulary controller (then lead-owned adapter) | Pending | Blocked on 10 for persistent wiring |
| 09 | Actual backend schema/CAS/recovery verification | Pending | Hard gate for vocabulary remote sync |
| 10 | Account-isolated web state/auth and epoch safety | Pending | Merge first after test proof |
| 11 | SQLite content migration/parity | Pending | Native excluded pending device proof |
| 12 | Contextual answer feedback bridge | Pending | Lead's Learn/Review wiring afterward |
| 13 | Independent frozen-candidate acceptance | Pending | Run after merge candidate is frozen |
| 14 | Educator readiness/approval record | Pending | Human educator signoff not implied |

All new in-repo PRs target `integration/curriculum-v1`; all branches start from `ba94b9ee7ae9374cb6e92d8bab17db38f095f9b6` unless a later base is explicitly communicated by Agent 00. Do not co-edit Agent 10's `store/state.ts`/`auth.ts` or Agent 11's `db/**` paths.

## 6. Outstanding blockers and test evidence needed

- [#9](https://github.com/simplysoup/korean-cloze-srs/issues/9): prove unknown optional sync fields survive real backend round trip, stale expected versions are rejected, concurrent writes are retried safely and vocabulary events are unioned deterministically; use fake accounts/non-production server only.
- [#10](https://github.com/simplysoup/korean-cloze-srs/issues/10): preserve existing grammar progress while scoping IndexedDB by authenticated identity; invalidate async persistence and sync on account/token change; verify account switches, logout, offline restarts, old cache provenance and cross-account non-disclosure.
- [#11](https://github.com/simplysoup/korean-cloze-srs/issues/11): versioned native content migration of corrected cards without resetting grammar review history; emulator/device verification required.
- Functional wiring: persistent `VocabController` + keyed provider, gated legacy-preserving Learn/Review evaluator bridge, gated navigation and content entry-point verification.
- Content: educator approval pending; authored validation cannot substitute for human signoff.
- Release: build-36 parity, real acceptance evidence, independent QA and owner decision missing.

## 7. Current GO / NO-GO by surface

| Surface | Current disposition | Reason |
|---|---|---|
| `main` merge / web curriculum release | **NO-GO** | Account isolation, combined tests, build-36 parity and explicit authorization pending |
| Existing grammar behavior with flags OFF | **Unverified for parity**, not released from integration | GitHub CI is green but end-to-end build-36 regression not performed |
| Vocabulary decks / review | **NO-GO** | Facade, account-scoped persistence and event durability not integrated |
| Vocabulary server sync | **NO-GO** | Issue #9 actual backend contract and two-device tests |
| Answer feedback | **NO-GO** | Agent 12 bridge and lead-owned screen wiring missing |
| Language topics / Hangul extensions | **OFF / NO-GO** | Navigation/entry-point acceptance and approval pending |
| Contrast / transfer practice | **OFF / NO-GO** | Feature gating and acceptance pending |
| Reading comprehension | **OFF / NO-GO** | Feature gating and acceptance pending |
| TOPIK II advanced grammar | **OFF / NO-GO** | Approval/acceptance and explicit enablement decision pending |
| Native | **EXCLUDED / NO-GO** | Issue #11 migration and device evidence missing |
| Educator-approved claims | **NOT APPROVED** | No human signoff |

## 8. Migration and rollback

**No migration occurred in this pass**. The kickoff types and coordination doc can be reverted without modifying learner state. Do not revert Phase 2 as a substitute for clearing a corrupted or cross-account cache; preserve historical records and provide a verified recovery path. Future user-progress or backend migrations require forward-compatible schema changes, versioned backups, tested restore and an explicit rollback plan that does **not** delete reviews or reassign IDs. Never deploy a backend migration or touch real user records without separate owner authorization.

## 9. Next lead actions

Review/merge Agent 10 first; then Agent 08 and lead's durable account-scoped controller/provider wiring; then Agent 12 and lead's gated Learn/Review wiring. Require Agent 09's actual backend concurrency evidence before any vocabulary server sync; handle Agent 11 native separately. Review Agent 14 readiness and run Agent 13 independent QA on the frozen candidate. Resolve `main` drift; rerun lint, all validators, typecheck, Jest, web export, CI, and manual synthetic-account acceptance after each relevant merge. Update this handoff and PR #8 with actual results; keep all flags OFF until separately authorized.
