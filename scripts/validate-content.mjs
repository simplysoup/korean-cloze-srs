/**
 * Validate the ported TOPIK I content (mobile/src/content/topik1-level1.json
 * and topik1-level2.json). Fails (exit 1) unless ALL of these hold, for
 * each level and across both:
 *  - Level 1: 11 lessons, 50 grammar points, 184 cloze cards, 113 lesson examples
 *  - Level 2: 11 lessons, 52 grammar points, 156 cloze cards, 104 lesson examples
 *  - every cloze card's answer appears in its fullSentence
 *  - every grammar point has >= 2 lesson examples and >= 3 cloze cards
 *  - no duplicate ids anywhere (grammar points, cards, examples, across both levels)
 *  - every relatedPointId / extraTarget grammarPointId exists (in either level)
 *  - every card's introducedAtPosition is in its level's range
 *    (Level 1: 1-50, Level 2: 51-102) and equals its owning grammar
 *    point's global position for single-target cards
 * Run: node scripts/validate-content.mjs
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const contentDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'mobile', 'src', 'content');
const errors = [];
const check = (cond, msg) => { if (!cond) errors.push(msg); };

// flattenContent, mirrored here so the validator stays a standalone script:
// positions are a running 1-based counter across both bundles in order.
function flattenAll(bundles) {
  const out = [];
  let position = 0;
  for (const { data, level } of bundles) {
    for (const lesson of data.lessons ?? []) {
      for (const gp of lesson.grammarPoints) {
        position += 1;
        out.push({ gp, lessonNumber: lesson.lessonNumber, position, level });
      }
    }
  }
  return out;
}

const levels = [
  { file: 'topik1-level1.json', level: 1, lessons: 11, gps: 50, cards: 184, examples: 113, posMin: 1, posMax: 50 },
  { file: 'topik1-level2.json', level: 2, lessons: 11, gps: 52, cards: 156, examples: 104, posMin: 51, posMax: 102 },
];

const bundles = levels.map((spec) => {
  const data = JSON.parse(readFileSync(join(contentDir, spec.file), 'utf8'));
  const lessons = data.lessons ?? [];
  const gps = lessons.flatMap((l) => l.grammarPoints);
  const cards = gps.flatMap((g) => g.cards);
  const examples = gps.flatMap((g) => g.lessonExamples);
  check(lessons.length === spec.lessons, `${spec.file}: lessons: expected ${spec.lessons}, got ${lessons.length}`);
  check(gps.length === spec.gps, `${spec.file}: grammarPoints: expected ${spec.gps}, got ${gps.length}`);
  check(cards.length === spec.cards, `${spec.file}: clozeCards: expected ${spec.cards}, got ${cards.length}`);
  check(examples.length === spec.examples, `${spec.file}: lessonExamples: expected ${spec.examples}, got ${examples.length}`);
  return { ...spec, data, lessons, gps, cards, examples };
});

const all = flattenAll(bundles);
const gpById = new Map(all.map(({ gp }) => [gp.id, gp]));
const positionById = new Map(all.map(({ gp, position }) => [gp.id, position]));
const seen = new Set();
const dup = (id, kind) => {
  if (seen.has(id)) errors.push(`duplicate ${kind} id: ${id}`);
  seen.add(id);
};

for (const { gp, position, level } of all) {
  dup(gp.id, 'grammarPoint');
  check(gp.lessonExamples.length >= 2, `${gp.id}: only ${gp.lessonExamples.length} lesson examples (need >= 2)`);
  check(gp.cards.length >= 3, `${gp.id}: only ${gp.cards.length} cloze cards (need >= 3)`);
  check(gp.level === level, `${gp.id}: level field is ${gp.level}, expected ${level}`);
  for (const id of gp.relatedPointIds ?? []) {
    check(gpById.has(id), `${gp.id}: relatedPointId ${id} does not exist`);
  }
  for (const ex of gp.lessonExamples) {
    dup(ex.id, 'lessonExample');
    check(ex.fullSentence.includes(ex.answer), `${ex.id}: answer ${JSON.stringify(ex.answer)} not in sentence ${JSON.stringify(ex.fullSentence)}`);
    check(typeof ex.englishHint === 'string' && ex.englishHint.length > 0, `${ex.id}: englishHint is not a non-empty string`);
  }
  for (const card of gp.cards) {
    dup(card.id, 'clozeCard');
    check(card.fullSentence.includes(card.answer), `${card.id}: answer ${JSON.stringify(card.answer)} not in sentence ${JSON.stringify(card.fullSentence)}`);
    check(card.sentenceWithBlank.includes('___'), `${card.id}: sentenceWithBlank has no ___ blank`);
    check(typeof card.englishHint === 'string' && card.englishHint.length > 0, `${card.id}: englishHint is not a non-empty string`);
    const spec = levels[level - 1];
    check(
      card.introducedAtPosition >= spec.posMin && card.introducedAtPosition <= spec.posMax,
      `${card.id}: introducedAtPosition ${card.introducedAtPosition} outside Level ${level} range ${spec.posMin}-${spec.posMax}`,
    );
    // A single-target card's introducedAtPosition is its owning point's
    // global position. (Cards with extraTargets may legitimately be
    // introduced later, at the most advanced target's position.)
    if (!(card.extraTargets ?? []).length) {
      check(
        card.introducedAtPosition === position,
        `${card.id}: introducedAtPosition ${card.introducedAtPosition} != owning point ${gp.id} position ${position}`,
      );
    }
    for (const t of card.extraTargets ?? []) {
      check(gpById.has(t.grammarPointId), `${card.id}: extraTarget grammarPointId ${t.grammarPointId} does not exist`);
    }
  }
}

// Positions are continuous 1-102 across both bundles in file order.
const positions = all.map(({ position }) => position);
check(
  positions.length === 102 && positions.every((p, i) => p === i + 1),
  `global positions are not continuous 1-102 (got ${positions.length} points)`,
);

if (errors.length > 0) {
  console.error(`FAIL: ${errors.length} validation error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
const totals = bundles.map((b) => `${b.file}: ${b.lessons.length} lessons, ${b.gps.length} GPs, ${b.cards.length} cards, ${b.examples.length} examples`).join('\n  ');
console.log(`OK: ${totals}\n  cross-bundle: no duplicate ids, positions continuous 1-102`);
