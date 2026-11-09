import { useCallback, useMemo, useState } from 'react';
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
  new: { label: 'New', color: colors.muted, background: '#EDEDED' },
  learning: { label: 'Learning', color: colors.blue, background: '#E3EEF8' },
  mastered: { label: 'Mastered', color: colors.green, background: '#E2F2E9' },
};

/** Short tab label for a deck: "Level 1" … "Level 6", "Non-TOPIK". */
function deckTabLabel(deck: DeckInfo): string {
  return deck.level === 0 ? 'Non-TOPIK' : `Level ${deck.level}`;
}

export default function GrammarScreen() {
  const [items, setItems] = useState<GrammarListItem[]>([]);
  const [decks, setDecks] = useState<DeckInfo[]>([]);
  const [query, setQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
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
      if (levelFilter && item.deckId !== levelFilter) return false;
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
    // While searching or filtering to one level, hide decks with no matches.
    return q || levelFilter ? list.filter((level) => level.groups.length > 0) : list;
  }, [items, decks, query, levelFilter]);

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
      <View style={styles.searchWrap}>
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
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
        <Pressable
          onPress={() => setLevelFilter(null)}
          style={[styles.tab, levelFilter === null && styles.tabActive]}
          accessibilityRole="button"
        >
          <Text style={[styles.tabText, levelFilter === null && styles.tabTextActive]}>All</Text>
        </Pressable>
        {decks.map((deck) => (
          <Pressable
            key={deck.id}
            onPress={() => setLevelFilter(deck.id)}
            style={[styles.tab, levelFilter === deck.id && styles.tabActive]}
            accessibilityRole="button"
          >
            <Text style={[styles.tabText, levelFilter === deck.id && styles.tabTextActive]}>
              {deckTabLabel(deck)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        {levels.length === 0 ? (
          <View style={commonStyles.centered}>
            <Text style={commonStyles.subtitle}>
              {query || levelFilter ? 'No grammar points match.' : 'No grammar points yet.'}
            </Text>
          </View>
        ) : (
          levels.map((level) => {
            const pointCount = level.groups.reduce((n, g) => n + g.items.length, 0);
            return (
              <View key={level.deckId}>
                <Text style={styles.levelTitle}>
                  {level.deckTitle}
                  {pointCount > 0 ? ` · ${pointCount}` : ''}
                </Text>
                {level.groups.length === 0 ? (
                  <Text style={[commonStyles.muted, { marginBottom: 8 }]}>
                    No grammar points yet — content coming soon.
                  </Text>
                ) : null}
                {level.groups.map((group) => {
                  const lessonKey = `${level.deckId}:${group.lessonNumber}`;
                  const isOpen = query.trim() !== '' || expanded.has(lessonKey);
                  return (
                    <View key={lessonKey} style={styles.lessonGroup}>
                      <Pressable
                        onPress={() => toggleLesson(lessonKey)}
                        style={styles.lessonHeader}
                        accessibilityRole="button"
                      >
                        <Text style={styles.lessonHeaderText}>
                          Lesson {group.lessonNumber} — {group.lessonTitle}
                        </Text>
                        <Text style={styles.lessonHeaderMeta}>
                          {group.items.length} {isOpen ? '⌄' : '›'}
                        </Text>
                      </Pressable>
                      {isOpen
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
  searchWrap: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  search: {
    minHeight: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  tabs: {
    maxHeight: 44,
    flexGrow: 0,
  },
  tabsContent: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  tab: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  tabTextActive: {
    color: colors.white,
  },
  levelTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  lessonGroup: {
    marginBottom: 20,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
    marginBottom: 8,
  },
  lessonHeaderText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  lessonHeaderMeta: {
    fontSize: 15,
    color: colors.muted,
    fontWeight: '600',
  },
  pointCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  rowMain: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 20,
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
