import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import {
  addDeckToLibrary,
  getDecks,
  removeDeckFromLibrary,
  type DeckInfo,
} from '../store';
import { colors, commonStyles } from '../components/theme';

/** The deck catalogue: every TOPIK level is its own deck, plus Non-TOPIK.
 * There is no "current" deck — the user adds any decks they want to
 * their library, and Learn and Review pull from all of them at once,
 * in dependency order. A deck with overlapping cards never duplicates:
 * a grammar point learned in one deck counts everywhere it appears.
 *
 * Layout (build 24), modelled on Bunpro's Decks page but more
 * utilitarian: a grid of cards, not a list. Each card has a typographic
 * "cover" (the deck title in large type on pale grey, with a faint
 * level number at the right) and a thin red progress line along the
 * bottom edge of the cover, its width proportional to the learned
 * percentage — Bunpro's progress device, with no printed percentage.
 * The bottom panel holds the description, three stats in a row
 * (Points / Learned / Due, separated by vertical dividers), and the
 * library action. The cover links to the deck detail page. */
export default function DecksScreen() {
  const [decks, setDecks] = useState<DeckInfo[]>([]);
  // Responsive grid: the column count comes from the window width, and
  // each card gets an exact computed width. A flex-grow grid would let
  // the last card in an incomplete row stretch to full width (7 decks in
  // a 3-column grid leaves the 7th card alone on its row); exact widths
  // keep every card the same size at every width. 3 columns at >=900px
  // of content width, 2 at >=600px, 1 on a phone.
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.min(windowWidth, 1080) - 32;
  const columns = contentWidth >= 900 ? 3 : contentWidth >= 600 ? 2 : 1;
  const cardWidth = (contentWidth - (columns - 1) * GRID_GAP) / columns;

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
    <ScrollView style={commonStyles.screen} contentContainerStyle={styles.wideContent}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>
      <Text style={commonStyles.title}>Decks</Text>
      <Text style={[commonStyles.subtitle, { marginTop: 6 }]}>
        Each TOPIK level is its own deck. Add the decks you want to your library — Learn and
        Review pull from all of them at once, in dependency order.
      </Text>
      <View style={styles.grid}>
        {decks.map((deck) => {
          const available = deck.totalPoints > 0;
          const progressPct =
            available && deck.totalPoints > 0
              ? (deck.learnedPoints / deck.totalPoints) * 100
              : 0;
          return (
            <View
              key={deck.id}
              style={[styles.deckCard, { width: cardWidth }, !available && styles.deckCardSoon]}
            >
              <Link href={`/decks/${deck.id}`} asChild>
                <Pressable style={styles.cover}>
                  <Text style={styles.coverLevel} aria-hidden>
                    {deck.level}
                  </Text>
                  <Text style={styles.coverTitle}>{deck.title}</Text>
                  {deck.inLibrary ? (
                    <Text style={styles.libraryBadge}>In your library ✓</Text>
                  ) : null}
                  {available && progressPct > 0 ? (
                    <View style={[styles.progressLine, { width: `${progressPct}%` }]} />
                  ) : null}
                </Pressable>
              </Link>
              <View style={styles.panel}>
                <Text style={commonStyles.muted} numberOfLines={2}>
                  {deck.description}
                </Text>
                {available ? (
                  <View style={styles.stats}>
                    <View style={styles.stat}>
                      <Text style={styles.statNumber}>{deck.totalPoints}</Text>
                      <Text style={styles.statLabel}>Points</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                      <Text style={styles.statNumber}>{deck.learnedPoints}</Text>
                      <Text style={styles.statLabel}>Learned</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                      <Text style={styles.statNumber}>{deck.dueCount}</Text>
                      <Text style={styles.statLabel}>Due</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={[commonStyles.muted, { marginTop: 12 }]}>
                    Content coming soon.
                  </Text>
                )}
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
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const GRID_GAP = 16;

const styles = StyleSheet.create({
  // Wider than the standard 640px content column (which matches the
  // header/dashboard at 1080px), so the deck grid has room for three
  // columns on desktop. The column count and card width are computed
  // from the window width (see DecksScreen), so the grid forms 3
  // columns at 1080px, 2 at ~640px, and 1 on a phone, with no card
  // stretching to fill an incomplete row.
  wideContent: {
    width: '100%',
    maxWidth: 1080,
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 32,
  },
  back: {
    paddingVertical: 8,
    marginBottom: 4,
  },
  backText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    marginTop: 16,
  },
  deckCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    overflow: 'hidden',
  },
  deckCardSoon: {
    opacity: 0.75,
  },
  // Typographic "cover" (Bunpro's is an illustrated image; this is the
  // utilitarian stand-in): pale grey, the deck title in large type, a
  // faint level number at the right, and the red progress line along
  // the bottom edge.
  cover: {
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: 132,
    justifyContent: 'center',
    position: 'relative',
  },
  coverLevel: {
    position: 'absolute',
    right: 16,
    top: 8,
    fontSize: 64,
    fontWeight: '800',
    color: '#E2E2E2',
  },
  coverTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    maxWidth: '75%',
  },
  libraryBadge: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
    color: colors.green,
  },
  progressLine: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 4,
    backgroundColor: colors.primary,
  },
  panel: {
    padding: 16,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E4E4E4',
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
