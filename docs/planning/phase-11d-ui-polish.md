# Phase 11d — UI Polish & Accessibility

> **Status:** 📋 Planned
> **Depends on:** Phase 11a (schema), Phase 11b/11c (content) — can be worked in parallel with 11b/11c on separate branches

## Overview

UI and UX improvements that apply across the entire app regardless of curriculum content. These were the original Phase 11 goals before the curriculum architecture expansion.

---

## 11d.1 Close-Answer Detection

### Problem

When a user types a slightly wrong answer (e.g. "nen" instead of "neun", or 는 instead of 은), the card is marked incorrect and they move on without understanding *why* they were wrong. Near-miss detection identifies typos, allomorph errors, and single-character romanization slips.

### Scope: Romanized and Hangul Input

Users type in **romanized Korean** which is converted to Hangul live. Close-answer detection runs on **both** representations:

1. **Romanized string** — compare the raw typed string (e.g. `"nen"`) against the expected romanization (e.g. `"neun"`) using Levenshtein distance ≤ 1.
2. **Hangul string** — compare the converted Hangul output against the correct Hangul answer using Levenshtein distance ≤ 1.

Either match triggers the close-answer flow. This means a single missed keystroke (`nen` → `neun`) is caught at the romanization layer before the user even sees the Hangul diff.

### Schema Change

Add `closeAnswers: Json?` to `ClozeCard`:

```prisma
model ClozeCard {
  // ... existing fields ...
  closeAnswers Json? @map("close_answers")
  // Shape: string[] — known near-correct Hangul answers (allomorphs, common confusables)
  // Levenshtein-1 on romanized input is also always checked automatically.
}
```

### Detection Logic (`src/lib/closeAnswerCheck.ts`)

```ts
export interface CloseAnswerResult {
  isClose: boolean;
  // Character-level diff against the correct Hangul answer
  segments: { char: string; correct: boolean }[];
  // The romanized form the user typed (for the romanization-layer message)
  submittedRoman: string;
  expectedRoman: string;
}

export function checkCloseAnswer(
  submittedRoman: string,   // raw romanized input, e.g. "nen"
  submittedHangul: string,  // converted Hangul, e.g. "넨"
  correctAnswer: string,    // correct Hangul answer, e.g. "는"
  correctRoman: string,     // expected romanization, e.g. "neun"
  closeAnswers: string[]    // explicit Hangul aliases
): CloseAnswerResult {
  const romanClose = levenshteinDistance(submittedRoman, correctRoman) <= 1;
  const hangulClose = closeAnswers.includes(submittedHangul)
    || levenshteinDistance(submittedHangul, correctAnswer) <= 1;

  if (romanClose || hangulClose) {
    return {
      isClose: true,
      segments: diffCharacters(submittedHangul, correctAnswer),
      submittedRoman,
      expectedRoman: correctRoman
    };
  }
  return { isClose: false, segments: [], submittedRoman, expectedRoman: correctRoman };
}
```

### UI Behaviour & FSRS Rating Rules

| Attempt | Outcome | UI | FSRS Rating |
|---------|---------|-----|-------------|
| 1st | Correct | Green border, advance | Self-rating UI shown (Hard / Good / Easy) |
| 1st | Close | **Yellow/amber border** + character diff + hint message | No rating yet — user retries |
| 1st | Wrong (not close) | Red border + reveal | **Again (1)** automatically |
| 2nd (after close) | Correct | Green border, advance | **Hard (2)** automatically — no self-rating UI |
| 2nd (after close) | Wrong or close again | Red border + reveal | **Again (1)** automatically |

**Hint message on close:**
> *"Almost! You typed "nen" — did you mean "neun" (는)?"*
> Character diff shown below with correct characters in green, wrong in red.

**Key rule:** the self-rating UI (Hard / Good / Easy) is only shown on a **clean first-attempt correct**. The close-answer retry path always resolves to an automatic rating.

### Seed Updates

Add `closeAnswers` to existing particle cards (explicit Hangul allomorphs — romanization Levenshtein is automatic):

| Answer | Close Answers |
|--------|--------------|
| 는 | ["은"] |
| 은 | ["는"] |
| 가 | ["이"] |
| 이 | ["가"] |
| 를 | ["을"] |
| 을 | ["를"] |
| 예요 | ["이에요"] |
| 이에요 | ["예요"] |

---

## 11d.2 Self-Rating UI

### Problem

