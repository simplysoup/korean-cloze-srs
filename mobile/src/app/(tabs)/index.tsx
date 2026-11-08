import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { formatNextReview } from '../../lib/srs';
import { getDashboardStats, getUserSettings, type DashboardStats } from '../../db';
import { useAuth, type AuthUser } from '../../lib/auth-context';
import DashboardSkeleton from '../../components/DashboardSkeleton';
import { colors, commonStyles } from '../../components/theme';

/**
 * Bunpro-style two-column dashboard. Desktop (≥1024px): main column
 * (Learn/Review, stats bar, Next Steps, Insights, Your Path, Progress)
 * + sidebar (profile/streak, TOPIK progress). Mobile: the same sections
 * in a single column.
 */

/** Two columns at this width and up; below it, a single column. */
const DESKTOP_BREAKPOINT = 1024;

/** Bunpro's Learn card segments: one per point in the daily queue. */
function Segments({ filled, total }: { filled: number; total: number }) {
  return (
    <View style={styles.segments}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.segment, i < filled ? styles.segmentFilled : styles.segmentEmpty]} />
      ))}
    </View>
  );
}

function DeckMenuRows({ stats }: { stats: DashboardStats }) {
  return (
    <>
      {stats.levelProgress.map((level) => (
        <View key={level.deckId} style={styles.deckRow}>
          <Text style={styles.deckNameWhite}>{level.title}</Text>
          <Text style={styles.deckMetaWhite}>
            {level.learned}/{level.total}
          </Text>
          <Text style={styles.deckCheckWhite}>✓</Text>
        </View>
      ))}
      <Link href="/decks" asChild>
        <Pressable>
          <Text style={styles.deckBrowse}>Browse all decks ›</Text>
        </Pressable>
      </Link>
    </>
  );
}

function LearnCard({
  stats,
  open,
  onToggle,
}: {
  stats: DashboardStats;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.bigCardNavy}>
      <View style={styles.bigCardRow}>
        <Link href="/learn" asChild>
          <Pressable style={StyleSheet.flatten([styles.bigCardMain])} accessibilityRole="button">
            <View style={styles.bigCardTitleRow}>
              <Text style={styles.bigCardTitleWhite}>Learn</Text>
              <Text style={styles.bigCardCountWhite}>
                {stats.learnedToday}/{stats.dailyLearnLimit}
              </Text>
            </View>
            <Segments filled={stats.learnedToday} total={stats.dailyLearnLimit} />
          </Pressable>
        </Link>
        <Pressable
          style={styles.chevron}
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel="Choose deck"
        >
          <Text style={styles.chevronGlyph}>{open ? '⌃' : '⌄'}</Text>
        </Pressable>
      </View>
      {open ? (
        <View style={styles.deckMenu}>
          <DeckMenuRows stats={stats} />
        </View>
      ) : null}
    </View>
  );
}

function ReviewCard({
  stats,
  open,
  onToggle,
}: {
  stats: DashboardStats;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.bigCardCoral}>
      <View style={styles.bigCardRow}>
        <Link href="/review" asChild>
          <Pressable style={StyleSheet.flatten([styles.bigCardMain])} accessibilityRole="button">
            <View style={styles.bigCardTitleRow}>
              <View>
                <Text style={styles.bigCardTitleWhite}>Review</Text>
                <Text style={styles.bigCardSubtitleWhite}>Grammar &amp; Vocab</Text>
              </View>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>{stats.dueCount}</Text>
              </View>
            </View>
          </Pressable>
        </Link>
        <Pressable
          style={styles.chevron}
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel="Choose deck"
        >
          <Text style={styles.chevronGlyph}>{open ? '⌃' : '⌄'}</Text>
        </Pressable>
      </View>
      {open ? (
        <View style={styles.deckMenu}>
          <DeckMenuRows stats={stats} />
        </View>
      ) : null}
    </View>
  );
}

