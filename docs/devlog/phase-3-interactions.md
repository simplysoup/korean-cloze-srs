# Phase 3 — Interaction States & FSRS Logic

> **Status:** ✅ Complete (2026-02-24)
> **Steps:** 16–21 in execution order

## Summary

Implemented the full review queue with FSRS spaced-repetition scheduling, incorrect/correct answer flows with visual feedback, undo functionality, show-answer reveal, alternate answer cycling, and the grammar info reveal toggle.

## Changes Made

### 3.1 Review Queue
- Server loads up to 10 due `ReviewCard` records per session, ordered by `due ASC`
- Client tracks position with `$state(queueIndex)` and `$derived(currentCard)`
- "Next" advances the queue and submits the FSRS rating

### 3.2 Incorrect Answer Flow
- CSS shake animation on the sentence container (translateX ±4px, 300ms)
- Blank highlights red (`.blank--incorrect`)
- "Show Answer" button reveals the correct answer and queues `rating: 1` (Again)
- "Undo" button reverts to pre-submit state (for typo correction, no FSRS update)
- FSRS POST deferred until "Next" click for clean undo support

### 3.3 Close Answer (Plan Only)
- Documented design for near-miss answers with character-level diff
- Will require `closeAnswers Json?` column on `ClozeCard` — deferred to future phase

### 3.4 Correct Answer Flow
- Full sentence highlights green (`.sentence--correct`)
- Blank shows correct Hangul in green (`.blank--correct`)
- "Alt" button cycles through alternate answers when available
- "Next" sends `rating: 3` (Good) by default

### 3.5 Reveal Info Toggle
- Collapsible panel showing full `grammar.description`
- Double-click confirmation: first click shows warning, second reveals
- Revealing before correct answer auto-fails the review (`rating: 1`)
- No penalty if already answered correctly

### 3.6 FSRS API Endpoint
- `POST /api/reviews` accepts `{ reviewCardId, rating }` (1–4)
- Builds `ts-fsrs` Card from stored ReviewCard state
- Calls `fsrs.repeat(card, now)[rating]` for next schedule
- Updates ReviewCard + appends ReviewLog in a single operation

## Files Created/Modified
- `src/routes/reviews/+page.server.ts` — review queue loading
- `src/routes/reviews/+page.svelte` — full review UI with all interaction states
- `src/routes/api/reviews/+server.ts` — FSRS review submission endpoint

## Dependencies Added
- `ts-fsrs` 5.2.3 — FSRS spaced-repetition scheduling
