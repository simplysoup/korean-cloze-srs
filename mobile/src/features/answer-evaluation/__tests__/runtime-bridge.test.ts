import catalogJson from '../../../content/answer-feedback.json';
import { checkAnswers, ratingForCheck } from '../../../lib/srs';
import type { AnswerFeedbackCatalog } from '../types';
import {
  beginAnswerAttempt, evaluateLiveAnswer, learnActionForOutcome, legacyLearnAction,
  legacyReviewAction, prepareLiveAnswerRequest, prepareReviewCommit, revealAnswerAttempt,
  reviewActionForOutcome, settleReviewCommit, submitAnswerAttempt, undoAnswerAttempt,
  type LearnAnswerItem, type ReviewAnswerItem,
} from '../runtime';

const catalog = catalogJson as AnswerFeedbackCatalog;
const grammar = {
  title: 'Test point', category: 'particle', tense: 'past', register: 'polite',
  hint: '', description: '',
};

function review(id: string): { kind: 'review'; item: ReviewAnswerItem } {
  const card = catalog.cards[id];
  return { kind: 'review', item: {
    clozeCardId: id, grammarPointId: card.grammarPointId,
    sentenceWithBlank: card.sentenceWithBlank, fullSentence: card.fullSentence,
    wordReplacement: card.canonicalAnswer,
    answers: [card.canonicalAnswer, ...card.acceptedAlternatives.map((alt) => alt.value)],
    grammar,
  } };
}
function learn(id: string): { kind: 'learn'; item: LearnAnswerItem } {
  const card = catalog.cards[id];
  return { kind: 'learn', item: {
    id, grammarPointId: card.grammarPointId,
    sentenceWithBlank: card.sentenceWithBlank, fullSentence: card.fullSentence,
    answer: card.canonicalAnswer,
    alternateAnswers: card.acceptedAlternatives.map((alt) => alt.value),
    grammar,
  } };
}

function outcome(id: string, value: string) {
  return evaluateLiveAnswer(review(id), [value], catalog);
}

describe('Agent 12 live-screen answer request adapter', () => {
  it('uses stable review cloze id, exact authored canonical, only vetted alternatives, context, register and tense', () => {
    const card = catalog.cards.cc_e_loc_01;
    const prepared = prepareLiveAnswerRequest(review('cc_e_loc_01'), ['로'], catalog);
    expect(prepared.status).toBe('ready');
    if (prepared.status !== 'ready') return;
    expect(prepared.request).toEqual({
      exerciseId: 'cc_e_loc_01', targetGrammarIds: [card.grammarPointId],
      canonicalAnswer: card.canonicalAnswer,
      acceptedAlternatives: card.acceptedAlternatives.map((alt) => ({ answer: alt.value, note: alt.explanation })),
      sentenceContext: card.sentenceWithBlank, submittedAnswer: '로', register: 'polite', tense: 'past',
    });
    expect(prepared.diagnostics.educatorReview).toBe('pending');
  });

  it('adapts the real Learn quiz shape, not its UI answer array as the authority', () => {
    const result = evaluateLiveAnswer(learn('cc_e_loc_01'), ['에'], catalog);
    expect(result.status).toBe('evaluated');
    expect(result.feedback.classification).toBe('target_correct');
    expect(result.feedback.targetMasteryEligible).toBe(true);
  });

  it('does not silently promote a wordReplacement or a legacy alternate not in the editorial catalogue', () => {
    const item = review('cc_e_loc_01');
    item.item.answers.push('에서');
    item.item.wordReplacement = '에서';
    const prepared = prepareLiveAnswerRequest(item, ['에서'], catalog);
    expect(prepared.status).toBe('ready');
    expect(prepared.diagnostics.unvettedLegacyAnswers).toEqual(['에서']);
    const evaluated = evaluateLiveAnswer(item, ['에서'], catalog);
    expect(evaluated.feedback.targetMasteryEligible).toBe(false);
    expect(evaluated.feedback.classification).toBe('unclassified');
  });

  it('fails closed on missing IDs, metadata, stale content, canonicals, or alternatives', () => {
    const source = review('cc_e_loc_01');
    const variants = [
      [{ ...source.item, clozeCardId: '' }, 'missing_exercise_id'],
      [{ ...source.item, grammarPointId: '' }, 'missing_grammar_point_id'],
      [{ ...source.item, clozeCardId: 'not-real' }, 'missing_authored_metadata'],
      [{ ...source.item, grammarPointId: 'gp_wrong' }, 'stale_grammar_point'],
      [{ ...source.item, sentenceWithBlank: '다른 ___.' }, 'stale_sentence_context'],
      [{ ...source.item, fullSentence: '다른 문장.' }, 'stale_full_sentence'],
      [{ ...source.item, answers: ['로'] }, 'stale_canonical_answer'],
      [{ ...source.item, answers: ['에'] }, 'stale_accepted_alternatives'],
    ] as const;
    for (const [item, expected] of variants) {
      const value = prepareLiveAnswerRequest({ kind: 'review', item }, ['에'], catalog);
      expect(value.status).toBe('unavailable');
      if (value.status === 'unavailable') expect(value.reason).toBe(expected);
      expect(evaluateLiveAnswer({ kind: 'review', item }, ['에'], catalog).feedback.targetMasteryEligible).toBe(false);
    }
  });

  it('rejects multi-blank, multi-target and mismatched submission counts, rather than granting partial mastery', () => {
    const source = review('cc_e_loc_01');
    for (const [item, values, why] of [
      [{ ...source.item, sentenceWithBlank: '___ 와 ___' }, ['에', '에'], 'unsupported_blank_count'],
      [{ ...source.item, grammarPointId: 'gp_e_loc,gp_eseo' }, ['에'], 'unsupported_target_count'],
      [source.item, ['에', '에'], 'unsupported_submission_count'],
    ] as const) {
      const prepared = prepareLiveAnswerRequest({ kind: 'review', item }, values, catalog);
      expect(prepared.status).toBe('unavailable');
      if (prepared.status === 'unavailable') expect(prepared.reason).toBe(why);
    }
  });

  it('recognizes NFC/outer whitespace but never expands/erases meaningful Korean morphology', () => {
    expect(outcome('cc_gap_informal_haeche_02', '  먹어  ').feedback.classification).toBe('target_correct');
    expect(outcome('cc_gap_informal_haeche_02', '먹어 요').feedback.targetMasteryEligible).toBe(false);
    expect(outcome('cc_e_loc_01', '으로').feedback.targetMasteryEligible).toBe(false);
  });
});

