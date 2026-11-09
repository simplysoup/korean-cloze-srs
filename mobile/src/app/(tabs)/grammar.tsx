import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { getDecks, getGrammarList, type DeckInfo, type GrammarListItem } from '../../db';
import { hangulToRoman } from '../../lib/hangulToRoman';
import { colors, commonStyles } from '../../components/theme';

interface LessonGroup {
  lessonNumber: number;
  lessonTitle: string;
  items: GrammarListItem[];
}

/** One TOPIK level (deck) with its lesson groups. */
interface LevelGroup {
  deckId: string;
  deckTitle: string;
  topikLevel: string;
  groups: LessonGroup[];
}

const STATUS_STYLE: Record<GrammarListItem['status'], { label: string; color: string; background: string }> = {
  // Point cards are pale grey (#F2F2F2), so the New pill is white to
  // read against the card; Learning/Mastered keep their tints.
  new: { label: 'New', color: colors.muted, background: '#FFFFFF' },
  learning: { label: 'Learning', color: colors.blue, background: '#E3EEF8' },
  mastered: { label: 'Mastered', color: colors.green, background: '#E2F2E9' },
};

/**
 * Grammar Library, modelled on Bunpro's grammar_points (build 24): a
 * toolbar (search + Hide Learned Items), then one large containing card
 * per TOPIK level. The level header is a light-grey strip at the top of
 * its card, and the lessons live inside the same card — the shared
 * container + the header strip + the divider rules are what make the
 * sub-elements feel connected to their headers, not indentation. Each
 * lesson header has a divider above it (except the first in the level),
 * a bold "Lesson N", and the subtitle in regular muted grey on the same
 * line, so the lesson number is clearly distinguished from the pale-grey
 * point cards beneath it. Levels start collapsed; expanding one shows
 * its lessons, each with its points.
 */
