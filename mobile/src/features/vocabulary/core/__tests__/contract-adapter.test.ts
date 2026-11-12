import {
  loadFoundationalVocabulary, initializeVocabProgress, makeLexicalPrompt,
  checkLexicalResponse, toControllerVocabularyPrompt, toControllerAnswerEvaluation,
  toControllerVocabularyProgress, toControllerDeckSummaries, scheduleVocabularyReview,
  submitVocabularyAnswer, createVocabularySession,
} from '../index';

const result = loadFoundationalVocabulary();
if (!result.ok) throw new Error(JSON.stringify(result.errors));
const library = result.value;
const now = new Date('2026-11-10T12:00:00.000Z');

describe('Agent 00 frozen vocabulary contracts', () => {
  it('maps source prompts to opaque stable DTO identifiers and marks draft readiness', () => {
    const entry = library.entries.vocab_native_numbers_001;
    const prompt = makeLexicalPrompt(entry, 'production', 'before-counter');
    if (!prompt.ok) throw new Error('bad prompt');
    const dto = toControllerVocabularyPrompt(prompt.value, entry, 'learn');
    expect(dto).toMatchObject({ id: 'lexical:vocab_native_numbers_001:production:before-counter',
      entryId: entry.id, deckId: entry.deckId, mode: 'learn', direction: 'context',
      canonicalAnswer: '한', contentReadiness: 'draft' });
    expect(dto.explanation).toContain(entry.usageExample.korean);
  });
  it('never grants target mastery for near or unknown answers', () => {
    const entry = library.entries.vocab_native_numbers_001;
    const prompt = makeLexicalPrompt(entry, 'production');
    if (!prompt.ok) throw new Error('bad prompt');
    const correct = toControllerAnswerEvaluation(checkLexicalResponse(prompt.value, '하나', entry));
    expect(correct.outcome).toBe('target_correct');
    expect(correct.targetMasteryEligible).toBe(true);
    const near = toControllerAnswerEvaluation(checkLexicalResponse(prompt.value, '한', entry));
    expect(near.outcome).toBe('near_miss');
    expect(near.targetMasteryEligible).toBe(false);
    const unknown = toControllerAnswerEvaluation(checkLexicalResponse(prompt.value, '임의', entry));
    expect(unknown.outcome).toBe('unclassified');
    expect(unknown.targetMasteryEligible).toBe(false);
  });
  it('projects separate FSRS directions conservatively without persisting DTOs', () => {
    const empty = initializeVocabProgress(null, library);
    const dto0 = toControllerVocabularyProgress(library, empty, 'vocab_native_numbers_001');
    expect(dto0?.state).toBe('new');
    const a = scheduleVocabularyReview(library, empty, 'vocab_native_numbers_001', 'recognition', 3, now);
    if (!a.ok) throw new Error('bad schedule');
    expect(toControllerVocabularyProgress(library, a.value.progress, 'vocab_native_numbers_001')?.state).toBe('learning');
    const b = scheduleVocabularyReview(library, a.value.progress, 'vocab_native_numbers_001', 'production', 3, now);
    if (!b.ok) throw new Error('bad schedule');
    expect(toControllerVocabularyProgress(library, b.value.progress, 'vocab_native_numbers_001')?.reviewCount).toBeGreaterThan(1);
    const summaries = toControllerDeckSummaries(library, b.value.progress, now);
    expect(summaries[0]).toMatchObject({ totalEntries: 28, learnedEntries: 1, contentReadiness: 'draft' });
  });
  it('does not schedule unfamiliar responses automatically', () => {
    const progress = initializeVocabProgress(null, library);
    const session = createVocabularySession(library, progress, { mode: 'production', now, newLimit: 1, reviewLimit: 0 });
    if (!session.ok) throw new Error('bad session');
    const outcome = submitVocabularyAnswer(library, session.value, progress, 'different', now);
    if (!outcome.ok) throw new Error('bad evaluation');
    expect(outcome.value).toMatchObject({ needsAdjudication: true, log: null, progress });
    expect(outcome.value.session.cursor).toBe(0);
  });
});
