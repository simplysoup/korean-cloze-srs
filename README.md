# Korean Cloze SRS

A spaced-repetition app for learning Korean grammar through cloze (fill-in-the-blank) exercises. Type romanized Korean, see it convert to Hangul in real time, and check your answer against the database.

**Stack:** SvelteKit 2 · Svelte 5 · TypeScript · Prisma 7 · PostgreSQL 16 · Bun

---

## Features

- **Cloze cards from the database** — each card shows a Korean sentence with a blank, a grammar hint, and an English translation with the relevant word highlighted
- **Romanization → Hangul** — type `neun` and see `는` appear live in the blank (via `hangul-js`)
- **Grammar metadata** — title, category, tense, register, and a spoiler-free hint shown during review; full description revealed after answering
- **Prisma 7 + PostgreSQL** — cards and grammar points stored in Postgres, queried via Prisma with the `@prisma/adapter-pg` driver adapter
- **FSRS-ready schema** — `ReviewCard` and `ReviewLog` tables are in place for future spaced-repetition scheduling

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Bun** | 1.x | Runtime and package manager (`curl -fsSL https://bun.sh/install \| bash`) |
| **Podman** (or Docker) | 4.x+ | Runs the Postgres container |
| **podman-compose** | 1.x | Orchestrates `docker-compose.yml` (`pip install podman-compose` or use `docker compose` instead) |

## Quick Start

### 1. Clone and install

```sh
git clone <repo-url> korean-cloze-srs
cd korean-cloze-srs
bun install
```

### 2. Configure environment

```sh
cp .env.example .env
# Edit .env if you want to change the default password/port
```

The defaults in `.env.example` work out of the box for local development:

```
POSTGRES_USER=hangul
POSTGRES_PASSWORD=changeme
POSTGRES_DB=hangul_dev
POSTGRES_PORT=5432
DATABASE_URL="postgresql://hangul:changeme@localhost:5432/hangul_dev?schema=public"
```

### 3. Start the database

```sh
bun run db:up          # starts hangul-postgres container via podman-compose
```

Verify it's running:

```sh
podman ps              # should show hangul-postgres on port 5432
```

### 4. Generate Prisma Client and run migrations

```sh
bun run db:generate    # generates typed client into src/generated/prisma/
bun run db:migrate     # creates tables (users, sessions, grammar_points, cloze_cards, review_cards, review_logs)
```

### 5. Seed the database

```sh
bun run db:seed        # inserts the Topic Particle grammar point + example cloze card
```

### 6. Start developing

```sh
bun run dev            # http://localhost:5173
```

You should see the cloze card loaded from the database. Type `neun` in the input to fill `는` into the blank, then click **Check**.

---

## All Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite dev` | Start dev server with HMR |
| `build` | `vite build` | Production build |
| `preview` | `vite preview` | Preview production build |
| `check` | `svelte-check` | TypeScript + Svelte validation |
| `test` | `vitest run` | Run unit tests |
| `db:up` | `podman-compose up -d` | Start Postgres container |
| `db:down` | `podman-compose down` | Stop Postgres container |
| `db:generate` | `bunx --bun prisma generate` | Generate Prisma Client |
| `db:migrate` | `bunx --bun prisma migrate dev` | Create/apply migrations |
| `db:seed` | `bunx --bun prisma db seed` | Run seed script |
| `db:studio` | `bunx --bun prisma studio` | Open Prisma Studio data browser |
| `db:reset` | `bunx --bun prisma migrate reset` | Drop all data + re-migrate + re-seed |

> **Note:** All Prisma CLI commands use `bunx --bun` to ensure Bun runtime. Without `--bun`, Prisma falls back to Node.js.

---

## Project Structure

```
korean-cloze-srs/
├── prisma.config.ts              # Prisma 7 CLI config (schema path, seed command, DB URL)
├── docker-compose.yml            # Postgres 16 container definition
├── .env.example                  # Environment variable template (committed)
├── .env                          # Local env values (gitignored)
├── package.json
├── prisma/
│   ├── schema.prisma             # Data models (6 tables)
│   ├── seed.ts                   # Seed script (Topic Particle + cloze card)
│   └── migrations/               # Prisma Migrate history
├── src/
│   ├── generated/prisma/         # Auto-generated Prisma Client (gitignored)
│   ├── lib/
│   │   ├── index.ts              # Library barrel export
│   │   ├── romanToHangul.ts      # Romanized text → Hangul conversion
│   │   └── server/
│   │       └── db.ts             # PrismaClient singleton (with PrismaPg adapter)
│   ├── routes/
│   │   ├── +layout.svelte        # App shell + romanization reference sidebar
│   │   ├── +page.server.ts       # Server load: fetches cloze card from DB
│   │   ├── +page.svelte          # Cloze card UI (consumes server data)
│   │   └── roman-to-hangul/
│   │       └── +page.svelte      # Standalone romanization tool
│   ├── app.css                   # Global styles (CSS custom properties)
│   ├── app.html                  # HTML shell
│   └── app.d.ts                  # SvelteKit type augmentations
├── docs/
│   ├── DB_PLAN.md                # Full database implementation plan
│   ├── PRISMA7_NOTES.md          # Prisma 7 reference / migration notes
│   └── LLM_CONTEXT.md           # Architecture context for AI-assisted development
└── static/
    └── robots.txt
```

## Database Schema

Six tables across three domains:

**Auth** (future use)
- `users` — email, name, timestamps
- `sessions` — token-based sessions linked to users

**Grammar**
- `grammar_points` — title, category, tense, register, hint (spoiler-free), description (full), level, tags
- `cloze_cards` — sentence with blank, answer(s), english hint (JSON), linked to a grammar point

**FSRS** (future spaced-repetition)
- `review_cards` — per-user card state (stability, difficulty, reps, lapses, due date)
- `review_logs` — append-only review event history with FSRS snapshots

All column names use `snake_case` via `@@map`/`@map`. See [prisma/schema.prisma](prisma/schema.prisma) for the full schema.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit 2, Svelte 5 |
| Language | TypeScript (strict) |
| Database | PostgreSQL 16 (via Podman) |
| ORM | Prisma 7.4 with `prisma-client` generator + `@prisma/adapter-pg` |
| Build | Vite 7 |
| Runtime | Bun |
| Testing | Vitest |
| Utilities | hangul-js |

## Roadmap

- [ ] **FSRS integration** — `ts-fsrs` for spaced-repetition scheduling via `POST /api/review`
- [ ] **Authentication** — session-based auth (User/Session tables already in schema)
- [ ] **Card selection** — replace `findFirstOrThrow` with FSRS-based due-card query
- [ ] **AI card generation** — LLM-powered grammar point + cloze card creation
- [ ] **Multi-blank cards** — sentences with more than one blank
- [ ] **Card browser** — admin UI to view/edit all cards and grammar points
