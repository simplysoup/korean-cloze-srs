/**
 * Native seed planning/parity tests. These tests run under Jest without
 * Expo SQLite; device database transaction behavior requires a separate
 * Android/iOS smoke test (see docs/handoffs/11-native-parity.md).
 */
import b1 from '../../content/topik1-level1.json';
import b2 from '../../content/topik1-level2.json';
import b3 from '../../content/topik2-level3.json';
import b4 from '../../content/topik2-level4.json';
import b5 from '../../content/topik2-level5.json';
import b6 from '../../content/topik2-level6.json';
import audit from '../../../../prisma/seed-data/review-qa/flagged-card-fixes.json';
import type { ContentBundle } from '../../content/types';
import {
  buildNativeSeedManifest, isNativeDeckPublished,
  missingNativeContentColumns, relationKey,
} from '../native-content';

const bundles = [b1, b2, b3, b4, b5, b6] as unknown as ContentBundle[];

describe('native content parity manifest', () => {
  it('has stable identities for the six authored decks with all corrected data present', () => {
    const manifest = buildNativeSeedManifest(bundles);
    expect(manifest.deckIds.size).toBe(6);
    expect(manifest.pointIds.size).toBe(229);
    expect(manifest.cardIds.size).toBe(721);
    expect(manifest.exampleIds.size).toBe(471);
    expect(manifest.deckPointPairs.size).toBe(229);
    expect(manifest.targetPairs.size).toBe(721);
    expect([...manifest.cardIds].every((id) => manifest.targetsForCard.get(id)?.size === 1)).toBe(true);
    expect(new Set(bundles.map((b) => b.deck.id)).size).toBe(6);
  });

  it('matches the exact 193 editorial post-fix card fields (not educator approval)', () => {
    const cards = new Map(
      bundles.flatMap((bundle) => bundle.lessons.flatMap((lesson) =>
        lesson.grammarPoints.flatMap((point) =>
          point.cards.map((card) => [card.id, { ...card, grammarPointId: point.id }] as const),
        ),
      )),
    );
    expect(audit.counts.total).toBe(193);
    expect(audit.rows).toHaveLength(193);
    for (const disposition of audit.rows) {
      const actual = cards.get(disposition.cardId);
      expect(actual).toBeDefined();
      expect(actual?.grammarPointId).toBe(disposition.grammarPointId);
      for (const field of ['fullSentence', 'sentenceWithBlank', 'answer', 'englishHint', 'alternateAnswers'] as const) {
        expect(actual?.[field]).toEqual(disposition.after[field]);
      }
      expect(disposition.educatorReview).toBe('pending');
    }
  });

  it('keeps advanced content physically present but unpublished unless its flag is enabled', () => {
    const manifest = buildNativeSeedManifest(bundles);
    expect(manifest.deckIds.has('deck_topik2_level6')).toBe(true);
    for (const id of ['deck_topik1_level1', 'deck_topik1_level2']) {
      expect(isNativeDeckPublished(id)).toBe(true);
    }
    for (const n of [3, 4, 5, 6]) {
      const id = `deck_topik2_level${n}`;
      expect(isNativeDeckPublished(id)).toBe(false);
      expect(isNativeDeckPublished(id, true)).toBe(true);
    }
    expect(isNativeDeckPublished('deck_non_topik', true)).toBe(false);
    expect(isNativeDeckPublished('unknown_deck', true)).toBe(false);
  });

  it('rejects duplicate cards and target pairs before any SQLite writes', () => {
    const duplicate = JSON.parse(JSON.stringify(b1)) as ContentBundle;
    const gp = duplicate.lessons[0].grammarPoints[0];
    gp.cards.push({ ...gp.cards[0] });
    expect(() => buildNativeSeedManifest([duplicate])).toThrow('Duplicate native cloze card');

    const duplicateTarget = JSON.parse(JSON.stringify(b1)) as ContentBundle;
    const targetGp = duplicateTarget.lessons[0].grammarPoints[0];
    targetGp.cards[0].extraTargets = [{
      grammarPointId: targetGp.id, wordReplacement: targetGp.cards[0].answer, blankIndex: 0,
    }];
    expect(() => buildNativeSeedManifest([duplicateTarget])).toThrow('Duplicate native target relation');
  });

  it('rejects a dangling target instead of recording a successful version', () => {
    const invalid = JSON.parse(JSON.stringify(b1)) as ContentBundle;
    invalid.lessons[0].grammarPoints[0].cards[0].extraTargets = [{
      grammarPointId: 'gp_missing', wordReplacement: 'invalid', blankIndex: 0,
    }];
    expect(() => buildNativeSeedManifest([invalid])).toThrow('Unknown native target grammar point');
  });

  it('uses unambiguous pair keys and safe additive prior-schema migrations', () => {
    expect(relationKey('a_b', 'c')).not.toBe(relationKey('a', 'b_c'));
    expect(missingNativeContentColumns('cloze_cards', [
      'id', 'grammar_point_id', 'full_sentence', 'sentence_with_blank',
      'vocab_base_form', 'alternate_answers', 'english_hint', 'introduced_at_position',
    ])).toEqual([]);
    expect(missingNativeContentColumns('cloze_cards', ['id', 'grammar_point_id'])).toContain(
      'ALTER TABLE "cloze_cards" ADD COLUMN "alternate_answers" TEXT NOT NULL DEFAULT \'[]\'',
    );
    expect(() => missingNativeContentColumns('review_cards', [])).toThrow('Unknown native content table');
  });
});
