import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';
import { fsrs, type Card, type Grade } from 'ts-fsrs';

const f = fsrs();

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { reviewCardId, rating } = body as { reviewCardId: string; rating: number };

	if (!reviewCardId || ![1, 2, 3, 4].includes(rating)) {
		throw error(400, 'Invalid request: reviewCardId and rating (1-4) required');
	}

	// Fetch current review card
	const reviewCard = await prisma.reviewCard.findUnique({
		where: { id: reviewCardId }
	});

	if (!reviewCard) {
		throw error(404, 'Review card not found');
	}

	// Build the ts-fsrs Card from stored state
	const now = new Date();
	const card: Card = {
		due: reviewCard.due,
		stability: reviewCard.stability,
		difficulty: reviewCard.difficulty,
		elapsed_days: 0,
		scheduled_days: 0,
		reps: reviewCard.reps,
		lapses: reviewCard.lapses,
		state: reviewCard.state as 0 | 1 | 2 | 3,
		last_review: reviewCard.lastReview ?? undefined,
		learning_steps: 0
	};

	// Compute next schedule
	const scheduling = f.repeat(card, now);
	const result = scheduling[rating as Grade];
	const updatedCard = result.card;
	const reviewLog = result.log;

	// Update ReviewCard with new FSRS state
	await prisma.reviewCard.update({
		where: { id: reviewCardId },
		data: {
			stability: updatedCard.stability,
			difficulty: updatedCard.difficulty,
			reps: updatedCard.reps,
			lapses: updatedCard.lapses,
			state: updatedCard.state,
			due: updatedCard.due,
			lastReview: now
		}
	});

	// Append ReviewLog entry
	await prisma.reviewLog.create({
		data: {
			reviewCardId: reviewCard.id,
			userId: reviewCard.userId,
			rating,
			reviewedAt: now,
			stability: updatedCard.stability,
			difficulty: updatedCard.difficulty,
			elapsedDays: reviewLog.elapsed_days,
			scheduledDays: reviewLog.scheduled_days
		}
	});

	return json({
		success: true,
		nextDue: updatedCard.due,
		state: updatedCard.state
	});
};
