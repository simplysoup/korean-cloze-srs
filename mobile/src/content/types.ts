// Content types — mirrors prisma/seed-data/types.ts in the old app.
// The JSON in topik1-level1.json / topik1-level2.json is the verbatim
// port of that seed data (see scripts/port-content.ts).
export interface ClozeCardSeed {
  id: string;
  fullSentence: string;
  sentenceWithBlank: string;
  vocabBaseForm: string;
  answer: string;
  alternateAnswers: string[];
  // Plain English translation. No highlighting: English often has no
  // equivalent for Korean particles (은/는, 이/가, 을/를), so any
  // highlighted English word is a guess. (Build 25 removed it.)
  englishHint: string;
  introducedAtPosition: number;
  extraTargets?: { grammarPointId: string; wordReplacement: string; blankIndex: number }[];
}

export interface LessonExampleSeed {
  id: string;
  fullSentence: string;
  sentenceWithBlank: string;
  answer: string;
  englishHint: string;
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

export interface ContentBundle {
  provenance: string;
  source: string;
  deck: { id: string; title: string; slug: string; topikLevel: string; level: number };
  lessons: LessonSeed[];
}

export function flattenContent(bundle: ContentBundle): {
  lessons: LessonSeed[];
  grammarPoints: { gp: GrammarPointSeed; lessonNumber: number; lessonTitle: string; position: number }[];
} {
  const grammarPoints: { gp: GrammarPointSeed; lessonNumber: number; lessonTitle: string; position: number }[] = [];
  let position = 0;
  for (const lesson of bundle.lessons) {
    for (const gp of lesson.grammarPoints) {
      position += 1;
      grammarPoints.push({ gp, lessonNumber: lesson.lessonNumber, lessonTitle: lesson.title, position });
    }
  }
  return { lessons: bundle.lessons, grammarPoints };
}
