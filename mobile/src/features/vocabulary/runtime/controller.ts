import type { VocabAnswerReveal, VocabController, VocabPrompt,
  VocabReviewResult, VocabSessionMode } from '../contracts';
import { checkLexicalResponse, makeLexicalPrompt, type LexicalPrompt } from '../core/answers';
import { loadFoundationalVocabulary, type VocabularyEntry, type VocabularyLibrary } from '../core/content';
import { toControllerAnswerEvaluation, toControllerDeckSummaries,
  toControllerVocabularyProgress, toControllerVocabularyPrompt } from '../core/contract-adapter';
import { getReviewProgress, initializeVocabProgress, selectDueVocabulary,
  selectNewVocabulary, type VocabularyMode } from '../core/progress';
import { readVocabularySnapshot, replayVocabularyEvents, validateVocabularyLibrary,
  VocabularyDataError, type VocabularyReviewEventV1, type VocabularySnapshotV1 } from './events';
import { VocabularyConflictError, VocabularyStaleAccountError, type VocabularyAccountReader,
  type VocabularyAccountScope, type VocabularyPersistencePort } from './port';

export interface VocabularyControllerDependencies {
  /** Auth source must issue a fresh epoch for every login/account change. */
  readonly account: VocabularyAccountReader;
  readonly persistence: VocabularyPersistencePort;
  readonly now: () => Date;
  /** Collision-resistant per-call IDs, e.g. crypto.randomUUID injected by Agent 00. */
  readonly generateId: () => string;
  /** Optional validated lexical fixtures for tests; production uses bundled foundations. */
  readonly library?: VocabularyLibrary;
}

interface ActivePrompt {
  dto: VocabPrompt;
  lexical: LexicalPrompt;
  entry: VocabularyEntry;
  direction: VocabularyMode;
}
interface InFlight { answer: string; promise: Promise<VocabReviewResult> }
interface Answered { answer: string; result: VocabReviewResult }
interface Candidate { entry: VocabularyEntry; direction: VocabularyMode; due: number | null; order: number }
const directions: readonly VocabularyMode[] = ['recognition', 'production'];

