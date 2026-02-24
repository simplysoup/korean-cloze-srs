# PLANNING.md — Review Card Overhaul, FSRS Integration, Auth & Routing

> **Created:** 2026-02-23
> **Updated:** 2026-02-24
> **Scope:** Phases 2–5 of the Korean Cloze SRS update
> **Prerequisites:** Current MVP state with one seeded grammar point, Prisma 7.4 + PostgreSQL 16, Svelte 5 runes

---

## Table of Contents

1. [Phase 2 — UI & Layout Simplifications](#phase-2--ui--layout-simplifications)
2. [Phase 3 — Interaction States & FSRS Logic](#phase-3--interaction-states--fsrs-logic)
3. [Phase 4 — Database & Seeding](#phase-4--database--seeding)
4. [Phase 5 — Routing & Folder Restructure](#phase-5--routing--folder-restructure)
5. [Schema Changes Summary](#schema-changes-summary)
6. [File Change Map](#file-change-map)
7. [Execution Order](#execution-order)
8. [Open Questions & Future Work](#open-questions--future-work)

---

## Phase 2 — UI & Layout Simplifications

### 2.1 Remove Grammar Header

**Current:** A blue `<div class="grammar-header">` bar displaying "Grammar Point: Topic Particle" sits above the cloze card.

**Change:** Delete the entire `.grammar-card` element (header + description) from the review page. The description will be moved into a toggleable "Reveal Info" panel (Phase 3).

**Files affected:**
- `src/routes/reviews/+page.svelte` — remove `<div class="grammar-card">` block
- `src/app.css` — remove `.grammar-card`, `.grammar-header`, `.grammar-label`, `.grammar-title`, `.grammar-desc` rules

### 2.2 Placeholder Text (Tense/Register in Blank)

**Current:** The blank shows the grammar `hint` (e.g. "topic particle") as placeholder text.

**Change:** Replace the blank placeholder with tense/register metadata assembled as a comma-separated string: e.g. *"Present, standard polite"*. Render in a lighter font color (`var(--text-faint)` or lighter). The placeholder disappears once the user types any romanized input.

**Implementation:**
```svelte
{@const placeholderText = [
  data.card.grammar.tense,
  data.card.grammar.register
].filter(Boolean).join(', ')}

<span class="blank blank--placeholder">
  {isEmpty ? placeholderText || data.card.grammar.hint : h}
</span>
```

If both `tense` and `register` are null, fall back to `grammar.hint`.

**CSS:** `.blank--placeholder` color changes from `var(--text-faint)` to `var(--text-faint)` (already light; may lighten further to `#c5c9d0`).

### 2.3 Layout & Centering — Remove Bounding Boxes

**Current:** Both `.grammar-card` and `.cloze-card` have `background`, `border-radius`, `box-shadow` — visible card outlines.

**Change:**
- Remove `background`, `box-shadow`, `border-radius` from `.cloze-card` on the review page (may scope with a `.review-view` modifier or move to a review-specific stylesheet).
- Center the Hangul sentence and English hint vertically and horizontally on the viewport.
- Hangul sits directly above the English text with minimal gap.

**Layout structure:**
```
┌──────────────────────────┐
│                          │
│    저___ 한국어를 공부해요.    │  ← Hangul sentence, centered
│    I study Korean.       │  ← English hint, centered below
│                          │
│    [ romanized input ]   │  ← input below, centered
│                          │
│              [Check]     │  ← controls at bottom
└──────────────────────────┘
```

**CSS changes:**
```css
.review-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 4rem);
  text-align: center;
}

.sentence {
  justify-content: center;     /* was flex-start */
}

.english-hint {
  text-align: center;
}

.cloze-card {
  background: none;
  box-shadow: none;
  padding: 0;
}
```

### 2.4 Syntax Highlighting

**Current:** English hint uses a single `highlight: boolean` flag — highlighted parts are red + underlined.

**Change:** Introduce a `highlightType` field to the `EnglishHintPart` interface:

```ts
interface EnglishHintPart {
  text: string;
  highlight: 'none' | 'direct' | 'related';
}
```

| Type | Color | Use case |
|------|-------|----------|
| `'none'` | Default muted text | Normal text |
| `'direct'` | **Red** (`var(--red-dark)`) | The word directly replaced by the blank |
| `'related'` | **Yellow** (`#b45309` / amber-700) | Related words affected by the particle but not the blank itself |

**Migration note:** Existing seed data uses `{ highlight: boolean }`. All seeds must be updated to the new `highlightType` enum. The `englishHint` column is `Json` so no schema migration is needed — only seed data and TypeScript interfaces change.

**Backward compat:** During the transition, the page component can normalize:
```ts
function normalizeHint(part: any): EnglishHintPart {
  if (typeof part.highlight === 'boolean') {
    return { text: part.text, highlightType: part.highlight ? 'direct' : 'none' };
  }
  return part;
}
```

---

## Phase 3 — Interaction States & FSRS Logic

### 3.1 Review Queue

**Server load:** `src/routes/reviews/+page.server.ts` queries up to 10 due `ReviewCard` records for the current user, ordered by `due ASC`:

```ts
const reviewCards = await prisma.reviewCard.findMany({
  where: {
    userId: session.userId,
    due: { lte: new Date() },
  },
  orderBy: { due: 'asc' },
  take: 10,
  include: {
    clozeCard: {
      include: { grammarPoint: true },
    },
  },
});
```

**Client state:** The queue is passed as `data.queue: ClozeCard[]`. A `$state` index tracks the current position. Pressing "Next" increments the index and triggers FSRS update via a `POST` to `/api/reviews`.

```svelte
let queueIndex = $state(0);
let currentCard = $derived(data.queue[queueIndex]);
```

### 3.2 Incorrect Answer

**Visual feedback:**
1. The `.sentence` container gets a CSS `shake` animation (keyframes: translateX ±4px over 300ms).
2. The blank highlights in red (`.blank--incorrect` already exists).
3. Two buttons appear: **"Show Answer"** and **"Undo"**.

**Show Answer:** Reveals the correct answer in the blank (replaces user input). The card is now considered "failed" — FSRS will receive `rating: 1` (Again).

**Undo button:**
- Displays a tooltip/warning: *"Use only for typos, not incorrect answers."*
- Reverts the card to its pre-review state: clears input, resets `submitted = false`, no FSRS update.
- Implementation: store a snapshot before submission in `$state`:
  ```ts
  let preSubmitSnapshot = $state<{ romanInputs: string[] } | null>(null);
  function undo() {
    if (preSubmitSnapshot) {
      romanInputs = preSubmitSnapshot.romanInputs;
      submitted = false;
      preSubmitSnapshot = null;
    }
  }
  ```

**FSRS timing:** The FSRS `POST` is sent only when "Next" is clicked, not on submission. This allows Undo to work cleanly.

**State flow:**
```
[Typing] → Submit → [Incorrect]
                       ├── Show Answer → [Answer Revealed, rating=1 queued]
                       ├── Undo → [Typing] (card reset, no rating)
                       └── Next → POST /api/reviews { rating: 1 } → [Next Card]
```

### 3.3 Close Answer (Plan Only — Implement Later)

A "close" answer has the right meaning but wrong register, tense, or particles.

**Visual feedback:**
1. Shake animation (same as incorrect).
2. Correct character segments highlight green, incorrect segments highlight red (character-by-character diff).
3. "Show Answer" button is available — clicking it marks review as failed (`rating: 1`).

**Future DB requirement:**
- Add a `closeAnswers` column (`Json`) to `ClozeCard`:
  ```ts
  closeAnswers: {
    answer: string;        // the "close" form
    corrections: {
      position: number;    // character index
      expected: string;
      got: string;
      reason: string;      // e.g. "wrong register — use 해요 not 한다"
    }[];
  }[]
  ```
- This requires a schema addition (`closeAnswers Json?` on `ClozeCard`) and a new migration.

**Implementation deferred to a future phase.** No code changes now — only this plan.

### 3.4 Correct Answer

**Visual feedback:**
1. The full sentence highlights green (`.sentence--correct` class on the container, or highlight each `<span>` individually).
2. The blank shows the correct Hangul in green (`.blank--correct` already exists).

**Alt button:**
- Appears after a correct answer if `data.card.answers.length > 1`.
- Cycles through `data.card.answers` starting from index 1 (the alternate answers).
- Greyed out / hidden if no alternates exist.
- Implementation:
  ```svelte
  let altIndex = $state(0);
  function cycleAlt() {
    altIndex = (altIndex + 1) % data.card.answers.length;
  }
  ```
  Displayed answer: `data.card.answers[altIndex]`.

**Next button:** Sends `POST /api/reviews` with `rating: 3` (Good) by default. Future: allow user to self-rate (Hard/Good/Easy).

### 3.5 Reveal Info Toggle

**Component:** A collapsible `<details>`-style panel below the input area showing the full `grammar.description`.

**Behavior:**
- Clicking "Reveal Info" before providing a correct answer **auto-fails** the review.
- Requires a **double-click to confirm**: first click shows a warning ("Revealing will mark this review as failed. Click again to confirm."), second click reveals.
- Implementation:
  ```svelte
  let revealState = $state<'hidden' | 'confirming' | 'revealed'>('hidden');

  function toggleReveal() {
    if (revealState === 'hidden') {
      if (!allCorrect && submitted === false) {
        revealState = 'confirming';  // show warning
      } else {
        revealState = 'revealed';
      }
    } else if (revealState === 'confirming') {
      revealState = 'revealed';
      autoFailed = true;  // mark review as failed
    }
  }
  ```
- If the user already answered correctly, revealing info has no penalty.
- The grammar description is scrollable within a max-height container.

### 3.6 FSRS API Endpoint

**Route:** `POST /api/reviews`

**Request body:**
```ts
{
  reviewCardId: string;
  rating: 1 | 2 | 3 | 4;  // Again | Hard | Good | Easy
}
```

**Server action:**
1. Fetch the `ReviewCard` with current FSRS state.
2. Use `ts-fsrs` to compute next schedule: `fsrs.repeat(card, now)[rating]`.
3. Update `ReviewCard` with new `stability`, `difficulty`, `reps`, `lapses`, `state`, `due`, `lastReview`.
4. Append a `ReviewLog` entry.
5. Return the updated card state.

**Dependency:** `ts-fsrs` package (add to `dependencies`).

**File:** `src/routes/api/reviews/+server.ts`

---

## Phase 4 — Database & Seeding ✅ COMPLETE

> **Completed:** 2026-02-24. All steps implemented and verified.

### 4.1 Schema Changes

#### 4.1.1 User model — add `passwordHash` for BetterAuth

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  passwordHash String?  @map("password_hash")  // Argon2id hash (via @node-rs/argon2)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt      @map("updated_at")

  sessions    Session[]
  reviewCards ReviewCard[]
  reviewLogs  ReviewLog[]

  @@map("users")
}
```

#### 4.1.2 EnglishHintPart type update

No schema change needed (it's `Json`). TypeScript interface changes:

```ts
// Old
interface EnglishHintPart { text: string; highlight: boolean; }

// New
interface EnglishHintPart {
  text: string;
  highlightType: 'none' | 'direct' | 'related';
}
```

### 4.2 Seed Grammar Points (Part 3 Particles)

Each grammar point gets 3–5 cloze cards with varied sentences. Stable IDs for idempotent re-runs.

#### 4.2.1 Grammar Points to Seed

| ID | Section | Particles | Title | Hint |
|----|---------|-----------|-------|------|
| `gp_topic` | 3.1 | 은/는 | Topic Particle | topic particle |
| `gp_subject` | 3.2 | 이/가 | Subject Particle | subject particle |
| `gp_object` | 3.3 | 을/를 | Object Particle | object particle |
| `gp_time_place` | 3.4 | 에 | Time/Place Particle | time/place particle |
| `gp_place_at` | 3.5 | 에서 | Location Particle (action) | place particle (action) |
| `gp_from_to_place` | 3.6 | 에서~까지 | From Place to Place | from–to (place) |
| `gp_from_to_time` | 3.7 | 부터~까지 | From Time to Time | from–to (time) |
| `gp_also` | 3.8 | 도 | Also/Too Particle | also, too |
| `gp_only` | 3.9 | 만 | Only Particle | only |
| `gp_and_with` | 3.10 | 하고/와/과 | And/With (Nouns) | and, with |
| `gp_and_casual` | 3.11 | (이)랑 | And/With (Casual) | and, with (casual) |

#### 4.2.2 Sample Cloze Cards (per grammar point)

Each grammar point will have 3–5 cloze cards. Example structure for 3.1 은/는:

```ts
// GP: Topic Particle (은/는)
{ id: 'cc_topic_01', fullSentence: '저는 한국어를 공부해요.', sentenceWithBlank: '저___ 한국어를 공부해요.', answer: '는', alternateAnswers: [], vocabBaseForm: '은/는',
  englishHint: [{ text: 'I', highlightType: 'direct' }, { text: ' study Korean.', highlightType: 'none' }] },

{ id: 'cc_topic_02', fullSentence: '날씨는 좋아요.', sentenceWithBlank: '날씨___ 좋아요.', answer: '는', alternateAnswers: [], vocabBaseForm: '은/는',
  englishHint: [{ text: 'The weather', highlightType: 'direct' }, { text: ' is nice.', highlightType: 'none' }] },

{ id: 'cc_topic_03', fullSentence: '음식은 맛있어요.', sentenceWithBlank: '음식___ 맛있어요.', answer: '은', alternateAnswers: [], vocabBaseForm: '은/는',
  englishHint: [{ text: 'The food', highlightType: 'direct' }, { text: ' is delicious.', highlightType: 'none' }] },
```

**Note on accuracy:** All Korean sentences must be grammatically correct. The answer must be the exact particle that fills the blank. Alternate answers are only listed when multiple valid forms exist for that specific blank (rare for particles — they are typically determined by the preceding syllable's final consonant).

### 4.3 Test User & Auth

#### 4.3.1 BetterAuth Password Hashing

BetterAuth supports custom password hashing. We use **Argon2id** via `@node-rs/argon2` (native Rust bindings) instead of bcrypt/scrypt.

Password utility module at `src/lib/server/password.ts`:

```ts
import { hash, type Options, verify } from '@node-rs/argon2';

const opts: Options = {
  memoryCost: 65536,  // 64 MiB
  timeCost: 3,        // 3 iterations
  parallelism: 4,     // 4 lanes
  outputLen: 32,      // 32 bytes
  algorithm: 2        // Argon2id
};

export async function hashPassword(password: string): Promise<string> {
  return hash(password, opts);
}

export async function verifyPassword(data: { password: string; hash: string }): Promise<boolean> {
  return verify(data.hash, data.password, opts);
}
```

BetterAuth integration (Phase 5):

```ts
export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
  },
});
```

Seed script uses the same argon2 options directly:

```ts
import { hash, type Options } from '@node-rs/argon2';
const passwordHash = await hash('testpassword123', argon2Opts);
```

**Dependencies added:** `@node-rs/argon2` (NOT `bcryptjs`).

#### 4.3.2 Auto-login for Development

During development, the app will auto-login to the test user. Implementation options:

- **Option A (simple):** In the root layout's `load` function, if no session exists, create one for `user_test` and set the session cookie. This bypasses the login flow entirely.
- **Option B (seed session):** Seed a long-lived session token in the DB and set it as a cookie in the layout. The session is validated normally.

**Chosen approach:** Option A — the layout server load checks for a session; if none, it creates a session for the test user. Controlled by an env var `AUTO_LOGIN=true` (default in `.env`).

### 4.4 FSRS Seed — 5 Available Reviews

Seed 5 `ReviewCard` records for `user_test`, each pointing to a different cloze card, all with `state: 0` (New) and `due: now()` so they appear immediately in the review queue.

```ts
const reviewClozeIds = ['cc_topic_01', 'cc_subject_01', 'cc_object_01', 'cc_time_place_01', 'cc_place_at_01'];

for (const clozeCardId of reviewClozeIds) {
  await prisma.reviewCard.upsert({
    where: {
      userId_clozeCardId: {
        userId: 'user_test',
        clozeCardId,
      },
    },
    update: {},
    create: {
      userId: 'user_test',
      clozeCardId,
      state: 0,        // New
      due: new Date(),  // Available now
      stability: 0,
      difficulty: 0,
      reps: 0,
      lapses: 0,
    },
  });
}
```

---

## Phase 5 — Routing & Folder Restructure

### 5.1 New Route Structure

```
src/routes/
├── +layout.svelte              ← App shell (nav bar, footer)
├── +layout.server.ts           ← Auth check, session injection
├── +page.svelte                ← Home page (login + search)
├── +page.server.ts             ← Home page server load
├── login/
│   ├── +page.svelte            ← Login form (email/password)
│   └── +page.server.ts         ← Login form action
├── reviews/
│   ├── +page.svelte            ← Review card UI (main study flow)
│   ├── +page.server.ts         ← Load review queue (FSRS)
│   └── roman-to-hangul/
│       └── +page.svelte        ← Standalone romanization tool
├── api/
│   ├── auth/
│   │   └── [...all]/
│   │       └── +server.ts      ← BetterAuth catch-all handler
│   └── reviews/
│       └── +server.ts          ← POST: submit review rating
```

### 5.2 Home Page (`/`)

**Features:**
- **Login button** — links to `/login` if not authenticated; shows user name + "Logout" if authenticated.
- **Search bar** — simple text input that filters grammar points by title/category/tags. Shows a list of matching grammar points with their cloze card counts.
- **Quick stats** — number of reviews due today, total cards studied.

**Server load:** Fetch grammar point list (title, category, card count) and user stats if logged in.

### 5.3 Login Page (`/login`)

**Features:**
- Email + password form.
- Submit via BetterAuth's `signIn.email()` client method.
- On success, redirect to `/reviews`.
- "Sign up" link (for future registration page).
- Prepared for Google OAuth button (greyed out or hidden until configured).

**Implementation:**
```svelte
<script lang="ts">
  import { authClient } from '$lib/auth-client';

  let email = $state('');
  let password = $state('');
  let error = $state('');

  async function handleLogin() {
    const result = await authClient.signIn.email({ email, password });
    if (result.error) {
      error = result.error.message;
    } else {
      window.location.href = '/reviews';
    }
  }
</script>
```

### 5.4 Auth Management

#### BetterAuth Server Setup

**File:** `src/lib/server/auth.ts`

```ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './db';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  // Future: socialProviders: { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } }
});
```

**Note:** BetterAuth has its own session/user table expectations. We may need to align our Prisma schema with BetterAuth's expected table names, or use BetterAuth's schema generation. This needs investigation during implementation — BetterAuth may require additional columns on `User` (e.g. `emailVerified`) and `Session` (e.g. `ipAddress`, `userAgent`).

#### BetterAuth Client Setup

**File:** `src/lib/auth-client.ts`

```ts
import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient();
```

#### API Route

**File:** `src/routes/api/auth/[...all]/+server.ts`

```ts
import { auth } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => auth.handler(event.request);
export const POST: RequestHandler = async (event) => auth.handler(event.request);
```

#### Session in Layouts

**File:** `src/routes/+layout.server.ts`

```ts
import { auth } from '$lib/server/auth';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  return { session };
};
```

---

## Schema Changes Summary

### New Columns

| Table | Column | Type | Notes |
|-------|--------|------|-------|
| `users` | `password_hash` | `String?` | Argon2id hash (via @node-rs/argon2) |
| `users` | `email_verified` | `Boolean` | BetterAuth requirement (default false) |

### Potential BetterAuth Columns

BetterAuth may require additional columns. During implementation, run `npx better-auth generate` to see the expected schema and align accordingly. Common additions:

- `Session`: `ipAddress`, `userAgent`, `expiresAt` adjustments
- `User`: `emailVerified`, `image`

### EnglishHintPart (Json, no migration)

```ts
// Before
{ text: string; highlight: boolean }

// After
{ text: string; highlightType: 'none' | 'direct' | 'related' }
```

---

## File Change Map

| Action | File | Phase |
|--------|------|-------|
| **CREATE** | `src/routes/reviews/+page.svelte` | 2, 3 |
| **CREATE** | `src/routes/reviews/+page.server.ts` | 3 |
| **MOVE** | `src/routes/roman-to-hangul/` → `src/routes/reviews/roman-to-hangul/` | 5 |
| **MODIFY** | `src/routes/+page.svelte` | 5 (replace with home page) |
| **MODIFY** | `src/routes/+page.server.ts` | 5 (replace with home load) |
| **CREATE** | `src/routes/+layout.server.ts` | 5 |
| **MODIFY** | `src/routes/+layout.svelte` | 5 (add nav) |
| **CREATE** | `src/routes/login/+page.svelte` | 5 |
| **CREATE** | `src/routes/login/+page.server.ts` | 5 |
| **CREATE** | `src/routes/api/reviews/+server.ts` | 3 |
| **CREATE** | `src/routes/api/auth/[...all]/+server.ts` | 5 |
| **CREATE** | `src/lib/server/auth.ts` | 5 |
| **CREATE** | `src/lib/auth-client.ts` | 5 |
| **MODIFY** | `src/app.css` | 2 |
| **MODIFY** | `prisma/schema.prisma` | 4 |
| **MODIFY** | `prisma/seed.ts` | 4 |
| **MODIFY** | `package.json` | 3, 4, 5 (new deps) |

---

## Execution Order

Implementation should proceed in dependency order:

```
Step  Phase  Task                                                    Depends On   Status
────  ─────  ──────────────────────────────────────────────────────  ──────────  ───────
 1    4.1    Add passwordHash to User schema, run migration          —            ✅ Done
 2    4.2    Write full seed.ts with 11 grammar points + cards       Step 1       ✅ Done
 3    4.3    Add test user with hashed password to seed              Step 2       ✅ Done
 4    4.4    Seed 5 ReviewCards for test user                        Step 3       ✅ Done
 5    —      Run: bunx --bun prisma migrate dev --name auth_update   Step 1       ✅ Done
 6    —      Run: bunx --bun prisma db seed                          Step 4       ✅ Done
 7    5.1    Create route folder structure (reviews/, login/, api/)   —            ✅ Done
 8    5.2    Build home page (/, search bar, login button)            Step 7       ✅ Done
 9    5.4    Set up BetterAuth server + client + hooks                Step 7       ✅ Done
10    5.3    Build login page                                         Step 9       ✅ Done
11    5.1    Move roman-to-hangul into reviews/                       Step 7       ✅ Done
12    2.1    Remove grammar header from review page                   Step 7       ✅ Done
13    2.2    Implement placeholder text (tense/register)              Step 12      ✅ Done
14    2.3    Remove bounding boxes, center layout                     Step 12      ✅ Done
15    2.4    Implement syntax highlighting (highlightType)            Step 12      ✅ Done
16    3.1    Implement review queue loading                           Steps 6, 9   ✅ Done
17    3.2    Implement incorrect answer flow (shake, undo, show)      Step 16      ✅ Done
18    3.3    (Plan only — no implementation)                          —            ✅ Done
19    3.4    Implement correct answer flow (green, alt cycling)       Step 16      ✅ Done
20    3.5    Implement reveal info toggle                             Step 16      ✅ Done
21    3.6    Implement POST /api/reviews (FSRS update)                Step 16      ✅ Done
22    —      End-to-end test: login → review queue → answer → FSRS   All
```

---

## Dependencies to Add

```bash
# Already installed (Phase 3-5):
# ts-fsrs (FSRS scheduling)
# @node-rs/argon2 (Argon2id password hashing)
# better-auth (authentication framework)
```

---

## Open Questions & Future Work

1. **BetterAuth schema alignment:** ✅ Resolved. BetterAuth uses `Account` and `Verification` tables. Passwords stored in `Account.password` with `providerId: "credential"`. Schema uses `@@map()` for snake_case table names. Uses `svelteKitHandler` in `hooks.server.ts` (not API catch-all routes). Custom Argon2id hashing via `password.hash`/`password.verify` options.

2. **Close answers (Phase 3.3):** Deferred. Will need:
   - `closeAnswers Json?` column on `ClozeCard`
   - Character-level diff logic in the frontend
   - A way for seed data or AI to generate close-answer variants

3. **Self-rating UI:** Currently the plan sends `rating: 3` (Good) for correct and `rating: 1` (Again) for incorrect. Future: add Hard/Easy buttons for self-rating after correct answers.

4. **Multi-blank cards:** The current architecture supports a single blank per card. Multi-blank would require `romanInputs` to track multiple values and `answers` to be per-blank.

5. **Google OAuth:** The BetterAuth setup is prepared for it. Only needs `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` env vars and uncommenting the social provider config.

6. **Card creation UI:** Not in scope. Cards are currently seed-only. Future: admin UI or AI-powered generation endpoint.

7. **Review scheduling nuance:** The initial implementation uses basic FSRS `repeat()`. Future: consider learning steps, graduating intervals, and the full FSRS-5 algorithm parameters.
