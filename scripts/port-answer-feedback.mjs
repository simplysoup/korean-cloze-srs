/**
 * Deterministic compiler for the curated grammar answer-feedback manifest.
 * Usage: node scripts/port-answer-feedback.mjs [--check]
 * This code does not synthesize Korean forms or treat pending reviews as approvals.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const OUTPUT = 'mobile/src/content/answer-feedback.json';
const DECKS = [
  'topik1-level1', 'topik1-level2',
  'topik2-level3', 'topik2-level4', 'topik2-level5', 'topik2-level6',
];
const AMBIGUITY_FLAGS = new Set([
  'particle_function_may_depend_on_context',
  'possible_noun_connector_or_recipient_variation',
  'accepted_alternatives_need_sentence_review',
]);

const ALT_CLASS = {
  same_target_construction: 'target_correct',
  natural_other_construction: 'valid_off_target',
  same_recipient_relation_different_style: 'target_correct',
  same_person_source_relation_different_style: 'target_correct',
  equivalent_other_connector_register_shift: 'valid_off_target',
};
// These are *diagnostic contrasts*, not newly accepted answers. Both exact
// sentence frames occur in the published grammar catalogue with opposing
// topic/subject teaching cues. They remain pending educator confirmation.
const TOPIC_SUBJECT_CONTRASTS = [
  {
    cardId: 'cc_i_ga_01', otherCardId: 'cc_eun_neun_02',
    explanation: '은 marks the topic in the paired curriculum sentence. This prompt specifically asks you to identify the focused subject with 이. The topic sentence is not proof of subject-particle mastery.',
  },
  {
    cardId: 'cc_eun_neun_02', otherCardId: 'cc_i_ga_01',
    explanation: '이 focuses the subject in the paired curriculum sentence. This prompt asks for topic marking with 은. Both roles need different discourse context.',
  },
];
const NEAR_CLASS = {
  incorrect_irregular_form: ['irregular', 'formation_error'],
  valid_other_register: ['register', 'different_grammatical_form'],
  valid_other_tense: ['tense', 'different_grammatical_form'],
  wrong_recipient_particle: ['particle', 'context_sensitive'],
  incorrect_consonant_selection: ['particle', 'formation_error'],
  valid_other_honorific_level: ['honorific', 'different_grammatical_form'],
  valid_nonhonorific: ['honorific', 'different_grammatical_form'],
  different_aspect: ['aspect', 'different_grammatical_form'],
  third_person_framing: ['perspective', 'different_grammatical_form'],
};

const assert = (cond, message) => { if (!cond) throw new Error(message); };
async function readJson(root, relative) {
  return JSON.parse(await readFile(join(root, relative), 'utf8'));
}
function uniqueStrings(strings, context) {
  assert(strings.every((s) => typeof s === 'string' && s.trim()), `${context}: empty/non-string value`);
  assert(new Set(strings.map((s) => s.normalize('NFC').trim().replace(/\s+/gu, ' '))).size === strings.length,
    `${context}: duplicate normalized answer`);
}

export async function buildAnswerFeedback(root = ROOT) {
  const cards = new Map();
  for (const deckName of DECKS) {
    const deck = await readJson(root, `mobile/src/content/${deckName}.json`);
    for (const lesson of deck.lessons) {
      for (const grammar of lesson.grammarPoints) {
        for (const card of grammar.cards ?? []) {
          assert(!cards.has(card.id), `Duplicate card ID: ${card.id}`);
          assert(card.answer && grammar.id, `${card.id}: missing canonical answer or grammar point`);
          uniqueStrings([card.answer, ...(card.alternateAnswers ?? [])], card.id);
          cards.set(card.id, {
            grammarPointId: grammar.id,
            canonicalAnswer: card.answer,
            sentenceWithBlank: card.sentenceWithBlank,
            fullSentence: card.fullSentence,
            acceptedAlternatives: [],
            nearMisses: [],
            ambiguity: 'not_flagged',
            editorialFlags: [],
            educatorReview: 'pending',
            _sourceAlternatives: card.alternateAnswers ?? [],
            _sentenceWithBlank: card.sentenceWithBlank,
          });
        }
      }
    }
  }

  const backlog = await readJson(root, 'docs/research/legacy-answer-ambiguity-backlog.json');
  const flagged = await readJson(root, 'prisma/seed-data/review-qa/flagged-card-fixes.json');
  const gaps = await readJson(root, 'docs/research/grammar-answer-ambiguity-audit.json');
  const legacyIds = new Set();
  for (const row of backlog.queue) {
    assert(!legacyIds.has(row.cardId), `Duplicate legacy audit: ${row.cardId}`);
    legacyIds.add(row.cardId);
    const card = cards.get(row.cardId);
    assert(card && card.grammarPointId === row.grammarPointId, `Legacy card missing/mismatched: ${row.cardId}`);
  }
  assert(legacyIds.size === flagged.rows.length, 'Legacy audit/flagged remediation size mismatch');

  for (const row of flagged.rows) {
    const card = cards.get(row.cardId);
    assert(legacyIds.has(row.cardId) && card, `Unmatched flagged card: ${row.cardId}`);
    assert(card.grammarPointId === row.grammarPointId && card.canonicalAnswer === row.after.answer,
      `${row.cardId}: flagged post-edit canonical mismatch`);
    assert(JSON.stringify(card._sourceAlternatives) === JSON.stringify(row.after.alternateAnswers),
      `${row.cardId}: flagged post-edit alternatives mismatch`);
    const assessments = row.acceptedVariantAssessments ?? [];
    assert(assessments.length === card._sourceAlternatives.length,
      `${row.cardId}: each accepted alternative needs an explicit judgement`);
    card.editorialFlags = row.originalFlags ?? [];
    const mayBeAmbiguous = card.editorialFlags.some((flag) => AMBIGUITY_FLAGS.has(flag));
    card.ambiguity = !mayBeAmbiguous ? 'not_flagged'
      : row.disposition === 'structural_false_positive' || row.disposition === 'fixed_phrase_false_positive'
        ? 'resolved_by_prompt'
        : row.after.englishHint !== row.before.englishHint || row.disposition === 'curated_same_target_variant'
          ? 'resolved_by_prompt' : 'needs_editorial_resolution';
    for (const alt of assessments) {
      assert(card._sourceAlternatives.includes(alt.input), `${row.cardId}: phantom flagged alternative ${alt.input}`);
      const classification = ALT_CLASS[alt.classification];
      assert(classification, `${row.cardId}: unknown alternate classification ${alt.classification}`);
      assert(alt.nuance && alt.educatorReview === 'pending', `${row.cardId}: missing alternative provenance`);
      card.acceptedAlternatives.push({
        value: alt.input, classification, explanation: alt.nuance,
        source: 'flagged_remediation', educatorReview: 'pending',
      });
    }
  }

  const gapIds = new Set();
  for (const row of gaps.cards) {
    const card = cards.get(row.cardId);
    assert(!gapIds.has(row.cardId), `Duplicate gap audit: ${row.cardId}`);
    gapIds.add(row.cardId);
    assert(card && card.grammarPointId === row.grammarPointId && card.canonicalAnswer === row.canonicalAnswer,
      `Gap audit mismatch: ${row.cardId}`);
    const altItems = row.acceptedAlternatives ?? [];
    assert(altItems.length === card._sourceAlternatives.length,
      `${row.cardId}: gap accepted alternative list mismatch`);
    for (const alt of altItems) {
      assert(card._sourceAlternatives.includes(alt.input), `${row.cardId}: phantom gap alternative ${alt.input}`);
      const classification = ALT_CLASS[alt.classification];
      assert(classification && alt.explanation && alt.humanReview === 'pending',
        `${row.cardId}: unknown/missing gap alternative judgement`);
      card.acceptedAlternatives.push({
        value: alt.input, classification, explanation: alt.explanation,
        source: 'gap_audit', educatorReview: 'pending',
      });
    }
    for (const near of row.nearMissExamples ?? []) {
      const mapped = NEAR_CLASS[near.classification];
      assert(mapped && near.feedback && near.humanReview === 'pending',
        `${row.cardId}: unknown/missing near-miss judgement ${near.classification}`);
      card.nearMisses.push({
        value: near.input, category: mapped[0], sentenceStatus: mapped[1],
        explanation: near.feedback, source: 'gap_audit', educatorReview: 'pending',
      });
    }
  }

  for (const contrast of TOPIC_SUBJECT_CONTRASTS) {
    const card = cards.get(contrast.cardId);
    const other = cards.get(contrast.otherCardId);
    assert(card && other && card._sentenceWithBlank === other._sentenceWithBlank,
      `Cannot verify exact topic/subject sentence pair: ${contrast.cardId}`);
    assert(card.grammarPointId !== other.grammarPointId,
      `Expected different target grammar for ${contrast.cardId}`);
    card.nearMisses.push({
      value: other.canonicalAnswer,
      category: 'particle',
      sentenceStatus: 'different_grammatical_form',
      explanation: contrast.explanation,
      source: 'corpus_contrast',
      educatorReview: 'pending',
    });
  }

  const output = {};
  for (const id of [...cards.keys()].sort()) {
    const card = cards.get(id);
    assert(card.acceptedAlternatives.length === card._sourceAlternatives.length,
      `${id}: an alternate is missing an explicit editorial classification`);
    uniqueStrings([
      card.canonicalAnswer,
      ...card.acceptedAlternatives.map((a) => a.value),
      ...card.nearMisses.map((n) => n.value),
    ], id);
    delete card._sourceAlternatives;
    delete card._sentenceWithBlank;
    output[id] = card;
  }
  const values = Object.values(output);
  return {
    schemaVersion: 1,
    provenance: 'Deterministic port of the six grammar bundles, 193-card flagged remediation, and 93-card grammar-gap audit; all editorial judgements pending independent Korean educator review.',
    counts: {
      cards: values.length,
      alternativeCards: values.filter((c) => c.acceptedAlternatives.length).length,
      alternativeStrings: values.reduce((n, c) => n + c.acceptedAlternatives.length, 0),
      nearMissCards: values.filter((c) => c.nearMisses.length).length,
      nearMissStrings: values.reduce((n, c) => n + c.nearMisses.length, 0),
    },
    cards: output,
  };
}

export function serializeAnswerFeedback(manifest) {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = await buildAnswerFeedback();
  const serialized = serializeAnswerFeedback(manifest);
  if (process.argv.includes('--check')) {
    const current = await readFile(join(ROOT, OUTPUT), 'utf8');
    assert(serialized === current, `${OUTPUT} is stale; run node scripts/port-answer-feedback.mjs`);
  } else {
    await writeFile(join(ROOT, OUTPUT), serialized, 'utf8');
  }
  console.log(JSON.stringify(manifest.counts));
}
