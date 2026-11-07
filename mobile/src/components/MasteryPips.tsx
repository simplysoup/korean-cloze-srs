import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

const TOTAL_PIPS = 8; // 8 correct in a row masters a grammar point.

interface MasteryPipsProps {
  streakCorrect: number;
  masteredAt: string | null;
}

/** 8 mastery pips (filled = current correct streak) + a Mastered badge. */
export default function MasteryPips({ streakCorrect, masteredAt }: MasteryPipsProps) {
  const mastered = masteredAt !== null;
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {Array.from({ length: TOTAL_PIPS }, (_, i) => (
          <View
            key={i}
            style={[
              styles.pip,
              i < streakCorrect ? styles.pipFilled : undefined,
              mastered ? styles.pipMastered : undefined,
            ]}
          />
        ))}
      </View>
      {mastered ? <Text style={styles.badge}>✓ Mastered</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bar: {
    flexDirection: 'row',
    gap: 4,
  },
  pip: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.bgSecondaryDark,
  },
  pipFilled: {
    backgroundColor: colors.green,
  },
  pipMastered: {
    backgroundColor: colors.primary,
  },
  badge: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },
});
