import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, url }) => {
	const levelFilter = url.searchParams.get('level');

	// Load all grammar points with their deck relations for TOPIK level info
	const grammarPoints = await prisma.grammarPoint.findMany({
		include: {
			decks: {
				include: {
					deck: { select: { topikLevel: true } }
				}
			},
			clozeCards: { select: { id: true } }
		},
		orderBy: [{ level: 'asc' }, { title: 'asc' }]
	});

	// If user is authenticated, join with ReviewCard for mastery state
	let masteryMap = new Map<string, { streakCorrect: number; masteredAt: string | null }>();

	if (locals.user) {
		const reviewCards = await prisma.reviewCard.findMany({
			where: { userId: locals.user.id },
			select: {
				streakCorrect: true,
				masteredAt: true,
				clozeCard: { select: { grammarPointId: true } }
			}
		});

		// Aggregate per grammar point: use max streakCorrect across cloze cards,
		// and earliest masteredAt
		for (const rc of reviewCards) {
			const gpId = rc.clozeCard.grammarPointId;
			const existing = masteryMap.get(gpId);
			if (!existing) {
				masteryMap.set(gpId, {
					streakCorrect: rc.streakCorrect,
					masteredAt: rc.masteredAt?.toISOString() ?? null
				});
			} else {
				// Use min streakCorrect (weakest card determines grammar point mastery display)
				existing.streakCorrect = Math.min(existing.streakCorrect, rc.streakCorrect);
				// If any card is not mastered, grammar point is not mastered
				if (!rc.masteredAt) existing.masteredAt = null;
			}
		}
	}

	const points = grammarPoints.map((gp) => {
		const topikLevel = gp.decks[0]?.deck.topikLevel ?? 'topik1-1';
		const mastery = masteryMap.get(gp.id);
		return {
			id: gp.id,
			title: gp.title,
			hint: gp.hint,
			description: gp.description,
			category: gp.category,
			level: gp.level,
			topikLevel,
			cardCount: gp.clozeCards.length,
			streakCorrect: mastery?.streakCorrect ?? 0,
			masteredAt: mastery?.masteredAt ?? null,
			hasReviewCard: mastery !== undefined
		};
	});

	// Apply level filter
	const filtered = levelFilter ? points.filter((p) => p.topikLevel === levelFilter) : points;

	return {
		grammarPoints: filtered,
		allGrammarPoints: points,
		currentLevel: levelFilter
	};
};
