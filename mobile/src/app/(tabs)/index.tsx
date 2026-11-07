import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { formatNextReview } from '../../lib/srs';
import { getDashboardStats, type DashboardStats } from '../../db';
import { colors, commonStyles } from '../../components/theme';

const DISTRIBUTION: { key: keyof DashboardStats['srsDistribution']; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'learning', label: 'Learning' },
  { key: 'review', label: 'Review' },
  { key: 'relearning', label: 'Relearning' },
  { key: 'mastered', label: 'Mastered' },
];

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      try {
        setStats(getDashboardStats());
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard.');
      }
    }, []),
  );

  if (error) {
    return (
      <View style={commonStyles.centered}>
        <Text style={commonStyles.title}>Couldn&apos;t load the dashboard</Text>
        <Text style={commonStyles.subtitle}>{error}</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={commonStyles.centered}>
        <Text style={commonStyles.subtitle}>Loading…</Text>
      </View>
    );
  }

  const maxHistory = Math.max(1, ...stats.history.map((d) => d.count));
  const nextReview = stats.nextReviewAt ? new Date(stats.nextReviewAt) : null;

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
      {/* Due reviews */}
      <View style={styles.hero}>
        <Text style={styles.dueCount}>{stats.dueCount}</Text>
        <Text style={styles.dueLabel}>{stats.dueCount === 1 ? 'review due' : 'reviews due'}</Text>
        <Link href="/review" asChild>
          <Pressable style={[commonStyles.btn, commonStyles.btnPrimary, styles.startButton]}>
            <Text style={commonStyles.btnText}>
              {stats.dueCount > 0 ? 'Start Review' : 'Review'}
            </Text>
          </Pressable>
        </Link>
        {stats.dueCount === 0 && nextReview ? (
          <Text style={commonStyles.muted}>Next review in {formatNextReview(nextReview)}</Text>
        ) : null}
      </View>

      {/* Streak + level */}
      <View style={styles.row}>
        <View style={[styles.statCard, styles.flex1]}>
          <Text style={styles.statValue}>🔥 {stats.currentStreak}</Text>
          <Text style={commonStyles.muted}>day streak (best {stats.longestStreak})</Text>
        </View>
        <View style={[styles.statCard, styles.flex1]}>
          <Text style={styles.statValue}>Level {stats.level}</Text>
          <Text style={commonStyles.muted}>
            {stats.currentXP} / {stats.xpForNextLevel} XP · {stats.totalReviews} reviews
          </Text>
        </View>
      </View>

      {/* XP bar */}
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.min(100, stats.progress)}%` }]} />
      </View>

      {/* Learned progress */}
      <View style={commonStyles.card}>
        <Text style={commonStyles.body}>
          Learned {stats.learnedCount} / {stats.totalGrammarPoints} grammar points
        </Text>
        <View style={[styles.barTrack, styles.miniBar]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${
                  stats.totalGrammarPoints > 0
                    ? Math.min(100, (stats.learnedCount / stats.totalGrammarPoints) * 100)
                    : 0
                }%`,
              },
            ]}
          />
        </View>
      </View>

      {/* SRS distribution */}
      <Text style={styles.sectionTitle}>Cards by stage</Text>
      <View style={commonStyles.card}>
        {DISTRIBUTION.map(({ key, label }) => (
          <View key={key} style={styles.distRow}>
            <Text style={styles.distLabel}>{label}</Text>
            <Text style={styles.distValue}>{stats.srsDistribution[key]}</Text>
          </View>
        ))}
      </View>

      {/* 7-day history */}
      <Text style={styles.sectionTitle}>Reviews — last 7 days</Text>
      <View style={commonStyles.card}>
        {stats.history.map((day) => (
          <View key={day.date} style={styles.historyRow}>
            <Text style={styles.historyDate}>
              {new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <View style={styles.historyBarTrack}>
              <View
                style={[styles.historyBarFill, { width: `${(day.count / maxHistory) * 100}%` }]}
              />
            </View>
            <Text style={styles.historyCount}>{day.count}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  dueCount: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.primary,
    lineHeight: 60,
  },
  dueLabel: {
    fontSize: 17,
    color: colors.muted,
  },
  startButton: {
    marginTop: 8,
    minWidth: 200,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  statCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  barTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.bgSecondaryDark,
    overflow: 'hidden',
    marginTop: 12,
  },
  miniBar: {
    marginTop: 8,
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  distRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  distLabel: {
    fontSize: 16,
    color: colors.text,
  },
  distValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
  },
  historyDate: {
    width: 76,
    fontSize: 14,
    color: colors.muted,
  },
  historyBarTrack: {
    flex: 1,
    height: 14,
    backgroundColor: colors.bgSecondaryDark,
    borderRadius: 4,
    overflow: 'hidden',
  },
  historyBarFill: {
    height: '100%',
    backgroundColor: colors.green,
    borderRadius: 4,
    minWidth: 2,
  },
  historyCount: {
    width: 28,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
});
