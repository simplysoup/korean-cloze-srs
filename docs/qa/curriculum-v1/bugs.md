# Severity-ranked release risk ledger (Phase 1 source inspection; NOT frozen-head test results)

| Severity | Tracking | Risk | Closure evidence |
|---|---|---|---|
| P0 privacy | [#10](https://github.com/simplysoup/korean-cloze-srs/issues/10) | Shared IndexedDB `state-v1`, logout clears auth without detaching previous `state.doc` and stale async callbacks can cross account sessions. | Real A→B browser and delayed A callback tests with no visible/pushed cross-account history |
| P0 integrity | [#9](https://github.com/simplysoup/korean-cloze-srs/issues/9) | Full-snapshot push lacks proven server CAS, unknown-field preservation and two-device retry. Backend external to repo. | Staging stale-write rejection, grammar/vocab event union, old snapshot round-trip and recovery |
| P1 native | [#11](https://github.com/simplysoup/korean-cloze-srs/issues/11) | Unchanged SQLite CONTENT_VERSION may prevent corrected cards reaching existing devices. | Pre-fix device upgrade and unchanged review identities/due schedules |
| P1 release coverage | [PR #8](https://github.com/simplysoup/korean-cloze-srs/pull/8) | Phase 2 candidate not frozen. Old green CI is not release QA; eslint missing from older workflow. | Validators, lint, Jest, typecheck, export and browser/staging evidence on frozen SHA |
| P2 pedagogy | Educator queue (Agent 14) | New drafts are not educator-approved. | Accurate readiness labeling and approved flag policy |

For newly reproduced failures, cite SHA, repro, expected/actual, severity and redacted artifact in the relevant issue (new issue if unrelated). Do not modify production code to green tests or close a blocker from source inspection.
