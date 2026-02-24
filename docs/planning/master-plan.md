# Master Plan — Korean Cloze SRS

> **Last updated:** 2026-02-24

## Project Vision

A spaced-repetition web app for learning Korean grammar through cloze-deletion (fill-in-the-blank) exercises. Users type romanized Korean, see live Hangul conversion, and receive FSRS-scheduled reviews.

## Architecture

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit 2, Svelte 5 (runes) |
| Language | TypeScript (strict) |
| Database | PostgreSQL 16 (Podman) |
| ORM | Prisma 7.4 (`prisma-client` generator + `@prisma/adapter-pg`) |
| Auth | BetterAuth 1.4 (email/password + Argon2id) |
| SRS | ts-fsrs (FSRS algorithm) |
| Runtime | Bun |
| Build | Vite 7 |

## Phase Summary

| Phase | Name | Status | Description |
|-------|------|--------|-------------|
| 1 | MVP | ✅ Done | Single hardcoded cloze card, romanization → Hangul |
| 2 | UI Polish | ✅ Done | Remove bounding boxes, centered layout, tense/register placeholders, syntax highlighting |
| 3 | Interactions & FSRS | ✅ Done | Review queue, incorrect/correct flows, undo, reveal info, FSRS API |
| 4 | Database & Seeding | ✅ Done | Prisma schema, 11 grammar points, 36 cards, test user, Argon2id |
| 5 | Auth & Routing | ✅ Done | BetterAuth integration, login/signup, home page, route restructure |
| 6 | Hardening | 📋 Planned | Auth-gate API, server-side answer verification, error handling |
| 7 | Content Expansion | 📋 Planned | AI card generation, more grammar points, close-answer detection |
| 8 | Admin & Analytics | 💭 Future | Card browser/editor, review analytics dashboard |

## Current State (Post-Phase 5)

- **8 database tables:** User, Session, Account, Verification, GrammarPoint, ClozeCard, ReviewCard, ReviewLog
- **11 grammar points** (Part 3 Korean particles) with **36 cloze cards**
- **Authentication:** Email/password sign-up and sign-in via BetterAuth
- **FSRS scheduling:** Active via `POST /api/reviews` with rating 1–4
- **Routes:** `/` (home + grammar list), `/login`, `/reviews` (auth-gated), `/reviews/roman-to-hangul`
- **Test user:** `test@example.com` / `testpassword123` (5 review cards seeded)

## Open Questions

1. **Close answers (Phase 3.3):** Character-level diff for near-miss feedback — needs `closeAnswers Json?` on ClozeCard
2. **Self-rating UI:** Currently auto-rates Good/Again. Future: Hard/Easy buttons after correct answers
3. **Multi-blank cards:** Single blank assumed. Multi-blank needs per-blank `romanInputs` tracking
4. **Google OAuth:** BetterAuth ready for it — needs `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`
5. **Review scheduling nuance:** Basic `fsrs.repeat()` used. Consider learning steps, graduating intervals

## Docs Index

- [Phase 6 — Hardening](phase-6-hardening.md) — next planned work
- [Phase 7 — Content Expansion](phase-7-content.md) — AI generation, close answers
- [Phase 8 — Admin & Analytics](phase-8-admin.md) — future admin UI
- [Devlog](../devlog/) — completed phase documentation
- [LLM Context](../context/LLM_CONTEXT.md) — AI development context
- [Prisma 7 Notes](../context/PRISMA7_NOTES.md) — Prisma 7 reference
- [DB Plan](../context/DB_PLAN.md) — original database implementation plan
