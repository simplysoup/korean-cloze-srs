# Phase 11a — Curriculum Architecture & Schema

> **Status:** ✅ Completed (2026-02-28)
> **Depends on:** Phase 10
> **Blocks:** Phase 11b, 11c (content cannot be written until the schema is ready)
> **Complexity note:** This phase is a significant schema refactor. Further task-splitting into implementation sub-tasks (e.g., 11a-i migration, 11a-ii review-queue, 11a-iii learn-page) may be warranted.

---

## Core Concept: ClozeCards vs. GrammarPoints

**These are distinct objects with a many-to-many relationship.**

> ⚠️ **Fundamental invariant: `GrammarPoint` is the unit of the FSRS system.**
> There is exactly **one** `ReviewCard` row per `(userId, grammarPointId)` pair, enforced by a database unique constraint.
> A user can never have two reviews pending for the same grammar point.
> Which `ClozeCard` sentence is shown during a review session is decided dynamically at queue-build time — it is **not** stored on `ReviewCard`.

| Concept | Description |
|---------|-------------|
| `GrammarPoint` | A single grammatical rule / morpheme (e.g., topic particle **-는**, destination particle **-에**, formal polite ending **-습니다**). **This is the FSRS scheduling unit.** Each user has at most one `ReviewCard` per grammar point. |
| `ReviewCard` | Holds FSRS state (stability, difficulty, due date) for one user × one grammar point. Keyed on `(userId, grammarPointId)` with a unique constraint. Does **not** reference a specific `ClozeCard`. |
| `ClozeCard` | A Korean sentence used as the test vehicle during a review. A single card can test **multiple grammar points simultaneously**. The specific card shown for a due `ReviewCard` is chosen dynamically by the queue scheduler. |
| `ClozeCardGrammarTarget` | Join table linking a `ClozeCard` to each `GrammarPoint` it tests, along with the `wordReplacement` — the exact word/morpheme that becomes the blank for that grammar point. |

### Illustrative Example

The sentence:

> **저는 오늘 아침에 화장실에 갔습니다.**
> *"I went to the bathroom this morning."*

breaks down into **four grammar points**:

| Grammar Point | Element | Blank word |
|--------------|---------|-----------|
| Topic particle **-는** | 저**는** | 저는 |
| Time particle **-에** | 아침**에** | 아침에 |
| Destination particle **-에** (motion verbs) | 화장실**에** | 화장실에 |
| Past tense + formal polite **-았/었습니다** | 갔**습니다** | 갔습니다 |

This one `ClozeCard` links to all four `GrammarPoint` records. Each `ClozeCardGrammarTarget` row specifies which word goes blank when _that_ grammar point is being tested.

**Introduced at:** The card enters the review queue only when the user reaches the **latest grammar point** (by curriculum position) among all four. Once unlocked, it serves as a review vehicle for any of the four grammar points it contains.

---

## Problem Statement

The app currently has a single sentence type: `ClozeCard`, with a single `grammarPointId` FK. This one-to-one model is insufficient for rich, grammar-dense sentences:

1. **Real Korean sentences contain multiple grammar patterns simultaneously.** Treating each card as testing exactly one point wastes pedagogical value and forces artificial sentence construction.
2. **Learn sentences must be N+1 constrained.** A sentence shown during instruction for GP at curriculum position N may not contain grammar from positions > N. Review cards have no such constraint but must declare all grammar they test.
3. **Review selection should be "most advanced card available."** When reviewing GP X, the system should prefer the `ClozeCard` that contains the highest-position GP (among all GPs the user has unlocked), not an arbitrary card.
4. **Grammar points can have register/meaning variants.** Using **-에요** instead of **-이다** is semantically equivalent but registers differently (polite informal vs. plain). The SRS should detect this and suggest the appropriate form.

### Solution

Bifurcate sentence content into two models and replace the 1:1 GP→Card relation with many-to-many:

| Model | Phase | Constraint | FSRS scheduled? |
|-------|-------|-----------|----------------|
| `LessonExample` | Learn (instruction) | Strictly N+1: sentence may only use grammar at curriculum positions ≤ target GP's position | No |
| `ClozeCard` | Review (testing) | May use any grammar; must declare all GP targets via `ClozeCardGrammarTarget` | Yes |

---

## Schema Changes

### 1. New Model: `LessonExample`

Sentences shown to the user during the **learn phase** while studying a grammar point. These are *never* surfaced in the FSRS review queue.

