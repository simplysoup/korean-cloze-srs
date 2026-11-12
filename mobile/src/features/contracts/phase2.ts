/**
 * Phase 2 cross-agent integration seam (Agent 00).
 *
 * This is a compile-time coordination contract only. No runtime implementation,
 * local account migration, server schema migration, or feature enablement is
 * implied by importing these types.
 *
 * Frozen curriculum-v1 VocabController and AnswerEvaluation contracts remain
 * authoritative. Change this seam only by Agent 00-reviewed agreement.
 */
import type { VocabDeckId, VocabEntryId } from '../vocabulary/contracts';
import type {
  VocabProgress as EngineVocabularyProgress,
  VocabularyMode,
} from '../vocabulary/core/progress';

/**
 * Captured at the start of an asynchronous operation. Epoch MUST increase
 * on login, logout, account switch, token replacement, or session recovery.
 * An operation may mutate data only while both id and epoch are current.
 * No bearer token or password should be written into durable vocabulary data.
 */
export interface AccountSessionLease {
  readonly accountId: string;
  readonly epoch: number;
}

/**
 * Canonical vocabulary review event for future deterministic event union.
 * IDs are globally unique and immutable (NOT grammar review-log IDs).
 * The review order for a union is reviewedAt ascending, then id ascending.
 * These events are NOT part of the live SyncDocument yet.
 */
export interface VocabularyReviewEventV1 {
  readonly id: string;
  readonly entryId: VocabEntryId;
  readonly deckId: VocabDeckId;
  readonly mode: VocabularyMode;
  readonly rating: 1 | 2 | 3 | 4;
  readonly reviewedAt: string;
}

/**
 * Durable browser vocabulary state. The events are the reconciliation input
 * once server support is proven; progress is a local FSRS materialization.
 * Never persist a progress-only update for a successful scheduled review.
 */
export interface VocabularyDurableStateV1 {
  readonly schemaVersion: 1;
  readonly progress: EngineVocabularyProgress;
  readonly reviewEvents: readonly VocabularyReviewEventV1[];
}

/**
 * Agent 08 consumes an injected implementation. Agent 00 supplies its web
 * adapter ONLY AFTER Agent 10's per-account isolation is merged and tested.
 *
 * load() returns null for an empty account namespace. appendReview() must
 * atomically upsert the unique event AND its resulting materialized progress,
 * or reject; it must never silently count an unsaved review as durable.
 *
 * Implementations must check the account lease before and after asynchronous
 * boundaries, including before the final transaction commit. A stale lease
 * must reject without reading or writing another account's namespace.
 */
export interface AccountScopedVocabularyStorage {
  load(lease: AccountSessionLease): Promise<VocabularyDurableStateV1 | null>;
  appendReview(
    lease: AccountSessionLease,
    event: VocabularyReviewEventV1,
    resultingProgress: EngineVocabularyProgress,
  ): Promise<void>;
}

/**
 * FUTURE-ONLY wire extension candidate for Agent 09 / Agent 00 review.
 * Do not add this to SyncDocument or push it until an actual backend contract
 * preserves old snapshots, rejects stale version pushes, and passes
 * disposable two-device race and recovery tests.
 */
export interface ProposedVocabularySyncEnvelopeV1 {
  readonly schemaVersion: 1;
  readonly reviewEvents: readonly VocabularyReviewEventV1[];
}
