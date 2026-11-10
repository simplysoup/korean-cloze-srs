# Agent 12 — Answer-feedback bridge and acceptance handoff

**Branch:** feat/answer-feedback-bridge → integration/curriculum-v1  
**Phase 2 parent SHA:** ba94b9ee7ae9374cb6e92d8bab17db38f095f9b6  
**Status:** Pure adapters/policy/tests only. All feature flags remain OFF. No live-screen edits, main merge, native release, deployment or educator approval.

## File inventory

- mobile/src/features/answer-evaluation/runtime/bridge.ts — typed real ReviewQueueItem and completeLearnSession quiz item adapters, exact card identity/metadata checks, AnswerEvaluationRequest and panel-compatible structured feedback.
- mobile/src/features/answer-evaluation/runtime/policy.ts — policy for all five outcomes and bit-for-bit legacy comparison/rating helpers.
- mobile/src/features/answer-evaluation/runtime/attempt.ts — pure per-card presentation lifecycle: submit, reveal, undo, pending review commit, success/failure settlement and duplicate-submit protection.
- mobile/src/features/answer-evaluation/runtime/index.ts — public bridge exports for lead integration.
- mobile/src/features/answer-evaluation/__tests__/runtime-bridge.test.ts — positive, negative, normalization, two actual screen shapes, legacy fixtures, FSRS policy, missing data, multi-blank and repeated action coverage.
- docs/handoffs/12-answer-feedback-bridge.md — this handoff.

No changes to the Agent 03 evaluator, content files, store, SRS, feature flags, shared contracts, existing Learn/Review screens or package files. This PR is **not evidence the feature is live**.

## Policy and limitations

**Only an unrevealed target_correct answer earns grammar mastery.** A curated target-equivalent alternative can be target_correct. A valid_off_target or near_miss answer may be natural Korean but must not award mastery for this particular construction. When explicitly advanced as a miss, review policy returns Again=1 and recycles the grammar point; Learn requeues. Unclassified answers **must not be silently converted to Wrong or Good**: no review log, no target mastery, and an explicit retry/skip-without-grade flow is required before release. An empty/punctuation-only nonanswer is incorrect.

The legacy deterministic evaluator currently classifies every unknown nonempty answer as incorrect meaning only “not among authored alternatives.” The bridge deliberately maps unrecognized nonempty text to unclassified for the **live SRS**. It does not assert that the Korean is bad, and must not transmit user responses externally. Educator review remains pending and is not simulated.

Review item.answers combines the authored canonical, alternatives and possibly wordReplacement. **Do not use answers[0] as canonical.** The bridge uses metadata keyed by stable clozeCardId, or the real Learn quiz id, and checks the grammar ID, full sentence, blanked sentence, canonical and presence of authored alternatives. Vetted alternatives come only from the 721-card authored catalogue. The bridge reports unvettedLegacyAnswers for diagnostics but never silently promotes them to mastery-eligible target alternatives. Request includes tense and register exactly as present on the live grammar object; null is preserved.

The current screen/store only supplies one grammarPointId per cloze, not an explicit per-blank/per-target map. The new evaluator **does not grade multi-blank or multi-target items** and returns an explicit unsupported reason; it does not award partial mastery. Missing/stale metadata likewise abstains. This needs a lead-owned content/UI contract before such cards can be activated.

Returned AnswerEvaluationResult is directly compatible with existing AnswerFeedbackPanel and retains authored acceptedAlternatives explanations/notes, exact nearMiss hints, error categories and editorialReview. The existing panel currently **does not display each alternative's explanation**; request a separately approved component change if nuances must be shown in the UI.

## Lead-owned integration recipe: review.tsx

