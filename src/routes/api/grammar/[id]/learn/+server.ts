import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';

export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const userId = locals.user.id;
	const grammarPointId = params.id;

	// Verify grammar point exists
	const grammarPoint = await prisma.grammarPoint.findUnique({
		where: { id: grammarPointId },
		include: { clozeCards: { select: { id: true } } }
	});

	if (!grammarPoint) {
		throw error(404, 'Grammar point not found');
	}

	// Create ReviewCards for all cloze cards (skip if already exists)
	let created = 0;
	for (const card of grammarPoint.clozeCards) {
		const existing = await prisma.reviewCard.findUnique({
			where: {
				userId_clozeCardId: { userId, clozeCardId: card.id }
			}
		});

		if (!existing) {
			await prisma.reviewCard.create({
				data: {
					userId,
					clozeCardId: card.id,
					state: 0, // New
					due: new Date(),
					stability: 0,
					difficulty: 0,
					reps: 0,
					lapses: 0
				}
			});
			created++;
		}
	}

	// Update UserDeckProgress if this grammar point is in any enrolled deck
	const deckLinks = await prisma.deckGrammarPoint.findMany({
		where: { grammarPointId },
		select: { deckId: true, sortOrder: true }
	});

	for (const link of deckLinks) {
		const progress = await prisma.userDeckProgress.findUnique({
			where: {
				userId_deckId: { userId, deckId: link.deckId }
			}
		});

		if (progress && progress.lastLearnedIndex < link.sortOrder) {
			await prisma.userDeckProgress.update({
				where: { id: progress.id },
				data: {
					lastLearnedIndex: link.sortOrder,
					lastStudiedAt: new Date()
				}
			});
		}
	}

	return json({ learned: true, reviewCardsCreated: created });
};
