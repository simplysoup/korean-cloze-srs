import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../components/theme';
import type { AnswerEvaluationResult } from './types';

type Props = { result: AnswerEvaluationResult };

const LABELS: Record<AnswerEvaluationResult['classification'], string> = {
  target_correct: 'Target grammar demonstrated',
  valid_off_target: 'Valid alternative · different grammar',
  near_miss: 'Close — check the form',
  incorrect: 'Not accepted for this exercise',
  unclassified: 'Needs editorial review',
};

/** Display-only feedback. The parent screen owns submission, review grading and FSRS. */
export function AnswerFeedbackPanel({ result }: Props) {
  const positive = result.classification === 'target_correct';
  return (
    <View style={styles.panel} accessibilityLabel={`Answer feedback: ${LABELS[result.classification]}`}>
      <Text style={[styles.heading, { color: positive ? colors.green : colors.text }]}>
        {LABELS[result.classification]}
      </Text>
      {result.expectedCanonicalAnswer !== null && (
        <Text style={styles.answer}>Expected: <Text style={styles.bold}>{result.expectedCanonicalAnswer}</Text></Text>
      )}
      <Text style={styles.body}>{result.feedback}</Text>
      {result.curatedAlternatives.length > 0 && (
        <View style={styles.alternatives}>
          <Text style={styles.subhead}>Also accepted for this card</Text>
          {result.curatedAlternatives.map((alt) => (
            <View key={`${alt.value}-${alt.classification}`} style={styles.altRow}>
              <Text style={styles.bold}>{alt.value}</Text>
              <Text style={styles.caption}>
                {alt.classification === 'target_correct'
                  ? 'Same target grammar'
                  : 'Different construction — no target mastery'}
              </Text>
            </View>
          ))}
        </View>
      )}
      {result.classification !== 'target_correct' && (
        <Text style={styles.note}>
          “Not correct for this exercise” does not necessarily mean “ungrammatical Korean”.
        </Text>
      )}
      {result.editorialReview === 'pending' && (
        <Text style={styles.editorial}>Editorial assessment; independent Korean educator review pending.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 16, gap: 10 },
  heading: { fontSize: 16, fontWeight: '700' },
  answer: { color: colors.text, fontSize: 16 },
  bold: { fontWeight: '700', color: colors.text },
  body: { color: colors.text, fontSize: 15, lineHeight: 23 },
  alternatives: { borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 10, gap: 6 },
  subhead: { fontSize: 14, fontWeight: '700', color: colors.text },
  altRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  caption: { fontSize: 13, color: colors.muted },
  note: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  editorial: { fontSize: 12, color: colors.muted, fontStyle: 'italic' },
});
