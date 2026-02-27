# Phase 8 — Dashboard Redesign

> **Status:** 📋 Planned
> **Depends on:** Phase 7 (Deck System & Schema)

## Goals

Replace the authenticated home page with a Bunpro-inspired dashboard featuring a review history chart, deck progress cards, study streak, SRS-level distribution, and a profile sidebar. This becomes the primary landing page for logged-in users.

---

## 8.1 Route & Layout

**Route:** `/dashboard` (authenticated users redirected here from `/`)

**Grid Layout (desktop, lg+):**
```
┌──────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────┬──────────────────────┬──────────────────┐  │
│  │   Learn Card         │   Review Card        │  Profile         │  │
│  │   (next lesson)      │   (due reviews)      │  Sidebar         │  │
│  ├──────────────────────┴──────────────────────┤  (spans 3 rows)  │  │
│  │   Review History Chart                      │                  │  │
│  │   [Hourly] [Daily]                          │  - Avatar/Name   │  │
│  │   ┌─────────────────────────────────┐       │  - Level + XP    │  │
│  │   │  ▁ ▃ ▆ █ ▃ ▁ ▃ ▆ ▃ ▁ ▁ ▃ ▅   │       │  - Streak        │  │
│  │   └─────────────────────────────────┘       │  - TOPIK Prog.   │  │
│  ├─────────────────────────────────────────────┤  - Quick Stats   │  │
│  │   Activity / SRS Distribution               │                  │  │
│  │   [Beginner] [Learning] [Review] [Master]   │                  │  │
│  └─────────────────────────────────────────────┴──────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

**CSS Grid:**
```css
.dashboard-grid {
  display: grid;
  gap: 1rem;
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr 1fr 23.875rem;
  }
}
```

**Mobile:** Single-column stack. Profile sidebar moves to top (compact horizontal strip).

---

## 8.2 Learn & Review Action Cards

Two cards spanning the first row (columns 1–2 on desktop).

### Learn Card
- Background: SRS-themed gradient (dark teal / `--srs-new`)
- Content:
  - "Learn" heading
  - Deck name: "TOPIK Level 1 Grammar"
  - Current lesson info: "Lesson 2: 3 new grammar points"
  - Or: "All caught up! 🎉" if no more grammar to learn
- Click action: Navigate to `/learn?deck_id=[id]`
- Badge: count of learnable grammar points

### Review Card
- Background: SRS-themed gradient
- Content:
  - "Review" heading
  - Due count badge (prominent number)
  - "All caught up!" when 0 due
  - Or: "N reviews due" with action prompt
- Click action: Navigate to `/reviews`
- Links to deck-filtered reviews if only one deck

---

## 8.3 Review History Chart

**Technology:** Chart.js 4 (installed as `chart.js`)

**Component:** `src/lib/components/ReviewHistoryChart.svelte`

**Chart spec:**
- **Type:** Stacked bar chart
- **X-axis:** Time (hours or days depending on toggle)
- **Y-axis:** Number of reviews
- **Data series (stacked):**
  - Correct (green / `--green-text`)
  - Incorrect (red / `--accent`)
- **Toggle tabs:** "Hourly" (last 24 hours, per-hour buckets) / "Daily" (last 30 days, per-day buckets)
- **Canvas size:** Responsive, min-height 167px
- **Background:** Card with border (`.card` pattern from `app.css`)

**Data source:** `GET /api/stats/review-history?period=hourly|daily`

**API response shape:**
```ts
interface ReviewHistoryData {
  labels: string[];       // ["12am", "1am", ...] or ["Feb 1", "Feb 2", ...]
  correct: number[];      // correct review counts per bucket
  incorrect: number[];    // incorrect review counts per bucket
}
```

**Server query:** Aggregate `ReviewLog` records by `reviewedAt` timestamp grouped into hour/day buckets, split by `rating` (1 = incorrect, 2–4 = correct).

---

## 8.4 Profile Sidebar

Sticky right column on desktop. Contains stacked info cards.

### User Info Header
- User avatar (placeholder circle with initial if no image)
- Display name (or email if no name)
- "Korean Learner" subtitle
- Level badge: "Lv. N"

### XP Progress Bar
- Shows current XP / XP needed for next level
- Uses existing `calculateLevel()` from `$lib/levels.ts`
- Gradient fill bar (accent colour)

### Streak Card
- **New model: `UserStreak`** (see schema below)
- "Current Streak — N" heading
- 7-day calendar row (Mon–Sun in Korean day abbreviations: 월화수목금토일)
- Each day: circle/square indicator, filled if studied that day
- Current day highlighted in accent colour

### TOPIK Progress Card
- "TOPIK Progress (Grammar)" heading
- One progress bar per enrolled deck:
  - Deck name: "Level 1"
  - Multi-segment bar coloured by SRS state:
    - New (dark teal)
    - Learning (navy blue)
    - Review (purple)
    - Relearning (rose)
  - "N/M" count (grammar points at each SRS stage / total)
- Based on `ReviewCard.state` distribution for each deck's grammar points

### Quick Stats Bar
- Horizontal row of 3 stats at bottom of sidebar:
  - **Days Studied** — total unique days with at least 1 review
  - **Last Session** — accuracy percentage of most recent review session
  - **Items Studied** — total grammar points with at least 1 review

---

## 8.5 SRS Level Distribution (Activity Section)

Shows how many grammar points are at each FSRS state. Uses the FSRS `state` field (0=New, 1=Learning, 2=Review, 3=Relearning) plus an "Unstudied" category for grammar points with no ReviewCard yet.

**Cards:**
```
[New: 5] [Learning: 3] [Review: 2] [Relearning: 1] [Unstudied: 0]
```

Each card:
- Background colour mapped from FSRS state to an SRS colour variable
- State name heading
- Count (large number)
- Clickable (future: filter grammar list by state)
- Opacity 50% if count is 0

---

## 8.6 Schema Changes

### New Model: `UserStreak`

```prisma
model UserStreak {
  id             String   @id @default(cuid())
  userId         String   @unique @map("user_id")
  currentStreak  Int      @default(0) @map("current_streak")
  longestStreak  Int      @default(0) @map("longest_streak")
  lastStudiedDate DateTime? @map("last_studied_date")  // date only (start of day)
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt      @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_streaks")
}
```

**Streak logic (updated on every review POST):**
1. After processing a review in `POST /api/reviews`:
   - Get today's date (UTC, start of day)
   - Upsert `UserStreak` for the user
   - If `lastStudiedDate` is today → no change
   - If `lastStudiedDate` is yesterday → increment `currentStreak`, update `longestStreak` if new max
   - If `lastStudiedDate` is older or null → reset `currentStreak` to 1
   - Set `lastStudiedDate` to today

### User Model Addition

```prisma
model User {
  // ... existing fields ...
  streak UserStreak?     // NEW: one-to-one
}
```

---

## 8.7 Dashboard Data Loading

**`/dashboard/+page.server.ts`:**

```ts
// All queries run in parallel where possible
const [
  enrolledDecks,
  reviewsDue,
  reviewHistory,
  srsDistribution,
  streakData,
  sessionStats
] = await Promise.all([
  // Enrolled decks with grammar count + learned count
  getEnrolledDecks(userId),
  // Total reviews due now
  prisma.reviewCard.count({ where: { userId, due: { lte: now } } }),
  // Review history (last 30 days, aggregated)
  getReviewHistory(userId, 30),
  // SRS state distribution across all user's review cards
  getSrsDistribution(userId),
  // Streak data
  prisma.userStreak.findUnique({ where: { userId } }),
  // Quick stats
  getSessionStats(userId)
]);
```

---

## 8.8 CSS Design Tokens

Add to `app.css`:
```css
:root {
  /* SRS Level Colours (matching Bunpro's scheme adapted for FSRS) */
  --srs-new:         rgb(8, 38, 48);     /* dark teal — New (state 0) */
  --srs-learning:    rgb(21, 52, 86);    /* navy blue — Learning (state 1) */
  --srs-review:      rgb(85, 56, 110);   /* purple — Review (state 2) */
  --srs-relearning:  rgb(156, 58, 82);   /* rose — Relearning (state 3) */
  --srs-mastered:    rgb(199, 74, 74);   /* red accent — Mastered (future) */

  /* Dashboard-specific */
  --dashboard-max-width: 1200px;
  --sidebar-width: 23.875rem;
}
```

---

## 8.9 Files to Create

| File | Purpose |
|------|---------|
| `src/routes/dashboard/+page.svelte` | Dashboard page component |
| `src/routes/dashboard/+page.server.ts` | Dashboard data loader |
| `src/lib/components/ReviewHistoryChart.svelte` | Chart.js review history chart |
| `src/lib/components/DeckProgressCard.svelte` | Deck learn/review action card |
| `src/lib/components/ProfileSidebar.svelte` | Profile sidebar with streak + stats |
| `src/lib/components/SrsDistribution.svelte` | SRS level cards |
| `src/lib/components/StreakCalendar.svelte` | 7-day streak calendar |
| `src/lib/components/TopikProgress.svelte` | TOPIK progress bars |
| `src/routes/api/stats/review-history/+server.ts` | Review history API |

## 8.10 Files to Modify

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add UserStreak model, User.streak relation |
| `prisma/seed.ts` | Seed UserStreak for test user |
| `src/routes/+page.server.ts` | Redirect authenticated users to `/dashboard` |
| `src/routes/+page.svelte` | Unauthenticated landing page only (logged-in users won't see this) |
| `src/routes/api/reviews/+server.ts` | Update streak on review submission |
| `src/app.css` | Add SRS colour tokens, dashboard grid styles |
| `package.json` | Add `chart.js` dependency |

---

## Dependencies

- `chart.js` (npm package) for canvas-based charts
- Phase 7 deck system for deck progress data
