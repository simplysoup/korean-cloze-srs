import { createVocabularyController } from '../../controller';
import { loadFoundationalVocabulary, type VocabularyLibrary } from '../../core/content';
import { VocabularyDataError, type VocabularySnapshotV1 } from '../events';
import type { VocabularyAccountScope, VocabularyCommitRequest,
  VocabularyPersistencePort } from '../port';

function foundations(): VocabularyLibrary {
  const loaded = loadFoundationalVocabulary();
  if (!loaded.ok) throw Error('Invalid fixture');
  return loaded.value;
}

function setup() {
  let signedIn: VocabularyAccountScope | null = { accountId: 'user-A', epoch: 1 };
  const saved = new Map<string, VocabularySnapshotV1>();
  let writes = 0;
  let failWrites = false;
  let beforeWrite: (() => Promise<void>) | null = null;
  const persistence: VocabularyPersistencePort = {
    async load(scope) { return saved.get(scope.accountId) ?? null; },
    async atomicCommit(request: VocabularyCommitRequest) {
      if (beforeWrite) await beforeWrite();
      request.assertCurrent();
      if (failWrites) throw Error('Disk unavailable');
      const existing = saved.get(request.scope.accountId);
      if ((existing?.revision ?? null) !== request.expectedRevision) return false;
      saved.set(request.scope.accountId, JSON.parse(JSON.stringify(request.next)) as VocabularySnapshotV1);
      writes++;
      return true;
    },
  };
  let serial = 0;
  const create = (lib = foundations(), id = () => `id-${++serial}`) =>
    createVocabularyController({ library: lib, persistence, account: () => signedIn,
      now: () => new Date('2026-11-10T17:00:00.000Z'), generateId: id });
  return { create, persistence, saved, get writes() { return writes; },
    setAccount: (account: VocabularyAccountScope | null) => { signedIn = account; },
    setFail: (value: boolean) => { failWrites = value; },
    setBeforeWrite: (value: (() => Promise<void>) | null) => { beforeWrite = value; } };
}

const find = (prompts: readonly { entryId: string; direction: string; id: string; canonicalAnswer: string }[],
  id: string, direction: string) => {
  const prompt = prompts.find(p => p.entryId === id && p.direction === direction);
  if (!prompt) throw Error('Missing prompt');
  return prompt;
};

