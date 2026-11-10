/** Validate the checked-in answer metadata against authoritative, curated audit sources. */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildAnswerFeedback, ROOT, OUTPUT, serializeAnswerFeedback } from './port-answer-feedback.mjs';

const expected = serializeAnswerFeedback(await buildAnswerFeedback());
const current = await readFile(join(ROOT, OUTPUT), 'utf8');
if (current !== expected) {
  throw new Error(`${OUTPUT} does not match its audited sources. Run node scripts/port-answer-feedback.mjs, then inspect the diff.`);
}
const manifest = JSON.parse(current);
const { cards, alternativeCards, alternativeStrings, nearMissCards, nearMissStrings } = manifest.counts;
if (cards !== 721 || alternativeCards !== 44 || alternativeStrings !== 54 || nearMissCards !== 16 || nearMissStrings !== 16) {
  throw new Error(`Unexpected baseline catalogue counts: ${JSON.stringify(manifest.counts)}. Investigate before changing these baseline assertions.`);
}
console.log(`Verified ${cards} grammar cards, ${alternativeStrings} curated alternatives (${alternativeCards} cards), and ${nearMissStrings} exact near misses (${nearMissCards} cards). Educator approval remains pending.`);
