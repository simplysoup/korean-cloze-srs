import type { LessonSeed, GrammarPointSeed, NoteSeed } from '../types';
import type { TeachingGuide } from './types';
import { level1Guides } from './level1';
import { level2Guides } from './level2';

export type { TeachingGuide } from './types';
/** All 102 authored explanations; every grammar point must have a guide. */
export const teachingGuides: Record<string, TeachingGuide> = {
  ...level1Guides,
  ...level2Guides,
};

/**
 * The app and porting scripts already read LessonSeed.description and .notes.
 * Enrich at the lesson boundary so no DB, UI or schema changes are required.
 * Original IDs, examples, cards, positions, tags and related points remain intact.
 */
export function teachLesson(lesson: LessonSeed): LessonSeed {
  return {
    ...lesson,
    grammarPoints: lesson.grammarPoints.map((gp: GrammarPointSeed): GrammarPointSeed => {
      const guide = teachingGuides[gp.id];
      if (!guide) throw new Error(`Missing grammar teaching guide for ${gp.id}`);

      const workedExample = gp.lessonExamples[0];
      if (!workedExample) throw new Error(`No worked example for ${gp.id}`);
      const lessonNotes: NoteSeed[] = [
        { type: 'tip', title: 'Build it step by step', content: guide.formation },
        {
          type: 'tip', title: 'Worked example',
          content: `${workedExample.fullSentence} — ${workedExample.englishHint} ${guide.worked}`,
        },
        { type: 'caution', title: 'Common trap', content: guide.trap },
      ];
      return {
        ...gp,
        description: guide.meaning,
        notes: [...lessonNotes, ...(gp.notes ?? [])],
      };
    }),
  };
}
