import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	// Fetch all published decks
	const decks = await prisma.deck.findMany({
		where: { isPublished: true },
		orderBy: { sortOrder: 'asc' },
		include: {
			_count: { select: { grammarPoints: true } }
		}
	});

	let enrolledDecks: {
		id: string;
		title: string;
		slug: string;
		icon: string | null;
		level: number;
		totalGrammar: number;
		learnedCount: number;
		reviewsDue: number;
	}[] = [];

	let availableDecks: {
		id: string;
		title: string;
		slug: string;
		description: string;
		icon: string | null;
		level: number;
		totalGrammar: number;
	}[] = [];

	let reviewsDue = 0;
	let totalReviewed = 0;

	if (locals.user) {
		const userId = locals.user.id;

		// Fetch user's enrollments
		const enrollments = await prisma.userDeckProgress.findMany({
			where: { userId },
			select: { deckId: true, lastLearnedIndex: true }
		});
		const enrolledIds = new Set(enrollments.map((e) => e.deckId));

		// Global stats
		reviewsDue = await prisma.reviewCard.count({
			where: { userId, due: { lte: new Date() } }
		});
		totalReviewed = await prisma.reviewLog.count({
			where: { userId }
		});

		// Per-deck stats for enrolled decks
		for (const deck of decks) {
			if (enrolledIds.has(deck.id)) {
				// Count unique grammar points the user has ReviewCards for in this deck
				const learnedGrammarIds = await prisma.reviewCard.findMany({
					where: {
						userId,
						clozeCard: {
							grammarPoint: {
								decks: { some: { deckId: deck.id } }
							}
						}
					},
					select: { clozeCard: { select: { grammarPointId: true } } },
					distinct: ['clozeCardId']
				});
				const uniqueGrammarIds = new Set(learnedGrammarIds.map((r) => r.clozeCard.grammarPointId));

				// Reviews due for this deck's grammar
				const deckReviewsDue = await prisma.reviewCard.count({
					where: {
						userId,
						due: { lte: new Date() },
						clozeCard: {
							grammarPoint: {
								decks: { some: { deckId: deck.id } }
							}
						}
					}
				});

				enrolledDecks.push({
					id: deck.id,
					title: deck.title,
					slug: deck.slug,
					icon: deck.icon,
					level: deck.level,
					totalGrammar: deck._count.grammarPoints,
					learnedCount: uniqueGrammarIds.size,
					reviewsDue: deckReviewsDue
				});
			} else {
				availableDecks.push({
					id: deck.id,
					title: deck.title,
					slug: deck.slug,
					description: deck.description,
					icon: deck.icon,
					level: deck.level,
					totalGrammar: deck._count.grammarPoints
				});
			}
		}
	} else {
		// Unauthenticated: all decks shown as available
		availableDecks = decks.map((d) => ({
			id: d.id,
			title: d.title,
			slug: d.slug,
			description: d.description,
			icon: d.icon,
			level: d.level,
			totalGrammar: d._count.grammarPoints
		}));
	}

	return {
		enrolledDecks,
		availableDecks,
		reviewsDue,
		totalReviewed
	};
};

