import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

const DEFAULT_SESSION_SIZE = 5;
const MAX_SESSION_SIZE = 20;

export const load: PageServerLoad = async ({ url, locals }) => {
	if (!locals.user) throw redirect(303, '/login');

	const deckId = url.searchParams.get('deck_id');
	if (!deckId) throw redirect(303, '/decks');

	const rawSize = parseInt(url.searchParams.get('size') ?? '', 10);
	const sessionSize = Number.isFinite(rawSize) && rawSize >= 1 && rawSize <= MAX_SESSION_SIZE
		? rawSize
		: DEFAULT_SESSION_SIZE;

	const userId = locals.user.id;

	// Get or create deck progress (auto-enroll on first learn)
	let progress = await prisma.userDeckProgress.findUnique({
		where: { userId_deckId: { userId, deckId } }
	});

	if (!progress) {
		const deck = await prisma.deck.findUnique({
			where: { id: deckId },
			select: { id: true, isPublished: true }
		});
		if (!deck || !deck.isPublished) throw redirect(303, '/dashboard');

		progress = await prisma.userDeckProgress.create({
			data: { userId, deckId, lastLearnedIndex: -1 }
		});
	}

	// Fetch deck info
	const deck = await prisma.deck.findUnique({
		where: { id: deckId },
		select: { title: true, slug: true }
	});
	if (!deck) throw redirect(303, '/dashboard');

	// Load next N unlearned grammar points (ordered by sortOrder)
	const nextIndex = progress.lastLearnedIndex + 1;
	const nextGrammarPoints = await prisma.deckGrammarPoint.findMany({
		where: { deckId, sortOrder: { gte: nextIndex } },
		orderBy: { sortOrder: 'asc' },
		take: sessionSize,
		include: {
			grammarPoint: {
				include: { clozeCards: { orderBy: { createdAt: 'asc' } } }
			}
		}
	});

	if (nextGrammarPoints.length === 0) {
		return {
			deckComplete: true,
			deckId,
			deckTitle: deck.title,
			deckSlug: deck.slug,
			sessionSize,
			grammarPoints: [],
			totalRemaining: 0
		};
	}

	// Count total remaining for progress display
	const totalRemaining = await prisma.deckGrammarPoint.count({
		where: { deckId, sortOrder: { gte: nextIndex } }
	});

	return {
		deckComplete: false,
		deckId,
		deckTitle: deck.title,
		deckSlug: deck.slug,
		sessionSize,
		totalRemaining,
		grammarPoints: nextGrammarPoints.map((dgp) => ({
			id: dgp.grammarPoint.id,
			title: dgp.grammarPoint.title,
			hint: dgp.grammarPoint.hint,
			category: dgp.grammarPoint.category,
			tense: dgp.grammarPoint.tense,
			register: dgp.grammarPoint.register,
			description: dgp.grammarPoint.description,
			level: dgp.grammarPoint.level,
			tags: dgp.grammarPoint.tags,
			structurePattern: dgp.grammarPoint.structurePattern,
			notes: dgp.grammarPoint.notes,
			clozeCards: dgp.grammarPoint.clozeCards,
			sortOrder: dgp.sortOrder
		}))
	};
};
