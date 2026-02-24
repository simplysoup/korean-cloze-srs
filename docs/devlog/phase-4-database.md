# Phase 4 — Database & Seeding

> **Status:** ✅ Complete (2026-02-24)
> **Steps:** 1–6 in execution order

## Summary

Set up the full database schema with auth, grammar, and FSRS domains. Wrote comprehensive seed data with 11 grammar points covering all Part 3 Korean particles, 36 cloze cards, a test user with Argon2id-hashed password, and 5 review cards ready for immediate review.

## Changes Made

### 4.1 Schema Changes
- Added `passwordHash` (Argon2id) to User model (later replaced by BetterAuth Account table in Phase 5)
- Updated `EnglishHintPart` TypeScript interface: `highlight: boolean` → `highlightType: 'none' | 'direct' | 'related'`
- Migration: `20260223214948_init`, `20260224031009_add_password_hash`

### 4.2 Seed Grammar Points (Part 3 Particles)
11 grammar points with stable IDs for idempotent re-runs:

| ID | Particles | Title |
|----|-----------|-------|
| `gp_topic` | 은/는 | Topic Particle |
| `gp_subject` | 이/가 | Subject Particle |
| `gp_object` | 을/를 | Object Particle |
| `gp_time_place` | 에 | Time/Place Particle |
| `gp_place_at` | 에서 | Location Particle (action) |
| `gp_from_to_place` | 에서~까지 | From Place to Place |
| `gp_from_to_time` | 부터~까지 | From Time to Time |
| `gp_also` | 도 | Also/Too Particle |
| `gp_only` | 만 | Only Particle |
| `gp_and_with` | 하고/와/과 | And/With (Nouns) |
| `gp_and_casual` | (이)랑 | And/With (Casual) |

### 4.3 Test User & Auth
- Test user: `user_test` / `test@example.com` / `testpassword123`
- Argon2id hashing via `@node-rs/argon2` (64 MiB memory, 3 iterations, 4 lanes, 32-byte output)
- Password utility module at `src/lib/server/password.ts`

### 4.4 FSRS Seed
- 5 ReviewCard records for `user_test` (state=New, due=now)
- Cards: `cc_topic_01`, `cc_subject_01`, `cc_object_01`, `cc_time_place_01`, `cc_place_at_01`

## Files Created/Modified
- `prisma/schema.prisma` — 6 models across 3 domains
- `prisma/seed.ts` — full seed script (11 grammar points, 36 cards, test user, 5 reviews)
- `src/lib/server/password.ts` — Argon2id hash/verify utilities

## Dependencies Added
- `@node-rs/argon2` 2.0.2 — native Argon2id password hashing
