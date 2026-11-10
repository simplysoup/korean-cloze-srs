import type { ContentBundle } from '../content/types';
import { flattenContent } from '../content/types';
import { CURRICULUM_FLAGS } from '../features/flags';

/**
 * Seeding and publication are separate concerns. Native keeps all six authored
 * bundles as content rows so future upgrades need no destructive migrations;
 * only the released decks may enter learner-facing queues and catalogues.
 */
export function isNativeDeckPublished(
  deckId: string,
  topik2Enabled: boolean = CURRICULUM_FLAGS.topik2Grammar,
): boolean {
  if (deckId === 'deck_topik1_level1' || deckId === 'deck_topik1_level2') return true;
  return topik2Enabled && /^deck_topik2_level[3-6]$/.test(deckId);
}

export interface NativeSeedManifest {
  deckIds: ReadonlySet<string>;
  pointIds: ReadonlySet<string>;
  cardIds: ReadonlySet<string>;
  exampleIds: ReadonlySet<string>;
  deckPointPairs: ReadonlySet<string>;
  targetPairs: ReadonlySet<string>;
  /** Keyed by card ID; guards against stale or duplicate target relations. */
  targetsForCard: ReadonlyMap<string, ReadonlySet<string>>;
}

export const relationKey = (a: string, b: string): string => JSON.stringify([a, b]);

/**
 * Fail before starting a write transaction if bundled content has duplicate
 * identities or broken references. A typo must never mark a release version
 * as successfully seeded.
 */
export function buildNativeSeedManifest(bundles: readonly ContentBundle[]): NativeSeedManifest {
  const deckIds = new Set<string>();
  const pointIds = new Set<string>();
  const cardIds = new Set<string>();
  const exampleIds = new Set<string>();
  const deckPointPairs = new Set<string>();
  const targetPairs = new Set<string>();
  const targetsForCard = new Map<string, Set<string>>();
  const assertUnique = (set: Set<string>, key: string, kind: string) => {
    if (set.has(key)) throw new Error(`Duplicate native ${kind}: ${key}`);
    set.add(key);
  };

  for (const bundle of bundles) {
    assertUnique(deckIds, bundle.deck.id, 'deck');
    for (const { gp } of flattenContent(bundle).grammarPoints) {
      assertUnique(pointIds, gp.id, 'grammar point');
      assertUnique(deckPointPairs, relationKey(bundle.deck.id, gp.id), 'deck relation');
      for (const card of gp.cards) {
        assertUnique(cardIds, card.id, 'cloze card');
        const targets = new Set<string>();
        const primary = relationKey(card.id, gp.id);
        assertUnique(targetPairs, primary, 'target relation');
        targets.add(gp.id);
        for (const extra of card.extraTargets ?? []) {
          const key = relationKey(card.id, extra.grammarPointId);
          assertUnique(targetPairs, key, 'target relation');
          targets.add(extra.grammarPointId);
        }
        targetsForCard.set(card.id, targets);
      }
      for (const example of gp.lessonExamples) {
        assertUnique(exampleIds, example.id, 'lesson example');
      }
    }
  }
  for (const target of targetPairs) {
    const [, gpId] = JSON.parse(target) as [string, string];
    if (!pointIds.has(gpId)) throw new Error(`Unknown native target grammar point: ${gpId}`);
  }
  return { deckIds, pointIds, cardIds, exampleIds, deckPointPairs, targetPairs, targetsForCard };
}

/** Safe additive migrations for legacy content tables only. */
export const NATIVE_CONTENT_COLUMNS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  grammar_points: {
    tense: 'TEXT', register: 'TEXT', level: 'INTEGER NOT NULL DEFAULT 1',
    tags: "TEXT NOT NULL DEFAULT '[]'", structure_pattern: 'TEXT', notes: 'TEXT',
    related_point_ids: "TEXT NOT NULL DEFAULT '[]'",
    lesson_number: 'INTEGER NOT NULL DEFAULT 0', position: 'INTEGER NOT NULL DEFAULT 0',
  },
  cloze_cards: {
    vocab_base_form: "TEXT NOT NULL DEFAULT ''",
    alternate_answers: "TEXT NOT NULL DEFAULT '[]'",
    english_hint: "TEXT NOT NULL DEFAULT '\"\"'",
    introduced_at_position: 'INTEGER NOT NULL DEFAULT 0',
  },
  cloze_card_grammar_targets: { blank_index: 'INTEGER NOT NULL DEFAULT 0' },
  lesson_examples: {
    english_hint: "TEXT NOT NULL DEFAULT '\"\"'",
    order: 'INTEGER NOT NULL DEFAULT 0',
    notes: 'TEXT',
  },
  decks: {
    description: "TEXT NOT NULL DEFAULT ''", level: 'INTEGER NOT NULL DEFAULT 1',
    topik_level: "TEXT NOT NULL DEFAULT 'topik1-1'",
    sort_order: 'INTEGER NOT NULL DEFAULT 0',
  },
  deck_grammar_points: {
    sort_order: 'INTEGER NOT NULL DEFAULT 0',
    lesson_number: 'INTEGER NOT NULL DEFAULT 0',
  },
};

/** Callers must use the fixed table names above, never user-controlled SQL. */
export function missingNativeContentColumns(
  tableName: string,
  existingColumnNames: readonly string[],
): string[] {
  const declared = NATIVE_CONTENT_COLUMNS[tableName];
  if (!declared) throw new Error(`Unknown native content table: ${tableName}`);
  const existing = new Set(existingColumnNames);
  return Object.entries(declared)
    .filter(([name]) => !existing.has(name))
    .map(([name, ddl]) => `ALTER TABLE "${tableName}" ADD COLUMN "${name}" ${ddl}`);
}
