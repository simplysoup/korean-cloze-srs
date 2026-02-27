# Phase 7 — Deck System & Schema

> **Status:** 📋 Planned
> **Depends on:** Phase 6 (Hardening) ✅

## Goals

Introduce a Deck model that organises grammar points into TOPIK-levelled study paths. The first (and currently only) deck is **TOPIK Level 1 Grammar**. Restructure the app around deck-based navigation so users enroll in a deck and study its grammar points in a defined order.

---

## 7.1 Schema Changes

### New Models

#### `Deck`

```prisma
model Deck {
  id          String   @id @default(cuid())
  title       String   @unique          // "TOPIK Level 1 Grammar"
  slug        String   @unique          // "topik-1-grammar"
  description String                    // "Essential Korean grammar for TOPIK Level 1..."
  level       Int      @default(1)      // TOPIK level (1–6)
  icon        String?                   // emoji or icon identifier
  isPublished Boolean  @default(true)   @map("is_published")
  sortOrder   Int      @default(0)      @map("sort_order")  // global deck ordering
  createdAt   DateTime @default(now())  @map("created_at")
  updatedAt   DateTime @updatedAt       @map("updated_at")

  grammarPoints DeckGrammarPoint[]
  userProgress  UserDeckProgress[]

  @@map("decks")
}
```

#### `DeckGrammarPoint` (join table with ordering)

```prisma
model DeckGrammarPoint {
  id             String @id @default(cuid())
  deckId         String @map("deck_id")
  grammarPointId String @map("grammar_point_id")
  sortOrder      Int    @map("sort_order")        // position within the deck (0-indexed)
  lessonNumber   Int    @map("lesson_number")      // which lesson batch this belongs to (1-based)

  deck         Deck         @relation(fields: [deckId], references: [id], onDelete: Cascade)
  grammarPoint GrammarPoint @relation(fields: [grammarPointId], references: [id], onDelete: Cascade)

  @@unique([deckId, grammarPointId])
  @@unique([deckId, sortOrder])
  @@map("deck_grammar_points")
}
```

#### `UserDeckProgress`

```prisma
model UserDeckProgress {
  id            String   @id @default(cuid())
  userId        String   @map("user_id")
  deckId        String   @map("deck_id")
  enrolledAt    DateTime @default(now()) @map("enrolled_at")
  lastStudiedAt DateTime? @map("last_studied_at")
  /// Index of the last grammar point the user completed learning (0-indexed).
  /// -1 means enrolled but hasn't started learning yet.
  lastLearnedIndex Int   @default(-1) @map("last_learned_index")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  deck Deck @relation(fields: [deckId], references: [id], onDelete: Cascade)

  @@unique([userId, deckId])
  @@map("user_deck_progress")
}
```

### Modified Models

#### `GrammarPoint` — add relation

```prisma
model GrammarPoint {
  // ... existing fields unchanged ...
  decks DeckGrammarPoint[]  // NEW: many-to-many via join table
}
```

#### `User` — add relations

```prisma
model User {
  // ... existing fields unchanged ...
  deckProgress UserDeckProgress[]  // NEW
}
```

### Migration

```bash
bunx --bun prisma migrate dev --name add-deck-system
```

---

## 7.2 Seed Data — TOPIK Level 1 Grammar Deck

The deck will contain the existing 11 grammar points plus additional beginner grammar to form a complete TOPIK 1 grammar curriculum. All 11 existing grammar points are particles (Part 3) and fit TOPIK Level 1.

**Deck:**
```ts
{
  id: 'deck_topik1_grammar',
  title: 'TOPIK Level 1 Grammar',
  slug: 'topik-1-grammar',
  description: 'Essential Korean grammar patterns for TOPIK Level 1. Covers basic particles, verb endings, and sentence connectors.',
  level: 1,
  icon: '📘',
  isPublished: true,
  sortOrder: 0
}
```

**Grammar Point Order (initial — particles only from existing seed):**

| sortOrder | lessonNumber | Grammar Point | ID |
|-----------|-------------|---------------|-----|
| 0 | 1 | 은/는 — Topic Particle | gp_topic |
| 1 | 1 | 이/가 — Subject Particle | gp_subject |
| 2 | 1 | 을/를 — Object Particle | gp_object |
| 3 | 2 | 에 — Time/Place Particle | gp_location |
| 4 | 2 | 에서 — Activity Location | gp_activity_loc |
| 5 | 2 | 에서~까지 — From~To (place) | gp_from_to_place |
| 6 | 3 | 부터~까지 — From~To (time) | gp_from_to_time |
| 7 | 3 | 도 — Also/Too | gp_also |
| 8 | 3 | 만 — Only/Just | gp_only |
| 9 | 4 | 하고/와/과 — And (connecting nouns) | gp_and_nouns |
| 10 | 4 | (이)랑 — And/With (casual) | gp_and_casual |

Lesson batches of 3 grammar points each (configurable). Each lesson is a self-contained set of grammar points the user studies before reviewing.

---

## 7.3 Deck Detail Page

