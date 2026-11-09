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
import { level1Additions } from '../prisma/seed-data/topik1-level1/additions';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const outPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'mobile', 'src', 'content', 'topik1-level1.json');

// Merge the Codex Level 1 additions (worked examples + variant practice
// cards, ported from the old app's patch) into each grammar point. The
// SvelteKit allLessons are left untouched — the merge happens here, at
// the Expo port boundary.
const lessons = allLessons.map((lesson) => ({
	...lesson,
	grammarPoints: lesson.grammarPoints.map((gp) => {
		const added = level1Additions[gp.id];
		if (!added) return gp;
		return {
			...gp,
			cards: [...gp.cards, ...(added.cards ?? [])],
			lessonExamples: [...gp.lessonExamples, ...(added.examples ?? [])]
		};
	})
}));

const data = {
	provenance:
		'PROVISIONAL — copied verbatim from prisma/seed-data/topik1-level1/ (old SvelteKit app, last commit 2026-02-28), plus the Level 1 additions in prisma/seed-data/topik1-level1/additions.ts (worked examples + variant practice cards, from the Codex "Make Level 1 lessons and reviews reliable" patch, 2026-11-08). Authored by Nicholas with basic Korean; to be regenerated later by a high-performing English-Korean multimodal model. Do not treat as vetted teaching content.',
	source: 'prisma/seed-data/topik1-level1/lesson-01.ts … lesson-11.ts + additions.ts',
	deck: { id: 'deck_topik1_level1', title: 'TOPIK I Level 1', slug: 'topik1-level1', topikLevel: 'topik1-1', level: 1 },
	lessons
};

writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n');

const gps = lessons.flatMap((l) => l.grammarPoints);
const cards = gps.flatMap((g) => g.cards);
const examples = gps.flatMap((g) => g.lessonExamples);
console.log(`lessons: ${lessons.length}`);
console.log(`grammarPoints: ${gps.length}`);
console.log(`clozeCards: ${cards.length}`);
console.log(`lessonExamples: ${examples.length}`);
console.log(`wrote ${outPath}`);
