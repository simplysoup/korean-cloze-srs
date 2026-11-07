import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getGrammarDetail, getGrammarList } from '../../db';
import EnglishHint from '../../components/EnglishHint';
import MasteryPips from '../../components/MasteryPips';
import { colors, commonStyles } from '../../components/theme';

export default function GrammarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'details' | 'examples'>('details');

  const detail = useMemo(() => (typeof id === 'string' ? getGrammarDetail(id) : null), [id]);

  const neighbours = useMemo(() => {
    if (!detail) return { prev: null as string | null, next: null as string | null };
    const list = [...getGrammarList()].sort((a, b) => a.position - b.position);
    const idx = list.findIndex((item) => item.id === detail.id);
    return {
      prev: idx > 0 ? list[idx - 1].id : null,
      next: idx >= 0 && idx < list.length - 1 ? list[idx + 1].id : null,
    };
  }, [detail]);

  if (!detail) {
    return (
      <View style={commonStyles.centered}>
        <Text style={commonStyles.title}>Grammar point not found</Text>
        <Text style={commonStyles.subtitle}>It may have been removed from the deck.</Text>
        <Pressable
          onPress={() => router.push('/grammar')}
          style={[commonStyles.btn, commonStyles.btnPrimary]}
        >
          <Text style={commonStyles.btnText}>Back to Grammar</Text>
        </Pressable>
      </View>
    );
  }

  const vocabBaseForm = detail.cards[0]?.vocabBaseForm;

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
      {/* Hero */}
      <Text style={styles.heroTitle}>{detail.title}</Text>
      {vocabBaseForm ? <Text style={styles.heroVocab}>{vocabBaseForm}</Text> : null}
      <Text style={commonStyles.subtitle}>{detail.hint}</Text>
      <Text style={commonStyles.muted}>
        {detail.category}
        {detail.tense ? ` · ${detail.tense}` : ''}
        {detail.register ? ` · ${detail.register}` : ''}
        {` · Lesson ${detail.lessonNumber}`}
      </Text>
      {detail.reviewCard ? (
        <View style={styles.pips}>
          <MasteryPips
            streakCorrect={detail.reviewCard.streakCorrect}
            masteredAt={detail.reviewCard.masteredAt}
          />
        </View>
      ) : (
        <Text style={[commonStyles.muted, styles.pips]}>Not in your deck yet — learn it from the Learn tab.</Text>
      )}

      {/* Tabs */}
      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setActiveTab('details')}
          style={[styles.tab, activeTab === 'details' ? styles.tabActive : undefined]}
        >
          <Text style={activeTab === 'details' ? styles.tabTextActive : styles.tabText}>
            Details
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('examples')}
          style={[styles.tab, activeTab === 'examples' ? styles.tabActive : undefined]}
        >
          <Text style={activeTab === 'examples' ? styles.tabTextActive : styles.tabText}>
            Examples
          </Text>
        </Pressable>
      </View>

      {activeTab === 'details' ? (
        <View style={styles.tabContent}>
          {detail.structurePattern ? (
            <View style={commonStyles.card}>
              <Text style={styles.cardLabel}>Structure</Text>
              <Text style={commonStyles.body}>{detail.structurePattern}</Text>
            </View>
          ) : null}
          <View style={commonStyles.card}>
            <Text style={styles.cardLabel}>About</Text>
            <Text style={commonStyles.body}>{detail.description}</Text>
          </View>
          <View style={commonStyles.card}>
            <Text style={styles.cardLabel}>Details</Text>
            <Text style={commonStyles.body}>
              Category: {detail.category}
              {detail.tense ? `\nTense: ${detail.tense}` : ''}
              {detail.register ? `\nRegister: ${detail.register}` : ''}
              {`\nLevel: ${detail.level}`}
              {detail.tags.length > 0 ? `\nTags: ${detail.tags.join(', ')}` : ''}
            </Text>
          </View>
          {detail.notes?.map((note, i) => (
            <View key={i} style={commonStyles.card}>
              <Text style={styles.cardLabel}>
                {note.type === 'caution' ? '⚠️' : note.type === 'tip' ? '💡' : '✨'} {note.title}
              </Text>
              <Text style={commonStyles.body}>{note.content}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Lesson examples</Text>
          {detail.examples.length > 0 ? (
            detail.examples.map((ex) => (
              <View key={ex.id} style={commonStyles.card}>
                <Text style={styles.exampleSentence}>
                  {ex.sentenceWithBlank.replace('___', ex.answer)}
                </Text>
                <EnglishHint parts={ex.englishHint} />
                {ex.notes ? <Text style={commonStyles.muted}>{ex.notes}</Text> : null}
              </View>
            ))
          ) : (
            <Text style={commonStyles.muted}>No lesson examples for this point.</Text>
          )}

          <Text style={styles.sectionTitle}>Practice sentences</Text>
          {detail.cards.length > 0 ? (
            detail.cards.map((card) => (
              <View key={card.id} style={commonStyles.card}>
                <Text style={styles.exampleSentence}>{card.fullSentence}</Text>
                <Text style={commonStyles.body}>
                  Answer: <Text style={styles.answer}>{card.answer}</Text>
                  {card.alternateAnswers.length > 0
                    ? `  (also: ${card.alternateAnswers.join(', ')})`
                    : ''}
                </Text>
                <EnglishHint parts={card.englishHint} />
              </View>
            ))
          ) : (
            <Text style={commonStyles.muted}>No practice sentences for this point.</Text>
          )}
        </View>
      )}

      {/* Prev / next by curriculum position */}
      <View style={styles.footer}>
        <Pressable
          onPress={() => neighbours.prev && router.replace(`/grammar/${neighbours.prev}`)}
          disabled={!neighbours.prev}
          style={[
            commonStyles.btn,
            commonStyles.btnSecondary,
            !neighbours.prev ? commonStyles.btnDisabled : undefined,
          ]}
        >
          <Text style={commonStyles.btnTextDark}>← Previous</Text>
        </Pressable>
        <Pressable
          onPress={() => neighbours.next && router.replace(`/grammar/${neighbours.next}`)}
          disabled={!neighbours.next}
          style={[
            commonStyles.btn,
            commonStyles.btnSecondary,
            !neighbours.next ? commonStyles.btnDisabled : undefined,
          ]}
        >
          <Text style={commonStyles.btnTextDark}>Next →</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  heroVocab: {
    fontSize: 20,
    color: colors.primaryDark,
    marginTop: 4,
  },
  pips: {
    marginTop: 12,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.bgSecondary,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  tabTextActive: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  tabContent: {
    gap: 12,
    marginTop: 12,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  exampleSentence: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.text,
    marginBottom: 6,
  },
  answer: {
    fontWeight: '700',
    color: colors.green,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
});
