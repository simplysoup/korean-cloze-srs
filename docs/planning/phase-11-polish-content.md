# Phase 11 — Polish & Content (Overview Hub)

> **Status:** 📋 Planned
> **Depends on:** Phase 10 (Learn Flow & Review Integration)

## Overview

Phase 11 is a major expansion split into four sequential sub-phases. The scope has grown significantly beyond the original plan because of three core design upgrades:

1. **Curriculum architecture overhaul** — `ClozeCard` and `GrammarPoint` are now distinct objects with a **many-to-many relationship** via a `ClozeCardGrammarTarget` join table. A single sentence can test multiple grammar points simultaneously; each target declares the exact `wordReplacement` that becomes the blank for that grammar point. Sentences are bifurcated into N+1-constrained `LessonExample` records (instruction only, never FSRS-scheduled) and richer `ClozeCard` records whose eligibility is gated by grammar unlock status.
2. **`GrammarPoint` is the FSRS unit — one `ReviewCard` per user per grammar point.** FSRS state (stability, difficulty, due date) lives on `ReviewCard`, which is keyed on `(userId, grammarPointId)` with a database unique constraint. A user can never have two reviews pending for the same grammar point. The `ClozeCard` shown in any given session is selected dynamically at queue-build time and is not stored as the scheduling unit. After refactoring, `ReviewCard.grammarPointId` is the primary FK; `ReviewCard.lastClozeCardId` is informational only.
3. **Advanced review selection & mastery** — For each due `ReviewCard` (one per GP), the scheduler picks the most curriculum-advanced eligible `ClozeCard` that targets that GP. Grammar points track `peakStability`; at display level 10 (≥ 250 days) they are **Mastered** and their `ReviewCard` is retired from the queue. Related grammar points (register/meaning variants) are linked via `relatedPointIds` for form-mismatch hinting.
4. **Full Bunpro-style curriculum** — Grammar points for TOPIK I are sequenced pedagogically, with lesson and review sentences authored to match.

---

## TOPIK Level Taxonomy

> This must be unambiguous across all content, UI labels, and code.

| Label | Exam | Levels | Description |
|-------|------|--------|-------------|
| **TOPIK I — Level 1** | TOPIK I | 1 | Beginner; basic survival Korean |
| **TOPIK I — Level 2** | TOPIK I | 2 | Beginner+; slightly broader vocabulary and grammar |
| **TOPIK II — Level 3** | TOPIK II | 3 | Intermediate |
| **TOPIK II — Level 4** | TOPIK II | 4 | Upper-intermediate |
| **TOPIK II — Level 5** | TOPIK II | 5 | Advanced |
| **TOPIK II — Level 6** | TOPIK II | 6 | Near-mastery |

TOPIK I and TOPIK II are *separate exam papers*, not simply different levels of the same exam. A learner who passes TOPIK I Level 2 has not taken TOPIK II at all. All deck names, UI labels, and schema values must respect this distinction: **"TOPIK I"** and **"TOPIK II"** are not interchangeable.

> In the Prisma schema, the `topikLevel` field already stores the numeric level (1–6). No schema change required for this. UI must render "TOPIK I" for levels 1–2 and "TOPIK II" for levels 3–6.

---

## Sub-Phase Summary

| Sub-Phase | Name | Key Deliverables |
|-----------|------|-----------------|
| [11a](phase-11a-curriculum-schema.md) | Curriculum Architecture & Schema | `ReviewCard` refactored to `(userId, grammarPointId)` unique key; `ClozeCardGrammarTarget` many-to-many join; `LessonExample` model; `introducedAtPosition`, `relatedPointIds`, `peakStability`; most-advanced-card review selection |
| [11b](phase-11b-topik1-level1-content.md) | TOPIK I Level 1 Content | Full Lesson 1–N grammar sequence, lesson examples, review cards with full `grammarTargets` declaration |
| [11c](phase-11c-topik1-level2-content.md) | TOPIK I Level 2 Content | Level 2 grammar sequence, examples, review cards |
| [11d](phase-11d-ui-polish.md) | UI Polish & Accessibility | Close-answer detection (romanized + Hangul Levenshtein); FSRS auto-rating flow (Hard on retry-correct, Again on fail); GP row list with SRS level 1–10 display; `GrammarPointRow` component; skeletons, keyboard shortcuts, mobile, a11y |

---

## Cross-Cutting Constraints

- **`GrammarPoint` is the FSRS unit — exactly one `ReviewCard` per `(userId, grammarPointId)`.** This is enforced by a DB unique constraint. The system can never queue two reviews for the same grammar point simultaneously. Which `ClozeCard` is shown is decided dynamically at queue-build time and does not affect scheduling state.
- **`ReviewCard` keys on the grammar point, not the card.** `ReviewCard.grammarPointId` is the primary FK. `ReviewCard.lastClozeCardId` is nullable and informational only — it records which sentence was shown last but is ignored by the scheduler on the next session.
- **No regression on Phase 10** — Schema changes in 11a include a breaking `ReviewCard` migration (add `grammarPointId`, drop `clozeCardId`). The old FK is retained in a transitional column until all query sites are updated.
- **Seed must remain idempotent** — All upsert-based seeding with stable IDs. Existing `ClozeCard` rows are backfilled into `cloze_card_grammar_targets`. Existing `ReviewCard` rows are migrated to `grammarPointId` via the `clozeCard.grammarPointId` chain.
- **Lesson examples are not review cards** — They live in `lesson_examples` and are never scheduled by FSRS.
- **ClozeCards and GrammarPoints are distinct** — A card may test multiple grammar points. Each `ClozeCardGrammarTarget` row specifies `wordReplacement` (the exact surface form blanked for that GP) and `blankIndex`.
- **Review selection: most advanced card wins** — For each due `ReviewCard`, the scheduler finds all eligible `ClozeCards` that target that GP (all their targets must be unlocked) and picks the one with the highest `introducedAtPosition`.
- **Mastery at display level 10** — Stability ≥ 250 days maps to level 10. The GP's `ReviewCard` is filtered out of the due queue. Its `wordReplacement` is never used as a cloze target; the word appears pre-filled in sentences that target other GPs.
- **Register variants linked** — `GrammarPoint.relatedPointIds` (bidirectional) enables the review API to accept a variant form and return a hint rather than marking the answer wrong.
### Loading Indicators
- Navigation between pages: top progress bar (thin accent-coloured bar)
- API calls (review submit, learn complete): button spinner state

