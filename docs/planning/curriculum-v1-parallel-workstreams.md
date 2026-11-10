# Curriculum v1: Parallel specialist handoff

**Owner:** Agent 00 (integration/release lead)  
**Shared base:** `integration/curriculum-v1` after commit
`c4bbfd7079eb30caa64828a4c75054dac73bafd9`.  
**Target:** every specialist PR targets `integration/curriculum-v1`, never `main`.
**Release:** no deployment or main merge without explicit owner authorization.

## Start a feature branch

```sh
git fetch origin
git switch --create feature/curriculum-v1-<agent>-<scope> origin/integration/curriculum-v1
# Work in your allocated modules; commit logical units with tests.
git push -u origin feature/curriculum-v1-<agent>-<scope>
# Open a draft PR: base integration/curriculum-v1, head your feature branch.
```

Before first implementation, inspect the frozen TypeScript interfaces in:
`mobile/src/features/vocabulary/contracts.ts`,
`mobile/src/features/contracts/answers.ts`,
`mobile/src/features/contracts/practice.ts`, and
`mobile/src/features/flags.ts`. Do not alter these contracts in your
feature branch without submitting a lead-reviewed change request.

## Disjoint feature directories

| Workstream | Preferred agent-owned paths | Files Agent 00 integrates |
|---|---|---|
| Vocabulary engine | `mobile/src/features/vocabulary/engine/**`, own unit tests | vocabulary controller facade, store/state, sync |
| Vocabulary UI | `mobile/src/features/vocabulary/ui/**`, new UI components and tests | app routes, header, learn/review navigation |
| Answer evaluation + feedback | `mobile/src/features/answer-evaluation/**`, isolated evaluator tests | existing grading callers, UI, mutation path |
| Topics and Hangul | `mobile/src/features/topics/**`, `mobile/src/features/hangul/**` | `app/hangul.tsx`, app navigation |
| Contrast and transfer | `mobile/src/features/practice/**` | shared review/learn flow as needed |
| Reading comprehension | `mobile/src/features/reading/**` | `app/reading.tsx`, app navigation |
| Linguistic QA | new validators, fixture datasets, authored content, docs | workflow YAML, content/version gates |

**Do not edit lead-owned files:** `mobile/src/store/index.ts`,
`state.ts`, `queries.ts`, `mutations.ts`, `sync.ts`,
`mobile/src/lib/sync-types.ts`, `api.ts`, `mobile/src/db/**`,
`mobile/src/app/_layout.tsx`, `mobile/src/components/AppHeader.tsx`,
`mobile/src/app/(tabs)/learn.tsx`, `review.tsx`,
`mobile/src/app/reading.tsx`, `hangul.tsx`,
`mobile/src/features/vocabulary/contracts.ts`, `controller.ts`,
`mobile/src/features/flags.ts`, `.github/workflows/**`, or
shared dependency/lockfiles. When a feature needs one, document an
exact proposed patch and required interface in your PR. Agent 00 will
apply it only after isolated review.

For new overlapping files or unforeseen ownership conflicts, request
allocation before committing. Never force-push or rewrite shared
history. Do not merge another feature agent's branch into your own
without notifying the lead: specify the dependency in the PR instead.

## Invariants each agent must protect

1. Grammar IDs, review card IDs, review log IDs, library deck IDs and
   release positions must not be silently rewritten or reassigned.
2. Vocabulary identity is a stable `entryId` in a separate namespace.
   No vocabulary progress is persisted/synced while backend round-trip,
   account isolation and concurrent device guarantees are unresolved
   (issues #9 and #10).
3. A contextually natural answer using an off-target construction is
   `valid_off_target`, not automatically wrong or target-mastered;
   unfamiliar answers without enough evidence are `unclassified`.
4. Every new learner-facing section remains behind its disabled flag.
   TOPIK II advanced content stays behind `topik2Grammar` pending
   instructor review and an explicit release decision.
5. Content readiness must be honest; authored or editorial-review
   material is not educator-approved. No copied proprietary textbook
   examples or audio.
6. Web uses `mobile/src/store` with IndexedDB, NOT SQLite.
   Native parity must be demonstrated independently or excluded.

## PR checklist (required for review)

- **Scope and ownership:** paths changed; what external integration
  patch is needed; dependency on another specialist PR.
- **Contract compliance:** exported signatures, sample call and state
  transitions; explanation of any requested deviations.
- **Tests:** unit tests including empty/offline/malformed/duplicate and
  lifecycle cases; validators plus mobile typecheck/Jest/Expo export.
- **Curriculum:** stable IDs, source/generated alignment, prereqs,
  explicit content-readiness/educator status, permitted citations.
- **Safety:** account boundaries, sync behavior, error handling,
  abort/retry semantics, data migration and rollback consequences.
- **Acceptance:** screenshots or reproducible manual steps for web,
  narrow native support statement, accessibility and responsive view.
- **Flags:** which flags remain disabled; conditions to turn any on.

Do not imply a green per-feature CI run proves end-to-end safe sync,
account recovery, native parity, or instructor review. Agent 00 reviews
and merges independent PRs one by one, in the prescribed order. The
integration branch then runs the full content generation and existing
validators, Jest, typecheck and Expo web export, followed by disposable
account/manual tests and backend verification before release.
