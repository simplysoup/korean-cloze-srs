#!/usr/bin/env node
/** Synthetic-only, read-only build-36 vs candidate progress snapshot compare. */
import { readFileSync } from 'node:fs';
const [basePath, candidatePath] = process.argv.slice(2);
if (!basePath || !candidatePath) {
  console.error('Usage: node compare-snapshots.mjs <synthetic-build36.json> <synthetic-candidate.json>');
  process.exit(2);
}
function parse(file) {
  const wrapper = JSON.parse(readFileSync(file, 'utf8'));
  if (wrapper?.qaSyntheticOnly !== true || !wrapper.fixtureId || !wrapper.doc) {
    throw Error('Refusing to read non-synthetic/untagged progress snapshot');
  }
  return wrapper;
}
function stable(doc) {
  const cardIds = doc.reviewCards.map(c => c.grammarPointId);
  const logIds = doc.reviewLogs.map(l => l.id);
  const deckIds = doc.libraryDecks.map(d => d.deckId);
  if (new Set(cardIds).size !== cardIds.length ||
      new Set(logIds).size !== logIds.length ||
      new Set(deckIds).size !== deckIds.length) {
    throw Error('Duplicate review/deck identities in fixture');
  }
  const sorted = (values, key) => [...values].sort((a,b) => String(a[key]).localeCompare(String(b[key])));
  return {
    // Ignore server-assigned version, sync updatedAt, account emails, session IDs.
    // Preserve the actual scheduling, event IDs, content references and history.
    reviewCards: sorted(doc.reviewCards, 'grammarPointId'),
    reviewLogs: sorted(doc.reviewLogs, 'id'),
    libraryDecks: sorted(doc.libraryDecks, 'deckId'),
    streak: doc.streak,
    settings: doc.settings,
    dailyLearned: Object.fromEntries(Object.entries(doc.dailyLearned).sort(([a],[b])=>a.localeCompare(b))),
  };
}
try {
  const baseline = parse(basePath);
  const candidate = parse(candidatePath);
  if (baseline.fixtureId !== candidate.fixtureId) throw Error('Fixture IDs differ');
  const one = stable(baseline.doc);
  const two = stable(candidate.doc);
  const equal = JSON.stringify(one) === JSON.stringify(two);
  console.log(equal ? 'MATCH: synthetic progress/events identical' :
    'MISMATCH: synthetic progress/events differ; inspect fixture IDs and sanitized diff');
  console.log('Event counts: baseline=' + one.reviewLogs.length + ' candidate=' + two.reviewLogs.length);
  if (!equal) process.exitCode = 1;
} catch (error) {
  console.error('INVALID SYNTHETIC FIXTURE:', error.message);
  process.exitCode = 2;
}
