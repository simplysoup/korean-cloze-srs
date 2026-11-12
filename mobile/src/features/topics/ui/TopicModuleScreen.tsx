import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, commonStyles } from '../../../components/theme';
import {
  getTopicModule,
  getTopicModules,
  prerequisiteLabel,
  type TopicModule,
} from '../catalog';
import { REGISTER_DIMENSIONS, topicPracticeChecks } from '../register-practice';
import { answerTopicCheck, startTopicSession, topicSessionStats } from '../session';
import { KnowledgeCheck } from './KnowledgeCheck';

function Prerequisites({ module }: { module: TopicModule }) {
  const grammar = module.prerequisiteGrammarIds.map(prerequisiteLabel);
  const vocabulary = module.prerequisiteVocabDeckIds.map(prerequisiteLabel);
  return (
    <View style={commonStyles.card}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>Prerequisites</Text>
      {grammar.length + vocabulary.length === 0 ? (
        <Text style={commonStyles.body}>None — begin with syllable-block reading.</Text>
      ) : (
        <>
          {grammar.length > 0 ? <Text style={commonStyles.body}>Grammar: {grammar.join(' · ')}</Text> : null}
          {vocabulary.length > 0 ? <Text style={commonStyles.body}>Vocabulary: {vocabulary.join(' · ')}</Text> : null}
        </>
      )}
      <Text style={commonStyles.muted}>
        Prerequisites are guidance, not an enforced lock. This lesson does not modify their progress.
      </Text>
    </View>
  );
}

function RegisterDimensions() {
  return (
    <View style={[commonStyles.card, styles.section]}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>Two independent dimensions</Text>
      <Text style={commonStyles.body}>
        Subject honorification (-시-, 께서) concerns the person described.
        Hearer politeness (-어, -어요, -ㅂ니다) concerns the person listening.
        Plain narrative -ㄴ다/는다 is a separate style, not simply a more polite casual form.
      </Text>
      {REGISTER_DIMENSIONS.map((item) => (
        <View key={item.sentence} style={styles.example}>
          <Text style={styles.korean}>{item.sentence}</Text>
          <Text style={commonStyles.body}>{item.subject}</Text>
          <Text style={commonStyles.body}>{item.listener}</Text>
        </View>
      ))}
      <Text style={commonStyles.muted}>Written examples; no native-speaker audio has been verified.</Text>
    </View>
  );
}

