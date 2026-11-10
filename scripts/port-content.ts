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
 */
import { allLessons as level1Lessons } from '../prisma/seed-data/topik1-level1';
import { level1Additions } from '../prisma/seed-data/topik1-level1/additions';
import { allLessons as level2Lessons } from '../prisma/seed-data/topik1-level2';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { LessonSeed } from '../prisma/seed-data/types';

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

portLevel(
	level1,
	{ id: 'deck_topik1_level1', title: 'TOPIK I Level 1', slug: 'topik1-level1', topikLevel: 'topik1-1', level: 1 },
	'Level 1 was authored by Nicholas with basic Korean, then audited and reorganised into a learner-first curriculum on 2026-11-09 (41 sentence corrections, 12 translation-only fixes, invalid alternate answers removed, grammar points reordered so polite verb conjugation precedes object-particle production). See docs/planning/korean-curriculum-overhaul-2026-11-09.md. A further pass added two gap grammar points (noun negation N이/가 아니다 at position 2, subject honorific -(으)시-) and a teaching guide for every point (prisma/seed-data/teaching-guides/), applied by teachLesson() at the lesson boundary: each description is the guide\'s plain-English meaning, with three notes (formation, worked example, common trap) prepended. Plus the Level 1 additions in prisma/seed-data/topik1-level1/additions.ts (worked examples + variant practice cards, from the Codex "Make Level 1 lessons and reviews reliable" patch, 2026-11-08). Not independently reviewed by a Korean educator; treat as a curated draft, not vetted teaching content.',
	'prisma/seed-data/topik1-level1/lesson-01.ts … lesson-11.ts + additions.ts',
	'topik1-level1.json',
);

portLevel(
	level2Lessons,
	{ id: 'deck_topik1_level2', title: 'TOPIK I Level 2', slug: 'topik-level-2', topikLevel: 'topik1-2', level: 2 },
	'Level 2 was authored fresh in the learner-first curriculum overhaul on 2026-11-09 (see docs/planning/korean-curriculum-overhaul-2026-11-09.md). A further pass added one gap grammar point (formal noun copula N입니다/입니까?) and a teaching guide for every point (prisma/seed-data/teaching-guides/), applied by teachLesson() at the lesson boundary. Lesson 22 (reported speech) is labelled an optional bridge — it sits near or beyond the usual TOPIK I beginner boundary. -(으)ㄹ지라도 and written nominalization -(으)ㅁ were deliberately omitted as higher-level material. Not independently reviewed by a Korean educator; treat as a curated draft, not vetted teaching content.',
	'prisma/seed-data/topik1-level2/lesson-12.ts … lesson-22.ts',
	'topik1-level2.json',
);
