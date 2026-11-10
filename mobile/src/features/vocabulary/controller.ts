/** Public entry point for Agent 00's authenticated VocabularyProvider mount. */
export { createVocabularyController } from './runtime/controller';
export type { VocabularyControllerDependencies } from './runtime/controller';
export type { VocabularyAccountScope, VocabularyAccountReader,
  VocabularyCommitRequest, VocabularyPersistencePort } from './runtime/port';
export { VocabularyStaleAccountError, VocabularyConflictError } from './runtime/port';
export type { VocabularyReviewEventV1, VocabularySnapshotV1 } from './runtime/events';
export { VocabularyDataError, replayVocabularyEvents, readVocabularySnapshot } from './runtime/events';
