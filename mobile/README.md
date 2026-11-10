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
| `npm test` | Jest (jest-expo): romanization, FSRS, answer checking, seed validation, local auth — 65 tests |
| `npm run typecheck` | `tsc --noEmit` — must be 0 errors |
| `npm run validate` | `node ../scripts/validate-content.mjs` — content counts + integrity |
| `npm run export` | `npx expo export` — static export check (web) |
| `npm start` | Expo dev server |

**Live:** [https://srv889405.tail9df0b2.ts.net:8443/](https://srv889405.tail9df0b2.ts.net:8443/) (VPS, Tailscale serve HTTPS on :8443 → local static server on :28767; see Deploy below). **CI:** `.github/workflows/mobile.yml` runs content validation, typecheck, Jest, and `expo export` on every push touching `mobile/`.

## Deploy (VPS — the live site)

The live site is a static export served by a dependency-free Node
server on the VPS (`~/korean-cloze-web/server.js`, port 28767, SPA
fallback, COOP/COEP headers for the SQLite wasm worker, proxies
`/api/*` to the auth backend on 127.0.0.1:28768). Tailscale serve
exposes it as https://srv889405.tail9df0b2.ts.net:8443/.

From a checkout of this repo (branch `v2/expo`):

```sh
cd mobile
tar --exclude=node_modules --exclude=dist --exclude=.expo -czf - . \
  | ~/workspace/vps-ssh.sh 'mkdir -p ~/korean-build/mobile && cd ~/korean-build/mobile && tar xzf -'
~/workspace/vps-ssh.sh 'cd ~/korean-build/mobile && PATH=~/node22/bin:$PATH npx expo export --platform web'
~/workspace/vps-ssh.sh 'rm -rf ~/korean-cloze-web/dist && mv ~/korean-build/mobile/dist ~/korean-cloze-web/dist'
```

Then verify: `curl` the local server (200 on
http://127.0.0.1:28767/), the public link (200 on
https://srv889405.tail9df0b2.ts.net:8443/, 6 deferred script tags in
the HTML), and `/api/auth/health` (`{"ok":true,"emailConfigured":true}`).

Notes: SSH to the VPS goes over Tailscale only (`~/workspace/vps-ssh.sh`,
never direct port 22); the VPS system Node 18 is too old for Expo, use
`~/node22/bin`. `rsync` does not work over that SSH route (broken pipe)
— tar over stdin is the transfer. The static server and the auth backend
are started by `@reboot` crontab entries on the VPS.

## Architecture

```
mobile/
  src/app/            Expo Router screens
    _layout.tsx       App shell: nav + dashboard skeleton paint immediately;
                      DB warm-up + session restore run in the background
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
`library_decks` (the user's library — see below), `user_streaks`, `meta`
(content version + session user id). Per-user rows are keyed by the
logged-in account's id; pre-auth data keyed `local` migrates to the
first account created on the device.

### The library (build 16 — replaces the active deck)

There is no "current" deck. Each TOPIK level is its own deck, and the
user adds any decks they want to their **library** (from the Decks
catalogue or a deck's detail page; Learning a deck adds it first). Learn,
Review, and Cram pull from **all library decks at once, in dependency
order** — deck sortOrder, then curriculum position — deduped by grammar
point id, so decks with overlapping cards never duplicate a point (the
ordering is a pure function, `orderLibraryPoints` in
`src/lib/library.ts`, unit-tested). A point learned in one deck counts
everywhere it appears; removing a deck from the library pauses its
reviews and learning (its progress is kept and resumes if re-added).
New users start with an empty library; the dashboard and Learn screen
point them at the catalogue. A one-time migration in `initDb`
(`libraryMigrated`) adds, for every user who already learned points,
the decks containing those points — existing users keep running.

### Auth (email-code, via the VPS backend — build 8; server accounts + sync — build 26)

Sign-in and sign-up are the same form: enter an email, get a 6-digit
code, enter it, you're in. Codes are issued by the auth backend on the
VPS (`~/korean-auth/server.js`, plain Node + nodemailer, binds
127.0.0.1:28768, proxied same-origin as `/api/*` by the static server);
6 digits, 10-minute expiry, 5 verify attempts, SHA-256-hashed in
memory, rate-limited (5/hr per email, 30/hr per IP). Verifying a code
(or a password login) trusts the device → auto-login; logging out
starts a 30-minute grace, after which a code is required again.
Password is optional (add/change in the Account screen); users created
by email get their username from the email local part. The old
local-password auth (salted + iterated SHA-256 in `src/lib/auth.ts`)
is still in the codebase for password logins, but email-code is the
primary flow. No social login.

**Server accounts + sync (build 26, design in
`docs/planning/sync-server-accounts.md`):** verifying a code or logging
in with a password now creates the account on the server too and issues
a 30-day session token (stored in the device DB). The server keeps the
account (email, username, scrypt password hash) and one sync document
per user in `~/korean-auth/munpro.db` (SQLite via `node:sqlite`,
built-in). The app syncs a full snapshot of the user's per-user state
(review cards, review logs, library decks, streak, settings, daily
learned counts) — keyed by grammar point / deck / date, never local
random ids — and merges the server copy into the local DB when the
server is newer, so a second device (or a fresh install) gets the
progress back. Sync runs on login and auto-login, after each review and
learn session, and on demand from Settings ("Sync now", which also
shows the last synced time). It is best-effort: offline, the app just
works locally and syncs later. A first login by email code is what
issues the token — a device that was already logged in before build 26
has no token until its owner logs in by code once (Settings says so).
Logging out invalidates the token server-side.

### Settings (build 12)

`/settings`: global daily new-items limit (1–10, default 5) and batch
size (1–10, ≤ daily limit), hide streak, vacation mode (pauses reviews
and learning; turning it off bridges the streak), and review toggles
(show SRS rank, Undo, lightning mode, focus mode, max reviews/day).
The daily limit and batch size apply to the whole library — there are
no per-deck settings (build 16 removed them with the active deck).

### Navigation (build 20)

The header is a teal-navy bar: the brand on the left, and Learn / Review /
Content / Practice on the **right**, next to the icons and the user chip
(24px horizontal padding, so nothing sits against the edge). On wide
screens the header content is centred in a 1080px column (the same width
as the page content) instead of spanning the full viewport, so the logo
and the nav are visible all at once. Every dropdown (Content, Practice,
bell, help, user) is right-aligned to its anchor, so none of them can
run off the right edge of the screen. The search, bell, and help icons
are one SVG set (`src/components/icons.tsx`,
react-native-svg, 22px, strokeWidth 2) — not mismatched text glyphs. The
bell carries a count badge: coral-red when there are notifications, grey
when the count is 0 (there is no notification source yet, so it is 0 and
greyed out). The Grammar Library (`(tabs)/grammar.tsx`) is modelled on
Bunpro's grammar_points (build 24): a title + total count, a toolbar (search +
Hide Learned Items, which shows only New points), and one large containing
card per TOPIK level, collapsed by default. The level header is a
light-grey strip at the top of its card; the lessons live inside the same
card, so the sub-elements feel connected to their headers (shared
container + header strip + divider rules, no indentation). Each lesson
header has a divider above it (except the first in the level), a bold
"Lesson N", and the subtitle in regular muted grey on the same line, so
the lesson number is clearly distinguished from the pale-grey point cards
beneath it. Expanding a level shows its lessons, each with its points and
a status pill (New / Learning / Mastered) — no hardcoded level badge. A
search or the Hide Learned filter auto-expands the levels that still have
points. The Decks catalogue (`decks.tsx`) is a grid, not a list (build
24, Bunpro's Decks page but more utilitarian): each card has a
typographic "cover" (the deck title in large type on pale grey, with a
faint level number) and a thin red progress line along the bottom edge
of the cover, its width proportional to the learned percentage; the
bottom panel holds the description, three stats in a row (Points /
Learned / Due, separated by vertical dividers), and the library action.
The cover links to the deck detail page.

### Review flow (Bunpro-style)

- Due queue: up to 10 review cards with `due <= now`, `masteredAt` null,
  ordered by due date; each presents its most-advanced cloze card
  (highest `introducedAtPosition`).
- Minimal screen: sentence centered in large type, nuance hint above the
  blank, English hint below, one pill-shaped input at the bottom (type
  romanized Korean, see it convert to Hangul live; ENTER or the arrow
  button submits). HUD: End Session, SRS rank (New / Beginner I–IV /
  Seasoned I–III / Master, from FSRS state + stability), Right/Wrong
  counter, Remaining count, and a thin red progress bar along the top
  edge that grows as cards are completed. No hint system (dropped in
  build 23): the Meaning stage was the question itself, the Sound stage
  (romanization) was the answer, and the formation-rule stage gave the
  answer away for binary points — until a genuinely useful hint is
  designed, the only pre-submit escape is a plain "Show Answer" button
  that reveals the answer, marks the card failed, and submits it so
  Next appears.
- The English hint is the plain English translation of the Korean
  sentence, with no highlighting (build 25 removed it: English often
  has no equivalent for Korean particles — 은/는, 이/가, 을/를 — so any
  highlighted English word was a guess).
  The blank itself has a hard 3px dark underline and shows a visible
  line even when empty (a non-breaking-space filler), so the target is
  obvious before anything is typed.
- Check is exact match against the answer + alternate answers (+ the
  grammar-target word replacement), after NFC normalization and
  whitespace collapsing (`normalizeAnswer` in `src/lib/srs.ts`) — a
  stray space or decomposed Hangul sequence no longer fails a correct
  answer. Correct → Good (3); wrong → Again (1). After a wrong answer
  the screen shows a targeted explanation for the classic confusions
  (`answerExplanation`): 에 vs 에서, and the consonant/vowel rule for
  은/는, 이/가, 을/를, 이에요/예요. Show Answer reveals without
  re-typing; Undo re-enables editing.
- Misses go to a Wrap-Up round and re-queue until answered correctly;
  the session ends with a Summary screen (Right/Wrong, accuracy).
- FSRS update, review log, and streak update happen locally and
  synchronously in `submitReview`. Mastery: 8 correct in a row masters a
  grammar point (it leaves the queue).
- Learn flow: session of up to the daily-limit grammar points
  (default 5, configurable in Settings) from all library decks in
  dependency order, each shown as a point page (red headword, Structure, About,
  Details, Examples). Green "I already know this" masters the point
  immediately (never tested again); the blue arrow advances and adds the
  point to your learned set. Then a Review stage tests the just-learned points
  (one card per point), re-queueing misses until every card is answered
  correctly, then a summary. Completing a session creates the FSRS review
  cards (due immediately).

## Content — audited Level 1 + new Level 2 (2026-11-09 overhaul, extended)

**TOPIK I Level 1 (11 lessons, 50 grammar points, 184 cloze cards,
113 lesson examples) was audited and reorganised into a learner-first
curriculum on 2026-11-09** (41 sentence corrections, 12
translation-only fixes, invalid alternate answers removed, and the
grammar points reordered so polite verb conjugation precedes
object-particle production — the original order had learners producing
을/를 before they had the verb endings to form natural sentences).
**TOPIK I Level 2 (11 lessons, 52 grammar points, 156 cloze cards,
104 lesson examples) was authored fresh in the same overhaul.** A
further pass added three gap grammar points — noun negation N이/가
아니다 (Level 1, position 2), subject honorific -(으)시- (Level 1,
position 33), and formal noun copula N입니다/입니까? (Level 2,
position 58) — and a **teaching guide for every one of the 102
points** (`prisma/seed-data/teaching-guides/`): a plain-English
meaning, step-by-step formation, a worked example, and a common trap.
Each lesson is exported through `teachLesson()`, which replaces the
point's description with the guide's meaning and prepends three notes
(formation, worked example, trap) ahead of the point's own notes.
Full details, including the lesson plans and the remaining gaps
(question words, numbers/counters, giving/receiving are not yet in the
deck): `docs/planning/korean-curriculum-overhaul-2026-11-09.md`.

The content is a curated draft, not independently reviewed by a Korean
educator. Lesson 22 (reported speech) is labelled an optional bridge —
it sits near or beyond the usual TOPIK I beginner boundary. The
seed data lives in `prisma/seed-data/topik1-level1/` and
`topik1-level2/` (plus `grammar-gaps.ts` and `teaching-guides/`);
`bun scripts/port-content.ts` ports both to JSON
(`mobile/src/content/topik1-level1.json`,
`topik1-level2.json`), and the Level 1 additions (build 15: 24 variant
practice cards and 11 worked examples from the Codex "Make Level 1
lessons and reviews reliable" patch) are merged at the port boundary
from `prisma/seed-data/topik1-level1/additions.ts`. Content is
versioned (`CONTENT_VERSION` in `src/db/index.ts`, now `topik1-v7`):
on a version bump the seed upserts every content row — including the
deck titles and the `deck_grammar_points` lesson/sort rows, so a
curriculum reorder reaches devices that already seeded an earlier
version — without touching review progress (keyed by grammar point
id, not by position).

Validation (`bun scripts/validate-grammar-catalogue.ts` for the source
catalogue, `npm run validate` / the seed Jest test for the ported
JSON) enforces, per level: Level 1 — 11 lessons, 50 grammar points,
184 cloze cards, 113 lesson examples; Level 2 — 11 lessons, 52
grammar points, 156 cloze cards, 104 lesson examples; every cloze
answer appears in its sentence; every grammar point has ≥ 2 lesson
examples and ≥ 3 cloze cards; no duplicate ids across both levels;
all related / extra-target ids exist; every card's
`introducedAtPosition` is in its level's range (Level 1: 1-50, Level
2: 51-102) and matches its owning point's global position for
single-target cards; global positions are continuous 1-102. The
catalogue validator additionally requires a teaching guide for every
point (each field ≥ 55 characters), the three teaching notes on every
point, and the prerequisite order (이에요/예요 before 아니다 before
은/는; honorific before -(으)세요; -습니까? before 입니다/입니까?).

## Not yet built (next steps, in roughly this order)

- **Push notifications** — no due-review reminders yet.
- **Audio / TTS** — no pronunciation audio on examples yet.
- **Vocabulary** — no vocab SRS track (the old app's menu said “soon” too).
- **Ghost reviews** — not built (Cram exists since build 12, but no
  ghost-review scheduling).
- **Close-answer detection** — no Levenshtein ≤ 1 “close” warning yet;
  checks are exact-match only (plus NFC/whitespace normalization).
- **TOPIK II Levels 3-6 and beyond** — content stops at TOPIK I Level 2 (99 points).
- **Capacitor / App Store release** — no EAS build/submit config yet.
- **Grammar point "Your Progress" panel, badges** — from the Bunpro
  walkthrough; not built yet.

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
