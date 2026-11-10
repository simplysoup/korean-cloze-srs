/** Regenerate mobile reading pilot content from the authoritative seed.
 * Run from repository root: node scripts/port-comprehension.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'prisma/seed-data/comprehension/pilot.json');
const output = join(root, 'mobile/src/content/comprehension-pilot.json');
const catalog = JSON.parse(readFileSync(source, 'utf8'));
writeFileSync(output, JSON.stringify(catalog, null, 2) + '\n');
const questionCount = catalog.passages.reduce((total, passage) => total + passage.questions.length, 0);
console.log('Exported ' + catalog.passages.length + ' reading passages and ' + questionCount + ' questions.');
