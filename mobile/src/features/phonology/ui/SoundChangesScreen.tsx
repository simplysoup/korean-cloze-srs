import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, commonStyles } from '../../../components/theme';
import { getTopicModule } from '../../topics/catalog';
import { KnowledgeCheck } from '../../topics/ui/KnowledgeCheck';
import { answerTopicCheck, startTopicSession, topicSessionStats } from '../../topics/session';
import { audioForTarget } from '../audio-manifest';
import { allSoundChecks, PHONOLOGY_STATUS, SOUND_LESSONS } from '../content';
import { decodeWrittenWord } from '../decoder';

export function SoundChangesScreen() {
  const [input, setInput] = useState('강');
  const [session, setSession] = useState(startTopicSession);
  const decoded = useMemo(() => decodeWrittenWord(input), [input]);
  const checks = useMemo(allSoundChecks, []);
  const stats = topicSessionStats(session, checks);
  const authoritative = getTopicModule('topic_hangul_sound_changes');
  let questionIndex = 0;

  return (
    <ScrollView
      style={commonStyles.screen}
      contentContainerStyle={commonStyles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable
        onPress={() => router.push('/hangul')}
        accessibilityRole="button"
        style={styles.back}
      >
        <Text style={styles.backLabel}>← Hangul practice</Text>
      </Pressable>
      <Text accessibilityRole="header" style={styles.title}>Read Hangul as blocks and sounds</Text>
      <Text style={commonStyles.subtitle}>
        Continue beyond the jamo batches: decode initial, medial and final
        positions, then recognize how nearby sounds change.
      </Text>

      <View style={[commonStyles.card, styles.warning]}>
        <Text accessibilityRole="header" style={styles.warningTitle}>Written practice only</Text>
        <Text style={commonStyles.body}>
          Audio unavailable. No listening response or native-speaker approval is
          implied. The phonetic forms in brackets are examples to recognize,
          not a replacement for verified recordings.
        </Text>
      </View>

      <View style={[commonStyles.card, styles.decoderCard]}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>Interactive spelling decoder</Text>
        <Text style={commonStyles.body}>
          Type a Korean word to identify the written pieces of each syllable.
          This tool does not automatically predict connected-speech pronunciation.
        </Text>
        <TextInput
          accessibilityLabel="Korean spelling to decode"
          value={input}
          onChangeText={setInput}
          placeholder="강"
          placeholderTextColor={colors.faint}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        {decoded.length === 0 ? (
          <Text style={commonStyles.muted}>Enter a complete Hangul syllable to decode.</Text>
        ) : (
          <View style={styles.blockList}>
            {decoded.map((part, index) => (
              <View key={index} style={styles.blockRow}>
                <Text style={styles.blockGlyph}>{part.syllable}</Text>
                <View style={styles.blockInfo}>
                  <Text style={styles.partLabels}>
                    Initial: {part.initial} · Medial: {part.medial} · 받침: {part.final ?? 'none'}
                  </Text>
                  {part.silentInitial ? (
                    <Text style={commonStyles.muted}>Initial ㅇ is silent here.</Text>
                  ) : null}
                  {part.final === 'ㅇ' ? (
                    <Text style={commonStyles.muted}>Final ㅇ is the nasal ng sound.</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.progress} accessibilityLiveRegion="polite">
        <Text style={styles.progressText}>
          Sound-rule checks: {stats.correct} / {stats.total} correct
        </Text>
        <Text style={commonStyles.muted}>
          {stats.complete ? 'Complete for this visit only.' : 'No progress is saved or credited to SRS.'}
        </Text>
      </View>

      {SOUND_LESSONS.map((lesson, index) => (
        <View key={lesson.id} style={styles.lesson}>
          <Text style={styles.kicker}>LESSON {index + 1} / {SOUND_LESSONS.length}</Text>
          <Text accessibilityRole="header" style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.objective}>{lesson.objective}</Text>
          <Text style={commonStyles.body}>{lesson.explanation}</Text>
          {lesson.examples.map((example, exampleIndex) => {
            const media = audioForTarget(example.spelling);
            return (
              <View style={[commonStyles.card, styles.exampleCard]} key={example.spelling + exampleIndex}>
                <Text style={styles.orthography}>{example.spelling}</Text>
                <Text style={commonStyles.body}>{example.meaning}</Text>
                <Text style={styles.spoken}>Written sound: {example.writtenSound}</Text>
                <Text style={commonStyles.body}>{example.observation}</Text>
                {media.status === 'unavailable' ? (
                  <Text style={styles.noAudio}>Audio unavailable — recognition from text only.</Text>
                ) : null}
              </View>
            );
          })}
          <Text accessibilityRole="header" style={styles.checkTitle}>Apply this rule</Text>
          {lesson.checks.map((check) => {
            const number = questionIndex++;
            return (
              <KnowledgeCheck
                key={check.id}
                check={check}
                index={number}
                total={checks.length}
                attempt={session.answers[check.id]}
                onSelect={(choiceIndex) => setSession(
                  (current) => answerTopicCheck(current, check, choiceIndex),
                )}
              />
            );
          })}
        </View>
      ))}

      <Pressable
        onPress={() => setSession(startTopicSession())}
        accessibilityRole="button"
        style={[commonStyles.btn, commonStyles.btnSecondary, styles.fullButton]}
      >
        <Text style={commonStyles.btnTextDark}>Restart sound-rule checks</Text>
      </Pressable>
      <View style={[commonStyles.card, styles.source]}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>Provenance</Text>
        <Text style={commonStyles.body}>
          {PHONOLOGY_STATUS}
        </Text>
        <Text style={commonStyles.muted}>
          These example rules correspond to the written Hangul topic.
          Source references in that module include the National Institute
          of Korean Language's pronunciation guidance. Audio manifest:
          all assets unavailable; no unlicensed audio is bundled.
        </Text>
        <Pressable
          onPress={() => router.push('/topics/topic_hangul_sound_changes')}
          accessibilityRole="button"
          style={[commonStyles.btn, commonStyles.btnPrimary, styles.fullButton]}
        >
          <Text style={commonStyles.btnText}>Read the authored pronunciation topic</Text>
        </Pressable>
        <Text style={commonStyles.muted}>
          {authoritative?.sourceReferences.length ?? 0} published source references in the topic.
        </Text>
      </View>
      <Pressable
        onPress={() => router.push('/topics')}
        accessibilityRole="button"
        style={[commonStyles.btn, commonStyles.btnSecondary, styles.fullButton]}
      >
        <Text style={commonStyles.btnTextDark}>Language topics library →</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' },
  backLabel: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  title: { fontSize: 27, fontWeight: '800', lineHeight: 34, color: colors.text, marginBottom: 10 },
  warning: { borderLeftWidth: 4, borderLeftColor: colors.orange, marginTop: 16, gap: 8 },
  warningTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  decoderCard: { marginTop: 16, gap: 12 },
  sectionTitle: { fontSize: 19, lineHeight: 27, color: colors.text, fontWeight: '800' },
  input: { width: '100%', backgroundColor: colors.white, borderWidth: 1,
    borderColor: colors.border, borderRadius: 8, padding: 12, minHeight: 50,
    fontSize: 24, color: colors.text },
  blockList: { gap: 8 },
  blockRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center',
    backgroundColor: colors.bgSecondary, padding: 10, borderRadius: 8 },
  blockGlyph: { fontSize: 32, color: colors.text, fontWeight: '700', width: 52, textAlign: 'center' },
  blockInfo: { flex: 1, minWidth: 180, gap: 4 },
  partLabels: { color: colors.text, fontSize: 15, fontWeight: '600' },
  progress: { backgroundColor: colors.white, marginTop: 16, borderRadius: 8, padding: 14, gap: 4 },
  progressText: { fontSize: 17, fontWeight: '800', color: colors.text },
  lesson: { marginTop: 28, gap: 12 },
  kicker: { fontSize: 12, letterSpacing: 1, fontWeight: '800', color: colors.muted },
  lessonTitle: { fontSize: 22, lineHeight: 30, fontWeight: '800', color: colors.text },
  objective: { fontSize: 16, lineHeight: 24, fontWeight: '700', color: colors.primaryDark },
  exampleCard: { gap: 6 },
  orthography: { color: colors.text, fontSize: 26, lineHeight: 34, fontWeight: '800' },
  spoken: { color: colors.blue, fontSize: 17, fontWeight: '700' },
  noAudio: { fontSize: 13, lineHeight: 20, color: colors.muted, fontStyle: 'italic' },
  checkTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginTop: 8 },
  fullButton: { marginTop: 14, width: '100%' },
  source: { gap: 12, marginTop: 22 },
});
