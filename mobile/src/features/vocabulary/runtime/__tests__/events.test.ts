import { loadFoundationalVocabulary } from '../../core/content';
import { initializeVocabProgress } from '../../core/progress';
import { orderedReviewEvents, replayVocabularyEvents, readVocabularySnapshot,
  VocabularyDataError, type VocabularyReviewEventV1 } from '../events';

const content = () => {
  const loaded = loadFoundationalVocabulary();
  if (!loaded.ok) throw Error('Invalid fixture');
  return loaded.value;
};
const event = (id: string, direction: 'recognition' | 'production', reviewedAt: string): VocabularyReviewEventV1 => ({
  version: 1, id, promptId: `lexical:vocab_native_numbers_001:${direction}:${id}`,
  entryId: 'vocab_native_numbers_001', deckId: 'vocab_foundations_native_numbers',
  mode: direction, reviewedAt, rating: 3, outcome: 'target_correct',
});

describe('durable vocabulary review events', () => {
  it('replays out-of-order events deterministically without mixing directions', () => {
    const lib = content();
    const initial = initializeVocabProgress(null, lib);
    const a = event('a', 'recognition', '2026-11-10T10:00:00.000Z');
    const b = event('b', 'production', '2026-11-10T09:00:00.000Z');
    const c = event('c', 'recognition', '2026-11-11T10:00:00.000Z');
    const first = replayVocabularyEvents(lib, initial, [a, b, c]);
    const reversed = replayVocabularyEvents(lib, initial, [c, b, a]);
    expect(first).toEqual(reversed);
    expect(first.entries.vocab_native_numbers_001.recognition?.fsrs.reps).toBe(2);
    expect(first.entries.vocab_native_numbers_001.production?.fsrs.reps).toBe(1);
    expect(orderedReviewEvents([c, b, a]).map(e => e.id)).toEqual(['b', 'a', 'c']);
  });

  it('rejects reused event IDs, reused prompts, grammar entry IDs, and fabricated outcomes', () => {
    const lib = content();
    const initial = initializeVocabProgress(null, lib);
    const a = event('a', 'recognition', '2026-11-10T10:00:00.000Z');
    expect(() => replayVocabularyEvents(lib, initial, [a, { ...a }])).toThrow(VocabularyDataError);
    expect(() => replayVocabularyEvents(lib, initial, [a, { ...a, id: 'b' }])).toThrow(VocabularyDataError);
    expect(() => replayVocabularyEvents(lib, initial, [{ ...a, entryId: 'grammar_13' }])).toThrow(VocabularyDataError);
    expect(() => replayVocabularyEvents(lib, initial, [{ ...a, outcome: 'near_miss' as 'target_correct' }])).toThrow(VocabularyDataError);
  });

  it('does not silently discard malformed or foreign-account snapshots', () => {
    const lib = content();
    const initial = initializeVocabProgress(null, lib);
    const snapshot = { schemaVersion: 1, contentVersion: lib.version, accountId: 'user-A', revision: 'rev1',
      baseline: initial, progress: initial, reviewEvents: [] };
    expect(readVocabularySnapshot(snapshot, lib, 'user-A')?.progress).toEqual(initial);
    expect(() => readVocabularySnapshot(snapshot, lib, 'user-B')).toThrow(VocabularyDataError);
    expect(() => readVocabularySnapshot({ ...snapshot, schemaVersion: 0 }, lib, 'user-A')).toThrow(VocabularyDataError);
    const broken = { ...snapshot, progress: { version: 1, entries: {
      grammar_somepoint: { recognition: { fsrs: {} } },
    } } };
    expect(() => readVocabularySnapshot(broken, lib, 'user-A')).toThrow(VocabularyDataError);
    expect(snapshot.progress).toBe(initial);
  });
});
