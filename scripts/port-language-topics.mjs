/** Export language-system topics separately from grammar and vocabulary SRS.
 * Run: node scripts/port-language-topics.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = JSON.parse(readFileSync(join(root, 'prisma/seed-data/language-topics/foundations.json'), 'utf8'));
writeFileSync(join(root,'mobile/src/content/language-topics.json'), JSON.stringify(file,null,2)+'\n');
console.log(`Exported ${file.topics.length} language-system topics`);
