import type {
  VocabDeckSummary, VocabProgress, VocabPrompt, VocabPromptDirection,
} from '../contracts';
import type { AnswerEvaluation, AcceptedAnswerAlternative } from '../../contracts/answers';
import type { FoundationEntry } from './content';

export type VocabularyMode = 'learn' | 'review' | 'missed';

export function deckCounts(deck: VocabDeckSummary, progress: readonly VocabProgress[]) {
  const encountered = new Set(
    progress.filter((row) => row.state !== 'new').map((row) => row.entryId),
  );
  return {
    total: deck.totalEntries,
    learned: deck.learnedEntries,
    due: deck.dueEntries,
    new: Math.max(0, deck.totalEntries - encountered.size),
  };
}

export function directionLabel(direction: VocabPromptDirection): string {
  if (direction === 'korean_to_english') return 'Recognition · Korean → English';
  if (direction === 'english_to_korean') return 'Production · English → Korean';
  return 'Context · Korean in use';
}

export function feedbackLabel(evaluation: AnswerEvaluation): string {
  switch (evaluation.outcome) {
    case 'target_correct': return 'Correct';
    case 'valid_off_target': return 'Valid Korean, but not the target here';
    case 'near_miss': return 'Nearly right — check the detail';
    case 'incorrect': return 'Not quite';
    default: return 'Needs review';
  }
}

export function isSuccessfulRecall(evaluation: AnswerEvaluation): boolean {
  return evaluation.outcome === 'target_correct' && evaluation.targetMasteryEligible;
}

/** Never infer variants from dictionary forms; only the evaluator can approve them. */
export function verifiedAlternatives(
  alternatives: readonly AcceptedAnswerAlternative[],
): readonly AcceptedAnswerAlternative[] {
  const seen = new Set<string>();
  return alternatives.filter((item) => {
    const value = item.answer.trim();
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/** A labelled deck is essential when a generic gloss like "one" has two systems. */
export function promptContext(
  prompt: VocabPrompt,
  deckTitle: string,
  entry: FoundationEntry | null,
): string[] {
  const parts = [deckTitle];
  // Recognition must not expose the English answer in its context.
  // Production must not expose the Korean answer in its example.
  if (prompt.contextKorean) {
    parts.push(prompt.direction === 'korean_to_english'
      ? prompt.contextKorean
      : prompt.contextKorean.split(prompt.canonicalAnswer).join('___'));
  }
  if (prompt.contextEnglish && prompt.direction !== 'korean_to_english') {
    parts.push(prompt.contextEnglish);
  }
  if (!prompt.contextKorean && !prompt.contextEnglish && entry?.usageExample) {
    parts.push(prompt.direction === 'korean_to_english'
      ? entry.usageExample.korean
      : entry.usageExample.english);
  }
  if (entry?.variant && prompt.canonicalAnswer === entry.variant) {
    parts.push('Shortened form in its example context');
  } else if (entry?.variant && prompt.canonicalAnswer === entry.front) {
    parts.push('Standalone form (not before a counter)');
  }
  return parts;
}

/** Selection affects display only: no session queue or schedule mutation. */
export function filterDeckPrompts(
  prompts: readonly VocabPrompt[],
  deckId: string | null,
  missedIds?: ReadonlySet<string>,
): VocabPrompt[] {
  return prompts.filter((prompt) =>
    (!deckId || prompt.deckId === deckId) &&
    prompt.contentReadiness !== 'blocked' &&
    (!missedIds || missedIds.has(prompt.entryId)),
  );
}
