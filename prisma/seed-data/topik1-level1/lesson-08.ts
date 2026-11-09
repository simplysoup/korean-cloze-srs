import type { LessonSeed } from '../types';
import { foundationPoints } from './foundations';

// Lesson 8 — Minutes, Quantities and Prices
// Positions 34–39
// 34. bun_minute
// 35. gae_counter
// 36. myeong_counter
// 37. mari_counter
// 38. myeot
// 39. eolma
export const lesson08: LessonSeed = {
	lessonNumber: 8,
	title: "Minutes, Quantities and Prices",
	grammarPoints: [
		// 34. gp_bun_minute
		foundationPoints.gp_bun_minute,

		// 35. gp_gae_counter
		foundationPoints.gp_gae_counter,

		// 36. gp_myeong_counter
		foundationPoints.gp_myeong_counter,

		// 37. gp_mari_counter
		foundationPoints.gp_mari_counter,

		// 38. gp_myeot
		foundationPoints.gp_myeot,

		// 39. gp_eolma
		foundationPoints.gp_eolma
	]
};
