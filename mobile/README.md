# Munpro — Mobile (Expo)

Expo React Native rebuild (option D) of the old SvelteKit app in the repo
root. Offline-first, local accounts (no server). Brand: **Munpro** (문법 =
grammar + pro, the Korean parallel to Bunpro); UI modelled on Bunpro's
flat, minimal look — light-grey pages, white cards, coral-red primary,
teal-navy header.

**Stack:** Expo SDK 58 · React Native 0.88 · React 19.3 · TypeScript (strict)
· Expo Router (file-based routing, routes in `src/app/`) · expo-sqlite +
Drizzle ORM · `ts-fsrs` (FSRS 6) · `hangul-js` is a dependency but the
romanization converter is the ported custom one in `src/lib/romanToHangul.ts`.

## Run it

```sh
cd mobile
npm install
npm start            # Expo dev server — scan the QR code with Expo Go,
                     # or press `w` for web
npm run android      # needs a dev build / emulator (expo-sqlite is native)
npm run ios          # macOS only
```

> Note: `expo-sqlite` is a native module. In Expo Go it is bundled, but
> if you add further native libraries you will need a development build
> (`npx expo run:android` / `eas build --profile development`).

## Commands

| Command | What it does |
|---|---|
| `npm test` | Jest (jest-expo): romanization, FSRS, answer checking, seed validation, local auth — 39 + auth tests |
| `npm run typecheck` | `tsc --noEmit` — must be 0 errors |
| `npm run validate` | `node ../scripts/validate-content.mjs` — content counts + integrity |
| `npm run export` | `npx expo export` — static export check (web) |
| `npm start` | Expo dev server |

CI (`.github/workflows/mobile.yml`) runs validate, typecheck, tests, and
`expo export` on every push touching `mobile/`.

## Architecture

```
mobile/
  src/app/            Expo Router screens
    _layout.tsx       Auth gate (login/signup paints before the DB opens) + Stack
    (tabs)/           Learn · Reviews · Dashboard · Grammar (tabs)
    grammar/[id].tsx  Grammar detail (Details / Examples / Resources)
  src/components/     AuthScreen, BrandMark, ClozeSentence, EnglishHint, …
  src/db/
    schema.ts         Drizzle tables (mirrors prisma/schema.prisma,
                      plus a local `users` table)
    index.ts          getDb / initDb / seed, due queue, learn session,
                      submitReview (FSRS + log + streak), dashboard stats,
                      local accounts + session, migration of pre-auth data
  src/lib/
    romanToHangul.ts  Ported verbatim from the old app (custom converter)
    hangulToRoman.ts  Ported verbatim (search helper)
    levels.ts         Ported verbatim (XP: 10/review, level N needs N×100 XP)
    srs.ts            Pure FSRS logic: computeFsrsReview, checkAnswers,
                      correctAnswersForCard, formatNextReview, srsRankLabel
    sha256.ts         Pure-TypeScript SHA-256 (password hashing)
    auth.ts           Signup/login validation, salted iterated hashing
    auth-context.tsx  AuthContext (current user + logout)
  src/content/
    topik1-level1.json  Ported seed content (see below)
    types.ts            Content types + flattenContent()
scripts/
  port-content.ts     Regenerates the JSON from prisma/seed-data/ (bun)
  validate-content.mjs  Counts + integrity checks for the JSON
```

### Data model (local SQLite, `korean-cloze-srs.db`)

`users` (local accounts: username, email, salted + iterated SHA-256
password hash), `grammar_points`, `cloze_cards`,
`cloze_card_grammar_targets`, `lesson_examples`, `review_cards` (one FSRS
record per grammar point, with `streak_correct`, `mastered_at`,
`peak_stability`), `review_logs`, `decks`, `deck_grammar_points`,
`user_deck_progress`, `user_streaks`, `meta` (content version + session
user id). Per-user rows are keyed by the logged-in account's id; pre-auth
data keyed `local` migrates to the first account created on the device.

### Auth (local only, no server)

Login/signup screens paint before the database opens — the DB warm-up
(wasm fetch/compile + OPFS init) runs in the background while the user
reads/types, and is only awaited when a form is submitted. First run with
zero accounts goes to signup. "Remember Me" (default on) persists the
session as a user id in the `meta` table, so returning users skip login;
Log out is on the Dashboard. Passwords are salted + 1000× iterated
SHA-256 (`src/lib/sha256.ts`, `src/lib/auth.ts`) — a local-privacy
measure for a DB file that never leaves the device, not server-grade
credential storage. No password reset, no social login.

