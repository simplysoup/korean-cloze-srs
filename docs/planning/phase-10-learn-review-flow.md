# Phase 10 — Learn Flow & Review Integration

> **Status:** 📋 Planned
> **Depends on:** Phase 9 (Grammar Learning Pages)

## Goals

Connect grammar learning pages into a sequential lesson flow. Users enroll in a deck, learn new grammar points in batched lessons, and then review them via the existing cloze review system. The dashboard's Learn/Review cards become functional entry points into this flow.

---

## 10.1 Learn Route

**Route:** `/learn`

**Query params:**
- `deck_id` (required) — which deck to study from
- `lesson` (optional) — specific lesson number to resume

**Behaviour:**
1. Fetch the user's `UserDeckProgress` for the deck
2. Determine the next lesson to study:
   - `lastLearnedIndex` tells us where the user left off
   - Next lesson = the `lessonNumber` of the grammar point at `sortOrder = lastLearnedIndex + 1`
3. Fetch all grammar points in that lesson (same `lessonNumber`)
4. Render the first unlearned grammar point's learning page (grammar page from Phase 9)
5. Navigation footer provides Previous/Next through the lesson's grammar points
6. On "Next" past the last grammar point in the lesson → complete the lesson

**Server load (`/learn/+page.server.ts`):**

```ts
export const load = async ({ url, locals }) => {
  const deckId = url.searchParams.get('deck_id');
  if (!deckId) throw redirect(303, '/dashboard');
  if (!locals.user) throw redirect(303, '/login');

  const userId = locals.user.id;

  // Get or create deck progress
  let progress = await prisma.userDeckProgress.findUnique({
    where: { userId_deckId: { userId, deckId } }
  });

  if (!progress) {
    // Auto-enroll on first learn
    progress = await prisma.userDeckProgress.create({
      data: { userId, deckId, lastLearnedIndex: -1 }
    });
  }

  // Find the next grammar point to learn
  const nextIndex = progress.lastLearnedIndex + 1;
  const nextDeckGP = await prisma.deckGrammarPoint.findFirst({
    where: { deckId, sortOrder: { gte: nextIndex } },
    orderBy: { sortOrder: 'asc' },
    include: { grammarPoint: true }
  });

  if (!nextDeckGP) {
    // Deck complete!
    return { deckComplete: true, deckId };
  }

  // Get all grammar points in the same lesson
  const lessonGrammar = await prisma.deckGrammarPoint.findMany({
    where: { deckId, lessonNumber: nextDeckGP.lessonNumber },
    include: {
      grammarPoint: {
        include: { clozeCards: { orderBy: { createdAt: 'asc' } } }
      }
    },
    orderBy: { sortOrder: 'asc' }
  });

  // Determine which ones are already learned
  const learnedGPIds = new Set(
    (await prisma.reviewCard.findMany({
      where: { userId, clozeCard: { grammarPointId: { in: lessonGrammar.map(lg => lg.grammarPointId) } } },
      select: { clozeCard: { select: { grammarPointId: true } } },
      distinct: ['clozeCardId']
    })).map(r => r.clozeCard.grammarPointId)
  );

  return {
    deckId,
    deckComplete: false,
    lessonNumber: nextDeckGP.lessonNumber,
    grammarPoints: lessonGrammar.map(lg => ({
      ...lg.grammarPoint,
      sortOrder: lg.sortOrder,
      isLearned: learnedGPIds.has(lg.grammarPointId)
    })),
    currentIndex: 0 // start from first unlearned in the lesson
  };
};
```

---

## 10.2 Lesson Flow UI

**Component:** `/learn/+page.svelte`

The learn page acts as a wrapper that renders grammar point content (reusing components from Phase 9) with lesson-specific navigation.

**State:**
```ts
let { data } = $props();
let currentIndex = $state(0);
let currentGP = $derived(data.grammarPoints[currentIndex]);
```

**Grammar point content:** Rendered inline (not as an iframe or separate route). Uses the same components:
- `GrammarHero` — with lesson context breadcrumb
- `GrammarTabs` — Details / Examples
- `StructureCard`, `MetadataCard`, `GrammarAbout`, `GrammarExamples`

**Navigation:**
- `LessonNav` footer with Previous/Next and progress pellets
- "Next" on the last grammar point in the lesson → "Complete Lesson" button
- "Complete Lesson" calls `POST /api/learn/complete`

---

## 10.3 Learn Completion API

**Route:** `POST /api/learn/complete`

**Request body:**
```ts
{
  deckId: string;
  grammarPointId: string;  // the grammar point just completed
}
```

**Behaviour:**
1. Auth required
2. Verify the grammar point belongs to the deck
3. Find the `DeckGrammarPoint.sortOrder` for this grammar point in this deck
4. Create `ReviewCard` entries for all of this grammar point's cloze cards (state=New, due=now)
   - Upsert to avoid duplicates if user re-visits
