# DB_PLAN.md — PostgreSQL + Prisma 7 Implementation Plan

> **Stack**: SvelteKit 2 · Svelte 5 · Prisma 7.4 · PostgreSQL 16 · Podman · Bun
> **OS**: Windows (single-system dev with Podman)
> **Runtime**: Bun (used for scripts and dev server)
> **Workspace root**: `c:\Users\nickb\OneDrive\Documents\svelte-test`

---

## 0. Current State

### Project structure (relevant)

```
svelte-test/
├── package.json            ← prisma 7.4.1 already in dependencies
├── tsconfig.json           ← strict, moduleResolution: bundler
├── svelte.config.js        ← adapter-auto
├── .gitignore              ← already ignores .env / .env.* (but allows .env.example)
├── src/
│   ├── app.css             ← global styles (CSS custom properties)
│   ├── app.html
│   ├── lib/
│   │   ├── index.ts
│   │   └── romanToHangul.ts
│   └── routes/
│       ├── +layout.svelte  ← imports app.css, renders romanization guide
│       ├── +page.svelte    ← cloze card (currently hardcoded)
│       └── roman-to-hangul/
│           └── +page.svelte
```

### Hardcoded card shape (src/routes/+page.svelte)

The cloze page currently defines these TypeScript interfaces and a static card:

```ts
interface EnglishHintPart {
  text: string;
  highlight: boolean;
}

interface GrammarPoint {
  title: string;
  // Shown during review — no hangul, no romanised answer, no spoilers
  hint: string;               // e.g. "topic particle" — shown inside the blank
  category: string;           // e.g. "particle"
  tense: string | null;       // e.g. "present" | "past" | null
  register: string | null;    // e.g. "polite" | "formal" | "informal" | null
  // Only revealed after answering correctly / on failure / in DB browser
  description: string;        // full explanation, may include hangul
}

interface ClozeCard {
  fullSentence:      string;   // "저는 한국어를 공부해요." — complete, no blank markers
  sentenceWithBlank: string;   // "저___ 한국어를 공부해요." — ___ marks the blank
  vocabBaseForm:     string;   // dictionary / base form, e.g. "은/는"
  answers:           string[]; // all accepted forms, primary first: ["는", …]
  grammar: GrammarPoint;
  englishHint: EnglishHintPart[];
}

const card: ClozeCard = {
  sentence: '저___한국어를 공부해요.',
  answers: [['는']],
  grammar: {
    title: '은/는 — Topic Particle (주제 조사)',
    description: 'Attaches directly after a noun to mark it as the sentence topic. Use 은 after a noun ending in a consonant (받침), 는 after a noun ending in a vowel. The topic particle sets contrast or emphasis relative to other things.',
    hint: 'topic particle',
  },
  englishHint: [
    { text: 'I', highlight: true },
    { text: ' study Korean.', highlight: false },
  ],
};
```

This hardcoded card must be replaced by a Prisma query.

---

## 1. Files to Create

### 1.1 `.env.example` (committed)

```env
# PostgreSQL (Podman container)
POSTGRES_USER=hangul
POSTGRES_PASSWORD=changeme
POSTGRES_DB=hangul_dev
POSTGRES_PORT=5432

# Prisma
DATABASE_URL="postgresql://hangul:changeme@localhost:5432/hangul_dev?schema=public"
```

### 1.2 `.env` (local only — already gitignored)

Same as `.env.example` but with real credentials.

### 1.3 `docker-compose.yml` (project root)

```yaml
services:
  db:
    image: docker.io/library/postgres:16-alpine
    container_name: hangul-postgres
    restart: unless-stopped
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**Notes**:
- Uses `podman-compose up -d` to start.
- Named volume `pgdata` persists across container restarts.
- Port is configurable via `.env`.

### 1.4 `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ══════════════════════════════════════════════════════════════════════════════
// Auth domain
// ══════════════════════════════════════════════════════════════════════════════

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  sessions    Session[]
  reviewCards ReviewCard[]
  reviewLogs  ReviewLog[]

  @@map("users")
}

