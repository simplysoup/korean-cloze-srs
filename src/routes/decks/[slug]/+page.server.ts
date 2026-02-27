import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const deck = await prisma.deck.findUnique({
		where: { slug: params.slug },
		include: {
			grammarPoints: {
				orderBy: { sortOrder: 'asc' },
				include: {
					grammarPoint: {
						include: {
							clozeCards: { select: { id: true } }
						}
					}
				}
			}
		}
	});

	if (!deck || !deck.isPublished) {
		error(404, 'Deck not found');
	}

	// Per-user progress
	let userProgress: { lastLearnedIndex: number } | null = null;
	let learnedGrammarIds = new Set<string>();
	let reviewsDueByGrammar = new Map<string, number>();

	if (locals.user) {
		const userId = locals.user.id;

		// Fetch enrollment
		const progress = await prisma.userDeckProgress.findUnique({
			where: { userId_deckId: { userId, deckId: deck.id } }
		});
		userProgress = progress ? { lastLearnedIndex: progress.lastLearnedIndex } : null;

		// Fetch which grammar points user has ReviewCards for (i.e. "learned")
		const userReviewCards = await prisma.reviewCard.findMany({
			where: { userId },
			select: {
				clozeCard: { select: { grammarPointId: true } },
				due: true
			}
		});

		const now = new Date();
		for (const rc of userReviewCards) {
			learnedGrammarIds.add(rc.clozeCard.grammarPointId);
			if (rc.due <= now) {
				const gpId = rc.clozeCard.grammarPointId;
				reviewsDueByGrammar.set(gpId, (reviewsDueByGrammar.get(gpId) ?? 0) + 1);
			}
		}
	}

	// Build grammar points with status
	const grammarList = deck.grammarPoints.map((dgp) => {
		const gp = dgp.grammarPoint;
		const isLearned = learnedGrammarIds.has(gp.id);
		const reviewsDue = reviewsDueByGrammar.get(gp.id) ?? 0;

		// Determine status: learned, current (next to learn), or locked
		let status: 'learned' | 'current' | 'locked' = 'locked';
		if (isLearned) {
			status = 'learned';
		} else if (userProgress && dgp.sortOrder === userProgress.lastLearnedIndex + 1) {
			status = 'current';
		} else if (!userProgress && dgp.sortOrder === 0) {
			status = 'current';
		}

		return {
			id: gp.id,
			title: gp.title,
			hint: gp.hint,
			sortOrder: dgp.sortOrder,
			lessonNumber: dgp.lessonNumber,
			cardCount: gp.clozeCards.length,
			status,
			reviewsDue
		};
	});

	// Group by lesson
	const lessons = new Map<number, typeof grammarList>();
	for (const gp of grammarList) {
		if (!lessons.has(gp.lessonNumber)) lessons.set(gp.lessonNumber, []);
		lessons.get(gp.lessonNumber)!.push(gp);
	}

	const totalLearned = grammarList.filter((g) => g.status === 'learned').length;
	const totalReviewsDue = grammarList.reduce((sum, g) => sum + g.reviewsDue, 0);

	return {
		deck: {
			id: deck.id,
			title: deck.title,
			slug: deck.slug,
			description: deck.description,
			level: deck.level,
			icon: deck.icon
		},
		enrolled: userProgress !== null,
		totalGrammar: grammarList.length,
		totalLearned,
		totalReviewsDue,
		lessons: Array.from(lessons.entries()).map(([num, points]) => ({
			lessonNumber: num,
			grammarPoints: points
		}))
	};
};