**Route:** `/decks/[slug]`

**Layout:**
```
┌─────────────────────────────────────────────┐
│  TOPIK Level 1 Grammar         📘           │
│  Essential Korean grammar patterns...        │
│                                              │
│  Progress: ████████░░░░░░░░  5/11 learned   │
│  [Continue Learning]  [Review (3 due)]       │
├─────────────────────────────────────────────┤
│                                              │
│  Lesson 1: Basic Particles                   │
│  ┌──────────────────────────────────────┐   │
│  │ 1. 은/는 — Topic Particle    ✅ Learned│   │
│  │ 2. 이/가 — Subject Particle  ✅ Learned│   │
│  │ 3. 을/를 — Object Particle   ✅ Learned│   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Lesson 2: Location & Direction              │
│  ┌──────────────────────────────────────┐   │
│  │ 4. 에 — Time/Place           ✅ Learned│   │
│  │ 5. 에서 — Activity Location  ✅ Learned│   │
│  │ 6. 에서~까지 — From~To      🔒 Locked │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  Lesson 3: Inclusion & Limitation            │
│  ┌──────────────────────────────────────┐   │
│  │ 7. 부터~까지 — From~To      🔒 Locked │   │
│  │ 8. 도 — Also/Too            🔒 Locked │   │
│  │ 9. 만 — Only/Just           🔒 Locked │   │
│  └──────────────────────────────────────┘   │
│                                              │
└─────────────────────────────────────────────┘
```

**Server load (`/decks/[slug]/+page.server.ts`):**
- Fetch deck by slug with all `DeckGrammarPoint` records (ordered by `sortOrder`), each including the `GrammarPoint`
- If user is authenticated, fetch `UserDeckProgress` for this deck
- For each grammar point, compute: learned (has ReviewCards for its cloze cards), review count due
- Return full deck structure with per-grammar-point status

**Component (`/decks/[slug]/+page.svelte`):**
- Deck header: title, description, icon, overall progress bar
- Action buttons: "Continue Learning" (links to `/learn?deck_id=[id]`), "Review" (links to `/reviews?deck_id=[id]`)
- Grammar list grouped by `lessonNumber`
- Each grammar point row: sort index, title, hint, status icon (✅ learned, 📖 current, 🔒 locked)
- Clicking a learned grammar point links to `/grammar/[id]`

---

## 7.4 Deck Enrollment API

**Route:** `POST /api/decks/[deckId]/enroll`

**Behaviour:**
- Auth required (401 if not authenticated)
- Check deck exists and is published (404 if not)
- Upsert `UserDeckProgress` — if already enrolled, no-op
- Return `{ enrolled: true, deckId }`

---

## 7.5 Home Page Changes

The current home page (`/+page.svelte`) shows a flat grammar list with search. Transform it to show:

1. **If not authenticated:** Marketing/info page with Login CTA (unchanged)
2. **If authenticated but no decks enrolled:** "Get Started" card showing available decks with "Start Learning" button
3. **If authenticated with enrolled decks:** Redirect to dashboard (`/dashboard`) — prepared for Phase 8

For Phase 7, the authenticated home page will be a simple deck list:
```
┌─────────────────────────────────────────┐
│  Your Decks                             │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 📘 TOPIK Level 1 Grammar         │  │
│  │ 5/11 learned · 3 reviews due     │  │
│  │ [Continue]                        │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Available Decks                        │
│  ┌───────────────────────────────────┐  │
│  │ 📘 TOPIK Level 1 Grammar         │  │
│  │ 11 grammar points · Beginner     │  │
│  │ [Start Learning]                  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 7.6 Layout Updates

**`+layout.server.ts`** additions:
- Fetch user's enrolled decks with computed stats (grammar learned, reviews due per deck)
- Pass to layout for header navigation badges

**Header nav** updates:
- "Learn" badge shows count of learnable grammar points across all enrolled decks
- "Review" badge shows total reviews due (unchanged)
- "Content" dropdown lists enrolled decks with quick links

---

## 7.7 Files to Create

| File | Purpose |
|------|---------|
| `prisma/migrations/YYYYMMDD_add_deck_system/migration.sql` | Auto-generated migration |
| `src/routes/decks/[slug]/+page.svelte` | Deck detail page |
| `src/routes/decks/[slug]/+page.server.ts` | Deck detail data loader |
| `src/routes/api/decks/[deckId]/enroll/+server.ts` | Deck enrollment endpoint |

## 7.8 Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add Deck, DeckGrammarPoint, UserDeckProgress models; modify GrammarPoint, User |
| `prisma/seed.ts` | Add TOPIK 1 deck, DeckGrammarPoint entries, UserDeckProgress for test user |
| `src/routes/+page.svelte` | Replace grammar list with deck cards |
| `src/routes/+page.server.ts` | Fetch decks instead of flat grammar list |
| `src/routes/+layout.server.ts` | Add deck progress data to layout |
| `src/routes/+layout.svelte` | Update header badges with deck-aware counts |

---

## Dependencies

- None beyond existing stack (Prisma migration + seed)
