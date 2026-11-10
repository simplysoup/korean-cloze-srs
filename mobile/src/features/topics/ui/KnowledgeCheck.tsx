import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, commonStyles } from '../../../components/theme';
import type { TopicCheck } from '../catalog';
import type { TopicAttempt } from '../session';

interface KnowledgeCheckProps {
  check: TopicCheck;
  index: number;
  total: number;
  attempt?: TopicAttempt;
  onSelect: (choiceIndex: number) => void;
}

export function KnowledgeCheck({ check, index, total, attempt, onSelect }: KnowledgeCheckProps) {
  const done = attempt?.everCorrect === true;
  const hasAnswer = attempt !== undefined;
  return (
    <View style={[commonStyles.card, styles.container]} accessible={false}>
      <Text accessibilityRole="header" style={styles.label}>CHECK {index + 1} OF {total}</Text>
      <Text style={styles.prompt}>{check.prompt}</Text>
      <View style={styles.choices}>
        {check.choices.map((choice, choiceIndex) => {
          const selected = choiceIndex === attempt?.selectedIndex;
          return (
            <Pressable
              key={choiceIndex}
              accessibilityRole="radio"
              accessibilityLabel={'Answer ' + (choiceIndex + 1) + ': ' + choice}
              accessibilityState={{ checked: selected, disabled: done }}
              onPress={() => onSelect(choiceIndex)}
              disabled={done}
              style={[
                styles.choice,
                selected && (done ? styles.correctChoice : styles.incorrectChoice),
              ]}
            >
              <Text style={[styles.choiceText, selected && styles.selectedText]}>
                {String.fromCharCode(65 + choiceIndex)}. {choice}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {hasAnswer ? (
        <View accessibilityLiveRegion="polite" style={styles.feedback}>
          <Text style={[styles.result, done ? styles.correctText : styles.tryAgainText]}>
            {done ? 'Correct' : 'Not quite — try another answer'}
          </Text>
          <Text style={commonStyles.body}>{check.explanation}</Text>
          <Text style={commonStyles.muted}>
            {done ? 'Check complete for this visit.' : 'Choose again to demonstrate understanding.'}
          </Text>
        </View>
      ) : (
        <Text style={commonStyles.muted}>Choose one answer to see an explanation.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '800', color: colors.muted, letterSpacing: 1 },
  prompt: { fontSize: 18, lineHeight: 26, fontWeight: '700', color: colors.text },
  choices: { gap: 8, accessibilityRole: 'radiogroup' } as never,
  choice: {
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgSecondary,
    borderRadius: 8, minHeight: 48, padding: 12, justifyContent: 'center',
  },
  correctChoice: { borderColor: colors.green, backgroundColor: '#E2F2E9' },
  incorrectChoice: { borderColor: colors.orange, backgroundColor: '#FFF3E3' },
  choiceText: { fontSize: 16, lineHeight: 23, color: colors.text },
  selectedText: { fontWeight: '700' },
  feedback: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 6 },
  result: { fontWeight: '800', fontSize: 16 },
  correctText: { color: colors.green },
  tryAgainText: { color: colors.redDark },
});
