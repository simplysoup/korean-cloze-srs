// ══════════════════════════════════════════════════════════════════════════════
// Shared types for seed data modules
// ══════════════════════════════════════════════════════════════════════════════

export interface EnglishHintPart {
	text: string;
	highlightType: 'none' | 'direct' | 'related';
}

export interface ClozeCardSeed {
	id: string;
	fullSentence: string;
	sentenceWithBlank: string;
	vocabBaseForm: string;
	answer: string;
	alternateAnswers: string[];
	englishHint: EnglishHintPart[];
	/** Curriculum position of the most-advanced GP this card tests.
	 *  For single-target cards, equals the owning GP's position. */
	introducedAtPosition: number;
	/** Additional grammar targets beyond the primary GP (multi-target cards). */
	extraTargets?: { grammarPointId: string; wordReplacement: string; blankIndex: number }[];
}

export interface LessonExampleSeed {
	id: string;
	fullSentence: string;
	sentenceWithBlank: string;
	answer: string;
	englishHint: EnglishHintPart[];
	order: number;
	notes?: string;
}

export interface NoteSeed {
	type: 'caution' | 'funfact' | 'tip';
	title: string;
	content: string;
}

export interface GrammarPointSeed {
	id: string;
	title: string;
	category: string;
	tense: string | null;
	register: string | null;
	hint: string;
	description: string;
	level: number;
	tags: string[];
	structurePattern: string | null;
	notes: NoteSeed[] | null;
	relatedPointIds?: string[];
	cards: ClozeCardSeed[];
	lessonExamples: LessonExampleSeed[];
}

export interface LessonSeed {
	lessonNumber: number;
	title: string;
	grammarPoints: GrammarPointSeed[];
}