5. Update `UserDeckProgress.lastLearnedIndex` to `max(current, thisGP.sortOrder)`
6. Update `UserDeckProgress.lastStudiedAt` to now
7. Return `{ success: true, reviewCardsCreated: number }`

**Endpoint:** `src/routes/api/learn/complete/+server.ts`

---

## 10.4 Lesson Completion Screen

After the user clicks "Complete Lesson" and the API succeeds:

```
┌──────────────────────────────────────────┐
│                                          │
│           Lesson 1 Complete! 🎉         │
│                                          │
│     You learned 3 new grammar points:    │
│     • 은/는 — Topic Particle             │
│     • 이/가 — Subject Particle           │
│     • 을/를 — Object Particle            │
│                                          │
│     9 new review cards have been added   │
│     to your review queue.                │
│                                          │
│  [Review Now (9 due)]  [Back to Deck]    │
│                                          │
└──────────────────────────────────────────┘
```

- "Review Now" → `/reviews?deck_id=[id]` (filtered to this deck)
- "Back to Deck" → `/decks/[slug]`

---

## 10.5 Deck-Scoped Reviews

**Route modification:** `/reviews/+page.server.ts`

Accept optional `deck_id` query parameter to filter the review queue:

```ts
const deckId = url.searchParams.get('deck_id');

const whereClause = {
  userId,
  due: { lte: new Date() },
  ...(deckId ? {
    clozeCard: {
      grammarPoint: {
        decks: { some: { deckId } }
      }
    }
  } : {})
};

const queue = await prisma.reviewCard.findMany({
  where: whereClause,
  orderBy: { due: 'asc' },
  take: 10,
  include: { clozeCard: { include: { grammarPoint: true } } }
});
```

**UI changes to `/reviews/+page.svelte`:**
- Show deck context header when `deck_id` is present: "Reviewing: TOPIK Level 1 Grammar"
- After queue is empty, show: "All caught up for this deck!" with link back to deck page
- "Review All" mode (no `deck_id`) continues to work as before

---

## 10.6 Dashboard Integration

### Learn Card Updates

The learn card on the dashboard now shows actionable information:

**If user has an enrolled deck with unlearned grammar:**
```
Learn
TOPIK Level 1 Grammar
Lesson 2: 3 new grammar points
[Start Lesson]
```

**If all grammar in deck is learned:**
```
Learn
All caught up! 🎉
You've completed all grammar in TOPIK Level 1 Grammar.
[Add a new Deck] (disabled — only 1 deck for now)
```

**Click action:** `href="/learn?deck_id=[id]"`

### Review Card Updates

**Shows total due count** across all decks (or single deck count if only one enrolled):
```
Review
3 reviews due
[Start Reviews]
```

**Click action:** `href="/reviews"` (or `/reviews?deck_id=[id]` if single deck)

---

## 10.7 Review → Grammar Link

In `/reviews/+page.svelte`, after the user answers a card (correct or incorrect) and the info panel is shown:

**Add "View Grammar" button:**
```svelte
{#if revealState === 'revealed'}
  <a
    href="/grammar/{currentCard.grammarPointId}"
    class="btn btn--secondary btn--sm"
    target="_blank"
    rel="noopener"
  >
    View Grammar →
  </a>
{/if}
```

Opens in a new tab so the review session is not interrupted.

---

## 10.8 Auto-Enroll Logic

When a user first clicks "Start Learning" on an unenrolled deck:
1. The `/learn` route detects no `UserDeckProgress` record
2. Automatically creates one with `lastLearnedIndex: -1`
3. Proceeds to the first lesson
4. No separate enrollment step needed — reduces friction

The enrollment API (`POST /api/decks/[deckId]/enroll` from Phase 7) remains for explicit enrollment from the deck detail page.

---

## 10.9 Learn Queue Settings (Future)

**Not implemented in this phase, but designed for:**
- Number of grammar points per lesson (default: 3)
- Auto-review after lesson completion (toggle)
- Lesson ordering preference (sequential / random)

These would be stored as user preferences (new `UserSettings` model or JSON column on `User`).

---

## 10.10 Files to Create

| File | Purpose |
|------|---------|
| `src/routes/learn/+page.svelte` | Lesson flow wrapper page |
| `src/routes/learn/+page.server.ts` | Lesson data loader |
| `src/routes/api/learn/complete/+server.ts` | Lesson completion API |

## 10.11 Files to Modify

| File | Change |
|------|--------|
| `src/routes/reviews/+page.server.ts` | Accept `deck_id` query param for scoped reviews |
| `src/routes/reviews/+page.svelte` | Show deck context header, deck-scoped empty state |
| `src/routes/dashboard/+page.svelte` | Wire Learn/Review cards to lesson + review routes |
| `src/routes/dashboard/+page.server.ts` | Compute next lesson info for Learn card |
| `src/hooks.server.ts` | Add `/learn` and `/grammar` to authenticated routes (already handled by default auth gate) |

---

## Dependencies

- Phase 7 deck system (Deck, DeckGrammarPoint, UserDeckProgress models)
- Phase 9 grammar learning page components (reused in learn flow)
