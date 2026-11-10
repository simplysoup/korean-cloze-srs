import { initializeVocabProgress, type VocabProgress } from '../core/progress';
import { scheduleVocabularyReview } from '../core/review';
import type { VocabularyLibrary } from '../core/content';
import type { VocabularyReviewEventV1 as CanonicalReviewEvent,
  VocabularyDurableStateV1 } from '../../contracts/phase2';

/** An immutable successful review, not an inferred mastery grant for an unknown answer. */
export interface VocabularyReviewEventV1 extends CanonicalReviewEvent {
  readonly version: 1;
  readonly promptId: string;
  readonly rating: 3;
  readonly outcome: 'target_correct';
}

/** The baseline permits explicit migration of older FSRS progress without inventing past events. */
export interface VocabularySnapshotV1 extends VocabularyDurableStateV1 {
  schemaVersion: 1;
  contentVersion: string;
  accountId: string;
  revision: string;
  baseline: VocabProgress;
  progress: VocabProgress;
  reviewEvents: VocabularyReviewEventV1[];
}

export class VocabularyDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VocabularyDataError';
  }
}

const object = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === 'object' && !Array.isArray(x);
const validId = (x: unknown): x is string => typeof x === 'string' && x.trim() === x && x.length > 0;

export function validateVocabularyLibrary(library: VocabularyLibrary): void {
  if (!validId(library.version) || !Array.isArray(library.decks) || !object(library.entries))
    throw new VocabularyDataError('Malformed lexical content; refusing to access progress.');
  const seen = new Set<string>();
  const deckIds = new Set<string>();
  for (const deck of library.decks) {
    if (!deck.id.startsWith('vocab_') || !validId(deck.id) || deckIds.has(deck.id) || deck.type !== 'vocabulary')
      throw new VocabularyDataError('Malformed or duplicate lexical deck ID.');
    deckIds.add(deck.id);
    for (const id of deck.entryIds) {
      if (!validId(id) || !id.startsWith('vocab_') || seen.has(id) || !Object.hasOwn(library.entries, id) ||
          library.entries[id].id !== id || library.entries[id].deckId !== deck.id ||
          library.entries[id].reviewType !== 'lexical')
        throw new VocabularyDataError('Malformed, duplicate, or grammar entry ID in vocabulary collection.');
      seen.add(id);
    }
  }
  if (seen.size !== Object.keys(library.entries).length)
    throw new VocabularyDataError('Unreferenced or duplicate lexical entries.');
}

export function orderedReviewEvents(events: readonly VocabularyReviewEventV1[]): VocabularyReviewEventV1[] {
  return [...events].sort((a, b) => a.reviewedAt.localeCompare(b.reviewedAt) || a.id.localeCompare(b.id));
}

/** Deterministic reconstruction: timestamps then durable event IDs, independent of arrival order. */
export function replayVocabularyEvents(
  library: VocabularyLibrary, baseline: VocabProgress, events: readonly VocabularyReviewEventV1[],
): VocabProgress {
  const ids = new Set<string>();
  const prompts = new Set<string>();
  let progress = initializeVocabProgress(baseline, library);
  for (const event of orderedReviewEvents(events)) {
    if (event.version !== 1 || !validId(event.id) || !validId(event.promptId) ||
        !validId(event.entryId) || !event.entryId.startsWith('vocab_') ||
        !Object.hasOwn(library.entries, event.entryId) ||
        library.entries[event.entryId].deckId !== event.deckId ||
        !['recognition', 'production'].includes(event.mode) ||
        event.rating !== 3 || event.outcome !== 'target_correct' ||
        !Number.isFinite(Date.parse(event.reviewedAt)) ||
        new Date(event.reviewedAt).toISOString() !== event.reviewedAt ||
        ids.has(event.id) || prompts.has(event.promptId))
      throw new VocabularyDataError('Invalid, duplicate, or nonlexical vocabulary event; refusing replay.');
    ids.add(event.id);
    prompts.add(event.promptId);
    const applied = scheduleVocabularyReview(library, progress, event.entryId, event.mode,
      event.rating, new Date(event.reviewedAt));
    if (!applied.ok) throw new VocabularyDataError('FSRS could not replay a vocabulary event.');
    progress = applied.value.progress;
  }
  return progress;
}

export function readVocabularySnapshot(raw: unknown, library: VocabularyLibrary, accountId: string): VocabularySnapshotV1 | null {
  if (raw == null) return null;
  if (!object(raw) || raw.schemaVersion !== 1 || !validId(raw.revision) ||
      !object(raw.baseline) || !object(raw.progress) || !Array.isArray(raw.reviewEvents) ||
      !validId(raw.contentVersion) || raw.accountId !== accountId)
    throw new VocabularyDataError('Unsupported or malformed vocabulary snapshot; refusing data loss.');
  // Unknown entry IDs and invalid records are rejected, not silently dropped or rewritten.
  for (const field of [raw.baseline, raw.progress]) {
    const rows = field.entries;
    if (!object(rows) || field.version !== 1 || Object.keys(rows).some(id =>
      !id.startsWith('vocab_') || !Object.hasOwn(library.entries, id)))
      throw new VocabularyDataError('Snapshot contains unknown, grammar, or invalid progress IDs.');
  }
  const baseline = initializeVocabProgress(raw.baseline, library);
  const progress = initializeVocabProgress(raw.progress, library);
  // initializeVocabProgress is intentionally forgiving for legacy import, but a
  // versioned durable snapshot MUST fail closed instead of silently dropping data.
  if (JSON.stringify(raw.baseline.entries) !== JSON.stringify(baseline.entries) ||
      JSON.stringify(raw.progress.entries) !== JSON.stringify(progress.entries))
    throw new VocabularyDataError('Malformed stored FSRS card; refusing destructive sanitation.');
  const events = raw.reviewEvents as VocabularyReviewEventV1[];
  const replayed = replayVocabularyEvents(library, baseline, events);
  if (JSON.stringify(replayed.entries) !== JSON.stringify(progress.entries))
    throw new VocabularyDataError('Snapshot projection differs from event replay; refusing to overwrite it.');
  return { schemaVersion: 1, revision: raw.revision, contentVersion: raw.contentVersion as string,
    accountId,
    baseline, progress, reviewEvents: [...events] };
}
