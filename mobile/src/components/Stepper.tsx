import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

/** A − value + stepper, shared by the Settings screen and deck pages. */
export default function Stepper({
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - step))}
        disabled={value <= min}
        style={[styles.stepButton, value <= min && styles.stepDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Decrease"
      >
        <Text style={styles.stepGlyph}>−</Text>
      </Pressable>
      <Text style={styles.stepValue}>{format(value)}</Text>
      <Pressable
        onPress={() => onChange(Math.min(max, value + step))}
        disabled={value >= max}
        style={[styles.stepButton, value >= max && styles.stepDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Increase"
      >
        <Text style={styles.stepGlyph}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgSecondaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDisabled: {
    opacity: 0.4,
  },
  stepGlyph: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  stepValue: {
    minWidth: 32,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
});
