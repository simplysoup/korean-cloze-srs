/**
 * Validate the source grammar catalogue before it is ported into the mobile app.
 *
 * Run: bun scripts/validate-grammar-catalogue.ts
 * This is deliberately independent of the older generated Expo JSON snapshot.
 */
import assert from 'node:assert/strict';
import { allLessons as level1Lessons } from '../prisma/seed-data/topik1-level1';
import { level1Additions } from '../prisma/seed-data/topik1-level1/additions';
import { allLessons as level2Lessons } from '../prisma/seed-data/topik1-level2';
import { teachingGuides } from '../prisma/seed-data/teaching-guides';

const lessons = [...level1Lessons, ...level2Lessons];
const expected = { lessons: 22, grammarPoints: 102, examples: 217, cards: 340 };
const ids = new Set<string>();
const points = new Set<string>();
const positionById = new Map<string, number>();
const errors: string[] = [];
let examples = 0;
let cards = 0;
let position = 0;
const unique = (id: string, where: string) => {
  if (ids.has(id)) errors.push(`Duplicate ID ${id} at ${where}`);
  ids.add(id);
};
const checkCard = (
  pointId: string,
  item: { id: string; fullSentence: string; sentenceWithBlank: string; answer: string; englishHint: string },
  kind: string,
) => {
  unique(item.id, pointId);
  const blanks = item.sentenceWithBlank.split('___');
  if (blanks.length !== 2 || blanks.join(item.answer) !== item.fullSentence) {
    errors.push(`${item.id}: blank + answer does not reconstruct the full sentence`);
  }
  if (!item.englishHint?.trim()) errors.push(`${item.id}: missing English meaning`);
  if (!item.answer?.trim()) errors.push(`${item.id}: empty answer`);
};
for (const [lessonIndex, lesson] of lessons.entries()) {
  if (lesson.lessonNumber !== lessonIndex + 1) {
    errors.push(`Lesson numbering: expected ${lessonIndex + 1}, got ${lesson.lessonNumber}`);
  }
  for (const gp of lesson.grammarPoints) {
    position += 1;
    unique(gp.id, `lesson ${lesson.lessonNumber}`);
    points.add(gp.id);
    positionById.set(gp.id, position);
    const addition = level1Additions[gp.id];
    const ex = [...gp.lessonExamples, ...(addition?.examples ?? [])];
    const review = [...gp.cards, ...(addition?.cards ?? [])];
    if (!gp.structurePattern?.trim()) errors.push(`${gp.id}: missing grammar structure`);
    if (!gp.description?.trim()) errors.push(`${gp.id}: missing explanation`);
    // A usable lesson must teach its mechanism, not merely state a translation.
    const guide = teachingGuides[gp.id];
    if (!guide) {
      errors.push(`${gp.id}: missing authored teaching guide`);
    } else {
      for (const field of ['meaning', 'formation', 'worked', 'trap'] as const) {
        if (guide[field].trim().length < 55) {
          errors.push(`${gp.id}: ${field} is too short to explain the idea to a beginner`);
        }
      }
      if (gp.description !== guide.meaning) {
        errors.push(`${gp.id}: plain-English description did not reach the lesson`);
      }
      const titles = new Set((gp.notes ?? []).map((note) => note.title));
      for (const title of ['Build it step by step', 'Worked example', 'Common trap']) {
        if (!titles.has(title)) errors.push(`${gp.id}: missing ${title} teaching note`);
      }
      const worked = gp.notes?.find((note) => note.title === 'Worked example');
      if (worked && !worked.content.includes(gp.lessonExamples[0]?.fullSentence ?? '')) {
        errors.push(`${gp.id}: worked breakdown does not reference its actual lesson example`);
      }
    }
    if (gp.id === 'gp_ani_eyo' && gp.cards.some((card) => !card.answer.includes('아니에요'))) {
      errors.push('Noun negation cards must test 아니에요, not just 이/가 particles');
    }

    if (ex.length < 2) errors.push(`${gp.id}: fewer than 2 worked examples`);
    if (review.length < 3) errors.push(`${gp.id}: fewer than 3 review cards`);
    for (const item of ex) {
      examples += 1;
      checkCard(gp.id, item, 'example');
    }
    for (const item of review) {
      cards += 1;
      checkCard(gp.id, item, 'review');
      if (item.introducedAtPosition !== position) {
        errors.push(`${item.id}: card position ${item.introducedAtPosition}, expected ${position}`);
      }
      const alternatives = [item.answer, ...item.alternateAnswers];
      if (new Set(alternatives).size !== alternatives.length) {
        errors.push(`${item.id}: duplicate accepted answer`);
      }
    }
  }
}
for (const gp of lessons.flatMap((lesson) => lesson.grammarPoints)) {
  for (const related of gp.relatedPointIds ?? []) {
    if (!points.has(related)) errors.push(`${gp.id}: unknown related point ${related}`);
  }
  for (const card of gp.cards) {
    for (const target of card.extraTargets ?? []) {
      if (!points.has(target.grammarPointId)) errors.push(`${card.id}: unknown extra grammar target ${target.grammarPointId}`);
    }
  }
}
for (const guideId of Object.keys(teachingGuides)) {
  if (!points.has(guideId)) errors.push(`Orphan teaching guide for ${guideId}`);
}
for (const gpId of Object.keys(level1Additions)) {
  if (!points.has(gpId)) errors.push(`Unattached additions for ${gpId}`);
}
// Structural gaps should be introduced as rules, not lexical question words or counters.
for (const lexicalId of ['gp_mwo', 'gp_nugu', 'gp_sino_numbers', 'gp_native_numbers', 'gp_gae_counter', 'gp_myeong_counter']) {
  if (points.has(lexicalId)) errors.push(`Vocabulary-only point in grammar catalogue: ${lexicalId}`);
}
const before = (a: string, b: string) => {
  const x = positionById.get(a);
  const y = positionById.get(b);
  if (!x || !y || x >= y) errors.push(`Prerequisite order broken: ${a} must precede ${b}`);
};
before('gp_ieyo_yeyo', 'gp_ani_eyo');
before('gp_ani_eyo', 'gp_eun_neun');
before('gp_eusi_honorific', 'gp_euseyo');
before('gp_seumnikka', 'gp_imnida_imnikka');
before('gp_imnida_imnikka', 'gp_eodo_doeda');
if (lessons.length !== expected.lessons) errors.push(`Lesson count: ${lessons.length} instead of ${expected.lessons}`);
if (position !== expected.grammarPoints) errors.push(`Grammar point count: ${position} instead of ${expected.grammarPoints}`);
if (examples !== expected.examples) errors.push(`Example count: ${examples} instead of ${expected.examples}`);
if (cards !== expected.cards) errors.push(`Review card count: ${cards} instead of ${expected.cards}`);
if (errors.length) {
  for (const error of errors) console.error(`FAIL: ${error}`);
  process.exitCode = 1;
} else {
  assert.equal(position, positionById.size);
  console.log(`OK: ${lessons.length} lessons; ${position} grammar points; ${examples} examples; ${cards} cards`);
}
