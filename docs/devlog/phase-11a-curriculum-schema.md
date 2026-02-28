# Phase 11a — Curriculum Schema Refactor

> **Completed:** 2026-02-28
> **Depends on:** Phase 10b (Mastery & Library Decks)

## Summary

Refactored the core data model so that **GrammarPoint** (not ClozeCard) is the FSRS scheduling unit. Previously, each user had one `ReviewCard` per `ClozeCard`, meaning 3–4 FSRS records per grammar concept. Now there is exactly **one `ReviewCard` per (User, GrammarPoint)** pair. Introduced two new models—`LessonExample` and `ClozeCardGrammarTarget`—to support multi-target cloze cards and dedicated lesson-phase sentences. All 17 affected source files were updated, the seed script was rewritten, and 55 integration tests pass.

---

## What Changed

### Core Model Change

**Before:** `ReviewCard` → `clozeCardId` → `ClozeCard` → `grammarPointId` → `GrammarPoint`
- One FSRS record per cloze card per user (3–4 records per grammar concept)
- All queries traversed `reviewCard.clozeCard.grammarPointId`

**After:** `ReviewCard` → `grammarPointId` → `GrammarPoint` → `clozeCards[]`
- One FSRS record per grammar point per user
- Direct `reviewCard.grammarPointId` access — simpler queries, cleaner aggregations
- Which cloze card to show is decided dynamically at queue-build time

### New Models

#### `LessonExample`

Sentences shown during the learn phase only — never enters the FSRS review queue. Each has `fullSentence`, `sentenceWithBlank`, `answer`, `englishHint`, `order`, and optional `notes`. For this phase, auto-generated from the first 2 cloze cards per grammar point; phases 11b/11c will provide dedicated hand-crafted examples.

#### `ClozeCardGrammarTarget`

Many-to-many join table between `ClozeCard` and `GrammarPoint` with payload:
- `wordReplacement` — the specific word/morpheme that becomes the blank for that grammar point
- `blankIndex` — which blank in multi-blank cards (default 0)
- `@@unique([clozeCardId, grammarPointId])` — one target per card per GP

This enables a single cloze card to test multiple grammar points by blanking different words. The answer-check API uses `wordReplacement` to validate user input against the correct target.

### Schema Changes

| Model | Change |
|-------|--------|
| `GrammarPoint` | Added `relatedPointIds` (String[]), `lessonExamples`, `grammarTargets`, `reviewCards` relations |
| `ClozeCard` | Added `introducedAtPosition` (Int), `grammarTargets` relation, `lastShownIn` relation |
| `ReviewCard` | Replaced `clozeCardId` with `grammarPointId`, added `peakStability`, `lastClozeCardId`; unique constraint now `@@unique([userId, grammarPointId])` |
| `LessonExample` | **New model** — lesson-phase sentences |
| `ClozeCardGrammarTarget` | **New model** — join table with word replacement payload |

### Fields Kept for Compatibility

- `ReviewCard.streakCorrect` / `masteredAt` — still used by mastery UI; future phase may migrate to pure stability-based mastery
- `ReviewCard.reps` / `lastReview` — used by dashboard stats computations
- `ClozeCard.grammarPointId` FK — preserved as "primary ownership" relation; the join table adds multi-target capability on top

---

## Files Modified

### Schema & Database

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added 2 new models, refactored ReviewCard FK, added fields to GrammarPoint and ClozeCard |
| `prisma/seed.ts` | Rewritten: creates ClozeCardGrammarTarget for each card, auto-generates LessonExamples, creates ReviewCards keyed by grammarPointId |
| `prisma/migrations/20260228100000_init_with_phase_11a/migration.sql` | Fresh init migration (294 lines) — old migrations removed since this is dev |
| `prisma/test-phase-11a.ts` | **New** — 55-test integration suite covering all query patterns |

### API Routes

| File | Change |
|------|--------|
| `src/routes/api/reviews/+server.ts` | Accepts optional `clozeCardId`, updates `peakStability` (max of current and new), sets `lastClozeCardId` |
| `src/routes/api/reviews/check/+server.ts` | Rewritten: uses `ClozeCardGrammarTarget.wordReplacement` for answer validation |
| `src/routes/api/grammar/[id]/learn/+server.ts` | Creates ONE ReviewCard per grammar point (not per cloze card) |
| `src/routes/api/learn/complete/+server.ts` | Same — one ReviewCard per GP; simplified query |

### Page Loaders

| File | Change |
|------|--------|
| `src/routes/reviews/+page.server.ts` | Queue builds from `ReviewCard` → `grammarPoint` → `clozeCards`; deck filter uses `grammarPoint.decks` |
| `src/routes/dashboard/+page.server.ts` | All `rc.clozeCard.grammarPointId` → `rc.grammarPointId`; deck-due query via `grammarPoint.decks` |
| `src/routes/grammar/+page.server.ts` | ReviewCard query selects `grammarPointId` directly |
| `src/routes/grammar/[id]/+page.server.ts` | `isLearned` uses `findUnique({ where: { userId_grammarPointId } })` |
| `src/routes/decks/+page.server.ts` | Mastery uses `grammarPointId: { in: gpIds }` directly |
| `src/routes/decks/[slug]/+page.server.ts` | `rc.clozeCard.grammarPointId` → `rc.grammarPointId` |

### Components

| File | Change |
|------|--------|
| `src/routes/grammar/[id]/+page.svelte` | Added `as any` casts for clozeCards props (pre-existing JsonValue type mismatch) |

### Documentation

| File | Change |
|------|--------|
| `docs/planning/phase-11a-curriculum-schema.md` | Status → "In Progress", added implementation strategy + 40-item test plan |

## Files Verified Unchanged

