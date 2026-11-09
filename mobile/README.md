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

### Auth (email-code, via the VPS backend — build 8)

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
primary flow. No social login. Accounts and progress live in the
device SQLite file; the server never sees study data.

### Settings (build 12)

`/settings`: global daily new-items limit (1–10, default 5) and batch
size (1–10, ≤ daily limit), hide streak, vacation mode (pauses reviews
and learning; turning it off bridges the streak), and review toggles
(show SRS rank, Undo, lightning mode, focus mode, max reviews/day).
The daily limit and batch size apply to the whole library — there are
no per-deck settings (build 16 removed them with the active deck).

### Navigation (build 17)

The header is a teal-navy bar: the brand on the left, and Learn / Review /
Content / Practice on the **right**, next to the icons and the user chip
(24px horizontal padding, so nothing sits against the edge). The search,
bell, and help icons are one SVG set (`src/components/icons.tsx`,
react-native-svg, 22px, strokeWidth 2) — not mismatched text glyphs. The
bell carries a count badge: coral-red when there are notifications, grey
when the count is 0 (there is no notification source yet, so it is 0 and
greyed out). The Grammar Library (`(tabs)/grammar.tsx`) is modelled on
Bunpro's grammar_points: a title + total count, a toolbar (search +
Hide Learned Items, which shows only New points), and one collapsible
row per TOPIK level, collapsed by default; expanding a level shows its
lessons, each with its points and a status pill (New / Learning /
Mastered) — no hardcoded level badge. A search or the Hide Learned
filter auto-expands the levels that still have points.

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
- The English hint's 'direct' highlight is the English word for the
  blanked Korean grammar — the copula ("I [am] a student"), the
  preposition ("I go [to] school"), "also", "and"/"with", "Oh," — never
  the noun it attaches to (build 17 fixed 48 cards/examples that
  highlighted the noun or the whole phrase; the five instruction-style
  practice hints have no word to highlight and stay unhighlighted).
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

## Provisional content — read this before using the app to study

**All 48 grammar points, 178 cloze cards, and 109 lesson examples
(TOPIK I Level 1) are copied VERBATIM from the old app's seed data
(`prisma/seed-data/topik1-level1/`).** They were authored by Nicholas
with basic Korean and are marked provisional in the JSON itself
(`provenance` field) and here. They will likely be regenerated later by
a high-performing English–Korean multimodal model. No new cards were
generated in this increment, and no grammar content was invented —
except the Level 1 additions (build 15): 24 variant practice cards and
11 worked examples from the Codex "Make Level 1 lessons and reviews
reliable" patch, merged in `scripts/port-content.ts` from
`prisma/seed-data/topik1-level1/additions.ts`, plus four content
corrections from the same patch (좋다 → 좋은 is regular, not
irregular; -고 싶다 3rd person uses -고 싶어하다; the -아/어서 tense
absolute softened; the 안 있어요 caution softened; 에/로 accepted as
an alternate for "학교에 가요" / "회사에 가요"). Content is versioned
(`CONTENT_VERSION` in `src/db/index.ts`, now `topik1-level1-v3`): on a
version bump the seed upserts every content row, so new and corrected
content reaches devices that already seeded an earlier version without
touching review progress.

Validation (`npm run validate` / the seed Jest test) enforces:
11 lessons, 48 grammar points, 178 cloze cards, 109 lesson examples;
every cloze answer appears in its sentence; every grammar point has
≥ 2 lesson examples; no duplicate ids; all related / extra-target ids
exist.

## Not yet built (next steps, in roughly this order)

- **Sync / cloud backup** — accounts are local-only; data lives only in
  the device SQLite file. Export/import is not built yet.
- **Push notifications** — no due-review reminders yet.
- **Audio / TTS** — no pronunciation audio on examples yet.
- **Vocabulary** — no vocab SRS track (the old app's menu said “soon” too).
- **Ghost reviews** — not built (Cram exists since build 12, but no
  ghost-review scheduling).
- **Close-answer detection** — no Levenshtein ≤ 1 “close” warning yet;
  checks are exact-match only (plus NFC/whitespace normalization).
- **TOPIK I Level 2 and beyond** — content stops at Level 1 (48 points).
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
