# Curriculum v1 integration handoff (Agent 00)

**Date:** 2026-11-10 (evening EST)
**Integration branch:** `integration/curriculum-v1` at `c4bbfd7`
**Baseline:** `c17cfab84f978056e55665b40fbeaec92ca044ce` (draft PR #7)
**Release disposition:** NOT RELEASED. All workstream flags disabled. Do not deploy or merge to main without explicit owner authorization.

## 1. Integration PR and merge order

- **Integration PR:** https://github.com/simplysoup/korean-cloze-srs/pull/8 (draft, targets `main`, 52 files, +47,292/−881). Do NOT merge to main.
- **Feature PR targeting integration:** https://github.com/simplysoup/korean-cloze-srs/pull/12 (draft, `qa/curriculum-educator-readiness` → `integration/curriculum-v1`, 4 files, +674, mergeable, CLEAN). This is the only feature PR so far.

**Proposed merge order into `integration/curriculum-v1` (per the contract doc):**

1. Vocabulary engine (no UI) — **MISSING. Blocker.** No branch, no `controller.ts` anywhere. Agent 00-owned (`mobile/src/features/vocabulary/controller.ts`).
2. Vocabulary UI — `feat/vocabulary-ui` (6 files, +648). Ready to review; blocked on (1) because the provider takes a `VocabController | null` and no controller exists.
3. Answer evaluation and feedback — **MISSING. Blocker.** No branch exists.
4. Topics and Hangul — `feat/language-foundations` (13 files, +1,176).
5. Contrast/transfer practice — `feat/grammar-transfer` (1 file, +2,159; seed data only).
6. Reading comprehension — `feat/reading-comprehension` (11 files, +1,808).
7. Linguistic QA and release checks — `qa/curriculum-educator-readiness` (PR #12, mergeable, CLEAN).

No merges were performed in this pass. Nothing was merged to `main` and nothing was deployed.

## 2. Changed-file inventory (integration branch vs baseline c17cfab)

7 files, +484/−4 (commits `859ea12`, `0ed0b06`, `c4bbfd7`):

- `docs/planning/curriculum-v1-integration-contract.md` (new, 129 lines)
- `mobile/__tests__/curriculum-contracts.test.ts` (new, 96 lines)
- `mobile/src/features/contracts/answers.ts` (new, 69 lines)
- `mobile/src/features/contracts/practice.ts` (new, 66 lines)
- `mobile/src/features/flags.ts` (new, 21 lines)
- `mobile/src/features/vocabulary/contracts.ts` (new, 80 lines)
- `mobile/src/store/content.ts` (modified; gates unpublished TOPIK II bundles, dedupes catalogue decks)

**Feature-branch file inventories** (each vs `integration/curriculum-v1`, all merge clean — verified with `git merge-tree --write-tree`, no conflicts):

- `feat/vocabulary-ui`: 6 files under `mobile/src/features/vocabulary/ui/` (Components, DeckScreens, VocabularyProvider, content, presentation, session-state). No owned files touched.
- `feat/reading-comprehension`: 11 files (`mobile/src/features/comprehension/` ×6 incl. 3 test files, `mobile/src/content/comprehension-pilot.json`, `prisma/seed-data/comprehension/pilot.json`, `scripts/port-comprehension.mjs`, `scripts/validate-comprehension.mjs`). Does not touch owned `mobile/src/app/reading.tsx`.
- `feat/grammar-transfer`: 1 file (`prisma/seed-data/practice/pilot.json`, 52 exercises).
- `feat/language-foundations`: 13 files (`mobile/src/features/topics/` ×6, `mobile/src/features/phonology/` ×4, `mobile/src/app/topics/` ×2, `mobile/src/app/hangul/sound-changes.tsx`). Does not touch owned `mobile/src/app/hangul.tsx` (the new route is a subdirectory file, not that file).
- `qa/curriculum-educator-readiness`: 3 files (`docs/research/educator-review/README.md`, `docs/research/educator-review/review-records.json`, `scripts/validate-linguistic-qa.mjs`).

No feature branch touches any Agent 00-owned file (store, sync, api, db, _layout, AppHeader, learn/review screens, contracts, controller, flags, workflows, lockfiles).

## 3. Contract definitions and deviations

**Contracts frozen** (commit `859ea12`, enforced by `mobile/__tests__/curriculum-contracts.test.ts`):

- Vocabulary: `VocabDeckSummary`, `VocabPrompt`, `VocabProgress`, `VocabReviewResult`, `VocabController` with `listDecks()`, `getSession(mode, limit)`, `submitAnswer(promptId, answer)`, `revealAnswer(promptId)`, `getProgress(deckId)`. Vocabulary review state is separate from grammar-point review state; stable vocabulary entry IDs, never grammar point IDs.
- Answer evaluation: outcomes `target_correct`, `valid_off_target`, `near_miss`, `incorrect`, `unclassified`; canonical answer, accepted alternatives, explanation, optional error type, explicit `targetMasteryEligible` (true only for `target_correct`). Unfamiliar responses without sufficient evidence must be `unclassified`, never `incorrect`.
- Practice/comprehension: exercise IDs, prerequisite grammar IDs, `ContentReadiness` (`draft` / `editor_reviewed` / `educator_approved` / `blocked`), response and explanation types, reading passages. Practice never awards grammar mastery.

**Deviations:** none in the frozen contracts. Two coordination deviations (not contract changes):

- Four feature branches were created from `c17cfab` (before the contract commit), not from `integration/curriculum-v1` after it: `feat/reading-comprehension`, `feat/grammar-transfer`, `feat/language-foundations`, `qa/curriculum-educator-readiness`. Only `feat/vocabulary-ui` is based on the contract commit (`859ea12`). They all merge cleanly into integration, so no rebase is required; the fix is to open PRs targeting `integration/curriculum-v1` and let the merge bring in the contract commits. Do not rewrite their history.
- `mobile/src/features/vocabulary/controller.ts` is listed in Agent 00's exclusive ownership but does not exist yet (see blockers).

## 4. CI links and test results (integration branch, this pass)

GitHub Actions, Mobile (Expo) workflow, all `completed success` on `integration/curriculum-v1`:
- Run 42918347031 (PR #8, 1m34s), 42918034562 (PR #8, 1m42s), 42918024769 (push c4bbfd7, 1m54s), 42917560013 (PR #8, 1m45s), 42917540760 (push 0ed0b06, 1m22s).
- PR #12 has no checks reported on its branch.

Local gates run on `integration/curriculum-v1` at `c4bbfd7` (this pass, all pass):

- `bun scripts/port-content.ts` — pass; regenerated JSON is byte-identical to committed files (no `git status` changes).
- `node scripts/validate-content.mjs` — pass (229 points, positions continuous 1–229).
- `node scripts/validate-flagged-card-fixes.mjs` — pass (193/193 QA decisions).
- `node scripts/validate-topik2-contrast.mjs` — pass.
- `node scripts/validate-answer-audit.mjs` — pass (93 cards).
- `node scripts/validate-vocabulary.mjs` — pass (7 decks, 145 entries, no grammar ID mixing).
- `node scripts/validate-language-topics.mjs` — pass (4 topics, 12 questions).
- `npm ci` — pass. `npm run typecheck` — pass. `npm test -- --ci` — pass (13 suites, 127 tests). `npx expo export --platform web` — pass.

## 5. Migration and rollback procedure

- **Current state:** no migration. `CONTENT_VERSION` remains `grammar-gaps-v2-20261110` (`mobile/src/db/index.ts`). No SyncDocument shape change has been made; no vocabulary progress is written to the server snapshot. Existing snapshots remain readable; grammar progress is preserved exactly.
- **Rollback of the contract commit:** reverting `859ea12` (plus `0ed0b06`/`c4bbfd7`) removes only type declarations, disabled flags, and planning docs. It touches no learner progress. No data migration is run.
- **Future vocabulary sync migration (not yet built):** when the engine is built, vocabulary progress must be optional for old snapshots, keyed by stable vocabulary entry ID, separate from `grammarPointId` records, with append-only unique review event IDs that survive two-device unions. It must NOT be enabled until a compatible backend migration and a two-device race test prove the server preserves unknown fields. The server is external (`~/korean-auth/server.js`, not in this repo); its behavior for unknown JSON keys and concurrent pushes is unverified — do not bypass this.
- **Native:** native SQLite seed short-circuits when `CONTENT_VERSION` is unchanged, so PR #7 editorial fixes will not reseed existing native profiles unless a reviewed version migration is implemented. Native is excluded from release until explicitly tested.

## 6. Unresolved blockers

1. **Vocabulary engine missing (step 1).** No `VocabController` implementation exists in any branch. `feat/vocabulary-ui` accepts `controller: VocabController | null`, so it can merge inert behind the flag, but the vocabulary workstream cannot function until the engine is built. This is Agent 00-owned work.
2. **Answer evaluation missing (step 3).** No branch implements the `AnswerEvaluator` from `contracts/answers.ts`. The historical Boolean grammar grader remains the production grader.
3. **Four feature branches have no PRs.** `feat/vocabulary-ui`, `feat/reading-comprehension`, `feat/grammar-transfer`, `feat/language-foundations` need PRs targeting `integration/curriculum-v1` before review/merge.
4. **Four feature branches based pre-contract** (see §3). Mergeable as-is (verified clean), but the base should be noted in each PR.
5. **Server sync behavior unverified.** Unknown-field preservation and concurrent-push behavior of `~/korean-auth/server.js` are not proven. This blocks enabling synced vocabulary progress.
6. **Educator approval pending.** Content is not educator-certified; the 193-card remediation is "human review pending" and TOPIK II contrast review status is "pending". Do not present any of it as educator-certified or official TOPIK material.
7. **PR #12 has no CI checks reported.** Verify the workflow runs on its branch before merging.

## 7. Feature flag state (every workstream)

All in `mobile/src/features/flags.ts` (`CURRICULUM_FLAGS`, frozen). All `false` (default deny):

| Flag | State | Notes |
|---|---|---|
| `topik2Grammar` | `false` | TOPIK II bundles gated in web catalogue; native bundles all six. |
| `vocabulary` | `false` | Engine missing; UI exists but has no controller. |
| `answerFeedback` | `false` | Evaluator missing; Boolean grader remains production. |
| `topics` | `false` | `feat/language-foundations` exists, unmerged. |
| `hangulEnhancements` | `false` | Phonology route exists in `feat/language-foundations`, unmerged. |
| `contrastPractice` | `false` | `feat/grammar-transfer` seed data exists, unmerged. |
| `transferPractice` | `false` | Same as above (same branch). |
| `readingComprehension` | `false` | `feat/reading-comprehension` exists, unmerged. |

## 8. Release checklist (tested vs untested)

**Tested (this pass, on `integration/curriculum-v1`):**
- Content generation + all seven validators (see §4).
- `npm ci`, typecheck, Jest (`--ci`, 13 suites / 127 tests), `expo export --platform web`.
- Merge cleanliness of all five feature branches (no conflicts).
- Ownership check: no feature branch touches an Agent 00-owned file.
- CI: Mobile (Expo) workflow green on the integration branch (5 recent runs).

**Untested / not yet done:**
- Manual tests: fresh user, existing user with grammar progress, empty library, offline review + restart, second-device sync, expired session + account recovery, new vocabulary session + review, unknown/near-miss grammar answer, responsive mobile/desktop layout.
- Native (iOS/Android): explicitly excluded from release until tested; no native parity.
- Two-device race test for vocabulary progress (blocked on the engine + server verification).
- Account-switching/logout isolation against IndexedDB snapshots.
- Reinstall/account-recovery restore from a verified server snapshot.
- PR #12 CI (no checks reported).
- The four un-PR'd feature branches have not had their own CI runs against `integration/curriculum-v1` as a base.

**Do not deploy. Do not merge PR #8 to `main`.** The next actions are: build the vocabulary engine (Agent 00), create the answer-evaluation branch, open PRs for the four un-PR'd feature branches targeting `integration/curriculum-v1`, then review and merge in the order in §1.
