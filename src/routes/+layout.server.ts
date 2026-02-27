import type { LayoutServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { calculateLevel } from '$lib/levels';

export const load: LayoutServerLoad = async ({ locals }) => {
	let reviewsDue = 0;
	let totalReviewed = 0;
	let learnableCount = 0;
	let enrolledDeckSlugs: { slug: string; title: string }[] = [];

	if (locals.user) {
		const userId = locals.user.id;

		// Reviews currently due
		reviewsDue = await prisma.reviewCard.count({
			where: { userId, due: { lte: new Date() } }
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
			learnableCount += Math.max(0, totalInDeck - learnedInDeck);
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
		enrolledDeckSlugs
	};
};
