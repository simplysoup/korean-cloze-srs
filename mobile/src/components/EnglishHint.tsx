import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

export interface EnglishHintPart {
  text: string;
  highlightType: string;
}

/** English hint line: 'direct' parts are red + underlined, 'related' amber. */
export default function EnglishHint({ parts }: { parts: EnglishHintPart[] }) {
  return (
    <View style={styles.hint}>
      <Text style={styles.hintText}>
        {parts.map((part, i) => (
          <Text
            key={i}
            style={
              part.highlightType === 'direct'
                ? styles.direct
                : part.highlightType === 'related'
                  ? styles.related
                  : undefined
            }
          >
            {part.text}
          </Text>
        ))}
      </Text>
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
  direct: {
    color: colors.redDark,
    textDecorationLine: 'underline',
  },
  related: {
    color: colors.orange,
  },
});
