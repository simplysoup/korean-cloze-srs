import raw from '../../../../content/vocabulary-foundations.json';
import {
  loadFoundationalVocabulary, loadVocabulary, initializeVocabProgress,
  selectNewVocabulary, selectDueVocabulary, makeLexicalPrompt, checkLexicalResponse,
  composeSinoMinute, withAcceptedLexicalVariants, scheduleVocabularyReview,
  getVocabularyDeckStats, createVocabularySession, currentVocabularyItem,
  submitVocabularyRating, undoVocabularyRating, vocabularySessionSummary,
  buildLearnerVocabularyLibrary,
} from '../index';

const now = new Date('2026-11-10T12:00:00.000Z');
const later = new Date('2030-11-10T12:00:00.000Z');
const parsed = loadFoundationalVocabulary();
if (!parsed.ok) throw new Error(JSON.stringify(parsed.errors));
const library = parsed.value;
const entry = (id: string) => library.entries[id];

const requirePrompt = (id: string, mode: 'recognition' | 'production',
  context: 'standalone' | 'before-counter' | 'clock-hour' | 'clock-minute' | 'spoken-month' = 'standalone') => {
  const p = makeLexicalPrompt(entry(id), mode, context);
  if (!p.ok) throw new Error(JSON.stringify(p.errors));
  return p.value;
};

const review = (progress: ReturnType<typeof initializeVocabProgress>, id: string,
  mode: 'recognition' | 'production', rating: 1 | 2 | 3 | 4, date = now) => {
  const r = scheduleVocabularyReview(library, progress, id, mode, rating, date);
  if (!r.ok) throw new Error(JSON.stringify(r.errors));
  return r.value.progress;
};

describe('authoritative foundational vocabulary', () => {
  it('validates exactly 145 entries across seven uniquely ordered decks', () => {
    expect(library.decks).toHaveLength(7);
    expect(Object.keys(library.entries)).toHaveLength(145);
    expect(library.decks.map(d => d.entryIds.length)).toEqual([28, 18, 21, 27, 16, 16, 19]);
    const ids = library.decks.flatMap(d => d.entryIds);
    expect(new Set(ids).size).toBe(145);
    for (const d of library.decks) for (const id of d.entryIds) {
      expect(id.startsWith('vocab_')).toBe(true);
      expect(library.entries[id].deckId).toBe(d.id);
      expect(library.entries[id].usageExample.korean.length).toBeGreaterThan(0);
      expect(library.entries[id].usageExample.english.length).toBeGreaterThan(0);
    }
    expect(loadVocabulary(raw)).toEqual(parsed);
  });
  it('rejects duplicate deck membership and malformed lexical content', () => {
    const duplicated = JSON.parse(JSON.stringify(raw));
    duplicated.decks[1].entries[0].id = duplicated.decks[0].entries[0].id;
    const bad = loadVocabulary(duplicated);
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.errors[0].code).toBe('DUPLICATE_ID');
    duplicated.decks[1].entries[0].id = 'vocab_changed';
    duplicated.decks[1].entries[0].usageExample = null;
    expect(loadVocabulary(duplicated).ok).toBe(false);
  });
  it('returns intact source feedback metadata', () => {
    const p = requirePrompt('vocab_native_numbers_001', 'production', 'before-counter');
    expect(p.usageExample.korean).toContain('한 개');
    expect(p.usageNote).toContain('counters');
  });
});

