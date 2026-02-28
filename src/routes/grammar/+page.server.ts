import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { hangulToRoman } from '$lib/hangulToRoman';

export const load: PageServerLoad = async ({ locals, url }) => {
	const levelFilter = url.searchParams.get('level');

	// Load all grammar points with deck relations for TOPIK level + curriculum sort order
	const grammarPoints = await prisma.grammarPoint.findMany({
		include: {
			decks: {
				include: {
					deck: { select: { topikLevel: true } }
				}
			},
			clozeCards: { select: { id: true } }
		}
	});

	// Build a map from grammarPointId → { sortOrder, lessonNumber } from DeckGrammarPoint
	const deckGPs = await prisma.deckGrammarPoint.findMany({
		select: {
			grammarPointId: true,
			sortOrder: true,
			lessonNumber: true,
			deck: { select: { topikLevel: true } }
		},
		orderBy: [{ deck: { sortOrder: 'asc' } }, { sortOrder: 'asc' }]
	});

	const orderMap = new Map<string, { sortOrder: number; lessonNumber: number; topikLevel: string }>();
	for (const dgp of deckGPs) {
		// First deck association wins (a GP shouldn't be in multiple decks, but just in case)
		if (!orderMap.has(dgp.grammarPointId)) {
			orderMap.set(dgp.grammarPointId, {
				sortOrder: dgp.sortOrder,
				lessonNumber: dgp.lessonNumber,
				topikLevel: dgp.deck.topikLevel
			});
		}
	}

	// If user is authenticated, join with ReviewCard for mastery/SRS state
	let masteryMap = new Map<string, { streakCorrect: number; masteredAt: string | null; state: number }>();

	if (locals.user) {
		const reviewCards = await prisma.reviewCard.findMany({
			where: { userId: locals.user.id },
			select: {
				streakCorrect: true,
				masteredAt: true,
				grammarPointId: true,
				state: true
			}
		});

		for (const rc of reviewCards) {
			const gpId = rc.grammarPointId;
			const existing = masteryMap.get(gpId);
			if (!existing) {
				masteryMap.set(gpId, {
					streakCorrect: rc.streakCorrect,
					masteredAt: rc.masteredAt?.toISOString() ?? null,
					state: rc.state
				});
			} else {
				existing.streakCorrect = Math.min(existing.streakCorrect, rc.streakCorrect);
				if (!rc.masteredAt) existing.masteredAt = null;
			}
		}
	}

	const points = grammarPoints.map((gp) => {
		const order = orderMap.get(gp.id);
		const topikLevel = order?.topikLevel ?? gp.decks[0]?.deck.topikLevel ?? 'topik1-1';
		const mastery = masteryMap.get(gp.id);

		// Build searchable text: Hangul title + romanized title + english hint + description
		const romanizedTitle = hangulToRoman(gp.title);
		const searchText = [gp.title, romanizedTitle, gp.hint, gp.description]
			.join(' ')
			.toLowerCase();

		return {
			id: gp.id,
			title: gp.title,
			hint: gp.hint,
			description: gp.description,
			category: gp.category,
			level: gp.level,
			topikLevel,
			sortOrder: order?.sortOrder ?? 999,
			lessonNumber: order?.lessonNumber ?? 99,
			cardCount: gp.clozeCards.length,
			streakCorrect: mastery?.streakCorrect ?? 0,
			masteredAt: mastery?.masteredAt ?? null,
			srsState: mastery?.state ?? -1, // -1 = unstudied
			hasReviewCard: mastery !== undefined,
			searchText
		};
	});

	// Sort by TOPIK level, then curriculum sort order
	points.sort((a, b) => {
		if (a.topikLevel !== b.topikLevel) return a.topikLevel.localeCompare(b.topikLevel);
		return a.sortOrder - b.sortOrder;
	});

	// Apply level filter
	const filtered = levelFilter ? points.filter((p) => p.topikLevel === levelFilter) : points;

	return {
		grammarPoints: filtered,
		allGrammarPoints: points,
		currentLevel: levelFilter
	};
};
