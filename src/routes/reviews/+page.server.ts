import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Auth is enforced centrally in hooks.server.ts
	const userId = locals.user!.id;

	// 10.5 — Optional deck_id for deck-scoped reviews
	const deckId = url.searchParams.get('deck_id');

	const whereClause: Record<string, unknown> = {
		userId,
		due: { lte: new Date() },
		masteredAt: null
	};

	if (deckId) {
		whereClause.grammarPoint = {
			decks: { some: { deckId } }
		};
	}

	// Fetch due ReviewCards (one per grammar point — unique constraint enforced)
	const reviewCards = await prisma.reviewCard.findMany({
		where: whereClause,
		orderBy: { due: 'asc' },
		take: 10,
		include: {
			grammarPoint: {
				include: {
					clozeCards: {
						orderBy: { introducedAtPosition: 'desc' },
						take: 1
					}
				}
			}
		}
	});

	// Build queue: for each due ReviewCard, select a ClozeCard to present
	const queue = reviewCards
		.filter((rc) => rc.grammarPoint.clozeCards.length > 0)
		.map((rc) => {
			// For now, use the first (most-advanced) cloze card for this GP.
			// In the full "most-advanced-card" algorithm (future), we'd check
			// that all grammar targets on the card are unlocked by the user.
			const card = rc.grammarPoint.clozeCards[0];
			return {
				reviewCardId: rc.id,
				id: card.id,
				grammarPointId: rc.grammarPointId,
				fullSentence: card.fullSentence,
				sentenceWithBlank: card.sentenceWithBlank,
				vocabBaseForm: card.vocabBaseForm,
				answers: [card.answer, ...card.alternateAnswers],
				grammar: {
					title: rc.grammarPoint.title,
					category: rc.grammarPoint.category,
					tense: rc.grammarPoint.tense,
					register: rc.grammarPoint.register,
					hint: rc.grammarPoint.hint,
					description: rc.grammarPoint.description
				},
				englishHint: card.englishHint as { text: string; highlight: boolean }[],
				streakCorrect: rc.streakCorrect,
				masteredAt: rc.masteredAt?.toISOString() ?? null
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

	// Deck context for scoped reviews
	let deckContext: { title: string; slug: string } | null = null;
	if (deckId) {
		const deck = await prisma.deck.findUnique({
			where: { id: deckId },
			select: { title: true, slug: true }
		});
		deckContext = deck;
	}

	return { queue, nextReviewAt, deckId, deckContext };
};
