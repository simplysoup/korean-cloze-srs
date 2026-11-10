import { StyleSheet, Text, View } from 'react-native';
import type { VocabDeckSummary, VocabProgress } from '../contracts';
import { getFoundationDeck } from './content';
import { deckCounts } from './presentation';
import { CountChip, VocabButton, VocabularyPage, VocabularyPanel, VocabularyState, vocabStyles } from './Components';
import { colors } from '../../../components/theme';

export function VocabularyCatalogue({
  decks, openDeck,
}: {
  decks: readonly VocabDeckSummary[];
  openDeck: (id: string) => void;
}) {
  const sorted = [...decks].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <VocabularyPage
      title="Vocabulary"
      subtitle="Build your words separately from grammar. Explore the seven starter decks and review at your own pace."
    >
      {sorted.length === 0 ? (
        <VocabularyState
          title="No vocabulary decks yet"
          description="The starter decks have not been loaded for this account."
        />
      ) : sorted.map((deck) => (
        <VocabularyPanel key={deck.id}>
          <Text style={styles.deckTitle} accessibilityRole="header">{deck.title}</Text>
          <Text style={vocabStyles.muted}>{deck.description || getFoundationDeck(deck.id)?.deck.goal || ''}</Text>
          <View style={vocabStyles.row}>
            <CountChip label="Entries" value={deck.totalEntries} />
            <CountChip label="Due" value={deck.dueEntries} />
            <CountChip label="Learned" value={deck.learnedEntries} />
          </View>
          {deck.contentReadiness === 'blocked' ? (
            <Text style={styles.warning}>This deck is temporarily unavailable for review.</Text>
          ) : deck.contentReadiness !== 'educator_approved' ? (
            <Text style={styles.reviewNote}>Teaching content is undergoing educator review.</Text>
          ) : null}
          <VocabButton
            label={'View ' + deck.title}
            onPress={() => openDeck(deck.id)}
            variant="secondary"
            testID={'vocab-deck-' + deck.id}
          />
        </VocabularyPanel>
      ))}
    </VocabularyPage>
  );
}

export function VocabularyDeckDetail({
  deck, progress, onBack, onStart,
}: {
  deck: VocabDeckSummary;
  progress: readonly VocabProgress[];
  onBack: () => void;
  onStart: (mode: 'learn' | 'review' | 'missed') => void;
}) {
  const counts = deckCounts(deck, progress);
  const foundation = getFoundationDeck(deck.id);
  const hasMissed = progress.some((row) => row.lapseCount > 0);
  const blocked = deck.contentReadiness === 'blocked';

  return (
    <VocabularyPage
      title={deck.title}
      subtitle={deck.description || foundation?.deck.goal || 'Foundation vocabulary'}
      back={<View style={styles.back}><VocabButton label="← All vocabulary decks" onPress={onBack} variant="quiet" /></View>}
    >
      <VocabularyPanel>
        <Text style={vocabStyles.sectionTitle}>Deck progress</Text>
        <View style={vocabStyles.row}>
          <CountChip label="Total" value={counts.total} />
          <CountChip label="New" value={counts.new} />
          <CountChip label="Due" value={counts.due} />
          <CountChip label="Learned" value={counts.learned} />
        </View>
        <Text style={vocabStyles.muted}>
          Vocabulary progress is independent of your grammar review and mastery.
        </Text>
      </VocabularyPanel>

      <VocabularyPanel>
        <Text style={vocabStyles.sectionTitle}>Study this deck</Text>
        {blocked ? (
          <Text style={styles.warning}>This deck is blocked pending content review.</Text>
        ) : counts.total === 0 ? (
          <VocabularyState title="No entries in this deck" description="Check back after content is added." />
        ) : (
          <>
            <VocabButton label="Learn new words" onPress={() => onStart('learn')} disabled={counts.new === 0} />
            <VocabButton label={'Review due words (' + counts.due + ')'} onPress={() => onStart('review')} disabled={counts.due === 0} variant="secondary" />
            <VocabButton label="Review missed words" onPress={() => onStart('missed')} disabled={!hasMissed} variant="secondary" />
            {counts.new === 0 ? <Text style={vocabStyles.muted}>All entries have been introduced.</Text> : null}
          </>
        )}
      </VocabularyPanel>

      {foundation?.entries.length ? (
        <VocabularyPanel>
          <Text style={vocabStyles.sectionTitle}>What you'll practice</Text>
          <Text style={vocabStyles.body}>{foundation.deck.goal}</Text>
          <Text style={vocabStyles.muted}>
            Examples distinguish the Korean number systems, counter forms and usage contexts.
          </Text>
        </VocabularyPanel>
      ) : null}
    </VocabularyPage>
  );
}

const styles = StyleSheet.create({
  deckTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
  warning: { color: colors.redDark, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  reviewNote: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  back: { alignItems: 'flex-start', marginBottom: 4 },
});
