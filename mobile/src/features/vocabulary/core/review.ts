import { createEmptyCard, fsrs, type Card } from 'ts-fsrs';
import { failure, success, type VocabularyError, type VocabularyLibrary, type VocabularyResult } from './content';
import { checkLexicalResponse, makeLexicalPrompt, type LexicalContext, type LexicalFeedback, type LexicalPrompt } from './answers';
import { getReviewProgress, replaceReviewProgress, selectDueVocabulary, selectNewVocabulary,
  type VocabProgress, type VocabularyMode, type VocabularyReviewProgress } from './progress';

export type VocabularyRating = 1 | 2 | 3 | 4;
export interface VocabularyReviewLog {
  entryId: string;
  mode: VocabularyMode;
  rating: VocabularyRating;
  reviewedAt: string;
  due: string;
  scheduledDays: number;
  stability: number;
  difficulty: number;
}
export interface VocabularyReviewUpdate { progress: VocabProgress; log: VocabularyReviewLog }

/** Existing project's ts-fsrs v6 dependency; vocabulary never touches grammar mastery. */
export function scheduleVocabularyReview(library: VocabularyLibrary, progress: VocabProgress,
  entryId: string, mode: VocabularyMode, rating: VocabularyRating, now: Date): VocabularyResult<VocabularyReviewUpdate> {
  if (!Object.hasOwn(library.entries, entryId)) return failure('UNKNOWN_ENTRY', `Unknown vocabulary entry: ${entryId}`);
  if (![1, 2, 3, 4].includes(rating)) return failure('INVALID_RATING', 'Expected FSRS rating 1–4.');
  if (!Number.isFinite(now.getTime())) return failure('INVALID_RATING', 'Expected a valid injected review date.');
  const old = getReviewProgress(progress, entryId, mode);
  const c = old?.fsrs;
  const card: Card = c ? {
    due: new Date(c.due), stability: c.stability, difficulty: c.difficulty,
    scheduled_days: c.scheduledDays, reps: c.reps, lapses: c.lapses,
    state: c.state as Card['state'], last_review: c.lastReview ? new Date(c.lastReview) : undefined,
    learning_steps: c.learningSteps,
  } : createEmptyCard(now);
  const result = fsrs().next(card, now, rating);
  const next: VocabularyReviewProgress = {
    fsrs: {
      due: result.card.due.toISOString(), stability: result.card.stability,
      difficulty: result.card.difficulty, scheduledDays: result.card.scheduled_days,
      reps: result.card.reps, lapses: result.card.lapses, state: result.card.state,
      lastReview: result.card.last_review ? result.card.last_review.toISOString() : now.toISOString(),
      learningSteps: result.card.learning_steps,
    },
    correct: (old?.correct ?? 0) + Number(rating >= 3),
    incorrect: (old?.incorrect ?? 0) + Number(rating < 3),
    lastRating: rating,
  };
  return success({
    progress: replaceReviewProgress(progress, entryId, mode, next),
    log: { entryId, mode, rating, reviewedAt: now.toISOString(),
      due: next.fsrs.due, scheduledDays: next.fsrs.scheduledDays,
      stability: next.fsrs.stability, difficulty: next.fsrs.difficulty },
  });
}

export interface VocabularySessionItem {
  entryId: string;
  deckId: string;
  mode: VocabularyMode;
  kind: 'new' | 'due' | 'retry';
  attempt: number;
  prompt: LexicalPrompt;
}
export interface VocabularySessionEvent {
  entryId: string;
  mode: VocabularyMode;
  rating: VocabularyRating;
  previous?: VocabularyReviewProgress;
  resulting: VocabularyReviewProgress;
  appendedRetry: boolean;
  log: VocabularyReviewLog;
}
export interface VocabularySession {
  mode: VocabularyMode;
  createdAt: string;
  queue: VocabularySessionItem[];
  cursor: number;
  events: VocabularySessionEvent[];
  maxRetries: number;
}
export interface VocabularySessionOptions {
  mode: VocabularyMode;
  now: Date;
  deckIds?: readonly string[];
  newLimit?: number;
  reviewLimit?: number;
  maxRetries?: number;
  contextByEntryId?: Readonly<Record<string, LexicalContext>>;
}
export interface VocabularySessionTransition { session: VocabularySession; progress: VocabProgress; log: VocabularyReviewLog }
export interface VocabularySessionSummary {
  complete: boolean;
  pending: number;
  answered: number;
  correct: number;
  incorrect: number;
  newlyIntroduced: number;
  uniqueEntries: number;
}