/** Key the component by module ID in the route so changes reset only local check state. */
export function TopicModuleScreen({ id }: { id: string }) {
  const [session, setSession] = useState(startTopicSession);
  const module = getTopicModule(id);
  const checks = useMemo(
    () => module ? [...module.checks, ...topicPracticeChecks(module.id)] : [],
    [module],
  );

  if (!module) {
    return (
      <View style={commonStyles.centered}>
        <Text accessibilityRole="header" style={commonStyles.title}>Topic not found</Text>
        <Pressable
          style={[commonStyles.btn, commonStyles.btnPrimary]}
          accessibilityRole="button"
          onPress={() => router.replace('/topics')}
        >
          <Text style={commonStyles.btnText}>Back to topic library</Text>
        </Pressable>
      </View>
    );
  }

  const stats = topicSessionStats(session, checks);
  const all = getTopicModules();
  const index = all.findIndex((item) => item.id === module.id);
  const previous = all[index - 1];
  const next = all[index + 1];
  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
      <Pressable
        onPress={() => router.push('/topics')}
        accessibilityRole="button"
        style={styles.back}
      >
        <Text style={styles.backText}>← Language topics</Text>
      </Pressable>
      <Text style={styles.stage}>MODULE {index + 1} OF {all.length} · {module.kind}</Text>
      <Text accessibilityRole="header" style={styles.title}>{module.title}</Text>
      <View style={[commonStyles.card, styles.objective]}>
        <Text accessibilityRole="header" style={styles.smallHeading}>Learning objective</Text>
        <Text style={commonStyles.body}>{module.learningGoal}</Text>
      </View>
      <Prerequisites module={module} />
      {module.id === 'topic_speech_register' ? <RegisterDimensions /> : null}
      <Text accessibilityRole="header" style={styles.unitHeading}>
        Learn · {module.sections.length} ordered sections
      </Text>
      {module.sections.map((section, sectionIndex) => (
        <View key={section.heading} style={[commonStyles.card, styles.section]}>
          <Text style={styles.stage}>SECTION {sectionIndex + 1} / {module.sections.length}</Text>
          <Text accessibilityRole="header" style={styles.sectionTitle}>{section.heading}</Text>
          <Text style={commonStyles.body}>{section.explanation}</Text>
          {section.examples.map((example, exampleIndex) => (
            <View key={example.korean + exampleIndex} style={styles.example}>
              <Text style={styles.korean}>{example.korean}</Text>
              <Text style={commonStyles.body}>{example.english}</Text>
              {example.pronunciation ? (
                <Text style={styles.pronunciation}>
                  Written pronunciation: {example.pronunciation}
                </Text>
              ) : null}
              {example.comment ? <Text style={commonStyles.muted}>{example.comment}</Text> : null}
            </View>
          ))}
        </View>
      ))}
      {module.kind === 'pronunciation' ? (
        <View style={[commonStyles.card, styles.section]}>
          <Text style={commonStyles.body}>
            Audio unavailable — the pronunciations above are written teaching
            transcriptions, not recordings or assessed listening exercises.
          </Text>
          <Pressable
            onPress={() => router.push('/hangul/sound-changes')}
            accessibilityRole="button"
            style={[commonStyles.btn, commonStyles.btnPrimary, styles.action]}
          >
            <Text style={commonStyles.btnText}>Continue with decoding and sound rules</Text>
          </Pressable>
        </View>
      ) : null}
      <Text accessibilityRole="header" style={styles.unitHeading}>Check understanding</Text>
      <Text style={commonStyles.body}>
        These checks explain each response. A correct answer completes a check
        for this visit only; no grammar or vocabulary credit is awarded.
      </Text>
      <View style={styles.progress} accessibilityLiveRegion="polite">
        <Text style={styles.progressText}>
          {stats.correct} / {stats.total} checks correct · {stats.attempted} attempted
        </Text>
        {stats.complete ? (
          <Text style={styles.done}>Module complete for this visit</Text>
        ) : (
          <Text style={commonStyles.muted}>Not yet complete</Text>
        )}
      </View>
      {checks.map((check, checkIndex) => (
        <KnowledgeCheck
          key={check.id}
          check={check}
          index={checkIndex}
          total={checks.length}
          attempt={session.answers[check.id]}
          onSelect={(choiceIndex) => setSession((current) => answerTopicCheck(current, check, choiceIndex))}
        />
      ))}
      <Pressable
        onPress={() => setSession(startTopicSession())}
        accessibilityRole="button"
        style={[commonStyles.btn, commonStyles.btnSecondary, styles.action]}
      >
        <Text style={commonStyles.btnTextDark}>Restart this module&apos;s checks</Text>
      </Pressable>
      <View style={[commonStyles.card, styles.section]}>
        <Text accessibilityRole="header" style={styles.smallHeading}>References and review status</Text>
        {module.sourceReferences.map((url, sourceIndex) => (
          <Pressable
            key={url}
            accessibilityRole="link"
            accessibilityLabel={'Open source reference ' + (sourceIndex + 1)}
            onPress={() => void Linking.openURL(url)}
            style={styles.sourceLink}
          >
            <Text style={styles.linkText}>Source reference {sourceIndex + 1} ↗</Text>
          </Pressable>
        ))}
        <Text style={commonStyles.muted}>
          Instructional content is authored and pending educator review.
          No native-speaker audio has been validated.
        </Text>
      </View>
      <View style={styles.navigation}>
        <Pressable
          onPress={() => router.push(previous ? '/topics/' + previous.id : '/topics')}
          accessibilityRole="button"
          style={[commonStyles.btn, commonStyles.btnSecondary, styles.navigationButton]}
        >
          <Text style={commonStyles.btnTextDark}>
            {previous ? '← Previous module' : '← Library'}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(next ? '/topics/' + next.id : '/topics')}
          accessibilityRole="button"
          style={[commonStyles.btn, commonStyles.btnPrimary, styles.navigationButton]}
        >
          <Text style={commonStyles.btnText}>
            {next ? 'Next module →' : 'Back to library →'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  backText: { fontSize: 16, fontWeight: '600', color: colors.primary },
  stage: { fontSize: 12, fontWeight: '800', color: colors.muted, letterSpacing: 0.8,
    textTransform: 'uppercase', marginBottom: 6 },
  title: { fontSize: 28, lineHeight: 35, fontWeight: '800', color: colors.text, marginBottom: 16 },
  objective: { borderLeftWidth: 4, borderLeftColor: colors.primary, marginBottom: 12 },
  smallHeading: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 8 },
  unitHeading: { fontSize: 21, fontWeight: '800', color: colors.text, marginTop: 24, marginBottom: 12 },
  section: { gap: 12, marginTop: 12 },
  sectionTitle: { fontSize: 19, lineHeight: 27, fontWeight: '700', color: colors.text, marginBottom: 6 },
  example: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 4 },
  korean: { fontSize: 22, fontWeight: '700', color: colors.text, lineHeight: 32 },
  pronunciation: { fontSize: 16, color: colors.blue, fontWeight: '600' },
  action: { marginTop: 12 },
  progress: { padding: 12, borderRadius: 8, backgroundColor: colors.white, marginVertical: 12 },
  progressText: { color: colors.text, fontSize: 16, fontWeight: '800' },
  done: { color: colors.green, fontSize: 15, fontWeight: '700' },
  sourceLink: { paddingVertical: 6, minHeight: 44, justifyContent: 'center' },
  linkText: { color: colors.blue, fontSize: 15 },
  navigation: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 20 },
  navigationButton: { flexGrow: 1 },
});
