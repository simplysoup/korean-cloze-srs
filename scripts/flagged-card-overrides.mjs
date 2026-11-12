/**
 * Pure, deterministic editorial overrides for the 193 historically flagged
 * grammar cards. No runtime, database, FSRS, or UI changes.
 *
 * Source of truth: prisma/seed-data/review-qa/flagged-card-fixes.json
 * Each override records exact prior/next card values and pedagogical reason.
 */
const fields=['fullSentence','sentenceWithBlank','answer','englishHint','alternateAnswers'];
const select=card=>Object.fromEntries(fields.map(f=>[f,card[f]]));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

export function applyFlaggedCardFixes(bundles, manifest) {
  if(!Array.isArray(bundles)||!manifest||!Array.isArray(manifest.rows))throw Error('Invalid flagged-card QA manifest');
  const out=JSON.parse(JSON.stringify(bundles));
  const index=new Map();
  for(const bundle of out)for(const lesson of bundle.lessons)for(const gp of lesson.grammarPoints)for(const card of gp.cards){
    if(index.has(card.id))throw Error('Duplicate grammar review card: '+card.id);
    index.set(card.id,{card,gp,level:bundle.deck.level});
  }
  const seen=new Set();
  for(const row of manifest.rows){
    if(seen.has(row.cardId))throw Error('Repeated override '+row.cardId);
    seen.add(row.cardId);
    const item=index.get(row.cardId);
    if(!item)throw Error('Flagged review card not found in supplied bundle(s): '+row.cardId);
    if(item.gp.id!==row.grammarPointId||item.level!==row.level)throw Error('Flagged review ownership drift: '+row.cardId);
    const current=select(item.card);
    if(!same(current,row.before)&&!same(current,row.after))throw Error('Unreviewed upstream edit to '+row.cardId+'; reconcile against this explicit review');
    if(row.after.sentenceWithBlank.split('___').length!==2||row.after.sentenceWithBlank.replace('___',row.after.answer)!==row.after.fullSentence)throw Error('Broken repaired cloze '+row.cardId);
    if(new Set([row.after.answer,...row.after.alternateAnswers]).size!==row.after.alternateAnswers.length+1)throw Error('Duplicate accepted answers '+row.cardId);
    for(const f of fields)item.card[f]=JSON.parse(JSON.stringify(row.after[f]));
  }
  return out;
}
