import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}
	const userId = locals.user.id;

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

	return { queue };
};
