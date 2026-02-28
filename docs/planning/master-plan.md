# Master Plan — Korean Cloze SRS

> **Last updated:** 2026-07-04

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
| 7 | Deck System & Schema | ✅ Done | Deck model, TOPIK Level 1 Grammar deck, deck-based learning/review flow |
| 8 | Dashboard Redesign | ✅ Done | Bunpro-inspired dashboard with review graph, deck progress, streak, SRS distribution |
| 9 | Grammar Learning Pages | ✅ Done | Per-grammar-point learning page with Details/Examples tabs, lesson queue |
| 10 | Learn Flow & Review Integration | ✅ Done | Session-based learn flow, quiz, navbar Learn/Review buttons, no-deck UX |
| 11a | Curriculum Architecture & Schema | 📋 Planned | `ClozeCardGrammarTarget` many-to-many, `LessonExample`, most-advanced-card review selection, register-variant GP links |
| 11b | TOPIK I Level 1 Content | 📋 Planned | Full Lessons 1–N grammar sequence, lesson examples, review cards |
| 11c | TOPIK I Level 2 Content | 📋 Planned | Level 2 grammar sequence, examples, review cards |
| 11d | UI Polish & Accessibility | 📋 Planned | Close-answer detection (romanized + Hangul), FSRS auto-rating flow, GP row list with SRS level display, mastery gating, skeletons, a11y |

---

## Current State (Post-Phase 10)

- **12 database tables:** User, Session, Account, Verification, GrammarPoint, ClozeCard, ReviewCard, ReviewLog, Deck, DeckGrammarPoint, UserDeckProgress, UserStreak
- **11 grammar points** (Korean particles) with **36 cloze cards** in **1 deck** (TOPIK I Level 1 Grammar)
- **Authentication:** Email/password sign-up and sign-in via BetterAuth with rate limiting
- **FSRS scheduling:** Active via `POST /api/reviews` with rating 1–4, server-side answer verification
- **Deck system:** Deck model with grammar point ordering, enrollment API, per-user progress tracking
- **Learn flow:** Session-based (`/learn?deck_id=...`), configurable batch size 1–20, auto-advances on "Add to Deck", post-session quiz, completion summary
- **Navbar:** Sticky header with Learn (green badge) and Review (blue badge) buttons, counts from single layout server source of truth; always-clickable (redirects to `/decks` when no deck enrolled)
- **Dashboard:** Review history chart, deck progress, streak, SRS distribution; Learn and Review cards wired to layout counts; "Choose a Deck" state when no decks enrolled
- **Routes:** `/`, `/login`, `/dashboard`, `/learn`, `/reviews`, `/decks`, `/decks/[slug]`, `/grammar/[slug]`
- **TOPIK taxonomy:** TOPIK I = Levels 1–2, TOPIK II = Levels 3–6 (distinct exam papers)
- **Test user:** `test@example.com` / `testpassword123`

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

## Phase 10 — Learn Flow & Review Integration ✅ Done

> Session-based learn flow providing N grammar points per session (user-adjustable 1–20, default 5), auto-advance on "Add to Deck", post-session cloze quiz, and completion summary. Navbar Learn/Review buttons with live badges sourced from a single layout server computation. No-deck UX: all learn entry-points redirect to /decks when user has no enrolled decks.

See [phase-10-learn-review-flow.md](phase-10-learn-review-flow.md) for full devlog.

### Completed
- `/learn?deck_id=...` — session-based, batch size 1–20, auto-advance
- Post-session quiz using all available cloze cards for added grammar points
- "Skip Quiz & Finish" to test out at any time
- Navbar Learn (green) + Review (blue) badges — single source of truth from layout server
- Dashboard Learn/Review cards wired to layout counts
- No-deck UX: navbar + dashboard always redirect to `/decks` when unenrolled

---

## Phase 11a — Curriculum Architecture & Schema

> Refactor the ClozeCard model to support many-to-many grammar point associations via `ClozeCardGrammarTarget`. Each card declares all grammar it tests and which word is blanked per grammar point. Review selection prefers the most curriculum-advanced card available per grammar point. Grammar points gain `relatedPointIds` for register-variant detection. Bifurcate learn-phase sentences into `LessonExample` (N+1 constrained, not FSRS scheduled).

See [phase-11a-curriculum-schema.md](phase-11a-curriculum-schema.md) for full specification.

