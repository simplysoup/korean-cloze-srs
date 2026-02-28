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
	const { reviewCardId, clozeCardId, answers } = body as {
		reviewCardId: string;
		clozeCardId?: string;
		answers: string[];
	};

	if (!reviewCardId || !Array.isArray(answers) || answers.length === 0) {
		throw error(400, 'Invalid request: reviewCardId and answers[] required');
	}

	// Fetch ReviewCard (now keyed by grammarPointId, not clozeCardId)
	const reviewCard = await prisma.reviewCard.findUnique({
		where: { id: reviewCardId },
		select: { userId: true, grammarPointId: true }
	});

	if (!reviewCard) {
		throw error(404, 'Review card not found');
	}

	// Ownership check
	if (reviewCard.userId !== user.id) {
		throw error(403, 'Forbidden');
	}

	// If a clozeCardId was provided, look up the word replacement from the grammar target.
	// Otherwise fall back to the first cloze card for this grammar point.
	let correctAnswers: string[];

	if (clozeCardId) {
		const target = await prisma.clozeCardGrammarTarget.findUnique({
			where: {
				clozeCardId_grammarPointId: {
					clozeCardId,
					grammarPointId: reviewCard.grammarPointId
				}
			},
			include: { clozeCard: { select: { answer: true, alternateAnswers: true } } }
		});

		if (target) {
			correctAnswers = [
				target.wordReplacement,
				target.clozeCard.answer,
				...target.clozeCard.alternateAnswers
			];
			// Deduplicate
			correctAnswers = [...new Set(correctAnswers)];
		} else {
			throw error(404, 'Grammar target not found for this card');
		}
	} else {
		// Fallback: find any cloze card for this grammar point
		const card = await prisma.clozeCard.findFirst({
			where: { grammarPointId: reviewCard.grammarPointId },
			select: { answer: true, alternateAnswers: true }
		});
		if (!card) throw error(404, 'No cloze card found for this grammar point');
		correctAnswers = [card.answer, ...card.alternateAnswers];
	}

	// All submitted blanks must match one of the correct answers
	const correct = answers.every((a) => correctAnswers.some((ca) => ca === a.trim()));
	const rating = correct ? 3 : 1;

	return json({ correct, rating });
};
