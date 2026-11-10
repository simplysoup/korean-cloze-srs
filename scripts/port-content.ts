/**
 * Port the TOPIK I seed content (prisma/seed-data/topik1-level1/ and
 * topik1-level2/) into the Expo app as JSON.
 *
 * Level 1 was authored by Nicholas with basic Korean, then audited and
 * reorganised into a learner-first curriculum on 2026-11-09 (see
 * docs/planning/korean-curriculum-overhaul-2026-11-09.md). Level 2 was
 * authored fresh in the same overhaul. A further pass added three gap
 * grammar points (noun negation N이/가 아니다, subject honorific
 * -(으)시-, formal noun copula N입니다/입니까?) in
 * prisma/seed-data/grammar-gaps.ts, and a teaching guide for every
 * point (prisma/seed-data/teaching-guides/): each lesson is exported
 * through teachLesson(), which replaces the point's description with
 * the guide's plain-English meaning and prepends three notes
 * (formation, worked example, common trap). This script copies the
 * resulting lessons VERBATIM; it does not edit, improve, or generate
 * any Korean (or English) content.
 *
 * Run:  bun scripts/port-content.ts
 * Output: mobile/src/content/topik1-level1.json
 *         mobile/src/content/topik1-level2.json
 *         mobile/src/content/topik2-level3.json … topik2-level6.json
 */
import { allLessons as level1Lessons } from '../prisma/seed-data/topik1-level1';
import { level1Additions } from '../prisma/seed-data/topik1-level1/additions';
import { allLessons as level2Lessons } from '../prisma/seed-data/topik1-level2';
import { writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LessonSeed } from '../prisma/seed-data/types';
import { applyGrammarExpansions } from './curriculum-overlay.mjs';

const contentDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'mobile', 'src', 'content');

// Merge the Codex Level 1 additions (worked examples + variant practice
// cards, ported from the old app's patch) into each grammar point. The
// SvelteKit allLessons are left untouched — the merge happens here, at
// the Expo port boundary. Level 2 has no additions file; all of its
// cards and examples live in the lesson files directly.
const level1 = level1Lessons.map((lesson) => ({
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

function portLevel(
	lessons: LessonSeed[],
	deck: { id: string; title: string; slug: string; topikLevel: string; level: number },
	provenance: string,
	source: string,
	outFile: string,
) {
	const data = { provenance, source, deck, lessons };
	const outPath = join(contentDir, outFile);
	writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n');
	const gps = lessons.flatMap((l) => l.grammarPoints);
	const cards = gps.flatMap((g) => g.cards);
	const examples = gps.flatMap((g) => g.lessonExamples);
	console.log(`${outFile}: ${lessons.length} lessons, ${gps.length} grammar points, ${cards.length} cloze cards, ${examples.length} lesson examples`);
	console.log(`  wrote ${outPath}`);
}

/**
 * Assemble the existing six source decks, then insert grammar-system gaps
 * by stable point ID. Generated JSON is always a single reproducible output.
 * Individual number, time and counter words are reserved for vocab decks.
 */
const originalLevel1 = JSON.parse(readFileSync(join(contentDir, 'topik1-level1.json'), 'utf8'));
const originalLevel2 = JSON.parse(readFileSync(join(contentDir, 'topik1-level2.json'), 'utf8'));
const rawBundles = [
  { ...originalLevel1, lessons: level1 },
  { ...originalLevel2, lessons: level2Lessons },
  ...[3, 4, 5, 6].map(level => JSON.parse(readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '..', 'prisma', 'seed-data', 'topik2', `level-${level}.json`), 'utf8',
  ))),
];
const gapBundles = [1, 2, 3, 4].map(level => JSON.parse(readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '..', 'prisma', 'seed-data', 'grammar-expansion', `level-${level}.json`), 'utf8',
)));
const expanded = applyGrammarExpansions(rawBundles, gapBundles);
expanded.forEach((bundle, index) => {
  const level = index + 1;
  portLevel(
    bundle.lessons,
    bundle.deck,
    bundle.provenance,
    bundle.source,
    level <= 2 ? `topik1-level${level}.json` : `topik2-level${level}.json`,
  );
});
