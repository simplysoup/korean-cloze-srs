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


---

## Addendum — Agent 00 disposable combined-candidate acceptance (2026-11-10 / Nov 11 UTC)

**This is test evidence, not a release approval.** No specialist PR was merged to integration; `main` and the deployed backend were not changed. A separate test branch was built by copying the disjoint changed-file snapshots of PRs #19–#25 onto integration head `ad13d53e24faf89cf960052cf5f226df60ce6745`, with no path overlaps:

- **Disposable test branch:** [`qa/agent00-combined-dry-run-v1`](https://github.com/simplysoup/korean-cloze-srs/tree/qa/agent00-combined-dry-run-v1).
- **Combined snapshot SHA:** `141809d4a092485444398f73bbe92cda06170c70` (49 specialist-changed files); not an actual Git merge of PR histories.
- **Combined test outcome:** [Mobile CI 42936140122](https://github.com/simplysoup/korean-cloze-srs/actions/runs/42936140122) — content-source reproducibility, grammar/content validators, TypeScript **PASS**; Jest **36/37 suites, 289/292 tests PASS**, three `release-account-isolation.test.ts` failures; web export skipped by standard CI because Jest failed. The three QA test failures use an old direct token/login sequence that does not bind a new verified account token; they receive `no-token` instead of reaching the intended old-token/offline/unauthorized test paths. This does not prove account isolation is correct. Lead-owned session activation/sync guards are still needed, then QA should exercise the actual verified-auth sequence and rerun unchanged privacy assertions.
- **Additional browser smoke infrastructure (test branch only):** added `scripts/agent00-acceptance/browser_smoke.py` and `.github/workflows/agent00-acceptance.yml`. Workflow is isolated to the disposable branch; it serves the real exported web UI with a loopback **mock** /api auth/sync server. It never contacts production or staging and only uses `qa.invalid` identities. The runner was pinned to Ubuntu 24.04 after an initial Playwright/Ubuntu 26.04 support failure.
- **Actual browser run:** [Agent 00 CI 42936935269](https://github.com/simplysoup/korean-cloze-srs/actions/runs/42936935269) at `80a73847389a32d7379ad62f226fecc7028c0e7c` — **SUCCESS**. `npm ci`, `npm run lint`, Agent 09's Node harness fixture and negative-control tests, `npx expo export --platform web`, Chromium installation and **seven** rendered Playwright account-flow assertions all passed: app renders auth, synthetic account A email-code sign-in, UI logout, synthetic B sign-in, B sees no A-seeded library, B persists after reload, B mock-backend snapshot does not acquire A's library.
- **Limitations:** The browser was a single Chromium profile; not a true two-device race, a production backend, a real staging deployment, native device, or complete viewport/navigation matrix. It used a deliberately disposable loopback backend stub. The separate Jest failure remains unresolved. A passing fixture cannot certify real server compare-and-swap or unknown-field handling.

### Actual backend access and remaining work

A repository-access check found **no** `korean-auth` backend repository in the connected GitHub installation, no `~/korean-auth/server.js` in the execution container, and no authorized staging server, disposable bearer sessions or actual backend schema. The only authoritative server description available is `docs/planning/sync-server-accounts.md`, a design document, not a verified implementation. The execution container also cannot resolve external GitHub or app hosts directly.

For real validation of issue #9, the backend owner must provide an **authorized non-production copy of the actual server, a versioned schema/database migration, a staging endpoint reachable to the test runner, and synthetic sessions** for two sessions of account A, one of account B and expired/revoked sessions. Record backend SHA and restart evidence. Run Agent 09's opt-in `scripts/sync-server-contract/run.mjs` against that instance, using an actually agreed precondition field and a clean disposable database. Preserve sanitized, reproducible pass/fail output and independently verify old-client compatibility, simultaneous writes, 409/412 stale rejection, retry unions, unknown-key preservation, account separation, recovery and rollback. **Never point it at the real production database or real user accounts**.

**Current decision unchanged: NO-GO for web integration, remote vocabulary sync, native and feature enablement**. All 8 flags remain OFF; draft PR #8 stays draft. Do not close #9 or #10 or claim full end-to-end acceptance until the missing gates are proven.


---

## Addendum — actual uploaded backend code: isolated Node+SQLite acceptance (2026-11-11)

**Backend source provenance:** user supplied `server.js` as a private conversation upload. SHA-256: `7bba0c2567fbf2b386a113a06232f84754f08fef403cb8cef3c1dce09aeb444d`. **Do not copy this private backend source or credentials into the public app repository.** The VPS operator reports a separate `~/korean-auth-staging/` copy at `127.0.0.1:28769` with empty `munpro.db` and configured SMTP. This ChatGPT container does **not** have the SSH forwarding script, VPS credentials or access to the VPS loopback service; its running staging instance and source hash remain unverified.

Agent 00 **executed the actual unmodified uploaded backend** with Node `v22.16.0` on a disposable local loopback port, fresh SQLite DB and no copied `.env` (therefore no Gmail traffic). Tests used fake `@qa.invalid` accounts and the server's local code relay. Source-level and HTTP-level evidence:

- **Unmodified source: 15/21 PASS, 6 FAIL**. The six failures: blind old-client sync push accepted with no revision precondition; old-client omission irreversibly deletes optional `vocabularyProgress`; concurrent same-version pushes both return 200; one of the two review logs is lost; stale write replays and increments the server version; >2MiB payload destroys TCP connection rather than returning a structured HTTP 413.
- Positive tests: actual email-code verification, valid/invalid password login, code replay rejection, independent bearer-account snapshots, malformed/sparse payload rejection, revoked/expired session rejection, persistence after stopping/restarting the **isolated local process**, and SQLite integrity check.
- Agent 00 produced a **candidate patch locally only**, requiring an integer `expectedVersion`, atomic SQLite `WHERE version = ?` CAS (HTTP 409 on conflict, 428 on no precondition), preserving unknown top-level namespaces when older clients omit them, and bounded-byte HTTP body reads returning 413. **Patched local source: 21/21 PASS, 0 FAIL**, including a real concurrent two-session race and successful re-pull/union/retry. This patch was **not** committed to this public repo, installed on the VPS, or deployed.
- A staging-only operator probe was separately self-tested against disposable local replicas of `~/korean-auth-staging`: unmodified code **5/9 PASS**, candidate code **9/9 PASS**. These are **not** live VPS results. The probe can be copied to the VPS and run only on an initially empty staging DB; it inserts/deletes fake users and tokens without emailing anyone and emits a sanitized report.
- Critical protocol rollout warning: the **current live build-36 web client** sends `{updatedAt, payload}` without `expectedVersion`. The candidate CAS server would intentionally reject those old pushes. **Do not deploy the backend patch independently**; require an application-side server revision protocol, explicit 409/412 re-pull/deterministic union and bounded retry, client-compatible staged migration, and retention of local dirty state on conflict/error.

**Issue #9 remains OPEN / NO-GO.** Real VPS staging proof still requires an operator-run test of the actual staging process, source checksum, clean synthetic sessions and sanitized evidence, then controlled restart/recovery, two-device browser testing and backend/client compatibility. Production data, SMTP credentials, live flags and `main` remain untouched. The exported patch/test/report and instructions reside in this ChatGPT conversation, not public git history.

---

## Addendum — VPS staging verification: all six sync defects reproduce live (2026-11-12)

**Operator:** Muse (SSH-enabled environment, via `~/workspace/vps-ssh.sh`).
**Handoff executed:** `MUNPRO_VPS_STAGING_HANDOFF.md` (Steps A and D as written;
Steps B and C could not run verbatim — the companion ZIP with
`munpro_backend_audit.py` / `munpro_staging_probe.py` was not uploaded.
An operator-written probe, `munpro_staging_probe_local.py`, tested the
same six defects with the handoff's safety properties: staging only
`127.0.0.1:28769`, no `/api/auth/request-code`, no email, synthetic
`@qa.invalid` users/sessions created directly in SQLite, only its own
rows deleted in a `finally` block, sanitized report at
`~/korean-auth-staging/staging-audit-sanitized.json` mode 0600.)

**Source identity:** staging `server.js` SHA-256
`7bba0c2567fbf2b386a113a06232f84754f08fef403cb8cef3c1dce09aeb444d` —
exactly the uploaded original. Staging process PID 1971915 runs it from
`~/korean-auth-staging` (`/home/soup/node22/bin/node server.js`), not
restarted. Health `{"ok":true,"emailConfigured":true,"sync":true}`.
Staging DB was empty before (0/0/0) and returned to empty after.

**Live probe: 3/9 checks passed.** All six defects reproduce on the
actual staging process:
1. Push without `expectedVersion` accepted (200) — no precondition enforced.
2. Older client omitting `vocabularyProgress` erases that namespace.
3. Same-user concurrent pushes both return 200 (versions 5 and 6) — no CAS.
4. One device's review lost in the race (only the second log survived).
5. Stale replay accepted (200) and overwrites newer data.
6. Payload > 2 MiB drops the connection (`ConnectionResetError`), not HTTP 413.

**Decision unchanged: NO-GO for remote sync release, feature enablement,
`main` merge, or production deployment.** Candidate CAS patch not deployed
(live build-36 client sends no `expectedVersion`, so the patch would
reject its pushes with 428). All 8 flags remain OFF. Issue #9 still OPEN.
PR #20 still OPEN; PR #8 still a draft. Production untouched and healthy.
