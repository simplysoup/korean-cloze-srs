import { useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { colors, commonStyles } from '../../components/theme';
import { allPassages } from './catalog';
import { readingMetrics } from './layout';

type LevelFilter = 0 | 1 | 2 | 3;

/** Self-contained reading library; global navigation integration belongs to Agent 00. */
export default function ReaderLibrary() {
  const [filter, setFilter] = useState<LevelFilter>(0);
  const { width } = useWindowDimensions();
  const metrics = readingMetrics(width);
  const passages = allPassages().filter((passage) => filter === 0 || passage.level === filter);

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={[styles.content, { maxWidth: Math.max(288, metrics.contentWidth) }]}>
      <Text style={commonStyles.title}>Reading comprehension</Text>
      <Text style={[commonStyles.subtitle, styles.intro]}>
        Short original Korean texts with questions about meaning, references and context. Read the passage before answering; this pilot does not affect grammar SRS.
      </Text>
      <View style={styles.notice}>
        <Text style={styles.noticeText}>Editorial draft · Korean educator review pending · Reading only (no listening exercises)</Text>
      </View>

      <View style={styles.filters} accessibilityRole="radiogroup">
        {([0, 1, 2, 3] as LevelFilter[]).map((level) => (
          <Pressable
            key={level}
            accessibilityRole="radio"
            accessibilityState={{ selected: filter === level }}
            accessibilityLabel={level === 0 ? 'Show all levels' : 'Show level ' + level}
            onPress={() => setFilter(level)}
            style={[styles.filter, filter === level && styles.activeFilter]}
          >
            <Text style={[styles.filterText, filter === level && styles.activeFilterText]}>
              {level === 0 ? 'All' : 'Level ' + level}
            </Text>
          </Pressable>
        ))}
      </View>

      {passages.map((passage) => (
        <View key={passage.id} style={[commonStyles.card, styles.passageCard]}>
          <View style={styles.row}>
            <Text style={styles.level}>Approx. Level {passage.level}</Text>
            <Text style={styles.meta}>{passage.wordCount} words · {passage.questions.length} questions</Text>
          </View>
          <Text style={styles.koreanTitle}>{passage.titleKo}</Text>
          <Text style={styles.englishTitle}>{passage.titleEn}</Text>
          <Text style={commonStyles.muted}>{passage.situation}</Text>
          <Text style={[commonStyles.muted, styles.prerequisites]}>
            {passage.prerequisiteGrammarIds.length} grammar prerequisites · {passage.vocabularyNotes.length} optional word glosses
          </Text>
          <Text style={styles.prerequisiteText}>Prerequisites: {passage.prerequisiteGrammarLabels.join(' · ')}</Text>
          <Text style={styles.draftLabel}>Educator review pending</Text>
          <Link href={{ pathname: '/comprehension/[id]', params: { id: passage.id } }} asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={'Read ' + passage.titleEn}
              style={[commonStyles.btn, commonStyles.btnPrimary, styles.startButton]}
            >
              <Text style={commonStyles.btnText}>Read passage</Text>
            </Pressable>
          </Link>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { width: '100%', alignSelf: 'center', padding: 16, paddingBottom: 48 },
  intro: { marginTop: 8, marginBottom: 14 },
  notice: { padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.bgSecondary },
  noticeText: { fontSize: 13, color: colors.muted, lineHeight: 20 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 18 },
  filter: { minHeight: 44, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, justifyContent: 'center' },
  activeFilter: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { fontSize: 14, color: colors.text, fontWeight: '600' },
  activeFilterText: { color: colors.white },
  passageCard: { gap: 8, marginBottom: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  level: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  meta: { color: colors.muted, fontSize: 13 },
  koreanTitle: { fontSize: 23, fontWeight: '700', color: colors.text },
  englishTitle: { fontSize: 15, color: colors.text, fontWeight: '600' },
  prerequisites: { marginTop: 4 },
  prerequisiteText: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  draftLabel: { fontSize: 12, color: colors.orange, fontWeight: '700' },
  startButton: { marginTop: 8 },
});
