# Curriculum v1 integration contract (Agent 00)

**Baseline:** `c17cfab84f978056e55665b40fbeaec92ca044ce` (draft PR #7).
**Integration branch:** `integration/curriculum-v1`.
**Contract version:** 1 (frozen before feature work).
**Release disposition:** NOT RELEASED. All workstream flags disabled.

## Existing ancestry and non-destructive policy

Stacked draft PRs are #2 (six TOPIK decks), #3 (reference ledger), #4
(grammar/vocab/topic foundations), #5 (answer alternatives), #6 (advanced
contrasts), #7 (193-card remediation). Each head is an ancestor of the next.
`main` has diverged from this sequence: do not rebase, squash, or rewrite
their history while other agents work. No agent may merge to main or deploy.

The web runtime reads `mobile/src/store/` and persists a
`SyncDocument` as an IndexedDB snapshot. Native SQLite is separate
(`mobile/src/db/`) and is NOT automatic parity. The server is an external
`~/korean-auth/server.js`, not code present in this repository.

## Frozen contracts and owners

- `mobile/src/features/vocabulary/contracts.ts`: vocabulary deck, prompt,
  progress, result, reveal and Promise-based controller interfaces.
- `mobile/src/features/contracts/answers.ts`: exact answer-outcome strings,
  explanation, alternatives, optional diagnostic, explicit target-mastery flag.
- `mobile/src/features/contracts/practice.ts`: stable exercise IDs,
  prerequisites, readiness, response types, explanations and reading passages.
- `mobile/src/features/flags.ts`: eight default-DISABLED static workstream flags (including unpublished
  TOPIK II grammar).

Agent 00 exclusively owns contract changes, web-store, sync, auth API,
navigation, existing screens, native DB, shared dependencies and CI files.
Specialist agents work in distinct feature modules and request any change
to an owned file as an integration patch in their PR. Each feature branch
must be created AFTER this contract commit and target
`integration/curriculum-v1`. Only Agent 00 merges after independent review.

## Answer safety contract

`target_correct` is the only outcome eligible for target mastery;
`valid_off_target`, `near_miss`, `incorrect` and `unclassified`
must not silently award it. The last category is required when a learner
provides an unfamiliar response without enough linguistic evidence to call
it incorrect. Display known valid alternatives after answering and give
diagnostic hints only when supported. Preserve existing live grading behind
the disabled `answerFeedback` flag until policy and migration tests pass.

## Web/native content parity gate

The original web `store/content.ts` bundled only TOPIK I despite six authored
and generated grammar decks; native `db/index.ts` bundles all six. The web
catalogue now knows about all six but the four advanced bundles are gated by
`topik2Grammar: false` pending educator approval and release verification.
Catalogue placeholders remain once each, with no duplicate deck IDs.
Native seed short-circuits when `CONTENT_VERSION` is unchanged; therefore
editorial fixes from PR #7 will *not* reseed existing native SQLite profiles
unless a reviewed version migration is implemented. Native remains excluded
from release until explicitly tested.

## State and sync blockers (do NOT bypass)

The existing server's behavior for unknown JSON keys and concurrent device
pushes has not been verified. New vocabulary progress MUST NOT be written to
or relied on in the server `SyncDocument` until a compatible backend
migration and a two-device race test prove preservation. When added, it must
be optional for old snapshots, keyed by stable vocabulary entry ID, and
kept separate from `grammarPointId` records. Append-only unique review
event IDs must survive two-device unions. Merely adding SQLite tables does
not implement web persistence.

Test signed-in account switching and logout against indexed local snapshots:
a single shared IndexedDB key is not sufficient evidence of account isolation.
Use fake accounts and disposable state ONLY. Verify recovery from verified
server snapshots before promising reinstall recovery.

## Workstream merge order and acceptance

1. Vocabulary engine (no UI) — idempotent scheduling, stable IDs, offline
   behavior and separately scoped tests.
2. Vocabulary UI — consumes published controller types, behind flag.
3. Answer evaluation and feedback — correct/out-of-target/near-miss/
   unknown cases, no unsupported condemnation or mastery.
4. Topics and Hangul — prerequisites, content readiness, accessible UI.
5. Contrast/transfer practice — no incidental grammar mastery.
6. Reading comprehension — passage/questions readiness gates.
7. Linguistic QA and release checks — authored/generated parity,
   regression cases and educator approval for relevant copy.

For every PR: verify changed paths against ownership; review isolated diff;
run new unit/content checks; resolve blockers before merge. Do NOT batch
merge failing PRs. For each enablement, require explicit functional and
sync gates, native supported-or-excluded decision, accessible responsive UI,
and copy accurately marked as unreviewed when applicable.

## Required release verification

```sh
bun scripts/port-content.ts
node scripts/validate-content.mjs
node scripts/validate-flagged-card-fixes.mjs
node scripts/validate-topik2-contrast.mjs
node scripts/validate-answer-audit.mjs
node scripts/validate-vocabulary.mjs
node scripts/validate-language-topics.mjs
cd mobile
npm ci
npm run typecheck
npm test -- --ci
npx expo export --platform web
```

Verify deterministic generated files against authored sources. Manually
exercise fresh and existing users, empty library, offline restart, concurrent
devices, expired token/recovery, vocab review, unfamiliar/near-miss answers,
responsive viewports and both supported platforms. Treat untested native as
out of scope. No content is educator-certified without signoff; no
copyrighted textbook sentences without permission.

## Rollback boundary

Until backend round-trip and account isolation tests pass, this commit
changes *only type declarations, disabled feature switches and planning
documentation*. No data migration is run and `CONTENT_VERSION` remains
`grammar-gaps-v2-20261110`. Reverting this contract commit removes the
new surfaces without touching any learner progress. Later migration
rollbacks need a forward-compatible format and an independently tested
restore from a verified per-user snapshot; never roll back by deleting
reviews or resetting grammar IDs/positions.
