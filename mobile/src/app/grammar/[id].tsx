import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getGrammarDetail, getGrammarList } from '../../db';
import { srsRankLabel } from '../../lib/srs';
import EnglishHint from '../../components/EnglishHint';
import { colors, commonStyles } from '../../components/theme';

type Tab = 'details' | 'examples' | 'resources';

const NOTE_LABEL: Record<string, string> = {
  caution: 'Caution',
  tip: 'Tip',
  funfact: 'Note',
};

export default function GrammarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [hideSentences, setHideSentences] = useState(false);
  const [hideTranslations, setHideTranslations] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

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

  const relatedTitles = useMemo(() => {
    const map = new Map(getGrammarList().map((item) => [item.id, item.title] as const));
    return (detail?.relatedPointIds ?? []).map((rid) => ({ id: rid, title: map.get(rid) ?? rid }));
  }, [detail]);

  function reveal(key: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }

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
  const rank = detail.reviewCard
    ? srsRankLabel(detail.reviewCard.state, detail.reviewCard.stability, detail.reviewCard.masteredAt !== null)
    : null;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'details', label: 'Details' },
    { key: 'examples', label: 'Examples' },
    { key: 'resources', label: 'Resources' },
  ];

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
      {/* Hero: huge red headword */}
      <Text style={styles.heroTitle}>{detail.title}</Text>
      {vocabBaseForm ? <Text style={styles.heroVocab}>{vocabBaseForm}</Text> : null}
      <Text style={commonStyles.subtitle}>{detail.hint}</Text>
      <Text style={commonStyles.muted}>
        {detail.category}
        {detail.tense ? ` · ${detail.tense}` : ''}
        {detail.register ? ` · ${detail.register}` : ''}
        {` · Lesson ${detail.lessonNumber}`}
      </Text>
      {rank ? (
        <Text style={[commonStyles.muted, styles.pips]}>SRS rank: {rank}</Text>
      ) : (
        <Text style={[commonStyles.muted, styles.pips]}>Not in your deck yet — learn it from the Learn tab.</Text>
      )}

      {/* Tabs */}
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key ? styles.tabActive : undefined]}
          >
            <Text style={activeTab === tab.key ? styles.tabTextActive : styles.tabText}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
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
              Part of Speech: {detail.category}
              {detail.tense ? `\nTense: ${detail.tense}` : ''}
              {detail.register ? `\nRegister: ${detail.register}` : ''}
              {`\nLevel: ${detail.level}`}
              {detail.tags.length > 0 ? `\nTags: ${detail.tags.join(', ')}` : ''}
            </Text>
          </View>
          {detail.notes?.map((note, i) => {
            const isCaution = note.type === 'caution';
            return (
              <View key={i} style={[commonStyles.card, isCaution ? styles.cautionCard : undefined]}>
                <Text style={[styles.cardLabel, isCaution ? styles.cautionLabel : undefined]}>
                  {NOTE_LABEL[note.type] ?? 'Note'} — {note.title}
                </Text>
                <Text style={commonStyles.body}>{note.content}</Text>
              </View>
            );
          })}
        </View>
      ) : activeTab === 'examples' ? (
        <View style={styles.tabContent}>
          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => setHideSentences((h) => !h)}
              style={[styles.toggle, hideSentences ? styles.toggleOn : undefined]}
            >
              <Text style={hideSentences ? styles.toggleTextOn : styles.toggleText}>
                {hideSentences ? 'Show Sentences' : 'Hide Sentences'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setHideTranslations((h) => !h)}
              style={[styles.toggle, hideTranslations ? styles.toggleOn : undefined]}
            >
              <Text style={hideTranslations ? styles.toggleTextOn : styles.toggleText}>
                {hideTranslations ? 'Show Translations' : 'Hide Translations'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Lesson examples</Text>
          {detail.examples.length > 0 ? (
            detail.examples.map((ex) => {
              const sKey = `ex-s-${ex.id}`;
              const tKey = `ex-t-${ex.id}`;
              const showSentence = !hideSentences || revealed.has(sKey);
              const showTranslation = !hideTranslations || revealed.has(tKey);
              return (
                <View key={ex.id} style={commonStyles.card}>
                  {showSentence ? (
                    <Text style={styles.exampleSentence}>
                      {ex.sentenceWithBlank.replace('___', ex.answer)}
                    </Text>
                  ) : (
                    <Pressable onPress={() => reveal(sKey)} style={styles.hiddenBox}>
                      <Text style={styles.hiddenText}>Tap to reveal sentence</Text>
                    </Pressable>
                  )}
                  {showTranslation ? (
                    <EnglishHint parts={ex.englishHint} />
                  ) : (
                    <Pressable onPress={() => reveal(tKey)} style={styles.hiddenBox}>
                      <Text style={styles.hiddenText}>Tap to reveal translation</Text>
                    </Pressable>
                  )}
                  {ex.notes ? <Text style={commonStyles.muted}>{ex.notes}</Text> : null}
                </View>
              );
            })
          ) : (
            <Text style={commonStyles.muted}>No lesson examples for this point.</Text>
          )}

          <Text style={styles.sectionTitle}>Practice sentences</Text>
          {detail.cards.length > 0 ? (
            detail.cards.map((card) => {
              const sKey = `card-s-${card.id}`;
              const tKey = `card-t-${card.id}`;
              const showSentence = !hideSentences || revealed.has(sKey);
              const showTranslation = !hideTranslations || revealed.has(tKey);
              return (
                <View key={card.id} style={commonStyles.card}>
                  {showSentence ? (
                    <Text style={styles.exampleSentence}>{card.fullSentence}</Text>
                  ) : (
                    <Pressable onPress={() => reveal(sKey)} style={styles.hiddenBox}>
                      <Text style={styles.hiddenText}>Tap to reveal sentence</Text>
                    </Pressable>
                  )}
                  {showTranslation ? (
                    <Text style={commonStyles.body}>
                      Answer: <Text style={styles.answer}>{card.answer}</Text>
                      {card.alternateAnswers.length > 0
                        ? `  (also: ${card.alternateAnswers.join(', ')})`
                        : ''}
                    </Text>
                  ) : (
                    <Pressable onPress={() => reveal(tKey)} style={styles.hiddenBox}>
                      <Text style={styles.hiddenText}>Tap to reveal translation</Text>
                    </Pressable>
                  )}
                  {showTranslation ? <EnglishHint parts={card.englishHint} /> : null}
                </View>
              );
            })
          ) : (
            <Text style={commonStyles.muted}>No practice sentences for this point.</Text>
          )}
        </View>
      ) : (
        <View style={styles.tabContent}>
          <View style={commonStyles.card}>
            <Text style={styles.cardLabel}>Source</Text>
            <Text style={commonStyles.body}>
              TOPIK I Level 1 · Lesson {detail.lessonNumber}
              {'\n'}Deck: TOPIK I Level 1 Grammar
            </Text>
          </View>
          <View style={commonStyles.card}>
            <Text style={styles.cardLabel}>About this content</Text>
            <Text style={commonStyles.body}>
              Provisional content, ported verbatim from the original app. Sentences will be
              regenerated with a high-performing English–Korean model.
            </Text>
          </View>
          {relatedTitles.length > 0 ? (
            <View style={commonStyles.card}>
              <Text style={styles.cardLabel}>Related grammar</Text>
              {relatedTitles.map((rel) => (
                <Pressable key={rel.id} onPress={() => router.replace(`/grammar/${rel.id}`)}>
                  <Text style={styles.relatedLink}>{rel.title}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
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
    fontSize: 40,
    fontWeight: '800',
    color: colors.primary,
  },
  heroVocab: {
    fontSize: 20,
    color: colors.muted,
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
  cautionCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.orange,
  },
  cautionLabel: {
    color: colors.orange,
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
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggle: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  toggleTextOn: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  hiddenBox: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.bgSecondary,
    marginBottom: 6,
  },
  hiddenText: {
    fontSize: 14,
    color: colors.muted,
  },
  relatedLink: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    paddingVertical: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
});