```prisma
model LessonExample {
  id             String       @id @default(cuid())
  grammarPointId String       @map("grammar_point_id")
  grammarPoint   GrammarPoint @relation(fields: [grammarPointId], references: [id], onDelete: Cascade)
  fullSentence   String       @map("full_sentence")       // Complete Korean sentence with answer visible
  sentenceWithBlank String    @map("sentence_with_blank") // Sentence with ___ in place of target
  answer         String                                    // The expected fill-in
  englishHint    Json         @map("english_hint")        // Same shape as ClozeCard.englishHint
  order          Int          @default(0)                  // Display order within a grammar point
  notes          String?                                   // Optional authoring note (not shown to user)
  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt      @map("updated_at")

  @@map("lesson_examples")
}
```

**N+1 authoring rule (enforced by convention, not DB constraint):**
- A lesson example for GP at curriculum position N may contain ONLY grammar from positions 1 through N.
- Must be verified manually during seed authoring (see 11b/11c content files).
- A future lint script (`scripts/check-n1.ts`) could automate this.

---

### 2. New Join Table: `ClozeCardGrammarTarget`

Replaces the single `grammarPointId` FK on `ClozeCard` with a many-to-many association that also carries **which word is blanked** for each grammar point.

```prisma
model ClozeCardGrammarTarget {
  id              String       @id @default(cuid())
  clozeCardId     String       @map("cloze_card_id")
  clozeCard       ClozeCard    @relation(fields: [clozeCardId], references: [id], onDelete: Cascade)
  grammarPointId  String       @map("grammar_point_id")
  grammarPoint    GrammarPoint @relation(fields: [grammarPointId], references: [id], onDelete: Restrict)

  // The word/morpheme in the sentence that becomes the blank when testing THIS grammar point.
  // e.g., "저는" for the topic-particle target, "갔습니다" for the past-tense target.
  wordReplacement String       @map("word_replacement")

  // Which blank position this is when multiple blanks appear simultaneously (0-indexed).
  blankIndex      Int          @default(0) @map("blank_index")

  createdAt       DateTime     @default(now()) @map("created_at")

  @@unique([clozeCardId, grammarPointId])
  @@map("cloze_card_grammar_targets")
}
```

**Updated `ClozeCard` model (key changes):**

```prisma
model ClozeCard {
  // --- REMOVE ---
  // grammarPointId String  (single FK — replaced by join table)

  // --- ADD ---
  grammarTargets  ClozeCardGrammarTarget[]

  // The curriculum position of the "latest" grammar point in grammarTargets.
  // Cached for efficient queue ordering — recomputed on seed/upsert.
  introducedAtPosition Int @default(0) @map("introduced_at_position")

  // ... all other existing fields remain unchanged ...
}
```

**Updated `GrammarPoint` model:**

```prisma
model GrammarPoint {
  // ... existing fields ...
  lessonExamples  LessonExample[]
  grammarTargets  ClozeCardGrammarTarget[]   // replaces: clozeCards ClozeCard[]

  // IDs of grammar points that are register/meaning variants of this one.
  // e.g., -에요 (polite informal) links to -이다 (plain/copula).
  // Used by the review system to suggest alternative forms when the user
  // answers with a valid but register-mismatched form.
  relatedPointIds String[] @default([]) @map("related_point_ids")
}
```

---

### 3. Refactored `ReviewCard` Model

**This is a breaking schema change from Phase 10.** `ReviewCard` previously held a `clozeCardId` FK, making FSRS state per-card rather than per-grammar-point. This allowed (incorrectly) multiple `ReviewCard` rows for a single GP. The new model keys on the grammar point directly.

```prisma
model ReviewCard {
  id             String       @id @default(cuid())
  userId         String       @map("user_id")
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  // The grammar point this FSRS record tracks. ONE row per (user, grammarPoint).
  grammarPointId String       @map("grammar_point_id")
  grammarPoint   GrammarPoint @relation(fields: [grammarPointId], references: [id], onDelete: Cascade)

  // FSRS scheduling state
  stability      Float        @default(0)
  difficulty     Float        @default(0.3)
  due            DateTime     @default(now())
  lapses         Int          @default(0)
  state          Int          @default(0)   // FSRS State enum: New/Learning/Review/Relearning

  // Mastery cache — updated after each rating; max stability ever achieved for this GP
  peakStability  Float        @default(0)   @map("peak_stability")

  // Informational only — which ClozeCard was presented in the most recent session.
  // Not used for scheduling; the next session will re-select dynamically.
  lastClozeCardId String?     @map("last_cloze_card_id")
  lastClozeCard   ClozeCard?  @relation(fields: [lastClozeCardId], references: [id], onDelete: SetNull)

  createdAt      DateTime     @default(now()) @map("created_at")
  updatedAt      DateTime     @updatedAt     @map("updated_at")

  @@unique([userId, grammarPointId])   // ← enforces one-per-GP invariant at DB level
  @@map("review_cards")
}
```