export default function GrammarScreen() {
  const [items, setItems] = useState<GrammarListItem[]>([]);
  const [decks, setDecks] = useState<DeckInfo[]>([]);
  const [query, setQuery] = useState('');
  const [hideLearned, setHideLearned] = useState(false);
  // Levels the user has expanded. Levels start collapsed (Bunpro's
  // default); a search or the Hide Learned filter auto-expands the
  // levels that still have points, and the toggle always works.
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());
  // Lesson keys are deck-scoped ("<deckId>:<lessonNumber>") so Lesson 1
  // in Level 1 and Lesson 1 in Level 2 never collide.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      const list = getGrammarList();
      setItems(list);
      setDecks(getDecks());
      setExpanded((prev) => {
        if (prev.size > 0) return prev;
        const first = list[0];
        return first ? new Set([`${first.deckId}:${first.lessonNumber}`]) : prev;
      });
    }, []),
  );

  const totalPoints = items.length;

  const levels = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((item) => {
      if (hideLearned && item.status !== 'new') return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        hangulToRoman(item.title).toLowerCase().includes(q) ||
        item.hint.toLowerCase().includes(q) ||
        item.lessonTitle.toLowerCase().includes(q)
      );
    });
    // Start from the deck catalogue so decks with no content yet
    // (TOPIK 2–6, Non-TOPIK) still show up as coming soon.
    const byLevel = new Map<string, LevelGroup>();
    for (const deck of decks) {
      byLevel.set(deck.id, {
        deckId: deck.id,
        deckTitle: deck.title,
        topikLevel: deck.topikLevel,
        groups: [],
      });
    }
    for (const item of filtered) {
      const level = byLevel.get(item.deckId) ?? {
        deckId: item.deckId,
        deckTitle: item.deckTitle,
        topikLevel: item.topikLevel,
        groups: [],
      };
      let group = level.groups.find((g) => g.lessonNumber === item.lessonNumber);
      if (!group) {
        group = { lessonNumber: item.lessonNumber, lessonTitle: item.lessonTitle, items: [] };
        level.groups.push(group);
      }
      group.items.push(item);
      byLevel.set(item.deckId, level);
    }
    for (const level of byLevel.values()) {
      level.groups.sort((a, b) => a.lessonNumber - b.lessonNumber);
    }
    const list = [...byLevel.values()];
    // While searching or hiding learned items, hide levels with no
    // visible points entirely.
    return q || hideLearned ? list.filter((level) => level.groups.length > 0) : list;
  }, [items, decks, query, hideLearned]);

  // A search or the Hide Learned filter auto-expands the levels that
  // still have points, so matches are visible without tapping each row.
  // The load runs in a microtask: the lint rule forbids synchronous
  // setState in the effect body (same pattern as AppHeader).
  useEffect(() => {
    if (query.trim() === '' && !hideLearned) return;
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      setExpandedLevels(new Set(levels.map((level) => level.deckId)));
    });
    return () => {
      cancelled = true;
    };
  }, [query, hideLearned, levels]);

  function toggleLevel(deckId: string) {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(deckId)) next.delete(deckId);
      else next.add(deckId);
      return next;
    });
  }

  function toggleLesson(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <View style={commonStyles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Grammar Library</Text>
        <Text style={commonStyles.muted}>
          {totalPoints} {totalPoints === 1 ? 'grammar point' : 'grammar points'}
        </Text>
      </View>
      <View style={styles.toolbar}>
        <TextInput
          style={styles.search}
          placeholder="Search grammar (Korean, English, or romanized)…"
          placeholderTextColor={colors.faint}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <Pressable
          onPress={() => setHideLearned((v) => !v)}
          style={[styles.filterButton, hideLearned && styles.filterButtonActive]}
          accessibilityRole="button"
        >
          <Text style={[styles.filterButtonText, hideLearned && styles.filterButtonTextActive]}>
            {hideLearned ? 'Show Learned Items' : 'Hide Learned Items'}
          </Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        {levels.length === 0 ? (
          <View style={commonStyles.centered}>
            <Text style={commonStyles.subtitle}>
              {query || hideLearned ? 'No grammar points match.' : 'No grammar points yet.'}
            </Text>
          </View>
        ) : (
          levels.map((level) => {
            const pointCount = level.groups.reduce((n, g) => n + g.items.length, 0);
            const isOpen = expandedLevels.has(level.deckId);
            return (
              <View key={level.deckId} style={styles.levelGroup}>
                <Pressable
                  onPress={() => toggleLevel(level.deckId)}
                  style={[styles.levelRow, isOpen && styles.levelRowOpen]}
                  accessibilityRole="button"
                >
                  <Text style={styles.levelChevron}>{isOpen ? '⌄' : '›'}</Text>
                  <Text style={styles.levelTitle}>{level.deckTitle}</Text>
                  {pointCount > 0 ? (
                    <Text style={styles.levelCount}>{pointCount}</Text>
                  ) : null}
                </Pressable>
                {isOpen ? (
                  <View style={styles.levelBody}>
                    {level.groups.length === 0 ? (
                      <Text style={[commonStyles.muted, { marginBottom: 8 }]}>
                        No grammar points yet — content coming soon.
                      </Text>
                    ) : null}
                    {level.groups.map((group, groupIndex) => {
                      const lessonKey = `${level.deckId}:${group.lessonNumber}`;
                      const lessonOpen = query.trim() !== '' || expanded.has(lessonKey);
                      return (
                        <View key={lessonKey} style={styles.lessonGroup}>
                          <Pressable
                            onPress={() => toggleLesson(lessonKey)}
                            style={[
                              styles.lessonHeader,
                              groupIndex > 0 && styles.lessonHeaderDivider,
                            ]}
                            accessibilityRole="button"
                          >
                            <Text style={styles.lessonHeaderText}>
                              Lesson {group.lessonNumber}
                              <Text style={styles.lessonSubtitle}>
                                {' – '}
                                {group.lessonTitle}
                              </Text>
                            </Text>
                            <Text style={styles.lessonHeaderMeta}>
                              {group.items.length} {lessonOpen ? '⌄' : '›'}
                            </Text>
                          </Pressable>
                          {lessonOpen
                            ? group.items.map((item) => {
                                const status = STATUS_STYLE[item.status];
                                return (
                                  <Pressable
                                    key={item.id}
                                    onPress={() => router.push(`/grammar/${item.id}`)}
                                    style={styles.pointCard}
                                  >
                                    <View style={styles.rowMain}>
                                      <Text style={styles.rowTitle}>{item.title}</Text>
                                      <Text style={commonStyles.muted} numberOfLines={2}>
                                        {item.hint}
                                      </Text>
                                    </View>
                                    <View style={[styles.statusPill, { backgroundColor: status.background }]}>
                                      <Text style={[styles.statusText, { color: status.color }]}>
                                        {status.label}
                                      </Text>
                                    </View>
                                  </Pressable>
                                );
                              })
                            : null}
                        </View>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  toolbar: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  search: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  filterButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  // Level = ONE containing white card (Bunpro's main "connected" device):
  // the level header strip sits at the top of the card and every lesson
  // lives inside the same card, so the sub-elements belong to the header
  // by sharing the container — not by indentation or a spine (Bunpro
  // uses no indentation or left border either). The card's own padding
  // is the only inset.
  levelGroup: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    marginBottom: 24,
    overflow: 'hidden',
  },
  // Full-width header strip at the top of the level card: very light
  // grey background with a divider beneath it (only when open — when
  // collapsed the card is just this strip, so no divider is needed).
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F5F5F5',
    minHeight: 60,
    paddingHorizontal: 16,
  },
  levelRowOpen: {
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4',
  },
  levelChevron: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.muted,
    width: 16,
    textAlign: 'center',
  },
  levelTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  levelCount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.muted,
  },
  levelBody: {
    padding: 16,
  },
  lessonGroup: {
    marginBottom: 12,
  },
  // Lesson header: a plain row on white. The divider ABOVE it (all but
  // the first lesson in the level, where the level header's own divider
  // serves) is the attachment device — it ties the header to the
  // previous lesson's cards and marks where this lesson starts. The
  // lesson NUMBER is bold; the subtitle is regular-weight muted grey on
  // the same line, so the number reads as the header and the subtitle as
  // its description. The point cards sit directly under the header, on
  // pale grey, so the header (white, bold) is clearly distinct from
  // the cards.
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: 6,
    marginBottom: 8,
    gap: 8,
  },
  lessonHeaderDivider: {
    borderTopWidth: 1,
    borderTopColor: '#E4E4E4',
  },
  lessonHeaderText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  lessonSubtitle: {
    fontWeight: '400',
    color: colors.muted,
  },
  lessonHeaderMeta: {
    fontSize: 15,
    color: colors.muted,
    fontWeight: '600',
  },
  // Point cards: flat pale-grey rectangles (Bunpro), no border or
  // shadow. The form is bold dark, the meaning muted grey, and the
  // status pill sits at the right.
  pointCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  rowMain: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
