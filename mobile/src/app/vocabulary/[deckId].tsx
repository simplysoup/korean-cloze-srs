import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import type { VocabDeckSummary, VocabProgress } from '../../features/vocabulary/contracts';
import { VocabularyDeckDetail } from '../../features/vocabulary/ui/DeckScreens';
import { VocabularyPage, VocabularyState } from '../../features/vocabulary/ui/Components';
import { useVocabularyRuntime } from '../../features/vocabulary/ui/VocabularyProvider';

export default function VocabularyDeckRoute() {
  const { deckId: rawDeckId } = useLocalSearchParams<{ deckId: string }>();
  const deckId = typeof rawDeckId === 'string' ? rawDeckId : '';
  const controller = useVocabularyRuntime()?.controller;
  const [deck, setDeck] = useState<VocabDeckSummary | null>(null);
  const [progress, setProgress] = useState<readonly VocabProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!controller || !deckId) return;
    let mounted = true;
    Promise.all([controller.listDecks(), controller.getProgress(deckId)])
      .then(([decks, rows]) => {
        if (!mounted) return;
        setDeck(decks.find((item) => item.id === deckId) ?? null);
        setProgress(rows);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (mounted) setError(cause instanceof Error ? cause.message : 'Could not load this deck.');
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [controller, deckId, refresh]);

  const back = () => router.push('/vocabulary');
  if (!controller) return (
    <VocabularyPage title="Vocabulary deck">
      <VocabularyState title="Vocabulary is not connected" description="The real vocabulary controller has not been supplied." />
    </VocabularyPage>
  );
  if (!deckId) return (
    <VocabularyPage title="Vocabulary deck">
      <VocabularyState title="Invalid deck link" description="Select a deck from the catalogue." />
    </VocabularyPage>
  );
  if (loading) return (
    <VocabularyPage title="Vocabulary deck">
      <VocabularyState title="Loading deck" loading />
    </VocabularyPage>
  );
  if (error) return (
    <VocabularyPage title="Vocabulary deck">
      <VocabularyState title="Could not open deck" description={error}
        retry={() => { setLoading(true); setRefresh((n) => n + 1); }} />
    </VocabularyPage>
  );
  if (!deck) return (
    <VocabularyPage title="Vocabulary deck">
      <VocabularyState title="Deck not found" description="It may have moved or been removed." />
    </VocabularyPage>
  );
  return (
    <VocabularyDeckDetail deck={deck} progress={progress} onBack={back}
      onStart={(mode) => router.push({ pathname: '/vocabulary/session',
        params: { deckId, mode } })} />
  );
}
