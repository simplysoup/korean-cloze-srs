# Phase 9 — Grammar Learning Pages

> **Status:** 📋 Planned
> **Depends on:** Phase 7 (Deck System), Phase 8 (Dashboard)

## Goals

Create per-grammar-point learning pages inspired by Bunpro's Learn page. Each grammar point gets its own rich page with a Details tab (structure, metadata, explanation with embedded examples) and an Examples tab (all cloze cards displayed as example sentences). These pages render when a user is studying new grammar during lessons and are accessible for reference from reviews.

---

## 9.1 Route Structure

**Route:** `/grammar/[id]`

- `id` is the grammar point's CUID (e.g. `gp_topic`)
- Accessible directly via URL or through lesson navigation / review link
- Query params: `?deck_id=[id]&lesson=[n]&position=[n]` (optional, for lesson context)

---

## 9.2 Page Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  ← Dashboard    TOPIK Level 1 Grammar · Lesson 1: 2/3              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                          은/는                                       │
│                    Topic Particle                                    │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│  [Details]  [Examples]                                               │
├─────────────────────────────────────────────┬────────────────────────┤
│                                             │                        │
│  ┌─ Structure ─────────────────────────┐   │  Actions (sidebar)     │
│  │                                      │   │  ┌──────────────────┐  │
│  │  Noun + 은/는                        │   │  │ Mark as Learned  │  │
│  │  (은 after consonant, 는 after vowel)│   │  │ Add Note         │  │
│  └──────────────────────────────────────┘   │  └──────────────────┘  │
│                                             │                        │
│  ┌─ Details ───────────────────────────┐   │                        │
│  │  Category: Particle                  │   │                        │
│  │  Level: TOPIK 1                      │   │                        │
│  │  Tags: particle, beginner            │   │                        │
│  └──────────────────────────────────────┘   │                        │
│                                             │                        │
│  ┌─ About 은/는 ──────────────────────┐   │                        │
│  │                                      │   │                        │
│  │  Attaches directly after a noun to   │   │                        │
│  │  mark it as the sentence topic...    │   │                        │
│  │                                      │   │                        │
│  │  ┌─ Example ──────────────────────┐ │   │                        │
│  │  │ 저[는] 한국어를 공부해요.       │ │   │                        │
│  │  │ I study Korean.                 │ │   │                        │
│  │  └────────────────────────────────┘ │   │                        │
│  │                                      │   │                        │
│  │  ┌─ Example ──────────────────────┐ │   │                        │
│  │  │ 서울[은] 한국의 수도예요.       │ │   │                        │
│  │  │ Seoul is the capital of Korea.  │ │   │                        │
│  │  └────────────────────────────────┘ │   │                        │
│  │                                      │   │                        │
│  │  💡 Fun Fact                         │   │                        │
│  │  The topic particle sets contrast... │   │                        │
│  └──────────────────────────────────────┘   │                        │
│                                             │                        │
├─────────────────────────────────────────────┴────────────────────────┤
│  [← Previous]    ● ● ◉ ○ ○                        [Next →]         │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 9.3 Schema Changes

### GrammarPoint Additions

```prisma
model GrammarPoint {
  // ... existing fields ...

  /// Grammar pattern formula shown in Structure card.
  /// e.g. "Noun + 은/는" or "Verb[stem] + 아/어요"
  structurePattern String?  @map("structure_pattern")

  /// JSON array of note sections displayed after the description.
  /// Shape: [{ type: 'caution' | 'funfact' | 'tip', title: string, content: string }]
  notes Json?
}
```

**Migration:**
```bash
bunx --bun prisma migrate dev --name add-grammar-structure-notes
```

---

## 9.4 Hero Header Component

**Component:** `src/lib/components/GrammarHero.svelte`

**Props:**
```ts
interface GrammarHeroProps {
  title: string;           // "은/는 — Topic Particle"
  hint: string;            // "topic particle"
  vocabBaseForm?: string;  // "은/는" (from first cloze card)
  deckContext?: {
    deckTitle: string;     // "TOPIK Level 1 Grammar"
    lessonNumber: number;  // 1
    positionInLesson: number; // 2
    totalInLesson: number;    // 3
  };
}
```

