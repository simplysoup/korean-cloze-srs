# Phase 11 — Polish & Content

> **Status:** 📋 Planned
> **Depends on:** Phase 10 (Learn Flow & Review Integration)

## Goals

Fill out the TOPIK Level 1 Grammar deck with a complete set of 30–50+ grammar points, add near-miss answer detection, self-rating after correct answers, keyboard shortcuts, loading states, and mobile optimisation. This phase brings the app to a polished, fully usable state for studying TOPIK Level 1 Korean grammar.

---

## 11.1 Full TOPIK 1 Grammar Content

### Content Scope

Expand from the current 11 grammar points (all particles) to a comprehensive TOPIK 1 set covering:

| Category | Count (approx) | Examples |
|----------|----------------|----------|
| Particles | 11 (existing) | 은/는, 이/가, 을/를, 에, 에서, 도, 만, etc. |
| Verb endings — present | 4–5 | -아/어요, -ㅂ/습니다, -아/어, -(으)세요 |
| Verb endings — past | 2–3 | -았/었어요, -았/었습니다 |
| Verb endings — future/intention | 2–3 | -(으)ㄹ 거예요, -겠-, -(으)ㄹ래요 |
| Negation | 2–3 | 안, -지 않다, 못, -지 못하다 |
| Connectors | 4–5 | -고, -지만, -(으)면, -아/어서, -(으)니까 |
| Descriptive | 2–3 | -ㄴ/는 (modifier), 이다/아니다 |
| Question patterns | 2–3 | -아/어요?, -(으)ㄹ까요?, -지요? |
| Requests & suggestions | 2–3 | -(으)ㅂ시다, -(으)ㄹ까요?, -아/어 주세요 |
| Common expressions | 3–4 | -고 싶다, -(으)ㄹ 수 있다/없다, -아/어야 하다 |
| **Total** | **~35–45** | |

### Seed Script Overhaul

- Restructure `prisma/seed.ts` into modular files:
  ```
  prisma/
    seed.ts                    # orchestrator
    seed-data/
      topik1-particles.ts      # existing 11 grammar points
      topik1-verb-endings.ts   # new verb ending grammar
      topik1-connectors.ts     # new connector grammar
      topik1-expressions.ts    # new expression grammar
      topik1-deck.ts           # deck + ordering
      test-user.ts             # test user + progress
  ```
- Each grammar point: 3–5 cloze cards with varied sentence contexts
- Every card includes: `fullSentence`, `sentenceWithBlank`, `answer`, `alternateAnswers`, `englishHint` (with `highlightType`)
- Every grammar point includes: `structurePattern`, `description`, `notes` (caution/tip/funfact where relevant)

### Lesson Batching

Organize the ~40 grammar points into ~13 lessons of 3 each:

| Lesson | Grammar Points |
|--------|---------------|
| 1 | 은/는, 이/가, 을/를 |
| 2 | 에, 에서, 에서~까지 |
| 3 | 부터~까지, 도, 만 |
| 4 | 하고/와/과, (이)랑, 이다/아니다 |
| 5 | -아/어요, -ㅂ/습니다, -아/어 |
| 6 | -았/었어요, -았/었습니다, 안 |
| 7 | -지 않다, 못, -지 못하다 |
| 8 | -고, -지만, -(으)면 |
| 9 | -아/어서, -(으)니까, -(으)ㄹ 거예요 |
| 10 | -겠-, -(으)ㄹ래요, -고 싶다 |
| 11 | -(으)ㄹ 수 있다, -아/어야 하다, -(으)세요 |
| 12 | -(으)ㅂ시다, -(으)ㄹ까요?, -지요? |
| 13 | -아/어 주세요, -(으)ㄴ/는 (modifier), remaining |

---

## 11.2 Close-Answer Detection

### Schema Change

```prisma
model ClozeCard {
  // ... existing fields ...
  closeAnswers Json?  @map("close_answers")
  // Shape: string[] — answers that are "close" but not correct
  // e.g. for answer "는", closeAnswers might be ["은"] (wrong allomorph)
}
```

### Implementation

**`src/lib/closeAnswerCheck.ts`:**
```ts
export interface CloseAnswerResult {
  isClose: boolean;
  segments: { char: string; correct: boolean }[];
}

export function checkCloseAnswer(
  submitted: string,
  correctAnswer: string,
  closeAnswers: string[]
): CloseAnswerResult {
  // 1. Check if submitted matches a known close answer
  if (closeAnswers.includes(submitted)) {
    return {
      isClose: true,
      segments: diffCharacters(submitted, correctAnswer)
    };
  }

  // 2. Check Levenshtein distance ≤ 1 from correct answer
  if (levenshteinDistance(submitted, correctAnswer) <= 1) {
    return {
      isClose: true,
      segments: diffCharacters(submitted, correctAnswer)
    };
  }

  return { isClose: false, segments: [] };
}
```

