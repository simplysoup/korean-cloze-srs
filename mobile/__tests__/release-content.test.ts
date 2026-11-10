/** Agent 13: whole-pilot inventories and independent, non-SRS practice flow. */
import { loadFoundationalVocabulary } from '../src/features/vocabulary/core/content';
import { initializeVocabProgress, selectNewVocabulary } from '../src/features/vocabulary/core/progress';
import { allPassages } from '../src/features/comprehension/catalog';
import { scoreReading } from '../src/features/comprehension/assessment';
import { practice } from '../src/features/grammar-transfer';
import { availableExercises, currentExercise, recordAttempt, startSession, summarizeSession } from '../src/features/grammar-transfer/session';
import { CONTENT_POINTS } from '../src/store/content';

describe('release: independent vocabulary', () => {
  it('loads seven decks, 145 lexical IDs and no grammar identities', () => {
    const result = loadFoundationalVocabulary();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { decks, entries } = result.value;
    expect(decks).toHaveLength(7);
    expect(Object.keys(entries)).toHaveLength(145);
    expect(new Set(decks.flatMap(d => d.entryIds)).size).toBe(145);
    expect(decks.every(d => d.type === 'vocabulary')).toBe(true);
    const grammarIds = new Set(CONTENT_POINTS.map(p => p.gp.id));
    expect(Object.keys(entries).every(id => id.startsWith('vocab_') && !grammarIds.has(id))).toBe(true);
  });
  it('ignores orphan/grammar-key progress and can select all 145 new prompts', () => {
    const result = loadFoundationalVocabulary();
    if (!result.ok) throw Error('Invalid foundations');
    const progress = initializeVocabProgress({ entries: {
      gp_fake: { recognition: {} }, vocab_unknown_id: { production: {} },
    } }, result.value);
    expect(Object.keys(progress.entries)).toEqual([]);
    const fresh = selectNewVocabulary(result.value, progress, 'recognition', 145);
    expect(fresh).toHaveLength(145);
    expect(new Set(fresh.map(i => i.entry.id)).size).toBe(145);
  });
});

describe('release: comprehension / transfer do not create grammar mastery', () => {
  it('scores six passages and 24 questions without invented educator approval', () => {
    const passages = allPassages();
    expect(passages).toHaveLength(6);
    expect(passages.flatMap(p => p.questions)).toHaveLength(24);
    expect(new Set(passages.flatMap(p => p.questions.map(q => q.id))).size).toBe(24);
    expect(passages.every(p => p.educatorReviewed === false && p.editorialStatus === 'editorial-draft')).toBe(true);
    for (const passage of passages) {
      expect(scoreReading(passage, {}).complete).toBe(false);
      const allCorrect = Object.fromEntries(passage.questions.map(q => [q.id, q.correctIndex]));
      expect(scoreReading(passage, allCorrect)).toEqual(expect.objectContaining({
        complete: true, correct: passage.questions.length, percentage: 100,
      }));
      expect(scoreReading(passage, { [passage.questions[0].id]: 999 }).answered).toBe(0);
    }
  });
  it('has 52 unique contrast/transfer exercises, with only editorial status', () => {
    expect(practice.exercises).toHaveLength(52);
    expect(new Set(practice.exercises.map(e => e.id)).size).toBe(52);
    expect(practice.exercises.every(e => e.educatorApproval === 'pending')).toBe(true);
    expect(practice.exercises.some(e => e.type === 'contrast')).toBe(true);
    expect(practice.exercises.some(e => e.type === 'transfer')).toBe(true);
    expect(availableExercises(practice.exercises, new Set<string>()).every(
      e => e.prerequisiteGrammarIds.length === 0,
    )).toBe(true);
  });
  it('does not advance a session on another exercise, nor mutate prior attempts', () => {
    const unit = practice.units[0];
    const original = startSession(practice.units, practice.exercises, unit.id);
    expect(original).not.toBeNull();
    if (!original) return;
    const active = currentExercise(original, practice.exercises);
    expect(active).not.toBeNull();
    if (!active) return;
    const other = practice.exercises.find(e => e.id !== active.id);
    expect(recordAttempt(original, other, 'not current').session).toBe(original);
    const next = recordAttempt(original, active, active.accepted[0].value).session;
    expect(next.cursor).toBe(1);
    expect(next.attempts).toHaveLength(1);
    expect(summarizeSession(original).total).toBe(0);
  });
});
