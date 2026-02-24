# LLM Development Context

> This document provides architectural context for AI-assisted development on this project. It describes the current state, conventions, patterns, and known constraints so that an LLM can make informed decisions without re-discovering them.

---

## 1. Project Identity

- **Name:** Korean Cloze SRS
- **Purpose:** A spaced-repetition web app for learning Korean grammar through cloze-deletion (fill-in-the-blank) exercises.
- **Current state:** Fully functional with authentication. BetterAuth (email/password + Argon2id) handles sign-up, sign-in, and session management via `hooks.server.ts`. 11 grammar points (36 cloze cards) seeded, FSRS scheduling active via `POST /api/reviews`, review page at `/reviews` requires auth. Home page (`/`) shows grammar list with search + stats. Login page at `/login`. Phases 2–4 complete, Phase 5 (auth + routing) complete.

---

## 2. Technology Stack & Versions

| Component | Version | Notes |
|-----------|---------|-------|
| SvelteKit | 2.x | `adapter-auto`; pages use Svelte 5 runes (`$props`, `$state`, `$derived`) |
| Svelte | 5.51+ | Runes mode — no `export let`, use `$props()` instead |
| TypeScript | 5.9+ | Strict mode, `moduleResolution: bundler` |
| Prisma | 7.4.1 | Uses the **new** `prisma-client` generator (NOT `prisma-client-js`) |
| PostgreSQL | 16 | Runs in a Podman container (`hangul-postgres`) |
| Bun | 1.x | Package manager AND runtime — scripts use `bunx --bun` for Prisma CLI |
| Vite | 7.x | Dev server and build tool |
| Vitest | 4.x | Test runner (no tests written yet) |
| ts-fsrs | 5.2.3 | Spaced-repetition scheduling (FSRS algorithm) |
| better-auth | 1.4.19 | Authentication framework (email/password, Prisma adapter) |
| @node-rs/argon2 | 2.0.2 | Native Argon2id password hashing (plugged into BetterAuth) |
| hangul-js | 0.2.6 | Romanized text → Hangul conversion |

---

## 3. Prisma 7 — Critical Conventions

These are the most common mistakes an LLM will make if it assumes Prisma 5/6 patterns:

### 3.1 Generator

```prisma
generator client {
  provider = "prisma-client"            // NOT "prisma-client-js"
  output   = "../src/generated/prisma"  // REQUIRED — no node_modules magic
}
```

### 3.2 Datasource

The schema `datasource` block declares ONLY the provider. The URL lives in `prisma.config.ts`:

```prisma
datasource db {
  provider = "postgresql"
  // NO url here
}
```

### 3.3 Config file

`prisma.config.ts` at the project root (NOT inside `prisma/`):

