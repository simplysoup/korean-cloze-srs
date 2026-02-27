# Phase 9 — Grammar Learning Pages (Devlog)

> **Status:** ✅ Complete
> **Date:** 2026-02-27

## Summary

Implemented per-grammar-point learning pages at `/grammar/[id]` with Details/Examples tabs, hero header, structure card, metadata, about section with embedded examples and notes, and a sidebar with "Mark as Learned" functionality. Also added a placeholder favicon.ico and linked grammar pages from both the deck detail page and the review reveal section.

---

## Changes Made

### Schema Changes

- **Added to `GrammarPoint` model:**
  - `structurePattern` (`String?`, mapped to `structure_pattern`) — Grammar pattern formula (e.g. "Noun + 은/는")
  - `notes` (`Json?`) — Array of note sections: `[{ type: 'caution' | 'funfact' | 'tip', title, content }]`
- **Migration:** `20260227232331_add_grammar_structure_notes`

### Seed Data Updates

- Added `structurePattern` and `notes` to all 11 grammar points
- Each grammar point now has 1–2 notes (tips, cautions, fun facts)
- Updated `GrammarPointSeed` interface and upsert calls

### New Files

| File | Purpose |
|------|---------|
| `src/routes/grammar/[id]/+page.server.ts` | Server loader — fetches grammar point with cloze cards, lesson context, deck context, learn status |
| `src/routes/grammar/[id]/+page.svelte` | Main grammar page — orchestrates all components, tab switching |
| `src/routes/api/grammar/[id]/learn/+server.ts` | POST endpoint — creates ReviewCards for all cloze cards, updates UserDeckProgress |
| `src/lib/components/GrammarHero.svelte` | Hero header with gradient background, breadcrumb, title, hint |
| `src/lib/components/GrammarTabs.svelte` | Details/Examples tab navigation with ARIA attributes |
| `src/lib/components/StructureCard.svelte` | Grammar pattern formula card |
| `src/lib/components/MetadataCard.svelte` | Category/register/tense/level metadata grid + tag pills |
| `src/lib/components/GrammarAbout.svelte` | Description + embedded example sentences + notes (caution/funfact/tip) |
| `src/lib/components/GrammarExamples.svelte` | Full cloze card list with highlighted answers and metadata |
| `src/lib/components/GrammarActions.svelte` | Sidebar — "Mark as Learned" button + "Add Note" placeholder |
| `src/lib/components/LessonNav.svelte` | Fixed footer nav with Previous/Next + progress pellets |
| `static/favicon.ico` | Placeholder 16×16 favicon (blue + white) |

### Modified Files

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added `structurePattern` and `notes` fields to GrammarPoint |
| `prisma/seed.ts` | Added `structurePattern`, `notes` data for all 11 grammar points |
| `src/app.css` | Added ~500 lines of grammar page styles (hero, tabs, cards, examples, actions, nav) |
| `src/hooks.server.ts` | Added `/grammar` to `PUBLIC_PATHS` (grammar pages are publicly accessible) |
| `src/routes/reviews/+page.svelte` | Added `grammarPointId` to ClozeCard interface, "View Grammar →" link in reveal info section |
| `src/routes/reviews/+page.server.ts` | Added `grammarPointId` to review queue data |
| `src/routes/decks/[slug]/+page.svelte` | Grammar rows now link to `/grammar/[id]?deck_id=...&lesson=...` with hover styles |

---

## Route Access

- `/grammar/[id]` — **Public** (no auth required). Actions sidebar adapts: shows "Log in to track progress" for anonymous users, "Mark as Learned" for authenticated users.
- `/api/grammar/[id]/learn` — **Auth-gated** (401 for unauthenticated).

## URL Patterns

- Direct: `/grammar/gp_topic`
- With lesson context: `/grammar/gp_topic?deck_id=deck_topik1_grammar&lesson=1`
  - Enables Previous/Next navigation + progress pellets in footer
  - Shows breadcrumb: "TOPIK Level 1 Grammar · Lesson 1: 1/3"

## Design Decisions

- **Grammar pages are public** — useful as reference, auth only needed for "Mark as Learned"
- **Tab state is client-side only** — no URL update for Details/Examples switch
- **Examples show full answers** — learning pages are for studying, not testing
- **Notes stored as JSON** — flexible schema without migrations per note type
- **`$derived` for learned state** — avoids Svelte 5's "captured initial value" warning; combines prop and local state
- **Deck detail grammar rows are now links** — clicking any grammar point navigates to its learning page with full lesson context

## Known Limitations

- **"Add Note" is a placeholder** — disabled button, planned for Phase 11
- **No keyboard shortcuts** — planned for Phase 11
- **Lesson nav doesn't carry deck_id** — when navigating without query params, Previous/Next within lessons won't appear (fallback shows "Back to deck" or "Back to Dashboard")

---

## Testing

- `curl` verified: `/grammar/gp_topic` returns 200, `/grammar/nonexistent` returns 404
- Auth routes (`/dashboard`, `/reviews`) still return 302 redirect for unauthenticated users
- Public routes (`/`, `/login`, `/grammar/*`) return 200
- `/favicon.ico` returns 200 (no more 404)
- No TypeScript errors, no runtime warnings
- Seed runs cleanly with new fields