---

## 11.6 Mobile Optimisation

### Review Page
- Full-width input field
- Larger touch targets for buttons (min 44×44px)
- Swipe gestures: swipe right for Undo, swipe up for Reveal Info
- Keyboard auto-focus on input after card transition

### Grammar Page
- Sidebar actions collapse into a bottom action bar on mobile
- Hero section condenses (smaller title, abbreviated breadcrumb)
- Tab content uses full width
- Example cards stack vertically with comfortable padding

### Dashboard
- Single-column layout
- Profile sidebar becomes a compact horizontal strip at the top
- Chart uses full width, shorter height
- Deck cards stack vertically

---

## 11.7 Accessibility

### ARIA Roles
- Review card: `role="form"` with `aria-label="Review card"`
- Grammar tabs: `role="tablist"` / `role="tab"` / `role="tabpanel"`
- Progress pellets: `role="progressbar"` with `aria-valuenow` / `aria-valuemax`
- Streak calendar: `role="list"` with day items as `role="listitem"`
- SRS cards: `role="button"` with `aria-label` describing the state and count

### Screen Reader Labels
- Input field: `aria-label="Type your answer in romanized Korean"`
- Rating buttons: `aria-label="Rate as Hard"`, etc.
- Chart: `aria-label="Review history chart"` with `aria-describedby` for data summary

### Keyboard Navigation
- Tab order follows visual order
- All interactive elements focusable
- Focus ring visible on keyboard navigation (`:focus-visible`)
- Skip-to-content link at top of page

### Colour Contrast
- Verify all text meets WCAG 2.1 AA contrast ratio (4.5:1 for normal text, 3:1 for large text)
- SRS colours on card backgrounds must contrast with white text

---

## 11.8 Files to Create

| File | Purpose |
|------|---------|
| `prisma/seed-data/topik1-particles.ts` | Particle grammar seed data |
| `prisma/seed-data/topik1-verb-endings.ts` | Verb ending grammar seed data |
| `prisma/seed-data/topik1-connectors.ts` | Connector grammar seed data |
| `prisma/seed-data/topik1-expressions.ts` | Expression grammar seed data |
| `prisma/seed-data/topik1-deck.ts` | Deck + ordering seed data |
| `prisma/seed-data/test-user.ts` | Test user seed data |
| `src/lib/closeAnswerCheck.ts` | Close-answer detection (romanized + Hangul Levenshtein ≤ 1) |
| `src/lib/levenshtein.ts` | Levenshtein distance utility |
| `src/lib/fsrsLevel.ts` | `fsrsToDisplayLevel(stability)` — maps FSRS stability to SRS level 1–10 |
| `src/lib/components/GrammarPointRow.svelte` | Single-row GP display: Hangul + English left, SRS level right |
| `src/lib/components/SkeletonDashboard.svelte` | Dashboard loading skeleton |
| `src/lib/components/SkeletonGrammar.svelte` | Grammar page loading skeleton |
| `src/lib/components/SkeletonReview.svelte` | Review page loading skeleton |
| `src/lib/components/SelfRating.svelte` | Self-rating button group (shown only on clean first-attempt correct) |

## 11.9 Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Refactor `ReviewCard` (add `grammarPointId` FK + unique constraint, `peakStability`, `lastClozeCardId`; remove `clozeCardId` in follow-up); add `closeAnswers` to `ClozeCard` |
| `prisma/seed.ts` | Refactor to import from `seed-data/` modules; migrate existing `ReviewCard` rows via data script |
| `src/routes/reviews/+page.server.ts` | Rewrite review queue: iterate `ReviewCard` by GP, select most-advanced eligible `ClozeCard` per GP dynamically |
| `src/routes/reviews/+page.svelte` | Self-rating UI, keyboard shortcuts, close-answer display, mobile touch |
| `src/routes/api/reviews/+server.ts` | Receives `reviewCardId` (GP-keyed); writes FSRS state to `ReviewCard`; updates `peakStability` and `lastClozeCardId` |
| `src/routes/api/reviews/check/+server.ts` | Return close-answer info and `wordReplacement`-based answer check in response |
| `src/routes/dashboard/+page.svelte` | Add skeleton loading |
| `src/routes/grammar/[id]/+page.svelte` | Add skeleton loading, mobile bottom bar |
| `src/routes/learn/+page.svelte` | Keyboard navigation support |
| `src/app.css` | Skeleton animations, mobile breakpoint refinements, accessibility focus styles |

---

## Dependencies

- Phases 7–10 complete (deck system, dashboard, grammar pages, learn flow)
- No new npm packages required (Levenshtein distance implemented inline, skeletons CSS-only)
