/**
 * TOPIK Level Naming Convention
 *
 * TOPIK I  — Beginner   (Level 1, Level 2)
 * TOPIK II — Intermediate/Advanced (Level 3–6)
 */

export interface TopikLevelInfo {
	value: string;
	display: string;
	short: string;
}

export const TOPIK_LEVELS: TopikLevelInfo[] = [
	{ value: 'topik1-1', display: 'TOPIK I · Level 1', short: 'T1·L1' },
	{ value: 'topik1-2', display: 'TOPIK I · Level 2', short: 'T1·L2' },
	{ value: 'topik2-3', display: 'TOPIK II · Level 3', short: 'T2·L3' },
	{ value: 'topik2-4', display: 'TOPIK II · Level 4', short: 'T2·L4' },
	{ value: 'topik2-5', display: 'TOPIK II · Level 5', short: 'T2·L5' },
	{ value: 'topik2-6', display: 'TOPIK II · Level 6', short: 'T2·L6' }
];

export function getTopikDisplay(value: string): string {
	return TOPIK_LEVELS.find((l) => l.value === value)?.display ?? value;
}

export function getTopikShort(value: string): string {
	return TOPIK_LEVELS.find((l) => l.value === value)?.short ?? value;
}

/** Map legacy numeric level (1–6) to topik level value */
export function levelToTopikValue(level: number): string {
	if (level <= 2) return `topik1-${level}`;
	return `topik2-${level}`;
}
