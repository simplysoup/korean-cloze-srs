# Agent 09 handoff — Server sync correctness and two-device CAS

**Scope:** Issue [#9](https://github.com/simplysoup/korean-cloze-srs/issues/9). App branch `audit/server-sync-cas`, based on Agent 00 contract checkpoint `06985c8dbf72fd58e5431652ebc8bc42f083bafa` on `integration/curriculum-v1`. PR targets `integration/curriculum-v1`; **only Agent 00 merges**. No backend rollout or `main` merge authorized.

## Verified app-side facts (not proof about the server)

Inspected `mobile/src/lib/api.ts`, `mobile/src/store/sync.ts`, `mobile/src/store/state.ts`, `mobile/src/lib/sync-types.ts`, `docs/planning/sync-server-accounts.md`, and the integration contract from the above SHA.

1. `syncPush(token, doc)` POSTs **`{updatedAt: doc.updatedAt, payload: doc}`** to `/api/sync/push`. The historical design describes `{version, updatedAt, payload}`, but the current implementation sends **no** outer base/expected server version. The caller discards the HTTP status code and returns JSON only.
2. `syncNow()` pulls, merges locally if the server version is newer, then pushes a full snapshot without a server-side precondition. A second device can commit between the pull and push; neither in-process `syncInFlight` nor pre-push merge protects across devices.
3. `SyncDocument` is grammar-only; it has stable `reviewLogs[].id` for deduplication, `reviewCards`, `libraryDecks`, `streak`, `settings` and `dailyLearned`. Unknown future optional keys are **not declared**. `getSyncSnapshot()` shallow-spreads the in-memory doc, but `mergeServerDoc()` copies only recognized fields; an already-populated client merging a server document with future keys does not propagate those keys into local state.
4. The authoritative backend is described as `~/korean-auth/server.js`, with `node:sqlite` `sync_state(user_id, version, updated_at, payload)`, bound to 127.0.0.1:28768 behind `/api`. This is a **design document description, not inspected backend code or schema**.
5. The authenticated GitHub installation can access the public app repo but does not expose a `korean-auth` repository. The local sandbox has no `~/korean-auth` checkout. We **cannot** claim backend access or real-server validation.

## Proposed target server contract — contingent on backend confirmation

| Concern | Observed/proposed wire contract | Real backend status |
| --- | --- | --- |
| Pull | `GET /api/sync/pull`, bearer session; `{ok,version,updatedAt,payload}`; v0 with null payload | **BLOCKED** (server not inspected) |
| Push | `POST /api/sync/push`, bearer; full snapshot + mandatory `expectedVersion` (or documented alternative) | **BLOCKED**; current client lacks precondition |
| Version | Server-owned monotonic integer per **account**, starts at 0, increments only on committed mutation; payload's `version` is not authoritative | **BLOCKED** |
| CAS | Atomically commit only if stored version equals expected version; otherwise HTTP 409/412, return currentVersion; no changes on conflict | **BLOCKED** |
| Unknown fields | Round-trip optional namespaces; old-client omission must preserve stored fields or be rejected before mutation | **BLOCKED** |
| Namespaces | Grammar log IDs and vocabulary event IDs distinct; vocabulary records keyed by stable vocabulary identifiers | **BLOCKED** |
| Ownership | Derive user ID from authenticated session, never from client-supplied `payload.user` | **BLOCKED** |
| Validation | Reject malformed/sparse/oversized payload atomically; design says 2 MB maximum | **BLOCKED** |
| Tokens | Expired/revoked sessions cannot pull/push; account switching does not inherit other users' data | **BLOCKED** |
| Persistence | Committed snapshot survives backend process restart and fresh login/device recovery | **BLOCKED** |
| Retry | Replaying an already-committed stale request yields conflict or idempotent unchanged acknowledgement, never a new destructive mutation | **BLOCKED** |

**CAS implementation sketch (backend owner only):** use a SQLite transaction for read/validate/conditional update, or one conditional `UPDATE sync_state SET version = version + 1, ... WHERE user_id = ? AND version = ?` guarded by `changes === 1`. The initial v0 insert must also be race-safe (`INSERT` uniqueness on `user_id`, reject on collision). Respond 409/412 to a mismatch, retaining the existing payload. Keep a compatibility strategy for old writers that have no precondition: safely reject them or gate them before introducing the new format. Don't accept arbitrary full replacement snapshots from them.

## Test results

| Invariant | Local test-harness result | **Real auth server** |
| --- | --- | --- |
| Harness accepts CAS + unknown-field-preserving fixture | **PASS** | **BLOCKED** |
| Harness rejects blind last-writer-wins fixture | **PASS** | **BLOCKED** |
| Harness rejects lossy old-client overwrite fixture | **PASS** | **BLOCKED** |
| Missing authorization/disposable guard refuses execution | **PASS** | **BLOCKED** |
| Three v0 disposable sessions / two session tokens for same user | Not run against real server | **BLOCKED** |
| Future vocabulary + unknown-field push/pull | Not run against real server | **BLOCKED** |
| Grammar-only old-client update after future fields exist | Not run against real server | **BLOCKED** |
| Four interleaved two-device CAS races, losing client union/retry | Not run against real server | **BLOCKED** |
| Duplicate stale retry, delayed/offline updates, stable event IDs | Not run against real server | **BLOCKED** |
| User isolation, revoked/expired sessions | Not run against real server | **BLOCKED** |
| Malformed/sparse/oversize payload rejection | Not run against real server | **BLOCKED** |
| Process restart, new-device reinstall/recovery | Not run against real server | **BLOCKED** |

Validation: `node --check scripts/sync-server-contract/run.mjs`; `node --test scripts/sync-server-contract/run.test.mjs` — **5 tests passing**, including negative controls. These are test-harness-only results, **not a production readiness verdict**.

Harness documentation and operation: [`scripts/sync-server-contract/README.md`](../../scripts/sync-server-contract/README.md). Reports are sanitized: HTTP statuses, versions, top-level JSON key names and review-event counts, **never** raw user snapshots or tokens.

## Agent 00 handoff — required *after* backend verification

- Agree on one required precondition field (`expectedVersion` recommended) and conflict response (409/412 with current server version), then add that to `mobile/src/lib/api.ts` and expose response HTTP status. Existing `syncPush` cannot detect a conflict reliably.
- Implement bounded conflict retry in `mobile/src/store/sync.ts`: on 409/412, re-pull, merge current server document with unchanged local writes, union immutable grammar **and independent vocabulary** event IDs, update expected version, retry at most a bounded number of times, and persist `syncDirty=true` while outstanding. Do not clear dirty state for offline/unauthorized/conflict responses. Avoid losing edits that occur while an async request is in flight.
- Update `mobile/src/lib/sync-types.ts` only once the vocabulary schema is agreed; optional old snapshots must continue to parse. `mobile/src/store/state.ts` must not drop newly introduced namespaces on merge. Coordinate account isolation with Agent 10; merging a document into the wrong logged-in account is also unacceptable.
- Keep all new flags disabled until authorized server evidence and account-isolation verification are attached. No server rollout or production data migrations in this PR.

## Backend owner requirements / release and rollback

1. Provide path/repo + read access to the **authorized disposable backend checkout**, exact commit or file checksum, Node version, SQL schema, environment variable names (redact values), and a staging base URL reachable from the operator machine.
2. Before patching, back up the staging DB; run harness against **fresh synthetic users**. If existing backend overwrites or strips fields, document the failing request/version trace and block vocabulary sync.
3. If patch required, make an independent backend branch/PR with transactional CAS, forward-compatible JSON preservation/rejection, payload size validation and session ownership tests. Migration must be additive and reversible, with no review-ID resets or lossy rollback. Do not deploy without separate owner approval.
4. Re-run on the exact patched backend build, archive redacted request/response/versions; restart the server and verify retained synthetic events with operator restart proof. Separately verify recovery with genuinely fresh client login, not only a second already-authenticated token.
5. Only after #9 and account-isolation issue #10 pass may Agent 00 consider enabling vocabulary persistence. Current release remains **BLOCKED**.

**Final disposition:** **BLOCKED — real backend source, compatible staging instance, and disposable test credentials unavailable**. Issue #9 remains **OPEN**. No backend patch, deployment, migration or client changes were made in this workstream.
