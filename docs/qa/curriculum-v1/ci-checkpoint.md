# Agent 13 — first independent CI checkpoint (not frozen release QA)

**QA source branch:** `test/curriculum-v1-release-gates` from Phase 2 contract `ba94b9ee7ae9374cb6e92d8bab17db38f095f9b6`. This is a test-only branch, NOT the frozen integrated application candidate. All observed progress fixtures are synthetic. No real browser/staging/native acceptance tests have been run.

## Automated run details

**GitHub Actions run:** https://github.com/simplysoup/korean-cloze-srs/actions/runs/42927321923  
**Full QA commit:** `d5481a3fbb2ee37c89b2ccad6567efda511bc3e8`  
**Environment:** GitHub Actions hosted `mobile` job, npm ci / TypeScript / Jest, Node supplied by setup-node, no production backend.
**Expected:** all release safety tests pass before declaring account isolation safe.
**Actual:** 30 of 31 Jest suites passed, **238 of 241 tests passed**. The 3 failures all belong to `mobile/__tests__/release-account-isolation.test.ts`, with redacted synthetic data only. `npm ci`, content reproducibility, seven content/grammar validators, and typecheck passed. `expo export --platform web` was skipped because Jest failed; this run does not report a standalone lint step.

### Reproduced pre-fix failures — issue #10

1. **A logout:** seed A's in-memory `reviewLogs` and `libraryDecks`; call `clearUserRecord()`. Expected no A progress readable after account clearing, actual A event remains in `state.doc`. Failing assertion line 57.
2. **A to B switch:** after setting B's record without clearing browser state, expected no A review events or deck visible to B, actual `qa-event-a` survives. Failing assertion line 67.
3. **Late A sync across B sign-in (independent):** create deferred `syncPull('qa-token-A')`; clear A auth, switch to B, explicitly replace document with clean B fixture, set `qa-token-B`, release A response. Expected no A event in B document, actual A event is inserted. Failing assertion line 94. This probe separates stale callback contamination from the ordinary cache-detachment failure.

These are automated synthetic unit/integration probes, **not** proof a physical browser account-switch test has run; the separate `SEC01` and `SEC02` gates remain BLOCKED until the frozen candidate and full browser observations exist.

### Automated checks that passed on this QA branch

- New `release-flags.test.ts`: default-OFF / isolated TOPIK II ON; unique ordered deck/grammar IDs.
- `release-content.test.ts`: 7 vocab decks / 145 entries, 6 reading passages / 24 questions, 52 practice exercises, and local-only progress.
- `release-answer-feedback.test.ts`: 721 canonical answers, 54 curated alternatives, five grading outcomes, guarded mastery.
- `release-evidence.test.ts`: 32-gate matrix integrity and deterministic synthetic history comparator.

**Disposition:** no release approval. Verify again on a frozen Agent 00 integration SHA with #10 remediation. Never suppress or weaken a failing security assertion to make CI green. Real staging CAS and native migration remain #9/#11.
