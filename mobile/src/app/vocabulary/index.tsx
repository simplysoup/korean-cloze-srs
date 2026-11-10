import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import type { VocabDeckSummary } from '../../features/vocabulary/contracts';
import { VocabularyCatalogue } from '../../features/vocabulary/ui/DeckScreens';
import { VocabularyPage, VocabularyState } from '../../features/vocabulary/ui/Components';
import { useVocabularyRuntime } from '../../features/vocabulary/ui/VocabularyProvider';

export default function VocabularyIndexRoute() {
  const runtime = useVocabularyRuntime();
  const controller = runtime?.controller;
  const [decks, setDecks] = useState<readonly VocabDeckSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  const reload = useCallback(() => setRefresh((n) => n + 1), []);
  useEffect(() => {
    if (!controller) return;
    let mounted = true;
    Promise.resolve().then(() => controller.listDecks())
      .then((value) => { if (mounted) { setDecks(value); setError(null); } })
      .catch((cause: unknown) => {
        if (mounted) setError(cause instanceof Error ? cause.message : 'Could not load decks.');
      });
    return () => { mounted = false; };
  }, [controller, refresh]);

  if (!controller) return (
    <VocabularyPage title="Vocabulary">
      <VocabularyState title="Vocabulary is not connected yet"
        description="The vocabulary controller must be mounted by the integration lead before review is available." />
    </VocabularyPage>
  );
  if (error) return (
    <VocabularyPage title="Vocabulary">
      <VocabularyState title="Could not load vocabulary decks" description={error} retry={reload} />
    </VocabularyPage>
  );
  if (!decks) return (
    <VocabularyPage title="Vocabulary">
      <VocabularyState title="Loading vocabulary decks" loading />
    </VocabularyPage>
  );
  return <VocabularyCatalogue decks={decks}
    openDeck={(id) => router.push({ pathname: '/vocabulary/[deckId]', params: { deckId: id } })} />;
}
