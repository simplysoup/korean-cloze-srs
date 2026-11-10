/**
 * Content-only QA guard for TOPIK II morphological contrasts and curated variants.
 * Run: node scripts/validate-topik2-contrast.mjs
 * A passing result is NOT a substitute for Korean educator review.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const load=p=>JSON.parse(readFileSync(join(root,p),'utf8'));
const fail=[],check=(condition,message)=>{if(!condition)fail.push(message)};
const base=new Map(),bundles=[];
for(const level of [3,4,5,6]){
 const src=load(`prisma/seed-data/topik2/level-${level}.json`);
 const generated=load(`mobile/src/content/topik2-level${level}.json`);
 const sourcePoints=src.lessons.flatMap(l=>l.grammarPoints);
 const mobilePoints=generated.lessons.flatMap(l=>l.grammarPoints);
 const mobileMap=new Map(mobilePoints.map(p=>[p.id,p]));
 for(const p of sourcePoints){
  const target=mobileMap.get(p.id);
  check(Boolean(target),`Missing mobile grammar point ${p.id}`);
  if(!target)continue;
  const a=structuredClone(p),b=structuredClone(target);
  for(const x of [a,b])for(const c of x.cards)delete c.introducedAtPosition;
  check(JSON.stringify(a)===JSON.stringify(b),`Authored/mobile drift: ${p.id}`);
  check(!base.has(p.id),`Duplicate authored grammar ID ${p.id}`);
  base.set(p.id,p);
 }
 for(const p of mobilePoints)for(const c of p.cards){
  check(c.sentenceWithBlank.split('___').length===2 && c.sentenceWithBlank.replace('___',c.answer)===c.fullSentence,`Bad mobile cloze ${c.id}`);
  check(new Set([c.answer,...c.alternateAnswers]).size===c.alternateAnswers.length+1,`Repeated answer ${c.id}`);
 }
 bundles.push({level,source:sourcePoints.length,mobile:mobilePoints.length});
}
const cards=id=>base.get(id)?.cards||[];
const values=id=>cards(id).map(c=>c.answer);
check(JSON.stringify(values('gp_t2l5_eumeurosseo'))===JSON.stringify(['함으로써','읽음으로써','봄으로써']),'-(으)ㅁ으로써 must test three stem forms');
check(JSON.stringify(values('gp_t2l6_dason_chideorado'))===JSON.stringify(['바쁘다손 치더라도','출발한다손 치더라도','먹는다손 치더라도']),'Concession must test adjective, vowel-action, consonant-action forms');
check(values('gp_t2l6_makronhago').includes('를 막론하고'),'막론하고 must test vowel-final noun with 를');
check(values('gp_t2l3_dorok').includes('이해하도록')&&values('gp_t2l3_dorok').includes('들리도록'),'도록 must test separate productive purpose forms');
check(base.get('gp_t2l5_e_ttaraseo')?.description.includes('rule or standard'),'에 따라 lesson must distinguish rule vs variation');
check(base.get('gp_t2l6_dasipi')?.structurePattern.startsWith('[Perception/knowledge'),'Evidence -다시피 needs a constrained formation rule');
const p=base.get('gp_t2l5_e_ttaraseo');
const audit=load('docs/research/legacy-answer-ambiguity-backlog.json');
const flagged=new Set(audit.queue.map(row=>row.cardId));
check(flagged.size===audit.queue.length,'Repeated backlog review ID');
check(audit.summary.legacyCards===628 && audit.summary.flagged===audit.queue.length && audit.summary.unflagged===628-audit.queue.length,'Inherited audit counts out of sync');
check(audit.summary.withExistingAlternatives===audit.queue.filter(row=>row.existingAlternatives.length).length,'Inherited accepted alternative count is stale');
check(audit.summary.existingVariantContextNotes===audit.queue.filter(row=>row.existingVariantReview).length,'Alternative review metadata count is stale');
for(const c of p?.cards||[]){
 const row=audit.queue.find(row=>row.cardId===c.id);
 check(Boolean(row),`New variant missing from educator queue: ${c.id}`);
 if(!row)continue;
 check(row.canonicalAnswer===c.answer&&row.fullSentence===c.fullSentence&&row.englishHint===c.englishHint,`Accepted-card metadata drift: ${c.id}`);
 check(JSON.stringify(row.existingAlternatives)===JSON.stringify(c.alternateAnswers),`Accepted-card variant drift: ${c.id}`);
 check(row.humanReview==='pending'&&row.existingVariantReview?.decision==='pending',`Unreviewed card marked approved ${c.id}`);
 check(c.alternateAnswers.length===1,`Expected exactly one contextual alternative: ${c.id}`);
}
if(fail.length){console.error('TOPIK II contrast QA failed:\\n'+fail.map(x=>' - '+x).join('\\n'));process.exitCode=1;}
else console.log('TOPIK II contrast QA passed: '+JSON.stringify({bundles,contextualAlternatives:p.cards.length,reviewStatus:'pending'}));