### Key deliverables
- New Prisma model: `LessonExample` (lesson_examples table)
- New Prisma model: `ClozeCardGrammarTarget` (many-to-many join with `wordReplacement` per GP)
- New field: `ClozeCard.introducedAtPosition` (denormalized max curriculum position across all targets)
- New field: `GrammarPoint.relatedPointIds` (register/meaning variant links)
- Prisma migration + data backfill from existing `grammarPointId` FK
- Learn page serves `lessonExamples` during instruction phase
- Review queue: most-advanced-card selection; all targets must be unlocked
- Answer checking against per-target `wordReplacement`; variant hint on register mismatch

---

## Phase 11b — TOPIK I Level 1 Content

> Full grammar curriculum for TOPIK I Level 1, sequenced lesson-first (Bunpro-style). Lesson 1 and 2 sequencing defined; Lessons 3–13 provisional.

See [phase-11b-topik1-level1-content.md](phase-11b-topik1-level1-content.md) for full specification.

### Key deliverables
- All TOPIK I Level 1 grammar points seeded with lesson examples + review cards
- N+1 constraint verified on all lesson examples
- Prerequisite mapping on richer review cards
- Modular seed-data file structure

---

## Phase 11c — TOPIK I Level 2 Content

> Grammar curriculum for TOPIK I Level 2. TOPIK I and TOPIK II are distinct exam tiers — this phase covers Level 2 of the TOPIK I paper only.

See [phase-11c-topik1-level2-content.md](phase-11c-topik1-level2-content.md) for full specification.

### Key deliverables
- Full TOPIK I Level 2 grammar sequence
- Lesson examples and review cards with prerequisites
- Deck configuration decision: single TOPIK I deck vs. separate Level 1 / Level 2 decks

---

## Phase 11d — UI Polish & Accessibility

> Close-answer detection on both romanized and Hangul input (Levenshtein ≤ 1); yellow close notification with character diff. FSRS auto-rates Hard on first-hint-then-correct, Again on fail; self-rating (Hard/Good/Easy) only on clean first-attempt correct. Grammar point list redesigned as single-item rows: Hangul form + English description left, numeric SRS level (1–10) colour-coded by mastery right. Keyboard shortcuts, loading skeletons, mobile fixes, WCAG 2.1 a11y.

See [phase-11d-ui-polish.md](phase-11d-ui-polish.md) for full specification.

### Key deliverables
- Close-answer detection on romanized input (`nen` ≈ `neun`) and Hangul Levenshtein ≤ 1 → yellow border + character diff
- FSRS auto-rating: Hard (2) on retry-correct, Again (1) on fail; self-rating UI only on clean first-attempt correct
- Grammar point list: `<GrammarPointRow>` component — Hangul + English left, SRS level 1–10 right (coloured by tier, gold at 10 = Mastered)
- `peakStability` on `ReviewCard`; mastered GPs (level 10) retired from review queue and excluded from cloze targeting
- `fsrsToDisplayLevel(stability)` mapping utility
- Keyboard shortcuts (Enter, 1/2/3, Ctrl+Z, Ctrl+I)
- CSS-only loading skeletons for dashboard, grammar page, review page
- Mobile touch-target fixes, scroll-margin, responsive grid
- ARIA roles, live regions, focus-visible, reduced-motion

---

## Docs Index

**Planning:**
- [Phase 11 Hub](phase-11-polish-content.md) — TOPIK taxonomy, sub-phase summary, cross-cutting constraints
- [Phase 11a — Curriculum Architecture & Schema](phase-11a-curriculum-schema.md)
- [Phase 11b — TOPIK I Level 1 Content](phase-11b-topik1-level1-content.md)
- [Phase 11c — TOPIK I Level 2 Content](phase-11c-topik1-level2-content.md)
- [Phase 11d — UI Polish & Accessibility](phase-11d-ui-polish.md)
- [Phase 7 — Deck System](phase-7-deck-system.md)
- [Phase 8 — Dashboard](phase-8-dashboard.md)
- [Phase 9 — Grammar Pages](phase-9-grammar-pages.md)
- [Phase 10 — Learn Flow](phase-10-learn-review-flow.md)

**Devlog:** [../devlog/](../devlog/) — completed phase documentation

**Context:**
- [LLM Context](../context/LLM_CONTEXT.md)
- [Prisma 7 Notes](../context/PRISMA7_NOTES.md)
- [DB Plan](../context/DB_PLAN.md)
