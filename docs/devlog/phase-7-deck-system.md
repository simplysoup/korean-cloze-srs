# Phase 7 — Deck System & Schema

> **Status:** ✅ Complete (2026-02-27)
> **Builds on:** Phase 6 (Hardening)

## Summary

Introduced the Deck model to organise grammar points into TOPIK-levelled study paths. Created the first deck ("TOPIK Level 1 Grammar") containing all 11 existing grammar points grouped into 4 lessons of 2–3 points each. Restructured the home page around deck cards, added a deck detail page, deck enrollment API, and updated the header navigation to show enrolled decks.

---

## Changes Made

### 7.1 Schema Changes

**`prisma/schema.prisma`** — Added three new models:

- **`Deck`** (`decks`) — Title, slug, description, TOPIK level, icon, published flag, sort order. Has many `DeckGrammarPoint` and `UserDeckProgress`.
- **`DeckGrammarPoint`** (`deck_grammar_points`) — Join table linking decks to grammar points with `sortOrder` (position in deck, 0-indexed) and `lessonNumber` (batch grouping, 1-based). Unique constraints on `[deckId, grammarPointId]` and `[deckId, sortOrder]`.
- **`UserDeckProgress`** (`user_deck_progress`) — Per-user enrollment tracking with `lastLearnedIndex` (-1 = enrolled but not started), `enrolledAt`, `lastStudiedAt`. Unique on `[userId, deckId]`.

Modified existing models:
- **`User`** — Added `deckProgress UserDeckProgress[]` relation
- **`GrammarPoint`** — Added `decks DeckGrammarPoint[]` relation

**Migration:** `20260227213635_add_deck_system`

### 7.2 Seed Data

**`prisma/seed.ts`** — Added three new seed sections:

1. **Deck creation** — Upserts "TOPIK Level 1 Grammar" deck (`deck_topik1_grammar`) with slug `topik-1-grammar`, level 1, 📘 icon.

2. **Deck grammar point linking** — 11 `DeckGrammarPoint` entries mapping existing grammar points to lesson batches:
   - Lesson 1 (Basic Particles): 은/는, 이/가, 을/를
   - Lesson 2 (Location & Direction): 에, 에서, 에서~까지
   - Lesson 3 (Inclusion & Limitation): 부터~까지, 도, 만
   - Lesson 4 (Connecting Nouns): 하고/와/과, (이)랑

3. **Test user enrollment** — Enrolls `user_test` in the deck with `lastLearnedIndex: 4` (first 5 grammar points "learned").

### 7.3 Deck Detail Page

**`src/routes/decks/[slug]/+page.server.ts`** — Server load function:
- Fetches deck by slug with all `DeckGrammarPoint` records ordered by `sortOrder`, each including `GrammarPoint` and `clozeCards`
- For authenticated users: fetches `UserDeckProgress`, determines which grammar points have `ReviewCard` entries (= "learned"), counts reviews due per grammar point
- Computes per-grammar-point status: `learned` (has review cards), `current` (next to learn), `locked` (not yet reachable)
- Returns deck info, enrollment status, lesson-grouped grammar points with status

**`src/routes/decks/[slug]/+page.svelte`** — Deck detail UI:
- Deck header with icon, title, description
- Progress bar showing learned/total count (enrolled users only)
- Action buttons: "Continue Learning" and "Review (N due)"
- Grammar points grouped by lesson number with colored left borders:
  - Green border = learned (✅), blue border + highlight = current (📖), dimmed = locked (🔒)
- Unauthenticated users see "Login to Start", unenrolled users see "Start Learning" button
- Enroll button calls POST to enrollment API and reloads

### 7.4 Deck Enrollment API

**`src/routes/api/decks/[deckId]/enroll/+server.ts`** — `POST /api/decks/[deckId]/enroll`:
- Auth guard (401 if not authenticated)
- Validates deck exists and is published (404 if not)
- Upserts `UserDeckProgress` — idempotent, no-op if already enrolled
- Returns `{ enrolled: true, deckId }`

### 7.5 Home Page Redesign

**`src/routes/+page.server.ts`** — Rewrote to be deck-centric:
- Fetches all published decks with grammar point counts
- For authenticated users: separates into enrolled vs available decks, computes per-deck learned count and reviews due
- Returns `enrolledDecks`, `availableDecks`, global `reviewsDue`, `totalReviewed`

**`src/routes/+page.svelte`** — Replaced flat grammar list with deck cards:
- **Enrolled decks section:** Cards linking to `/decks/[slug]` with progress bar, learned count, reviews due badge, "Continue →" action
- **Available decks section:** Cards with description, grammar count, TOPIK level, "Start Learning" button (calls enrollment API)
- Unauthenticated users see available decks without enrollment buttons + login CTA
- Removed search filter (no longer applicable to deck-based view)

### 7.6 Layout Updates

**`src/routes/+layout.server.ts`** — Updated deck-aware data loading:
- Fetches user's enrolled decks with progress to compute `learnableCount` from deck structure (total grammar minus learned per deck)
- Returns `enrolledDeckSlugs` array for header navigation

**`src/routes/+layout.svelte`** — Header "Content" dropdown:
- Now lists enrolled deck names as links to `/decks/[slug]`
- Falls back to "Browse Decks" if no decks enrolled
- Keeps "Vocabulary (soon)" placeholder

---

## Files Created

| File | Purpose |
|------|---------|
| `prisma/migrations/20260227213635_add_deck_system/migration.sql` | Deck system migration |
| `src/routes/decks/[slug]/+page.server.ts` | Deck detail data loader |
| `src/routes/decks/[slug]/+page.svelte` | Deck detail UI |
| `src/routes/api/decks/[deckId]/enroll/+server.ts` | Deck enrollment endpoint |

## Files Modified

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added Deck, DeckGrammarPoint, UserDeckProgress; modified User, GrammarPoint |
| `prisma/seed.ts` | Added deck, grammar point linking, test user enrollment |
| `src/routes/+page.server.ts` | Rewrote for deck-centric data loading |
| `src/routes/+page.svelte` | Replaced grammar list with deck cards |
| `src/routes/+layout.server.ts` | Deck-aware learnable count, enrolled deck slugs |
| `src/routes/+layout.svelte` | Content dropdown lists enrolled decks |

---

## Verification

- `bun run check` — 0 errors, 0 warnings
- `bun run build` — successful
- `bunx --bun prisma db seed` — all sections complete (deck, 11 grammar links, test user enrollment)
