/**
 * Port the TOPIK I Level 1 seed content from the old SvelteKit app
 * (prisma/seed-data/topik1-level1/) into the Expo app as JSON.
 *
 * PROVISIONAL CONTENT — see mobile/README.md. The sentences below were
 * authored by Nicholas with basic Korean and will likely be regenerated
 * later by a high-performing English–Korean multimodal model. This script
 * copies them VERBATIM; it does not edit, improve, or generate any
 * Korean (or English) content.
 *
 * Run:  bun scripts/port-content.ts
 * Output: mobile/src/content/topik1-level1.json
 */
import { allLessons } from '../prisma/seed-data/topik1-level1';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'mobile', 'src', 'content', 'topik1-level1.json');

const data = {
	provenance:
		'PROVISIONAL — copied verbatim from prisma/seed-data/topik1-level1/ (old SvelteKit app, last commit 2026-02-28). Authored by Nicholas with basic Korean; to be regenerated later by a high-performing English-Korean multimodal model. Do not treat as vetted teaching content.',
	source: 'prisma/seed-data/topik1-level1/lesson-01.ts … lesson-11.ts',
	deck: { id: 'deck_topik1_level1', title: 'TOPIK I Level 1 Grammar', slug: 'topik1-level1', topikLevel: 'topik1-1', level: 1 },
	lessons: allLessons
};

writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n');

const gps = allLessons.flatMap((l) => l.grammarPoints);
const cards = gps.flatMap((g) => g.cards);
const examples = gps.flatMap((g) => g.lessonExamples);
console.log(`lessons: ${allLessons.length}`);
console.log(`grammarPoints: ${gps.length}`);
console.log(`clozeCards: ${cards.length}`);
console.log(`lessonExamples: ${examples.length}`);
console.log(`wrote ${outPath}`);
