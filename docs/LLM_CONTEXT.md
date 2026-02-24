# LLM Development Context

> This document provides architectural context for AI-assisted development on this project. It describes the current state, conventions, patterns, and known constraints so that an LLM can make informed decisions without re-discovering them.

---

## 1. Project Identity

- **Name:** Korean Cloze SRS
- **Purpose:** A spaced-repetition web app for learning Korean grammar through cloze-deletion (fill-in-the-blank) exercises.
- **Current state:** MVP — single seeded card loads from the database and renders correctly. Auth, FSRS scheduling, card creation, and multi-card flows are not yet implemented.

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

### Auth domain (not yet wired up)

- **User** (`users`) — `id`, `email` (unique), `name?`, timestamps
- **Session** (`sessions`) — `id`, `userId`, `token` (unique), `expiresAt`, `createdAt`

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
  - `englishHint` — `Json` field storing `{text: string, highlight: boolean}[]`
  - Belongs to one `GrammarPoint`

### FSRS domain (schema exists, not yet wired up)

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

### `src/routes/+page.server.ts`

Server load function. Currently fetches the first `ClozeCard` (with its `GrammarPoint`) and reshapes it for the frontend. The `answers` array is constructed as `[card.answer, ...card.alternateAnswers]`. The `englishHint` JSON is cast to the typed array.

### `src/routes/+page.svelte`

The main cloze card UI. Key patterns:
- Uses `$props()` to receive `data` from the server load
- All references to card data go through `data.card.*` (NOT a local variable) to satisfy Svelte 5 reactivity rules
- `romanInputs` is `$state<string[]>([''])` — initialized with one empty string for the single blank
- `hangulValues` is `$derived` from `romanInputs` via `romanToHangul()`
- Answer checking: `data.card.answers.includes(hangulValue)`
- The grammar `hint` field appears inside the blank when the input is empty
- The grammar `description` is shown in the grammar card header (currently always visible — future: hide until answer)

### `src/lib/romanToHangul.ts`

Converts romanized text to Hangul using the `hangul-js` library. Input like `neun` → output `는`.

### `prisma/seed.ts`

Upserts one `GrammarPoint` ("Topic Particle") and one `ClozeCard` (저___한국어를 공부해요). Uses stable IDs (`gp_topic_particle`, `cc_topic_01`) for idempotent re-runs.

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
            [+page.server.ts load()]
                        ↓ (serialized JSON)
            [+page.svelte $props()]
                        ↓
            [Svelte 5 reactive UI]
                        ↓ (user types romanized text)
            [romanToHangul()] → Hangul in blank
                        ↓ (submit)
            [Client-side answer check against data.card.answers]
```

Currently there is no server-side answer verification or POST endpoint. The check is purely client-side.

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

1. **Single card only** — `findFirstOrThrow` returns the first card; no card rotation or selection logic yet
2. **No auth** — User/Session tables exist but have no registration, login, or session management
3. **No FSRS** — ReviewCard/ReviewLog tables exist but `ts-fsrs` is not installed and no review endpoint exists
4. **Client-side checking only** — answers are shipped to the client; a determined user could inspect them
5. **Grammar description always visible** — the `description` field should ideally be hidden until the user answers correctly
6. **Single blank assumption** — `romanInputs` is hardcoded to `['']`; multi-blank cards would need the initializer to match `blankCount`
7. **No error handling** — if the database has no cards, `findFirstOrThrow` will 500

---

## 10. Planned Next Steps (Priority Order)

1. **FSRS integration** — Install `ts-fsrs`, create `POST /api/review` that accepts `{ cardId, rating }`, computes next schedule, upserts ReviewCard, appends ReviewLog
2. **Card selection** — Replace `findFirstOrThrow` with a query that selects the next due card for the user
3. **Auth** — Session-based authentication using the existing User/Session tables
4. **Hide description until answered** — only reveal `grammar.description` after correct answer or failure
5. **Server-side answer verification** — POST to verify answer, preventing client inspection
6. **Seed more cards** — expand seed.ts with additional grammar points and cloze cards
7. **AI card generation** — script or API route that uses an LLM to generate GrammarPoint + ClozeCard records
8. **Card browser / admin** — CRUD UI for managing cards outside of the review flow

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
      { text: 'The ', highlight: false },
      { text: 'answer', highlight: true },
      { text: ' is here.', highlight: false },
    ],
  },
});
```

Then run `bun run db:seed`.

---

## 12. Environment & Infrastructure

- **Container runtime:** Podman (rootless) with `podman-compose`
- **Database volume:** Named volume `korean-cloze-srs_pgdata` persists data across container restarts
- **Port:** Postgres on `localhost:5432` (configurable via `POSTGRES_PORT` in `.env`)
- **No Docker required** — the project uses Podman but `docker compose` works as a drop-in replacement if you alias the commands