### Review flow (Bunpro-style)

- Due queue: up to 10 review cards with `due <= now`, `masteredAt` null,
  ordered by due date; each presents its most-advanced cloze card
  (highest `introducedAtPosition`).
- Minimal screen: sentence centered in large type, nuance hint above the
  blank, English hint below, one pill-shaped input at the bottom (type
  romanized Korean, see it convert to Hangul live; ENTER or the arrow
  button submits). HUD: End Session, SRS rank (New / Beginner I–IV /
  Seasoned I–III / Master, from FSRS state + stability), Right/Wrong
  counter, Remaining count. Hint reveals the answer in stages (full
  reveal marks the card failed).
- Check is exact match against the answer + alternate answers (+ the
  grammar-target word replacement). Correct → Good (3); wrong → Again
  (1). Show Answer reveals without re-typing; Undo re-enables editing.
- Misses go to a Wrap-Up round and re-queue until answered correctly;
  the session ends with a Summary screen (Right/Wrong, accuracy).
- FSRS update, review log, and streak update happen locally and
  synchronously in `submitReview`. Mastery: 8 correct in a row masters a
  grammar point (it leaves the queue).
- Learn flow: session of 5 grammar points from the deck in curriculum
  order, each shown as a point page (red headword, Structure, About,
  Details, Examples). Green "I already know this" masters the point
  immediately (never tested again); the blue arrow advances and adds the
  point to the deck. Then a Review stage tests the just-learned points
  (one card per point), re-queueing misses until every card is answered
  correctly, then a summary. Completing a session creates the FSRS review
  cards (due immediately).

## Provisional content — read this before using the app to study

**All 48 grammar points, 154 cloze cards, and 98 lesson examples
(TOPIK I Level 1) are copied VERBATIM from the old app's seed data
(`prisma/seed-data/topik1-level1/`).** They were authored by Nicholas
with basic Korean and are marked provisional in the JSON itself
(`provenance` field) and here. They will likely be regenerated later by
a high-performing English–Korean multimodal model. No new cards were
generated in this increment, and no grammar content was invented.

Validation (`npm run validate` / the seed Jest test) enforces:
11 lessons, 48 grammar points, 154 cloze cards, 98 lesson examples;
every cloze answer appears in its sentence; every grammar point has
≥ 2 lesson examples; no duplicate ids; all related / extra-target ids
exist.

## Not yet built (next steps, in roughly this order)

- **Sync / cloud backup** — accounts are local-only; data lives only in
  the device SQLite file. Export/import is not built yet.
- **Push notifications** — no due-review reminders yet.
- **Audio / TTS** — no pronunciation audio on examples yet.
- **Vocabulary** — no vocab SRS track (the old app's menu said “soon” too).
- **Cram mode and Ghost reviews** — not built.
- **Close-answer detection** — no Levenshtein ≤ 1 “close” warning yet;
  checks are exact-match only.
- **TOPIK I Level 2 and beyond** — content stops at Level 1 (48 points).
- **Capacitor / App Store release** — no EAS build/submit config yet.
- **Settings** — no settings screen (session size is fixed at 5 in Learn;
  Review is capped at 10 due cards per session, as in the old app).

## Known issues / quirks carried over

- The custom romanizer has phonetic quirks: e.g. `gamsahamnida` renders
  as 감사함니다 (ㅂ before ㄴ nasalizes to ㅁ). Tests only assert the
  unambiguous cases.
- `ts-fsrs` is v6 here (v5 in the old app). The scheduler API is
  `fsrs().repeat(card, now)` / `createEmptyCard(now)`; the review-log
  shape changed, so `elapsedDays` is computed locally in `srs.ts`.
- The `create-expo-app` `tabs-typescript` template failed to download
  in this environment (`npm pack` error), so the app was scaffolded from
  `blank-typescript` and Expo Router was added afterwards. The
  `react` 19.3.0 → 19.3.1 bump fixes a pre-existing Expo Router peer
  conflict (`react-dom@19.3.1` wants `react@^19.3.1`).
- Web export needs two things that are now in the repo:
  `react-native-web` (installed for `expo export --platform web`) and
  `metro.config.js`, which adds `wasm` to Metro's asset extensions —
  without it, bundling fails resolving
  `expo-sqlite/web/wa-sqlite/wa-sqlite.wasm` even though the file exists.
