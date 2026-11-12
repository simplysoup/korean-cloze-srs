/**
 * Content-only consistency check for the first-pass grammar answer audit.
 * Run: node scripts/validate-answer-audit.mjs
 * This does not claim native-speaker verification or implement SRS grading.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const load = (p) => JSON.parse(readFileSync(join(root,p),'utf8'));
const audit = load('docs/research/grammar-answer-ambiguity-audit.json');
const sources = [1,2,3,4].map(level=>load(`prisma/seed-data/grammar-expansion/level-${level}.json`));
const index = new Map();
for(const m of sources)for(const e of m.insertions)for(const c of e.grammarPoint.cards){
 if(index.has(c.id))throw Error('Duplicate source review ID: '+c.id);
 index.set(c.id,{...c,grammarPointId:e.grammarPoint.id});
}
const problems=[],check=(ok,msg)=>{if(!ok)problems.push(msg)};
check(audit.cards.length===93,'Expected 93 annotated newly authored cards');
check(index.size===93,'Expected 93 source grammar-gap review cards');
const visited=new Set();
let alternatives=0,altCards=0,nearMisses=0;
for(const row of audit.cards){
 const src=index.get(row.cardId);
 check(Boolean(src),`Unknown review card ${row.cardId}`);
 if(!src)continue;
 check(!visited.has(row.cardId),`Duplicate audit card ${row.cardId}`);
 visited.add(row.cardId);
 check(row.grammarPointId===src.grammarPointId,`Wrong owner for ${row.cardId}`);
 for(const key of ['canonicalAnswer','fullSentence','sentenceWithBlank','englishHint']){
  const sourceKey=key==='canonicalAnswer'?'answer':key;
  check(row[key]===src[sourceKey],`${row.cardId}: inconsistent ${key}`);
 }
 check(src.sentenceWithBlank.split('___').length===2 && src.sentenceWithBlank.replace('___',src.answer)===src.fullSentence,`${row.cardId}: source cloze is malformed`);
 const actual=(row.acceptedAlternatives||[]).map(x=>x.input);
 check(JSON.stringify(actual)===JSON.stringify(src.alternateAnswers),`${row.cardId}: accepted alternatives disagree with source card`);
 check(new Set([src.answer,...actual]).size===actual.length+1,`${row.cardId}: duplicate answer value`);
 if(actual.length){altCards++;alternatives+=actual.length;}
 // A whole-sentence variant only works if its particle matches the preceding noun's 받침.
 // This checks spelling/attachment, NOT whether an alternative is pragmatically appropriate.
 if(['gp_gap_wa_gwa','gp_gap_irang'].includes(row.grammarPointId)){
  const prefix = row.sentenceWithBlank.split('___')[0];
  const letter = prefix.charCodeAt(prefix.length - 1);
  check(letter>=0xAC00 && letter<=0xD7A3,`${row.cardId}: connector does not follow a Hangul noun`);
  if(letter>=0xAC00 && letter<=0xD7A3){
   const hasBatchim=(letter-0xAC00)%28!==0;
   const permitted=hasBatchim?['과','이랑','하고']:['와','랑','하고'];
   for(const value of [row.canonicalAnswer,...actual]){
    check(permitted.includes(value),`${row.cardId}: connector ${value} violates 받침 form selection`);
   }
  }
 }
 for(const alternative of row.acceptedAlternatives){
  check(alternative.classification?.length>4,`${row.cardId}: missing variant class`);
  check(alternative.explanation?.length>=50,`${row.cardId}: missing rationale for ${alternative.input}`);
  check(typeof alternative.input==='string'&&alternative.input.trim()===alternative.input,`${row.cardId}: malformed accepted variant`);
  check(alternative.humanReview==='pending',`${row.cardId}: do not claim educator signoff`);
 }
 const nearInputs=new Set();
 for(const near of row.nearMissExamples||[]){
  nearMisses++;
  check(!actual.includes(near.input)&&near.input!==src.answer,`${row.cardId}: near miss is also accepted`);
  check(!nearInputs.has(near.input),`${row.cardId}: duplicate near-miss input`);
  nearInputs.add(near.input);
  check(near.replacementSentence===src.sentenceWithBlank.replace('___',near.input),`${row.cardId}: inconsistent example replacement`);
  check(near.feedback?.length>=55,`${row.cardId}: near-miss feedback too generic`);
  check(['register','tense','honorificity','morphology','particle_form','particle_role','aspect','perspective'].includes(near.dimension),`${row.cardId}: unknown feedback category`);
  check(near.humanReview==='pending',`${row.cardId}: near-miss needs educator signoff`);
 }
}
check(visited.size===93,'Not all gap review cards audited');
check(altCards===12&&alternatives===18,`Unexpected accepted variant totals: ${altCards} cards/${alternatives} strings`);
check(nearMisses===14,`Expected 14 sample near misses, found ${nearMisses}`);
if(problems.length){
 console.error(`FAIL: ${problems.length} answer-audit problems`);
 for(const error of problems)console.error(' - '+error);
 process.exitCode=1;
}else console.log(`OK: 93 cards; 12 with 18 contextual accepted variants; 14 annotated near misses`);
