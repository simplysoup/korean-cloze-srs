import type { VocabularySnapshotV1 } from './events';
import type { AccountSessionLease } from '../../contracts/phase2';

/** An auth epoch changes on logout, account switch and re-login, even for the same user. */
export type VocabularyAccountScope = AccountSessionLease;

/** Called on every public operation and again before/after each awaited storage operation. */
export type VocabularyAccountReader = () => VocabularyAccountScope | null;

/** A CAS miss must return false; storage/auth failures must reject. */
export interface VocabularyCommitRequest {
  readonly scope: VocabularyAccountScope;
  readonly expectedRevision: string | null;
  readonly next: VocabularySnapshotV1;
  /** MUST be called inside the SAME transaction/critical section immediately before writing. */
  readonly assertCurrent: () => void;
}

/** No default storage. Agent 00 and Agent 10 must provide an authenticated scoped adapter. */
export interface VocabularyPersistencePort {
  load(scope: VocabularyAccountScope): Promise<unknown | null>;
  atomicCommit(request: VocabularyCommitRequest): Promise<boolean>;
}

export class VocabularyStaleAccountError extends Error {
  constructor() {
    super('Vocabulary session is no longer associated with the signed-in account.');
    this.name = 'VocabularyStaleAccountError';
  }
}

export class VocabularyConflictError extends Error {
  constructor() {
    super('Vocabulary progress changed concurrently; please reopen the review session.');
    this.name = 'VocabularyConflictError';
  }
}
