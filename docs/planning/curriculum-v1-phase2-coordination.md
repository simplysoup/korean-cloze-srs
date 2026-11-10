# Curriculum v1 — Phase 2 ownership, dependency and contract kickoff

**Lead:** Agent 00 • **repository:** `simplysoup/korean-cloze-srs`  
**Verified parent before kickoff:** `06985c8dbf72fd58e5431652ebc8bc42f083bafa` • **PR:** [draft #8](https://github.com/simplysoup/korean-cloze-srs/pull/8)  
**Base for specialist branches:** **the full SHA of the commit adding this file**, published in PR #8. Do not use the parent SHA or independently branch from `main`.  
**Release:** NOT AUTHORIZED. All eight `CURRICULUM_FLAGS` remain **false**. No production deployment, no merge to `main`, and no feature enablement without explicit owner authorization.

## Source of truth and historical context

Phase 1 PRs #12–#18 were already merged into `integration/curriculum-v1`; they must **not** be repeated. Preserve ancestry of stacked draft PRs #2–#7. The existing branch and `main` diverge: the verified comparison at kickoff is 161 commits ahead / 2 behind, merge base `19aea4f716c463bfc8ce33f895ad5e2c34cfe678`. Reconcile build-36 differences without rebase or history rewriting, and prove feature-OFF behavior equivalent to current `main`.

Read `docs/planning/curriculum-v1-integration-contract.md`, `docs/planning/curriculum-v1-integration-handoff.md`, `mobile/src/features/vocabulary/contracts.ts`, `mobile/src/features/contracts/answers.ts`, `mobile/src/lib/sync-types.ts` and `mobile/src/store/state.ts` before coding. The Phase 1 contracts are frozen. New type-only seams are in `mobile/src/features/contracts/phase2.ts` and do not modify existing production sync or storage.

## Ownership and PR ledger

| Agent | Allowed implementation scope | Dependency/gate | PR (fill only once opened) |
|---|---|---|---|
| **00 lead** | Existing `mobile/src/app/_layout.tsx`, existing Learn/Review screens and navigation/header; `mobile/src/store/index.ts`, `store/sync.ts`, `mobile/src/lib/{api,sync-types,sync-merge}.ts`; flags, shared contracts, workflows/lockfiles and `docs/planning/curriculum-v1-*` | Sole merger to `integration/curriculum-v1`, not to main | [draft #8](https://github.com/simplysoup/korean-cloze-srs/pull/8) |
| **08 vocabulary controller** | `mobile/src/features/vocabulary/controller*` and its assigned tests/handoff; consumes `vocabulary/core/**` and existing UI | Agent 10 isolation before lead's persistent adapter; no durable progress by in-memory-only claims | Pending |
| **09 server sync** | Authorized backend/source or isolated harness and handoff; coordinate API compatibility with 00 | Issue #9: preserve unknown keys, CAS preconditions, concurrent clients, legacy replay/recovery; backend is **outside** this repository | Pending |
| **10 account isolation** | `mobile/src/store/state.ts`, `mobile/src/store/auth.ts`, account isolation tests and handoff | Issue #10: per-account IndexedDB, legacy provenance migration, epoch invalidation, fake-account tests; merge first | Pending |
| **11 native parity** | `mobile/src/db/**`, native migration tests and handoff | Issue #11: versioned updates preserving review history; native remains independently blocked | Pending |
| **12 grammar feedback bridge** | New `mobile/src/features/answer-evaluation/**` adapter/test surfaces and handoff only | Lead wires existing Learn/Review screens behind `answerFeedback` | Pending |
| **13 independent release QA** | Dedicated acceptance harness, fixtures, evidence and handoff; no concurrent edits to owned runtime paths | Work on a **frozen integration candidate** after merges; never approve without manual/browser/two-device proof | Pending |
| **14 content readiness** | Content/educator review evidence, release readiness metadata and handoff | Educator approval is external and not implied by validator passes | Pending |

Each in-repo specialist: branch from the **published Phase 2 kickoff SHA**, open a PR **targeting `integration/curriculum-v1`**, and include changed-file inventory, typed-contract compatibility, exact commands/results, blocking dependencies, rollback instructions and `docs/handoffs/<agent>-*.md`. No one except Agent 00 merges specialist PRs into integration; no one edits another agent's exclusive paths or force-pushes shared history. An unexpected overlapping path must be requested as a lead-owned integration patch, not changed unilaterally. Agent 09's private backend work must not be represented as committed to this public repository.

## Typed interfaces and invariants

- **Vocabulary controller (Agent 08):** preserve the frozen Promise-based `VocabController` API. `vocabulary/core/**` already implements recognition/production FSRS logic and returns engine-shaped `VocabProgress`; the existing UI expects controller-shaped progress. Neither an in-memory controller nor the frozen UI projection is a durable store.
- **Account-scoped storage (Agents 08, 10 and lead):** `AccountSessionLease { accountId, epoch }` and `AccountScopedVocabularyStorage` in `phase2.ts` define the handoff. Agent 10 implements session epoch transitions and account-isolated state. Agent 08 injects the storage port. Lead supplies the concrete persistent web adapter only after Agent 10 is proven. Any expired lease must reject before a new-account read/write, including late async completions. Session tokens must never be embedded in vocabulary records.
- **Event reconciliation (Agent 09 then lead):** immutable `VocabularyReviewEventV1` IDs with stable lexical `entryId`, deck ID, recognition/production mode, rating and ISO timestamp. Deduplicate by event ID and order by timestamp plus ID before deterministic FSRS replay. Persist events and materialized progress atomically; never mix vocabulary events with grammar `reviewLogs` or `grammarPointId`. `ProposedVocabularySyncEnvelopeV1` is **NOT** part of production `SyncDocument`; no server push/enablement until issue #9 is proved against actual authorized server.
- **Answer feedback (Agent 12 then lead):** `target_correct` alone is `targetMasteryEligible: true`. `valid_off_target` and `unclassified` must not be silently converted to wrong, nor awarded mastery. Keep legacy Learn/Review behavior bit-for-bit when `answerFeedback=false`.
- **Native (Agent 11):** `CONTENT_VERSION` and existing native SQLite seeded profiles require separately tested monotonic migration. Do not claim native parity or alter its release scope merely because the web build passes.
- **Educator readiness (Agent 14):** editorial validators and draft materials are not Korean educator signoff.

## Merge and testing dependency graph

1. Run Agents **08, 09, 10, 11, 12 and 14** independently on disjoint paths; Agent **13** designs checks without modifying frozen runtime. Each reports full SHA and PR URL.
2. Review and merge **10** first. Run synthetic account-switch/logout/offline/stale-callback and legacy-grammar-history regressions; do **not** discard ambiguous old `state-v1` data.
3. Review and merge **08**, then lead wires the account-scoped persistent adapter and `VocabularyProvider` above Expo Router, keyed by authenticated account. Leave vocabulary flag OFF until verified. Fail visibly when a persistent save is unavailable.
4. Review and merge **12**, then lead wires existing Learn/Review with exact card context behind the disabled flag, preserving legacy behavior OFF.
5. **09 is a hard gate** before any `SyncDocument` vocabulary extension or server vocabulary sync. Require backend schema verification, version-precondition conflict retries, deterministic event union, disposable two-device races and restore tests. If blocked, record *local-only vocabulary* as a limitation; do not claim reinstall recovery.
6. **11** may land after independent migration proof, but native support stays excluded until owner authorizes. **14** records actual readiness. Freeze a candidate and let **13** run independent acceptance before lead proposes release.
7. Handle `main` drift without rewriting the historical PR stack. Keep draft PR #8 as draft.

For **every** candidate run `cd mobile && npm run lint && npm run typecheck && npm test -- --ci && npx expo export --platform web`, all repository validators and content-generation reproducibility checks. Also require CI and disposable-user manual browser/account/offline/recovery evidence. Never infer tests have passed merely because they are planned.

## Release decision register

| Scope | Initial disposition | Needed to change |
|---|---|---|
| Web existing build-36 grammar experience | **NO-GO for curriculum merge** | Feature-OFF parity with `main`, account isolation, all tests, owner authorization |
| Vocabulary UI / SRS | **NO-GO** | 10 → 08 + persistent adapter, offline durability, events, tests, explicit flag authorization |
| Vocabulary server sync | **NO-GO** | 09 backend schema + optimistic concurrency + two-device/recovery proof |
| Contextual answer feedback | **NO-GO** | 12 + lead wiring + target-mastery acceptance + authorization |
| Topics, Hangul, contrast, transfer, reading, TOPIK II | **OFF / not released** | Each feature's readiness, UI acceptance, content review and explicit authorization |
| Native | **NO-GO, excluded** | 11 migration, native device/emulator tests and independent owner decision |
| Educator approval | **PENDING** | Actual educator signoff; agent/validator output cannot substitute |

**Rollback:** No data schema migration or feature enablement is introduced by this kickoff. Revert the two newly added kickoff files if needed; do not delete IndexedDB records, review logs, remote snapshots or native progress as a rollback shortcut. Before future migrations, require versioned restore and backwards compatibility.