Every correct answer is auto-rated "Good (3)" regardless of how hard the user found it. This leads to inaccurate FSRS scheduling.

> **Interaction with close-answer flow (11d.1):** Self-rating is only presented on a **clean first-attempt correct**. If the close-answer path was triggered (yellow border on attempt 1), FSRS rating is resolved automatically (Hard on retry-correct, Again on retry-fail). The self-rating UI is suppressed in those cases.

### UI Design

After a correct answer, show rating buttons before auto-advancing:

```
┌─────────────────────────────────────────────────┐
│  ✓ Correct!                                     │
│                                                 │
│  How difficult was this?                        │
│                                                 │
│  [ Hard (~1d) ]  [ Good (~3d) ]  [ Easy (~7d) ]│
│                                                 │
│  [ View Grammar → ]                             │
└─────────────────────────────────────────────────┘
```

- Default: **Good** is pre-highlighted (keyboard shortcut `2` / `Enter`)
- Interval estimates are approximate, based on FSRS scheduling constants
- Keyboard shortcut `1` = Hard, `2` = Good, `3` = Easy
- Incorrect answers: always rate Again (1) automatically, no UI shown
- Clicking any button submits the FSRS update and advances to next card

### Implementation

**`src/routes/reviews/+page.svelte`:**
- New `$state`: `selfRatingVisible = false`, `pendingRating: number | null = null`
- After correct answer confirmed: set `selfRatingVisible = true` instead of auto-calling `next()`
- Rating button click: call `submitReview(rating)` then `next()`
- Add global `onkeydown` guard: only fire `1/2/3` shortcuts when `selfRatingVisible === true`

---

## 11d.3 Keyboard Shortcuts

| Key | Context | Action |
|-----|---------|--------|
| `Enter` | Input focused, answer not yet submitted | Submit answer |
| `Enter` | After incorrect reveal, no rating UI | Advance to next card |
| `1` | Self-rating visible | Rate Hard |
| `2` | Self-rating visible | Rate Good (default) |
| `3` | Self-rating visible | Rate Easy |
| `Ctrl+Z` | After submit, before advancing | Undo last submission |
| `Ctrl+I` (or `i`) | During review | Reveal grammar info panel |
| `Escape` | Info panel open | Close info panel |

### Implementation Notes

- Use a single `onkeydown` handler on `document` in an `$effect` in the review page.
- Guard each shortcut behind a state check to avoid conflicts with typing (e.g. `1/2/3` only fire when `selfRatingVisible === true`).
- Handle `event.preventDefault()` for shortcuts that would otherwise scroll or trigger browser defaults.

---

## 11d.4 Loading Skeletons

### Dashboard

Replace immediate data-dependent renders with skeleton placeholders while server data is in flight (for future streaming SSR):

| Section | Skeleton |
|---------|---------|
| Progress chart | Grey pulsing 280×120px rectangle |
| Deck enrollment cards | 2× pulsing card-shaped div |
| SRS summary cards | 4× pulsing small card div |
| Profile sidebar | Circle (avatar) + 3 line placeholders |

### Grammar Page

| Section | Skeleton |
|---------|---------|
| Hero banner | Full-width gradient with 2 line text placeholders |
| Grammar card | Card-shaped div with 4 line text placeholders |
| Examples | 3× sentence-line placeholders |

### Review Page

| Section | Skeleton |
|---------|---------|
| Card area | Pulsing card with sentence line + input placeholder |

### Implementation

CSS-only skeletons using `@keyframes pulse`:

```css
@keyframes skeleton-pulse {
  0%   { opacity: 1; }
  50%  { opacity: 0.4; }
  100% { opacity: 1; }
}

.skeleton {
  background: var(--color-surface-2);
  border-radius: var(--radius-sm);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
```

Use SvelteKit `{#await}` blocks or `$loading` state to toggle skeleton vs. real content.

---

## 11d.5 Mobile Optimisation

| Issue | Fix |
|-------|-----|
| Review input too small on mobile | Minimum height 48px, font-size 16px (prevents iOS zoom) |
| Rating buttons too close together | Minimum touch target 44×44px per WCAG 2.5.5 |
| Sticky header covers content on scroll | Add `scroll-margin-top` to content anchors equal to header height |
| Session bar overlaps grammar content on small screens | Stack vertically below 480px |
| Long grammar titles overflow card header | `overflow-wrap: break-word` on `.grammar-title` |
| Deck cards in side-by-side layout on mobile | Switch to single-column below 600px |

