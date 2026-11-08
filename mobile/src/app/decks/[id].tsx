import { useCallback, useState } from 'react';
import { Link, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import {
  getActiveDeckId,
  getDashboardStats,
  getDeckSettings,
  getDecks,
  getEffectiveLearnSettings,
  getUserSettings,
  setActiveDeckId,
  setDeckSettings,
  type DeckInfo,
} from '../../db';
import Stepper from '../../components/Stepper';
import { colors, commonStyles } from '../../components/theme';

/**
 * Deck detail page — Bunpro's deck page, cut to what exists: title and
 * description, Learn/Review buttons, lesson rows with learned counts, a
 * Details panel, and per-deck Daily Goal / Batch Size (which override the
 * global settings for this deck only).
 */

export default function DeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const deckId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const [deck, setDeck] = useState<DeckInfo | null>(null);
  const [lessons, setLessons] = useState<
    { lessonNumber: number; lessonTitle: string; learned: number; total: number }[]
  >([]);
  const [isCurrent, setIsCurrent] = useState(false);
  const [useGlobal, setUseGlobal] = useState(true);
  const [dailyGoal, setDailyGoal] = useState(5);
  const [batchSize, setBatchSize] = useState(5);
  const [globalDaily, setGlobalDaily] = useState(5);
  const [globalBatch, setGlobalBatch] = useState(5);

  const load = useCallback(() => {
    if (!deckId) return;
    const found = getDecks().find((d) => d.id === deckId) ?? null;
    setDeck(found);
    const level = getDashboardStats().levelProgress.find((l) => l.deckId === deckId);
    setLessons(level?.lessons ?? []);
    setIsCurrent(getActiveDeckId() === deckId);
    const global = getUserSettings();
    setGlobalDaily(global.dailyNewLimit);
    setGlobalBatch(global.batchSize);
    const override = getDeckSettings(deckId);
    const hasOverride = override.dailyGoal != null || override.batchSize != null;
    setUseGlobal(!hasOverride);
    const effective = getEffectiveLearnSettings(deckId);
    setDailyGoal(override.dailyGoal ?? effective.dailyLimit);
    setBatchSize(override.batchSize ?? effective.batchSize);
  }, [deckId]);

  useFocusEffect(load);

  function toggleGlobal(on: boolean) {
    if (!deckId) return;
    setUseGlobal(on);
    if (on) {
      setDeckSettings(deckId, { dailyGoal: null, batchSize: null });
      setDailyGoal(globalDaily);
      setBatchSize(globalBatch);
    } else {
      setDeckSettings(deckId, { dailyGoal, batchSize });
    }
  }

  function changeDailyGoal(v: number) {
    if (!deckId) return;
    setDailyGoal(v);
    setDeckSettings(deckId, { dailyGoal: v });
    if (batchSize > v) {
      setBatchSize(v);
      setDeckSettings(deckId, { dailyGoal: v, batchSize: v });
    }
  }

  function changeBatchSize(v: number) {
    if (!deckId) return;
    setBatchSize(v);
    setDeckSettings(deckId, { batchSize: v });
  }

  function learn() {
    if (!deckId || !deck) return;
    setActiveDeckId(deckId);
    router.push('/learn');
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
        {isCurrent ? <Text style={[styles.badge, styles.badgeCurrent]}>Current deck ✓</Text> : null}
      </View>
      <Text style={[commonStyles.body, { marginTop: 8 }]}>{deck.description}</Text>

      <View style={styles.actions}>
        {available ? (
          <Pressable
            onPress={learn}
            style={[commonStyles.btn, commonStyles.btnPrimary, styles.actionButton]}
          >
            <Text style={commonStyles.btnText}>Learn 5</Text>
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

      <Text style={styles.sectionTitle}>Deck Settings</Text>
      <View style={commonStyles.card}>
        <View style={styles.settingsRow}>
          <View style={styles.settingsText}>
            <Text style={styles.settingsLabel}>Use global settings</Text>
            <Text style={commonStyles.muted}>
              Daily goal {globalDaily} · Batch size {globalBatch} (from Settings).
            </Text>
          </View>
          <Switch
            value={useGlobal}
            onValueChange={toggleGlobal}
            trackColor={{ true: colors.primary }}
          />
        </View>
        {!useGlobal ? (
          <>
            <View style={styles.divider} />
            <View style={styles.settingsRow}>
              <View style={styles.settingsText}>
                <Text style={styles.settingsLabel}>Daily Goal</Text>
                <Text style={commonStyles.muted}>New points per day for this deck (1–50).</Text>
              </View>
              <Stepper
                value={dailyGoal}
                min={1}
                max={50}
                step={1}
                format={(v) => String(v)}
                onChange={changeDailyGoal}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingsRow}>
              <View style={styles.settingsText}>
                <Text style={styles.settingsLabel}>Batch Size</Text>
                <Text style={commonStyles.muted}>
                  New points per Learn session (never more than the daily goal).
                </Text>
              </View>
              <Stepper
                value={batchSize}
                min={1}
                max={50}
                step={1}
                format={(v) => String(v)}
                onChange={changeBatchSize}
              />
            </View>
          </>
        ) : null}
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
  badgeCurrent: {
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
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
  },
  settingsText: {
    flex: 1,
    gap: 2,
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
