import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) throw error(401, 'Unauthorized');

	const body = await request.json();
	const { cardId } = body as { cardId: string };

	if (!cardId) throw error(400, 'cardId required');

	const reviewCard = await prisma.reviewCard.findUnique({ where: { id: cardId } });
	if (!reviewCard) throw error(404, 'Review card not found');
	if (reviewCard.userId !== user.id) throw error(403, 'Forbidden');

	await prisma.reviewCard.update({
		where: { id: cardId },
		data: {
			masteredAt: new Date(),
			streakCorrect: 8
		}
	});

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;
	if (!user) throw error(401, 'Unauthorized');

	const body = await request.json();
	const { cardId } = body as { cardId: string };

	if (!cardId) throw error(400, 'cardId required');

	const reviewCard = await prisma.reviewCard.findUnique({ where: { id: cardId } });
	if (!reviewCard) throw error(404, 'Review card not found');
	if (reviewCard.userId !== user.id) throw error(403, 'Forbidden');

	await prisma.reviewCard.update({
		where: { id: cardId },
		data: {
			masteredAt: null,
			streakCorrect: 0
		}
	});

	return json({ success: true });
};