/** Stats bar: Days Studied, Last Session accuracy, Items Studied. */
function StatsBar({ stats }: { stats: DashboardStats }) {
  const items: { label: string; value: string }[] = [
    { label: 'Days Studied', value: String(stats.daysStudied) },
    {
      label: 'Last Session',
      value: stats.lastSessionAccuracy == null ? '–' : `${stats.lastSessionAccuracy}%`,
    },
    { label: 'Items Studied', value: String(stats.learnedCount) },
  ];
  return (
    <View style={styles.statsBar}>
      {items.map((item, i) => (
        <View key={item.label} style={[styles.statCell, i > 0 && styles.statCellBorder]}>
          <Text style={styles.statValue}>{item.value}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const STAGE_ROWS: {
  key: keyof DashboardStats['stageCounts'];
  label: string;
  interval: string;
}[] = [
  { key: 'beginner', label: 'Beginner', interval: 'under 1 day' },
  { key: 'adept', label: 'Adept', interval: '1–7 days' },
  { key: 'seasoned', label: 'Seasoned', interval: '7–30 days' },
  { key: 'expert', label: 'Expert', interval: '30–180 days' },
  { key: 'master', label: 'Master', interval: 'mastered' },
  { key: 'selfStudy', label: 'Self-Study', interval: '–' },
  { key: 'ghost', label: 'Ghost', interval: 'lapses' },
];

/** Progress by SRS stage (stages are set by FSRS stability). */
function ProgressStages({ stats }: { stats: DashboardStats }) {
  const max = Math.max(1, ...STAGE_ROWS.map((r) => stats.stageCounts[r.key]));
  return (
    <View>
      <Text style={styles.sectionTitle}>Progress</Text>
      <View style={commonStyles.card}>
        {STAGE_ROWS.map((row) => (
          <View key={row.key} style={styles.progressRow}>
            <Text style={styles.progressLabel}>{row.label}</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(stats.stageCounts[row.key] / max) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressCount}>{stats.stageCounts[row.key]}</Text>
            <Text style={styles.progressInterval}>{row.interval}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Profile + streak card (sidebar). */
function ProfileCard({
  stats,
  user,
  hideStreak,
  logout,
}: {
  stats: DashboardStats;
  user: AuthUser;
  hideStreak: boolean;
  logout: () => void;
}) {
  const [copied, setCopied] = useState(false);
  function share() {
    try {
      const origin =
        typeof window !== 'undefined' && window.location ? window.location.origin : '';
      if (typeof navigator !== 'undefined' && navigator.clipboard && origin) {
        void navigator.clipboard.writeText(`${origin}/`).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }
    } catch {
      // Clipboard unavailable; nothing to do.
    }
  }
  return (
    <View style={commonStyles.card}>
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarGlyph}>문</Text>
        </View>
        <View>
          <Text style={styles.username}>{user?.username ?? 'Learner'}</Text>
          <Text style={commonStyles.muted}>
            Lvl {stats.level} · {stats.currentXP} / {stats.xpForNextLevel} XP · {stats.totalReviews}{' '}
            reviews
          </Text>
        </View>
      </View>
      {!hideStreak ? (
        <View style={styles.streakBox}>
          <Text style={styles.streakTitle}>Current Streak – {stats.currentStreak}</Text>
          <View style={styles.streakDots}>
            {stats.history.map((day) => {
              const studied = day.count > 0;
              const label = new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, {
                weekday: 'short',
              });
              return (
                <View key={day.date} style={styles.streakDay}>
                  <Text style={[styles.streakDot, studied ? styles.studiedDot : styles.missedDot]}>
                    ●
                  </Text>
                  <Text style={styles.streakLabel}>{label}</Text>
                </View>
              );
            })}
          </View>
          <Text style={commonStyles.muted}>Best streak: {stats.longestStreak} days</Text>
        </View>
      ) : null}
      <View style={styles.profileActions}>
        <Pressable onPress={share} style={styles.profileAction}>
          <Text style={styles.profileActionText}>{copied ? 'Link copied ✓' : 'Share'}</Text>
        </Pressable>
        <Link href="/account" asChild>
          <Pressable style={styles.profileAction}>
            <Text style={styles.profileActionText}>Edit</Text>
          </Pressable>
        </Link>
      </View>
      <Link href="/account" asChild>
        <Pressable style={styles.accountLink}>
          <Text style={styles.accountLinkText}>Account & password ›</Text>
        </Pressable>
      </Link>
      <Pressable onPress={logout} style={styles.logoutButton} accessibilityRole="button">
        <Text style={styles.logoutText}>Log out{user ? ` (${user.username})` : ''}</Text>
      </Pressable>
    </View>
  );
}

/** TOPIK progress — one bar per TOPIK level (each level is its own deck).
 * No lesson-level detail: the level bar is the progress. */
function TopikProgress({ stats }: { stats: DashboardStats }) {
  return (
    <View style={commonStyles.card}>
      <Text style={styles.cardTitle}>TOPIK Progress (Grammar)</Text>
      {stats.levelProgress.map((level) => (
        <View key={level.deckId} style={styles.levelSection}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelTitle}>{level.title}</Text>
            <Text style={styles.progressCount}>
              {level.learned}/{level.total}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    level.total > 0 ? Math.min(100, (level.learned / level.total) * 100) : 0
                  }%`,
                },
              ]}
            />
          </View>
        </View>
      ))}
      <Text style={[commonStyles.muted, { marginTop: 8 }]}>
        Learned {stats.learnedCount} / {stats.totalGrammarPoints} grammar points
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [learnDeckOpen, setLearnDeckOpen] = useState(false);
  const [reviewDeckOpen, setReviewDeckOpen] = useState(false);
  const [hideStreak, setHideStreak] = useState(false);
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  useFocusEffect(
    useCallback(() => {
      try {
        setStats(getDashboardStats());
        setHideStreak(getUserSettings().hideStreak);
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

  if (!stats || !user) {
    return (
      <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
        <DashboardSkeleton />
      </ScrollView>
    );
  }

  const nextReview = stats.nextReviewAt ? new Date(stats.nextReviewAt) : null;

  const mainColumn = (
    <>
      {isDesktop ? (
        <View style={styles.topRow}>
          <View style={styles.topCell}>
            <LearnCard
              stats={stats}
              open={learnDeckOpen}
              onToggle={() => setLearnDeckOpen((o) => !o)}
            />
          </View>
          <View style={styles.topCell}>
            <ReviewCard
              stats={stats}
              open={reviewDeckOpen}
              onToggle={() => setReviewDeckOpen((o) => !o)}
            />
          </View>
        </View>
      ) : (
        <>
          <LearnCard
            stats={stats}
            open={learnDeckOpen}
            onToggle={() => setLearnDeckOpen((o) => !o)}
          />
          <View style={{ marginTop: 12 }}>
            <ReviewCard
              stats={stats}
              open={reviewDeckOpen}
              onToggle={() => setReviewDeckOpen((o) => !o)}
            />
          </View>
        </>
      )}
      {stats.dueCount === 0 && nextReview && !stats.vacationMode ? (
        <Text style={styles.nextReview}>Next review in {formatNextReview(nextReview)}.</Text>
      ) : null}
      <View style={{ marginTop: 16 }}>
        <StatsBar stats={stats} />
      </View>
      <ProgressStages stats={stats} />
    </>
  );

  const sideColumn = (
    <>
      <ProfileCard stats={stats} user={user} hideStreak={hideStreak} logout={logout} />
      <View style={{ marginTop: 16 }}>
        <TopikProgress stats={stats} />
      </View>
    </>
  );

  return (
    <ScrollView
      style={commonStyles.screen}
      contentContainerStyle={[
        commonStyles.scrollContent,
        isDesktop && styles.scrollContentWide,
      ]}
    >
      {stats.vacationMode ? (
        <View style={styles.vacationBanner}>
          <Text style={styles.vacationText}>
            Vacation mode is on — reviews and learning are paused, and your streak is frozen.{' '}
          </Text>
          <Link href="/settings" asChild>
            <Pressable>
              <Text style={styles.vacationLink}>Turn it off in Settings ›</Text>
            </Pressable>
          </Link>
        </View>
      ) : null}
      {isDesktop ? (
        <View style={styles.twoCol}>
          <View style={styles.mainCol}>{mainColumn}</View>
          <View style={styles.sideCol}>{sideColumn}</View>
        </View>
      ) : (
        <>
          {mainColumn}
          <View style={{ marginTop: 16 }}>{sideColumn}</View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContentWide: {
    maxWidth: 1080,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  mainCol: {
    flex: 1,
    minWidth: 0,
    gap: 0,
  },
  sideCol: {
    width: 320,
    flexShrink: 0,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
  },
  topCell: {
    flex: 1,
    minWidth: 0,
  },
  vacationBanner: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#E6C87A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  vacationText: {
    fontSize: 14,
    color: colors.text,
  },
  vacationLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  bigCardNavy: {
    backgroundColor: colors.navy,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  bigCardCoral: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  bigCardRow: {
    flexDirection: 'row',
    minHeight: 88,
  },
  bigCardMain: {
    flex: 1,
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingLeft: 20,
    paddingRight: 12,
  },
  bigCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  bigCardTitleWhite: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  bigCardSubtitleWhite: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  bigCardCountWhite: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  countPill: {
    backgroundColor: '#fff',
    borderRadius: 8,
    minWidth: 56,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  countPillText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  segments: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  segmentFilled: {
    backgroundColor: '#fff',
  },
  segmentEmpty: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  chevron: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.25)',
  },
  chevronGlyph: {
    fontSize: 22,
    color: '#fff',
  },
  deckMenu: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  deckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deckNameWhite: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  deckMetaWhite: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  deckCheckWhite: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  deckBrowse: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    paddingVertical: 4,
  },
  nextReview: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 10,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statCellBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.35)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlyph: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  username: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  accountLink: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  accountLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  streakBox: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    gap: 10,
    alignItems: 'center',
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  streakDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  streakDay: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  streakDot: {
    fontSize: 16,
  },
  studiedDot: {
    color: colors.primary,
  },
  missedDot: {
    color: '#C9C9C9',
  },
  streakLabel: {
    fontSize: 11,
    color: colors.muted,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 14,
  },
  profileAction: {
    paddingVertical: 4,
  },
  profileActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  levelSection: {
    marginBottom: 4,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
  },
  progressLabel: {
    width: 64,
    fontSize: 14,
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
  progressCount: {
    width: 44,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  progressInterval: {
    width: 78,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'right',
  },
  logoutButton: {
    marginTop: 16,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 15,
    color: colors.muted,
    textDecorationLine: 'underline',
  },
});
