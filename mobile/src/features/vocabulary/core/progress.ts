import { type VocabularyDeck, type VocabularyEntry, type VocabularyLibrary } from './content';

export type VocabularyMode = 'recognition' | 'production';
export interface VocabularyFsrsCard {
  due: string; // ISO 8601: persistence-safe, not a Date instance
  stability: number;
  difficulty: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: number; // ts-fsrs 0 new, 1 learning, 2 review, 3 relearning
  lastReview: string | null;
  learningSteps: number;
}
export interface VocabularyReviewProgress {
  fsrs: VocabularyFsrsCard;
  correct: number;
  incorrect: number;
  lastRating: 1 | 2 | 3 | 4 | null;
}
export interface VocabularyEntryProgress {
  recognition?: VocabularyReviewProgress;
  production?: VocabularyReviewProgress;
}
export interface VocabProgress {
  version: 1;
  entries: Record<string, VocabularyEntryProgress>; // keyed ONLY by vocabulary entry ID
}
export interface VocabularySelection { entry: VocabularyEntry; deck: VocabularyDeck; mode: VocabularyMode; kind: 'new' | 'due' }
export interface VocabularyDeckStats {
  deckId: string;
  title: string;
  mode: VocabularyMode;
  total: number;
  new: number;
  due: number;
  learning: number;
  reviewed: number;
  mature: number;
}

const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const finiteNonnegative = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const nonnegativeInt = (v: unknown): v is number => finiteNonnegative(v) && Number.isSafeInteger(v);
const asIso = (v: unknown): string | null => {
  if (!(v instanceof Date) && typeof v !== 'string') return null;
  const date = new Date(v);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
};
function readReview(raw: unknown): VocabularyReviewProgress | undefined {
  if (!record(raw) || !record(raw.fsrs)) return undefined;
  const c = raw.fsrs;
  const due = asIso(c.due);
  const lastReview = c.lastReview == null ? null : asIso(c.lastReview);
  if (!due || (c.lastReview != null && !lastReview) || !finiteNonnegative(c.stability) ||
    !finiteNonnegative(c.difficulty) || !nonnegativeInt(c.reps) || !nonnegativeInt(c.lapses) ||
    !nonnegativeInt(c.scheduledDays) || !nonnegativeInt(c.learningSteps) ||
    !nonnegativeInt(c.state) || c.state > 3) return undefined;
  const lastRating = [1, 2, 3, 4].includes(raw.lastRating as number) ? raw.lastRating as 1 | 2 | 3 | 4 : null;
  return { fsrs: { due, lastReview, stability: c.stability, difficulty: c.difficulty,
    reps: c.reps, lapses: c.lapses, scheduledDays: c.scheduledDays,
    learningSteps: c.learningSteps, state: c.state },
  correct: nonnegativeInt(raw.correct) ? raw.correct : 0,
  incorrect: nonnegativeInt(raw.incorrect) ? raw.incorrect : 0, lastRating };
}

/** Rebuilds from whitelisted fields; discards malformed/grammar data, never mutates raw. */
export function initializeVocabProgress(raw: unknown = null, library?: VocabularyLibrary): VocabProgress {
  const source = record(raw) ? (record(raw.entries) ? raw.entries : record(raw.cards) ? raw.cards : {}) : {};
  const entries: Record<string, VocabularyEntryProgress> = Object.create(null);
  if (record(source)) for (const [id, value] of Object.entries(source)) {
    // A library prevents orphaned/grammar identifiers entering vocabulary storage.
    if (!id.startsWith('vocab_') || (library && !Object.hasOwn(library.entries, id)) || !record(value)) continue;
    const recognition = readReview(value.recognition);
    const production = readReview(value.production);
    if (recognition || production) entries[id] = { ...(recognition ? { recognition } : {}), ...(production ? { production } : {}) };
  }
  return { version: 1, entries };
}

