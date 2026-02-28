# Phase 10b — Mastery System + Library & Deck Pages

> **Date:** 2026-02-28
> **Status:** ✅ Complete

## What Was Added

### 1. Mastery System (Non-Breaking FSRS Layer)

Added a Bunpro-style mastery tracking system layered on top of existing FSRS scheduling. All existing review flow continues to work unchanged — mastery is purely additive.

**Schema changes:**
- `review_cards.streak_correct` (INTEGER NOT NULL DEFAULT 0) — consecutive correct answers
- `review_cards.mastered_at` (TIMESTAMP DEFAULT NULL) — ISO timestamp when mastery achieved
- `decks.topik_level` (TEXT NOT NULL DEFAULT 'topik1-1') — canonical TOPIK level string

**Migration:** `20260228003319_add_mastery_and_topik_level`

**Mastery grading logic** (in `POST /api/reviews`):
- On correct answer (rating ≥ 3, i.e., "Good" or "Easy"): increment `streakCorrect` by 1
- On incorrect answer (rating < 3): reset `streakCorrect` to 0
- When `streakCorrect` reaches 8 and `masteredAt` is null: set `masteredAt` to current timestamp
- Never overwrites an existing `masteredAt` during normal grading

**Mastered cards filtered:** Added `masteredAt: null` to the review queue WHERE clause so mastered cards don't appear in review sessions.

**Manual master/unmaster API:**
- `POST /api/reviews/master { cardId }` — manually master a card
- `DELETE /api/reviews/master { cardId }` — unmaster a card, resetting streak

### 2. MasteryPips Shared Component

`src/lib/components/MasteryPips.svelte` — reusable component used in 3+ places:
- Props: `streakCorrect` (0–8), `masteredAt` (string | null), `size` ('sm' | 'md')
- Renders 8 pips filled to `streakCorrect`, plus "✓ Mastered" badge if mastered
- Used in: review page, grammar library cards, deck detail grammar rows

### 3. TOPIK Level Naming Convention

Established canonical TOPIK level labels:

| Internal value | Display label | Short badge |
|---|---|---|
| `topik1-1` | TOPIK I · Level 1 | T1·L1 |
| `topik1-2` | TOPIK I · Level 2 | T1·L2 |
| `topik2-3` | TOPIK II · Level 3 | T2·L3 |
| `topik2-4` | TOPIK II · Level 4 | T2·L4 |
| `topik2-5` | TOPIK II · Level 5 | T2·L5 |
| `topik2-6` | TOPIK II · Level 6 | T2·L6 |

Helper module: `src/lib/topik.ts` — exports `TOPIK_LEVELS`, `getTopikDisplay()`, `getTopikShort()`.

### 4. Grammar Library Page — `/grammar`

New route modelled after Bunpro's Grammar Points page:
- TOPIK level filter tabs (bookmarkable via `?level=topik1-1`)
- Client-side search filtering by title/hint/description
- Grid of grammar cards with title, hint, TOPIK badge, mastery pips (if logged in)
- Empty state for levels with no content: "Coming soon"
- All grammar points loaded server-side with ReviewCard join for auth users

### 5. Deck Index Page — `/decks`

New route listing all published decks as cards:
- Deck name, TOPIK level badge, lesson/grammar point counts
- Per-user mastery progress bar (if logged in)
- "Coming soon" indicator for empty decks
- Links to `/decks/[slug]`

### 6. Deck Detail Page Updates

Enhanced existing `/decks/[slug]` page:
- Added TOPIK level badge in deck header
- Lesson-by-lesson progress bars
- Mastery pips per grammar point row
- SRS status badges (New/Learning/Review/Mastered)
- Lesson progress (X/Y learned per lesson)

### 7. Navigation Updates

Header nav now includes:
- "Library" → `/grammar`
- "Decks" → `/decks`
- (existing) "Review" → `/reviews`
- (existing) Content/Practice dropdowns preserved

## Design Decisions

- **Mastery is non-breaking:** Zero changes to FSRS scheduling logic. `streakCorrect` and `masteredAt` are independent tracking columns with defaults, so all existing rows continue to work.
- **8-pip mastery:** Chosen to match Bunpro's SRS stage count. 8 consecutive correct answers triggers mastery.
- **Rating threshold:** ≥ 3 (Good/Easy) counts as correct for streak purposes. Hard (2) and Again (1) both reset the streak to 0.
- **Filtered reviews:** Mastered cards are excluded from the review queue. Users can unmaster via API if needed.
- **Min-streak aggregation:** When displaying mastery for a grammar point (which has multiple cloze cards), the weakest card's streak determines the display.
- **TOPIK level on Deck model:** Added `topikLevel` string field to Deck rather than deriving from the numeric `level` field, for cleaner canonical labelling.

## New Routes

| Route | Type | Description |
|---|---|---|
| `/grammar` | Page | Grammar Library with filter/search/grid |
| `/decks` | Page | Deck index listing all decks |
| `/api/reviews/master` | API | POST to master, DELETE to unmaster |

## Files Changed

- `prisma/schema.prisma` — Added `streakCorrect`, `masteredAt` to ReviewCard; `topikLevel` to Deck
- `src/routes/api/reviews/+server.ts` — Mastery grading logic
- `src/routes/reviews/+page.server.ts` — Filter mastered cards, pass mastery data
- `src/routes/reviews/+page.svelte` — MasteryPips component in review UI
- `src/routes/api/reviews/master/+server.ts` — New master/unmaster API
- `src/lib/components/MasteryPips.svelte` — New shared component
- `src/lib/topik.ts` — New TOPIK level utilities
- `src/routes/grammar/+page.server.ts` — New grammar library loader
- `src/routes/grammar/+page.svelte` — New grammar library UI
- `src/routes/decks/+page.server.ts` — New deck index loader
- `src/routes/decks/+page.svelte` — New deck index UI
- `src/routes/decks/[slug]/+page.server.ts` — Enhanced with mastery data
- `src/routes/decks/[slug]/+page.svelte` — Enhanced with pips, badges, progress
- `src/routes/+layout.svelte` — Added Library, Decks nav links
- `src/app.css` — New style sections for mastery, library, decks
