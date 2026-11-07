import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Grade } from '../lib/srs';
import { colors, commonStyles } from './theme';

const RATINGS: { grade: Grade; label: string }[] = [
  { grade: 1, label: 'Again' },
  { grade: 2, label: 'Hard' },
  { grade: 3, label: 'Good' },
  { grade: 4, label: 'Easy' },
];

interface RatingButtonsProps {
  value: Grade;
  onChange: (grade: Grade) => void;
  disabled?: boolean;
}

/** FSRS 1–4 rating buttons. Defaults to Good (3) — the caller owns the state. */
export default function RatingButtons({ value, onChange, disabled }: RatingButtonsProps) {
  return (
    <View style={styles.row}>
      {RATINGS.map(({ grade, label }) => {
        const selected = value === grade;
        return (
          <Pressable
            key={grade}
            onPress={() => onChange(grade)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled: disabled ?? false }}
            style={[
              commonStyles.btn,
              styles.button,
              selected ? styles.selected : styles.unselected,
              disabled ? commonStyles.btnDisabled : undefined,
            ]}
          >
            <Text style={selected ? styles.selectedText : styles.unselectedText}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    paddingHorizontal: 8,
  },
  selected: {
    backgroundColor: colors.primary,
  },
  unselected: {
    backgroundColor: colors.bgSecondaryDark,
  },
  selectedText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  unselectedText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});
