import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
  const grammarPoints = await prisma.grammarPoint.findMany({
    orderBy: { title: 'asc' },
    include: {
      _count: { select: { clozeCards: true } }
    }
  });

  let reviewsDue = 0;
  let totalReviewed = 0;

  if (locals.user) {
    const dueCount = await prisma.reviewCard.count({
      where: {
        userId: locals.user.id,
        due: { lte: new Date() }
      }
    });
    reviewsDue = dueCount;

    totalReviewed = await prisma.reviewLog.count({
      where: { userId: locals.user.id }
    });
  }

  return {
    grammarPoints: grammarPoints.map((gp) => ({
      id: gp.id,
      title: gp.title,
      category: gp.category,
      hint: gp.hint,
      level: gp.level,
      tags: gp.tags,
      cardCount: gp._count.clozeCards
    })),
    reviewsDue,
    totalReviewed
  };
};

