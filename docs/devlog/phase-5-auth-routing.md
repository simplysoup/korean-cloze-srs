# Phase 5 — Routing & Auth (BetterAuth)

> **Status:** ✅ Complete (2026-02-24)
> **Steps:** 7–11 in execution order

## Summary

Restructured routes (home page, login page, reviews under `/reviews/`), integrated BetterAuth for email/password authentication with custom Argon2id hashing, added session management via SvelteKit hooks, built a navigation bar, and wired all protected routes to require authentication.

## Changes Made

### 5.1 Route Restructure
- Home page (`/`) — grammar point list with search + stats
- Login page (`/login`) — email/password form with sign-up toggle
- Reviews (`/reviews`) — auth-gated review queue
- Moved `roman-to-hangul` from `/roman-to-hangul/` to `/reviews/roman-to-hangul/`
- BetterAuth handles `/api/auth/*` via `svelteKitHandler` in hooks (no catch-all API route needed)

### 5.2 Home Page
- Grammar point list with card counts, filterable by search
- Quick stats for authenticated users (reviews due, total reviewed, grammar count)
- Login CTA for unauthenticated users, "Start Reviews" button for authenticated users

### 5.3 Login Page
- Toggle between login and sign-up modes
- Uses `authClient.signIn.email()` / `authClient.signUp.email()` from BetterAuth Svelte client
- Redirects to `/reviews` on success
- Server-side redirect if already authenticated

### 5.4 Auth Management (BetterAuth)

**Schema changes:**
- Removed `passwordHash` from User model
- Added `emailVerified Boolean`, `image String?` to User
- Added `ipAddress String?`, `userAgent String?`, `updatedAt` to Session
- Created `Account` model (stores passwords with `providerId: "credential"`)
- Created `Verification` model
- Migration: `20260224033326_betterauth_schema`

**Server setup (`src/lib/server/auth.ts`):**
- `prismaAdapter(prisma, { provider: 'postgresql' })` for database access
- Custom Argon2id hashing plugged into `emailAndPassword.password`
- 7-day sessions with daily update age

**Client setup (`src/lib/auth-client.ts`):**
- `createAuthClient()` from `better-auth/svelte`

**Hooks (`src/hooks.server.ts`):**
- `auth.api.getSession()` populates `event.locals.session` and `event.locals.user`
- `svelteKitHandler()` intercepts `/api/auth/*` for BetterAuth endpoints

**Layout:**
- `+layout.server.ts` passes session/user from locals to all pages
- `+layout.svelte` navigation bar with brand, Reviews link, user info, logout

**Seed update:**
- Creates Account record with hashed password instead of `passwordHash` on User
- Test user: `test@example.com` / `testpassword123`

## Files Created
- `src/lib/server/auth.ts` — BetterAuth server config
- `src/lib/auth-client.ts` — BetterAuth Svelte client
- `src/hooks.server.ts` — SvelteKit server hooks
- `src/routes/+layout.server.ts` — session injection
- `src/routes/login/+page.svelte` — login/signup form
- `src/routes/login/+page.server.ts` — auth redirect

## Files Modified
- `prisma/schema.prisma` — added Account, Verification; modified User, Session
- `prisma/seed.ts` — Account record for BetterAuth
- `src/routes/+layout.svelte` — navigation bar
- `src/routes/+page.svelte` — new home page
- `src/routes/+page.server.ts` — home page server load
- `src/routes/reviews/+page.server.ts` — uses `locals.user.id`, auth redirect
- `src/app.d.ts` — App.Locals types for session/user
- `src/app.css` — nav bar styles
- `.env` — added `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`

## Dependencies Added
- `better-auth` 1.4.19 — authentication framework

## Debugging Notes
- BetterAuth's Prisma adapter works with Prisma 7's driver adapter pattern (`PrismaPg`)
- `svelteKitHandler` in hooks is the correct approach (not catch-all API routes)
- Passwords stored in `Account.password` (not `User.passwordHash`) with `providerId: "credential"`
- Requires `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` environment variables
