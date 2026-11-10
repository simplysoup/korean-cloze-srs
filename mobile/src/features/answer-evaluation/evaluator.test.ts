import catalog from '../../content/answer-feedback.json';
import { evaluateAnswer, normalizeKoreanAnswer } from './evaluator';
import type { AnswerFeedbackCatalog } from './types';
import { createAnswerEvaluator } from './contract-adapter';

const metadata = catalog as AnswerFeedbackCatalog;
const evaluate = (cardId: string, submittedAnswer: string, grammarPointId?: string) =>
  evaluateAnswer({ cardId, submittedAnswer, grammarPointId }, metadata);

describe('conservative grammar answer evaluation', () => {
  it('normalizes NFC and whitespace only', () => {
    expect(normalizeKoreanAnswer('  한글   공부  ')).toBe('한글 공부');
    expect(normalizeKoreanAnswer(' 은 ')).toBe('은');
    expect(normalizeKoreanAnswer('먹어 요')).not.toBe(normalizeKoreanAnswer('먹어요'));
    expect(normalizeKoreanAnswer('학교에')).not.toBe(normalizeKoreanAnswer('학교로'));
    expect(evaluate('cc_gap_informal_haeche_02', '  먹어  ').classification).toBe('target_correct');
  });

  it('classifies all 54 individually curated alternatives without fabricating forms', () => {
    let total = 0;
    for (const [cardId, card] of Object.entries(metadata.cards)) {
      for (const alt of card.acceptedAlternatives) {
        const result = evaluate(cardId, ` ${alt.value} `, card.grammarPointId);
        expect(result.classification).toBe(alt.classification);
        expect(result.targetMasteryEligible).toBe(alt.classification === 'target_correct');
        expect(result.expectedCanonicalAnswer).toBe(card.canonicalAnswer);
        total += 1;
      }
    }
    expect(total).toBe(54);
    expect(metadata.counts.cards).toBe(721);
    expect(metadata.counts.alternativeCards).toBe(44);
  });

  it('does not award destination mastery for a directional alternative', () => {
    const result = evaluate('cc_e_loc_01', '로', 'gp_e_loc');
    expect(result.classification).toBe('valid_off_target');
    expect(result.targetMasteryEligible).toBe(false);
    expect(result.feedback).toMatch(/destination|target construction/i);
    expect(evaluate('cc_e_loc_01', '에').targetMasteryEligible).toBe(true);
    expect(evaluate('cc_e_variant_park', '으로').classification).toBe('valid_off_target');
  });

  it('distinguishes topic from subject on the exact paired curriculum frame', () => {
    const subject = evaluate('cc_i_ga_01', '은');
    const topic = evaluate('cc_eun_neun_02', '이');
    expect(subject.classification).toBe('near_miss');
    expect(topic.classification).toBe('near_miss');
    expect(subject.errorCategory).toBe('particle');
    expect(subject.sentenceStatus).toBe('different_grammatical_form');
    expect(topic.targetMasteryEligible).toBe(false);
    expect(evaluate('cc_i_ga_01', '이').classification).toBe('target_correct');
  });

  it('does not mistake polite speech for ungrammatical Korean', () => {
    const result = evaluate('cc_gap_informal_haeche_02', '먹어요');
    expect(result.classification).toBe('near_miss');
    expect(result.errorCategory).toBe('register');
    expect(result.sentenceStatus).toBe('different_grammatical_form');
    expect(result.feedback).toMatch(/polite/i);
  });

  it('identifies formal, casual and honorific mismatches', () => {
    expect(evaluate('cc_gap_plain_declarative_01', '먹어요').errorCategory).toBe('register');
    expect(evaluate('cc_gap_get_intention_03', '겠어요').errorCategory).toBe('register');
    const honorific = evaluate('cc_gap_honorific_special_verbs_03', '있어요');
    expect(honorific.classification).toBe('near_miss');
    expect(honorific.errorCategory).toBe('honorific');
    expect(evaluate('cc_gap_recipient_kke_01', '한테').errorCategory).toBe('honorific');
  });

  it('detects known tense and aspect contrasts', () => {
    expect(evaluate('cc_gap_neg_ji_mot_02', '지 못해요').errorCategory).toBe('tense');
    expect(evaluate('cc_gap_ge_hada_action_01', '게 해요').errorCategory).toBe('tense');
    const aspect = evaluate('cc_gap_resultative_eo_itda_01', '서고 있어요');
    expect(aspect.errorCategory).toBe('aspect');
    expect(aspect.targetMasteryEligible).toBe(false);
  });

  it('distinguishes known irregular errors and particle selection', () => {
    const irregular = evaluate('cc_gap_b_irregular_01', '가볍어요');
    expect(irregular.classification).toBe('near_miss');
    expect(irregular.errorCategory).toBe('irregular');
    expect(irregular.sentenceStatus).toBe('formation_error');
    expect(evaluate('cc_gap_d_irregular_01', '듣어요').errorCategory).toBe('irregular');
    expect(evaluate('cc_gap_wa_gwa_03', '와').errorCategory).toBe('particle');
    expect(evaluate('cc_gap_recipient_ege_hante_01', '에').sentenceStatus).toBe('context_sensitive');
  });

  it('accepts only the explicitly curated full and contracted forms', () => {
    const full = evaluate('cc_jiyo_01', '지요');
    const contracted = evaluate('cc_jiyo_01', '죠');
    expect(full.classification).toBe('target_correct');
    expect(contracted.classification).toBe('target_correct');
    expect(contracted.targetMasteryEligible).toBe(true);
    expect(evaluate('cc_ge_doeda_01', '되었어요').targetMasteryEligible).toBe(true);
    expect(evaluate('cc_jiyo_01', '죠요').classification).toBe('incorrect');
  });

  it('handles independently valid answers but not their target equivalence', () => {
    const first = evaluate('cc_gap_wa_gwa_01', '랑');
    const second = evaluate('cc_gap_wa_gwa_01', '하고');
    expect(first.classification).toBe('valid_off_target');
    expect(second.classification).toBe('valid_off_target');
    expect(first.curatedAlternatives).toHaveLength(2);
    expect(first.relevantAlternativeForms).toEqual(expect.arrayContaining(['와', '랑', '하고']));
    expect(evaluate('cc_gap_recipient_ege_hante_01', '에게').classification).toBe('target_correct');
  });

  it('returns incorrect without making universal grammatical claims', () => {
    const unrelated = evaluate('cc_gap_informal_haeche_02', '자동차');
    expect(unrelated.classification).toBe('incorrect');
    expect(unrelated.targetMasteryEligible).toBe(false);
    expect(unrelated.sentenceStatus).toBe('not_assessed');
    expect(unrelated.feedback).toMatch(/does not establish/i);
  });

  it('abstains on missing metadata, stale grammar point or unresolved context', () => {
    expect(evaluate('not_a_card', '먹어').classification).toBe('unclassified');
    expect(evaluate('cc_gap_informal_haeche_02', '먹어', 'gp_wrong').classification).toBe('unclassified');
    const unresolved: AnswerFeedbackCatalog = {
      ...metadata,
      cards: {
        'cc_i_ga_01': { ...metadata.cards.cc_i_ga_01, ambiguity: 'needs_editorial_resolution' },
      },
    };
    const response = evaluateAnswer({ cardId: 'cc_i_ga_01', submittedAnswer: '은' }, unresolved);
    expect(response.classification).toBe('unclassified');
    expect(response.targetMasteryEligible).toBe(false);
    expect(response.feedback).toMatch(/editor/i);
  });
});

