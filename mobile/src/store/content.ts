// Content accessors for the web store — the static TOPIK bundles, read
// straight from the JSON in the JS bundle. No database: on web the content
// is immutable data, not rows to seed. This mirrors what initDb() used to
// write into the grammar_points / cloze_cards / decks /
// deck_grammar_points tables (see db/index.ts), so the query functions
// can read the same shapes from here instead of SQL.
//
// The catalogue shows unpublished TOPIK II levels + Non-TOPIK as coming soon;
// they remain listed while their content flag is disabled, so learners see them as
// coming soon, exactly as the DB catalogue rows did.

import contentBundleLevel1 from '../content/topik1-level1.json';
import contentBundleLevel2 from '../content/topik1-level2.json';
import contentBundleLevel3 from '../content/topik2-level3.json';
import contentBundleLevel4 from '../content/topik2-level4.json';
import contentBundleLevel5 from '../content/topik2-level5.json';
import contentBundleLevel6 from '../content/topik2-level6.json';
import { CURRICULUM_FLAGS } from '../features/flags';
import {
  flattenContent,
  type ClozeCardSeed,
  type ContentBundle,
  type GrammarPointSeed,
  type LessonExampleSeed,
} from '../content/types';

export interface ContentPoint {
  gp: GrammarPointSeed;
  lessonNumber: number;
  lessonTitle: string;
  /** Global 1-based position within all currently enabled content bundles. */
  position: number;
  /** 1-based position within its own bundle. */
  bundlePosition: number;
  deckId: string;
  deckTitle: string;
  topikLevel: string;
}

export interface DeckMeta {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: number;
  topikLevel: string;
  sortOrder: number;
}

export interface CardTarget {
  clozeCardId: string;
  grammarPointId: string;
  wordReplacement: string;
  blankIndex: number;
}

// Authored TOPIK II content exists but is not yet instructor-approved.
// Keep it out of the learner-facing web catalogue until release gates pass.
const CONTENT_BUNDLES: ContentBundle[] = [
  contentBundleLevel1 as unknown as ContentBundle,
  contentBundleLevel2 as unknown as ContentBundle,
  ...(CURRICULUM_FLAGS.topik2Grammar
    ? [
        contentBundleLevel3 as unknown as ContentBundle,
        contentBundleLevel4 as unknown as ContentBundle,
        contentBundleLevel5 as unknown as ContentBundle,
        contentBundleLevel6 as unknown as ContentBundle,
      ]
    : []),
];

const DECK_DESCRIPTIONS: Record<string, string> = {
  deck_topik1_level1:
    'TOPIK I Level 1 grammar — audited and reorganised into a learner-first curriculum 2026-11-09.',
  deck_topik1_level2:
    'TOPIK I Level 2 grammar. Lesson 22 (reported speech) is an optional bridge.',
  deck_topik2_level3: 'Curated TOPIK II Level 3 grammar — draft, educator approval pending.',
  deck_topik2_level4: 'Curated TOPIK II Level 4 grammar — draft, educator approval pending.',
  deck_topik2_level5: 'Curated TOPIK II Level 5 grammar — draft, educator approval pending.',
  deck_topik2_level6: 'Curated TOPIK II Level 6 grammar — draft, educator approval pending.',
};

const CATALOGUE_DECKS: DeckMeta[] = [
  { id: 'deck_topik2_level3', title: 'TOPIK II Level 3', slug: 'topik-level-3', description: 'TOPIK II Level 3 grammar.', level: 3, topikLevel: 'topik2-3', sortOrder: 2 },
  { id: 'deck_topik2_level4', title: 'TOPIK II Level 4', slug: 'topik-level-4', description: 'TOPIK II Level 4 grammar.', level: 4, topikLevel: 'topik2-4', sortOrder: 3 },
  { id: 'deck_topik2_level5', title: 'TOPIK II Level 5', slug: 'topik-level-5', description: 'TOPIK II Level 5 grammar.', level: 5, topikLevel: 'topik2-5', sortOrder: 4 },
  { id: 'deck_topik2_level6', title: 'TOPIK II Level 6', slug: 'topik-level-6', description: 'TOPIK II Level 6 grammar.', level: 6, topikLevel: 'topik2-6', sortOrder: 5 },
  { id: 'deck_non_topik', title: 'Non-TOPIK', slug: 'non-topik', description: 'Grammar outside the TOPIK syllabus.', level: 0, topikLevel: 'non-topik', sortOrder: 6 },
];