describe('vocabulary controller and account-scoped persistence', () => {
  it('covers all seven decks, due/new/empty/cram queues, and stable lexical prompt identity', async () => {
    const context = setup();
    const c = context.create();
    const decks = await c.listDecks();
    expect(decks).toHaveLength(7);
    expect(decks.reduce((sum, d) => sum + d.totalEntries, 0)).toBe(145);
    expect(decks.every(d => d.dueEntries === 0 && d.learnedEntries === 0)).toBe(true);
    expect(await c.getSession('review', 500)).toHaveLength(0);
    expect(await c.getSession('learn', 0)).toHaveLength(0);
    const learned = await c.getSession('learn', 500);
    expect(learned).toHaveLength(290); // 145 lexical IDs * two independently scheduled directions
    expect(new Set(learned.map(p => p.deckId)).size).toBe(7);
    expect(new Set(learned.map(p => p.id)).size).toBe(learned.length);
    expect(learned.every(p => p.id.includes(p.entryId) && p.id.startsWith('lexical:'))).toBe(true);
    expect((await c.getSession('cram', 500))).toHaveLength(290);
    expect(await c.getSession('review', 500)).toHaveLength(0);
  });

  it('keeps recognition and production histories independent across re-created offline controllers', async () => {
    const context = setup();
    const c = context.create();
    const prompts = await c.getSession('learn', 500);
    const recognition = find(prompts, 'vocab_native_numbers_001', 'korean_to_english');
    const result = await c.submitAnswer(recognition.id, 'one');
    expect(result.evaluation.outcome).toBe('target_correct');
    expect(result.progress?.reviewCount).toBe(1);
    expect(context.saved.get('user-A')?.progress.entries.vocab_native_numbers_001.production).toBeUndefined();
    const c2 = context.create();
    const prompts2 = await c2.getSession('learn', 500);
    expect(prompts2.some(p => p.entryId === recognition.entryId && p.direction === 'korean_to_english')).toBe(false);
    const production = find(prompts2, 'vocab_native_numbers_001', 'english_to_korean');
    await c2.submitAnswer(production.id, '하나');
    const both = context.saved.get('user-A')?.progress.entries.vocab_native_numbers_001;
    expect(both?.recognition?.fsrs.reps).toBe(1);
    expect(both?.production?.fsrs.reps).toBe(1);
    expect((await c2.listDecks())[0].learnedEntries).toBe(1);
    expect((await c2.getProgress('vocab_foundations_native_numbers'))[0].reviewCount).toBe(2);
  });

  it('accepts only target-correct lexical alternatives; near misses and unknowns do not schedule', async () => {
    const context = setup();
    const lib = foundations();
    lib.entries.vocab_native_numbers_001.meaning = 'one / unity';
    const c = context.create(lib);
    const prompts = await c.getSession('learn', 500);
    const recognition = find(prompts, 'vocab_native_numbers_001', 'korean_to_english');
    expect(recognition.canonicalAnswer).toBe('one');
    const alternative = await c.submitAnswer(recognition.id, 'unity');
    expect(alternative.evaluation.outcome).toBe('target_correct');
    expect(alternative.progress).not.toBeNull();
    const production = find(prompts, 'vocab_native_numbers_001', 'english_to_korean');
    const near = await c.submitAnswer(production.id, '한');
    expect(near.evaluation.outcome).toBe('near_miss');
    expect(near.progress).toBeNull();
    const unknown = await c.submitAnswer(production.id, 'xyz');
    expect(unknown.evaluation.outcome).toBe('unclassified');
    expect(unknown.progress).toBeNull();
    expect(context.writes).toBe(1);
    const corrected = await c.submitAnswer(production.id, '하나');
    expect(corrected.progress).not.toBeNull();
    expect(context.writes).toBe(2);
  });

  it('does not grade reveal or cram as successful scheduled recall', async () => {
    const context = setup();
    const c = context.create();
    const prompts = await c.getSession('learn', 500);
    const p = find(prompts, 'vocab_native_numbers_001', 'english_to_korean');
    expect((await c.revealAnswer(p.id)).awardsMastery).toBe(false);
    await expect(c.submitAnswer(p.id, '하나')).rejects.toThrow(/revealed/);
    const cram = find(await c.getSession('cram', 500), 'vocab_native_numbers_001', 'english_to_korean');
    const result = await c.submitAnswer(cram.id, '하나');
    expect(result.evaluation.outcome).toBe('target_correct');
    expect(result.progress).toBeNull();
    expect(context.writes).toBe(0);
  });

  it('commits before returning and avoids duplicate concurrent/retried scheduling', async () => {
    const context = setup();
    const c = context.create();
    const p = find(await c.getSession('learn', 500), 'vocab_native_numbers_001', 'korean_to_english');
    const [first, second] = await Promise.all([c.submitAnswer(p.id, 'one'), c.submitAnswer(p.id, 'one')]);
    expect(first).toEqual(second);
    expect(await c.submitAnswer(p.id, 'one')).toEqual(first);
    expect(context.writes).toBe(1);
    expect(context.saved.get('user-A')?.reviewEvents).toHaveLength(1);
    await expect(c.submitAnswer(p.id, 'two')).rejects.toThrow(/already graded/);
  });

  it('never returns success on storage failure and permits a safe retry', async () => {
    const context = setup();
    const c = context.create();
    const p = find(await c.getSession('learn', 500), 'vocab_native_numbers_001', 'korean_to_english');
    context.setFail(true);
    await expect(c.submitAnswer(p.id, 'one')).rejects.toThrow('Disk unavailable');
    expect(context.writes).toBe(0);
    context.setFail(false);
    expect((await c.submitAnswer(p.id, 'one')).progress).not.toBeNull();
    expect(context.saved.get('user-A')?.reviewEvents).toHaveLength(1);
  });

  it('rejects stale in-flight commit after logout/account switch, and isolates A/B/re-login', async () => {
    const context = setup();
    const staleController = context.create();
    const p = find(await staleController.getSession('learn', 500), 'vocab_native_numbers_001', 'korean_to_english');
    let resume!: () => void;
    const barrier = new Promise<void>(resolve => { resume = resolve; });
    context.setBeforeWrite(() => barrier);
    const submitting = staleController.submitAnswer(p.id, 'one');
    context.setAccount(null);
    resume();
    await expect(submitting).rejects.toThrow(/no longer associated/);
    expect(context.writes).toBe(0);
    context.setBeforeWrite(null);
    context.setAccount({ accountId: 'user-B', epoch: 2 });
    await expect(staleController.listDecks()).rejects.toThrow(/no longer associated/);
    const b = context.create();
    expect((await b.listDecks())[0].learnedEntries).toBe(0);
    const bp = find(await b.getSession('learn', 500), 'vocab_native_numbers_001', 'korean_to_english');
    await b.submitAnswer(bp.id, 'one');
    expect(context.saved.has('user-A')).toBe(false);
    expect(context.saved.has('user-B')).toBe(true);
    context.setAccount({ accountId: 'user-A', epoch: 3 });
    await expect(staleController.getSession('learn', 1)).rejects.toThrow(/no longer associated/);
    expect((await context.create().listDecks())[0].learnedEntries).toBe(0);
  });

  it('defends collisions and allows CAS conflict retries without lost updates', async () => {
    const context = setup();
    const a = context.create();
    const p = find(await a.getSession('learn', 500), 'vocab_native_numbers_001', 'korean_to_english');
    await a.submitAnswer(p.id, 'one');
    const b = context.create();
    const fresh = find(await b.getSession('learn', 500), 'vocab_native_numbers_002', 'korean_to_english');
    const c = context.create();
    const other = find(await c.getSession('learn', 500), 'vocab_native_numbers_003', 'korean_to_english');
    await Promise.all([b.submitAnswer(fresh.id, 'two'), c.submitAnswer(other.id, 'three')]);
    expect(context.saved.get('user-A')?.reviewEvents).toHaveLength(3);
    expect(context.writes).toBe(3);
    const existingId = context.saved.get('user-A')!.reviewEvents[0].id.slice('event:'.length);
    let n = 0;
    const colliding = context.create(foundations(), () => {
      n++;
      return n === 1 ? 'fresh-session' : n === 2 ? existingId : `unique-${n}`;
    });
    const cp = find(await colliding.getSession('learn', 500),
      'vocab_native_numbers_004', 'korean_to_english');
    await colliding.submitAnswer(cp.id, 'four');
    const all = context.saved.get('user-A')!.reviewEvents;
    expect(all).toHaveLength(4);
    expect(new Set(all.map(e => e.id)).size).toBe(4);
  });

  it('rejects grammar content and malformed progress while preserving the saved snapshot', async () => {
    const context = setup();
    const valid = context.create();
    const p = find(await valid.getSession('learn', 500), 'vocab_native_numbers_001', 'korean_to_english');
    await valid.submitAnswer(p.id, 'one');
    const initial = JSON.stringify(context.saved.get('user-A'));
    const broken = foundations();
    broken.decks[0].entryIds[0] = 'grammar_001';
    expect(() => context.create(broken)).toThrow(VocabularyDataError);
    expect(JSON.stringify(context.saved.get('user-A'))).toEqual(initial);
    const injected = context.saved.get('user-A')!;
    injected.progress.entries.grammar_1 = injected.progress.entries.vocab_native_numbers_001;
    await expect(context.create().listDecks()).rejects.toThrow(VocabularyDataError);
  });

  it('rejects a snapshot from a different account even if a faulty adapter exposes it', async () => {
    const context = setup();
    const a = context.create();
    const p = find(await a.getSession('learn', 500), 'vocab_native_numbers_001', 'korean_to_english');
    await a.submitAnswer(p.id, 'one');
    const snapshot = context.saved.get('user-A')!;
    const evil: VocabularyPersistencePort = {
      load: async () => snapshot,
      atomicCommit: async () => { throw Error('Must not write'); },
    };
    context.setAccount({ accountId: 'user-B', epoch: 2 });
    const b = createVocabularyController({ library: foundations(), account: () => ({ accountId: 'user-B', epoch: 2 }),
      persistence: evil, now: () => new Date(), generateId: () => 'id' });
    await expect(b.listDecks()).rejects.toThrow(VocabularyDataError);
  });
});
