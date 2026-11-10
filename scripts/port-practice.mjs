/** Copy reviewed practice content to the mobile app. Never modify the grammar catalogue.
 * Run: node scripts/port-practice.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const from = join(root, 'prisma/seed-data/practice/pilot.json');
const to = join(root, 'mobile/src/content/practice-pilot.json');
const source = JSON.parse(readFileSync(from, 'utf8'));
if (source.kind !== 'grammar-transfer-pilot' || source.schemaVersion !== 1) {
  throw new Error('Unsupported practice schema');
}
writeFileSync(to, JSON.stringify(source, null, 2) + '\n');
console.log(`Ported ${source.exercises.length} practice items in ${source.units.length} units`);
