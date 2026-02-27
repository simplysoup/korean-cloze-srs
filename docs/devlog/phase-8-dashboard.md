# Phase 8 — Dashboard Redesign

> **Date:** 2026-02-27
> **Status:** ✅ Complete

## Summary

Replaced the authenticated home page with a Bunpro-inspired dashboard at `/dashboard`. The dashboard features a 3-column grid layout with learn/review action cards, a Chart.js review history chart, profile sidebar with streak calendar, SRS level distribution, and TOPIK progress bars. Authenticated users are now redirected from `/` to `/dashboard`.

---

## Changes Made

### Schema Changes
- **New model: `UserStreak`** (`user_streaks` table) — tracks per-user study streak with `currentStreak`, `longestStreak`, `lastStudiedDate`
- Added `streak UserStreak?` relation on `User` model
- Migration: `20260227221157_add_user_streak`

### New Dependencies
- `chart.js@4.5.1` — Canvas-based charting for review history

### New Files

| File | Purpose |
|------|---------|
| `src/routes/dashboard/+page.server.ts` | Dashboard data loader — parallel queries for enrolled decks, reviews due, streak, SRS distribution, TOPIK progress, quick stats |
| `src/routes/dashboard/+page.svelte` | Dashboard page — grid layout with action cards, chart, sidebar, SRS distribution |
| `src/lib/components/ReviewHistoryChart.svelte` | Chart.js stacked bar chart with Hourly/Daily toggle, fetches from `/api/stats/review-history` |
| `src/lib/components/ProfileSidebar.svelte` | Right sidebar — user info, XP bar, streak calendar (Korean day names), TOPIK progress bars, quick stats |
| `src/lib/components/SrsDistribution.svelte` | SRS level cards (New/Learning/Review/Relearning/Unstudied) with FSRS-state colours |
| `src/routes/api/stats/review-history/+server.ts` | `GET /api/stats/review-history?period=hourly\|daily` — aggregates ReviewLog into time-bucketed correct/incorrect counts |

### Modified Files

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added `UserStreak` model, `User.streak` relation |
| `prisma/seed.ts` | Seeds `UserStreak` for test user (3-day streak) |
| `src/app.css` | Added SRS colour tokens (`--srs-new`, `--srs-learning`, `--srs-review`, `--srs-relearning`, `--srs-mastered`), dashboard grid styles, action cards, sidebar cards, streak calendar, TOPIK progress bars, quick stats, review chart, SRS distribution cards |
| `src/routes/+page.server.ts` | Redirects authenticated users to `/dashboard`; simplified to unauthenticated-only landing page |
| `src/routes/+page.svelte` | Stripped authenticated UI (now unauthenticated landing only); removed unused CSS |
| `src/routes/+layout.svelte` | Brand link → `/dashboard`; "Learn" nav link → "Dashboard" link to `/dashboard` |
| `src/routes/login/+page.svelte` | Post-login redirect → `/dashboard` (was `/`) |
| `src/routes/login/+page.server.ts` | Redirect logged-in users → `/dashboard` (was `/`) |
| `src/hooks.server.ts` | Added `/` to public exact paths so unauthenticated landing page is accessible |
| `src/routes/api/reviews/+server.ts` | Streak tracking: upserts `UserStreak` on every review — increments streak if yesterday, resets if gap, no-op if same day |
| `package.json` | Added `chart.js` dependency |

---

## Dashboard Layout

```
Desktop (lg+):
┌──────────────────────┬──────────────────────┬──────────────────┐
│   Learn Card         │   Review Card        │  Profile         │
│   (gradient teal)    │   (gradient purple)  │  Sidebar         │
├──────────────────────┴──────────────────────┤  (spans 3 rows)  │
│   Review History Chart (Chart.js)           │  - Avatar/Name   │
│   [Hourly] [Daily] toggle                   │  - Level + XP    │
│                                             │  - Streak Cal.   │
├─────────────────────────────────────────────┤  - TOPIK Prog.   │
│   SRS Distribution                          │  - Quick Stats   │
│   [New] [Learning] [Review] [Relearning]    │                  │
└─────────────────────────────────────────────┴──────────────────┘

Mobile: Single-column stack
```

## Streak Logic

On each `POST /api/reviews` submission:
1. Get today's date (start of day, UTC)
2. Fetch or create `UserStreak` for user
3. If `lastStudiedDate` is today → no change
4. If `lastStudiedDate` is yesterday → increment `currentStreak`, update `longestStreak` if new max
5. If `lastStudiedDate` is older or null → reset `currentStreak` to 1
6. Set `lastStudiedDate` to today

## API Endpoints

- **`GET /api/stats/review-history?period=hourly|daily`** — Auth-gated. Returns `{ labels, correct, incorrect }` arrays for Chart.js. Hourly = last 24 hours; Daily = last 30 days. Rating ≥ 2 counts as correct.

## Verification

- `bun run check` — 0 errors, 3 warnings (unused Svelte variables in chart component)
- `bun run build` — Successful production build
- `bunx --bun prisma db seed` — All seeds including UserStreak pass

## Architecture Notes

- Dashboard server load runs enrolled decks query first (needed for subsequent queries), then parallelizes 7 remaining queries via `Promise.all`
- Review history chart uses client-side `$effect` to fetch data on mount and period toggle, renders via Chart.js canvas
- SRS distribution counts per FSRS state (0=New, 1=Learning, 2=Review, 3=Relearning) plus "Unstudied" (enrolled grammar with no ReviewCard)
- Profile sidebar uses Korean day abbreviations (월화수목금토일) for streak calendar
- All CSS follows existing BEM conventions in global `app.css`

---

## Post-Completion: Bug Investigation & Fixes

> **Date:** 2026-02-27 (same session)

### Apparent Feature Breakage

After Phase 8 implementation, the user reported that header dropdowns and the Hangul input system no longer worked. Investigation found **no server-side errors** — the SSR HTML was rendering correctly, data was flowing properly, and all API endpoints responded fine.

Root cause: **the Vite dev server had been killed** (SIGINT), leaving the browser with cached server-rendered HTML but unable to fetch client-side JavaScript from Vite. Without hydration, no event handlers or reactive bindings were attached — so dropdowns and input reactivity silently did nothing. Hard-refreshing after restarting the server restored full functionality. No code was broken.

### Svelte Warnings Fixed

Two `state_referenced_locally` warnings (caught by `vite-plugin-svelte`) were resolved:

- **`ProfileSidebar.svelte`**: Changed `const initial = userName || userEmail` (captures initial prop value) to `const avatarLetter = $derived((userName || userEmail).charAt(0).toUpperCase())`
- **`ReviewHistoryChart.svelte`**: Changed `$state<...>(period)` (captures initial prop value) to `$state<...>('daily')` (hardcoded default, since the prop is always `'daily'` at construction)

### `start.sh` Added

Added `start.sh` to the project root — a convenience bootstrap script that:
1. Kills any existing processes on port 5173 (handles multiple PIDs via `mapfile -t` array)
2. Checks the `hangul-postgres` container state and starts/restarts it if needed
3. Waits for Postgres to be ready via `pg_isready`
4. Starts the Vite dev server via `exec bun run dev`

This prevents the "dead server, cached page" confusion from recurring.