---

## 11d.6 Accessibility

| Item | Fix |
|------|-----|
| All interactive elements keyboard-reachable | Audit and add `tabindex="0"` where needed |
| Focus ring visible on all focusable elements | Ensure `:focus-visible` styles are not suppressed |
| ARIA labels on icon-only buttons | Add `aria-label` to all icon buttons (settings gear, close X, etc.) |
| `role="status"` on quiz score | Live region so screen readers announce score updates |
| `aria-live="polite"` on feedback messages | Correct/incorrect/close messages announced to screen readers |
| Color alone does not convey state | Correct = green + ✓ icon, Incorrect = red + ✗ icon, Close = amber + ~ icon |
| Reduced motion | Wrap all animations in `@media (prefers-reduced-motion: no-preference)` |
| Session progress bar | Add `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |

---

## 11d.7 Grammar Point List Row Design

### Layout

Every place grammar points are listed (deck detail page, dashboard progress, learn queue) should display as **single-item rows**, not cards or compact pills. Each row:

```
┌─────────────────────────────────────────────────────────┐
│  -는/은                    Topic particle (subject)   9 │
│  -에                       Destination particle       4 │
│  -았/었습니다               Past tense, formal        10 │  ← mastered
└─────────────────────────────────────────────────────────┘
```

**Left side:**
- **Hangul form** of the grammar point (e.g. `-는/은`, `-에`, `-았/었습니다`) — bold
- **English description** — regular weight, smaller text, same line or immediately below depending on row width

**Right side:**
- **SRS level** as a single integer (1–10)
- Coloured by mastery tier:

| Level | Colour | Label |
|-------|--------|-------|
| 1 | Grey | New |
| 2–3 | Blue | Learning |
| 4–6 | Teal | Young |
| 7–9 | Green | Mature |
| 10 | Gold / amber | Mastered |

- At level 10 the row may show a small trophy or star glyph alongside the number

### SRS Level Mapping

FSRS tracks stability (float), not discrete levels. Map to display level as follows:

```ts
export function fsrsToDisplayLevel(stability: number | null): number {
  if (stability === null) return 1;          // Never reviewed
  if (stability < 1)     return 2;           // < 1 day
  if (stability < 3)     return 3;
  if (stability < 7)     return 4;
  if (stability < 14)    return 5;
  if (stability < 30)    return 6;
  if (stability < 60)    return 7;
  if (stability < 120)   return 8;
  if (stability < 250)   return 9;
  return 10;                                 // ≥ 250 days → Mastered
}
```

Stability ≥ 250 days (≈ 8 months) = display level 10 = **Mastered**. See also 11a's mastery gating section.

### Implementation

- Create reusable `<GrammarPointRow>` Svelte component accepting `{ hangul, description, stability }` props.
- Use CSS custom properties for tier colours so they inherit the app theme.
- Row height: minimum 48px (WCAG touch target), `display: flex; align-items: center; justify-content: space-between;`.
- The level number should be `aria-label="SRS level N"` for screen reader clarity.

---

## Files to Create / Modify

| File | Action |
|------|--------|
| `src/lib/closeAnswerCheck.ts` | Create — close-answer detection utility (romanized + Hangul Levenshtein) |
| `src/lib/levenshtein.ts` | Create — Levenshtein distance function |
| `src/lib/fsrsLevel.ts` | Create — `fsrsToDisplayLevel(stability)` mapping function |
| `src/lib/components/GrammarPointRow.svelte` | Create — single-row GP display component |
| `src/routes/reviews/+page.svelte` | Modify — self-rating UI, keyboard shortcuts, close-answer rendering, automatic rating on retry |
| `src/app.css` | Modify — add `.skeleton`, `@keyframes skeleton-pulse`, mobile fixes, a11y styles, GP row tier colours |
| `prisma/schema.prisma` | Modify — add `closeAnswers Json?` to `ClozeCard` |
| `prisma/seed-data/` | Modify — add `closeAnswers` to existing allomorph particle cards |
| `src/routes/dashboard/+page.svelte` | Modify — add skeleton placeholders; use `GrammarPointRow` in progress section |
| `src/routes/grammar/[slug]/+page.svelte` | Modify — add skeleton placeholders |
| `src/routes/decks/[slug]/+page.svelte` | Modify — replace grammar point list with `GrammarPointRow` components |