describe('contextual lexical checks', () => {
  it('separates recognition from production and normalization does not accept wrong forms', () => {
    const recognition = requirePrompt('vocab_native_numbers_001', 'recognition');
    expect(checkLexicalResponse(recognition, ' ONE ').correct).toBe(true);
    expect(checkLexicalResponse(requirePrompt('vocab_native_numbers_001', 'production'), '하나').correct).toBe(true);
    expect(checkLexicalResponse(requirePrompt('vocab_native_numbers_001', 'production'), '한', entry('vocab_native_numbers_001')).outcome).toBe('near');
    expect(checkLexicalResponse(requirePrompt('vocab_native_numbers_001', 'production', 'before-counter'), '한').correct).toBe(true);
    expect(checkLexicalResponse(requirePrompt('vocab_native_numbers_001', 'production', 'before-counter'), '하나', entry('vocab_native_numbers_001')).outcome).toBe('near');
  });
  it('distinguishes native hours, Sino minutes and counter contractions', () => {
    expect(requirePrompt('vocab_native_numbers_012', 'production', 'clock-hour').acceptedAnswers).toEqual(['열두 시']);
    expect(checkLexicalResponse(requirePrompt('vocab_native_numbers_012', 'production', 'clock-hour'), '열두 시').correct).toBe(true);
    expect(makeLexicalPrompt(entry('vocab_native_numbers_012'), 'production', 'clock-minute').ok).toBe(false);
    expect(makeLexicalPrompt(entry('vocab_sino_numbers_003'), 'production', 'clock-hour').ok).toBe(false);
    const minutes = composeSinoMinute(entry('vocab_sino_numbers_012'), entry('vocab_sino_numbers_004'));
    expect(minutes).toEqual({ ok: true, value: '십이 분' });
    const base = requirePrompt('vocab_sino_numbers_012', 'production', 'clock-minute');
    const composite = withAcceptedLexicalVariants(base, ['십이 분']);
    expect(checkLexicalResponse(composite, '십이 분').correct).toBe(true);
    expect(checkLexicalResponse(composite, '열두 시').correct).toBe(false);
  });
  it('handles spoken month readings as contextual forms, including 6월 and 10월', () => {
    const june = requirePrompt('vocab_calendar_018', 'production', 'spoken-month');
    const october = requirePrompt('vocab_calendar_022', 'production', 'spoken-month');
    expect(june.acceptedAnswers).toEqual(['유월']);
    expect(october.acceptedAnswers).toEqual(['시월']);
    expect(checkLexicalResponse(june, '육월').correct).toBe(false);
    expect(checkLexicalResponse(requirePrompt('vocab_calendar_018', 'production'), '유월').correct).toBe(false);
  });
  it('requires prompt-specific accepted alternatives; close typos stay ungraded', () => {
    const p = requirePrompt('vocab_calendar_001', 'production');
    expect(checkLexicalResponse(p, '월요잍').outcome).toBe('near');
    expect(checkLexicalResponse(p, '화요일').outcome).not.toBe('correct');
    expect(checkLexicalResponse(withAcceptedLexicalVariants(p, ['월욜']), '월욜').correct).toBe(true);
    expect(checkLexicalResponse(p, '월욜').correct).toBe(false);
  });
});

describe('separate serializable progress and FSRS', () => {
  it('initializes idempotently, accepts old vocab cards, filters grammar keys without mutating input', () => {
    const grammar = { grammarPointId: 'gp_eun_neun', reviewCards: { x: 3 }, mastery: 17,
      entries: { gp_eun_neun: { recognition: { fsrs: {} } } } };
    const before = JSON.stringify(grammar);
    expect(initializeVocabProgress(grammar, library)).toEqual({ version: 1, entries: {} });
    expect(JSON.stringify(grammar)).toBe(before);
    const initial = initializeVocabProgress(null, library);
    expect(initializeVocabProgress(initial, library)).toEqual(initial);
    const advanced = review(initial, 'vocab_native_numbers_001', 'recognition', 3);
    expect(initializeVocabProgress(advanced, library)).toEqual(advanced);
    expect(initializeVocabProgress({ cards: advanced.entries }, library)).toEqual(advanced);
    expect(JSON.parse(JSON.stringify(advanced))).toEqual(advanced);
    expect(advanced).not.toHaveProperty('reviewCards');
    expect(advanced).not.toHaveProperty('grammarPointId');
  });
  it('selects new cards and due reviews separately, in deterministic order', () => {
    const empty = initializeVocabProgress(null, library);
    const selected = selectNewVocabulary(library, empty, 'production', 2, [library.decks[0].id]);
    expect(selected.map(s => s.entry.id)).toEqual(['vocab_native_numbers_001', 'vocab_native_numbers_002']);
    expect(selectDueVocabulary(library, empty, 'production', now)).toHaveLength(0);
    const progress = review(empty, 'vocab_native_numbers_001', 'production', 3);
    expect(selectNewVocabulary(library, progress, 'production', 1)[0].entry.id).toBe('vocab_native_numbers_002');
    expect(selectDueVocabulary(library, progress, 'production', later).some(s => s.entry.id === 'vocab_native_numbers_001')).toBe(true);
    expect(selectNewVocabulary(library, progress, 'recognition', 1)[0].entry.id).toBe('vocab_native_numbers_001');
  });
  it('schedules repeated reviews using injected dates; preserves input state', () => {
    const original = initializeVocabProgress(null, library);
    const first = review(original, 'vocab_native_numbers_001', 'recognition', 3);
    expect(original.entries).toEqual({});
    expect(first.entries.vocab_native_numbers_001.recognition?.fsrs.reps).toBeGreaterThan(0);
    const second = review(first, 'vocab_native_numbers_001', 'recognition', 1, later);
    expect(second.entries.vocab_native_numbers_001.recognition?.incorrect).toBe(1);
    expect(second.entries.vocab_native_numbers_001.recognition?.correct).toBe(1);
    expect(first.entries.vocab_native_numbers_001.recognition?.incorrect).toBe(0);
    expect(second.entries.vocab_native_numbers_001.production).toBeUndefined();
  });
  it('produces deck stats and library projections without any grammar counters', () => {
    const progress = review(initializeVocabProgress(null, library), 'vocab_native_numbers_001', 'recognition', 3);
    const stats = getVocabularyDeckStats(library, progress, later, 'recognition');
    expect(stats[0].total).toBe(28);
    expect(stats[0].new).toBe(27);
    expect(stats[0].reviewed).toBe(1);
    expect(stats[0].due).toBe(1);
    const projected = buildLearnerVocabularyLibrary(library, progress, later);
    expect(projected).toHaveLength(7);
    expect(projected[0].recognition.reviewed).toBe(1);
    expect(projected[0].production.reviewed).toBe(0);
  });
});

