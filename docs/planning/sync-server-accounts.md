# Sync + Server Accounts — Design (build 26)

> **Status:** Design approved by Nicholas 2026-11-09 ("get the sync + server
> accounts working"). This doc is the design; the implementation follows it.
> The goal: a user's progress survives a lost device, a cleared browser,
> and a second device. The app stays offline-first — the local SQLite DB
> is still the source of truth on the device, and sync is a backup/restore
> layer on top, not a replacement for local storage.

## Why now

Local-only storage has two costs that grow over time: (1) every user who
studies locally accumulates progress that later has to be migrated, with
conflicts to resolve; (2) every feature built on the local-only assumption
is another thing to retrofit for sync. Right now there is one user, so
the migration is trivial. Data loss is also the one unforgivable failure
for an SRS app — the whole value proposition is "trust it not to lose
reviews" — and the OPFS database has already shown it can fail to open.

## Server stack

Extend the existing auth backend (`~/korean-auth/server.js`, plain Node,
only dep nodemailer). **No new npm dependencies.** Persistent storage is
`node:sqlite` (built-in, verified working on the VPS Node v22.23.4 — it
prints an ExperimentalWarning but works). The server DB file is
`~/korean-auth/munpro.db`. The backend still binds 127.0.0.1:28768 only
and is reached through the static server's `/api` proxy (same origin, no
CORS). It is started by the `@reboot` crontab with Node 22; the crontab
does not need to change (the server.js file is replaced and the process
restarted manually).

### Server tables

```sql
users (id TEXT PRIMARY KEY, email TEXT UNIQUE, username TEXT,
       password_hash TEXT, salt TEXT, created_at TEXT)
sessions (token TEXT PRIMARY KEY, user_id TEXT, created_at TEXT, expires_at TEXT)
sync_state (user_id TEXT PRIMARY KEY, version INTEGER, updated_at TEXT, payload TEXT)
```

- `users.password_hash` is a scrypt hash (`crypto.scrypt`, built-in KDF).
  The local password (salted iterated SHA-256 in the device DB) is kept
  for offline login; when a password is set, both stores are updated.
- `sessions.token` is 32 random bytes, hex-encoded. 30-day expiry.
  A token is invalidated on logout. Expired sessions are deleted lazily
  (on use) and by a periodic sweep.
- `sync_state.payload` is the sync document as JSON (see below).
  `version` increments on every successful push. One row per user.

## The sync document

A full snapshot of the user's per-user state — not an incremental log.
The data is small (48 grammar points; review logs are the only growing
table, and a few hundred entries is still tens of KB), so a snapshot is
cheap and far easier to reason about than change tracking. Incremental
sync is a future optimisation, not needed at this scale.

```json
{
  "version": 3,
  "updatedAt": "2026-11-09T21:00:00.000Z",
  "user": { "username": "nickbode71", "email": "nickbode71@gmail.com" },
  "reviewCards": [ { "grammarPointId": "...", "stability": 1.2, "difficulty": 3.1,
                     "reps": 5, "lapses": 0, "state": 2, "due": "...",
                     "lastReview": "...", "streakCorrect": 5, "masteredAt": null,
                     "peakStability": 2.0, "lastClozeCardId": "..." } ],
  "reviewLogs": [ { "id": "...", "reviewCardId": "...", "grammarPointId": "...",
                    "rating": 3, "reviewedAt": "...", "stability": 1.2,
                    "difficulty": 3.1, "elapsedDays": 1.0, "scheduledDays": 2.5 } ],
  "libraryDecks": [ { "deckId": "deck_topik1_level1", "addedAt": "..." } ],
  "streak": { "currentStreak": 4, "longestStreak": 9, "lastStudiedDate": "2026-11-09" },
  "settings": { /* the getUserSettings() blob, plus updatedAt */ },
  "dailyLearned": { "2026-11-09": 3 }
}
```

What is NOT in the document (and why):
- Content tables (grammar points, cloze cards, lesson examples, decks) —
  they are seeded from the content bundle and identical on every device.
- `device_trust` — per-device, stays local.
- `meta` keys that are not per-user state (`contentVersion`,
  `sessionUserId`, `libraryMigrated`, `deviceId`) — not synced.
- `user_deck_progress` — legacy, no longer written to.

## Sync protocol

**Last-write-wins is NOT acceptable.** If device A and device B both
study without syncing, last-write-wins discards one device's reviews.
So the pull step MERGES the server document into the local DB, per
table, with rules that never lose a review:

| Table | Merge rule |
|---|---|
| reviewCards | Per grammar point, keep the card with the later `lastReview`; tie (or both null) → higher `reps`. A card that exists on only one side is kept. |
| reviewLogs | Union by `id` (logs are append-only). |
| libraryDecks | Union by `deckId`, keep the earlier `addedAt`. |
| streak | Max `currentStreak` and `longestStreak`; later `lastStudiedDate`. |
| settings | The blob from the newer document (by `updatedAt`). Settings changes are rare; a field-level merge is overkill. |
| dailyLearned | Per date, the max count. |

