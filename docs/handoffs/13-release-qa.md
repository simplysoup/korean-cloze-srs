# Agent 13 — independent release QA handoff

**Branch:** `test/curriculum-v1-release-gates` → `integration/curriculum-v1`; **contract base:** `ba94b9ee7ae9374cb6e92d8bab17db38f095f9b6`.  
**Baseline reviewed:** `06985c8dbf72fd58e5431652ebc8bc42f083bafa`.  
**Release:** NOT AUTHORIZED. No integration/main merges, deployments or flags enabled by Agent 13.

## Scope

Only four new `mobile/__tests__/release-*.test.ts` files, `scripts/release-gates/**`, `docs/qa/curriculum-v1/**` and this handoff. Production app/store/API/native/backend, CURRICULUM_FLAGS, package locks and shared CI workflows untouched.

Acceptance: immutable flags OFF and isolated TOPIK II ON; 7 decks/145 vocabulary IDs; 6 readings/24 questions; 52 practice items; 721 grammar cards/54 curated alternatives/5 outcomes; target-only mastery; synthetic A/B detachment, delayed stale sync, unauthorized and offline behavior. Browser/native/staging execution is separately specified in manual-protocol.md.

## Evidence

**At publication:** 32 gates; 0 PASS, 0 FAIL, 10 BLOCKED, 22 NOT RUN. This is a *planning matrix* pending frozen integration head, not a release certificate. Security tests intentionally fail on the known unsafe account-store baseline and must be rerun after Agent 10. Staging CAS/unknown-field/recovery and native migration cannot be verified with in-repo mocked tests. The agent's container cannot resolve github.com to clone/run npm, so exact branch CI and Agent 00's authorized checkout must supply execution evidence; never claim tests passed locally.

## Dependencies / rollback / next actions

Agent 00 must provide disposable authorized staging environment and secure synthetic credentials, freeze integrated SHA after Agents 08–12, and perform any dependency/CI wiring. QA then runs validators, `npm run lint`, `npm run typecheck`, `npm test -- --ci`, `npx expo export --platform web` and manual browser/server/native protocols, recording full SHA and redacted artifacts. Rollback of this PR simply removes tests/docs/tools, **no user data migration or runtime change**. PR #8 remains draft.

**Disposition:** Web **BLOCKED**, native **BLOCKED**, per-feature activation **BLOCKED** pending independent evidence and owner authorization. Open risks: #9/#10/#11. Only Agent 00 merges into integration.
