/** Content and provenance validation for the editorial-draft reading pilot.
 * Run from repository root: node scripts/validate-comprehension.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(readFileSync(join(root, file), 'utf8'));
const data = read('prisma/seed-data/comprehension/pilot.json');
const port = read('mobile/src/content/comprehension-pilot.json');
const problems = [];
const assert = (test, message) => { if (!test) problems.push(message); };
const isText = (value, min = 1) => typeof value === 'string' && value.trim().length >= min;
const grammarFiles = ['topik1-level1', 'topik1-level2', 'topik2-level3', 'topik2-level4', 'topik2-level5', 'topik2-level6'];
const grammar = new Map(grammarFiles.flatMap((name) => read('mobile/src/content/' + name + '.json')
  .lessons.flatMap((lesson) => lesson.grammarPoints.map((point) => [point.id, point.title]))));
assert(JSON.stringify(data) === JSON.stringify(port), 'Generated mobile content is stale; run port-comprehension.mjs.');
assert(data.type === 'comprehension-pilot' && data.schemaVersion === 1, 'Unexpected schema.');
assert(isText(data.provenance, 60), 'Original authorship provenance missing.');
assert(data.review?.status === 'editorial-draft' && data.review?.educatorReviewed === false, 'Pilot must remain editorial draft.');
assert(Array.isArray(data.passages) && data.passages.length === 6, 'Exactly six passages required.');
const levels = new Map([[1, 0], [2, 0], [3, 0]]);
const minimumWords = { 1: 45, 2: 65, 3: 95 };
const maximumWords = { 1: 95, 2: 125, 3: 180 };
const known = new Set();
const types = new Set();
let questionCount = 0;
for (const passage of data.passages ?? []) {
  assert(isText(passage.id) && /^rc_l[123]_[a-z]+$/.test(passage.id), 'Invalid passage ID: ' + passage.id);
  assert(!known.has(passage.id), 'Duplicate ID: ' + passage.id); known.add(passage.id);
  levels.set(passage.level, (levels.get(passage.level) || 0) + 1);
  assert(isText(passage.titleKo) && isText(passage.titleEn) && isText(passage.situation), passage.id + ': title/situation absent.');
  assert(Array.isArray(passage.paragraphs) && passage.paragraphs.length >= 2 && passage.paragraphs.every((p) => isText(p, 30)), passage.id + ': insufficient paragraphs.');
  const story = (passage.paragraphs ?? []).join(' ');
  const count = story.trim().split(/\s+/u).length;
  assert(count === passage.wordCount, passage.id + ': wordCount mismatch.');
  assert(count >= minimumWords[passage.level] && count <= maximumWords[passage.level], passage.id + ': word count outside calibrated pilot band.');
  assert(passage.editorialStatus === 'editorial-draft' && passage.educatorReviewed === false, passage.id + ': educator status must be draft.');
  assert(Array.isArray(passage.prerequisiteGrammarIds) && passage.prerequisiteGrammarIds.length > 0, passage.id + ': missing grammar prerequisites.');
  assert(new Set(passage.prerequisiteGrammarIds).size === passage.prerequisiteGrammarIds.length, passage.id + ': duplicate prerequisites.');
  for (const id of passage.prerequisiteGrammarIds ?? []) assert(grammar.has(id), passage.id + ': unresolved grammar ID ' + id);
  assert(passage.prerequisiteGrammarLabels?.length === passage.prerequisiteGrammarIds?.length, passage.id + ': missing prerequisite titles.');
  for (let i = 0; i < (passage.prerequisiteGrammarIds?.length ?? 0); i++)
    assert(grammar.get(passage.prerequisiteGrammarIds[i]) === passage.prerequisiteGrammarLabels?.[i], passage.id + ': stale grammar title at index ' + i);
  assert(Array.isArray(passage.vocabularyNotes) && passage.vocabularyNotes.length >= 4, passage.id + ': not enough glosses.');
  for (const gloss of passage.vocabularyNotes ?? []) {
    assert(isText(gloss.term) && isText(gloss.gloss) && gloss.moveToGeneralVocabulary === true, passage.id + ': invalid glossary entry.');
  }
  // Optional listening is intentionally not implemented. Reject unverified
  // media if it is authored later; it must have explicit rights clearance.
  assert(passage.audio === null || passage.audio === undefined ||
    (passage.audio.rights === 'cleared' && passage.audio.kind === 'recording' && isText(passage.audio.uri, 10)),
    passage.id + ': audio rights / provenance missing.');
  assert(Array.isArray(passage.questions) && passage.questions.length >= 3 && passage.questions.length <= 5, passage.id + ': need 3–5 checks.');
  questionCount += passage.questions?.length ?? 0;
  for (const q of passage.questions ?? []) {
    assert(isText(q.id) && q.id.startsWith(passage.id + '_q') && !known.has(q.id), passage.id + ': invalid or duplicate question ID ' + q.id);
    known.add(q.id); types.add(q.type);
    assert(['main-idea','specific-detail','referential','speaker-intention','inference','grammar-in-context'].includes(q.type), q.id + ': invalid question type.');
    assert(isText(q.prompt, 12) && q.answerLanguage === 'en', q.id + ': question prompt/language invalid.');
    assert(Array.isArray(q.choices) && q.choices.length === 4 && q.choices.every((choice) => isText(choice)), q.id + ': four nonempty choices required.');
    assert(new Set(q.choices).size === 4, q.id + ': duplicate options.');
    assert(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4, q.id + ': invalid correct index.');
    assert(isText(q.evidence, 8) && story.includes(q.evidence), q.id + ': evidence missing from passage.');
    assert(isText(q.explanation, 45), q.id + ': too-short explanation.');
    assert(!('grammarPointId' in q) && !('reviewCardId' in q), q.id + ': comprehension must not update grammar SRS.');
  }
}
for (const [level, count] of levels) assert(count === 2, 'Expected two passages at Level ' + level + ', found ' + count);
assert(questionCount >= 18 && questionCount <= 30, 'Expected 18–30 questions.');
for (const kind of ['main-idea','specific-detail','referential','speaker-intention','inference','grammar-in-context']) {
  assert(types.has(kind), 'Missing comprehension question type: ' + kind);
}
if (problems.length) {
  console.error('FAIL: ' + problems.length + ' comprehension content problems');
  for (const problem of problems) console.error(' - ' + problem);
  process.exitCode = 1;
} else console.log('OK: six editorial-draft passages, ' + questionCount + ' validated questions, 229-point grammar lookup, no unverified audio.');