**UI treatment in reviews:**
- Close answer → yellow/orange border on input (not red for wrong, not green for correct)
- Character-level diff: correct characters in green, incorrect in red
- Message: "Close! Check the highlighted characters."
- Does not count as correct — user must fix and resubmit
- After 2 close attempts, reveal the answer

### Seed Data

Add `closeAnswers` to existing cards where relevant:
- 은/는 cards: `closeAnswers: ["은"]` when answer is "는" (and vice versa)
- 이/가 cards: `closeAnswers: ["이"]` when answer is "가"
- etc. for allomorph pairs

---

## 11.3 Self-Rating UI

After a correct answer, show rating buttons instead of auto-rating Good:

```
┌──────────────────────────────────────────┐
│   Correct! ✓                             │
│                                          │
│   How difficult was this?                │
│   [Hard (2)]  [Good (3)]  [Easy (4)]    │
│                                          │
│   [View Grammar →]                       │
└──────────────────────────────────────────┘
```

**Behaviour:**
- Default selection: Good (3) — highlighted/pre-selected
- Clicking any rating immediately submits the FSRS update and advances
- Keyboard shortcuts: `1` = Hard, `2` = Good, `3` = Easy
- Incorrect answers always rate Again (1) automatically (unchanged)
- Rating text shows expected next review interval: "Hard (~1d)" "Good (~3d)" "Easy (~7d)"

**Implementation:**
- Modify `next()` in `/reviews/+page.svelte` to accept a rating parameter
- Add `selfRatingVisible: boolean` state
- When correct answer is confirmed, show rating buttons instead of auto-advancing

---

## 11.4 Keyboard Shortcuts

| Key | Context | Action |
|-----|---------|--------|
| `Enter` | Typing answer | Submit answer |
| `Enter` | After incorrect | Next card (same as "Next" button) |
| `1` / `2` / `3` | Self-rating visible | Rate Hard / Good / Easy |
| `Ctrl+Z` | After submit | Undo (same as "Undo" button) |
| `Ctrl+I` | During review | Reveal Info (same as "Reveal Info" button) |
| `Escape` | Reveal confirming | Cancel reveal |

**Implementation:**
- Global `onkeydown` handler in review page
- Check `event.key` and current state to determine action
- Prevent conflicts with text input (only active when input is not focused, except Enter)

---

## 11.5 Loading States

### Skeleton Screens

**Dashboard:**
- Chart area: grey pulsing rectangle
- Deck cards: 2 pulsing card shapes
- Profile sidebar: circular avatar placeholder + text line placeholders
- SRS cards: 4 pulsing card shapes

**Grammar page:**
- Hero: gradient background with text placeholders
- Content: card shapes with line placeholders

**Review page:**
- Card: pulsing card shape with sentence line and input placeholder

**Implementation:** CSS-only skeletons using `@keyframes pulse` animation on placeholder `<div>` elements. No JavaScript required.

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
| `src/lib/closeAnswerCheck.ts` | Close answer detection logic |
| `src/lib/components/SkeletonDashboard.svelte` | Dashboard loading skeleton |
| `src/lib/components/SkeletonGrammar.svelte` | Grammar page loading skeleton |
| `src/lib/components/SkeletonReview.svelte` | Review page loading skeleton |
| `src/lib/components/SelfRating.svelte` | Self-rating button group |

## 11.9 Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `closeAnswers` to ClozeCard |
| `prisma/seed.ts` | Refactor to import from `seed-data/` modules |
| `src/routes/reviews/+page.svelte` | Self-rating UI, keyboard shortcuts, close-answer display, mobile touch |
| `src/routes/reviews/+page.server.ts` | Include `closeAnswers` in queue data |
| `src/routes/api/reviews/check/+server.ts` | Return close-answer info in response |
| `src/routes/dashboard/+page.svelte` | Add skeleton loading |
| `src/routes/grammar/[id]/+page.svelte` | Add skeleton loading, mobile bottom bar |
| `src/routes/learn/+page.svelte` | Keyboard navigation support |
| `src/app.css` | Skeleton animations, mobile breakpoint refinements, accessibility focus styles |

---

## Dependencies

- Phases 7–10 complete (deck system, dashboard, grammar pages, learn flow)
- No new npm packages required (Levenshtein distance implemented inline, skeletons CSS-only)
