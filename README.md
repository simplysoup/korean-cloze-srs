# Korean Cloze SRS

A spaced-repetition web app for learning Korean grammar through cloze-deletion (fill-in-the-blank) exercises. Type romanized Korean, see it convert to Hangul in real time, and review with FSRS-scheduled spacing.

**Stack:** SvelteKit 2 · Svelte 5 · TypeScript · Prisma 7 · PostgreSQL 16 · BetterAuth · Bun

---

## Features

- **Authentication** — email/password sign-up and sign-in via BetterAuth with Argon2id hashing, rate limiting on auth endpoints
- **Centralized auth guard** — all routes protected via `hooks.server.ts`; API routes get JSON 401, pages redirect to `/login`
- **Dashboard** — Bunpro-inspired `/dashboard` with learn/review action cards, Chart.js review history (hourly/daily toggle), SRS level distribution, profile sidebar with XP bar and 7-day streak calendar, TOPIK progress bars, and quick stats
- **Study streaks** — `UserStreak` model tracks current/longest streak; updated on every review submission
- **Deck system** — TOPIK-levelled grammar decks; users enroll and progress through lessons; deck detail pages at `/decks/[slug]` show grammar points grouped by lesson
- **Review queue** — loads up to 10 due cards per session from the FSRS scheduler, presented one at a time
- **Cloze cards** — Korean sentences with blanks, grammar hints, and English translations with syntax highlighting (direct + related)
- **Romanization → Hangul** — type `neun` and see `는` appear live in the blank (via `hangul-js`)
- **FSRS spaced repetition** — `POST /api/reviews` accepts a rating (1–4), computes the next schedule via `ts-fsrs`, updates card state and logs the review
- **Server-side answer verification** — `POST /api/reviews/check` verifies answers server-side before FSRS rating is persisted
- **11 grammar points** — all Part 3 Korean particles (은/는, 이/가, 을/를, 에, 에서, 에서~까지, 부터~까지, 도, 만, 하고/와/과, (이)랑) with 36 cloze cards
- **Interaction states** — incorrect answer shake + undo + show answer, correct answer green highlight + alt cycling, reveal-info toggle with auto-fail penalty
- **Error handling** — network error retry banners, next-review countdown on empty queue, login form validation
- **User levelling** — XP system (10 XP per review, level N needs N×100 XP) displayed in the header
- **Bunpro-inspired header** — dark sticky nav bar with Review badge, Content/Practice dropdowns, user profile chip with XP progress bar
- **Landing page** — unauthenticated users see available decks; authenticated users are redirected to `/dashboard`

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
BETTER_AUTH_SECRET="change-me-to-a-random-secret"
BETTER_AUTH_URL="http://localhost:5173"
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
bun run db:migrate     # creates tables (users, sessions, accounts, verifications, grammar_points, cloze_cards, review_cards, review_logs)
```

### 5. Seed the database

```sh
bun run db:seed        # inserts 11 grammar points, 36 cloze cards, test user, and 5 review cards
```

### 6. Start developing

```sh
./start.sh             # http://localhost:5173
```

`start.sh` kills any existing process on port 5173, ensures `hangul-postgres` is running, waits for Postgres to be ready, then starts the Vite dev server. To stop it, press `Ctrl+C`. Alternatively, run `bun run dev` directly if the database is already up.

Sign in with the seeded test account:

| Field | Value |
|-------|-------|
| Email | `test@example.com` |
| Password | `testpassword123` |

Then navigate to `/reviews` to start the review queue. You'll see 5 due cards. Type the romanized particle (e.g. `neun` → `는`) and click **Check**.

---

## All Scripts

| Script | Command | Description |
|--------|---------|-------------|
| *(shell)* | `./start.sh` | **Recommended:** kill port 5173, ensure DB running, start dev server |
| `dev` | `vite dev` | Start dev server with HMR (DB must already be running) |
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
├── start.sh                      # Bootstrap script: kill stale server, ensure DB, start dev
├── prisma.config.ts              # Prisma 7 CLI config (schema path, seed command, DB URL)
├── docker-compose.yml            # Postgres 16 container definition
├── .env.example                  # Environment variable template (committed)
├── .env                          # Local env values (gitignored)
├── package.json
├── prisma/
│   ├── schema.prisma             # Data models (10 tables)
│   ├── seed.ts                   # Seed script (11 grammar points, 36 cards, test user, 5 review cards)
│   └── migrations/               # Prisma Migrate history
├── src/
│   ├── hooks.server.ts               # Auth guard, session resolution, BetterAuth handler, Cache-Control
│   ├── generated/prisma/             # Auto-generated Prisma Client (gitignored)
│   ├── lib/
│   │   ├── index.ts                  # Library barrel export
│   │   ├── romanToHangul.ts          # Romanized text → Hangul conversion
│   │   ├── levels.ts                 # XP / user level calculation
│   │   ├── auth-client.ts            # BetterAuth client (sign-in/up/out helpers)
│   │   ├── assets/
│   │   │   └── favicon.svg           # Favicon asset
│   │   ├── components/
│   │   │   ├── ReviewHistoryChart.svelte  # Chart.js stacked bar chart (hourly/daily toggle)
│   │   │   ├── ProfileSidebar.svelte      # User info, XP, streak calendar, TOPIK progress
│   │   │   └── SrsDistribution.svelte     # SRS level distribution cards
│   │   └── server/
│   │       ├── db.ts                 # PrismaClient singleton (with PrismaPg adapter)
│   │       ├── auth.ts               # BetterAuth server config (Prisma adapter, rate limiting)
│   │       └── password.ts           # Argon2id hash/verify for BetterAuth
│   ├── routes/
│   │   ├── +layout.server.ts         # Layout data: session, user, reviewsDue, levelInfo, enrolledDeckSlugs
│   │   ├── +layout.svelte            # App shell with Bunpro-inspired sticky header
│   │   ├── +page.server.ts           # Landing page (unauth only — redirects auth users to /dashboard)
│   │   ├── +page.svelte              # Landing page UI: available decks + login CTA
│   │   ├── dashboard/
│   │   │   ├── +page.server.ts       # Dashboard data: decks, streaks, SRS distribution, TOPIK progress
│   │   │   └── +page.svelte          # Dashboard grid layout
│   │   ├── decks/[slug]/
│   │   │   ├── +page.server.ts       # Deck detail data: grammar points by lesson, per-point status
│   │   │   └── +page.svelte          # Deck detail UI: lesson-grouped grammar points
│   │   ├── login/
│   │   │   ├── +page.server.ts       # Redirect authenticated users to /dashboard
│   │   │   └── +page.svelte          # Login / sign-up form with validation
│   │   ├── reviews/
│   │   │   ├── +page.server.ts       # Loads review queue (up to 10 due cards) + nextReviewAt
│   │   │   ├── +page.svelte          # Review UI with queue, answer checking, error recovery
│   │   │   └── roman-to-hangul/
│   │   │       └── +page.svelte      # Standalone romanization tool
│   │   └── api/
│   │       ├── reviews/
│   │       │   ├── +server.ts        # POST: submit FSRS review rating + streak update
│   │       │   └── check/
│   │       │       └── +server.ts    # POST: server-side answer verification
│   │       ├── decks/[deckId]/enroll/
│   │       │   └── +server.ts        # POST: enroll user in a deck
│   │       └── stats/
│   │           └── review-history/
│   │               └── +server.ts    # GET: review history for chart (hourly/daily)
│   ├── app.css                       # Global styles (CSS custom properties + dashboard styles)
│   ├── app.html                      # HTML shell
│   └── app.d.ts                      # SvelteKit type augmentations
├── docs/
│   ├── planning/                     # Roadmap & future phase specs
│   │   ├── master-plan.md
│   │   ├── phase-8-dashboard.md
│   │   ├── phase-9-grammar-pages.md
│   │   ├── phase-10-learn-review-flow.md
│   │   └── phase-11-polish-content.md
│   ├── devlog/                       # Completed phase write-ups
│   │   ├── phase-2-ui-polish.md
│   │   ├── phase-3-interactions.md
│   │   ├── phase-4-database.md
│   │   ├── phase-5-auth-routing.md
│   │   ├── phase-5.1-header-levels.md
│   │   ├── phase-6-hardening.md
│   │   ├── phase-7-deck-system.md
│   │   └── phase-8-dashboard.md
│   └── context/                      # Reference docs for AI-assisted dev
│       ├── LLM_CONTEXT.md
│       ├── DB_PLAN.md
│       └── PRISMA7_NOTES.md
└── static/
    └── robots.txt
```