describe('five semantic outcomes + structured panel feedback', () => {
  it('canonical target can earn mastery', () => {
    const r = outcome('cc_e_loc_01', '에');
    expect(r.feedback.classification).toBe('target_correct');
    expect(r.feedback.targetMasteryEligible).toBe(true);
    expect(r.status === 'evaluated' && r.evaluation.targetMasteryEligible).toBe(true);
  });

  it('curated target-equivalent alternative can earn mastery, and carries editorial explanatory note', () => {
    const r = outcome('cc_jiyo_01', '죠');
    expect(r.feedback.classification).toBe('target_correct');
    expect(r.feedback.curatedAlternatives.some((alt) => alt.value === '죠' && !!alt.explanation)).toBe(true);
  });

  it('natural Korean in another construction cannot earn this grammar target', () => {
    const r = outcome('cc_e_loc_01', '로');
    expect(r.feedback.classification).toBe('valid_off_target');
    expect(r.feedback.sentenceStatus).toBe('different_grammatical_form');
    expect(r.feedback.targetMasteryEligible).toBe(false);
  });

  it.each([
    ['cc_gap_informal_haeche_02', '먹어요', 'register'],
    ['cc_gap_neg_ji_mot_02', '지 못해요', 'tense'],
  ])('returns an authored, targeted near-miss hint for %s', (id, value, errorType) => {
    const r = outcome(id, value);
    expect(r.feedback.classification).toBe('near_miss');
    expect(r.feedback.errorCategory).toBe(errorType);
    expect(r.feedback.targetMasteryEligible).toBe(false);
    expect(r.feedback.feedback.length).toBeGreaterThan(30);
  });

  it('marks an empty/punctuation-only nonanswer incorrect, but unseen Korean unclassified (not proven bad Korean)', () => {
    const absent = outcome('cc_e_loc_01', '');
    expect(absent.feedback.classification).toBe('incorrect');
    expect(absent.feedback.targetMasteryEligible).toBe(false);
    const unknown = outcome('cc_e_loc_01', '새로운 표현');
    expect(unknown.feedback.classification).toBe('unclassified');
    expect(unknown.feedback.sentenceStatus).toBe('not_assessed');
    expect(unknown.feedback.editorialReview).toBe('pending');
    expect(unknown.feedback.feedback).toMatch(/may be valid|review/i);
  });

  it.each(['valid_off_target', 'near_miss', 'incorrect', 'unclassified'] as const)(
    'never awards mastery or positive FSRS for %s', (bad) => {
      expect(reviewActionForOutcome(bad, false).targetMasteryEligible).toBe(false);
      expect(learnActionForOutcome(bad, false).targetMasteryEligible).toBe(false);
      expect(reviewActionForOutcome(bad, false)).not.toEqual(expect.objectContaining({ grade: 3 }));
    },
  );
});