**Why `lastClozeCardId` is nullable and informational:**
- On the next review, the scheduler ignores `lastClozeCardId` and re-runs the most-advanced-card algorithm fresh.
- It is stored only for analytics / debugging ("what card did the user see last?").
- If the card is deleted, the FK silently nullifies (`onDelete: SetNull`).

**Migration note:** Existing `review_cards` rows (which FK to `cloze_cards`) must be migrated. For each existing row, look up the `ClozeCard → grammarPointId` and write a new row keyed to that GP. If two old rows somehow map to the same `(userId, grammarPointId)` (shouldn't happen given old 1:1 model, but verify), keep the one with the higher stability.

---

### 4. Grammar Point Variant Linking

Grammar points can share meaning but differ in register (formal, polite-informal, plain, casual). When a user's answer matches a *related* grammar point's form instead of the target, the system should:

1. **Accept the answer as correct** (semantically valid).
2. **Show a hint:** *"You used -에요 (polite informal). The target here was -이다 (plain form). Both are correct, but know the difference!"*

**Relation examples:**

| Point A | Point B | Relation |
|---------|---------|---------|
| -이다 (plain copula) | -에요/이에요 (polite informal) | register variants |
| -습니다/ㅂ니다 (formal polite) | -에요/이에요 (polite informal) | register variants |
| -아/어 (casual) | -아요/어요 (polite informal) | register variants |

`relatedPointIds` is a bidirectional list — if A lists B's ID, B should also list A's ID. A future enhancement could introduce a dedicated `GrammarPointRelation` table with a typed `relationType` enum if more nuance is needed.

---

## Review Queue: "Most Advanced Card" Selection

### Principle

> **`GrammarPoint` is the FSRS unit.** The review queue is a list of due `ReviewCard` rows, each keyed to one `(userId, grammarPointId)`. There is never more than one due item per grammar point per user.
>
> For each due `ReviewCard`, the scheduler dynamically selects the most curriculum-advanced `ClozeCard` that (a) targets that grammar point and (b) has all its other grammar targets already unlocked by the user.

ClozeCards are the *test vehicle*. They are chosen fresh each session. The FSRS state (stability, due date, difficulty) lives entirely on `ReviewCard`, not on any card.

### What "Unlocked" Means

A grammar point is **unlocked** for a user when a `ReviewCard` row exists for `(userId, grammarPointId)`. This happens when the user adds the GP to their deck. An unlocked GP does not need to be due — it just needs to exist.

A `ClozeCard` is **eligible** to serve a due ReviewCard when:
- All `grammarTargets` on that card belong to grammar points the user has unlocked.
- Equivalently: every `ClozeCardGrammarTarget.grammarPointId` on that card has a corresponding `ReviewCard` row for this user.

### Selection Logic (queue build)

```ts
// 1. Fetch all due ReviewCards for this user, with their GP
const dueReviews = await prisma.reviewCard.findMany({
  where: { userId, due: { lte: new Date() } },
  include: { grammarPoint: true }
});
// Result: one row per due grammar point. Cannot be multiple rows for the same GP.

// 2. Build the set of ALL unlocked GP IDs (due or not)
const unlockedGpIds = new Set(
  (await prisma.reviewCard.findMany({
    where: { userId },
    select: { grammarPointId: true }
  })).map(r => r.grammarPointId)
);

// 3. For each due ReviewCard, select the best ClozeCard to present
const sessionItems = await Promise.all(dueReviews.map(async (rc) => {
  // Find all ClozeCards that target this grammar point
  const candidates = await prisma.clozeCardGrammarTarget.findMany({
    where: { grammarPointId: rc.grammarPointId },
    include: {
      clozeCard: {
        include: { grammarTargets: { select: { grammarPointId: true } } }
      }
    }
  });

  // Keep only cards where every grammar target is unlocked
  const eligible = candidates.filter(t =>
    t.clozeCard.grammarTargets.every(tt => unlockedGpIds.has(tt.grammarPointId))
  );

  // Pick the most curriculum-advanced eligible card
  eligible.sort((a, b) => b.clozeCard.introducedAtPosition - a.clozeCard.introducedAtPosition);

  return {
    reviewCard: rc,          // holds the FSRS state
    clozeCard: eligible[0]?.clozeCard ?? null,  // the sentence to show
    activeGrammarPointId: rc.grammarPointId     // which blank to use in the sentence
  };
}));

// 4. Filter out any GP where no eligible card exists yet (shouldn't happen in a well-seeded DB)
const queue = sessionItems.filter(item => item.clozeCard !== null);
```

**Key properties of this model:**
- `dueReviews` has at most one entry per grammar point — the unique constraint on `ReviewCard` guarantees this.
- The `clozeCard` chosen per session may change as the user unlocks more grammar (richer cards become eligible).
- After the review, `rc.lastClozeCardId` is updated to the card that was shown (for analytics).

### Answer Checking

When the user submits an answer during a review session:
1. The server receives `reviewCardId` (identifying which GP is being reviewed) and the user's input.
2. Look up `wordReplacement` from the `ClozeCardGrammarTarget` row for the active GP on the chosen card.
3. Compare user input against `wordReplacement`.
4. If input matches a form associated with a *related* GP (`grammarPoint.relatedPointIds`), accept the answer and return a `variantHint` to the UI.
5. Run the FSRS algorithm using the rating and update `ReviewCard.stability`, `ReviewCard.difficulty`, `ReviewCard.due`, `ReviewCard.peakStability`, and `ReviewCard.lastClozeCardId`.

---

## Migration

### Migration File

```sql
-- CreateTable lesson_examples
CREATE TABLE "lesson_examples" (
  "id"                  TEXT NOT NULL,
  "grammar_point_id"    TEXT NOT NULL,
  "full_sentence"       TEXT NOT NULL,
  "sentence_with_blank" TEXT NOT NULL,
  "answer"              TEXT NOT NULL,
  "english_hint"        JSONB NOT NULL,
  "order"               INTEGER NOT NULL DEFAULT 0,
  "notes"               TEXT,
  "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"          TIMESTAMP(3) NOT NULL,
  CONSTRAINT "lesson_examples_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "lesson_examples"
  ADD CONSTRAINT "lesson_examples_grammar_point_id_fkey"
  FOREIGN KEY ("grammar_point_id") REFERENCES "grammar_points"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable cloze_card_grammar_targets (replaces grammarPointId FK on cloze_cards)
CREATE TABLE "cloze_card_grammar_targets" (
  "id"               TEXT NOT NULL,
  "cloze_card_id"    TEXT NOT NULL,
  "grammar_point_id" TEXT NOT NULL,
  "word_replacement" TEXT NOT NULL,
  "blank_index"      INTEGER NOT NULL DEFAULT 0,
  "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cloze_card_grammar_targets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "cloze_card_grammar_targets_unique" UNIQUE ("cloze_card_id", "grammar_point_id")
);

ALTER TABLE "cloze_card_grammar_targets"
  ADD CONSTRAINT "cgt_cloze_card_fkey"
  FOREIGN KEY ("cloze_card_id") REFERENCES "cloze_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cloze_card_grammar_targets"
  ADD CONSTRAINT "cgt_grammar_point_fkey"
  FOREIGN KEY ("grammar_point_id") REFERENCES "grammar_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add denormalized position cache and related-point links to existing tables
ALTER TABLE "cloze_cards"
  ADD COLUMN "introduced_at_position" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "grammar_points"
  ADD COLUMN "related_point_ids" TEXT[] NOT NULL DEFAULT '{}';

-- Data migration: backfill cloze_card_grammar_targets from existing grammarPointId FK
-- (run as part of seed or a standalone script before dropping the old column)
INSERT INTO "cloze_card_grammar_targets" ("id", "cloze_card_id", "grammar_point_id", "word_replacement", "blank_index")
SELECT gen_random_uuid(), id, "grammar_point_id", answer, 0
FROM "cloze_cards";

-- After verifying backfill, the old FK column can be dropped in a follow-up migration:
-- ALTER TABLE "cloze_cards" DROP COLUMN "grammar_point_id";
```

```sql
-- Refactor review_cards: replace cloze_card_id FK with grammar_point_id FK
ALTER TABLE "review_cards"
  ADD COLUMN "grammar_point_id" TEXT,
  ADD COLUMN "peak_stability"   FLOAT NOT NULL DEFAULT 0,
  ADD COLUMN "last_cloze_card_id" TEXT;

-- Backfill grammar_point_id from the existing cloze_card → grammar_point chain
UPDATE "review_cards" rc
SET "grammar_point_id" = cc."grammar_point_id"
FROM "cloze_cards" cc
WHERE rc."cloze_card_id" = cc."id";

-- Make grammar_point_id non-nullable once backfilled
ALTER TABLE "review_cards"
  ALTER COLUMN "grammar_point_id" SET NOT NULL;

-- Enforce one-per-GP-per-user at DB level
ALTER TABLE "review_cards"
  ADD CONSTRAINT "review_cards_user_gp_unique" UNIQUE ("user_id", "grammar_point_id");

-- Add FK constraints
ALTER TABLE "review_cards"
  ADD CONSTRAINT "review_cards_grammar_point_fkey"
  FOREIGN KEY ("grammar_point_id") REFERENCES "grammar_points"("id") ON DELETE CASCADE;

ALTER TABLE "review_cards"
  ADD CONSTRAINT "review_cards_last_cloze_card_fkey"
  FOREIGN KEY ("last_cloze_card_id") REFERENCES "cloze_cards"("id") ON DELETE SET NULL;

-- Promote last_cloze_card_id from old cloze_card_id (for continuity)
UPDATE "review_cards"
SET "last_cloze_card_id" = "cloze_card_id"
WHERE "cloze_card_id" IS NOT NULL;

-- Drop old FK (after all application code is updated)
-- ALTER TABLE "review_cards" DROP COLUMN "cloze_card_id";
```

### Migration Strategy

1. Run Prisma migration (`bunx --bun prisma migrate dev --name add-lesson-examples-and-grammar-targets`)
2. Backfill `cloze_card_grammar_targets` from existing `cloze_cards.grammar_point_id`.
3. Backfill `review_cards.grammar_point_id` from the existing `cloze_card_id → cloze_cards.grammar_point_id` chain.
4. Apply the `UNIQUE (user_id, grammar_point_id)` constraint — this will fail if any user has two `ReviewCard` rows for the same GP (verify first; dedup by keeping the higher-stability row).
5. Keep `review_cards.cloze_card_id` column temporarily until all query sites are updated; drop in a follow-up migration.
6. Keep `cloze_cards.grammar_point_id` temporarily; drop in same follow-up migration.

---

## Code Changes Required

### Learn Page: Use `LessonExample` Instead of `ClozeCard`

**`src/routes/learn/+page.server.ts`:**
- Replace the `clozeCards` include on `GrammarPoint` with `lessonExamples`.
- Sort lesson examples by `order` field.
- The learn page displays `lessonExamples` — not `ClozeCard` records — during the instruction phase.

**`src/routes/learn/+page.svelte`:**
- Pass `lessonExamples` to `GrammarAbout` / `GrammarExamples` in place of `clozeCards`.
- Session quiz still uses `ClozeCard` records (fetched on "Add to Deck" to build the quiz).

### Review Queue: Most-Advanced-Card Selection + Variant Detection

**`src/routes/reviews/+page.server.ts`:**

```ts
// ReviewCard is keyed by (userId, grammarPointId) — one row per GP, never duplicated.
// Fetch all due ReviewCards; each represents one due grammar point.
const dueReviews = await prisma.reviewCard.findMany({
  where: { userId, due: { lte: new Date() } },
  include: { grammarPoint: { select: { id: true, relatedPointIds: true } } }
});

// Set of ALL unlocked GP IDs (a GP is unlocked when a ReviewCard row exists for it)
const unlockedGpIds = new Set(
  (await prisma.reviewCard.findMany({
    where: { userId },
    select: { grammarPointId: true }
  })).map(r => r.grammarPointId)
);

// For each due ReviewCard, pick the most-advanced eligible ClozeCard
const queue = (await Promise.all(dueReviews.map(async (rc) => {
  const targets = await prisma.clozeCardGrammarTarget.findMany({
    where: { grammarPointId: rc.grammarPointId },
    include: { clozeCard: { include: { grammarTargets: { select: { grammarPointId: true } } } } }
  });
  const eligible = targets
    .filter(t => t.clozeCard.grammarTargets.every(tt => unlockedGpIds.has(tt.grammarPointId)))
    .sort((a, b) => b.clozeCard.introducedAtPosition - a.clozeCard.introducedAtPosition);
  return eligible[0] ? { reviewCard: rc, clozeCard: eligible[0].clozeCard } : null;
}))).filter(Boolean);
```

**`src/routes/api/reviews/+server.ts`:**
- Receives `reviewCardId` (identifies the GP being reviewed) and the chosen `clozeCardId` from the session.
- Looks up `wordReplacement` from `ClozeCardGrammarTarget` where `clozeCardId` + `grammarPointId = reviewCard.grammarPointId`.
- If user input matches a related GP form, return `variantHint`.
- Updates `ReviewCard`: runs FSRS, writes new `stability`, `difficulty`, `due`, increments `lapses`; sets `peakStability = max(current, new)`; sets `lastClozeCardId` to the card that was shown.

### `GrammarAbout` / `GrammarExamples` Components

- Update prop types to accept `LessonExample[]` instead of `ClozeCard[]`.
- Lesson examples show the full sentence and the blank but do not expose FSRS data.

---

## Mastery Level & Cloze Eligibility

### Definition

FSRS tracks a continuous `stability` (days until 90% recall). For display and gating purposes, stability is mapped to a **discrete SRS level 1–10** (see `fsrsToDisplayLevel()` in 11d.7). **Level 10 = Mastered**, reached at stability ≥ 250 days (~8 months of good retention).

### Mastery Effect on Review Queue

Because `ReviewCard` is 1:1 with a grammar point, mastery retirement is clean — there is **one** record to check:

When a grammar point's `ReviewCard.peakStability` maps to display level 10:

- That single `ReviewCard` is **no longer included in `dueReviews`** — filtered out during queue build (`peakStability < masteryThreshold`).
- `ClozeCardGrammarTarget` rows for that GP are **excluded from the active blank pool** — the word still appears in sentences but is pre-filled, never blanked.
- The grammar point can still appear in sentences that target *other*, non-mastered GPs.

```ts
const MASTERY_STABILITY = 250; // days

// During queue build: skip mastered GPs entirely
const dueReviews = await prisma.reviewCard.findMany({
  where: {
    userId,
    due: { lte: new Date() },
    peakStability: { lt: MASTERY_STABILITY }   // ← mastered GPs excluded
  },
  include: { grammarPoint: true }
});

// During card selection: skip mastered GP targets within a chosen card
// (so mastered morphemes appear pre-filled, not blanked)
const activeTargets = chosenCard.grammarTargets.filter(t =>
  fsrsToDisplayLevel(t.grammarPoint.peakStability) < 10
);
```

`peakStability` is part of the refactored `ReviewCard` schema above — no additional schema change required beyond what is already specified in section 3.

### Display

Mastered grammar points display as **level 10** with gold colouring in the GP row list (see 11d.7). They remain visible in deck/grammar pages as a record of mastery but are clearly marked as graduated.

---

## What Changes vs. What Does Not

### Changes (breaking)
- **`ReviewCard`** — gains `grammarPointId` FK (new primary relation); adds `peakStability`, `lastClozeCardId`; unique constraint on `(userId, grammarPointId)`. The old `clozeCardId` FK is retained temporarily then dropped. This is the most impactful change.
- **`ClozeCard`** — loses its single `grammarPointId` FK (replaced by `ClozeCardGrammarTarget` join table); gains `introducedAtPosition`.
- **`GrammarPoint`** — gains `relatedPointIds`.
- **Review queue logic** — completely rewritten to iterate `ReviewCard` (one per GP) and select the best `ClozeCard` dynamically.

### Does NOT Change
- The FSRS algorithm itself (`ts-fsrs` library calls) — unchanged; only what's passed in/out changes.
- The `ReviewLog` model — unchanged.
- The `UserDeckProgress.lastLearnedIndex` mechanism — unchanged.
- Existing `ClozeCard` data — backfilled into `cloze_card_grammar_targets`; no data loss.
- The `UserStreak`, `Deck`, `DeckGrammarPoint` models — unchanged.

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Add `LessonExample`, `ClozeCardGrammarTarget` models; refactor `ReviewCard` (grammarPointId FK, unique constraint, peakStability, lastClozeCardId); add `introducedAtPosition` to `ClozeCard`; add `relatedPointIds` to `GrammarPoint` |
| `prisma/migrations/<ts>_add_lesson_examples_and_grammar_targets/migration.sql` | Auto-generated + manual data backfill |
| `prisma/seed.ts` | Backfill targets; update seeding helpers to populate `grammarTargets` array per card |
| `src/routes/learn/+page.server.ts` | Include `lessonExamples` instead of `clozeCards` |
| `src/routes/learn/+page.svelte` | Render `lessonExamples` in learn phase |
| `src/routes/reviews/+page.server.ts` | Most-advanced-card selection; mastery gating (skip level-10 targets) |
| `src/routes/api/reviews/+server.ts` | Answer check against `wordReplacement`; variant hint detection; update `peakStability` |
| `src/lib/components/GrammarAbout.svelte` | Accept `LessonExample[]` prop |
| `src/lib/components/GrammarExamples.svelte` | Accept `LessonExample[]` prop |
| `src/generated/prisma/` | Regenerated — no manual changes |

---

## Authoring Rules for Content Phases (11b, 11c)

When seeding a `ClozeCard`:

1. List **all** grammar points the sentence tests in `grammarTargets`.
2. Set `wordReplacement` to the exact surface form that becomes the blank for each target GP.
3. Compute `introducedAtPosition` = max curriculum position across all targets — this determines when the card enters the review queue.
4. The card may appear in the review queue for **any** of its grammar point targets once all targets are unlocked.
5. Link grammar point variants via `relatedPointIds` (bidirectional — update both sides).

---

## Implementation Strategy: Transitional Approach

### Key Decision: Keep Old Columns During Transition

The plan specifies dropping `ClozeCard.grammarPointId` and `ReviewCard.clozeCardId`. However, to minimize breakage during this phase, we:

1. **Keep `ClozeCard.grammarPointId`** — mark as `@deprecated` but don't drop. Existing code that reads `clozeCards` on a GrammarPoint still works. The new `ClozeCardGrammarTarget` join table is the canonical source, but the old FK is maintained for backward compat during transition.

2. **Replace `ReviewCard.clozeCardId` with `ReviewCard.grammarPointId`** — this is the core invariant change. The unique constraint changes from `(userId, clozeCardId)` to `(userId, grammarPointId)`. The `lastClozeCardId` field replaces the old `clozeCardId` semantically.

3. **Retain `ReviewCard.reps`, `ReviewCard.lastReview`, `ReviewCard.streakCorrect`, `ReviewCard.masteredAt`** — the planning doc's refactored ReviewCard drops `reps`, `lastReview`, `streakCorrect`, and `masteredAt` in favor of `peakStability`. Since all app code currently uses `streakCorrect`/`masteredAt` for mastery tracking, we keep these fields and **add** `peakStability` alongside them. A future phase can migrate to pure stability-based mastery.

### Implementation Order

1. Update `schema.prisma` with new/modified models
2. Generate and run migration
3. Update `seed.ts` to populate new tables
4. Update all 17 affected source files
5. Regenerate Prisma client
6. Verify full app builds and all queries work

---

## Comprehensive Test Plan

### Pre-Implementation Checks
- [ ] Current `prisma db push` or `migrate dev` runs without errors
- [ ] Current seed runs without errors
- [ ] App builds (`bun run build`) without TypeScript errors

### Schema Tests
- [ ] Migration creates `lesson_examples` table
- [ ] Migration creates `cloze_card_grammar_targets` table
- [ ] `ClozeCard.introducedAtPosition` column exists with default 0
- [ ] `GrammarPoint.relatedPointIds` column exists with default `{}`
- [ ] `ReviewCard` has `grammarPointId` FK (non-nullable)
- [ ] `ReviewCard` has `peakStability` column (default 0)
- [ ] `ReviewCard` has `lastClozeCardId` nullable FK to `ClozeCard`
- [ ] `ReviewCard` unique constraint on `(userId, grammarPointId)` enforced
- [ ] `ClozeCardGrammarTarget` unique constraint on `(clozeCardId, grammarPointId)` enforced
- [ ] `LessonExample` FK to `GrammarPoint` cascades on delete

### Seed Tests
- [ ] Seed runs without errors on fresh database (`prisma migrate reset`)
- [ ] All 11 grammar points created
- [ ] Each grammar point has cloze cards created
- [ ] Each cloze card has `ClozeCardGrammarTarget` entries
- [ ] Each grammar point has `LessonExample` entries
- [ ] `ReviewCard` entries created with `grammarPointId` (not `clozeCardId`)
- [ ] `ReviewCard` unique constraint `(userId, grammarPointId)` — verify only one RC per GP per user
- [ ] Deck grammar points linked correctly

### API Route Tests (Critical — these handle FSRS state)

#### `POST /api/reviews` — FSRS review submission
- [ ] Fetches ReviewCard by ID (no change in lookup)
- [ ] FSRS scheduling still works (Card object construction uses same fields)
- [ ] `lastClozeCardId` is set from the request body (new)
- [ ] ReviewLog creation still works (uses `reviewCardId`)
- [ ] Streak tracking unchanged

#### `POST /api/reviews/check` — Answer verification
- [ ] ReviewCard lookup works with new schema
- [ ] Answer checking uses `ClozeCardGrammarTarget.wordReplacement` for the active GP
- [ ] Falls back to `ClozeCard.answer` + `alternateAnswers` during transition
- [ ] Ownership check still works

#### `POST/DELETE /api/reviews/master` — Manual mastery
- [ ] ReviewCard lookup/update unchanged (uses card ID)
- [ ] `masteredAt`/`streakCorrect` fields still present

#### `POST /api/grammar/[id]/learn` — Mark grammar as learned
- [ ] Creates ONE ReviewCard per grammar point (not per cloze card)
- [ ] Uses `userId_grammarPointId` unique constraint for dedup
- [ ] Deck progress update unchanged

#### `POST /api/learn/complete` — Learn session completion
- [ ] Creates ONE ReviewCard per grammar point (not per cloze card)
- [ ] Uses `userId_grammarPointId` unique constraint for dedup
- [ ] Deck progress update unchanged

### Page Loader Tests

#### `reviews/+page.server.ts` — Review queue
- [ ] Queue builds from `ReviewCard` → `grammarPoint` (not via clozeCard)
- [ ] Selects ClozeCard dynamically for each due ReviewCard
- [ ] Queue items include all fields needed by the Svelte page
- [ ] Deck-scoped filtering works via GP → decks relation
- [ ] Empty-state next review time still works

#### `dashboard/+page.server.ts` — Dashboard (heaviest consumer)
- [ ] `reviewCardsForSrs` query uses `grammarPointId` directly (not via clozeCard)
- [ ] Per-deck filtering still works
- [ ] SRS distribution still works
- [ ] Mastered count per deck still works
- [ ] Due-card-per-deck bucketing still works
- [ ] TOPIK progress still works

#### `grammar/+page.server.ts` — Grammar library
- [ ] Grammar points load with `clozeCards` (or `grammarTargets`)
- [ ] Mastery map built from `ReviewCard.grammarPointId` directly
- [ ] Card count per GP still displayed

#### `grammar/[id]/+page.server.ts` — Grammar detail
- [ ] Grammar point loads with cloze cards
- [ ] `isLearned` check uses `ReviewCard` where `grammarPointId = params.id`
- [ ] Lesson context navigation unchanged

#### `learn/+page.server.ts` — Learn session
- [ ] Loads grammar points with `clozeCards` for quiz building
- [ ] Data shape passed to page unchanged

#### `decks/+page.server.ts` — Deck listing
- [ ] Mastery stats use `ReviewCard.grammarPointId` directly
- [ ] Grammar count per deck unchanged

#### `decks/[slug]/+page.server.ts` — Deck detail
- [ ] Per-GP mastery uses `ReviewCard.grammarPointId` directly
- [ ] Status (learned/current/locked) logic unchanged
- [ ] Card count per GP still available

#### `+layout.server.ts` — Global nav
- [ ] Reviews due count works with `ReviewCard` (no clozeCard filter needed)
- [ ] Learnable count unchanged

### Component Tests
- [ ] `GrammarAbout.svelte` — renders with `clozeCards` prop (shape unchanged)
- [ ] `GrammarExamples.svelte` — renders with `clozeCards` prop (shape unchanged)
- [ ] `GrammarActions.svelte` — `grammarPointId` prop unchanged
- [ ] `reviews/+page.svelte` — queue item shape compatible
- [ ] `learn/+page.svelte` — grammar points with clozeCards shape compatible

### Build Verification
- [ ] `bunx --bun prisma generate` — no errors
- [ ] `bun run build` — no TypeScript errors
- [ ] `bun run check` — Svelte check passes
- [ ] App starts and landing page loads
- [ ] Dashboard loads for authenticated user
- [ ] Grammar library loads
- [ ] Deck listing loads
- [ ] Review queue loads (may be empty)
