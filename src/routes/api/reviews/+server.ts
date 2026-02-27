import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';
import { fsrs, type Card, type Grade } from 'ts-fsrs';

const f = fsrs();

export const POST: RequestHandler = async ({ request, locals }) => {
	// 6.1 — Auth guard (hook already handles unauthenticated, but double-check for ownership)
	const user = locals.user;
	if (!user) {
		throw error(401, 'Unauthorized');
	}

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

	// 6.1 — Ownership check
	if (reviewCard.userId !== user.id) {
		throw error(403, 'Forbidden');
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

	// Update streak
	const todayStart = new Date(now);
	todayStart.setHours(0, 0, 0, 0);

	const existingStreak = await prisma.userStreak.findUnique({
		where: { userId: user.id }
	});

	if (existingStreak) {
		const lastDate = existingStreak.lastStudiedDate;
		if (!lastDate || lastDate.getTime() < todayStart.getTime()) {
			// Check if yesterday
			const yesterdayStart = new Date(todayStart);
			yesterdayStart.setDate(yesterdayStart.getDate() - 1);

			let newStreak: number;
			if (lastDate && lastDate.getTime() >= yesterdayStart.getTime()) {
				// Studied yesterday — increment
				newStreak = existingStreak.currentStreak + 1;
			} else {
				// Gap — reset to 1
				newStreak = 1;
			}

			await prisma.userStreak.update({
				where: { userId: user.id },
				data: {
					currentStreak: newStreak,
					longestStreak: Math.max(newStreak, existingStreak.longestStreak),
					lastStudiedDate: todayStart
				}
			});
		}
		// If lastStudiedDate is today, no change needed
	} else {
		// First review ever — create streak
		await prisma.userStreak.create({
			data: {
				userId: user.id,
				currentStreak: 1,
				longestStreak: 1,
				lastStudiedDate: todayStart
			}
		});
	}

	return json({
		success: true,
		nextDue: updatedCard.due,
		state: updatedCard.state
	});
};
