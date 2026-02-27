import type { LayoutServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { calculateLevel } from '$lib/levels';

export const load: LayoutServerLoad = async ({ locals }) => {
	let reviewsDue = 0;
	let totalReviewed = 0;
	let learnableCount = 0;

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

		// Grammar points the user hasn't started yet
		// (no ReviewCard exists for any of the grammar point's cloze cards)
		const startedGrammarIds = await prisma.reviewCard.findMany({
			where: { userId },
			select: { clozeCard: { select: { grammarPointId: true } } },
			distinct: ['clozeCardId']
		});
		const startedSet = new Set(startedGrammarIds.map((r) => r.clozeCard.grammarPointId));
		const totalGrammar = await prisma.grammarPoint.count();
		learnableCount = totalGrammar - startedSet.size;
	}

	const levelInfo = calculateLevel(totalReviewed);

	return {
		session: locals.session ?? null,
		user: locals.user ?? null,
		reviewsDue,
		totalReviewed,
		learnableCount,
		levelInfo
	};
};
