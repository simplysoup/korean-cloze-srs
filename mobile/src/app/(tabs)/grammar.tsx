import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { getGrammarList, type GrammarListItem } from '../../db';
import { hangulToRoman } from '../../lib/hangulToRoman';
import { colors, commonStyles } from '../../components/theme';

interface LessonGroup {
  lessonNumber: number;
  lessonTitle: string;
  items: GrammarListItem[];
}

const STATUS_STYLE: Record<GrammarListItem['status'], { label: string; color: string }> = {
  new: { label: 'New', color: colors.muted },
  learning: { label: 'Learning', color: colors.primaryDark },
  mastered: { label: 'Mastered', color: colors.green },
};

export default function GrammarScreen() {
  const [items, setItems] = useState<GrammarListItem[]>([]);
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      setItems(getGrammarList());
    }, []),
  );

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            hangulToRoman(item.title).toLowerCase().includes(q),
        )
      : items;
    const byLesson = new Map<number, LessonGroup>();
    for (const item of filtered) {
      const group = byLesson.get(item.lessonNumber) ?? {
        lessonNumber: item.lessonNumber,
        lessonTitle: item.lessonTitle,
        items: [],
      };
      group.items.push(item);
      byLesson.set(item.lessonNumber, group);
    }
    return [...byLesson.values()].sort((a, b) => a.lessonNumber - b.lessonNumber);
  }, [items, query]);

  return (
    <View style={commonStyles.screen}>
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          placeholder="Search grammar (Korean or romanized)…"
          placeholderTextColor={colors.faint}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
      <ScrollView contentContainerStyle={commonStyles.scrollContent}>
        {groups.length === 0 ? (
          <View style={commonStyles.centered}>
            <Text style={commonStyles.subtitle}>
              {query ? `No grammar points match “${query}”.` : 'No grammar points yet.'}
            </Text>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.lessonNumber} style={styles.lessonGroup}>
              <Text style={styles.lessonHeader}>
                Lesson {group.lessonNumber} — {group.lessonTitle}
              </Text>
              {group.items.map((item) => {
                const status = STATUS_STYLE[item.status];
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => router.push(`/grammar/${item.id}`)}
                    style={styles.row}
                  >
                    <View style={styles.rowMain}>
                      <Text style={styles.rowTitle}>{item.title}</Text>
                      <Text style={commonStyles.muted} numberOfLines={1}>
                        {item.hint}
                      </Text>
                    </View>
                    <View style={styles.rowSide}>
                      <Text style={[styles.status, { color: status.color }]}>{status.label}</Text>
                      {item.streakCorrect > 0 ? (
                        <Text style={commonStyles.muted}>🔥 {item.streakCorrect}</Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
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
    backgroundColor: colors.bg,
  },
  lessonGroup: {
    marginBottom: 20,
  },
  lessonHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSecondaryDark,
  },
  rowMain: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  rowSide: {
    alignItems: 'flex-end',
    gap: 2,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
});
