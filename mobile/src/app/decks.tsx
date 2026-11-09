import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import {
  addDeckToLibrary,
  getDecks,
  removeDeckFromLibrary,
  type DeckInfo,
} from '../db';
import { colors, commonStyles } from '../components/theme';

/** The deck catalogue: every TOPIK level is its own deck, plus Non-TOPIK.
 * There is no "current" deck — the user adds any decks they want to
 * their library, and Learn and Review pull from all of them at once,
 * in dependency order. A deck with overlapping cards never duplicates:
 * a grammar point learned in one deck counts everywhere it appears. */
export default function DecksScreen() {
  const [decks, setDecks] = useState<DeckInfo[]>([]);

  useFocusEffect(
    useCallback(() => {
      setDecks(getDecks());
    }, []),
  );

  function addToLibrary(deck: DeckInfo) {
    addDeckToLibrary(deck.id);
    setDecks(getDecks());
  }

  function removeFromLibrary(deck: DeckInfo) {
    removeDeckFromLibrary(deck.id);
    setDecks(getDecks());
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>
      <Text style={commonStyles.title}>Decks</Text>
      <Text style={[commonStyles.subtitle, { marginTop: 6 }]}>
        Each TOPIK level is its own deck. Add the decks you want to your library — Learn and
        Review pull from all of them at once, in dependency order.
      </Text>
      {decks.map((deck) => {
        const available = deck.totalPoints > 0;
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
              {deck.inLibrary ? <Text style={styles.libraryBadge}>In your library ✓</Text> : null}
            </View>
            <Text style={commonStyles.muted}>{deck.description}</Text>
            <Text style={[commonStyles.muted, { marginTop: 6 }]}>
              {available
                ? `${deck.totalPoints} grammar points · ${deck.learnedPoints} learned · ${deck.dueCount} due`
                : 'No content yet.'}
            </Text>
            {available && !deck.inLibrary ? (
              <Pressable style={styles.selectButton} onPress={() => addToLibrary(deck)}>
                <Text style={styles.selectButtonText}>Add to library</Text>
              </Pressable>
            ) : null}
            {available && deck.inLibrary ? (
              <>
                <Pressable style={styles.selectButton} onPress={() => router.push('/learn')}>
                  <Text style={styles.selectButtonText}>Learn →</Text>
                </Pressable>
                <Pressable style={styles.removeButton} onPress={() => removeFromLibrary(deck)}>
                  <Text style={styles.removeButtonText}>Remove from library</Text>
                </Pressable>
              </>
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
  libraryBadge: {
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
  removeButton: {
    marginTop: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  removeButtonText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
});
