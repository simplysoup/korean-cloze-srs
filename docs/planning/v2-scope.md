# v2 Scope — Feature-Complete Bunpro Clone for Korean

> **Status:** Draft, 2026-11-07. Written after auditing main at `99c2789`
> (last commit 2026-02-28). Not yet approved. Stack decision is open —
> see “Architecture decision” below. Nothing in this doc is pushed yet;
> it lives on local branch `v2/scope` until Nicholas picks a stack.

## Goal

A Bunpro-equivalent for Korean grammar, with a **better mobile
experience and stability** than Bunpro's app, and frontend UX at least
as good as the current SvelteKit UI. One person can run it, learn from
it daily on a phone, and trust it not to lose reviews.

“Feature-complete” here means: everything a daily Bunpro user relies
on for grammar, in Korean, for TOPIK I first — not a clone of Bunpro's
business (no payments, no community, no multi-language).

## Baseline — verified 2026-11-07

| Check | Result |
|---|---|
| Last commit | `99c2789` “Implemented phase 11b modified grammar point list”, 2026-02-28 |
| Content | 48 grammar points, 154 cloze cards, 98 lesson examples, 11 lessons — full TOPIK I Level 1 (per `docs/devlog/phase-11b.md`) |
| Stack | SvelteKit 2 / Svelte 5, TypeScript, Prisma 7, PostgreSQL 16, BetterAuth + Argon2id, `ts-fsrs`, Bun, Podman |
| `bun install` (normal) | **Fails** — `@prisma/engines` postinstall, ECONNRESET downloading engines |
| `bun install --ignore-scripts` | Works |
| `prisma generate` | **Fails** — same ECONNRESET downloading engines, even with `.env` sourced |
| `bun run check` | **34 errors, 0 warnings, 11 files** — mostly implicit `any`, because the Prisma client cannot be generated in this environment |
| `bun run test` | **No test files found** — Vitest configured, zero tests |
| CI / LICENSE | None. No `.github/`, no LICENSE file |
| Repo hygiene | `examples/` holds 136 files / ~20 MB of saved Bunpro HTML dumps — bloat, and the wrong thing to ship in a public repo |

## What “feature-complete” covers

### 1. Core SRS — the Bunpro loop
- [x] FSRS scheduling per (user, grammar point), `ts-fsrs`, rating 1–4
- [x] Cloze cards, server-side answer verification, alternate answers
- [x] Romanized input → live Hangul (`hangul-js`)
- [x] Review queue (10 due cards), learn-then-review flow, post-session quiz
- [ ] Close-answer detection — Levenshtein ≤ 1 on romanized *and* Hangul, yellow warning + character diff (specced in Phase 11d, not built)
- [ ] FSRS auto-rating — Hard on hint-then-correct, Again on fail; self-rating only on clean first-attempt correct (Phase 11d)
- [ ] Mastery gating — mastered points (display level 10) retired from queue, excluded from cloze targeting; `peakStability` display mapping (Phase 11d, schema fields exist)
- [ ] Ghost reviews — failed items resurface in the same session (Bunpro behaviour; not in v1)
- [ ] Cram mode — review any deck / grammar point on demand, outside FSRS (Bunpro behaviour; not in v1)
- [ ] Review forecast — due counts by day, next-review countdown (partial: empty-queue countdown exists)

### 2. Learn
- [x] Grammar pages (Details / Examples tabs, structure card, notes, prev/next)
- [x] Lesson examples, N+1 constrained, separate from FSRS cards (`LessonExample`)
- [x] Decks, TOPIK-levelled, enrollment, per-user progress
- [x] Search grammar points (basic, on `/grammar`)
- [ ] Textbook / curriculum paths — TTMIK / Integrated Korean / Korean Grammar in Use ordering, the Korean equivalent of Bunpro's Genki / Tobira paths
- [ ] Bookmarks / “mark as known” with manual SRS level setting
- [ ] Audio on every example sentence (TTS at minimum; native audio is a later stretch)

### 3. Content
- [x] TOPIK I Level 1 — 48 points, complete
- [ ] TOPIK I Level 2 — specced in Phase 11c, not built
- [ ] TOPIK II Levels 3–6 — scope to be defined from TOPIK grammar lists; Bunpro Japanese is 900+ points N5–N1, so expect a few hundred Korean points total, not dozens. Do **not** quote a total until the Level 2–6 lists are counted.
- [ ] Vocabulary system — currently menu text “Vocabulary (soon)”. Bunpro vocab is a separate SRS track; v2.0 needs at least vocab attached to grammar examples, full vocab decks are a later phase.
- [ ] Content authoring pipeline — move authoring out of TS seed files into validated content files (YAML/Markdown) with a check script, so adding a lesson does not mean editing code. Provenance: all sentences must be original or from a source we have the right to use; no copied textbook / TTMIK / Bunpro sentences.