| File | Reason |
|------|--------|
| `src/routes/+layout.server.ts` | `ReviewCard.count` doesn't reference clozeCard — no change needed |
| `src/routes/api/reviews/master/+server.ts` | Uses ReviewCard by ID — no schema reference change needed |
| `src/lib/components/GrammarAbout.svelte` | ClozeCard prop shape unchanged |
| `src/lib/components/GrammarExamples.svelte` | ClozeCard prop shape unchanged |
| `src/routes/reviews/+page.svelte` | Queue item shape compatible |
| `src/routes/learn/+page.svelte` | Already uses `as any` casts |
| `src/hooks.server.ts` | Auth only — no SRS references |

---

## Implementation Process

### 1. Deep Audit (Before Any Code Changes)

Read all 17 source files that reference `ClozeCard`, `ReviewCard`, or `GrammarPoint` to map every query pattern. This identified the core invariant change: every place that traversed `reviewCard.clozeCard.grammarPointId` needed replacement with `reviewCard.grammarPointId`.

Key patterns found:
- **Dashboard (272 lines)** — heaviest consumer; groupBy GrammarPoint logic needed simplification
- **Reviews loader** — queue assembly traverses RC → GP → Cards
- **Answer check** — needed complete rewrite for grammar-target-based validation
- **Learn/complete APIs** — create ReviewCards; needed to create per-GP not per-card
- **Deck pages** — mastery aggregation by GP

### 2. Schema Design

Applied the planning document's schema with adjustments:
- Kept `ClozeCard.grammarPointId` as "primary ownership" rather than removing it (backward compat for data queries)
- Kept `streakCorrect`/`masteredAt`/`reps`/`lastReview` on ReviewCard (app code still uses them; deprecation is a future phase concern)
- Added `peakStability` alongside existing mastery fields for display-level mapping
- Made `lastClozeCardId` an explicit optional FK with `onDelete: SetNull`

### 3. Seed Script Rewrite

- Added `LessonExampleSeed` interface and `relatedPointIds` to `GrammarPointSeed`
- For each cloze card: creates a `ClozeCardGrammarTarget` row extracting the answer as `wordReplacement`
- Auto-generates 2 `LessonExample` rows per grammar point from its first 2 cloze cards
- ReviewCard creation: one per grammar point (not per cloze card), using `userId_grammarPointId` constraint
- Verified output: 11 GPs, 36 cards, 36 targets, 22 lesson examples, 5 review cards

### 4. App Code Migration

Applied the core pattern change across all files:
```
// Before
rc.clozeCard.grammarPointId  →  rc.grammarPointId
clozeCard: { include: { grammarPoint } }  →  grammarPoint: { include: { clozeCards } }
```

Rewrote the answer-check API to look up `ClozeCardGrammarTarget.wordReplacement` for the active grammar-point + cloze-card pair.

### 5. Verification Pipeline

1. `bunx --bun prisma db push --force-reset` — schema applied cleanly
2. `bun prisma/seed.ts` — all 9 seed steps pass with correct row counts
3. `bun run build` — production build succeeds
4. `bun run check` — svelte-check: 0 errors, 0 warnings
5. `bun prisma/test-phase-11a.ts` — 55/55 integration tests pass

---

## Architecture Decisions

1. **GrammarPoint as scheduling unit** — One FSRS record per grammar concept per user. The specific cloze card shown during review is chosen dynamically at queue-build time (currently takes the highest `introducedAtPosition` card). This reduces FSRS state management from ~3–4 records per concept to exactly 1.

2. **ClozeCardGrammarTarget join table** — Enables future multi-target cards where one sentence tests multiple grammar points by blanking different words. The `wordReplacement` field stores the target morpheme, and `blankIndex` supports multi-blank cards. Current seeds create 1:1 targets, but the schema is ready for N:M.

3. **LessonExample separation** — Lesson-phase sentences are decoupled from the FSRS review pool. This allows curated, pedagogically ordered examples for initial learning without polluting the review queue with too many cards per grammar point.

4. **Transitional approach** — Kept existing mastery fields (`streakCorrect`, `masteredAt`) alongside new `peakStability`. This avoids any behavioral regression; migration to stability-based mastery can happen in a later phase.

5. **Fresh migration** — Since this is a development environment with no production data, used a single fresh init migration rather than incremental ALTER TABLE statements. The migration is marked as applied via `prisma migrate resolve`.

---

## Integration Test Coverage

55 tests organized in 9 suites:

| Suite | Tests | What's Covered |
|-------|-------|----------------|
| Schema Structure | 12 | Field existence and types for all new/modified columns |
| Unique Constraints | 2 | `(userId, grammarPointId)` on ReviewCard; `(clozeCardId, grammarPointId)` on targets |
| ReviewCard Queries | 12 | Due count, queue with includes, SRS select, deck-scoped, findUnique, deck detail, deck mastery |
| Grammar Targets | 5 | Target listing, composite key lookup, wordReplacement + blankIndex types |
| Lesson Examples | 7 | Ordering, field types, GP includes with examples + cards |
| GP Relations | 6 | All 5 relations (clozeCards, grammarTargets, lessonExamples, decks, reviewCards) |
| peakStability | 3 | Max update pattern, lastClozeCardId update |
| Learn API Pattern | 2 | Create + findUnique round-trip for new ReviewCard |
| Answer Check | 5 | Full answer-check pipeline: RC → card → target → wordReplacement |

---

## Testing Notes

- Test user: `test@example.com` / `testpassword123`
- Database reset required before this phase (incompatible schema change)
- Run `bun prisma/test-phase-11a.ts` to verify all query patterns
- Seed data: 11 grammar points, 36 cloze cards, 36 grammar targets, 22 lesson examples, 5 review cards