**Rendering:**
- Gradient background (uses `--srs-new` or accent gradient)
- Back link → Dashboard or deck page
- Breadcrumb: "TOPIK Level 1 Grammar · Lesson 1: 2/3"
- Large title: grammar point `title` (Hangul + English)
- Below: `hint` in smaller accent-coloured text

---

## 9.5 Tab Navigation

Two tabs: **Details** and **Examples**

**Component:** `src/lib/components/GrammarTabs.svelte`

- Uses `$state` to track active tab
- ARIA attributes: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`
- Selected tab: bold text, accent underline, filled background
- Unselected tab: muted text, transparent border

---

## 9.6 Details Tab Content

### Structure Card

**Component:** `src/lib/components/StructureCard.svelte`

Displays the grammar pattern formula from `grammarPoint.structurePattern`:
- Card with border + secondary background
- "Structure" heading
- Formula text rendered with the grammar point's key part bolded
- Falls back to `vocabBaseForm` if `structurePattern` is null

### Metadata Card

**Component:** `src/lib/components/MetadataCard.svelte`

Grid of metadata fields:
- **Category:** particle / verb ending / conjunction / etc.
- **Register:** standard / polite / formal / informal (if set)
- **Tense:** present / past / future (if set)
- **Level:** TOPIK 1
- **Tags:** rendered as pill badges

### About Section

**Component:** `src/lib/components/GrammarAbout.svelte`

- "About [title]" heading
- Renders `grammarPoint.description` as rich text (paragraphs)
- Embedded example sentences from the grammar point's cloze cards:
  - Korean sentence with cloze answer highlighted in accent colour
  - English translation below (using `englishHint` parts, concatenated)
  - Card-style container with subtle background
- Notes sections after description:
  - Rendered from `grammarPoint.notes` JSON array
  - Each note: coloured left border + icon based on type
    - `caution` — orange border, ⚠️
    - `funfact` — blue border, 💡
    - `tip` — green border, 💬

---

## 9.7 Examples Tab Content

**Component:** `src/lib/components/GrammarExamples.svelte`

Lists all cloze cards belonging to this grammar point:

```
┌────────────────────────────────────────────────────────────┐
│  1. 저[는] 한국어를 공부해요.                               │
│     I study Korean.                                         │
│                                                             │
│     Base form: 은/는                                        │
│     Answer: 는                                              │
├────────────────────────────────────────────────────────────┤
│  2. 서울[은] 한국의 수도예요.                               │
│     Seoul is the capital of Korea.                          │
│                                                             │
│     Base form: 은/는                                        │
│     Answer: 은                                              │
├────────────────────────────────────────────────────────────┤
│  3. 이것[은] 제 가방이에요.                                 │
│     This is my bag.                                         │
└────────────────────────────────────────────────────────────┘
```

Each example card:
- Full Korean sentence with the answer portion highlighted (`text-primary-accent` / accent colour)
- English hint concatenated into a translation string with highlighted words bolded
- Metadata: base form, canonical answer, alternate answers (if any)
- Card container: `border`, `bg-secondary-bg`, `rounded`, padding

---

## 9.8 Right Sidebar (Desktop)

**Component:** `src/lib/components/GrammarActions.svelte`

Sticky sidebar (desktop only, hidden on mobile):
- Width: ~395px (`24.6875rem`)
- Position: sticky, top-aligned below header

**Buttons:**
- **Mark as Learned** — Creates ReviewCards for all cloze cards of this grammar point (state=New, due=now). Updates `UserDeckProgress.lastLearnedIndex`. Button disabled if already learned.
- **Add Note** (future Phase 11) — placeholder, disabled for now

---

## 9.9 Navigation Footer

**Component:** `src/lib/components/LessonNav.svelte`

Fixed footer bar at the bottom of the grammar page (when accessed via lesson context):

- **Previous** button — navigates to previous grammar point in lesson (disabled if first)
- **Progress pellets** — small horizontal bars showing lesson progress:
  - Each pellet = one grammar point in the lesson batch
  - Active pellet: accent colour, slightly larger
  - Completed: solid secondary colour
  - Remaining: faded secondary colour
- **Next** button — navigates to next grammar point in lesson (accent background, prominent)

If no lesson context (direct URL access), show simplified nav:
- Back to deck link
- Previous/Next within deck order (not lesson-scoped)

---

## 9.10 Review → Grammar Link

In the existing review page (`/reviews/+page.svelte`), after the user answers a card:
- Add a "View Grammar" button in the revealed info section
- Clicking opens `/grammar/[grammarPointId]` (new tab or navigation)
- Provides quick reference without leaving the review session (consider opening in a panel/modal in future)

---

## 9.11 Server Data Loading

**`/grammar/[id]/+page.server.ts`:**

```ts
export const load = async ({ params, locals, url }) => {
  const grammarPoint = await prisma.grammarPoint.findUnique({
    where: { id: params.id },
    include: {
      clozeCards: { orderBy: { createdAt: 'asc' } },
      decks: {
        include: { deck: true },
        orderBy: { sortOrder: 'asc' }
      }
    }
  });

  if (!grammarPoint) throw error(404, 'Grammar point not found');

  // Lesson context from query params (optional)
  const deckId = url.searchParams.get('deck_id');
  const lessonNumber = url.searchParams.get('lesson');
  let lessonContext = null;

  if (deckId && lessonNumber) {
    // Fetch other grammar points in the same lesson for nav
    const lessonGrammar = await prisma.deckGrammarPoint.findMany({
      where: { deckId, lessonNumber: parseInt(lessonNumber) },
      include: { grammarPoint: true, deck: true },
      orderBy: { sortOrder: 'asc' }
    });
    lessonContext = {
      deckTitle: lessonGrammar[0]?.deck.title,
      lessonNumber: parseInt(lessonNumber),
      grammarPoints: lessonGrammar.map(lg => ({
        id: lg.grammarPoint.id,
        title: lg.grammarPoint.title
      })),
      currentIndex: lessonGrammar.findIndex(lg => lg.grammarPointId === params.id)
    };
  }

  // User's learning status for this grammar point
  let isLearned = false;
  if (locals.user) {
    const reviewCardCount = await prisma.reviewCard.count({
      where: {
        userId: locals.user.id,
        clozeCard: { grammarPointId: params.id }
      }
    });
    isLearned = reviewCardCount > 0;
  }

  return { grammarPoint, lessonContext, isLearned };
};
```

---

## 9.12 Files to Create

| File | Purpose |
|------|---------|
| `src/routes/grammar/[id]/+page.svelte` | Grammar point learning page |
| `src/routes/grammar/[id]/+page.server.ts` | Grammar point data loader |
| `src/lib/components/GrammarHero.svelte` | Hero header with gradient + title |
| `src/lib/components/GrammarTabs.svelte` | Details/Examples tab navigation |
| `src/lib/components/StructureCard.svelte` | Grammar pattern formula card |
| `src/lib/components/MetadataCard.svelte` | Category/register/tense/level metadata |
| `src/lib/components/GrammarAbout.svelte` | Description + embedded examples + notes |
| `src/lib/components/GrammarExamples.svelte` | Full example sentence list |
| `src/lib/components/GrammarActions.svelte` | Sidebar action buttons |
| `src/lib/components/LessonNav.svelte` | Previous/Next + progress pellets footer |

## 9.13 Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `structurePattern`, `notes` fields to GrammarPoint |
| `prisma/seed.ts` | Add `structurePattern` and `notes` data for existing grammar points |
| `src/routes/reviews/+page.svelte` | Add "View Grammar" button after answer reveal |
| `src/app.css` | Add grammar page styles (hero gradient, structure card, note types, example cards) |

---

## Design Decisions

- **No furigana/ruby needed:** Korean does not use furigana. The equivalent "reading aid" is the romanization guide already in the footer.
- **Tab state is client-side only:** No URL update for tab switches (Details/Examples). Simple `$state` toggle.
- **Examples show full answers:** Unlike reviews which hide the answer, learning pages show all answers highlighted. This is intentional — the learning page is for studying, not testing.
- **Notes as JSON:** Flexible schema that allows varying numbers and types of notes per grammar point without schema changes.

---

## Dependencies

- Phase 7 deck system (for lesson context, deck membership)
- Phase 8 dashboard (for navigation from dashboard → grammar page)
