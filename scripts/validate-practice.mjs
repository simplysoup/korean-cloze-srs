/** Strict, offline editorial validator for Munpro practice — independent from grammar SRS.
 * Run: node scripts/validate-practice.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => JSON.parse(readFileSync(join(root, path), 'utf8'));
const src = read('prisma/seed-data/practice/pilot.json');
const mobile = read('mobile/src/content/practice-pilot.json');
const issues = [];
const check = (ok, message) => { if (!ok) issues.push(message); };
const normalize = text => String(text ?? '').normalize('NFC').trim().replace(/\s+/gu, ' ').replace(/[.。!?！？]+$/gu, '');
const complete = text => typeof text === 'string' && /[가-힣]/u.test(text) && /[.!?。？！]\s*$/u.test(text.trim());
const curriculum = ['topik1-level1', 'topik1-level2', 'topik2-level3', 'topik2-level4', 'topik2-level5', 'topik2-level6'].map(name => read(`mobile/src/content/${name}.json`));
const grammar = new Map();
const inherited = new Set();
for (const deck of curriculum) {
  for (const lesson of deck.lessons) {
    for (const gp of lesson.grammarPoints) {
      check(!grammar.has(gp.id), `Duplicate existing grammar ID ${gp.id}`);
      grammar.set(gp.id, { level: gp.level ?? deck.deck.level, lesson: lesson.lessonNumber });
      for (const card of [...(gp.cards ?? []), ...(gp.lessonExamples ?? [])]) {
        if (card.fullSentence) inherited.add(normalize(card.fullSentence));
        if (card.sentenceWithBlank) inherited.add(normalize(card.sentenceWithBlank));
      }
    }
  }
}
check(src.schemaVersion === 1 && src.kind === 'grammar-transfer-pilot', 'Invalid practice schema/version');
check(JSON.stringify(src) === JSON.stringify(mobile), 'Mobile export out of date: run node scripts/port-practice.mjs');
check(src.educatorApproval === 'pending', 'Pilot must not claim educator approval');
const all = src.exercises ?? [], ids = new Set(), sentenceSeen = new Set(), groups = new Set();
const counts = { contrast: 0, transfer: 0 }, byLevel = new Map();
const unitIds = new Set((src.units ?? []).map(unit => unit.id));
for (const item of all) {
  check(/^((ct)|(tr))-\d{3}$/u.test(item.id ?? ''), `Invalid stable exercise ID: ${item.id}`);
  check(!ids.has(item.id), `Duplicate exercise ID: ${item.id}`); ids.add(item.id);
  check(item.type === 'contrast' || item.type === 'transfer', `${item.id}: invalid type`);
  if (item.type in counts) counts[item.type]++;
  check(unitIds.has(item.unit), `${item.id}: unknown unit`);
  check([1, 2, 3, 4].includes(item.level), `${item.id}: not a level 1-4 exercise`);
  byLevel.set(item.level, (byLevel.get(item.level) ?? 0) + 1);
  check(Array.isArray(item.prerequisiteGrammarIds) && item.prerequisiteGrammarIds.length > 0, `${item.id}: missing prerequisites`);
  let maxLesson = -1;
  for (const id of item.prerequisiteGrammarIds ?? []) {
    const gp = grammar.get(id);
    check(Boolean(gp), `${item.id}: unknown grammar ${id}`);
    if (gp) {
      check(gp.level <= item.level, `${item.id}: prerequisite ${id} is from a later level`);
      maxLesson = Math.max(maxLesson, gp.lesson);
    }
  }
  check(Number.isInteger(item.availableAfterLesson) && maxLesson < item.availableAfterLesson, `${item.id}: prerequisites are not introduced before availability`);
  check(complete(item.contextKorean), `${item.id}: context must be a complete Korean sentence`);
  check(typeof item.contextEnglish === 'string', `${item.id}: optional English context must be a string`);
  for (const key of ['task', 'objective', 'explanation', 'registerConstraint', 'tenseConstraint', 'sourceRef', 'ambiguityReview']) {
    check(typeof item[key] === 'string' && item[key].trim().length > 8, `${item.id}: missing meaningful ${key}`);
  }
  check(item.reviewStatus === 'editorial-draft', `${item.id}: explicit editorial status required`);
  check(item.educatorApproval === 'pending', `${item.id}: approval must remain pending`);
  check(Array.isArray(item.accepted) && item.accepted.length > 0, `${item.id}: no accepted responses`);
  const normalized = new Set();
  for (const alt of item.accepted ?? []) {
    const n = normalize(alt.value);
    check(Boolean(n), `${item.id}: empty accepted response`);
    check(!normalized.has(n), `${item.id}: duplicate answer variant ${n}`); normalized.add(n);
    check(typeof alt.scope === 'string' && alt.scope.trim().length > 10, `${item.id}: variant scope is missing`);
  }
  if (item.type === 'contrast') {
    groups.add(item.contrastGroup);
    check(item.format === 'choice', `${item.id}: contrast must use choice format`);
    check(Array.isArray(item.choices) && item.choices.length >= 2, `${item.id}: need >= 2 options`);
    const options = new Set();
    for (const choice of item.choices ?? []) {
      check(!options.has(choice.id), `${item.id}: duplicate option ID`); options.add(choice.id);
      check(complete(choice.text), `${item.id}: choice must be a full Korean sentence`);
      check(typeof choice.explanation === 'string' && choice.explanation.trim().length > 8, `${item.id}: unexplained distractor`);
      check(typeof choice.validInContext === 'boolean', `${item.id}: option lacks editorial validity decision`);
      const sentence = normalize(choice.text);
      check(!inherited.has(sentence), `${item.id}: copied existing SRS sentence: ${sentence}`);
      check(!sentenceSeen.has(sentence), `${item.id}: repeated practice sentence: ${sentence}`);
      sentenceSeen.add(sentence);
      check(choice.validInContext === normalized.has(choice.id), `${item.id}: genuinely valid choice must be accepted (or improve the context): ${choice.id}`);
    }
    for (const id of normalized) check(options.has(id), `${item.id}: accepted option ${id} is absent`);
  } else {
    check(item.format === 'text', `${item.id}: transfer must use text format`);
    for (const alt of item.accepted ?? []) {
      check(complete(alt.value), `${item.id}: typed answer must be a full Korean sentence`);
      const sentence = normalize(alt.value);
      check(!inherited.has(sentence), `${item.id}: copied existing SRS response: ${sentence}`);
      check(!sentenceSeen.has(sentence), `${item.id}: repeated practice answer: ${sentence}`);
      sentenceSeen.add(sentence);
    }
    for (const miss of item.nearMisses ?? []) {
      check(['wrong-register', 'wrong-tense', 'wrong-particle', 'wrong-meaning'].includes(miss.diagnosis), `${item.id}: invalid diagnosis`);
      check(!normalized.has(normalize(miss.value)), `${item.id}: a near miss is also accepted`);
      check(typeof miss.explanation === 'string' && miss.explanation.trim().length > 8, `${item.id}: missing near-miss explanation`);
    }
  }
}
check(counts.contrast >= 30, 'Need at least 30 contrast items');
check(counts.transfer >= 20, 'Need at least 20 transfer items');
check(groups.size >= 10, 'Need at least 10 distinct contrast groups');
for (const level of [1,2,3,4]) check(byLevel.has(level), `No practice at level ${level}`);
for (const unit of src.units ?? []) {
  check(unit.level >= 1 && unit.level <= 4, `Invalid unit level ${unit.id}`);
  check(Number.isInteger(unit.sessionSize) && unit.sessionSize >= 1, `Invalid session size ${unit.id}`);
}
if (issues.length) {
  console.error(`FAIL: ${issues.length} practice validation issue(s):`);
  for (const issue of issues) console.error(' - ' + issue);
  process.exitCode = 1;
} else {
  console.log(`OK: ${all.length} exercises, ${counts.contrast} contrasts across ${groups.size} groups, ${counts.transfer} transfer items, levels 1–4; all references resolve. Educator approval pending.`);
}
