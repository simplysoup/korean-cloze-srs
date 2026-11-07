/**
 * User-level system.
 *
 * XP = total review-log entries × 10
 * Each level N requires N × 100 XP to advance to level N+1.
 *   Level 1→2 :   100 XP  (10 reviews)
 *   Level 2→3 :   200 XP  (20 reviews)
 *   Level 3→4 :   300 XP  (30 reviews)
 *   …
 */

export interface UserLevel {
	/** Current level (1-based) */
	level: number;
	/** XP earned within the current level */
	currentXP: number;
	/** XP required to reach the next level */
	xpForNextLevel: number;
	/** 0–100 progress percentage within the current level */
	progress: number;
	/** Lifetime XP */
	totalXP: number;
}

const XP_PER_REVIEW = 10;

export function calculateLevel(totalReviews: number): UserLevel {
	const totalXP = totalReviews * XP_PER_REVIEW;
	let level = 1;
	let cumulative = 0;

	while (true) {
		const needed = level * 100;
		if (cumulative + needed > totalXP) {
			const currentXP = totalXP - cumulative;
			return {
				level,
				currentXP,
				xpForNextLevel: needed,
				progress: needed > 0 ? (currentXP / needed) * 100 : 0,
				totalXP
			};
		}
		cumulative += needed;
		level++;
	}
}
