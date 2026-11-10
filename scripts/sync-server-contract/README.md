# Agent 09 — Sync server black-box contract harness

This is an **opt-in, mutating integration test** for a real **authorized local or staging** auth/sync server. It does not connect to production by default. The harness does not contain, provision or emulate the actual `~/korean-auth/server.js` implementation; a passing *fixture* test is not evidence that issue #9 is fixed.

No npm dependencies: Node.js 22+ with built-in `fetch` / `node:test`.

## Before running

1. Use a **disposable copy** of the real backend + DB schema, under your authorization. Record its git commit / file checksum, DB schema version, Node version, configuration flags (not secrets), and how the server is started. Do **not** point this script at production or real learner accounts.
2. Provision **three unique authenticated bearer sessions**: `SYNC_TOKEN_A` and `SYNC_TOKEN_A2` for the **same disposable account**, `SYNC_TOKEN_B` for a **different disposable account**. All associated sync snapshots must be empty at server version 0. A successful test leaves synthetic review history on both accounts; do not reuse these accounts for new full runs.
3. For session-rejection tests, prepare `SYNC_TOKEN_EXPIRED` and `SYNC_TOKEN_REVOKED` from disposable identities, after forcing expiration and logout respectively. The harness never signs users up or emails verification codes.
4. Do not use a public app server, real email addresses, live data, or credentials in logs. Run behind a loopback interface or authorized staging HTTPS origin.

```sh
export SYNC_BASE_URL=http://127.0.0.1:28768
export SYNC_TOKEN_A='REDACTED_DISPOSABLE_A_SESSION'
export SYNC_TOKEN_A2='REDACTED_DISPOSABLE_SAME_USER_OTHER_SESSION'
export SYNC_TOKEN_B='REDACTED_DISPOSABLE_OTHER_USER_SESSION'
export SYNC_TOKEN_EXPIRED='REDACTED_EXPIRED_SESSION'
export SYNC_TOKEN_REVOKED='REDACTED_REVOKED_SESSION'
# Optional if the actual server validates grammar identifiers:
# export SYNC_TEST_GRAMMAR_POINT_ID='existing_known_grammar_point_id'

node scripts/sync-server-contract/run.mjs \
  --mode=all --confirm-disposable --rounds=4 \
  --precondition-field=expectedVersion \
  --checkpoint=/tmp/agent09-synthetic-recovery.json \
  > /tmp/agent09-sanitized-report.json
```

For a **non-loopback staging URL**, the script rejects plain HTTP and demands exact matching, explicit opt-in:

```sh
node scripts/sync-server-contract/run.mjs \
  --url=https://staging.example.test \
  --allow-staging-origin=https://staging.example.test \
  --confirm-disposable --mode=all
```

Use the server's **actual documented** precondition field (`expectedVersion`, `baseVersion`, or `version`) with `--precondition-field=...`. The harness defaults to the **proposed** `expectedVersion`, not a claim that the current server supports it. The app currently sends no outer version at all.

### Restart / recovery

On the first `--mode=all` run, `--checkpoint` writes only synthetic event IDs and the latest server version to a new file, permissions `0600`; it will not overwrite an existing file. The recovery test is `BLOCKED` at this point. After the backend operator restarts the **same staging backend** (and independently records old/new process identity and DB location), execute:

```sh
node scripts/sync-server-contract/run.mjs \
  --mode=recovery-check --confirm-disposable \
  --checkpoint=/tmp/agent09-synthetic-recovery.json
```

The follow-up proves that the committed synthetic event IDs can still be pulled; it **cannot independently prove that a restart happened**. Attach operator restart evidence and DB persistence settings in the handoff before treating server restart as verified. Reinstall recovery likewise needs a genuinely fresh client profile and new login on staging; matching two pre-existing session tokens is not a reinstall test.

### Checks / evidence

The JSON report contains `PASS` / `FAIL` / `BLOCKED`, sanitized HTTP status, server version, payload top-level key names, and grammar/vocabulary event **counts** only. It never prints tokens, emails, raw user snapshots or request bodies. Preserve the complete report from the authorized server, not just the final status. A `BLOCKED` result exits **2**, a `FAIL` exits **1**, and a complete `PASS` exits **0** (only the independent recovery check can be complete without pending manual restart evidence).

`--mode=all` checks: v0 disposable-account preconditions; auth rejection; future `vocabularyProgress` and another unknown namespace round-trip; old-client write omitting the new keys; four two-device stale races requiring exactly one atomic 2xx and one 409/412; bounded re-pull/union/retry; duplicate stale replay with no version bump; offline device conflict/union; separate account isolation despite spoofed payload `user` metadata; malformed, sparse and oversized (>2 MB) snapshot rejection without mutation; expired/revoked tokens when supplied; restart checkpoint.

This harness uses a **synthetic event-log model** for future vocabulary progress: `{ vocabularyProgress: { schemaVersion: 1, events: [{id, vocabularyEntryId, rating, reviewedAt}] } }`. It is intentionally not a canonical app vocabulary schema. Backend validation must explicitly support or safely reject this schema; modify the harness **only with a documented change** if an agreed canonical extension schema supersedes it.

## Harness unit / negative-control tests

```sh
node --test scripts/sync-server-contract/run.test.mjs
```

The tests use a disposable, in-process HTTP fixture. They verify a reference CAS + unknown-field-preserving server is accepted **and** that a blind last-writer-wins implementation and a server that silently strips extensions are **rejected**. These tests validate the harness itself only. They do not close issue #9 or prove the real server behavior.

## Limitations and escalation to Agent 00

- Server source, real schema, restart procedure, rate limits, and recovery semantics are **unknown until an authorized backend checkout is inspected**.
- No backend patch or server migration is included. If CAS/preservation is missing, patch *only* the authorized backend project and record its SHA and isolated migration/rollback plan; do not copy backend credentials, DBs or private user content here.
- A client-side merge **before** a push cannot guarantee race safety. Agent 00 must add the server's agreed precondition to pushes, handle HTTP 409/412 distinctly, re-pull, union unique immutable event IDs and retry with a bound, without ever clearing local dirty state after a failed push.
- Unknown future fields must survive writes from older clients or the backend must reject incompatible old-client writes without changing the stored snapshot. Silent lossy acceptance is a hard failure.
- Never authorize release, merge to `main`, enable sync flags, or close #9 based on mocked green tests.
