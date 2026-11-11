# Agent 13 — independent Curriculum v1 release QA

**Reference integration:** `06985c8dbf72fd58e5431652ebc8bc42f083bafa` (Phase 1 review only).  
**Branch base:** Phase 2 contract `ba94b9ee7ae9374cb6e92d8bab17db38f095f9b6`.  
**Release:** NOT AUTHORIZED. PR #8 must remain draft; all eight flags remain OFF.

The tracked `gates.json` contains **32 separate gates**. Track A checks build-36 parity with flags OFF. Track B turns on exactly one feature per isolated test build. SEC checks real account boundaries and authorized *staging* synchronization; NATIVE checks upgrades on a simulator/device, independently from web. OPS checks frozen-sha builds, CI and release authorization.

`PASS` requires tested SHA, environment, exact procedure, expected/actual and redacted evidence artifact. `FAIL` requires repro or issue. `BLOCKED` needs a named missing prerequisite. `NOT RUN` is not a pass. The fail-closed verifier is `node scripts/release-gates/verify-evidence.mjs --release`. Never infer real backend, browser or native safety from passing mocks or source inspection.

## Frozen candidate commands

Run from a clean checkout, record full SHA and exit codes. The port/content-generation commands should run only in a disposable clone; check `git status --short` afterward.

```sh
git rev-parse HEAD
git status --short
node scripts/validate-content.mjs
node scripts/validate-flagged-card-fixes.mjs
node scripts/validate-topik2-contrast.mjs
node scripts/validate-answer-audit.mjs
node scripts/validate-vocabulary.mjs
node scripts/validate-language-topics.mjs
node scripts/validate-answer-feedback.mjs
node scripts/validate-comprehension.mjs
node scripts/validate-practice.mjs
node scripts/validate-linguistic-qa.mjs
cd mobile
npm ci
npm run lint
npm run typecheck
npm test -- --ci
npx expo export --platform web
```

Deterministic build-36 progress comparison can be run with `node scripts/release-gates/compare-snapshots.mjs baseline.json candidate.json`; it rejects untagged/non-synthetic fixtures and compares stable card schedules/log IDs. See the example under `scripts/release-gates/fixtures/`. The first CI checkpoint with confirmed #10 failures is in `ci-checkpoint.md`.

Lint is an independent gate even if the existing CI workflow omits it. Test `mobile/__tests__/release-*.test.ts` on the frozen candidate. Account-isolation acceptance tests may be intentionally red until Agent 10's patch lands; do not suppress them. Tests executed on earlier SHAs do not clear the current gate.

## Dispositions

**Web:** BLOCKED until account isolation (#10), applicable real-server concurrency/unknown-field preservation (#9), build-36 parity and all operational gates pass. **Native:** BLOCKED (#11), pending migration/upgrade and simulator verification. **Features:** individually BLOCKED until Track B evidence and owner/educator-policy decisions. All production code, flags, shared workflows, migrations and backend are outside Agent 13's ownership. Only Agent 00 may merge integration; only owner may authorize main/deploy.
