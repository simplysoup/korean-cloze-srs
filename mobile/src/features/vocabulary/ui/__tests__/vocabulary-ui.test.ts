import type {
  VocabController, VocabDeckSummary, VocabProgress, VocabPrompt, VocabReviewResult,
} from '../../contracts';
import type { AnswerEvaluation } from '../../../contracts/answers';
import {
  deckCounts, directionLabel, feedbackLabel, filterDeckPrompts, promptContext,
  verifiedAlternatives,
} from '../presentation';
import {
  advanceSession, createSession, currentPrompt, repeatMissed, retryNearMiss,
  withFeedback,
} from '../session-state';

const nativeId = 'vocab_foundations_native_numbers';
const otherId = 'vocab_foundations_sino_numbers';
const prompt: VocabPrompt = {
  id: 'prompt_one',
  entryId: 'vocab_native_numbers_001',
  deckId: nativeId,
  mode: 'learn',
  direction: 'english_to_korean',
  cue: 'one',
  contextEnglish: 'One apple (native number, before a counter)',
  canonicalAnswer: '한',
  acceptedAlternatives: [],
  explanation: 'Before counters, 하나 becomes 한.',
  contentReadiness: 'draft',
};
const second: VocabPrompt = {
  ...prompt, id: 'prompt_two', entryId: 'vocab_native_numbers_002',
  cue: 'two', canonicalAnswer: '두',
};
const other: VocabPrompt = {
  ...prompt, id: 'prompt_sino', deckId: otherId,
  entryId: 'vocab_sino_numbers_001', canonicalAnswer: '일',
};
const progress: VocabProgress = {
  deckId: nativeId, entryId: prompt.entryId, state: 'review',
  dueAt: '2026-11-10T00:00:00Z', lastReviewedAt: null,
  reviewCount: 1, lapseCount: 0, stability: 1, difficulty: 5,
};
const deck: VocabDeckSummary = {
  id: nativeId, title: 'Native Korean numbers', description: 'Counting',
  sortOrder: 0, totalEntries: 3, learnedEntries: 1,
  dueEntries: 1, contentReadiness: 'draft',
};
const valid: AnswerEvaluation = {
  outcome: 'target_correct', canonicalAnswer: '한',
  acceptedAlternatives: [{ answer: '하나', note: 'Standalone only, not before a counter' }],
  explanation: 'Correct form.', retryAllowed: false, targetMasteryEligible: true,
};
const near: AnswerEvaluation = {
  outcome: 'near_miss', canonicalAnswer: '한',
  acceptedAlternatives: [], explanation: 'Use the shortened counter form.',
  errorType: 'other', retryAllowed: true, targetMasteryEligible: false,
};
const wrong: AnswerEvaluation = {
  outcome: 'incorrect', canonicalAnswer: '한', acceptedAlternatives: [],
  explanation: 'Native Korean, not Sino-Korean here.',
  retryAllowed: false, targetMasteryEligible: false,
};
const offTarget: AnswerEvaluation = {
  outcome: 'valid_off_target', canonicalAnswer: '한', acceptedAlternatives: [],
  explanation: 'A valid form in a different context.',
  retryAllowed: false, targetMasteryEligible: false,
};
function result(evaluation: AnswerEvaluation): VocabReviewResult {
  return { promptId: prompt.id, entryId: prompt.entryId, evaluation,
    attemptedAt: '2026-11-10T17:00:00Z', progress: null };
}

