import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	// Auth is enforced centrally in hooks.server.ts
	const userId = locals.user!.id;

	const reviewCards = await prisma.reviewCard.findMany({
		where: {
			userId,
			due: { lte: new Date() }
		},
		orderBy: { due: 'asc' },
		take: 10,
		include: {
			clozeCard: {
				include: { grammarPoint: true }
			}
		}
	});

	const queue = reviewCards.map((rc) => {
		const card = rc.clozeCard;
		return {
			reviewCardId: rc.id,
			id: card.id,
			grammarPointId: card.grammarPointId,
			fullSentence: card.fullSentence,
			sentenceWithBlank: card.sentenceWithBlank,
			vocabBaseForm: card.vocabBaseForm,
			answers: [card.answer, ...card.alternateAnswers],
			grammar: {
				title: card.grammarPoint.title,
				category: card.grammarPoint.category,
				tense: card.grammarPoint.tense,
				register: card.grammarPoint.register,
				hint: card.grammarPoint.hint,
				description: card.grammarPoint.description
			},
			englishHint: card.englishHint as { text: string; highlight: boolean }[]
		};
	});

	// 6.3 — Expose next upcoming review time for the empty-state UI
	let nextReviewAt: Date | null = null;
	if (reviewCards.length === 0) {
		const next = await prisma.reviewCard.findFirst({
			where: { userId },
			orderBy: { due: 'asc' },
			select: { due: true }
		});
		nextReviewAt = next?.due ?? null;
	}

	return { queue, nextReviewAt };
};
