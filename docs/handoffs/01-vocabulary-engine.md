# Agent 01 — Vocabulary SRS engine handoff

**Base**: `integration/curriculum-v1` after Agent 00's frozen contract commit. **Branch**: `feat/vocabulary-engine`.
**Ownership**: only `mobile/src/features/vocabulary/core/**` and this handoff. No store, DB, sync, auth, grammar, screens, navigation, dependencies or content changed.

## Source & model

`loadFoundationalVocabulary()` imports **generated** `mobile/src/content/vocabulary-foundations.json`, whose authoritative source is `prisma/seed-data/vocabulary/foundations.json`. It validates all seven decks and 145 lexical entries atomically, preserving source usage notes/examples. Source IDs are stable, and duplicate IDs across decks are rejected. The engine is not an editorial content generator; further linguistic/copyright educator review remains required, so adapter output is `contentReadiness: 'draft'`.

`VocabProgress` in **core/progress.ts** is an internal, JSON-serializable vocabulary-only collection: `{version:1, entries:{[vocabEntryId]: {recognition?,production?}}}`. Each direction stores independent `ts-fsrs` scheduler data, correctness counts and last grade. The **frozen contract's** `VocabProgress` in `../contracts.ts` is instead a *one-entry summary DTO*. **Do not persist the summary DTO**: it loses per-direction FSRS history. `toControllerVocabularyProgress` provides a deliberately conservative projection: earliest due, weakest learning state, minimum stability, maximum difficulty, combined review/lapse counts; mastered only when both directions are mature. `toControllerDeckSummaries` counts fully learned entries only when both modes have at least one review.

`initializeVocabProgress(raw,library)` is idempotent for valid states, clones only safe known vocab fields, accepts legacy `cards` top-level vocabulary containers, skips corrupt review records, ignores grammar IDs and excludes unknown library IDs. Review transitions use explicit input progress and injected `Date`; no globals/storage or wall-clock calls. Source ordering determines deterministic selection; FSRS uses the preinstalled `ts-fsrs` v6 implementation rather than duplicating a scheduler.

## API exports (`mobile/src/features/vocabulary/core/index.ts`)

- Content: `loadVocabulary`, `loadFoundationalVocabulary`, `getVocabularyEntry` and `VocabularyLibrary`, `VocabularyDeck`, `VocabularyEntry`, `VocabularyResult`.
- Progress: `initializeVocabProgress`, `getReviewProgress`, `replaceReviewProgress`, `selectNewVocabulary`, `selectDueVocabulary`, `getVocabularyDeckStats`, `buildLearnerVocabularyLibrary`.
- Lexical: `makeLexicalPrompt`, `acceptedEnglishGlosses`, `normalizeLexicalAnswer`, `checkLexicalResponse`, `withAcceptedLexicalVariants`, `composeSinoMinute`.
- Review/session: `scheduleVocabularyReview`, `createVocabularySession`, `currentVocabularyItem`, `submitVocabularyRating`, `undoVocabularyRating`, `vocabularySessionSummary`, `submitVocabularyAnswer`.
- Integration to frozen interfaces: `toControllerVocabularyPrompt`, `toControllerAnswerEvaluation`, `toControllerVocabularyProgress`, `toControllerDeckSummaries`.

The core's `VocabularyMode` is `recognition | production`. The frozen controller's `VocabSessionMode` is `learn | review | cram`; the controller maps its requested session mode to one or both directions, determines quotas and persists full core state. `contextByEntryId` on `createVocabularySession` may select explicit `before-counter`, `clock-hour`, `clock-minute` or `spoken-month` prompts. The default is standalone, never auto-interchanging contextual alternates. `VocabPrompt.id` includes entry, direction and context and is stable (not an array index). Its full prompt content remains learner-visible.

## Grading, feedback, and ambiguities

`makeLexicalPrompt` distinguishes recognition from production and supports source-controlled variants, but **does not blindly accept `variant` or `spokenForm` in all contexts**. For example, `하나` is standalone, `한` before a counter, `열두 시` is a native hour, and `십이 분` is a Sino minute (composed from `십` and `이`). `6월` vs `유월` and `10월` vs `시월` are separate written/spoken contexts. Korean NFC, non-semantic trailing punctuation and spacing normalization are accepted; one-edit spelling differences are *near*, not correct. English slash glosses are accepted explicitly and parenthetical register labels can be omitted on recognition. The controller must show the usage note/example for feedback.

