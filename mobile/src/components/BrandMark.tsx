import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

/**
 * Munpro logo mark: a coral-red square with the 문 glyph, plus the
 * "Munpro" wordmark. 문법 (munbeop) = grammar — the Korean parallel to
 * Bunpro's 文. Used on the auth screens and in the app header.
 */
export default function BrandMark({
  size = 44,
  dark = false,
  showWordmark = true,
}: {
  size?: number;
  /** On the teal-navy header the wordmark is white. */
  dark?: boolean;
  showWordmark?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={[styles.mark, { width: size, height: size, borderRadius: Math.max(6, size / 6) }]}>
        <Text style={[styles.glyph, { fontSize: size * 0.55 }]}>문</Text>
      </View>
      {showWordmark ? (
        <Text style={[styles.wordmark, { fontSize: size * 0.55, color: dark ? '#fff' : colors.text }]}>
          Munpro
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mark: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    color: '#fff',
    fontWeight: '800',
  },
  wordmark: {
    fontWeight: '800',
  },
});
