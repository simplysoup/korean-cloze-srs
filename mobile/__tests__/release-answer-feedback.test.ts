/** Agent 13: catalogue-wide grading and fail-safe target mastery. */
import rawCatalog from '../src/content/answer-feedback.json';
import { evaluateAnswer } from '../src/features/answer-evaluation/evaluator';
import { createAnswerEvaluator } from '../src/features/answer-evaluation/contract-adapter';
import type { AnswerFeedbackCatalog } from '../src/features/answer-evaluation/types';

const catalog = rawCatalog as AnswerFeedbackCatalog;

describe('release: target-only grammar mastery', () => {
  it('recognizes 721 canonical responses against their own grammar IDs', () => {
    expect(Object.keys(catalog.cards)).toHaveLength(721);
    for (const [cardId, card] of Object.entries(catalog.cards)) {
      const r = evaluateAnswer({
        cardId, grammarPointId: card.grammarPointId, submittedAnswer: card.canonicalAnswer,
      }, catalog);
      expect(r.classification).toBe('target_correct');
      expect(r.targetMasteryEligible).toBe(true);
    }
  });
  it('checks all 54 curated alternatives without off-target mastery', () => {
    let count = 0;
    for (const [cardId, card] of Object.entries(catalog.cards)) {
      for (const alt of card.acceptedAlternatives) {
        const r = evaluateAnswer({
          cardId, grammarPointId: card.grammarPointId, submittedAnswer: alt.value,
        }, catalog);
        expect(r.classification).toBe(alt.classification);
        expect(r.targetMasteryEligible).toBe(r.classification === 'target_correct');
        expect(r.relevantAlternativeForms).toContain(alt.value);
        count++;
      }
    }
    expect(count).toBe(54);
  });
  it('covers all five outcomes and abstains without a fabricated error diagnosis', () => {
    const cases = [
      ['cc_e_loc_01', '에', 'target_correct'],
      ['cc_e_loc_01', '로', 'valid_off_target'],
      ['cc_gap_informal_haeche_02', '먹어요', 'near_miss'],
      ['cc_gap_informal_haeche_02', '', 'incorrect'],
      ['not_an_authored_card', '무엇', 'unclassified'],
    ] as const;
    for (const [cardId, submittedAnswer, expected] of cases) {
      const r = evaluateAnswer({ cardId, submittedAnswer }, catalog);
      expect(r.classification).toBe(expected);
      expect(r.targetMasteryEligible).toBe(expected === 'target_correct');
      expect(r.feedback.length).toBeGreaterThan(0);
      if (expected === 'unclassified') {
        expect(r.errorCategory).toBeNull();
        expect(r.sentenceStatus).toBe('not_assessed');
      }
    }
  });
  it('abstains on forged card context or wrong requested grammar identity', () => {
    const bridge = createAnswerEvaluator(catalog);
    const card = catalog.cards.cc_e_loc_01;
    const valid = {
      exerciseId: 'cc_e_loc_01', targetGrammarIds: [card.grammarPointId],
      canonicalAnswer: card.canonicalAnswer,
      acceptedAlternatives: card.acceptedAlternatives.map(a => ({ answer: a.value, note: a.explanation })),
      sentenceContext: card.sentenceWithBlank, submittedAnswer: card.canonicalAnswer,
    };
    expect(bridge.evaluate(valid).targetMasteryEligible).toBe(true);
    for (const forged of [
      { ...valid, sentenceContext: 'different sentence' },
      { ...valid, targetGrammarIds: ['gp_wrong'] },
      { ...valid, canonicalAnswer: 'invented' },
    ]) {
      const r = bridge.evaluate(forged);
      expect(r.outcome).toBe('unclassified');
      expect(r.targetMasteryEligible).toBe(false);
    }
  });
});
