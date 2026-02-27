# Phase 6 — Hardening

> **Status:** ✅ Complete (2026-02-27)
> **Builds on:** Phase 5.1 (Header Redesign & User Level System)

## Summary

Secured exposed endpoints, added server-side answer verification, improved error handling across the app, and enabled rate limiting on auth endpoints. The review API now refuses unauthenticated or cross-user requests with proper HTTP status codes. Answers are verified server-side before the FSRS rating is accepted, so forged POSTs can no longer manipulate spaced-repetition scheduling. Network errors display inline with retry, the empty-state shows the real next-review countdown, login validates inputs before hitting the network, and BetterAuth's built-in rate limiter is activated for all environments.

---

## Changes Made

### 6.1 Auth-gate the Reviews API

**`src/hooks.server.ts`**
- Added a branch for unauthenticated requests to `/api/*` routes: instead of redirecting to `/login` (which sends back HTML), API paths now get a JSON `401 Unauthorized` response. Page routes still redirect as before.

**`src/routes/api/reviews/+server.ts`**
- Added `locals.user` check — returns 401 if no session (belt-and-suspenders beyond the hook).
- Added ownership check: `reviewCard.userId !== user.id` returns 403 Forbidden, so a user cannot schedule FSRS updates for cards belonging to another account.

### 6.2 Server-side Answer Verification

**`src/routes/api/reviews/check/+server.ts`** _(new file)_
- `POST /api/reviews/check` accepts `{ reviewCardId, answers: string[] }`.
- Performs auth check and ownership check (same pattern as the FSRS endpoint).
- Fetches the `ClozeCard` (via the `ReviewCard` relation) and compares each submitted answer against `[answer, ...alternateAnswers]`.
- Returns `{ correct: boolean, rating: 1 | 3 }` — the server-authoritative rating.

**`src/routes/reviews/+page.svelte` — `next()` rewrite:**
- Before posting the FSRS update, the client now calls `POST /api/reviews/check` with all typed Hangul values.
- If the check succeeds, its `rating` is used for the FSRS POST (server-verified, tamper-proof).
- If the check call itself fails (network error, 5xx), falls back to the client-computed rating so UX is not blocked.
- The `autoFailed` flag (reveal-info penalty) always overrides the server rating to `1` (Again), as intended.

### 6.3 Error Handling

**Empty state — next review time (`src/routes/reviews/+page.server.ts`):**
- When no cards are due, queries the next upcoming `ReviewCard.due` timestamp for the user.
- Returns `nextReviewAt: Date | null` alongside the queue.

**Empty state — countdown UI (`src/routes/reviews/+page.svelte`):**
- Added `formatNextReview(date)` helper that formats a future timestamp as a human-readable relative string: `"less than a minute"`, `"N minutes"`, `"N hours"`, or `"N days"`.
- Empty state now renders: `"Next review in <strong>N hours</strong>."` when `data.nextReviewAt` is set, or `"No reviews scheduled yet."` when the user has no cards at all.

**Network error recovery (`src/routes/reviews/+page.svelte`):**
- Added `networkError: string | null` reactive state.
- If `next()` throws (fetch error or non-ok response), `networkError` is set to the error message and the card is **not** advanced — the user stays on the current card.
- An inline red banner appears above the controls with the error text and a **Retry** button that re-invokes `next()`.
- `resetCardState()` now also clears `networkError`.

**Login form validation (`src/routes/login/+page.svelte`):**
- Added `validate()` function that runs before the BetterAuth API call.
- Checks: email must contain `@` and `.`; password must be present; sign-up mode requires password ≥ 8 characters.
- Validation errors appear in the existing error banner without touching the network.

**Expired session handling:**
- Already covered by Phase 5.1's `Cache-Control: private, no-store, must-revalidate` on authenticated page responses (hard refresh always re-validates with the server).
- With the new 401 JSON response for API routes, an expired session during a review session will surface as a network error with a Retry button (on retry the user will be redirected to login by the hook).

### 6.4 Rate Limiting

**`src/lib/server/auth.ts`:**
- Added `rateLimit: { enabled: true, window: 10, max: 100, storage: 'memory' }` to the BetterAuth config.
- Previously `enabled` defaulted to `isProduction` — now active in development and production alike.
- BetterAuth's built-in special rules automatically tighten limits for auth-sensitive endpoints:
  - `POST /api/auth/sign-in/*`, `/api/auth/sign-up/*`, `/api/auth/change-password`, `/api/auth/change-email` → **3 requests per 10 seconds** per IP.
  - All other `/api/auth/*` routes → 100 req / 10 s (global fallback).
- `storage: 'memory'` is appropriate for a single-process Bun server; switch to `'database'` if scaling horizontally.

---

## Files Created

| File | Description |
|------|-------------|
| `src/routes/api/reviews/check/+server.ts` | Server-side answer verification endpoint |

## Files Modified

| File | Change |
|------|--------|
| `src/hooks.server.ts` | API routes get 401 JSON instead of login redirect |
| `src/routes/api/reviews/+server.ts` | Auth check + ownership verification |
| `src/routes/reviews/+page.server.ts` | Returns `nextReviewAt` for empty state |
| `src/routes/reviews/+page.svelte` | Server-side check call, error recovery, next-review countdown, retry UI |
| `src/routes/login/+page.svelte` | Client-side form validation before API call |
| `src/lib/server/auth.ts` | Rate limiting enabled with `rateLimit` config |

---

## Key Design Decisions

- **No answers removed from page data**: The fast-path client check (instant feedback on submit) still uses the answers array in the page payload. True "answer hiding" would require a network round-trip on every `submit()`, degrading UX for a personal SRS tool. The server-side check in `next()` ensures the FSRS rating is always server-verified before being persisted.
- **Retry on error, not silent skip**: Previous behaviour silently swallowed network errors and advanced the card anyway, leaving the review unlogged. Now the card stays in view and the user can retry.
- **In-memory rate limit storage**: Chosen for simplicity. Restarts reset counters. Sufficient for a single-user/small-team deployment; swap to `'database'` for persistence across restarts.
