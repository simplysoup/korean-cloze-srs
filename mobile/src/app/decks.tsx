import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import { getActiveDeckId, getDecks, setActiveDeckId, type DeckInfo } from '../db';
import { colors, commonStyles } from '../components/theme';

/** The deck catalogue: every TOPIK level is its own deck, plus Non-TOPIK.
 * The user chooses a deck here; Learn and Review then use the active one. */
export default function DecksScreen() {
  const [decks, setDecks] = useState<DeckInfo[]>([]);
  const [activeDeckId, setActiveDeckIdState] = useState('');

  useFocusEffect(
    useCallback(() => {
      setDecks(getDecks());
      setActiveDeckIdState(getActiveDeckId());
    }, []),
  );

  function selectDeck(deck: DeckInfo) {
    setActiveDeckId(deck.id);
    setActiveDeckIdState(deck.id);
    router.push('/learn');
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>
      <Text style={commonStyles.title}>Decks</Text>
      <Text style={[commonStyles.subtitle, { marginTop: 6 }]}>
        Each TOPIK level is its own deck. Choose one to learn — Learn and Review use the active
        deck.
      </Text>
      {decks.map((deck) => {
        const available = deck.totalPoints > 0;
        const isCurrent = deck.id === activeDeckId;
        return (
          <View
            key={deck.id}
            style={[commonStyles.card, styles.deckCard, !available && styles.deckCardSoon]}
          >
            <View style={styles.deckHeader}>
              <Link href={`/decks/${deck.id}`} asChild>
                <Pressable>
                  <Text style={[styles.deckTitle, styles.deckTitleLink]}>{deck.title}</Text>
                </Pressable>
              </Link>
              {isCurrent ? <Text style={styles.currentBadge}>Current deck ✓</Text> : null}
            </View>
            <Text style={commonStyles.muted}>{deck.description}</Text>
            <Text style={[commonStyles.muted, { marginTop: 6 }]}>
              {available
                ? `${deck.totalPoints} grammar points · ${deck.learnedPoints} learned · ${deck.dueCount} due`
                : 'No content yet.'}
            </Text>
            {available && !isCurrent ? (
              <Pressable style={styles.selectButton} onPress={() => selectDeck(deck)}>
                <Text style={styles.selectButtonText}>Select deck</Text>
              </Pressable>
            ) : null}
            {available && isCurrent ? (
              <Pressable style={styles.selectButton} onPress={() => router.push('/learn')}>
                <Text style={styles.selectButtonText}>Learn →</Text>
              </Pressable>
            ) : null}
            {!available ? (
              <Text style={[commonStyles.muted, { marginTop: 8 }]}>Content coming soon.</Text>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: {
    paddingVertical: 8,
    marginBottom: 4,
  },
  backText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  deckCard: {
    marginTop: 12,
  },
  deckCardSoon: {
    opacity: 0.75,
  },
  deckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  deckTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  deckTitleLink: {
    color: colors.primary,
  },
  currentBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.green,
  },
  selectButton: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
