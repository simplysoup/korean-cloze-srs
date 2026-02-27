import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';

export const POST: RequestHandler = async ({ params, locals }) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const { deckId } = params;

	// Verify deck exists and is published
	const deck = await prisma.deck.findUnique({
		where: { id: deckId }
	});

	if (!deck || !deck.isPublished) {
		throw error(404, 'Deck not found');
	}

	// Upsert enrollment — idempotent
	await prisma.userDeckProgress.upsert({
		where: {
			userId_deckId: {
				userId: user.id,
				deckId: deck.id
			}
		},
		update: {},
		create: {
			userId: user.id,
			deckId: deck.id,
			lastLearnedIndex: -1
		}
	});

	return json({ enrolled: true, deckId: deck.id });
};
