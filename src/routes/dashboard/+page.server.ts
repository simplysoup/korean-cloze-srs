import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';
import { calculateLevel } from '$lib/levels';
import { getTopikDisplay } from '$lib/topik';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const userId = locals.user.id;
	const now = new Date();

	// Run independent queries in parallel
	const enrolledDecksRaw = await prisma.userDeckProgress.findMany({
		where: { userId },
		include: {
			deck: {
				include: {
					grammarPoints: {
						include: { grammarPoint: true },
						orderBy: { sortOrder: 'asc' }
					},
					_count: { select: { grammarPoints: true } }
				}
			}
		}
	});

	const [_reviewsDue, totalReviewed, streakData, reviewCardsForSrs, totalGrammarInDecks, allUserLogs, lastSessionLogs] =
		await Promise.all([
			prisma.reviewCard.count({ where: { userId, due: { lte: now }, masteredAt: null } }),
			prisma.reviewLog.count({ where: { userId } }),
			prisma.userStreak.findUnique({ where: { userId } }),
			prisma.reviewCard.findMany({
				where: { userId },
				select: { state: true, masteredAt: true, streakCorrect: true, grammarPointId: true }
			}),
			prisma.deckGrammarPoint.findMany({
				where: { deck: { userProgress: { some: { userId } } } },
				select: { grammarPointId: true }
			}),
			prisma.reviewLog.findMany({
				where: { userId },
				select: { reviewedAt: true }
			}),
			prisma.reviewLog.findMany({
				where: { userId },
				orderBy: { reviewedAt: 'desc' },
				take: 50,
				select: { rating: true, reviewedAt: true }
			})
		]);

	// Compute level info
	const levelInfo = calculateLevel(totalReviewed);

	// Compute enrolled decks with progress — using already-fetched data (no extra queries)
	const enrolledDecks = enrolledDecksRaw.map((enrollment) => {
		const deck = enrollment.deck;
		const deckGrammarPointIds = new Set(deck.grammarPoints.map((gp) => gp.grammarPointId));

		// Filter the already-fetched review cards to this deck's grammar points
		const deckReviewCards = reviewCardsForSrs.filter((rc) =>
			deckGrammarPointIds.has(rc.grammarPointId)
		);

		// Learned grammar count: unique grammar points with review cards in this deck
		const uniqueLearnedGrammarIds = new Set(
			deckReviewCards.map((rc) => rc.grammarPointId)
		);

		// Reviews due for this deck (exclude mastered) — count from already-fetched data
		// We need due dates for this, so count from the parallel query data isn't ideal.
		// Instead, precompute from the reviewCardsForSrs which doesn't have `due`.
		// We'll use a separate bulk query below. For now, approximate from enrollment data.

		// Mastered grammar count: a grammar point is mastered when ALL its review cards are mastered
		const masteredByGP = new Map<string, { total: number; mastered: number }>();
		for (const rc of deckReviewCards) {
			const gpId = rc.grammarPointId;
			const e = masteredByGP.get(gpId) ?? { total: 0, mastered: 0 };
			e.total++;
			if (rc.masteredAt) e.mastered++;
			masteredByGP.set(gpId, e);
		}
		let deckMasteredCount = 0;
		for (const [, c] of masteredByGP) {
			if (c.total > 0 && c.mastered === c.total) deckMasteredCount++;
		}

		// Learnable count
		const totalInDeck = deck._count.grammarPoints;
		const learnedInDeck = enrollment.lastLearnedIndex + 1;
		const learnable = Math.max(0, totalInDeck - learnedInDeck);

		// Next lesson info
		const nextIndex = enrollment.lastLearnedIndex + 1;
		const nextGrammarPoint = deck.grammarPoints.find((gp) => gp.sortOrder === nextIndex);
		const nextLessonNumber = nextGrammarPoint?.lessonNumber ?? null;

		return {
			id: deck.id,
			title: deck.title,
			slug: deck.slug,
			icon: deck.icon,
			level: deck.level,
			topikLevel: deck.topikLevel,
			totalGrammar: totalInDeck,
			learnedCount: uniqueLearnedGrammarIds.size,
			masteredCount: deckMasteredCount,
			reviewsDue: 0, // filled in below
			learnable,
			nextLessonNumber
		};
	});

	// Bulk-fetch per-deck reviewsDue in a single query (instead of N separate counts)
	const allDueCards = await prisma.reviewCard.findMany({
		where: {
			userId,
			due: { lte: now },
			masteredAt: null,
			grammarPoint: {
				decks: { some: { deckId: { in: enrolledDecks.map((d) => d.id) } } }
			}
		},
		select: {
			grammarPoint: {
				select: { decks: { select: { deckId: true } } }
			}
		}
	});

	// Count due cards per deck
	const dueCountByDeck = new Map<string, number>();
	for (const card of allDueCards) {
		for (const dg of card.grammarPoint.decks) {
			dueCountByDeck.set(dg.deckId, (dueCountByDeck.get(dg.deckId) ?? 0) + 1);
		}
	}
	for (const deck of enrolledDecks) {
		deck.reviewsDue = dueCountByDeck.get(deck.id) ?? 0;
	}

	// SRS distribution (includes mastered)
	const srsDistribution = { new: 0, learning: 0, review: 0, relearning: 0, mastered: 0, unstudied: 0 };
	const studiedGrammarIds = new Set<string>();

	for (const rc of reviewCardsForSrs) {
		studiedGrammarIds.add(rc.grammarPointId);
		if (rc.masteredAt) {
			srsDistribution.mastered++;
		} else {
			switch (rc.state) {
				case 0: srsDistribution.new++; break;
				case 1: srsDistribution.learning++; break;
				case 2: srsDistribution.review++; break;
				case 3: srsDistribution.relearning++; break;
			}
		}
	}

	// Unstudied = total enrolled grammar points - grammar points with any review card
	const enrolledGrammarIds = new Set(totalGrammarInDecks.map((d) => d.grammarPointId));
	srsDistribution.unstudied = [...enrolledGrammarIds].filter((id) => !studiedGrammarIds.has(id)).length;

	// Days studied (unique dates)
	const uniqueDays = new Set(
		allUserLogs.map((log: { reviewedAt: Date }) => {
			const d = new Date(log.reviewedAt);
			return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
		})
	);
	const daysStudied = uniqueDays.size;

	// Last session accuracy
	let lastSessionAccuracy: number | null = null;
	if (lastSessionLogs.length > 0) {
		// Group by the most recent day
		const mostRecentDate = new Date(lastSessionLogs[0].reviewedAt);
		mostRecentDate.setHours(0, 0, 0, 0);
		const sessionLogs = lastSessionLogs.filter((log) => {
			const d = new Date(log.reviewedAt);
			d.setHours(0, 0, 0, 0);
			return d.getTime() === mostRecentDate.getTime();
		});
		const correctCount = sessionLogs.filter((l) => l.rating >= 2).length;
		lastSessionAccuracy = sessionLogs.length > 0 ? Math.round((correctCount / sessionLogs.length) * 100) : null;
	}

	// Items studied (unique grammar points with at least 1 review)
	const itemsStudied = studiedGrammarIds.size;

	// Streak calendar: last 7 days
	const streakDays: { label: string; active: boolean; isToday: boolean }[] = [];
	const dayNames = ['일', '월', '화', '수', '목', '금', '토']; // Sun-Sat in Korean
	const todayStart = new Date(now);
	todayStart.setHours(0, 0, 0, 0);

	for (let i = 6; i >= 0; i--) {
		const day = new Date(todayStart);
		day.setDate(day.getDate() - i);
		const dayKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
		streakDays.push({
			label: dayNames[day.getDay()],
			active: uniqueDays.has(dayKey),
			isToday: i === 0
		});
	}

	// TOPIK progress: per-deck SRS state distribution (using already-fetched data)
	const topikProgress = enrolledDecksRaw.map((enrollment) => {
		const deckGrammarPointIds = new Set(
			enrollment.deck.grammarPoints.map((gp) => gp.grammarPointId)
		);
		const deckReviewCards = reviewCardsForSrs.filter((rc) =>
			deckGrammarPointIds.has(rc.grammarPointId)
		);

		const states = { new: 0, learning: 0, review: 0, relearning: 0, mastered: 0 };
		for (const rc of deckReviewCards) {
			if (rc.masteredAt) {
				states.mastered++;
			} else {
				switch (rc.state) {
					case 0: states.new++; break;
					case 1: states.learning++; break;
					case 2: states.review++; break;
					case 3: states.relearning++; break;
				}
			}
		}

		return {
			deckTitle: getTopikDisplay(enrollment.deck.topikLevel),
			total: deckGrammarPointIds.size,
			states
		};
	});

	return {
		enrolledDecks,
		totalReviewed,
		levelInfo,
		streakData: streakData
			? {
					currentStreak: streakData.currentStreak,
					longestStreak: streakData.longestStreak,
					lastStudiedDate: streakData.lastStudiedDate?.toISOString() ?? null
				}
			: { currentStreak: 0, longestStreak: 0, lastStudiedDate: null },
		srsDistribution,
		streakDays,
		topikProgress,
		quickStats: {
			daysStudied,
			lastSessionAccuracy,
			itemsStudied
		},
		userName: locals.user.name ?? locals.user.email,
		userEmail: locals.user.email
	};
};