`submitVocabularyAnswer` **schedules only exact accepted answers**, returning `needsAdjudication:true`, `log:null`, and unchanged state/session on near or unknown answers. The caller must render feedback, invite retry or let the learner consciously grade/reveal via `submitVocabularyRating`. This prevents unfamiliar valid answers being silently penalized; do not infer mastery from near/unclassified answers. `toControllerAnswerEvaluation` maps known correct to `target_correct`, supported near cases to `near_miss`, and unsupported failures to `unclassified`, always refusing mastery for the latter two. When the educator-reviewed alternative policy is available, controllers can inject explicitly approved alternatives via `withAcceptedLexicalVariants` in that particular prompt.

**Known content questions requiring educator QA**: whether different English glosses truly imply interchangeable lexical answers; native/Sino numeral system disambiguation for bare English number cues; context requirements for shortened native number forms; whether spoken month forms should accept written digits in transcription exercises; register distinctions (`누구`/`누가`, `뭐`/`무엇`, `명`/`분`), `분` minute vs counter, and `일` day vs numeral; whether incorrect phonological realizations should be accepted; whether hour expressions beyond 12 should be treated as 24-hour Sino readings. Composite numeral generation is intentionally limited; `composeSinoMinute` uses explicit source components and is not a general Korean numbers generator.

## Storage and synchronization contract

Agent 00 must own a distinct vocabulary namespace; never map into `reviewCards`, `grammarPointId` or grammar mastery counters. Serialize the entire *internal core* `VocabProgress` JSON per account, with atomic read-modify-write and versioning. Persist the identity of both recognition and production records for each stable entry ID. `undoVocabularyRating` validates that the last event's record is unchanged before reverting, and leaves unrelated records intact. Retry due items may be appended once by default (configurable `maxRetries`). Session queues/events are ephemeral and can be persisted separately by Agent 00 if offline resumption is desired; no persistence is implemented here.

Agent 00's contract doc explicitly blocks server SyncDocument changes until backend unknown-key retention, two-device race unions, event identity and account isolation are proven. **This engine does not solve distributed review-event reconciliation.** It produces review logs but does not assign globally unique event IDs; the controller/sync layer must give each persisted event a unique ID and implement append-only union or conflict resolution before cross-device rollout. A local-only vocabulary feature must remain disabled until privacy/account isolation is verified. Native SQLite is a separate integration.

## Suggested controller wiring

1. `loadFoundationalVocabulary()` once, check `{ok}`; display a non-destructive error on failure.
2. Read vocabulary namespace from Agent 00 storage and `initializeVocabProgress(snapshot, library)`.
3. `toControllerDeckSummaries(library, progress, clock)` for list view.
4. `createVocabularySession(library, progress, {mode:'recognition'|'production', now:clock, deckIds, newLimit, reviewLimit, contextByEntryId})`.
5. `toControllerVocabularyPrompt(item.prompt, library.entries[item.entryId], controllerMode)` to expose frozen UI DTO.
6. `submitVocabularyAnswer(library,session,progress,answer,clock)` for exact grading; if needs adjudication, preserve state and let learner retry/reveal/manual grade. If manually graded, call `submitVocabularyRating`.
7. Persist only the returned full `progress` after a successful schedule operation, and translate updates to frozen DTOs with `toControllerVocabularyProgress`. `undoVocabularyRating` reverses only most recent untouched mode record.
8. Gate all UI, account storage, server transport and native parity decisions behind Agent 00's flags/verified migrations.

## Verification

Tests live under `core/__tests__/vocabulary.test.ts` and `core/__tests__/contract-adapter.test.ts` so the existing `jest-expo` `**/__tests__/**/*.test.ts` pattern collects them. Deterministic clock values are injected. The tests cover all 145 source entries, seven deck sessions, duplicate IDs, contextual forms, repeated FSRS, review selection, undo and retry, malformed old states, independent mode state, serializability, grammar isolation and frozen DTO safety.

Run in a complete repository checkout with dependencies:

```sh
cd mobile
npm ci
npm run typecheck
npm test -- --ci --runInBand
```

No test claim should be made until commands complete successfully in a full checkout; CI and product-level offline persistence tests remain Agent 00's responsibility. Branch must stay unmerged and undeployed pending review.
