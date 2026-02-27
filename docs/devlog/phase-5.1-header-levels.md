# Phase 5.1 — Header Redesign & User Level System

> **Status:** ✅ Complete (2026-02-27)
> **Builds on:** Phase 5 (Auth & Routing)

## Summary

Replaced the minimal nav bar with a full Bunpro-inspired sticky header: dark background, branded logo, main nav items with count badges, dropdown menus, utility icon buttons, and a user profile chip showing level and XP progress. Implemented a server-side user level system driven by total review count. Centralized the auth guard into `hooks.server.ts` and added `Cache-Control` headers to prevent stale authenticated pages from being served from the browser cache.

---

## Changes Made

### 5.1.1 Centralized Auth Guard (`hooks.server.ts`)
- Moved per-route `redirect(302, '/login')` checks out of individual `+page.server.ts` files into a single hook.
- Public paths whitelist: `/login` and `/api/auth/*`.
- All other routes redirect to `/login` if no session is present.
- Authenticated page responses get `Cache-Control: private, no-store, must-revalidate` so hard-refresh (Ctrl+Shift+R) always re-validates the session with the server.
- Removed the now-redundant guard from `reviews/+page.server.ts`; uses `locals.user!` (non-null assertion) since the hook guarantees presence.
- Login page server load redirects to `/` (instead of `/reviews`) on already-authenticated visits.

### 5.1.2 User Level System (`src/lib/levels.ts`)
Formula:
- **XP** = `totalReviews × 10`
- **XP required for level N → N+1** = `N × 100`
  - Lv 1→2: 100 XP (10 reviews)
  - Lv 2→3: 200 XP (20 reviews), cumulative 300 XP to reach Lv 3
  - …and so on

Exported function: `calculateLevel(totalReviews): UserLevel`
Returns: `{ level, currentXP, xpForNextLevel, progress (0–100), totalXP }`

### 5.1.3 Layout Server Load (`+layout.server.ts`)
Now computes and exposes to all pages:
- `reviewsDue` — `ReviewCard` count where `due ≤ now` for the current user
- `totalReviewed` — lifetime `ReviewLog` count (drives XP)
- `learnableCount` — grammar points the user hasn't started yet (total grammar points minus those with at least one `ReviewCard`)
- `levelInfo` — `UserLevel` object from `calculateLevel(totalReviewed)`

### 5.1.4 Header Component (`+layout.svelte`)
Replaced the old `.nav-bar` with a full `<header class="header">` only rendered when a user is logged in (login page gets no header).

**Left — Brand:**
- `한` icon badge + "Korean Cloze" text, links to `/`

**Center — Main Nav:**
| Item | Destination | Badge |
|---|---|---|
| Learn | `/` | `learnableCount` (neutral) |
| Review | `/reviews` | `reviewsDue` (blue accent) |
| Content ▾ | dropdown | — |
| Practice ▾ | dropdown | — |

**Content dropdown:**
- Grammar Points → `/`
- Vocabulary (soon) — disabled placeholder

**Practice dropdown:**
- Cloze Reviews → `/reviews`
- Roman → Hangul → `/reviews/roman-to-hangul`

**Right — Utility Icons:** Notifications (button), Search (link), Help (link) — all placeholder targets for future phases.

**Right — User Profile Chip:**
- Avatar: first letter of name/email in a blue circle
- Username (truncated at 8 rem)
- Level label: `Lv. N`
- XP progress bar (width = `levelInfo.progress%`)
- Dropdown menu:
  - Header: username + `Lv. N — X / Y XP`
  - Profile (placeholder)
  - Settings (placeholder)
  - Logout (calls `authClient.signOut`, redirects to `/login`)

All dropdowns close on outside click (`svelte:window onclick`). Dropdowns use `role="menu"` / `role="menuitem"` for accessibility. Escape key closes open menus.

### 5.1.5 Styles (`app.css`)
Added `header__*` BEM block covering:
- Dark sticky bar (`#1a1a2e` background, `z-index: 100`)
- Brand, nav buttons, chevron icons, count badges (neutral + accent variant)
- Dropdown panel with fade-in animation
- Menu item states: default, hover, disabled (faint), danger (red)
- Utility icon buttons
- Profile chip, avatar, XP bar

Old `.nav-bar` styles retained (marked as fallback) since nothing references them anymore.

---

## Files Changed

| File | Change |
|---|---|
| `src/hooks.server.ts` | Centralized auth guard + Cache-Control headers |
| `src/lib/levels.ts` | **New** — level calculation utility |
| `src/routes/+layout.server.ts` | Computes reviewsDue, learnableCount, levelInfo |
| `src/routes/+layout.svelte` | Full header rewrite |
| `src/app.css` | `header__*` styles added |
| `src/routes/reviews/+page.server.ts` | Removed redundant auth guard |
| `src/routes/login/+page.server.ts` | Redirects to `/` instead of `/reviews` |
| `src/routes/login/+page.svelte` | Post-login redirect to `/` |

---

## Placeholder Items (referrable in future phases)

| Element | ID / class | Future use |
|---|---|---|
| Notifications button | `.header__icon-btn` (first) | Notification system |
| Search link | `.header__icon-btn` (second) | Dictionary / search page |
| Help link | `.header__icon-btn` (third) | Support / FAQ page |
| Profile menu item | `href="/"` in user dropdown | User profile page |
| Settings menu item | `href="/"` in user dropdown | Settings page |
| Vocabulary menu item | disabled in Content dropdown | Vocabulary content phase |