/** The deck catalogue in catalogue order (content decks first). */
export const DECKS: DeckMeta[] = [
  ...CONTENT_BUNDLES.map((bundle, index) => ({
    id: bundle.deck.id,
    title: bundle.deck.title,
    slug: bundle.deck.slug,
    description: DECK_DESCRIPTIONS[bundle.deck.id] ?? '',
    level: bundle.deck.level,
    topikLevel: bundle.deck.topikLevel,
    sortOrder: index,
  })),
  ...CATALOGUE_DECKS.filter((d) => !CONTENT_BUNDLES.some((b) => b.deck.id === d.id)),
];

const deckById = new Map(DECKS.map((d) => [d.id, d] as const));

export function getDeckMeta(deckId: string): DeckMeta | undefined {
  return deckById.get(deckId);
}

/** Every grammar point in curriculum order, with deck + lesson. */
function buildPoints(): ContentPoint[] {
  const out: ContentPoint[] = [];
  let position = 0;
  for (const bundle of CONTENT_BUNDLES) {
    let bundlePosition = 0;
    for (const { gp, lessonNumber, lessonTitle } of flattenContent(bundle).grammarPoints) {
      position += 1;
      bundlePosition += 1;
      out.push({
        gp,
        lessonNumber,
        lessonTitle,
        position,
        bundlePosition,
        deckId: bundle.deck.id,
        deckTitle: bundle.deck.title,
        topikLevel: bundle.deck.topikLevel,
      });
    }
  }
  return out;
}

export const CONTENT_POINTS: ContentPoint[] = buildPoints();

const pointById = new Map(CONTENT_POINTS.map((p) => [p.gp.id, p] as const));

export function getContentPoint(gpId: string): ContentPoint | undefined {
  return pointById.get(gpId);
}

/** Cloze cards for a grammar point (the point's own cards, in bundle order). */
export function getContentCards(gpId: string): ClozeCardSeed[] {
  return getContentPoint(gpId)?.gp.cards ?? [];
}

/** Lesson examples for a grammar point, in `order`. */
export function getContentExamples(gpId: string): LessonExampleSeed[] {
  const examples = getContentPoint(gpId)?.gp.lessonExamples ?? [];
  return [...examples].sort((a, b) => a.order - b.order);
}

/**
 * The grammar target for a (cloze card, grammar point) pair. Every card
 * targets its own grammar point (wordReplacement = the card's answer,
 * blankIndex 0) and may carry extra targets for other points — a card
 * belonging to point A can have an extra target for point B, so the card
 * is looked up globally, not just within the point's own cards.
 */
const cardById = new Map(
  CONTENT_POINTS.flatMap((p) =>
    p.gp.cards.map((card) => [card.id, { card, ownerGpId: p.gp.id }] as const),
  ),
);

export function getContentTarget(clozeCardId: string, gpId: string): CardTarget | undefined {
  const entry = cardById.get(clozeCardId);
  if (!entry) return undefined;
  if (entry.ownerGpId === gpId) {
    return { clozeCardId, grammarPointId: gpId, wordReplacement: entry.card.answer, blankIndex: 0 };
  }
  const extra = entry.card.extraTargets?.find((t) => t.grammarPointId === gpId);
  if (!extra) return undefined;
  return { clozeCardId, grammarPointId: gpId, wordReplacement: extra.wordReplacement, blankIndex: extra.blankIndex };
}

/** Grammar point ids in a deck, in curriculum order (deck sortOrder, then position). */
export function getDeckPointIds(deckId: string): string[] {
  return CONTENT_POINTS.filter((p) => p.deckId === deckId).map((p) => p.gp.id);
}

/** Lesson number -> title for a deck (from the content points). */
export function getDeckLessons(deckId: string): Map<number, string> {
  const lessons = new Map<number, string>();
  for (const p of CONTENT_POINTS) {
    if (p.deckId === deckId && !lessons.has(p.lessonNumber)) {
      lessons.set(p.lessonNumber, p.lessonTitle);
    }
  }
  return lessons;
}