model Session {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

// ══════════════════════════════════════════════════════════════════════════════
// Grammar domain
// ══════════════════════════════════════════════════════════════════════════════

model GrammarPoint {
  id          String   @id @default(cuid())
  title       String              // "Topic Particle" — no hangul, spoiler-free
  category    String              // "particle", "verb ending", "conjunction", …
  tense       String?             // "present" | "past" | "future" | null
  register    String?             // "polite" | "formal" | "informal" | null
  hint        String              // in-blank label shown during review: "topic particle"
  // Full explanation shown only after answering or outside review
  description String              // may include hangul and full grammatical detail
  level       Int      @default(1)  // TOPIK level or custom ordering
  tags        String[]            // e.g. ["particle", "beginner", "TOPIK1"]
  createdAt   DateTime @default(now()) @map("created_at")

  clozeCards ClozeCard[]

  @@map("grammar_points")
}

model ClozeCard {
  id                String   @id @default(cuid())
  grammarPointId    String   @map("grammar_point_id")
  fullSentence      String              // "저는 한국어를 공부해요." — no blank markers
  sentenceWithBlank String   @map("sentence_with_blank")  // "저___ 한국어를 공부해요."
  vocabBaseForm     String   @map("vocab_base_form")       // "은/는" — dictionary/base form
  answer            String              // canonical accepted answer: "는"
  alternateAnswers  String[] @map("alternate_answers")     // other accepted forms e.g. ["는요"]
  englishHint       Json                // [{text:"I",highlight:true},{text:" study Korean.",highlight:false}]
  createdAt         DateTime @default(now()) @map("created_at")

  grammarPoint GrammarPoint @relation(fields: [grammarPointId], references: [id], onDelete: Cascade)
  reviewCards  ReviewCard[]

  @@map("cloze_cards")
}

// ══════════════════════════════════════════════════════════════════════════════
// FSRS domain (spaced repetition)
// ══════════════════════════════════════════════════════════════════════════════

/// One ReviewCard per (User, ClozeCard) pair — tracks FSRS state.
model ReviewCard {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  clozeCardId String   @map("cloze_card_id")

  // FSRS parameters
  stability   Float    @default(0)
  difficulty  Float    @default(0)
  reps        Int      @default(0)
  lapses      Int      @default(0)
  state       Int      @default(0)   // 0=New, 1=Learning, 2=Review, 3=Relearning
  due         DateTime @default(now())
  lastReview  DateTime? @map("last_review")

  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt      @map("updated_at")

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  clozeCard ClozeCard @relation(fields: [clozeCardId], references: [id], onDelete: Cascade)
  logs      ReviewLog[]

  @@unique([userId, clozeCardId])
  @@map("review_cards")
}

/// Individual review events — append-only log.
model ReviewLog {
  id           String   @id @default(cuid())
  reviewCardId String   @map("review_card_id")
  userId       String   @map("user_id")
  rating       Int                    // 1=Again, 2=Hard, 3=Good, 4=Easy
  reviewedAt   DateTime @default(now()) @map("reviewed_at")

  // Snapshot of FSRS state AFTER this review
  stability    Float
  difficulty   Float
  elapsedDays  Float    @map("elapsed_days")
  scheduledDays Float   @map("scheduled_days")

  reviewCard ReviewCard @relation(fields: [reviewCardId], references: [id], onDelete: Cascade)
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("review_logs")
}
```

**Design decisions**:
- `GrammarPoint` splits the description into two layers: spoiler-free metadata (`title`, `category`, `tense`, `register`, `hint`) shown at review time, and `description` (which may contain hangul) revealed only after answering or outside reviews. The `hint` field is the shortest possible label (e.g. `"topic particle"`) placed inside the blank itself; the other fields let the UI assemble a clean preview like *"topic particle · particle · polite · present"* without leaking the answer.
- `ClozeCard` stores example sentences. The `grammarPointId` foreign key links each example to exactly one grammar point; a single grammar point has many example cards (`GrammarPoint → ClozeCard[]`).
- `englishHint` is `Json` — matches the `EnglishHintPart[]` shape, avoids a join for what is always fetched as a unit.
- `ClozeCard` stores `answer` (canonical) and `alternateAnswers` directly — no join needed. A separate blanks table would only be warranted for multi-blank cards, which are not required here.
- `ClozeCard` also stores `fullSentence` (complete, no markers), `sentenceWithBlank` (`___` marking the gap), and `vocabBaseForm` (dictionary form, e.g. `은/는`) for display and future indexing.
- `ReviewCard` FSRS fields follow the ts-fsrs library's `Card` interface (stability, difficulty, reps, lapses, state, due, lastReview).
- `ReviewLog` is append-only and stores a post-review FSRS snapshot for analytics/debugging.
- All tables map to snake_case via `@@map` / `@map`.

### 1.5 `prisma/seed.ts`

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ── Grammar Point: Topic Particle ──────────────────────────────────────
  const topicParticle = await prisma.grammarPoint.upsert({
    where: { id: 'gp_topic_particle' },
    update: {},
    create: {
      id: 'gp_topic_particle',
      title: 'Topic Particle',          // spoiler-free, no hangul
      category: 'particle',
      tense: 'present',
      register: 'polite',
      hint: 'topic particle',           // shown inside the blank during review
      // Revealed only after answering or outside of review:
      description:
        'Attaches directly after a noun to mark it as the sentence topic. ' +
        'Use 은 after a noun ending in a consonant (받침), ' +
        '는 after a noun ending in a vowel. ' +
        'Sets contrast or emphasis relative to other things in the sentence.',
      level: 1,
      tags: ['particle', 'beginner', 'TOPIK1'],
    },
  });

  // ── Cloze Card 1 ───────────────────────────────────────────────────────
  const card1 = await prisma.clozeCard.upsert({
    where: { id: 'cc_topic_01' },
    update: {},
    create: {
      id: 'cc_topic_01',
      grammarPointId: topicParticle.id,
      fullSentence:      '저는 한국어를 공부해요.',
      sentenceWithBlank: '저___ 한국어를 공부해요.',
      vocabBaseForm:     '은/는',
      answer:            '는',
      alternateAnswers:  [],
      englishHint: [
        { text: 'I', highlight: true },
        { text: ' study Korean.', highlight: false },
      ],
    },
  });

  console.log('✓ Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

### 1.6 `src/lib/server/db.ts` — Prisma singleton

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Why**: SvelteKit's dev server hot-reloads modules. Without a singleton, each reload creates a new PrismaClient and exhausts connections.

---

## 2. Files to Modify

### 2.1 `package.json` — add scripts and @prisma/client

Add `@prisma/client` to dependencies and seed/db scripts:

```jsonc
{
  "dependencies": {
    // existing...
    "@prisma/client": "^7.4.1"    // ADD — the runtime client
  },
  "prisma": {
    "seed": "bun run prisma/seed.ts"
  },
  "scripts": {
    // existing...
    "db:up":       "podman-compose up -d",
    "db:down":     "podman-compose down",
    "db:migrate":  "bunx prisma migrate dev",
    "db:seed":     "bunx prisma db seed",
    "db:studio":   "bunx prisma studio",
    "db:reset":    "bunx prisma migrate reset"
  }
}
```

### 2.2 `src/routes/+page.server.ts` — NEW file, load card from DB

```ts
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async () => {
  // For now: grab the first card. Later: FSRS picks the next due card.
  const card = await prisma.clozeCard.findFirstOrThrow({
    include: { grammarPoint: true },
  });

  return {
    card: {
      id:                card.id,
      fullSentence:      card.fullSentence,
      sentenceWithBlank: card.sentenceWithBlank,
      vocabBaseForm:     card.vocabBaseForm,
      answers:           [card.answer, ...card.alternateAnswers],
      grammar: {
        title:       card.grammarPoint.title,
        category:    card.grammarPoint.category,
        tense:       card.grammarPoint.tense,
        register:    card.grammarPoint.register,
        hint:        card.grammarPoint.hint,
        // Only send description after the user has answered (handle in the route)
        description: card.grammarPoint.description,
      },
      englishHint: card.englishHint as { text: string; highlight: boolean }[],
    },
  };
};
```

### 2.3 `src/routes/+page.svelte` — consume server data instead of hardcoded card

Replace the hardcoded `const card` block with:

```svelte
<script lang="ts">
  import { romanToHangul } from '$lib/romanToHangul';

  interface EnglishHintPart { text: string; highlight: boolean; }
  interface GrammarPoint {
    title: string;
    category: string;
    tense: string | null;
    register: string | null;
    hint: string;        // shown in blank during review
    description: string; // revealed post-answer only
  }
  interface ClozeCard {
    fullSentence:      string;
    sentenceWithBlank: string;
    vocabBaseForm:     string;
    answers:           string[];  // all accepted forms, primary first
    grammar: GrammarPoint;
    englishHint: EnglishHintPart[];
  }

  // ── Receive from +page.server.ts instead of hardcoding ───────────────
  let { data } = $props();
  const card: ClozeCard = data.card;

  // ... rest of the script stays identical
</script>
```

The **only change** in the `<script>` block is:
1. Remove the `const card: ClozeCard = { ... }` literal (lines 23-42 of current file).
2. Add `let { data } = $props();` and `const card: ClozeCard = data.card;`.

All template markup remains unchanged.

---

## 3. Execution Order

```
Step  Command / Action                              Verify
────  ──────────────────────────────────────────────  ────────────────────────────
 1    Create .env.example                            cat .env.example
 2    Copy  .env.example → .env, set real password   .env is gitignored ✓
 3    Create docker-compose.yml                      podman-compose config
 4    bun add @prisma/client                         package.json updated
 5    Create prisma/schema.prisma                    bunx prisma validate
 6    Add scripts to package.json                    bun run db:up
 7    bun run db:up                                  podman ps → hangul-postgres running
 8    bun run db:migrate  (name: "init")             prisma/migrations/ created
 9    Create prisma/seed.ts                          —
10    bun run db:seed                                ✓ Seed complete
11    bun run db:studio                              browse localhost:5555 → verify data
12    Create src/lib/server/db.ts                    —
13    Create src/routes/+page.server.ts              —
14    Edit   src/routes/+page.svelte                 bun run dev → card loads from DB
```

---

## 4. Verification Checklist

- [ ] `podman ps` shows `hangul-postgres` running on port 5432
- [ ] `bunx prisma migrate dev` succeeds with tables: `users`, `sessions`, `grammar_points`, `cloze_cards`, `review_cards`, `review_logs`
- [ ] `bunx prisma db seed` → "✓ Seed complete"
- [ ] `bunx prisma studio` → grammar_points has 1 row, cloze_cards has 1 row
- [ ] `bun run dev` → cloze page loads the topic particle card from DB
- [ ] Typing "neun" into the input shows 는 in the blank
- [ ] Clicking Check → "✓ Correct!"

---

## 5. Notes for Future Work

- **FSRS integration**: Install `ts-fsrs`, add a `POST /api/review` endpoint that takes `{ cardId, rating }`, computes next schedule, upserts `ReviewCard`, appends `ReviewLog`.
- **Auth**: Likely Lucia v3 or a custom session-based flow. `User` / `Session` tables are already in the schema.
- **AI card generation**: A script or API route that calls an LLM, parses output into `GrammarPoint` + `ClozeCard` + `ClozeBlank` records, and inserts via Prisma.
- **Card selection**: Replace `findFirstOrThrow` with FSRS-based `findFirst({ where: { reviewCards: { some: { userId, due: { lte: now } } } }, orderBy: ... })`.
