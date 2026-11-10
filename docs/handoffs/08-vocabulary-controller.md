# Agent 08 — Vocabulary Controller, Events and Persistence Boundary

Repository: `simplysoup/korean-cloze-srs`  
Base / Phase 2 contract SHA: `ba94b9ee7ae9374cb6e92d8bab17db38f095f9b6`  
Feature branch: `feat/vocabulary-controller-v1`  
PR target: `integration/curriculum-v1`  
Release: **NOT AUTHORIZED**. Do not merge to `main` or enable vocabulary.

## Implementation

- `mobile/src/features/vocabulary/controller.ts` exports `createVocabularyController` and typed dependencies; it matches the **unchanged** Promise-based `VocabController` v1. The learner-facing `VocabularyProvider` can consume it by injection without any UI code modification.
- `runtime/controller.ts` reads the bundled 145 lexical entries in seven decks and uses the existing `makeLexicalPrompt`, `checkLexicalResponse`, recognition/production FSRS selections, `replayVocabularyEvents`, and `core/contract-adapter.ts`. It does **not** create a separate scheduler or grammar review history.
- `getSession('learn')` returns due then new prompts across both directions; `getSession('review')` returns due-only; `getSession('cram')` is a non-scheduling full-library drill. Each is bounded by the supplied `limit` and uses stable lexical entry IDs plus a session-scoped opaque ID (not queue indices). The v1 `getSession(mode, limit)` has no deck ID argument: existing UI requests up to 500 global prompts and filters locally. With 145×2=290 foundational prompts, this covers the full library; a larger curriculum will require a lead-approved deck-scoped API extension.
- Only accepted **target-correct** feedback schedules rating `Good (3)`; unknown, near-miss and revealed prompts grant no FSRS update. No automatic `Again` scheduling is performed. A correct *cram* answer returns feedback but `progress: null`; it never modifies spaced repetition.
- The controller is bound to the captured `{accountId, epoch}` from Agent 00's `AccountSessionLease` in `features/contracts/phase2.ts`. Every call and storage boundary checks the live account. A new login—even to the same account—must create a new controller/provider instance. Unauthenticated/local/guest identifiers are rejected. A storage snapshot carries an account ID, and mismatched snapshots are rejected before state can render.
- Runtime review events extend Agent 00's canonical `VocabularyReviewEventV1` with `promptId`, event version and the confirmed outcome. Canonical `id`, `entryId`, `deckId`, `mode`, `rating`, `reviewedAt` are preserved. A snapshot extends `VocabularyDurableStateV1` with `accountId`, `revision`, `baseline`, `contentVersion`. Events are append-only and materialized with deterministic `(reviewedAt, id)` replay; recognition and production are independent. `baseline` allows a future explicit import of existing FSRS progress, without fabricating review events.
- Concurrent duplicate submissions share an in-flight operation; repeats after success return the same result. Event-ID collisions are detected, and CAS conflicts cause up to five fresh reads/replays without lost writes. Malformed progress and nonlexical IDs are rejected without overwriting previous data.

## Exact Agent 00 integration patch

1. After Agent 10 account isolation passes, implement `VocabularyPersistencePort` in an Agent-00-owned store/db file. The Phase 2 `AccountScopedVocabularyStorage` type describes `load/appendReview`, but its `appendReview` signature **does not provide a revision precondition**. This controller therefore intentionally requires a stronger `atomicCommit({scope, expectedRevision, next, assertCurrent})` CAS operation; do **not** implement this as a blind write. The eventual adapter can also satisfy the shared `AccountScopedVocabularyStorage` interface, but must never weaken CAS semantics. On a different stored revision, return `false`. On a disk/auth failure, reject. Atomically store the full `VocabularySnapshotV1` and index it by account ID. Invoke `assertCurrent()` **inside the same IndexedDB transaction/critical section immediately before the final write**. An account epoch change must never allow an old callback to write a new account's namespace. Do not reuse the legacy global `state-v1` key for vocabulary.
2. Build a live `account: () => AccountSessionLease | null` with monotonically increasing epoch on login/logout/account switch/token replacement and session recovery. Inject a UTC `now: () => new Date()` and a collision-resistant `generateId` (secure UUID). Only instantiate the controller when authenticated.
3. In the router root, mount `<VocabularyProvider key={`${accountId}:${epoch}`} controller={controller}>` above vocabulary routes. Remount on lease change, invalidate late async UI callbacks, and route to existing `mobile/src/app/vocabulary/**` behind the still-OFF vocabulary flag.
4. Do **not** add `reviewEvents` to `SyncDocument` until Agent 09 verifies backend unknown-field retention, version CAS, and two-device race/recovery. Offline IndexedDB durability does **not** establish server or reinstall recovery. Keep native excluded pending Agent 11.
5. If importing older vocabulary progress, do a **separate versioned migration** storing it as `baseline`, with an empty event list and identical `progress`, after explicit provenance/account review. Never silently rewrite or discard a malformed snapshot.

Example (inside the lead-owned authenticated composition code only):

```ts
import { createVocabularyController } from '../features/vocabulary/controller';

const controller = createVocabularyController({
  account: () => authLease, // AccountSessionLease | null; epoch must increment on re-login
  persistence: accountScopedCasAdapter, // load + atomicCommit, durable and transactional
  now: () => new Date(),
  generateId: () => crypto.randomUUID(), // provide a native-safe secure UUID source
});
```

## Test inventory and honest limitations

- `runtime/__tests__/controller.test.ts`: 7 decks, 145 entries and all queue modes; lexical IDs and two directions; curated alternatives, unknown, near, reveal and cram; persist-before-result, offline recreation, failure retry, concurrent duplicate and CAS retry; account switch/logout/re-login and late write; malformed content/data; foreign snapshots and ID collisions.
- `runtime/__tests__/events.test.ts`: deterministic replay, ID/prompt collision, grammar entry and fabricated event rejection, malformed snapshots.
- Exact required commands (run on a complete checkout): `cd mobile && npm run lint && npm run typecheck && npm test -- --ci`. This isolated agent workspace cannot run the repository's Expo/Jest suite without `node_modules` and remote git access; **do not mark these green without actual CI evidence**.
- Browser persistence, account isolation, multi-device server reconciliation, grammar-history preservation, and UI wiring are **not tested or authorized** by this feature PR. Agent 10 → Agent 08 → lead's adapter/UI integration remains the required sequence. No flag changes, deployment, native migration, or server sync in this branch.

## Rollback

Do not mount this factory or implement its CAS adapter; vocabulary remains feature-OFF. If code rollback is needed, revert this isolated feature PR; **do not** delete existing IndexedDB, grammar history, review events, or server snapshots.
