/** Validate independent pronunciation, pragmatics and mixed-skill content.
 * Run: node scripts/validate-language-topics.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)), '..');
const source=JSON.parse(readFileSync(join(root,'prisma/seed-data/language-topics/foundations.json'),'utf8'));
const generated=JSON.parse(readFileSync(join(root,'mobile/src/content/language-topics.json'),'utf8'));
const vocab=JSON.parse(readFileSync(join(root,'mobile/src/content/vocabulary-foundations.json'),'utf8'));
const grammarFiles=['topik1-level1.json','topik1-level2.json','topik2-level3.json','topik2-level4.json','topik2-level5.json','topik2-level6.json'];
const gpIds=new Set(grammarFiles.flatMap(file=>JSON.parse(readFileSync(join(root,'mobile/src/content',file),'utf8'))
  .lessons.flatMap(lesson=>lesson.grammarPoints.map(gp=>gp.id))));
const vocabIds=new Set(vocab.decks.map(deck=>deck.deck.id));
const errors=[],check=(ok,message)=>{if(!ok)errors.push(message)};
check(source.type==='language-topics','Expected language-topics type');
check(JSON.stringify(source)===JSON.stringify(generated),'Generated language topics do not match authored source');
check(source.topics.length===4,'Expected 4 language-system topics');
const seen=new Set();
for(const topic of source.topics){
  check(!seen.has(topic.id),`Duplicate topic ID ${topic.id}`);seen.add(topic.id);
  check(topic.learningGoal.length>=45,`${topic.id}: learning goal too short`);
  check(topic.sections.length>=3,`${topic.id}: too few teaching sections`);
  check(topic.checks.length>=3,`${topic.id}: too few checks`);
  for(const id of topic.prerequisiteGrammarIds??[])check(gpIds.has(id),`${topic.id}: unknown grammar prerequisite ${id}`);
  for(const id of topic.prerequisiteVocabDeckIds??[])check(vocabIds.has(id),`${topic.id}: unknown vocab deck ${id}`);
  for(const part of topic.sections){
    check(part.explanation.length>=70,`${topic.id}: too-short section ${part.heading}`);
    check(part.examples.length>0,`${topic.id}: empty examples in ${part.heading}`);
  }
  for(const q of topic.checks){
    check(!seen.has(q.id),`Duplicate check ${q.id}`);seen.add(q.id);
    check(q.choices.length===4,`${q.id}: requires exactly four options`);
    check(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<q.choices.length,`${q.id}: invalid correct answer`);
    check(q.explanation.length>=40,`${q.id}: no teaching feedback`);
    check(!('grammarPointId' in q)&&!('reviewCardId' in q),`${q.id}: topic check must not award grammar SRS mastery`);
  }
}
check(source.topics.reduce((s,x)=>s+x.checks.length,0)===12,'Expected twelve original checks');
if(errors.length){
 console.error(`FAIL: ${errors.length} topic validation problems`);
 for(const e of errors)console.error(' - '+e);
 process.exitCode=1;
}else console.log(`OK: 4 language topics, 12 questions, valid grammar/vocab prerequisites`);
