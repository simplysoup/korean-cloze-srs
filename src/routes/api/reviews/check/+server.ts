import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
	// 6.2 — Auth guard
	const user = locals.user;
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const body = await request.json();
	const { reviewCardId, answers } = body as { reviewCardId: string; answers: string[] };

	if (!reviewCardId || !Array.isArray(answers) || answers.length === 0) {
		throw error(400, 'Invalid request: reviewCardId and answers[] required');
	}

	// Fetch ReviewCard + ClozeCard for correct answers
	const reviewCard = await prisma.reviewCard.findUnique({
		where: { id: reviewCardId },
		include: { clozeCard: true }
	});

	if (!reviewCard) {
		throw error(404, 'Review card not found');
	}

	// Ownership check
	if (reviewCard.userId !== user.id) {
		throw error(403, 'Forbidden');
	}

	const correctAnswers = [
		reviewCard.clozeCard.answer,
		...reviewCard.clozeCard.alternateAnswers
	];

	// All submitted blanks must match one of the correct answers
	const correct = answers.every((a) => correctAnswers.some((ca) => ca === a.trim()));
	const rating = correct ? 3 : 1;

	return json({ correct, rating });
};