**Sync flow** (`syncNow()`, in `mobile/src/lib/sync.ts`):
1. Pull the server document. If the server has none (version 0), skip to 3.
2. If `server.version > local.lastSyncedVersion`, merge the server
   document into the local DB (in one transaction). Set
   `lastSyncedVersion = server.version`. If the merge changed local
   state, the local copy is now dirty.
3. If the local copy is dirty (see below), push the local document to
   the server. The server stores it with `version = server.version + 1`
   and returns the new version. Set `lastSyncedVersion` to it and clear
   the dirty flag.

**Dirty tracking.** A `syncDirty` flag in the local `meta` table. Set to
`true` by the writes to synced tables: `submitReview`,
`completeLearnSession`, `markPointKnown`, `updateUserSettings`,
`addDeckToLibrary`, `removeDeckFromLibrary`. Cleared on a successful
push. (Streak updates happen inside `submitReview`'s transaction, so
they are covered by that flag.)

**When sync runs.** After login/verify and after auto-login (so a new
device gets the server state immediately); on app start when logged in;
after a review session and after a learn session complete (so progress
is backed up promptly); and on demand — a "Sync now" button in
Settings, showing the last synced time and status. Sync is
best-effort: if the server is unreachable, the call fails silently and
the app keeps working locally (offline-first is preserved). The Settings
screen shows the last synced time, or "never synced" / "offline".

**First sync (Nicholas's migration).** His device has local progress
and the server has no document. Pull returns version 0; local is dirty;
push uploads his progress as version 1. No merge, nothing lost. His
review progress is untouched by the migration (it is the payload).

**New device.** Fresh local DB, no progress. Login by email code (the
server creates/returns the user and a token). Sync pulls the server
document (version N > local 0), merges it in (local is empty, so this
is a straight apply), sets `lastSyncedVersion = N`. His progress is on
the new device.

## API

All under `/api/`, same-origin via the static server proxy. Authenticated
endpoints take `Authorization: Bearer <token>`.

| Endpoint | Request | Response |
|---|---|---|
| `POST /api/auth/request-code` | `{email}` | `{ok, delivery}` (unchanged) |
| `POST /api/auth/verify-code` | `{email, code}` | `{ok, token, user: {id, email, username}}` — creates the server user on first verify |
| `POST /api/auth/login-password` | `{email, password}` | `{ok, token, user}` — server password login (for a new device; the old local-only path stays as the offline fallback) |
| `POST /api/auth/set-password` (auth) | `{password}` | `{ok}` — stores the scrypt hash server-side |
| `POST /api/auth/logout` (auth) | — | `{ok}` — invalidates the token |
| `GET /api/sync/pull` (auth) | — | `{ok, version, updatedAt, payload}` or `{ok, version: 0, payload: null}` |
| `POST /api/sync/push` (auth) | `{version, updatedAt, payload}` | `{ok, version}` — the server stores it with `version = server.version + 1` |
| `GET /api/auth/health` | — | `{ok, emailConfigured, sync: true}` |

**Limits.** Sync payload max 2 MB (the document is far smaller; this is
abuse protection). Auth rate limits unchanged (5/hr per email, 30/hr
per IP for codes; password login 10/hr per email, 30/hr per IP).
Request bodies over the limit are rejected (the existing 10 KB cap on
auth bodies is raised for the sync push only).

**Client token storage.** The session token is stored in the local
`meta` table (`sessionToken`). The device DB already holds the password
hash, so a token there is no worse; a future improvement is
expo-secure-store (a native module, complicates the web build).

## Client changes

- `mobile/src/lib/api.ts` (new) — `fetch` wrappers for the endpoints
  above, token handling, and a typed error for "server unreachable"
  (so sync can fail silently while auth surfaces its errors).
- `mobile/src/lib/sync.ts` (new) — `serializeLocalState()`,
  `applyServerState()` (the merge, in one transaction),
  `syncNow()`, dirty-flag helpers, `lastSyncedVersion` / `lastSyncedAt`
  in meta.
- `mobile/src/components/AuthScreen.tsx` — capture the token from
  `verify-code`; server password login (fall back to the local check
  when offline); `set-password` calls the server endpoint as well as
  the local store.
- `mobile/src/app/_layout.tsx` — trigger a sync after login/verify
  (`handleAuthed`) and after auto-login on app start.
- `mobile/src/app/(tabs)/review.tsx`, `learn.tsx` — trigger a sync
  after a session completes (best-effort, fire-and-forget).
- `mobile/src/app/settings.tsx` — "Sync now" button + last synced time
  and status.
- `mobile/src/db/index.ts` — dirty-flag calls in the six write
  functions; a `getSyncSnapshot()` / `applySyncSnapshot()` pair (or
  equivalent) used by `sync.ts`; `CONTENT_VERSION` unchanged (the
  content did not change).

## What this does NOT do

- No incremental sync (full snapshot; fine at this scale).
- No multi-device live collaboration (one user, usually one device at a
  time; the merge covers the occasional second device).
- No server-side password reset (the email-code route is the reset).
- No Google/Meta login (still future).
- No public launch (the site is still tailnet-only; that is a separate
  step).
