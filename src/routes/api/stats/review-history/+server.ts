import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db';

export const GET: RequestHandler = async ({ url, locals }) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const period = url.searchParams.get('period') ?? 'daily';
	if (period !== 'hourly' && period !== 'daily') {
		throw error(400, 'period must be "hourly" or "daily"');
	}

	const now = new Date();
	const userId = user.id;

	if (period === 'hourly') {
		// Last 24 hours, per-hour buckets
		const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
		const logs = await prisma.reviewLog.findMany({
			where: { userId, reviewedAt: { gte: since } },
			select: { reviewedAt: true, rating: true }
		});

		const labels: string[] = [];
		const correct: number[] = [];
		const incorrect: number[] = [];

		for (let i = 23; i >= 0; i--) {
			const bucketStart = new Date(now);
			bucketStart.setMinutes(0, 0, 0);
			bucketStart.setHours(bucketStart.getHours() - i);
			const bucketEnd = new Date(bucketStart.getTime() + 60 * 60 * 1000);

			const hour = bucketStart.getHours();
			const ampm = hour >= 12 ? 'pm' : 'am';
			const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
			labels.push(`${h12}${ampm}`);

			let c = 0;
			let ic = 0;
			for (const log of logs) {
				const t = log.reviewedAt.getTime();
				if (t >= bucketStart.getTime() && t < bucketEnd.getTime()) {
					if (log.rating >= 2) c++;
					else ic++;
				}
			}
			correct.push(c);
			incorrect.push(ic);
		}

		return json({ labels, correct, incorrect });
	}

	// Daily — last 30 days, per-day buckets
	const since = new Date(now);
	since.setDate(since.getDate() - 29);
	since.setHours(0, 0, 0, 0);

	const logs = await prisma.reviewLog.findMany({
		where: { userId, reviewedAt: { gte: since } },
		select: { reviewedAt: true, rating: true }
	});

	const labels: string[] = [];
	const correct: number[] = [];
	const incorrect: number[] = [];

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	for (let i = 29; i >= 0; i--) {
		const day = new Date(now);
		day.setDate(day.getDate() - i);
		day.setHours(0, 0, 0, 0);
		const dayEnd = new Date(day);
		dayEnd.setDate(dayEnd.getDate() + 1);

		labels.push(`${months[day.getMonth()]} ${day.getDate()}`);

		let c = 0;
		let ic = 0;
		for (const log of logs) {
			const t = log.reviewedAt.getTime();
			if (t >= day.getTime() && t < dayEnd.getTime()) {
				if (log.rating >= 2) c++;
				else ic++;
			}
		}
		correct.push(c);
		incorrect.push(ic);
	}

	return json({ labels, correct, incorrect });
};