describe('feature-off legacy parity', () => {
  const correctAnswers = ['에', '에서', '한테'];
  const fixtures = [
    ['에'], [' 에 '], ['로'], [''], ['에', '에'], ['에', '로'], [],
  ];
  it('keeps the old Boolean comparison and Good/Again for the same fixture set', () => {
    for (const inputs of fixtures) {
      const accepted = checkAnswers(inputs, correctAnswers);
      const action = legacyReviewAction(inputs, correctAnswers, false);
      expect(action.grade).toBe(ratingForCheck(accepted));
      expect(action.recycleMiss).toBe(!accepted);
      expect(legacyLearnAction(inputs, correctAnswers, false).action).toBe(accepted ? 'learn_advance' : 'learn_recycle');
    }
  });
  it('retains historical multi-blank array membership and reveal always fails', () => {
    // This is intentionally the legacy behavior, not our new single-blank semantics.
    expect(checkAnswers(['에', '에'], correctAnswers)).toBe(true);
    expect(legacyReviewAction(['에', '에'], correctAnswers, false).grade).toBe(3);
    expect(legacyReviewAction(['에'], correctAnswers, true).grade).toBe(1);
    expect(legacyLearnAction(['에'], correctAnswers, true).action).toBe('learn_recycle');
  });
});

describe('pure attempt lifecycle and single-write FSRS disposition', () => {
  it('guards repeated submit, reveal-after-success, and no false Good after reveal', () => {
    const fresh = beginAnswerAttempt('cc_e_loc_01');
    const correct = submitAnswerAttempt(fresh, 'target_correct');
    expect(submitAnswerAttempt(correct, 'target_correct')).toBe(correct);
    const revealed = revealAnswerAttempt(correct);
    expect(revealed.revealed).toBe(true);
    expect(revealAnswerAttempt(revealed)).toBe(revealed);
    const { state, intent } = prepareReviewCommit(revealed);
    expect(intent).toEqual({ exerciseId: 'cc_e_loc_01', grade: 1, recycleMiss: true });
    expect(prepareReviewCommit(state).intent).toBeNull();
    const settled = settleReviewCommit(state, true);
    expect(settled.committed).toBe(true);
    expect(prepareReviewCommit(settled).intent).toBeNull();
    expect(undoAnswerAttempt(settled)).toBe(settled);
  });

  it('undo and retry cannot write reviews; retry can re-evaluate on the same presentation', () => {
    const fresh = beginAnswerAttempt('id');
    const wrong = submitAnswerAttempt(fresh, 'near_miss');
    expect(prepareReviewCommit(fresh).intent).toBeNull();
    const undone = undoAnswerAttempt(wrong);
    expect(undone.submitted).toBe(false);
    const retried = submitAnswerAttempt(undone, 'target_correct');
    expect(prepareReviewCommit(retried).intent?.grade).toBe(3);
  });

  it('cannot record unknown replies, but can retry on a failed persistence commit', () => {
    const unknown = submitAnswerAttempt(beginAnswerAttempt('id'), 'unclassified');
    const deferred = prepareReviewCommit(unknown);
    expect(deferred.intent).toBeNull();
    expect(deferred.disposition?.action).toBe('defer_without_review');
    const missed = submitAnswerAttempt(beginAnswerAttempt('id'), 'valid_off_target');
    const pending = prepareReviewCommit(missed);
    expect(pending.intent?.grade).toBe(1);
    expect(prepareReviewCommit(pending.state).intent).toBeNull();
    const failed = settleReviewCommit(pending.state, false);
    expect(failed.committed).toBe(false);
    expect(prepareReviewCommit(failed).intent?.grade).toBe(1);
  });

  it('cycles misses and revealed answers; fresh cycled card can earn target mastery only on new correct submission', () => {
    const first = submitAnswerAttempt(beginAnswerAttempt('cloze-A'), 'near_miss');
    const commit = prepareReviewCommit(first);
    expect(commit.intent?.recycleMiss).toBe(true);
    const next = submitAnswerAttempt(beginAnswerAttempt('cloze-B'), 'target_correct');
    expect(prepareReviewCommit(next).intent?.grade).toBe(3);
    expect(learnActionForOutcome('target_correct', true)).toEqual({ action: 'learn_recycle', targetMasteryEligible: false });
  });
});
