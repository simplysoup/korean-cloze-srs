import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const grammarPoint = await prisma.grammarPoint.findUnique({
		where: { id: params.id },
		include: {
			clozeCards: { orderBy: { createdAt: 'asc' } },
			decks: {
				include: { deck: true },
				orderBy: { sortOrder: 'asc' }
			}
		}
	});

	if (!grammarPoint) throw error(404, 'Grammar point not found');

	// Lesson context from query params (optional)
	const deckId = url.searchParams.get('deck_id');
	const lessonParam = url.searchParams.get('lesson');
	let lessonContext: {
		deckTitle: string;
		deckSlug: string;
		lessonNumber: number;
		grammarPoints: { id: string; title: string }[];
		currentIndex: number;
	} | null = null;

	if (deckId && lessonParam) {
		const lessonNumber = parseInt(lessonParam);
		const lessonGrammar = await prisma.deckGrammarPoint.findMany({
			where: { deckId, lessonNumber },
			include: { grammarPoint: true, deck: true },
			orderBy: { sortOrder: 'asc' }
		});

		if (lessonGrammar.length > 0) {
			lessonContext = {
				deckTitle: lessonGrammar[0].deck.title,
				deckSlug: lessonGrammar[0].deck.slug,
				lessonNumber,
				grammarPoints: lessonGrammar.map((lg) => ({
					id: lg.grammarPoint.id,
					title: lg.grammarPoint.title
				})),
				currentIndex: lessonGrammar.findIndex((lg) => lg.grammarPointId === params.id)
			};
		}
	}

	// If no lesson context, try to find deck context for navigation
	let deckContext: {
		deckTitle: string;
		deckSlug: string;
	} | null = null;
	if (!lessonContext && grammarPoint.decks.length > 0) {
		const firstDeck = grammarPoint.decks[0].deck;
		deckContext = {
			deckTitle: firstDeck.title,
			deckSlug: firstDeck.slug
		};
	}

	// User's learning status for this grammar point
	let isLearned = false;
	if (locals.user) {
		const reviewCardCount = await prisma.reviewCard.count({
			where: {
				userId: locals.user.id,
				clozeCard: { grammarPointId: params.id }
			}
		});
		isLearned = reviewCardCount > 0;
	}

	return { grammarPoint, lessonContext, deckContext, isLearned };
};
