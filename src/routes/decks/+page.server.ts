import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	const decks = await prisma.deck.findMany({
		where: { isPublished: true },
		orderBy: { sortOrder: 'asc' },
		include: {
			grammarPoints: {
				include: {
					grammarPoint: {
						include: { clozeCards: { select: { id: true } } }
					}
				}
			}
		}
	});

	// If authenticated, get mastery stats per deck
	let masteryByDeck = new Map<string, { mastered: number; total: number }>();

	if (locals.user) {
		for (const deck of decks) {
			const gpIds = deck.grammarPoints.map((dgp) => dgp.grammarPointId);
			if (gpIds.length === 0) {
				masteryByDeck.set(deck.id, { mastered: 0, total: 0 });
				continue;
			}

			// Count grammar points that are mastered (ReviewCard keyed by grammarPointId directly)
			const reviewCards = await prisma.reviewCard.findMany({
				where: {
					userId: locals.user.id,
					grammarPointId: { in: gpIds }
				},
				select: {
					masteredAt: true,
					grammarPointId: true
				}
			});

			// With 1:1 ReviewCard:GP, each RC directly represents one GP
			let masteredCount = 0;
			for (const rc of reviewCards) {
				if (rc.masteredAt) masteredCount++;
			}

			masteryByDeck.set(deck.id, { mastered: masteredCount, total: gpIds.length });
		}
	}

	const deckList = decks.map((deck) => {
		const lessonNumbers = new Set(deck.grammarPoints.map((dgp) => dgp.lessonNumber));
		const mastery = masteryByDeck.get(deck.id);
		return {
			id: deck.id,
			title: deck.title,
			slug: deck.slug,
			description: deck.description,
			topikLevel: deck.topikLevel,
			icon: deck.icon,
			lessonCount: lessonNumbers.size,
			grammarCount: deck.grammarPoints.length,
			mastered: mastery?.mastered ?? 0,
			total: mastery?.total ?? deck.grammarPoints.length
		};
	});

	return { decks: deckList };
};