describe('frozen Agent 00 answer contract', () => {
  const bridge = createAnswerEvaluator(metadata);
  const original = metadata.cards.cc_e_loc_01;
  const request = {
    exerciseId: 'cc_e_loc_01',
    targetGrammarIds: [original.grammarPointId],
    canonicalAnswer: original.canonicalAnswer,
    acceptedAlternatives: original.acceptedAlternatives.map((a) => ({ answer: a.value, note: a.explanation })),
    submittedAnswer: '로',
    sentenceContext: original.sentenceWithBlank,
  };
  it('bridges valid off-target without granting target mastery', () => {
    const result = bridge.evaluate(request);
    expect(result.outcome).toBe('valid_off_target');
    expect(result.targetMasteryEligible).toBe(false);
    expect(result.acceptedAlternatives).toHaveLength(1);
  });
  it('bridges canonical answers to the only eligible success branch', () => {
    const result = bridge.evaluate({ ...request, submittedAnswer: '에' });
    expect(result.outcome).toBe('target_correct');
    expect(result.targetMasteryEligible).toBe(true);
  });
  it('abstains when canonical answer, prompt, point or alternative metadata is stale', () => {
    for (const alteration of [
      { canonicalAnswer: '에서' },
      { sentenceContext: '동물원___ 가요.' },
      { targetGrammarIds: ['gp_not_loc'] },
      { acceptedAlternatives: [] },
    ]) {
      const result = bridge.evaluate({ ...request, ...alteration, submittedAnswer: '에' });
      expect(result.outcome).toBe('unclassified');
      expect(result.targetMasteryEligible).toBe(false);
    }
  });
});
