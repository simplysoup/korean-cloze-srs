# Phase 10 — Learn Flow & Review Integration

> **Completed:** 2026-02-28
> **Depends on:** Phase 9 (Grammar Learning Pages)

## Summary

Restructured the learn flow from a lesson-based batch completion model to a session-based "Add to Deck" model. Users initiate a learning session with an adjustable number of grammar points (default 5). Each grammar point is added individually via "Add to Deck", which auto-advances to the next. After the session target is reached, a practice quiz tests all learned grammar points using cloze cards. A Learn button in the navbar provides one-click access to the next learning session.

---

## What Was Built

### 10.1 Learn Session Flow (`/learn`)

- **Server loader** (`src/routes/learn/+page.server.ts`):
  - Accepts `deck_id` query param (required, redirects to dashboard if missing)
  - Accepts optional `size` query param (1–20, default 5) for session size
  - Auto-enrolls users on first learn (creates `UserDeckProgress` with `lastLearnedIndex: -1`)
  - Loads next N unlearned grammar points sorted by `sortOrder` (not lesson-batched)
  - Returns `totalRemaining` for progress display
  - Returns deck-complete state when all grammar points have been learned

- **Page component** (`src/routes/learn/+page.svelte`) — Three-phase flow:
  1. **Learning phase**: Grammar point content with "Add to Deck" button
     - Clicking "Add to Deck" creates ReviewCards via API, auto-advances to next grammar point
     - Session progress bar shows added/target count
     - User-adjustable session size via settings gear (range slider, 1–20)
     - Exit button always visible to leave session
     - Previous button to review already-seen grammar points
     - Progress pellets track which points have been added
  2. **Quiz phase**: Practice test for all just-learned grammar points
     - All cloze cards from added grammar points, shuffled
     - Full cloze card UI: sentence with blank, English hint, romanized input → Hangul
     - Correct/incorrect feedback with "Show Answer" on wrong answers
     - Running score display (correct/total)
     - "Skip Quiz & Finish" button to test out at any time
     - Enter key advances after submission
  3. **Completion phase**: Session summary
     - Lists all learned grammar points
     - Shows review cards created count
     - Quiz accuracy results (if quiz was attempted)
     - Action buttons: Review Now, Learn More, Dashboard

### 10.2 Learn Completion API (unchanged)

- **Endpoint** (`src/routes/api/learn/complete/+server.ts`):
  - `POST` with `{ deckId, grammarPointId }`
  - Auth-gated (401 if unauthenticated)
  - Creates `ReviewCard` entries for all cloze cards (state=New, due=now), skipping duplicates
  - Advances `UserDeckProgress.lastLearnedIndex` to the grammar point's `sortOrder`

### 10.3 Navbar Learn Button

- **Modified** `src/routes/+layout.server.ts`:
  - Computes `primaryLearnDeckId` — first enrolled deck with learnable content
  - Returns it alongside existing `learnableCount`

- **Modified** `src/routes/+layout.svelte`:
  - Added "Learn" button with green badge showing learnable count
  - When user has learnable content: links to `/learn?deck_id=[primaryDeckId]` with badge
  - When user has no enrolled decks or nothing to learn: links to `/decks` for deck selection (always clickable, never disabled)

### 10.4 Deck-Scoped Reviews (from previous iteration, retained)

- `/reviews?deck_id=X` filters review queue to cards belonging to that deck
- Shows "Reviewing: [Deck Name]" header when deck-scoped

### 10.5 Dashboard Integration (from previous iteration, retained)

- Learn card links to `/learn?deck_id=[id]` for the primary enrolled deck
- When no enrolled decks: Learn card shows "Choose a Deck" and links to `/decks`
- When enrolled but all learned: shows "All caught up!" and links to the deck detail page
- Review card links to deck-scoped `/reviews?deck_id=[id]`

### 10.6 No-Deck User Experience

- **Navbar**: Learn button always clickable — links to `/decks` when no learnable content
- **Dashboard**: Learn card says "Choose a Deck" with subtitle "Pick a grammar deck to start learning", linking to `/decks`
- **`/learn` route**: Redirects to `/decks` (not `/dashboard`) when no `deck_id` query param

### 10.6 CSS Additions

- Updated Phase 10 section in `src/app.css`:
  - `.learn-session-bar` — sticky progress bar with session count, settings gear, exit button
  - `.learn-session-settings` — collapsible panel with range slider for session size
  - `.lesson-nav__btn--add` — "Add to Deck" button styling (blue primary, green when added)
  - `.learn-quiz` — practice quiz layout with header, score, and card display
  - `.learn-completion__quiz-results` — quiz accuracy display in completion card
  - `.header__nav-btn--learn` — green Learn button in navbar
  - `.header__badge--learn` — green badge for learnable count

---

## Files Modified

| File | Change |
|------|--------|
| `src/routes/learn/+page.server.ts` | Rewritten: session-based loading with adjustable size, no lesson batching; redirects to `/decks` when no deck_id |
| `src/routes/learn/+page.svelte` | Rewritten: three-phase flow (learning → quiz → completion) |
| `src/routes/+layout.server.ts` | Added `primaryLearnDeckId` for navbar Learn button |
| `src/routes/+layout.svelte` | Added Learn button; links to `/decks` when no learnable content |
| `src/routes/dashboard/+page.svelte` | Learn card: "Choose a Deck" state for users with no enrolled decks |
| `src/app.css` | Added session bar, quiz, Add to Deck, navbar Learn button styles |

## Files Unchanged

| File | Reason |
|------|--------|
| `src/routes/api/learn/complete/+server.ts` | Already handles single grammar point completion correctly |
| `src/routes/reviews/+page.server.ts` | Deck-scoped reviews work as-is |

---

## Architecture Decisions

1. **Session-based, not lesson-based** — Users control how many grammar points per session (1–20, default 5). No rigid lesson grouping. Grammar points are served in deck sort order regardless of lesson boundaries.

2. **"Add to Deck" per grammar point** — Each grammar point is added individually to the review queue. Auto-advances to the next point. Users can review previous points via the Previous button. This replaces the old "Complete Lesson" batch approach.

3. **Practice quiz uses all cloze cards** — After adding N grammar points, all their cloze cards are collected, shuffled, and presented as a practice quiz. This provides immediate reinforcement before the FSRS scheduler takes over for long-term review.

4. **Test out at any time** — Users can skip the quiz entirely via "Skip Quiz & Finish". The grammar points are already added to the review deck; the quiz is purely for practice.

5. **Navbar Learn button** — Direct link to the next learning session for the primary enrolled deck. Shows the total learnable count as a badge. When no decks are enrolled or all content is learned, links to `/decks` for deck selection — never disabled, always actionable.

6. **Client-side session navigation** — All three phases (learning, quiz, completion) are handled client-side via `$state` phase tracking. No page reloads between phases.

---

## Testing Notes

- Test user: `test@example.com` / `testpassword123`
- Navigate to dashboard → click Learn card → enters session with first 5 unlearned grammar points
- Click "Add to Deck" on each → auto-advances; after 5th, enters practice quiz
- Quiz: type romanized Korean → check → next; "Skip Quiz & Finish" to exit early
- Completion: shows learned points, review cards created, quiz accuracy
- Navbar "Learn" button should appear with green badge when grammar points are available
