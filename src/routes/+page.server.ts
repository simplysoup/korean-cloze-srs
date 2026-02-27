import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect authenticated users to dashboard
	if (locals.user) {
		redirect(302, '/dashboard');
	}

	// Fetch all published decks for unauthenticated landing page
	const decks = await prisma.deck.findMany({
		where: { isPublished: true },
		orderBy: { sortOrder: 'asc' },
		include: {
			_count: { select: { grammarPoints: true } }
		}
	});

	const availableDecks = decks.map((d) => ({
		id: d.id,
		title: d.title,
		slug: d.slug,
		description: d.description,
		icon: d.icon,
		level: d.level,
		totalGrammar: d._count.grammarPoints
	}));

	return { availableDecks };
};