```ts
import { defineConfig, env } from 'prisma/config';  // NOT "@prisma/internals"

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
    seed: 'bun prisma/seed.ts',   // seed config lives HERE, not in package.json
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

### 3.4 PrismaClient instantiation

Prisma 7 requires a **driver adapter**. You cannot do `new PrismaClient()` without one.

```ts
import { PrismaClient } from '../../generated/prisma/client';  // relative to generated output
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
```

### 3.5 Import paths

- PrismaClient: `from '../../generated/prisma/client'` (or appropriate relative path)
- Types for frontend: `from '../../generated/prisma/browser'` (no Node.js dependencies)
- Model types: `from '../../generated/prisma/models'`
- NEVER `from '@prisma/client'` — that's the deprecated path

### 3.6 Bun CLI

Always use `bunx --bun prisma ...` — without `--bun`, Prisma falls back to Node.js.

### 3.7 .env loading

Bun auto-loads `.env` files. No `import 'dotenv/config'` is needed in `prisma.config.ts` or seed scripts.

---

## 4. Database Schema Summary

Six models across three domains. All use `cuid()` IDs and `snake_case` column mapping.

### Auth domain (BetterAuth — fully wired)

- **User** (`users`) — `id`, `email` (unique), `name?`, `emailVerified` (bool), `image?`, timestamps
- **Session** (`sessions`) — `id`, `userId`, `token` (unique), `expiresAt`, `ipAddress?`, `userAgent?`, timestamps
- **Account** (`accounts`) — `id`, `userId`, `accountId`, `providerId`, `password?`, OAuth tokens, timestamps
  - Passwords stored here (not on User) with `providerId: "credential"`
- **Verification** (`verifications`) — `id`, `identifier`, `value`, `expiresAt`, timestamps

### Grammar domain (active)

- **GrammarPoint** (`grammar_points`)
  - `title` — spoiler-free display name (e.g. "Topic Particle")
  - `hint` — shortest label shown inside the blank (e.g. "topic particle")
  - `category`, `tense?`, `register?` — metadata for filtering
  - `description` — full explanation, may contain Hangul (revealed post-answer)
  - `level` — TOPIK level or ordering (default 1)
  - `tags` — string array (e.g. `["particle", "beginner", "TOPIK1"]`)
  - Has many `ClozeCard[]`

- **ClozeCard** (`cloze_cards`)
  - `fullSentence` — complete Korean sentence (no blanks)
  - `sentenceWithBlank` — sentence with `___` marking the gap
  - `vocabBaseForm` — dictionary form (e.g. "은/는")
  - `answer` — canonical correct answer (e.g. "는")
  - `alternateAnswers` — string array of other accepted forms
  - `englishHint` — `Json` field storing `{text: string, highlightType: 'none' | 'direct' | 'related'}[]`
  - Belongs to one `GrammarPoint`

### FSRS domain (active — scheduling via `POST /api/reviews`)

- **ReviewCard** (`review_cards`) — per-(User, ClozeCard) FSRS state
  - `stability`, `difficulty`, `reps`, `lapses`, `state` (0=New, 1=Learning, 2=Review, 3=Relearning), `due`, `lastReview?`
  - Unique constraint on `[userId, clozeCardId]`
- **ReviewLog** (`review_logs`) — append-only review events
  - `rating` (1=Again, 2=Hard, 3=Good, 4=Easy)
  - Post-review FSRS snapshot: `stability`, `difficulty`, `elapsedDays`, `scheduledDays`

---

## 5. File-by-File Guide

### `src/lib/server/db.ts`

PrismaClient singleton. Uses `globalThis` caching to survive SvelteKit HMR in dev. Creates a `PrismaPg` adapter with the `DATABASE_URL` env var.

### `src/lib/server/auth.ts`

BetterAuth server configuration. Uses `prismaAdapter(prisma, { provider: 'postgresql' })` for database access. Custom Argon2id password hashing via `hashPassword`/`verifyPassword` from `password.ts`. 7-day sessions, daily session age updates.

### `src/lib/auth-client.ts`

BetterAuth Svelte client. Exports `authClient` created via `createAuthClient()` from `better-auth/svelte`.

### `src/hooks.server.ts`

SvelteKit server hooks. Calls `auth.api.getSession()` to populate `event.locals.session` and `event.locals.user` on every request. Returns `svelteKitHandler()` which intercepts `/api/auth/*` routes for BetterAuth.

### `src/routes/+layout.server.ts`

Passes `session` and `user` from `event.locals` to all pages via layout data.

### `src/routes/+layout.svelte`

App shell with navigation bar. Shows brand link, Reviews link (if authenticated), user name, and logout button. Uses `authClient.signOut()` for logout.

### `src/routes/+page.server.ts`

Home page server load. Fetches all grammar points with card counts. For authenticated users, also loads reviews-due count and total-reviewed count.

### `src/routes/+page.svelte`

Home page. Shows grammar point list with search filter, quick stats (reviews due, total reviewed, grammar count), login CTA for unauthenticated users, "Start Reviews" button for authenticated users.

### `src/routes/login/+page.svelte`

Login/signup form. Toggles between login and signup modes. Uses `authClient.signIn.email()` / `authClient.signUp.email()`. Redirects to `/reviews` on success.

### `src/routes/login/+page.server.ts`

Redirects authenticated users away from login page to `/reviews`.

### `src/routes/reviews/+page.server.ts`

Loads the review queue. Redirects to `/login` if not authenticated. Queries up to 10 due `ReviewCard` records for `locals.user.id`, ordered by `due ASC`, including the associated `ClozeCard` and `GrammarPoint`. Returns `data.queue` — an array of shaped card objects with `reviewCardId`.

### `src/routes/reviews/+page.svelte`

The main review UI. Key patterns:
- Uses `$props()` to receive `data` from the server load
- `queueIndex` is `$state(0)`, `currentCard` is `$derived(data.queue[queueIndex])`
- Normalizes legacy `{ highlight: boolean }` to `{ highlightType }` via `normalizeHint()`
- `romanInputs` is `$state<string[]>([''])` — initialized with one empty string for the single blank
- `hangulValues` is `$derived` from `romanInputs` via `romanToHangul()`
- Answer checking: `currentCard.answers.includes(hangulValue)`
- Queue "empty" state shown when all cards are reviewed
- On "Next", sends `POST /api/reviews` with the review rating, then advances `queueIndex`

### `src/routes/api/reviews/+server.ts`

POST endpoint for FSRS review submission. Accepts `{ reviewCardId, rating }` (rating 1–4). Builds a `ts-fsrs` Card from the stored `ReviewCard` state, calls `fsrs.repeat()` to compute the next schedule, updates the `ReviewCard`, and appends a `ReviewLog` entry.

### `src/lib/server/password.ts`

Argon2id password hashing utility. Exports `hashPassword(password)` and `verifyPassword({ password, hash })` using `@node-rs/argon2` with Argon2id settings (64 MiB memory, 3 iterations, 4 lanes, 32-byte output). These functions are designed to plug directly into BetterAuth's `emailAndPassword.password` configuration.

### `src/lib/romanToHangul.ts`

Converts romanized text to Hangul using the `hangul-js` library. Input like `neun` → output `는`.

### `prisma/seed.ts`

Seeds the full database with:
- **1 test user** (`user_test` / `test@example.com` / `testpassword123`) with BetterAuth Account (Argon2id-hashed password in Account table)
- **11 grammar points** (all Part 3 Korean particles: 은/는, 이/가, 을/를, 에, 에서, 에서~까지, 부터~까지, 도, 만, 하고/와/과, (이)랑)
- **36 cloze cards** (3–4 per grammar point) with `highlightType` enum
- **5 ReviewCards** for `user_test` (due now, state=New)

Uses stable IDs (`gp_topic`, `cc_topic_01`, etc.) for idempotent re-runs. All `englishHint` data uses the new `highlightType: 'none' | 'direct' | 'related'` format.

---

## 6. Svelte 5 Patterns & Gotchas

This project uses Svelte 5 **runes** exclusively. Key rules:

1. **No `export let`** — use `let { data } = $props()` for page data
2. **Reactivity through `$state` and `$derived`** — no `$:` reactive statements
3. **Don't capture reactive values in `const`** — Svelte 5 warns if you write `const card = data.card` because it captures the initial value. Use `$derived()` for derived values, or access `data.card.*` directly in templates.
4. **`$state` initializers run once** — `$state([''])` sets the initial value; to reset, reassign the variable (e.g. `romanInputs = ['']`)
5. **Event handlers** — use `onclick={fn}` (not `on:click={fn}`)

---

## 7. Data Flow

```
[PostgreSQL] → [Prisma Client + PrismaPg adapter]
                        ↓
            [reviews/+page.server.ts load()]
            Queries ReviewCard (due ≤ now, userId) → includes ClozeCard + GrammarPoint
                        ↓ (serialized JSON: data.queue)
            [reviews/+page.svelte $props()]
                        ↓
            [Svelte 5 reactive UI: queueIndex, currentCard]
                        ↓ (user types romanized text)
            [romanToHangul()] → Hangul in blank
                        ↓ (submit)
            [Client-side answer check against currentCard.answers]
                        ↓ (next card)
            [POST /api/reviews { reviewCardId, rating }]
                        ↓
            [ts-fsrs: fsrs.repeat(card, now)[rating]]
                        ↓
            [Update ReviewCard + append ReviewLog in DB]
```

---

## 8. Conventions

- **Column mapping:** TypeScript uses camelCase (`grammarPointId`); Postgres uses snake_case (`grammar_point_id`) via `@map`/`@@map`
- **Table mapping:** Model `GrammarPoint` → table `grammar_points` via `@@map`
- **IDs:** String CUIDs everywhere (`@default(cuid())`)
- **Timestamps:** `createdAt`/`updatedAt` mapped to `created_at`/`updated_at`
- **CSS:** Global custom properties in `app.css`, component styles are scoped
- **No component library** — all UI is hand-built HTML/CSS

---

## 9. Known Issues & Limitations

1. **Client-side checking only** — answers are shipped to the client; a determined user could inspect them
2. **Single blank assumption** — `romanInputs` is hardcoded to `['']`; multi-blank cards would need the initializer to match `blankCount`
3. **No error handling on queue empty** — if the database has no due cards, the queue shows an empty state but UX could be improved
4. **Reviews API not auth-gated** — `POST /api/reviews` does not yet verify the session; it trusts the `reviewCardId` payload. Should add auth check.

---

## 10. Planned Next Steps (Priority Order)

1. **End-to-end testing** — Full flow: login → review queue → answer → FSRS scheduling
2. **Auth-gate the reviews API** — Add session verification to `POST /api/reviews`
3. **Server-side answer verification** — POST to verify answer, preventing client inspection
4. **Close answers (Phase 3.3)** — Character-level diff for near-miss feedback
5. **AI card generation** — script or API route that uses an LLM to generate GrammarPoint + ClozeCard records
6. **Card browser / admin** — CRUD UI for managing cards outside of the review flow

---

## 11. How to Add a New Cloze Card

Add to `prisma/seed.ts`:

```ts
const myGrammar = await prisma.grammarPoint.upsert({
  where: { id: 'gp_my_grammar' },
  update: {},
  create: {
    id: 'gp_my_grammar',
    title: 'My Grammar Point',      // no Hangul — spoiler-free
    category: 'particle',            // or 'verb ending', 'conjunction', etc.
    tense: null,                     // 'present' | 'past' | 'future' | null
    register: null,                  // 'polite' | 'formal' | 'informal' | null
    hint: 'short label',             // shown inside the blank
    description: 'Full explanation with 한글 allowed.',
    level: 1,
    tags: ['tag1', 'tag2'],
  },
});

await prisma.clozeCard.upsert({
  where: { id: 'cc_my_card_01' },
  update: {},
  create: {
    id: 'cc_my_card_01',
    grammarPointId: myGrammar.id,
    fullSentence: '완성된 문장.',
    sentenceWithBlank: '___이 있는 문장.',
    vocabBaseForm: '사전형',
    answer: '정답',
    alternateAnswers: ['대체답'],
    englishHint: [
      { text: 'The ', highlightType: 'none' },
      { text: 'answer', highlightType: 'direct' },
      { text: ' is here.', highlightType: 'none' },
    ],
  },
});
```

Then run `bun run db:seed`.

**Note:** `englishHint` uses `highlightType: 'none' | 'direct' | 'related'` (NOT the old `highlight: boolean` format).

---

## 12. Environment & Infrastructure

- **Container runtime:** Podman (rootless) with `podman-compose`
- **Database volume:** Named volume `korean-cloze-srs_pgdata` persists data across container restarts
- **Port:** Postgres on `localhost:5432` (configurable via `POSTGRES_PORT` in `.env`)
- **Auth environment:** `BETTER_AUTH_SECRET` (signing key) and `BETTER_AUTH_URL` (`http://localhost:5173`) in `.env`
- **No Docker required** — the project uses Podman but `docker compose` works as a drop-in replacement if you alias the commands
