import { useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { getFoundationDeck } from '../../features/vocabulary/ui/content';
import { VocabularyPage, VocabularyState } from '../../features/vocabulary/ui/Components';
import { useVocabularyRuntime } from '../../features/vocabulary/ui/VocabularyProvider';
import { VocabularySessionScreen } from '../../features/vocabulary/ui/SessionScreen';
import { sessionKey } from '../../features/vocabulary/ui/session-state';
import type { VocabularyMode } from '../../features/vocabulary/ui/presentation';

export default function VocabularySessionRoute() {
  const params = useLocalSearchParams<{ mode?: string; deckId?: string }>();
  const validMode: VocabularyMode | null = params.mode === 'learn' ||
    params.mode === 'review' || params.mode === 'missed' ? params.mode : null;
  const deckId = typeof params.deckId === 'string' ? params.deckId : null;
  const runtime = useVocabularyRuntime();
  const openSession = runtime?.openSession;
  const controller = runtime?.controller;

  useEffect(() => {
    if (!validMode || !controller || !openSession) return;
    void openSession(validMode, deckId);
  }, [validMode, deckId, controller, openSession]);

  const leave = () => {
    if (deckId) router.push({ pathname: '/vocabulary/[deckId]', params: { deckId } });
    else router.push('/vocabulary');
  };

  if (!controller) return (
    <VocabularyPage title="Vocabulary review">
      <VocabularyState title="Vocabulary is not connected"
        description="The integration lead must supply a VocabController before a session can begin." />
    </VocabularyPage>
  );
  if (!validMode) return (
    <VocabularyPage title="Vocabulary review">
      <VocabularyState title="Invalid session mode"
        description="Choose Learn, Review or Missed from a vocabulary deck." />
    </VocabularyPage>
  );

  const state = runtime?.session;
  if (runtime?.error && (!state || state.key !== sessionKey(validMode, deckId))) return (
    <VocabularyPage title="Vocabulary review">
      <VocabularyState title="Could not open session" description={runtime.error}
        retry={() => void openSession?.(validMode, deckId)} />
    </VocabularyPage>
  );
  if (!state || state.key !== sessionKey(validMode, deckId) || runtime?.loading) return (
    <VocabularyPage title="Vocabulary review">
      <VocabularyState title="Loading your session" loading />
    </VocabularyPage>
  );
  return (
    <VocabularySessionScreen
      state={state}
      deckTitle={deckId ? getFoundationDeck(deckId)?.deck.title ?? 'Vocabulary' : 'All vocabulary'}
      saving={runtime.saving}
      error={runtime.error}
      submit={(answer) => void runtime.submit(answer)}
      reveal={() => void runtime.reveal()}
      next={runtime.next}
      retry={runtime.retry}
      leave={leave}
      retrySave={() => runtime.clearError()}
      reviewMissed={() => {
        runtime.reviewMissed();
        router.replace({ pathname: '/vocabulary/session',
          params: { mode: 'missed', ...(deckId ? { deckId } : {}) } });
      }}
    />
  );
}