/** Due first, then new, deterministic deck/source order. Empty decks produce a completed session. */
export function createVocabularySession(library: VocabularyLibrary, progress: VocabProgress,
  options: VocabularySessionOptions): VocabularyResult<VocabularySession> {
  if (!Number.isFinite(options.now.getTime())) return failure('INVALID_CONTEXT', 'Expected valid injected session date.');
  if (options.deckIds) for (const id of options.deckIds) if (!library.decks.some(d => d.id === id))
    return failure('UNKNOWN_DECK', `Unknown vocabulary deck: ${id}`);
  const due = selectDueVocabulary(library, progress, options.mode, options.now, options.reviewLimit ?? 30, options.deckIds);
  const fresh = selectNewVocabulary(library, progress, options.mode, options.newLimit ?? 10, options.deckIds);
  const queue: VocabularySessionItem[] = [];
  for (const selection of [...due, ...fresh]) {
    const prompt = makeLexicalPrompt(selection.entry, options.mode, options.contextByEntryId?.[selection.entry.id] ?? 'standalone');
    if (!prompt.ok) return prompt;
    queue.push({ entryId: selection.entry.id, deckId: selection.deck.id, mode: options.mode,
      kind: selection.kind, attempt: 0, prompt: prompt.value });
  }
  return success({ mode: options.mode, createdAt: options.now.toISOString(), queue, cursor: 0,
    events: [], maxRetries: Math.max(0, Math.floor(options.maxRetries ?? 1)) });
}
export function currentVocabularyItem(session: VocabularySession): VocabularySessionItem | null {
  return session.queue[session.cursor] ?? null;
}
export function submitVocabularyRating(library: VocabularyLibrary, session: VocabularySession,
  progress: VocabProgress, rating: VocabularyRating, now: Date): VocabularyResult<VocabularySessionTransition> {
  const item = currentVocabularyItem(session);
  if (!item) return failure('SESSION_COMPLETE', 'The vocabulary session is already complete.');
  const previous = getReviewProgress(progress, item.entryId, item.mode);
  const result = scheduleVocabularyReview(library, progress, item.entryId, item.mode, rating, now);
  if (!result.ok) return result;
  const resulting = getReviewProgress(result.value.progress, item.entryId, item.mode)!;
  const appendedRetry = rating === 1 && item.attempt < session.maxRetries;
  const queue = appendedRetry ? [...session.queue, { ...item, kind: 'retry' as const, attempt: item.attempt + 1 }] : [...session.queue];
  const event: VocabularySessionEvent = { entryId: item.entryId, mode: item.mode, rating,
    previous, resulting, appendedRetry, log: result.value.log };
  return success({ progress: result.value.progress, log: result.value.log,
    session: { ...session, queue, cursor: session.cursor + 1, events: [...session.events, event] } });
}

/** Undo only the last vocabulary mode record, preserving unrelated vocabulary updates. */
export function undoVocabularyRating(session: VocabularySession, progress: VocabProgress): VocabularyResult<{
  session: VocabularySession; progress: VocabProgress
}> {
  const last = session.events[session.events.length - 1];
  if (!last || session.cursor < 1) return failure('NOTHING_TO_UNDO', 'No vocabulary review to undo.');
  const current = getReviewProgress(progress, last.entryId, last.mode);
  if (JSON.stringify(current) !== JSON.stringify(last.resulting))
    return failure('NOTHING_TO_UNDO', 'Vocabulary progress changed since this answer; refusing to overwrite it.');
  const next = replaceReviewProgress(progress, last.entryId, last.mode, last.previous);
  return success({ progress: next,
    session: { ...session, cursor: session.cursor - 1,
      queue: last.appendedRetry ? session.queue.slice(0, -1) : [...session.queue],
      events: session.events.slice(0, -1) } });
}

export function vocabularySessionSummary(session: VocabularySession): VocabularySessionSummary {
  return { complete: session.cursor >= session.queue.length,
    pending: Math.max(0, session.queue.length - session.cursor), answered: session.events.length,
    correct: session.events.filter(e => e.rating >= 3).length,
    incorrect: session.events.filter(e => e.rating < 3).length,
    newlyIntroduced: new Set(session.events.filter((e, i) => session.queue[i]?.kind === 'new').map(e => e.entryId)).size,
    uniqueEntries: new Set(session.queue.map(q => q.entryId)).size };
}

/** Automatic grading is deliberately conservative: only exact target matches schedule.
 * Unknown/near alternatives require an explicit reveal/manual Again before SRS changes.
 */
export function submitVocabularyAnswer(library: VocabularyLibrary, session: VocabularySession,
  progress: VocabProgress, answer: string, now: Date): VocabularyResult<{
    session: VocabularySession; progress: VocabProgress; log: VocabularyReviewLog | null;
    feedback: LexicalFeedback; needsAdjudication: boolean
  }> {
  const item = currentVocabularyItem(session);
  if (!item) return failure('SESSION_COMPLETE', 'The vocabulary session is already complete.');
  const feedback = checkLexicalResponse(item.prompt, answer, library.entries[item.entryId], library);
  if (!feedback.correct) return success({ session, progress, log: null, feedback, needsAdjudication: true });
  const updated = submitVocabularyRating(library, session, progress, 3, now);
  if (!updated.ok) return updated;
  return success({ ...updated.value, feedback, needsAdjudication: false });
}
