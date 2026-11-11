# Synthetic acceptance protocols

For EACH gate record: ID, local timestamp and time zone, **full** commit SHA, OS/browser/device, flags manifest, fixture IDs, exact steps, expected/actual, sanitized log and tester. Never store real learner data, session tokens or private account credentials.

## A — unchanged build 36 / flags OFF

1. Use **two clean test profiles**, fresh and seeded with synthetic grammar progress. Compare build-36 and candidate using the same fixtures and frozen clock. Normalize `reviewCards` by grammar ID/due/reps/state and `reviewLogs` by unique event ID/time/rating; compare deck membership, daily learned and streak. Exclude incidental device/session IDs and generated timestamps.
2. On a new account: empty library, add deck, learn, answer correct/incorrect, reveal, undo, finish and review. Record due dates/event counts before/after reload. Confirm TOPIK II drafts never appear as active lessons/routes.
3. On existing profile: 4am day boundary, due vs mastered cards, offline review/reload/reconnect, empty queue, cached session, expired token and account recovery. Verify all old review IDs survive and no previously scheduled card is silently reseeded.
4. At widths 320/768/1440, walk desktop/narrow/mobile navigation, keyboard Enter/Space/Escape/tab and screen-reader focus. Inspect responsive layout, validation errors and recovery. Screenshot alone cannot establish PASS.

## B — one flag ON per disposable isolated build

1. Save flag manifest and SHA. Do not modify or ship checked-in `CURRICULUM_FLAGS`; verify routes remain unavailable OFF.
2. Vocabulary: 7 decks/145 entries; introduce/learn/review/reveal/cram, recognition and production, wrong/near/unknown, retries and undo, time-controlled due dates, refresh/offline/storage errors, no grammar mastery contamination.
3. Answer-feedback: target correct / valid off-target / near miss / incorrect / unclassified; target-only mastery; curated alternatives and evidence-bound register/tense hint, reveal/undo without duplicate review events.
4. Topics/Hangul: all four topics, pronunciation drills, prerequisite/error/empty states and focus.
5. Contrast/transfer: 52 authored exercises, eligibility, wrong-register/tense hints, missed replays, verify **no grammar review record/streak** changed by practice alone.
6. Reading: 6 passages/24 questions, optional omissions, retry/explanations, focus/readability and no implicit grammar mastery.
7. TOPIK II: OFF contains only TOPIK I active points; isolated ON contains 229 ordered unique points across six decks and no duplicates.

## SEC — physical browser and authorized staging, not mock-only

1. Same-browser A→logout→B: A completes reviews and persists. Without clearing site data, log in B. Check B UI, in-memory doc, IndexedDB keys and first network push. **Zero** A logs/cards/decks visible, also after offline reload. Recheck A recovery; do not destroy unknown legacy data.
2. Delay A pull/push in a proxy. Logout A, login B, then release A results and failures. No A callbacks apply to B or push with B credentials; A token not reused. Simulate timeout, 401, IndexedDB open/write failure and quota.
3. Against **authorized disposable staging server** only: two devices pull same base version, independently append grammar and vocabulary event IDs, simultaneously push through barrier, exercise stale-version rejection / bounded retry. Re-pull both. Verify exact **union of review IDs**, preserved legacy records, optional unknown fields, and reinstall/recovery. Backend actual schema and CAS version envelope must be documented; mock success is insufficient.
4. Do not use production endpoints, credentials, or real progress. Request environment and tokens securely from Agent 00.

## NATIVE — separate release

Create pre-fix synthetic SQLite profile, log content version/cards/due dates. Upgrade on iOS and Android simulator/device, restart, verify editorial corrections and *same review IDs/logs/due dates*. Check six-deck/native-web parity, offline, reinstall/recovery, accessibility and backup/rollback. Do not change CONTENT_VERSION solely to force reseeding; no native release without migration evidence.
