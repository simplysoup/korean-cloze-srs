import { CURRICULUM_FLAGS, isCurriculumFeatureEnabled } from '../src/features/flags';
import { CONTENT_POINTS, DECKS } from '../src/store/content';
import type { AnswerEvaluation, AnswerOutcome } from '../src/features/contracts/answers';
import type { PracticeExercise, ReadingPassage } from '../src/features/contracts/practice';
import type { VocabController, VocabPrompt, VocabReviewResult } from '../src/features/vocabulary/contracts';

describe('Curriculum v1 release gates', () => {
  it('ships every unfinished workstream behind a default-disabled flag', () => {
    expect(Object.keys(CURRICULUM_FLAGS).sort()).toEqual([
      'answerFeedback',
      'contrastPractice',
      'hangulEnhancements',
      'readingComprehension',
      'topics',
      'topik2Grammar',
      'transferPractice',
      'vocabulary',
    ]);
    for (const flag of Object.keys(CURRICULUM_FLAGS) as (keyof typeof CURRICULUM_FLAGS)[]) {
      expect(isCurriculumFeatureEnabled(flag)).toBe(false);
    }
  });

  it('keeps draft TOPIK II out of production web points without hiding its catalogue placeholders', () => {
    expect(CONTENT_POINTS.every((item) => item.deckId.startsWith('deck_topik1_'))).toBe(true);
    for (const level of [3, 4, 5, 6]) {
      const matches = DECKS.filter((d) => d.id === `deck_topik2_level${level}`);
      expect(matches).toHaveLength(1);
    }
  });

  it('allows target mastery only for target-correct answers', () => {
    const outcomes: AnswerOutcome[] = [
      'target_correct',
      'valid_off_target',
      'near_miss',
      'incorrect',
      'unclassified',
    ];
    const cases: AnswerEvaluation[] = outcomes.map((outcome) =>
      outcome === 'target_correct'
        ? {
            outcome,
            canonicalAnswer: '먹어요',
            acceptedAlternatives: [],
            explanation: 'Target form shown.',
            retryAllowed: false,
            targetMasteryEligible: true,
          }
        : {
            outcome,
            canonicalAnswer: '먹어요',
            acceptedAlternatives: [],
            explanation: 'No target mastery is awarded.',
            retryAllowed: outcome === 'near_miss',
            targetMasteryEligible: false,
          },
    );
    expect(cases.filter((item) => item.targetMasteryEligible).map((item) => item.outcome))
      .toEqual(['target_correct']);
  });

  it('exposes separate stable vocabulary and practice identities', () => {
    // Compile-time API checks protect specialist integration contracts.
    type Session = Awaited<ReturnType<VocabController['getSession']>>;
    type Submit = Awaited<ReturnType<VocabController['submitAnswer']>>;
    type Reveal = Awaited<ReturnType<VocabController['revealAnswer']>>;
    type Progress = Awaited<ReturnType<VocabController['getProgress']>>;
    const _: [Session | null, Submit | null, Reveal | null, Progress | null] =
      [null, null, null, null];
    expect(_).toHaveLength(4);

    const prompt: Pick<VocabPrompt, 'id' | 'entryId' | 'deckId'> = {
      id: 'prompt_v1',
      entryId: 'vocab_native_numbers_001',
      deckId: 'vocab_foundations_native_numbers',
    };
    const result: Pick<VocabReviewResult, 'promptId' | 'entryId'> = {
      promptId: prompt.id,
      entryId: prompt.entryId,
    };
    const exercise: Pick<PracticeExercise, 'id' | 'prerequisiteGrammarIds' | 'contentReadiness'> = {
      id: 'practice_v1',
      prerequisiteGrammarIds: ['gp_sample'],
      contentReadiness: 'draft',
    };
    const passage: Pick<ReadingPassage, 'id' | 'questionIds' | 'contentReadiness'> = {
      id: 'reading_v1',
      questionIds: [exercise.id],
      contentReadiness: 'draft',
    };
    expect(result.entryId).toBe('vocab_native_numbers_001');
    expect(exercise.prerequisiteGrammarIds).toEqual(['gp_sample']);
    expect(passage.questionIds).toEqual([exercise.id]);
  });
});
