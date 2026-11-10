import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, commonStyles } from '../../../components/theme';
import { getTopicModules, moduleOverview, TOPIC_CONTENT_STATUS } from '../catalog';

const STAGES: Record<number, string> = {
  0: 'Hangul foundation',
  1: 'Early Korean',
  3: 'Intermediate application',
};

export function TopicLibraryScreen() {
  const topics = getTopicModules();
  const sectionCount = topics.reduce((sum, item) => sum + item.sections.length, 0);
  const checkCount = topics.reduce((sum, item) => sum + item.checks.length, 0);
  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
      <Text accessibilityRole="header" style={commonStyles.title}>Language topics</Text>
      <Text style={[commonStyles.subtitle, styles.intro]}>
        Guided explanations, worked Korean examples and knowledge checks.
        Topics supplement grammar and vocabulary practice; they never award SRS mastery.
      </Text>
      <View style={styles.metrics}>
        <Text style={styles.metric}>{topics.length} modules</Text>
        <Text style={styles.metric}>{sectionCount} sections</Text>
        <Text style={styles.metric}>{checkCount} authored checks</Text>
      </View>
      {topics.map((topic, index) => {
        const overview = moduleOverview(topic);
        return (
          <Pressable
            key={topic.id}
            onPress={() => router.push('/topics/' + topic.id)}
            accessibilityRole="button"
            accessibilityLabel={'Open module ' + (index + 1) + ': ' + topic.title}
            style={[commonStyles.card, styles.topicCard]}
          >
            <View style={styles.cardHeading}>
              <Text style={styles.number}>{String(index + 1).padStart(2, '0')}</Text>
              <Text style={styles.stage}>{STAGES[topic.stage] ?? 'Korean application'}</Text>
            </View>
            <Text style={styles.topicTitle}>{topic.title}</Text>
            <Text style={commonStyles.body}>{topic.learningGoal}</Text>
            <Text style={commonStyles.muted}>
              {overview.sections} sections · {overview.authoredChecks} knowledge checks · no SRS credit
            </Text>
            <Text style={styles.openLink}>Study this module →</Text>
          </Pressable>
        );
      })}
      <View style={[commonStyles.card, styles.extra]}>
        <Text accessibilityRole="header" style={styles.topicTitle}>Hangul decoding lab</Text>
        <Text style={commonStyles.body}>
          Build and read syllable blocks, recognize 받침 and predict sound changes
          from spelling. Written practice works without audio.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/hangul/sound-changes')}
          style={[commonStyles.btn, commonStyles.btnPrimary, styles.action]}
        >
          <Text style={commonStyles.btnText}>Practice sound changes</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/hangul')}
          style={[commonStyles.btn, commonStyles.btnSecondary, styles.action]}
        >
          <Text style={commonStyles.btnTextDark}>Return to jamo practice</Text>
        </Pressable>
      </View>
      <Text style={styles.disclaimer}>{TOPIC_CONTENT_STATUS}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  intro: { marginTop: 8 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 16 },
  metric: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: colors.white,
    color: colors.muted, fontSize: 13, borderRadius: 16, overflow: 'hidden' },
  topicCard: { gap: 10, marginBottom: 12 },
  cardHeading: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  number: { fontSize: 16, fontWeight: '800', color: colors.primary },
  stage: { color: colors.muted, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
  topicTitle: { fontSize: 20, lineHeight: 27, fontWeight: '800', color: colors.text },
  openLink: { fontSize: 16, fontWeight: '700', color: colors.primary },
  extra: { gap: 12, marginTop: 8 },
  action: { width: '100%' },
  disclaimer: { ...commonStyles.muted, marginTop: 16, fontStyle: 'italic' },
});
