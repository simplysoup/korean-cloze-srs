/** Separate vocabulary source export. No grammar review cards or SRS histories are produced here.
 * Run: node scripts/port-vocabulary.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const input = join(root, 'prisma/seed-data/vocabulary/foundations.json');
const output = join(root, 'mobile/src/content/vocabulary-foundations.json');
const source = JSON.parse(readFileSync(input, 'utf8'));
writeFileSync(output, JSON.stringify(source, null, 2) + '\n');
console.log(`Ported ${source.decks.length} independent vocabulary decks, ${source.decks.reduce((n,d)=>n+d.entries.length,0)} entries`);
