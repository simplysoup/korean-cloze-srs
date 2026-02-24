# Phase 6 — Hardening

> **Status:** 📋 Planned

## Goals

Secure exposed endpoints, add server-side answer verification, and improve error handling across the app.

## Tasks

### 6.1 Auth-gate the Reviews API
- `POST /api/reviews` currently trusts the `reviewCardId` payload without session verification
- Add auth check: verify `event.locals.user` exists, confirm the ReviewCard belongs to the user
- Return 401 for unauthenticated requests, 403 for wrong-user requests

### 6.2 Server-side Answer Verification
- Currently answers are shipped to the client — a user can inspect network traffic to see correct answers
- Create `POST /api/reviews/check` that accepts `{ clozeCardId, answer }` and returns `{ correct, rating }`
- Keep client-side checking as a fast path, but validate server-side before FSRS update

### 6.3 Error Handling
- Review queue empty state — friendlier UX with next review time
- Network error recovery on FSRS POST
- Login form validation (email format, password length)
- Graceful handling of expired sessions

### 6.4 Rate Limiting
- Rate limit auth endpoints (sign-up, sign-in) to prevent brute force
- BetterAuth may have built-in support — investigate

## Dependencies
- None expected (all within existing stack)
