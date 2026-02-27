# Master Plan — Korean Cloze SRS

> **Last updated:** 2026-02-27

## Project Vision

A spaced-repetition web app for learning Korean grammar through cloze-deletion (fill-in-the-blank) exercises, modelled after Bunpro's deck-based study system. Users progress through TOPIK-levelled grammar decks, study individual grammar point learning pages, and review via cloze cards with romanized Korean input → live Hangul conversion. A dashboard shows review history, deck progress, streak, and SRS-level distribution.

## Architecture

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit 2, Svelte 5 (runes) |
| Language | TypeScript (strict) |
| Database | PostgreSQL 16 (Podman) |
| ORM | Prisma 7.4 (`prisma-client` generator + `@prisma/adapter-pg`) |
| Auth | BetterAuth 1.4 (email/password + Argon2id) |
| SRS | ts-fsrs (FSRS algorithm) |
| Charts | Chart.js 4 (canvas-based) |
| Runtime | Bun |
| Build | Vite 7 |

## Phase Summary

| Phase | Name | Status | Description |
|-------|------|--------|-------------|
| 1 | MVP | ✅ Done | Single hardcoded cloze card, romanization → Hangul |
| 2 | UI Polish | ✅ Done | Remove bounding boxes, centered layout, tense/register placeholders, syntax highlighting |
| 3 | Interactions & FSRS | ✅ Done | Review queue, incorrect/correct flows, undo, reveal info, FSRS API |
| 4 | Database & Seeding | ✅ Done | Prisma schema, 11 grammar points, 36 cards, test user, Argon2id |
| 5 | Auth & Routing | ✅ Done | BetterAuth integration, login/signup, home page, route restructure |
| 6 | Hardening | ✅ Done | Auth-gate API, server-side answer verification, error handling, rate limiting |
| 7 | Deck System & Schema | 📋 Planned | Deck model, TOPIK Level 1 Grammar deck, deck-based learning/review flow |
| 8 | Dashboard Redesign | 📋 Planned | Bunpro-inspired dashboard with review graph, deck progress, streak, SRS distribution |
| 9 | Grammar Learning Pages | 📋 Planned | Per-grammar-point learning page with Details/Examples tabs, lesson queue |
| 10 | Learn Flow & Review Integration | 📋 Planned | Lesson queue navigation, "learn then review" flow, deck-scoped reviews |
| 11 | Polish & Content | 📋 Planned | Full TOPIK 1 grammar content, close-answer detection, UI refinements |

---

## Current State (Post-Phase 6)

- **8 database tables:** User, Session, Account, Verification, GrammarPoint, ClozeCard, ReviewCard, ReviewLog
- **11 grammar points** (Part 3 Korean particles) with **36 cloze cards**
- **Authentication:** Email/password sign-up and sign-in via BetterAuth with rate limiting
- **FSRS scheduling:** Active via `POST /api/reviews` with rating 1–4, server-side answer verification
- **Routes:** `/` (home + grammar list), `/login`, `/reviews` (auth-gated), `/reviews/roman-to-hangul`
- **Auth-gated API:** `POST /api/reviews` and `POST /api/reviews/check` require auth + ownership
- **Error handling:** Network error retry, next-review countdown, login validation
- **Levelling:** XP system based on total reviews (10 XP per review, level N needs N×100 XP)
- **Test user:** `test@example.com` / `testpassword123` (5 review cards seeded)

---

## Phase 7 — Deck System & Schema

> Introduce a Deck model that organises grammar points into TOPIK-levelled study paths. Create the first deck (TOPIK Level 1 Grammar). Restructure navigation around deck-based study.

See [phase-7-deck-system.md](phase-7-deck-system.md) for full specification.

### Key deliverables
- `Deck` and `DeckGrammarPoint` models in Prisma schema
- `UserDeckProgress` model for per-user enrollment and tracking
- Database migration + seed: "TOPIK Level 1 Grammar" deck with all existing + new grammar points
- Deck detail page at `/decks/[id]` showing grammar points in study order
- API: `POST /api/decks/[deckId]/enroll`
- Home page updated to show enrolled deck cards

---

## Phase 8 — Dashboard Redesign

> Replace the home page with a Bunpro-inspired dashboard: review history chart, deck progress, study streak, SRS distribution, profile sidebar.

See [phase-8-dashboard.md](phase-8-dashboard.md) for full specification.

### Key deliverables
- Review History Chart (Chart.js canvas, Hourly/Daily toggle)
- Deck Progress Cards with SRS-level-coloured progress bars
- Profile Sidebar (user info, level, XP bar, streak, TOPIK progress, quick stats)
- SRS Level Distribution cards (New/Learning/Review/Relearning mapped to visual tiers)
- `UserStreak` model for daily study tracking
- Responsive 3-column grid layout

---

## Phase 9 — Grammar Learning Pages

> Per-grammar-point learning page rendered when studying new grammar or reviewing. Inspired by Bunpro's Learn page.

See [phase-9-grammar-pages.md](phase-9-grammar-pages.md) for full specification.

### Key deliverables
- Route: `/grammar/[id]` with Details/Examples tabs
- Hero header with grammar title, deck breadcrumb, lesson position
- Structure card, metadata card, about section with embedded examples
- Examples tab showing all cloze cards with highlighted answers
- Schema: `structurePattern` and `notes` fields on GrammarPoint
- Navigation footer with Previous/Next + progress pellets

---

## Phase 10 — Learn Flow & Review Integration

> Connect grammar pages into a lesson flow. Users learn new grammar in order from their deck, then review with the existing cloze system.

See [phase-10-learn-review-flow.md](phase-10-learn-review-flow.md) for full specification.

### Key deliverables
- Learn route: `/learn?deck_id=[id]` with configurable batch size
- Auto-ReviewCard creation on lesson completion
- Deck-scoped reviews: `/reviews?deck_id=[id]`
- Dashboard Learn/Review cards wired to deck progress
- Review → Grammar page link after answering

---

## Phase 11 — Polish & Content

> Fill out TOPIK 1 content to 30–50+ grammar points, add close-answer detection, self-rating, keyboard shortcuts, and mobile-optimised UI.

See [phase-11-polish-content.md](phase-11-polish-content.md) for full specification.

### Key deliverables
- Full TOPIK 1 grammar set (particles, verb endings, connectors, honorifics)
- Close-answer detection with character-level diff
- Self-rating (Hard/Good/Easy) after correct answers
- Keyboard shortcuts, loading skeletons, accessibility improvements

---

## Docs Index

- [Phase 7 — Deck System](phase-7-deck-system.md) — next planned work
- [Phase 8 — Dashboard](phase-8-dashboard.md) — review chart, deck progress, streak
- [Phase 9 — Grammar Pages](phase-9-grammar-pages.md) — per-grammar learning pages
- [Phase 10 — Learn & Review Flow](phase-10-learn-review-flow.md) — lesson queue, deck-scoped reviews
- [Phase 11 — Polish & Content](phase-11-polish-content.md) — content expansion, UX refinements
- [Devlog](../devlog/) — completed phase documentation
- [LLM Context](../context/LLM_CONTEXT.md) — AI development context
- [Prisma 7 Notes](../context/PRISMA7_NOTES.md) — Prisma 7 reference
- [DB Plan](../context/DB_PLAN.md) — original database implementation plan
