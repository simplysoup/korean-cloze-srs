# Agent 10 — Web account isolation handoff

**Tracking:** [issue #10](https://github.com/simplysoup/korean-cloze-srs/issues/10)
**Branch:** `fix/account-scoped-web-state`
**Base:** Phase 2 published contract `ba94b9ee7ae9374cb6e92d8bab17db38f095f9b6`
**PR base:** `integration/curriculum-v1` (Agent 00 sole merger)
**Scope:** `mobile/src/store/state.ts`, `mobile/src/store/auth.ts`, `mobile/src/store/account-isolation/**`, this handoff.

## Implemented

- New owner-tagged `state-v2:<verified-server-id>` records in the existing `munpro/kv` IndexedDB database. `state-v1` is never used as an active cache, deleted or silently assigned to the next login. The `lastUserId`, email and locally invented `u_...` IDs cannot unlock another account's namespace.
- Only `recordServerUser()` after a successful server auth response marks a server ID verified. Historical `munpro.userRecord` entries without that marker are unverified until an online re-authentication.
- An account epoch/lease (`AccountSessionLease` from Agent 00's `phase2.ts`) increments on token changes, account selection and logout. `activateVerifiedAccount(id)` awaits a per-user cache read, and discards any stale async completion.
- `endAccountSession()` resets the in-memory grammar document and sync metadata synchronously, before React's next render; pending timers are canceled. Old in-flight writes contain an immutable snapshot and frozen **A-only key**, so they cannot write B's data after a switch. Same-tab writes for one account are serialized.
- `getSessionToken()` is restricted to the identity of a previously server-verified user and a token specifically bound by `bindSessionTokenToVerifiedAccount()`. Expired/cleared token leaves the selected user's offline grammar cache intact; explicit logout detaches it.
- Explicit logout cancels the old 30-minute *automatic* re-entry allowance. The previous behavior allowed a later person to type A's email just after logout and reopen A's progress without a password or new code. Offline login by the previously verified user's local password is preserved.
- Cross-tab localStorage changes detach a revoked/switched identity and notify subscribers through `subscribeAccountSessionChange()`. Agent 00 must use that subscription to clear the React auth shell.
- `recoverVerifiedLegacyState(serverDoc, lease)` permits conservative legacy union only when the verified owner's email matches *both* documents and the authenticated server document shares a unique review-log ID with the legacy snapshot. The old key remains intact. Ambiguous progress (including offline-only / empty remote logs) stays quarantined for deliberate recovery, **not automatically attributed**.
- Added focused namespace/provenance and synthetic IDB account-switch tests.

## IMPORTANT: Agent 00 integration patch guide (required before enabling)

This PR is **not a self-contained authentication-shell or sync fix** because those files are lead-owned. Agent 00 must make these changes in the integration branch immediately after merging, before issue #10 can close:

1. **`mobile/src/store/index.ts`**: re-export `activateVerifiedAccount`, `endAccountSession`, `getAccountSessionLease`, `isAccountSessionLeaseCurrent`, `recoverVerifiedLegacyState`, `subscribeAccountSessionChange`. Do not change `SyncDocument`.
2. **`mobile/src/app/_layout.tsx`**: make `handleAuthed` asynchronous, and **await `activateVerifiedAccount(authed.id)` before** calling `setCurrentUserId`, setting React `user`, or calling `syncNow`. Fail closed (display auth error/retry) if activation returns false because the ID is unverified or the lease became stale. In logout, call `endAccountSession()` (already indirectly called by `clearSessionUserId()`) before React `setUser(null)`, invalidate session callbacks, then clear the token. Subscribe to `subscribeAccountSessionChange()` and revoke React user when the verified active lease is lost due to another tab. The subscriber must **not** accidentally clear the shell during a valid same-account activation; compare current active account and in-progress login first. Never show learner routes with a new identity and the old account's doc.
3. **`mobile/src/store/sync.ts`**: capture `const lease = getAccountSessionLease()` and `const token = getSessionToken()` together *at the start*; no lease means `no-token`. Gate **every** async boundary: after `await syncPull`, before `mergeServerDoc`, before version mutations, before `getSyncSnapshot`, before issuing `syncPush`, and after `await syncPush`, require `isAccountSessionLeaseCurrent(lease) && getSessionToken() === token`. On a stale lease return `stale-session`, never clear B's token on A's `unauthorized` response. Use an in-flight run indexed by `accountId + epoch` rather than a global `syncInFlight` promise, or discard the stale run and let B start independently. Call `await recoverVerifiedLegacyState(pulled.payload, lease)` on a successful, current pull before merging and pushing. Any push already sent to the server is irrevocable but must use A's original token **and an A snapshot prepared before switch**; never let B's data travel with A's token. (Agent 09 must still handle optimistic concurrency on the server.)
4. **`mobile/src/components/AuthScreen.tsx`**: no successful auth response without a server-returned account ID may be treated as an authenticated persistent account. Reject/retry the anomalous response rather than letting `createUserByEmail` select a guessed owner. Preserve local verified-password offline login. A previously cached ID is not proof of a newly authenticated online identity.
5. **New vocabulary persistence**: Agent 08/00 storage must key by `lease.accountId`, validate `isAccountSessionLeaseCurrent(lease)` before/after awaited IDB boundaries **and before final transaction writes/commit**, and reject instead of falling back to the guest key. No bearer token in events. Grammar cache keys must not be reused for vocabulary documents.

## Tests and release gates

Focused tests added:
- `mobile/src/store/account-isolation/__tests__/storage.test.ts`: account namespace validation, non-aliasing snapshots, ambiguous legacy quarantine, positive log provenance.
- `mobile/src/store/account-isolation/__tests__/state.test.ts`: A→logout→B isolation, A offline reload, A re-login with exact log counts, delayed A write/read, token expiry, cross-tab invalidation, IndexedDB failure.

**Run in a full checkout before merge:** `cd mobile && npm run lint && npm run typecheck && npm test -- --ci`. Also `npx expo export --platform web`, existing content validators, browser two-account/multi-tab manual flows and offline recovery with synthetic accounts. CI alone does **not** prove stale server sync safety without Agent 00's changes. Do not close #10 until those integrated checks pass. No native release claim.

## Provenance, credentials and rollback

- `lastUserId`: UI/email hint only, never cache-owner evidence.
- `sessionUserId`: persisted session *selector* only; must match a locally recorded server-verified ID and device trust to restore offline.
- `deviceTrust`: keyed by server ID, and not proof of successful authentication on its own. Explicit logout prevents automatic re-entry.
- `passwordHash`/`salt`: continue to support offline password verification for the one locally retained verified account. No plaintext password is written to IDB. An old unverified historical record requires online re-verification.
- `sessionToken`: localStorage only, newly owner-bound; no migration based solely on the opaque token. Legacy tokens without a binding will require fresh authentication before remote sync.
- Legacy `state-v1` is *read-only*. In ambiguous cases, deliberate user-visible export/import or server-assisted identity proof is still a **future recovery feature**; do not promise automatic recovery or erase it.
- To roll back code, revert this PR and Agent 00's corresponding layout/sync patch. Keep all `state-v1` and `state-v2:...` keys and grammar logs untouched. Old builds do not understand `state-v2`, so rollback must not be misrepresented as preserving access to new scoped-only progress.

**Status:** scoped storage implementation submitted; final privacy acceptance and issue closure remain **BLOCKED on lead-owned layout/sync integration, fake-account browser testing and offline/manual recovery decision**. No production tests or educator approval claimed.