describe('offline sessions, retry, completion and undo', () => {
  it('creates sessions for every foundational deck and handles empty deck selection', () => {
    const progress = initializeVocabProgress(null, library);
    for (const d of library.decks) {
      const s = createVocabularySession(library, progress, { mode: 'recognition', now, deckIds: [d.id], newLimit: 2 });
      expect(s.ok).toBe(true);
      if (s.ok) expect(s.value.queue).toHaveLength(2);
    }
    const s = createVocabularySession(library, progress, { mode: 'recognition', now, deckIds: [], newLimit: 10 });
    expect(s.ok).toBe(true);
    if (s.ok) expect(vocabularySessionSummary(s.value).complete).toBe(true);
  });
  it('retries wrong answers and undoes last transition without clobbering grammar state', () => {
    const start = initializeVocabProgress(null, library);
    const created = createVocabularySession(library, start, { mode: 'production', now, newLimit: 1, reviewLimit: 0 });
    if (!created.ok) throw new Error('session failed');
    const s1 = submitVocabularyRating(library, created.value, start, 1, now);
    if (!s1.ok) throw new Error('first answer failed');
    expect(s1.value.session.queue).toHaveLength(2);
    expect(s1.value.session.queue[1].kind).toBe('retry');
    expect(s1.value.progress.entries.vocab_native_numbers_001.production?.incorrect).toBe(1);
    const undone = undoVocabularyRating(s1.value.session, s1.value.progress);
    if (!undone.ok) throw new Error('undo failed');
    expect(undone.value.progress).toEqual(start);
    expect(undone.value.session.queue).toHaveLength(1);
    const replay = submitVocabularyRating(library, undone.value.session, undone.value.progress, 3, now);
    if (!replay.ok) throw new Error('retry failed');
    expect(vocabularySessionSummary(replay.value.session).complete).toBe(true);
    expect(currentVocabularyItem(replay.value.session)).toBeNull();
    expect(submitVocabularyRating(library, replay.value.session, replay.value.progress, 3, now).ok).toBe(false);
  });
  it('repeats wrong items once and completes after a successful retry', () => {
    const progress = initializeVocabProgress();
    const created = createVocabularySession(library, progress, { mode: 'recognition', now, newLimit: 1, reviewLimit: 0 });
    if (!created.ok) throw new Error('session failed');
    const first = submitVocabularyRating(library, created.value, progress, 1, now);
    if (!first.ok) throw new Error('grade failed');
    const second = submitVocabularyRating(library, first.value.session, first.value.progress, 3, now);
    if (!second.ok) throw new Error('retry failed');
    expect(vocabularySessionSummary(second.value.session)).toEqual({ complete: true, pending: 0,
      answered: 2, correct: 1, incorrect: 1, newlyIntroduced: 1, uniqueEntries: 1 });
    expect(second.value.progress.entries.vocab_native_numbers_001.recognition?.correct).toBe(1);
  });
});
