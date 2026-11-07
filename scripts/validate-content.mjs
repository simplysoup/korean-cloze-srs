/**
 * Validate the ported TOPIK I Level 1 content (mobile/src/content/topik1-level1.json).
 * Fails (exit 1) unless ALL of these hold:
 *  - 11 lessons, 48 grammar points, 154 cloze cards, 98 lesson examples
 *  - every cloze card's answer appears in its fullSentence
 *  - every grammar point has >= 2 lesson examples
 *  - no duplicate ids (grammar points, cards, examples)
 *  - every relatedPointId / extraTarget grammarPointId exists
 * Run: node scripts/validate-content.mjs
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const path = join(dirname(fileURLToPath(import.meta.url)), '..', 'mobile', 'src', 'content', 'topik1-level1.json');
const data = JSON.parse(readFileSync(path, 'utf8'));

const errors = [];
const check = (cond, msg) => { if (!cond) errors.push(msg); };

const lessons = data.lessons ?? [];
const gps = lessons.flatMap((l) => l.grammarPoints);
const cards = gps.flatMap((g) => g.cards);
const examples = gps.flatMap((g) => g.lessonExamples);

check(lessons.length === 11, `lessons: expected 11, got ${lessons.length}`);
check(gps.length === 48, `grammarPoints: expected 48, got ${gps.length}`);
check(cards.length === 154, `clozeCards: expected 154, got ${cards.length}`);
check(examples.length === 98, `lessonExamples: expected 98, got ${examples.length}`);

const seen = new Set();
const dup = (id, kind) => {
  if (seen.has(id)) errors.push(`duplicate ${kind} id: ${id}`);
  seen.add(id);
};
const gpIds = new Set(gps.map((g) => g.id));

for (const gp of gps) {
  dup(gp.id, 'grammarPoint');
  check(gp.lessonExamples.length >= 2, `${gp.id}: only ${gp.lessonExamples.length} lesson examples (need >= 2)`);
  for (const id of gp.relatedPointIds ?? []) {
    check(gpIds.has(id), `${gp.id}: relatedPointId ${id} does not exist`);
  }
  for (const ex of gp.lessonExamples) {
    dup(ex.id, 'lessonExample');
    check(ex.fullSentence.includes(ex.answer), `${ex.id}: answer ${JSON.stringify(ex.answer)} not in sentence ${JSON.stringify(ex.fullSentence)}`);
  }
  for (const card of gp.cards) {
    dup(card.id, 'clozeCard');
    check(card.fullSentence.includes(card.answer), `${card.id}: answer ${JSON.stringify(card.answer)} not in sentence ${JSON.stringify(card.fullSentence)}`);
    check(card.sentenceWithBlank.includes('___'), `${card.id}: sentenceWithBlank has no ___ blank`);
    for (const t of card.extraTargets ?? []) {
      check(gpIds.has(t.grammarPointId), `${card.id}: extraTarget grammarPointId ${t.grammarPointId} does not exist`);
    }
  }
}

if (errors.length > 0) {
  console.error(`FAIL: ${errors.length} validation error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`OK: ${lessons.length} lessons, ${gps.length} grammar points, ${cards.length} cloze cards, ${examples.length} lesson examples`);
