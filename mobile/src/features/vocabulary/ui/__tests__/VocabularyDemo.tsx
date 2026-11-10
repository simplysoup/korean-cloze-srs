/**
 * Manual visual harness only. Import VocabularyDemo into a temporary local
 * development route to inspect the real UI components. Never ship this route
 * or substitute this mock for the VocabController in production.
 */
import { useState } from 'react';
import type {
  VocabController, VocabDeckSummary, VocabProgress, VocabPrompt, VocabReviewResult,
} from '../../contracts';
import type { AnswerEvaluation } from '../../../contracts/answers';
import { VocabularyCatalogue, VocabularyDeckDetail } from '../DeckScreens';
import { VocabularySessionScreen } from '../SessionScreen';
import { advanceSession, createSession, repeatMissed, retryNearMiss, withFeedback } from '../session-state';

const deck: VocabDeckSummary = {
  id: 'vocab_foundations_native_numbers', title: 'Native Korean numbers',
  description: 'Recognize native forms and select shortened counter forms.',
  sortOrder: 0, totalEntries: 15, learnedEntries: 2, dueEntries: 1,
  contentReadiness: 'draft',
};
const prompt: VocabPrompt = {
  id: 'demo-native-one-counter', deckId: deck.id,
  entryId: 'vocab_native_numbers_001', mode: 'learn',
  direction: 'english_to_korean', cue: 'one (apple)',
  contextEnglish: 'Complete: one apple · native numbers · before a counter',
  canonicalAnswer: '한', acceptedAlternatives: [],
  explanation: 'Before a counter, 하나 is shortened to 한.',
  contentReadiness: 'draft',
};
const row: VocabProgress = {
  entryId: prompt.entryId, deckId: deck.id, state: 'review',
  dueAt: null, lastReviewedAt: null, reviewCount: 1, lapseCount: 0,
  stability: 1, difficulty: 5,
};
const fake: VocabController = {
  listDecks: async () => [deck],
  getSession: async () => [prompt],
  getProgress: async () => [row],
  submitAnswer: async (_id, answer) => {
    const evaluation: AnswerEvaluation = answer === '한'
      ? {
        outcome: 'target_correct', targetMasteryEligible: true,
        canonicalAnswer: '한', acceptedAlternatives: [],
        explanation: prompt.explanation, retryAllowed: false,
      } : answer === '하나'
      ? {
        outcome: 'near_miss', targetMasteryEligible: false,
        canonicalAnswer: '한', acceptedAlternatives: [],
        explanation: '하나 is the standalone form; use 한 before a counter.',
        retryAllowed: true, errorType: 'other',
      } : {
        outcome: 'incorrect', targetMasteryEligible: false,
        canonicalAnswer: '한', acceptedAlternatives: [],
        explanation: prompt.explanation, retryAllowed: false,
      };
    return {
      promptId: prompt.id, entryId: prompt.entryId,
      evaluation, progress: null, attemptedAt: new Date().toISOString(),
    } satisfies VocabReviewResult;
  },
  revealAnswer: async () => ({
    promptId: prompt.id, canonicalAnswer: prompt.canonicalAnswer,
    acceptedAlternatives: [], explanation: prompt.explanation,
    awardsMastery: false as const,
  }),
};

/** Mocked visual walkthrough: deck list → detail → introduction → review. */
export function VocabularyDemo() {
  const [page, setPage] = useState<'catalogue' | 'detail' | 'session'>('catalogue');
  const [state, setState] = useState(createSession('learn', deck.id, [prompt]));
  if (page === 'catalogue') return (
    <VocabularyCatalogue decks={[deck]} openDeck={() => setPage('detail')} />
  );
  if (page === 'detail') return (
    <VocabularyDeckDetail deck={deck} progress={[row]}
      onBack={() => setPage('catalogue')}
      onStart={(mode) => {
        setState(createSession(mode, deck.id, [prompt]));
        setPage('session');
      }} />
  );
  return (
    <VocabularySessionScreen
      state={state} deckTitle={deck.title} saving={false} error={null}
      submit={(answer) => { void fake.submitAnswer(prompt.id, answer)
        .then((result) => setState((prior) => withFeedback(prior, { kind: 'graded', result }))); }}
      reveal={() => { void fake.revealAnswer(prompt.id)
        .then((result) => setState((prior) => withFeedback(prior, { kind: 'revealed', result }))); }}
      next={() => setState((prior) => advanceSession(prior))}
      retry={() => setState((prior) => retryNearMiss(prior))}
      leave={() => setPage('detail')}
      reviewMissed={() => setState((prior) => repeatMissed(prior))}
    />
  );
}
