import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

/**
 * English hint line: the plain English translation of the Korean
 * sentence, rendered unhighlighted. There is no highlighting — English
 * often has no equivalent for Korean particles (은/는, 이/가, 을/를),
 * so any highlighted English word is a guess. (Build 25 removed it.)
 */
export default function EnglishHint({ text }: { text: string }) {
  return (
    <View style={styles.hint}>
      <Text style={styles.hintText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    alignItems: 'center',
  },
  hintText: {
    fontSize: 17,
    lineHeight: 24,
    color: colors.muted,
    textAlign: 'center',
  },
});