1. Import runtime functions (relative screen path ../../features/answer-evaluation/runtime), AnswerFeedbackPanel and the authored answer-feedback JSON. Keep answerFeedback disabled by default. Import AnswerFeedbackCatalog type only; never modify frozen contract definitions here.
2. In the Check handler, **if the flag is false, execute the existing handler unchanged**, including checkQueueItem, its original counters, lightning path and reveal/undo behavior. Do not call the new evaluator at all in this branch.
3. If true, run evaluateLiveAnswer({kind:'review',item:currentCard}, hangulValues.slice(0,blankCount), authoredCatalog). Freeze feedback and classification at submit time and call submitAnswerAttempt. The object already includes clozeCardId, grammarPointId, fullSentence, sentenceWithBlank, answers, wordReplacement and grammar.tense/register; no store schema change is needed. If unavailable/unclassified, show the reason/uncertainty and offer retry or Skip without grade, **never an FSRS write**.
4. Use a synchronous, guarded ref/reducer for AnswerAttempt so rapid double taps cannot capture the same event twice. Create a new attempt via beginAnswerAttempt on every distinct card *presentation*, including wrap-up recycling even when the same cloze ID recurs. Do not recalculate the saved result from a changed input after submission.
5. On Next, prepareReviewCommit from the current attempt. If intent is non-null, store the pending state BEFORE calling submitReview(currentCard.reviewCardId, intent.grade, intent.exerciseId). On success settleReviewCommit(pending,true), advance once, and recycle only when intent.recycleMiss; on exception settleReviewCommit(pending,false), keep inputs and let the user retry. Never call submitReview for a null intent.
6. Reveal uses revealAnswerAttempt, which always forces Again (1) even after a formerly correct check. Undo/retry uses undoAnswerAttempt (no storage writes). For lightningMode, auto-advance only after the actual unrevealed target_correct snapshot was atomically captured, never by forwarding an unchecked true. Disable Check/Next while persistence is pending.
7. After submit, show AnswerFeedbackPanel with the frozen result. Display canonical and authored alternatives *after* first attempt, never before. Do not label an unclassified response bad Korean. Retry and Miss cycling should not leak stale feedback from the previous card. For unknown content, allow Skip without grade while leaving grammar FSRS state untouched.

## Lead-owned integration recipe: learn.tsx

1. Feature OFF: preserve original checkAnswers([quizHangul],quizAnswers), queues and counters exactly.
2. Feature ON: evaluateLiveAnswer({kind:'learn',item:currentQuizCard},[quizHangul],catalog) and submitAnswerAttempt. The existing Learn quiz item already exposes id, grammarPointId, fullSentence, sentenceWithBlank, answer, alternateAnswers and grammar metadata.
3. Use learnActionForOutcome(outcome,revealed). learn_advance removes the quiz; learn_recycle moves the card to the end; defer_without_review requires retry/skip without claiming mastery. Learn quiz does not call submitReview. Reveal cannot take the success branch. Guard duplicate submission/counters and reset the attempt whenever the quiz queue advances.
4. Show the same AnswerFeedbackPanel only on flagged path; keep unknowns marked as uncertain, and distinguish correctness of the sentence from mastery of the intended grammar point.

## Mandatory verification and unresolved gates

Commands on branch/CI: cd mobile && npm run lint && npm run typecheck && npm test -- --ci; from repo root run node scripts/validate-answer-feedback.mjs. Lead also requires an integrated web export and all existing validators. Capture the exact exit status in PR/QA handoff; do not claim commands passed if not run.

Acceptance by Agent 00 and independent Agent 13 **after lead wiring**: feature-OFF fixture-by-fixture parity with current main for multi-blank, reveal, undo, retry, lightning, queue cycling, counters and FSRS logs; feature-ON canonical/target-alt/off-target/tense/register/empty/unseen Korean/stale metadata; no duplicate review logs under rapid double submission or failed persistence; account and offline regressions. Log exactly once **only** on a committed review attempt. Do not collect raw learner text without privacy-approved consent.

**Remaining blockers:** unsupported multi-blank/multi-target mapping; potential unvetted word replacements; provisional educator judgments; per-alternative note renderer; live defer/skip UI and gated screen integration; Agent 09/10/11 independent sync, account and native safety gates. This isolated PR does not authorize turning answerFeedback ON.

**Rollback:** Leave answerFeedback=false or revert the isolated PR. No historical grammar progress, FSRS reviewLogs, sync snapshots, content versions, or schema migrations are changed; never delete user progress as a rollback shortcut.
