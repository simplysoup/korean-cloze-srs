# Munpro — Korean Cloze SRS

A spaced-repetition app for learning Korean grammar through cloze-deletion (fill-in-the-blank) exercises. Type romanized Korean, see it convert to Hangul in real time, and review with FSRS-scheduled spacing. Named **Munpro** (문법 = grammar + pro), modelled on Bunpro's flat, minimal look.

**Live:** [https://srv889405.tail9df0b2.ts.net:8443/](https://srv889405.tail9df0b2.ts.net:8443/)

**The live app is the Expo React Native rebuild in [`mobile/`](mobile/README.md).** Expo is the toolkit on top of React Native (the engine): the app is React Native code, using Expo Router, expo-sqlite, and `expo export` for the web build served on the VPS. See [`mobile/README.md`](mobile/README.md) for the full docs — stack, architecture, auth, settings, content, and deploy. The older SvelteKit app now lives on the [`legacy/svelte`](https://github.com/simplysoup/korean-cloze-srs/tree/legacy/svelte) branch; `main` is the Expo app only (its seed data in `prisma/seed-data/` is the content source of truth).

**Stack (live app):** Expo SDK 58 · React Native 0.88 · React 19.3 · TypeScript (strict) · Expo Router · expo-sqlite + Drizzle ORM · `ts-fsrs` (FSRS 6) · email-code auth via a small Node backend on the VPS.

## Quick start (Expo app)

```sh
cd mobile
npm install
npm start            # Expo dev server — scan the QR code with Expo Go, or press `w` for web
npm test             # Jest — 65 tests
npm run typecheck    # tsc --noEmit — must be 0 errors
npm run validate     # node ../scripts/validate-content.mjs — content counts + integrity
npm run export       # npx expo export — static export check (web)
```

CI (`.github/workflows/mobile.yml`) runs content validation, typecheck, Jest, and `expo export` on every push touching `mobile/`. Deploy is a documented manual step from a checkout — see the Deploy section in [`mobile/README.md`](mobile/README.md).

## Content

TOPIK I Level 1: 48 grammar points, 178 cloze cards, 109 lesson examples. TOPIK I Level 2: 51 grammar points, 153 cloze cards, 102 lesson examples. Both levels were audited and (for Level 1) reorganised into a learner-first curriculum on 2026-11-09; Level 2 was authored fresh in the same overhaul. Full details: `docs/planning/korean-curriculum-overhaul-2026-11-09.md`. The content is a curated draft, not independently reviewed by a Korean educator.

The canonical content source is the seed data in `prisma/seed-data/topik1-level1/` (plus `additions.ts`) and `prisma/seed-data/topik1-level2/`; `scripts/port-content.ts` (`bun scripts/port-content.ts`) regenerates `mobile/src/content/topik1-level1.json` and `topik1-level2.json` from it. Content is versioned (`CONTENT_VERSION` in `mobile/src/db/index.ts`, now `topik1-v6`): on a version bump the app upserts every content row, so new and corrected content reaches existing devices without touching review progress.

## Legacy SvelteKit app (frozen, not deployed)

The repo root holds the original SvelteKit 2 + Svelte 5 + Prisma 7 + PostgreSQL app (`src/`, `prisma/`, `package.json` at the root). It is **frozen** — no longer developed or deployed; the last work on it was the Level 1 seed-data fixes ported to the Expo app in build 15. Its detailed docs live under `docs/` (planning specs, devlog phase write-ups, LLM context). Do not start it expecting the live site: the live site is the Expo export in `mobile/`.

The SvelteKit code is kept for two reasons: its seed data (`prisma/seed-data/`) is the canonical content source (see above), and its `romanToHangul.ts` / `hangulToRoman.ts` / `levels.ts` were ported verbatim into the Expo app.
