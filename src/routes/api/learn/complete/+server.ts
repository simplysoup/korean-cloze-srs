import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const userId = locals.user.id;
	const body = await request.json();
	const { deckId, grammarPointId } = body;

	if (!deckId || !grammarPointId) {
		throw error(400, 'Missing deckId or grammarPointId');
	}

	// Verify the grammar point belongs to this deck
	const deckGP = await prisma.deckGrammarPoint.findFirst({
		where: { deckId, grammarPointId },
		include: {
			grammarPoint: {
				include: { clozeCards: { select: { id: true } } }
			}
		}
	});

	if (!deckGP) {
		throw error(404, 'Grammar point not found in this deck');
	}

	// Create ReviewCards for all cloze cards (skip duplicates)
	let created = 0;
	for (const card of deckGP.grammarPoint.clozeCards) {
		const existing = await prisma.reviewCard.findUnique({
			where: { userId_clozeCardId: { userId, clozeCardId: card.id } }
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

	// Update UserDeckProgress: advance lastLearnedIndex
	const progress = await prisma.userDeckProgress.findUnique({
		where: { userId_deckId: { userId, deckId } }
	});

	if (progress) {
		const newIndex = Math.max(progress.lastLearnedIndex, deckGP.sortOrder);
		await prisma.userDeckProgress.update({
			where: { id: progress.id },
			data: {
				lastLearnedIndex: newIndex,
				lastStudiedAt: new Date()
			}
		});
	}

	return json({ success: true, reviewCardsCreated: created });
};