/** Factory scope is immutable. Re-login with the same ID must create a NEW controller. */
export function createVocabularyController(dependencies: VocabularyControllerDependencies): VocabController {
  const { account, persistence, generateId } = dependencies;
  const input = dependencies.library ? { ok: true as const, value: dependencies.library } : loadFoundationalVocabulary();
  if (!input.ok) throw new VocabularyDataError('Bundled vocabulary content failed validation.');
  const library = input.value;
  validateVocabularyLibrary(library);
  const captured = account();
  if (!captured || !validAccount(captured)) throw new VocabularyStaleAccountError();
  const scope: VocabularyAccountScope = { accountId: captured.accountId, epoch: captured.epoch };
  const active = new Map<string, ActivePrompt>();
  const inFlight = new Map<string, InFlight>();
  const answered = new Map<string, Answered>();
  const revealed = new Set<string>();
  const issuedSessionIds = new Set<string>();
  let sessionReadSequence = 0;

  function assertCurrent(): void {
    const latest = account();
    if (!latest || latest.accountId !== scope.accountId || latest.epoch !== scope.epoch ||
        !validAccount(latest)) throw new VocabularyStaleAccountError();
  }
  function getNow(): Date {
    const at = dependencies.now();
    if (!(at instanceof Date) || !Number.isFinite(at.getTime()))
      throw new VocabularyDataError('Invalid injected clock.');
    return new Date(at.getTime());
  }
  function newId(prefix: string): string {
    const id = generateId();
    if (typeof id !== 'string' || !id.trim() || id.trim() !== id)
      throw new VocabularyDataError('ID generator returned an invalid identifier.');
    return `${prefix}:${id}`;
  }
  async function load(): Promise<VocabularySnapshotV1 | null> {
    assertCurrent();
    const raw = await persistence.load(scope);
    assertCurrent();
    return readVocabularySnapshot(raw, library, scope.accountId);
  }
  function progressOf(snapshot: VocabularySnapshotV1 | null) {
    return snapshot?.progress ?? initializeVocabProgress(null, library);
  }
  function buildCandidates(mode: VocabSessionMode, snapshot: VocabularySnapshotV1 | null, at: Date): Candidate[] {
    const progress = progressOf(snapshot);
    const allCount = Object.keys(library.entries).length;
    const order = new Map(library.decks.flatMap(d => d.entryIds).map((id, i) => [id, i]));
    const candidates: Candidate[] = [];
    for (const direction of directions) {
      if (mode === 'cram') {
        for (const deck of library.decks) for (const entryId of deck.entryIds)
          candidates.push({ entry: library.entries[entryId], direction, due: null,
            order: order.get(entryId) ?? 0 });
        continue;
      }
      const due = selectDueVocabulary(library, progress, direction, at, allCount);
      for (const selected of due) candidates.push({ entry: selected.entry, direction,
        due: Date.parse(getReviewProgress(progress, selected.entry.id, direction)!.fsrs.due),
        order: order.get(selected.entry.id) ?? 0 });
      if (mode === 'learn') {
        const fresh = selectNewVocabulary(library, progress, direction, allCount);
        for (const selected of fresh) candidates.push({ entry: selected.entry, direction,
          due: null, order: order.get(selected.entry.id) ?? 0 });
      }
    }
    return candidates.sort((a, b) =>
      (a.due === null ? 1 : 0) - (b.due === null ? 1 : 0) ||
      (a.due ?? 0) - (b.due ?? 0) || a.order - b.order ||
      directions.indexOf(a.direction) - directions.indexOf(b.direction));
  }
  function lookup(promptId: string): ActivePrompt {
    assertCurrent();
    const item = active.get(promptId);
    if (!item) throw new VocabularyDataError('Unknown or expired vocabulary prompt. Open a new session.');
    return item;
  }
  async function persistSuccessfulAnswer(item: ActivePrompt, answer: string, attemptedAt: Date): Promise<VocabReviewResult> {
    const evaluation = toControllerAnswerEvaluation(
      checkLexicalResponse(item.lexical, answer, item.entry, library));
    if (evaluation.outcome !== 'target_correct' || !evaluation.targetMasteryEligible)
      return { promptId: item.dto.id, entryId: item.entry.id, evaluation,
        attemptedAt: attemptedAt.toISOString(), progress: null };
    if (item.dto.mode === 'cram')
      return { promptId: item.dto.id, entryId: item.entry.id, evaluation,
        attemptedAt: attemptedAt.toISOString(), progress: null };

    let event: VocabularyReviewEventV1 = {
      version: 1, id: newId('event'), promptId: item.dto.id,
      entryId: item.entry.id, deckId: item.entry.deckId, mode: item.direction,
      reviewedAt: attemptedAt.toISOString(), rating: 3, outcome: 'target_correct',
    };
    for (let retry = 0; retry < 5; retry++) {
      const current = await load();
      const past = current?.reviewEvents.find(e => e.promptId === event.promptId);
      if (past) {
        if (past.entryId !== event.entryId || past.mode !== event.mode || past.rating !== event.rating)
          throw new VocabularyDataError('Review prompt collides with a different persisted event.');
        // Another controller already committed this exact review; never schedule it again.
        return { promptId: item.dto.id, entryId: item.entry.id, evaluation,
          attemptedAt: past.reviewedAt,
          progress: toControllerVocabularyProgress(library, current!.progress, item.entry.id) };
      }
      if (current?.reviewEvents.some(e => e.id === event.id)) {
        // A generator collision is not an idempotent request. A new event needs a new ID.
        event = { ...event, id: newId('event') };
        if (current.reviewEvents.some(e => e.id === event.id)) continue;
      }
      const baseline = current?.baseline ?? initializeVocabProgress(null, library);
      const events = [...(current?.reviewEvents ?? []), event];
      const nextProgress = replayVocabularyEvents(library, baseline, events);
      const revision = newId('revision');
      if (current?.revision === revision) throw new VocabularyDataError('Revision ID collision.');
      const next: VocabularySnapshotV1 = {
        schemaVersion: 1, accountId: scope.accountId, contentVersion: library.version,
        revision, baseline, progress: nextProgress, reviewEvents: events,
      };
      assertCurrent();
      // Adapter MUST perform assertCurrent inside the same transaction as its scoped CAS write.
      const committed = await persistence.atomicCommit({ scope, expectedRevision: current?.revision ?? null,
        next, assertCurrent });
      assertCurrent();
      if (!committed) continue;
      return { promptId: item.dto.id, entryId: item.entry.id, evaluation,
        attemptedAt: event.reviewedAt,
        progress: toControllerVocabularyProgress(library, nextProgress, item.entry.id) };
    }
    throw new VocabularyConflictError();
  }

  return {
    async listDecks() {
      const snapshot = await load();
      return toControllerDeckSummaries(library, progressOf(snapshot), getNow());
    },
    async getProgress(deckId) {
      if (!library.decks.some(deck => deck.id === deckId))
        throw new VocabularyDataError('Unknown vocabulary deck.');
      const snapshot = await load();
      return library.decks.find(deck => deck.id === deckId)!.entryIds.map(id =>
        toControllerVocabularyProgress(library, progressOf(snapshot), id)!).filter(Boolean);
    },
    async getSession(mode, limit) {
      assertCurrent();
      if (!['learn', 'review', 'cram'].includes(mode) || !Number.isSafeInteger(limit) || limit < 0)
        throw new VocabularyDataError('Invalid vocabulary session request.');
      const sequence = ++sessionReadSequence;
      const snapshot = await load();
      const candidates = buildCandidates(mode, snapshot, getNow()).slice(0, limit);
      const sessionId = candidates.length ? newId('session') : '';
      if (candidates.length && issuedSessionIds.has(sessionId))
        throw new VocabularyDataError('Session ID generator collision.');
      if (sequence !== sessionReadSequence) throw new VocabularyConflictError();
      if (sessionId) issuedSessionIds.add(sessionId);
      const newActive = new Map<string, ActivePrompt>();
      const prompts: VocabPrompt[] = [];
      for (const candidate of candidates) {
        const lexical = makeLexicalPrompt(candidate.entry, candidate.direction, 'standalone');
        if (!lexical.ok) throw new VocabularyDataError('Cannot create a lexical review prompt.');
        const adapted = toControllerVocabularyPrompt(lexical.value, candidate.entry, mode);
        const dto = { ...adapted, id: `${adapted.id}:${sessionId}` };
        if (newActive.has(dto.id)) throw new VocabularyDataError('Duplicate lexical prompt identity.');
        newActive.set(dto.id, { dto, lexical: lexical.value, entry: candidate.entry,
          direction: candidate.direction });
        prompts.push(dto);
      }
      assertCurrent();
      active.clear();
      newActive.forEach((value, key) => active.set(key, value));
      answered.clear();
      revealed.clear();
      return prompts;
    },
    async submitAnswer(promptId, answer) {
      const item = lookup(promptId);
      if (typeof answer !== 'string') throw new VocabularyDataError('Expected an answer string.');
      if (revealed.has(promptId)) throw new VocabularyDataError('This answer was revealed; it cannot earn mastery.');
      const completed = answered.get(promptId);
      if (completed) {
        if (completed.answer !== answer) throw new VocabularyDataError('This prompt is already graded.');
        return completed.result;
      }
      const pending = inFlight.get(promptId);
      if (pending) {
        if (pending.answer !== answer) throw new VocabularyConflictError();
        return pending.promise;
      }
      const attemptedAt = getNow();
      const operation = (async () => {
        const result = await persistSuccessfulAnswer(item, answer, attemptedAt);
        assertCurrent();
        if (result.evaluation.outcome === 'target_correct' && result.evaluation.targetMasteryEligible)
          answered.set(promptId, { answer, result });
        return result;
      })();
      inFlight.set(promptId, { answer, promise: operation });
      try { return await operation; } finally { inFlight.delete(promptId); }
    },
    async revealAnswer(promptId): Promise<VocabAnswerReveal> {
      const item = lookup(promptId);
      if (inFlight.has(promptId)) throw new VocabularyConflictError();
      const result: VocabAnswerReveal = {
        promptId, canonicalAnswer: item.dto.canonicalAnswer,
        acceptedAlternatives: item.dto.acceptedAlternatives,
        explanation: item.dto.explanation, awardsMastery: false,
      };
      revealed.add(promptId);
      return result;
    },
  };
}

function validAccount(scope: VocabularyAccountScope): boolean {
  return typeof scope.accountId === 'string' && !!scope.accountId.trim() &&
    scope.accountId === scope.accountId.trim() &&
    !['local', 'guest', 'anonymous', 'null', 'undefined'].includes(scope.accountId.toLowerCase()) &&
    typeof scope.epoch === 'number' && Number.isSafeInteger(scope.epoch) && scope.epoch >= 0;
}