export function getReviewProgress(progress: VocabProgress, entryId: string, mode: VocabularyMode): VocabularyReviewProgress | undefined {
  return progress.entries[entryId]?.[mode];
}
export function replaceReviewProgress(progress: VocabProgress, entryId: string, mode: VocabularyMode,
  next: VocabularyReviewProgress | undefined): VocabProgress {
  const entries = { ...progress.entries };
  const prev = entries[entryId];
  const updated = { ...prev };
  if (next) updated[mode] = next;
  else delete updated[mode];
  if (updated.recognition || updated.production) entries[entryId] = updated;
  else delete entries[entryId];
  return { version: 1, entries };
}

function enabledDecks(library: VocabularyLibrary, deckIds?: readonly string[]): VocabularyDeck[] {
  const chosen = deckIds ? new Set(deckIds) : null;
  return library.decks.filter(d => !chosen || chosen.has(d.id));
}
function candidates(library: VocabularyLibrary, deckIds?: readonly string[]): { entry: VocabularyEntry; deck: VocabularyDeck }[] {
  return enabledDecks(library, deckIds).flatMap(deck => deck.entryIds.map(id => ({ entry: library.entries[id], deck })));
}
export function selectNewVocabulary(library: VocabularyLibrary, progress: VocabProgress, mode: VocabularyMode,
  limit = 10, deckIds?: readonly string[]): VocabularySelection[] {
  if (limit <= 0) return [];
  return candidates(library, deckIds).filter(({ entry }) => !getReviewProgress(progress, entry.id, mode))
    .slice(0, Math.floor(limit)).map(({ entry, deck }) => ({ entry, deck, mode, kind: 'new' }));
}
export function selectDueVocabulary(library: VocabularyLibrary, progress: VocabProgress, mode: VocabularyMode,
  now: Date, limit = 50, deckIds?: readonly string[]): VocabularySelection[] {
  if (limit <= 0 || !Number.isFinite(now.getTime())) return [];
  return candidates(library, deckIds).filter(({ entry }) => {
    const review = getReviewProgress(progress, entry.id, mode);
    return review && Date.parse(review.fsrs.due) <= now.getTime();
  }).sort((a, b) => Date.parse(getReviewProgress(progress, a.entry.id, mode)!.fsrs.due)
    - Date.parse(getReviewProgress(progress, b.entry.id, mode)!.fsrs.due))
    .slice(0, Math.floor(limit)).map(({ entry, deck }) => ({ entry, deck, mode, kind: 'due' }));
}

export function getVocabularyDeckStats(library: VocabularyLibrary, progress: VocabProgress, now: Date,
  mode: VocabularyMode): VocabularyDeckStats[] {
  return library.decks.map(deck => {
    let fresh = 0, due = 0, learning = 0, reviewed = 0, mature = 0;
    for (const id of deck.entryIds) {
      const r = getReviewProgress(progress, id, mode);
      if (!r) { fresh++; continue; }
      reviewed++;
      if (Date.parse(r.fsrs.due) <= now.getTime()) due++;
      if (r.fsrs.state === 1 || r.fsrs.state === 3) learning++;
      if (r.fsrs.state === 2 && r.fsrs.stability >= 30) mature++;
    }
    return { deckId: deck.id, title: deck.title, mode, total: deck.entryIds.length,
      new: fresh, due, learning, reviewed, mature };
  });
}

/** UI-friendly library projection retaining both recognition and production progress. */
export function buildLearnerVocabularyLibrary(library: VocabularyLibrary, progress: VocabProgress, now: Date) {
  return library.decks.map(deck => ({
    deck,
    entries: deck.entryIds.map(id => ({ entry: library.entries[id], progress: progress.entries[id] ?? {} })),
    recognition: getVocabularyDeckStats(library, progress, now, 'recognition').find(s => s.deckId === deck.id)!,
    production: getVocabularyDeckStats(library, progress, now, 'production').find(s => s.deckId === deck.id)!,
  }));
}
