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

			// Count grammar points that have all cloze cards mastered
			const reviewCards = await prisma.reviewCard.findMany({
				where: {
					userId: locals.user.id,
					clozeCard: { grammarPointId: { in: gpIds } }
				},
				select: {
					masteredAt: true,
					clozeCard: { select: { grammarPointId: true } }
				}
			});

			// Group by grammar point
			const byGP = new Map<string, { total: number; mastered: number }>();
			for (const rc of reviewCards) {
				const gpId = rc.clozeCard.grammarPointId;
				const entry = byGP.get(gpId) ?? { total: 0, mastered: 0 };
				entry.total++;
				if (rc.masteredAt) entry.mastered++;
				byGP.set(gpId, entry);
			}

			// A grammar point is "mastered" if ALL its review cards are mastered
			let masteredCount = 0;
			for (const [, counts] of byGP) {
				if (counts.total > 0 && counts.mastered === counts.total) masteredCount++;
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
