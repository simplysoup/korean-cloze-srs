/** Pure adapter to Agent 00's frozen controller DTOs. Does NOT implement persistence. */
import type { AnswerEvaluation } from '../../contracts/answers';
import type { VocabDeckSummary, VocabProgress as VocabProgressDto,
  VocabPrompt, VocabPromptDirection, VocabSessionMode } from '../contracts';
import { type VocabularyLibrary, type VocabularyEntry } from './content';
import { type LexicalFeedback, type LexicalPrompt } from './answers';
import { getReviewProgress, type VocabProgress, type VocabularyReviewProgress } from './progress';

export function toControllerVocabularyPrompt(prompt: LexicalPrompt, entry: VocabularyEntry,
  sessionMode: VocabSessionMode): VocabPrompt {
  const canonicalAnswer = prompt.acceptedAnswers[0] ?? '';
  const direction: VocabPromptDirection = prompt.context === 'standalone'
    ? (prompt.mode === 'recognition' ? 'korean_to_english' : 'english_to_korean') : 'context';
  return {
    id: `lexical:${entry.id}:${prompt.mode}:${prompt.context}`,
    entryId: entry.id, deckId: entry.deckId, mode: sessionMode, direction,
    cue: prompt.question,
    contextKorean: entry.usageExample.korean,
    contextEnglish: entry.usageExample.english,
    canonicalAnswer,
    acceptedAlternatives: prompt.acceptedAnswers.slice(1).map(answer => ({ answer })),
    explanation: [entry.usageNote, `${entry.usageExample.korean} — ${entry.usageExample.english}`]
      .filter(Boolean).join(' '),
    contentReadiness: 'draft', // Validated source is NOT educator-approved.
  };
}

export function toControllerAnswerEvaluation(feedback: LexicalFeedback): AnswerEvaluation {
  const acceptedAlternatives = feedback.acceptedAnswers.slice(1).map(answer => ({ answer }));
  const explanation = [feedback.hint, feedback.usageNote,
    `${feedback.usageExample.korean} — ${feedback.usageExample.english}`].filter(Boolean).join(' ');
  const base = {
    canonicalAnswer: feedback.acceptedAnswers[0] ?? '', acceptedAlternatives, explanation,
    retryAllowed: feedback.outcome === 'near' && !!feedback.hint,
  };
  if (feedback.correct) return { ...base, outcome: 'target_correct', targetMasteryEligible: true };
  if (feedback.outcome === 'near') return {
    ...base, outcome: 'near_miss', targetMasteryEligible: false,
    errorType: 'other',
  };
  // Unknown or unsupported alternatives are not presumed linguistically wrong.
  return { ...base, outcome: 'unclassified', targetMasteryEligible: false };
}

function stateName(card: VocabularyReviewProgress | undefined): VocabProgressDto['state'] {
  if (!card) return 'new';
  if (card.fsrs.state === 1) return 'learning';
  if (card.fsrs.state === 3) return 'relearning';
  if (card.fsrs.state === 2 && card.fsrs.stability >= 180) return 'mastered';
  return 'review';
}

/** Frozen DTO has one progress row per entry, while engine has two FSRS directions.
 * Project conservatively: earliest due, weakest state, min stability, max difficulty.
 * The engine's richer serialized progress MUST be stored separately by Agent 00.
 */
export function toControllerVocabularyProgress(library: VocabularyLibrary, progress: VocabProgress,
  entryId: string): VocabProgressDto | null {
  const entry = library.entries[entryId];
  if (!entry) return null;
  const a = getReviewProgress(progress, entryId, 'recognition');
  const b = getReviewProgress(progress, entryId, 'production');
  const reviews = [a, b].filter((x): x is VocabularyReviewProgress => Boolean(x));
  const both = reviews.length === 2;
  const earliestDue = reviews.map(r => r.fsrs.due).sort()[0] ?? null;
  const mostRecent = reviews.map(r => r.fsrs.lastReview).filter((s): s is string => !!s).sort().at(-1) ?? null;
  const state: VocabProgressDto['state'] = !both && reviews.length > 0 ? 'learning'
    : reviews.length === 0 ? 'new'
    : reviews.some(r => stateName(r) === 'learning' || stateName(r) === 'relearning') ? 'learning'
    : reviews.every(r => stateName(r) === 'mastered') ? 'mastered' : 'review';
  return { entryId, deckId: entry.deckId, state, dueAt: earliestDue,
    lastReviewedAt: mostRecent, reviewCount: reviews.reduce((sum, r) => sum + r.fsrs.reps, 0),
    lapseCount: reviews.reduce((sum, r) => sum + r.fsrs.lapses, 0),
    stability: reviews.length ? Math.min(...reviews.map(r => r.fsrs.stability)) : 0,
    difficulty: reviews.length ? Math.max(...reviews.map(r => r.fsrs.difficulty)) : 0 };
}

export function toControllerDeckSummaries(library: VocabularyLibrary, progress: VocabProgress,
  now: Date): VocabDeckSummary[] {
  return library.decks.map(deck => ({
    id: deck.id, title: deck.title, description: deck.goal, sortOrder: deck.sortOrder,
    totalEntries: deck.entryIds.length,
    learnedEntries: deck.entryIds.filter(id => getReviewProgress(progress, id, 'recognition')
      && getReviewProgress(progress, id, 'production')).length,
    dueEntries: deck.entryIds.filter(id => {
      const a = getReviewProgress(progress, id, 'recognition');
      const b = getReviewProgress(progress, id, 'production');
      return (a && Date.parse(a.fsrs.due) <= now.getTime()) || (b && Date.parse(b.fsrs.due) <= now.getTime());
    }).length,
    contentReadiness: 'draft',
  }));
}
