# Agent 11 — Native SQLite content parity handoff

**Branch:** `fix/native-content-parity` → `integration/curriculum-v1` (Agent 00 is the only integration merger).
**Phase 2 contract base:** `ba94b9ee7ae9374cb6e92d8bab17db38f095f9b6`
**Issue:** #11. **Native release: BLOCKED. Do not enable native or merge to main.**

## Finding: content stored vs published

At the Phase 2 contract, the native initializer imports and seeds all six authored TOPIK bundles. It returns immediately if the stored `meta.contentVersion` is `grammar-gaps-v2-20261110`, so an installed database at that version does not receive any subsequently edited JSON, including changes associated with PR #7. Native also exposes Levels 3–6 from its database without checking the default-off `topik2Grammar` flag. The web `src/store/content.ts` intentionally loads only Levels 1–2 when that flag is off.

| Deck | Grammar points | Clozes | Examples | Physical native content | Published with flag OFF |
| --- | ---: | ---: | ---: | --- | --- |
| TOPIK I 1 | 65 | 229 | 143 | Yes | Yes |
| TOPIK I 2 | 59 | 177 | 118 | Yes | Yes |
| TOPIK II 3 | 32 | 96 | 64 | Yes | No |
| TOPIK II 4 | 25 | 75 | 50 | Yes | No |
| TOPIK II 5 | 24 | 72 | 48 | Yes | No |
| TOPIK II 6 | 24 | 72 | 48 | Yes | No |
| **Total** | **229** | **721** | **471** | **All 6** | **124 points / 406 clozes / 261 examples** |

## Changes

- Bump `CONTENT_VERSION` to `native-parity-v3-20261110`. Existing `grammar-gaps-v2-20261110`, unversioned and other older profiles reseed; a later `native-parity-vN` database is not downgraded by this code.
- Validate all bundled IDs, source target links and deck identities before writing. Seed all six authored bundles in **one synchronous Drizzle transaction** with the `contentVersion` update as the last statement. A transaction error leaves the prior version marker in place for retry.
- Update grammar points, lessons, positions, clozes, alternative answer JSON, English hints, worked examples, decks and memberships with stable IDs and UPSERT. The target and deck relation UPSERTs use their unique composite keys, so a pre-existing relation's `word_replacement`, `blank_index`, order or lesson is repaired. Obsolete relations attached to managed content are pruned; no user rows are deleted.
- Add additive, transactional legacy-content-column DDL for the six content table families only. No new migrations to user/sync tables.
- Keep all six bundles stored while gating *publication* in native deck browsing, library membership, grammar listing/detail, Learn, Review and Cram accessors. Existing advanced `library_decks` and `review_cards` are retained but hidden while the flag is off. The Non-TOPIK empty catalogue entry remains unpublished.
- Run the preexisting `migrateLibrary` after reseeding so legacy learned points map to corrected relations. It only adds absent rows and never resets schedules.

## Verification evidence and fixtures

- Structured repository JSON was inspected directly at the contract checkpoint: 229 grammar IDs, 721 cloze IDs, 471 worked examples, six decks, and no authored extra card targets.
- The `prisma/seed-data/review-qa/flagged-card-fixes.json` ledger contains 193 editorial dispositions. Each of the 193 `after` snapshots matches its authored mobile card for `fullSentence`, `sentenceWithBlank`, `answer`, `alternateAnswers`, and `englishHint` (0 missing IDs, 0 field mismatches). All remain **pending educator review**.
- Added Jest source-fixture tests: six-bundle expected identity counts, exact 193 editorial post-fix snapshots, flag-off/flag-on publication, collision/unknown-target preflight, and additive DDL generation. The tests establish source parity only, **not on-device transaction integrity**.
- CI completed typecheck, Jest, content validators and web export successfully. Pending: explicit `cd mobile && npm run lint`, native SQLite exported-database verification and Android/iOS smoke.

## Repeatable read-only SQLite verifier

`python3 scripts/native-parity/verify_sqlite.py --db BEFORE.db --skip-content --capture before.json`

After migrating that same test profile in an Expo native build:

`python3 scripts/native-parity/verify_sqlite.py --db AFTER.db --compare before.json`

The verifier compares all authored grammar, clozes, alternatives, target fields, examples, ordering, and deck associations directly to the six JSON bundles; flags extra/missing records, duplicate or orphaned relations; and checks exact user-table records, settings, and sync meta (excluding only `contentVersion` and `libraryMigrated` markers). It opens the exported SQLite file in read-only mode. On a legacy pre-library migration, expected new `library_decks` associations will require explicit review rather than silent exemption.

**CI (first two commits):** successful Mobile (Expo) GitHub Actions runs: content validators, `npm run typecheck`, `npm test -- --ci`, and web export. The workflow does not run `npm run lint`, nor does it provide an Android/iOS emulator. The read-only SQLite verifier still requires an exported test database to execute.

## Native regression matrix required before release

1. **Fresh native install:** all six content bundles present; only Levels 1–2 visible/learnable with the default flag off; counts 229/721/471 in SQLite and 124 published points.
2. **Existing old-version DB:** seed old native content + representative corrections missing; set `meta.contentVersion='grammar-gaps-v2-20261110'`; run `initDb`; assert updated source text and target fields, `native-parity-v3-20261110`, stable IDs and ordering.
3. **Multiple learner rows:** record exact row content/count for `review_cards`, `review_logs`, `library_decks`, `user_deck_progress`, `user_streaks`, `users`, `device_trust` and sync/settings meta. Compare byte-for-byte snapshots before vs after (except the preexisting one-time `libraryMigrated` insert on first boot). Include guest/local and two registered accounts.
4. **Crash inside transaction:** inject a failure after targets but before version update; restart; old version marker and original content must remain; rerun succeeds; third run is a no-op.
5. **Legacy content schema:** create tables without newer optional content columns; verify additive DDL and corrected content. Do not assume arbitrary missing user-table columns are compatible.
6. **Future version/downgrade:** a DB marked `native-parity-v4-...` must not be reseeded by v3 code; **an older app binary is not rollback-safe** because it can overwrite newer seed rows.
7. **Stale target repair:** deliberately corrupt `word_replacement`/`blank_index`, insert an obsolete target, move a point to an obsolete deck relation; after bump assert authored values and no extra managed targets.
8. **Cross-platform:** compare native SQL read responses to web bundles with each relevant flag state. Confirm route-level navigation gates with Agent 00, then Android/iOS emulator/device smoke.

## Rollback / release controls

**Do not revert an installed database by writing the old content version.** A downlevel app may reseed older content text. To withdraw this build, block native distribution, retain a pre-migration SQLite backup for targeted restoration, and ship a new forward content version containing any corrections. All learner history remains in the database; do not delete user rows or clear IndexedDB/SQLite as a workaround.

## Outstanding blockers

- Full Jest/lint/typecheck/content validator execution and real Android/iOS SQLite transactional smoke tests are not yet evidenced here.
- An actual interruption and multi-user database snapshot comparison are still required; pure manifest tests cannot establish these.
- Agent 00 should confirm all native Expo route/catalogue gates follow the same publication policy; this branch does not touch routes, shared flags, or web storage.
- Educator approval for TOPIK II and the 193 flagged-card remediation remains pending; this branch makes no linguistic approval claim.