describe('vocabulary UI model', () => {
  test('empty deck and empty session have explicit completion states', () => {
    expect(deckCounts({ ...deck, totalEntries: 0 }, [])).toEqual({
      total: 0, learned: 1, due: 1, new: 0,
    });
    const session = createSession('learn', nativeId, []);
    expect(session.phase).toBe('complete');
    expect(currentPrompt(session)).toBeNull();
  });

  test('a new learner sees introduction before first practice', () => {
    const session = createSession('learn', nativeId, [prompt]);
    expect(session.phase).toBe('introduction');
    expect(advanceSession(session).phase).toBe('question');
    expect(directionLabel(prompt.direction)).toContain('Production');
  });

  test('correct response produces recorded-success feedback, then completes', () => {
    const asking = advanceSession(createSession('learn', nativeId, [prompt]));
    const answered = withFeedback(asking, { kind: 'graded', result: result(valid) });
    expect(answered.correct).toBe(1);
    expect(answered.missedPromptIds).toEqual([]);
    expect(feedbackLabel(valid)).toBe('Correct');
    expect(advanceSession(answered).phase).toBe('complete');
  });

  test('incorrect response remains a missed entry, without mastery', () => {
    const asking = createSession('review', nativeId, [prompt]);
    const answered = withFeedback(asking, { kind: 'graded', result: result(wrong) });
    expect(answered.correct).toBe(0);
    expect(answered.missedPromptIds).toEqual([prompt.id]);
    expect(wrong.targetMasteryEligible).toBe(false);
  });

  test('verified accepted alternatives retain context notes, not inferred variants', () => {
    expect(verifiedAlternatives([
      { answer: '한', note: 'Before a counter' },
      { answer: '한' },
      { answer: '   ' },
    ])).toEqual([{ answer: '한', note: 'Before a counter' }]);
    expect(verifiedAlternatives(wrong.acceptedAlternatives)).toEqual([]);
  });

  test('near miss can retry only when the evaluator authorizes it', () => {
    const session = withFeedback(createSession('review', nativeId, [prompt]),
      { kind: 'graded', result: result(near) });
    expect(session.nearMiss).toBe(1);
    expect(retryNearMiss(session).phase).toBe('question');
    expect(retryNearMiss(withFeedback(createSession('review', nativeId, [prompt]),
      { kind: 'graded', result: result(wrong) })).phase).toBe('feedback');
    expect(feedbackLabel(near)).toContain('Nearly right');
  });

  test('valid-but-off-target Korean is not granted vocabulary or grammar mastery', () => {
    const feedback = withFeedback(createSession('review', nativeId, [prompt]),
      { kind: 'graded', result: result(offTarget) });
    expect(feedback.correct).toBe(0);
    expect(feedback.missedPromptIds).toEqual([prompt.id]);
    expect(offTarget.targetMasteryEligible).toBe(false);
  });

  test('review completes after each question and missed practice can restart', () => {
    const state = createSession('review', nativeId, [prompt, second]);
    const afterFirst = advanceSession(withFeedback(state,
      { kind: 'graded', result: result(wrong) }));
    expect(afterFirst.index).toBe(1);
    const done = advanceSession(withFeedback(afterFirst,
      { kind: 'graded', result: { ...result(valid), promptId: second.id } }));
    expect(done.phase).toBe('complete');
    const missed = repeatMissed(done);
    expect(missed.mode).toBe('missed');
    expect(missed.prompts.map((item) => item.id)).toEqual([prompt.id]);
  });

  test('progress uses the independent vocabulary deck summary and lexical IDs', () => {
    expect(deckCounts(deck, [progress])).toEqual({
      total: 3, new: 2, due: 1, learned: 1,
    });
    expect(progress.entryId.startsWith('vocab_')).toBe(true);
  });

  test('Korean input remains complete for long text and deck filter excludes blocked prompts', () => {
    const long = '가나다라마바사아자차카타파하'.repeat(30);
    expect(filterDeckPrompts([
      { ...prompt, cue: long }, other,
      { ...second, contentReadiness: 'blocked' },
    ], nativeId).map((item) => item.cue)).toEqual([long]);
  });

  test('context disambiguates native versus Sino systems without revealing the production answer', () => {
    const context = promptContext(prompt, 'Native Korean numbers', {
      id: prompt.entryId, front: '하나', meaning: 'one', variant: '한',
      usageExample: { korean: '사과 한 개', english: 'one apple' },
    });
    expect(context).toContain('Native Korean numbers');
    expect(context).toContain('One apple (native number, before a counter)');
    expect(context).not.toContain('사과 한 개');
  });

  test('recognition context does not reveal the English meaning', () => {
    const context = promptContext({
      ...prompt, direction: 'korean_to_english',
      contextEnglish: undefined, contextKorean: undefined, cue: '하나',
      canonicalAnswer: 'one',
    }, 'Native Korean numbers', {
      id: prompt.entryId, front: '하나', meaning: 'one',
      usageExample: { korean: '사과 한 개', english: 'one apple' },
    });
    expect(context).toContain('사과 한 개');
    expect(context).not.toContain('one apple');
  });

  test('controller-shaped test mock exercises commit and reveal without side effects', async () => {
    const mock: VocabController = {
      listDecks: jest.fn(async () => [deck]),
      getSession: jest.fn(async () => [prompt]),
      getProgress: jest.fn(async () => [progress]),
      submitAnswer: jest.fn(async (_promptId: string, _answer: string) => result(valid)),
      revealAnswer: jest.fn(async () => ({
        promptId: prompt.id, canonicalAnswer: '한', acceptedAlternatives: [],
        explanation: 'Before a counter', awardsMastery: false as const,
      })),
    };
    expect((await mock.listDecks())[0].id).toBe(nativeId);
    expect((await mock.getSession('learn', 500))[0].id).toBe(prompt.id);
    expect((await mock.submitAnswer(prompt.id, '한')).evaluation.outcome).toBe('target_correct');
    expect((await mock.revealAnswer(prompt.id)).awardsMastery).toBe(false);
  });
});
