import { useCallback, useState } from 'react';
import { Link, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  addDeckToLibrary,
  getDashboardStats,
  getDecks,
  getUserSettings,
  isDeckInLibrary,
  removeDeckFromLibrary,
  type DeckInfo,
} from '../../db';
import { colors, commonStyles } from '../../components/theme';

/**
 * Deck detail page — Bunpro's deck page, cut to what exists: title and
 * description, Learn/Review buttons, lesson rows with learned counts, and
 * a Details panel. There is no "current" deck and no per-deck settings:
 * the daily goal and batch size live in Settings and apply to the whole
 * library. Learning this deck adds it to the library first.
 */

export default function DeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const deckId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const [deck, setDeck] = useState<DeckInfo | null>(null);
  const [lessons, setLessons] = useState<
    { lessonNumber: number; lessonTitle: string; learned: number; total: number }[]
  >([]);
  const [inLibrary, setInLibrary] = useState(false);
  const [batchSize, setBatchSize] = useState(5);

  const load = useCallback(() => {
    if (!deckId) return;
    const found = getDecks().find((d) => d.id === deckId) ?? null;
    setDeck(found);
    const level = getDashboardStats().levelProgress.find((l) => l.deckId === deckId);
    setLessons(level?.lessons ?? []);
    setInLibrary(isDeckInLibrary(deckId));
    setBatchSize(getUserSettings().batchSize);
  }, [deckId]);

  useFocusEffect(load);

  function learn() {
    if (!deckId || !deck) return;
    if (!inLibrary) addDeckToLibrary(deckId);
    router.push('/learn');
  }

  function toggleLibrary() {
    if (!deckId) return;
    if (inLibrary) removeDeckFromLibrary(deckId);
    else addDeckToLibrary(deckId);
    setInLibrary(!inLibrary);
  }

  if (!deckId) {
    return (
      <View style={commonStyles.centered}>
        <Text style={commonStyles.subtitle}>No deck selected.</Text>
        <Link href="/decks" asChild>
          <Pressable style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnPrimary])}>
            <Text style={commonStyles.btnText}>Browse decks</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  if (!deck) {
    return (
      <View style={commonStyles.centered}>
        <Text style={commonStyles.subtitle}>Deck not found.</Text>
        <Link href="/decks" asChild>
          <Pressable style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnPrimary])}>
            <Text style={commonStyles.btnText}>Browse decks</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  const available = deck.totalPoints > 0;
  const pct =
    deck.totalPoints > 0 ? Math.round((deck.learnedPoints / deck.totalPoints) * 100) : 0;

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
      <Link href="/decks" asChild>
        <Pressable style={styles.backLink}>
          <Text style={styles.backLinkText}>‹ Decks</Text>
        </Pressable>
      </Link>
      <Text style={commonStyles.title}>{deck.title}</Text>
      <View style={styles.badges}>
        <Text style={styles.badge}>Grammar</Text>
        <Text style={styles.badge}>{deck.totalPoints} points</Text>
        {inLibrary ? <Text style={[styles.badge, styles.badgeLibrary]}>In your library ✓</Text> : null}
      </View>
      <Text style={[commonStyles.body, { marginTop: 8 }]}>{deck.description}</Text>

      <View style={styles.actions}>
        {available ? (
          <Pressable
            onPress={learn}
            style={[commonStyles.btn, commonStyles.btnPrimary, styles.actionButton]}
          >
            <Text style={commonStyles.btnText}>Learn {batchSize}</Text>
          </Pressable>
        ) : null}
        <Link href="/review" asChild>
          <Pressable
            style={StyleSheet.flatten([
              commonStyles.btn,
              commonStyles.btnSecondary,
              styles.actionButton,
            ])}
          >
            <Text style={commonStyles.btnTextDark}>Review {deck.dueCount}</Text>
          </Pressable>
        </Link>
      </View>
      {available ? (
        <Pressable style={styles.libraryToggle} onPress={toggleLibrary}>
          <Text style={styles.libraryToggleText}>
            {inLibrary ? 'Remove from library' : 'Add to library'}
          </Text>
        </Pressable>
      ) : null}

      <Text style={styles.sectionTitle}>Details</Text>
      <View style={commonStyles.card}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Your progress</Text>
          <Text style={styles.detailValue}>
            {deck.learnedPoints}/{deck.totalPoints} · {pct}%
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Due for review</Text>
          <Text style={styles.detailValue}>{deck.dueCount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Content</Text>
          <Text style={styles.detailValue}>
            {available ? `${deck.totalPoints} grammar points` : 'Content coming soon.'}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Lessons</Text>
      <View style={commonStyles.card}>
        {!available ? (
          <Text style={commonStyles.muted}>
            No content yet — this level is coming soon.
          </Text>
        ) : (
          lessons.map((lesson) => (
            <Link key={lesson.lessonNumber} href="/grammar" asChild>
              <Pressable style={styles.lessonRow}>
                <View style={styles.lessonText}>
                  <Text style={styles.lessonTitle}>
                    Lesson {lesson.lessonNumber}: {lesson.lessonTitle}
                  </Text>
                  <Text style={commonStyles.muted}>
                    {lesson.learned}/{lesson.total} learned
                  </Text>
                </View>
                <View style={styles.lessonBar}>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${
                            lesson.total > 0
                              ? Math.min(100, (lesson.learned / lesson.total) * 100)
                              : 0
                          }%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </Pressable>
            </Link>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backLink: {
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  backLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  badge: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.bgSecondaryDark,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  badgeLibrary: {
    backgroundColor: '#FDECEC',
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
  libraryToggle: {
    marginTop: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  libraryToggleText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 15,
    color: colors.muted,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.bgSecondaryDark,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  lessonText: {
    flex: 1,
    gap: 2,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  lessonBar: {
    width: 90,
  },
});
