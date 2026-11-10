# Agent 02 — Vocabulary UI handoff

**Branch:** `feat/vocabulary-ui`
**PR base:** `integration/curriculum-v1`
**Starting shared-contract commit:** `859ea12292bbcd37f81ba12b22f5f6e83f59ab72`
**Owner:** Agent 02; never merge this branch directly into `main`.

## Owned files and routes

- `mobile/src/app/vocabulary/index.tsx` → **`/vocabulary`**: seven foundational deck cards, description, entry/due/learned counts, loading/error/empty.
- `mobile/src/app/vocabulary/[deckId].tsx` → **`/vocabulary/:deckId`**: progress (total/new/due/learned), learning, due reviews and missed due reviews.
- `mobile/src/app/vocabulary/session.tsx` → **`/vocabulary/session?mode=learn|review|missed&deckId=<ID>`**: introduction (learn), typed response, feedback, completion, near-miss retry and review-missed.
- `mobile/src/features/vocabulary/ui/Components.tsx`: Munpro-themed, accessible page/button/status/chip primitives.
- `mobile/src/features/vocabulary/ui/DeckScreens.tsx`: typed, controller-agnostic catalogue and detail.
- `mobile/src/features/vocabulary/ui/SessionScreen.tsx`: learner experience driven by typed session snapshots.
- `mobile/src/features/vocabulary/ui/VocabularyProvider.tsx`: UI-only in-memory session cursor and asynchronous controller delegation.
- `mobile/src/features/vocabulary/ui/{content,presentation,session-state}.ts`: read-only authoring content, presentation decisions and pure UI state transitions.
- `mobile/src/features/vocabulary/ui/__tests__/vocabulary-ui.test.ts`: Jest model/contract tests.
- `mobile/src/features/vocabulary/ui/__tests__/VocabularyDemo.tsx`: **test-only** visual walkthrough; never import into production routes.

No changes to navigation, existing grammar screens, store, DB, authentication, engine, packages or lockfile.

## Mock visual demo

For a **local development-only** walkthrough, temporarily render `VocabularyDemo` exported from `ui/__tests__/VocabularyDemo.tsx` in a local Expo test route; do not commit that test route. It exercises the actual catalogue, detail, introduction, production, feedback, and summary components with a typed `VocabController` mock. Enter `한` for correct, `하나` for near miss, or another value for incorrect. The mock does not persist progress and is not a grading implementation. Remove the local route before any production export.

Expected viewports for manual visual verification: 320×568, 375×812, 768×1024 and 1440×900, plus iOS and Android system font scaling, keyboard and screen reader. These are **pending manual verification**; do not mark them tested without screenshots or a real device/browser run.

## Agent 00 integration actions

1. Import `VocabularyProvider` from `src/features/vocabulary/ui/VocabularyProvider` into the authenticated root layout and wrap the Expo Router `Stack` with `<VocabularyProvider controller={realVocabController}>`. Instantiate/memoize one controller per current account and **key/remount the provider by account ID**; never share a UI session between accounts.
2. Expose a Vocabulary link in `AppHeader` through Agent 00's own navigation changes (Agent 02 did not touch it). Expo Router auto-discovers the three new routes; explicit `Stack.Screen` entries are optional.
3. Supply a controller implementing `src/features/vocabulary/contracts.ts`. The UI invokes only `listDecks`, `getProgress`, `getSession`, `submitAnswer`, and `revealAnswer`. It uses `VocabReviewResult.evaluation` for grading, hints, acceptable alternatives and mastery status. **No grammar methods are invoked.**
4. Ensure `getSession('learn', 500)` returns new eligible starter prompts without side effects; `getSession('review', 500)` returns due prompts and `submitAnswer` safely persists a vocabulary-only review. The UI filters the global queue to `deckId` after retrieval. **Important v1 contract gap:** `getSession` lacks a deck-scoped selection parameter, so the 500-prompt client-side filter may starve decks once the catalogue grows. Lead should approve an optional `deckId` arg or a dedicated deck-scoped query before wider release. Do not change the frozen interface on Agent 02's branch.
5. `/vocabulary/session?mode=missed` filters due review prompts by `VocabProgress.lapseCount > 0`; it does not force future/non-due cards into review. In-session completion can replay missed prompts held in the UI queue; those repeat submissions still go through the real controller.
6. The provider retains an in-progress presentation queue when the **screen** remounts under the same account/provider. Closing/restarting the app re-queries the controller: committed answers remain saved by the engine; unsubmitted text and original random order are not guaranteed after full process restart. The contract has no pause/resume identity for durable exact-cursor recovery, so that stronger feature requires Agent 00 / Agent 01 cooperation.
7. Keep blocked material out of sessions and require educator review of draft material before production learning claims.

## UX and safety

- Deck titles always distinguish Native/Sino numbers and counters. Intro shows Hangul, gloss, optional spoken/variant, usage note and example from read-only `vocabulary-foundations.json`.
- Recognition, production and contextual prompts are explicitly labelled. Pre-answer usage context never intentionally displays the target translation; Korean examples are masked for Korean production where `canonicalAnswer` appears.
- Alternatives are rendered **only** from evaluator-provided, context-approved `acceptedAlternatives`, after feedback. Corpus `variant` is educational reference, not automatically an accepted answer.
- Outcome labels cover target-correct, valid-off-target, near-miss, incorrect and unclassified. Close-answer retries require `retryAllowed`. Reveal never grants mastery or masquerades as a persisted review.
- Button touch targets ≥48pt, visible focus border, `accessibilityLabel`/live feedback, Enter-to-submit `TextInput`, wrapable Korean text, no colour-only correctness, no required animations. UI has explicit loading/empty/error/complete.
- No mock production persistence, grammar scheduling calls or global navigation changes.

## Testing

Run inside `mobile` with existing dependencies:

```bash
npm ci
npm run typecheck
npm test -- --ci
npx expo export --platform web
```

The `__tests__/vocabulary-ui.test.ts` suite covers empty/new/graded/incorrect/near-miss/off-target/alternative/repeated-missed/progress/long-Hangul/context-isolation logic and a VocabController-shaped mock. These are **logic tests, not React Native layout tests**. An actual Expo build and manual web/mobile viewport interaction remain required before declaring the UI production-ready.

## Known unfinished items

- Agent 00 must wire the real controller into root authentication and add global navigation.
- Deck-filtered controller API and durable per-account resume are not in the frozen contract; client-side queue filtering is a starter-catalogue interim measure.
- No automated React Native component-rendering/keyboard/focus viewport tests: the repository has no React Native Testing Library dependency and Agent 02 cannot modify package files.
- Native educator review of lexical usage/alternatives still applies.
- Screenshot capture from actual Expo Web/iOS/Android is pending an executable environment; the test-only visual harness is supplied as the demonstration.

**Merge ownership:** Agent 00 only. Preserve stacked PR #2–#7 ancestry. Never deploy or merge directly to `main`.
