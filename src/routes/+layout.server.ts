import type { LayoutServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { calculateLevel } from '$lib/levels';

export const load: LayoutServerLoad = async ({ locals }) => {
	let reviewsDue = 0;
	let totalReviewed = 0;
	let learnableCount = 0;
	let enrolledDeckSlugs: { slug: string; title: string }[] = [];
	let primaryLearnDeckId: string | null = null;

	if (locals.user) {
		const userId = locals.user.id;

		// Reviews currently due (exclude mastered)
		reviewsDue = await prisma.reviewCard.count({
			where: { userId, due: { lte: new Date() }, masteredAt: null }
		});

		// Lifetime reviews (for XP / level)
		totalReviewed = await prisma.reviewLog.count({
			where: { userId }
		});

		// Enrolled decks — compute learnable count from deck progress
		const enrollments = await prisma.userDeckProgress.findMany({
			where: { userId },
			include: {
				deck: {
					include: {
						grammarPoints: { select: { id: true } }
					}
				}
			}
		});

		for (const enrollment of enrollments) {
			enrolledDeckSlugs.push({
				slug: enrollment.deck.slug,
				title: enrollment.deck.title
			});
			// Learnable = total grammar in deck minus what the user has learned (lastLearnedIndex + 1)
			const totalInDeck = enrollment.deck.grammarPoints.length;
			const learnedInDeck = enrollment.lastLearnedIndex + 1;
			const deckLearnable = Math.max(0, totalInDeck - learnedInDeck);
			learnableCount += deckLearnable;

			// First deck with learnable content becomes the primary learn target
			if (!primaryLearnDeckId && deckLearnable > 0) {
				primaryLearnDeckId = enrollment.deckId;
			}
		}
	}

	const levelInfo = calculateLevel(totalReviewed);

	return {
		session: locals.session ?? null,
		user: locals.user ?? null,
		reviewsDue,
		totalReviewed,
		learnableCount,
		levelInfo,
		enrolledDeckSlugs,
		primaryLearnDeckId
	};
};
