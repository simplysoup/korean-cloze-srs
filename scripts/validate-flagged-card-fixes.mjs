/**
 * Regression guard for the 193 legacy QA flags.
 * Run from the repository root: node scripts/validate-flagged-card-fixes.mjs
 *
 * Structural QA only; Korean instructor approval remains a separate gate.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {applyFlaggedCardFixes} from './flagged-card-overrides.mjs';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const load=path=>JSON.parse(readFileSync(join(root,path),'utf8'));
const m=load('prisma/seed-data/review-qa/flagged-card-fixes.json');
const backlog=load('docs/research/legacy-answer-ambiguity-backlog.json');
const current=[1,2,3,4,5,6].map(level=>load(
  `mobile/src/content/${level<3?'topik1':'topik2'}-level${level}.json`
));
const lookup=new Map();
let reviewCount=0,pointCount=0;
for(const bundle of current)for(const lesson of bundle.lessons)for(const point of lesson.grammarPoints){
 pointCount++;
 for(const card of point.cards){
  reviewCount++;
  assert(!lookup.has(card.id),`Repeated card ID ${card.id}`);
  lookup.set(card.id,{card,point,level:bundle.deck.level});
 }
}
assert.equal(pointCount,229,'Grammar-point identity/count changed');
assert.equal(reviewCount,721,'Review card count/history changed');
assert.equal(m.rows.length,193,'Every legacy QA flag needs a disposition');
assert.equal(backlog.queue.length,193,'No legacy QA case may disappear without explicit editorial disposition');
assert.equal(new Set(m.rows.map(r=>r.cardId)).size,193,'Duplicate QA item');
assert.equal(new Set(backlog.queue.map(r=>r.cardId)).size,193,'Duplicate educator backlog item');
assert.deepEqual(new Set(m.rows.map(r=>r.cardId)),new Set(backlog.queue.map(r=>r.cardId)),'Unreviewed or mismatched flags');
let changed=0,unchanged=0,refined=0,newVariants=0,priorVariantCards=0,existingVariants=0;
for(const row of m.rows){
 const x=lookup.get(row.cardId),b=backlog.queue.find(r=>r.cardId===row.cardId);
 assert(x&&b,`Missing card ${row.cardId}`);
 assert.equal(x.point.id,row.grammarPointId);
 assert.equal(x.level,row.level);
 assert.equal(row.after.sentenceWithBlank.split('___').length,2);
 assert.equal(row.after.sentenceWithBlank.replace('___',row.after.answer),row.after.fullSentence);
 assert.deepEqual(new Set([row.after.answer,...row.after.alternateAnswers]).size,row.after.alternateAnswers.length+1);
 for(const k of Object.keys(row.after))assert.deepEqual(x.card[k],row.after[k],`Review overlay not applied: ${row.cardId}.${k}`);
 assert.deepEqual(b.existingAlternatives,row.after.alternateAnswers);
 assert.equal(b.englishHint,row.after.englishHint);
 assert.equal(b.canonicalAnswer,row.after.answer);
 assert.equal(b.humanReview,'pending','Never auto-claim educator approval');
 assert.equal(row.educatorReview,'pending');
 assert.equal(b.reviewFix.disposition,row.disposition);
 assert.equal(b.reviewFix.acceptedVariantAssessments.length,row.after.alternateAnswers.length);
 if(row.before.englishHint!==row.after.englishHint)changed++;else unchanged++;
 if(row.before.sentenceWithBlank!==row.after.sentenceWithBlank)refined++;
 if(row.before.alternateAnswers.length)priorVariantCards++;
 newVariants+=row.after.alternateAnswers.length-row.before.alternateAnswers.length;
 if(row.after.alternateAnswers.length)existingVariants++;
 const allowed=['natural_other_construction','same_target_construction'];
 for(const v of row.acceptedVariantAssessments)assert(allowed.includes(v.classification),`Unclassified alternative ${row.cardId}`);
 if(row.disposition==='directional_variant_off_target')for(const v of row.acceptedVariantAssessments)assert.equal(v.classification,'natural_other_construction');
}
assert.equal(changed,187);
assert.equal(unchanged,6);
assert.equal(refined,6);
assert.equal(priorVariantCards,19);
assert.equal(existingVariants,32);
assert.equal(newVariants,13);
assert.equal(backlog.summary.editorialDispositions,193);
assert.equal(backlog.summary.withExistingAlternatives,32);
assert.equal(backlog.summary.targetedPromptClarifications,187);
assert.equal(backlog.summary.reworkedClozeBoundaries,6);
assert.equal(backlog.summary.structuralFalsePositives,6);
assert.equal(backlog.summary.newAcceptedVariantStrings,13);
assert.equal(backlog.summary.flagged,193);
assert.equal(backlog.summary.unflagged,435);
// Test actual overlay behavior against synthetic BEFORE state; catch stale baselines
// and prevent a future editing pass from silently overwriting someone else's content.
const sample=m.rows[0],gp={id:sample.grammarPointId,cards:[{id:sample.cardId,...sample.before,introducedAtPosition:1}]};
const tiny=[{deck:{level:sample.level},lessons:[{grammarPoints:[gp]}]}];
const subset={rows:[sample]};
const applied=applyFlaggedCardFixes(tiny,subset);
assert.equal(applied[0].lessons[0].grammarPoints[0].cards[0].englishHint,sample.after.englishHint);
assert.deepEqual(applyFlaggedCardFixes(applied,subset),applied,'Content port should be idempotent');
tiny[0].lessons[0].grammarPoints[0].cards[0].englishHint='Unexpected upstream edit';
assert.throws(()=>applyFlaggedCardFixes(tiny,subset),/Unreviewed upstream edit/);
console.log(`OK: 193/193 QA decisions, ${changed} clarifying prompts, ${unchanged} false positives, ${refined} repaired clozes, ${newVariants} new accepted variants; 229 points and 721 card IDs retained. Human review pending.`);