## Database Schema

Eight tables across three domains:

**Auth** (BetterAuth — active)
- `users` — email, name, image, timestamps (managed by BetterAuth)
- `sessions` — token-based sessions linked to users
- `accounts` — OAuth/credential provider records
- `verifications` — email verification tokens

**Grammar**
- `grammar_points` — title, category, tense, register, hint (spoiler-free), description (full), level, tags
- `cloze_cards` — sentence with blank, answer(s), english hint (JSON), linked to a grammar point

**FSRS** (active — `POST /api/reviews`)
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
| SRS | ts-fsrs |
| Auth | BetterAuth 1.4 + @node-rs/argon2 |
| Utilities | hangul-js |

## Roadmap

- [x] **UI polish** — remove bounding boxes, center layout, syntax highlighting (Phase 2)
- [x] **Interaction states** — incorrect/correct answer flows, undo, reveal info (Phase 3)
- [x] **FSRS integration** — `ts-fsrs` scheduling via `POST /api/reviews` (Phase 3)
- [x] **Review queue** — loads due cards per user, queue navigation (Phase 3)
- [x] **Seed data** — 11 grammar points, 36 cloze cards, test user, 5 review cards (Phase 4)
- [x] **Password hashing** — Argon2id via `@node-rs/argon2` (Phase 4)
- [x] **Authentication** — BetterAuth with email/password + session management (Phase 5)
- [x] **Routing restructure** — home page, login page, auth API routes (Phase 5)
- [x] **Header redesign** — Bunpro-inspired sticky header, user levelling, centralized auth guard (Phase 5.1)
- [x] **Hardening** — auth-gated API, server-side answer verification, error handling, rate limiting (Phase 6)
- [ ] **Deck system** — Deck model, TOPIK Level 1 Grammar deck, deck-based navigation (Phase 7)
- [ ] **Dashboard** — Bunpro-inspired dashboard with review chart, deck progress, streak (Phase 8)
- [ ] **Grammar learning pages** — per-grammar-point pages with Details/Examples tabs (Phase 9)
- [ ] **Learn flow** — lesson queue, deck-scoped reviews, learn-then-review pipeline (Phase 10)
- [ ] **Polish & content** — full TOPIK 1 content, close-answer detection, self-rating, accessibility (Phase 11)

## Documentation

| Path | Content |
|------|---------|
| [docs/planning/master-plan.md](docs/planning/master-plan.md) | Executive summary, phase status, architecture overview |
| [docs/planning/](docs/planning/) | Future phase specs (7–11) |
| [docs/devlog/](docs/devlog/) | Completed phase write-ups (2–6) |
| [docs/context/](docs/context/) | LLM context, DB plan, Prisma 7 notes |