### 4. Dashboard & motivation
- [x] Review history chart, SRS distribution, streak, XP / levels, TOPIK progress
- [ ] Daily goal / review forecast on dashboard
- [ ] Settings — reviews per session, new points per day, timezone handling for streaks (streaks are date-based; get this right before launch)

### 5. Mobile — the v2 differentiator
- [x] Responsive web, viewport meta, mobile breakpoints in `app.css`
- [ ] **PWA (recommended route):** `manifest.json`, service worker, installable, app icons, splash, bottom nav on mobile, large touch targets (≥ 44px), safe-area insets
- [ ] **Offline reviews:** queue due cards in IndexedDB, answer offline, sync FSRS results when back online, with conflict handling (server wins on already-synced, local wins on unsynced). This is the single feature that makes mobile feel stable.
- [ ] Offline-aware UI: clear offline banner, retry on failed sync, no lost answers on reload / tab close
- [ ] Performance budget: review page interactive fast on a mid-range phone, no layout shift on answer reveal
- [ ] Native wrapper (Capacitor) — **only if PWA proves insufficient**. Not in v2.0 scope.

### 6. Accounts & data
- [x] Email/password auth, BetterAuth, rate limiting, auth guard
- [ ] Email verification, password reset (BetterAuth supports both; not wired up)
- [ ] Export my data (reviews, progress) / import, delete account
- [ ] Settings page (currently no settings UI)

### 7. Quality gates — must pass before any “v2.0” claim
- [ ] `svelte-check`: 0 errors
- [ ] `vitest run`: real tests, covering at minimum FSRS submit flow, romanization → Hangul (incl. edge cases), server-side answer checking (incl. alternate answers and close answers), and seed-data validation (every cloze card's answer appears in its sentence, every grammar point has ≥ 2 lesson examples)
- [ ] `vite build`: passes
- [ ] CI on every push: install, check, test, build
- [ ] Seed-data validation script run in CI
- [ ] Accessibility: keyboard shortcuts (Enter, 1/2/3, Ctrl+Z, Ctrl+I per Phase 11d), focus-visible, ARIA live regions on review feedback, reduced-motion
- [ ] LICENSE added, `examples/` (Bunpro HTML dumps) removed, secret scan on history

## Architecture decision — open

**Recommended: A — Keep SvelteKit, slim the backend.**
SvelteKit 2 / Svelte 5 frontend stays. Replace Prisma 7 + PostgreSQL 16 +
Podman with **Drizzle + SQLite (libSQL / Turso)**. BetterAuth stays
(Drizzle adapter). `ts-fsrs` and `hangul-js` stay — pure TS, no engine
downloads. Adapter changes `adapter-auto` → `adapter-node`, single
process on the VPS. This is the smallest change that fixes the
verified install/generate fragility above, and it keeps the 48-point
content (seed data is plain TS, portable).

**B — SvelteKit + Supabase.** Managed Postgres + auth, zero DB ops.
Good for a public multi-user launch. Costs: vendor lock-in, RLS to
learn, offline still needs a local queue.

**C — Keep Prisma / Postgres, just fix setup.** No migration, but keeps
the exact fragility verified above.

**D — True native: Expo React Native.** Best App Store experience,
but rewrites the whole UI already built. Only if native store presence
is a must-have.

Whatever is picked, these do **not** change: SvelteKit frontend (A/B/C),
FSRS as the scheduling unit (per grammar point), cloze as the review
format, content seed files as the source of truth until the content
pipeline in §3 lands.

## Build order (after stack pick)

0. **Cleanup** — delete `examples/`, add LICENSE, CI + first tests,
   fix install so a fresh clone passes `check` + `test` + `build`.
   No feature work until this is green.
1. **DB migration** (A/B only) — schema port, data migration script,
   seed re-run verified: 48 GPs / 154 cards / 98 examples.
2. **PWA + offline reviews** — manifest, service worker, IndexedDB
   queue + sync, mobile nav / touch / safe-area pass.
3. **Finish Level 1** — Phase 11d: close-answer, auto-rating, mastery
   gating, skeletons, a11y, shortcuts.
4. **Vocab (attached), audio, search improvements, Cram, Ghosts.**
5. **TOPIK I Level 2 content**, via the new content pipeline.
6. **Capacitor evaluation** — only after 2–5 are live and used daily.

## Non-goals for v2.0

Native App Store release, community / forums, payments / subscriptions,
multi-language support, speaking / listening practice, AI-generated
content (all grammar sentences are authored and reviewed, not generated
at runtime).

## Open decisions (need Nicholas)

1. Stack: A / B / C / D (see above).
2. Scope: finish TOPIK 1 to genuinely feature-complete first, or start
   Level 2 content in parallel?
3. Hosting / DB: VPS (like the math site) or hosted (Turso / Supabase)?
4. License for the repo (MIT is the default suggestion).
5. Public launch vs personal-use first — changes how much auth,
   email verification, and abuse handling v2.0 needs.
