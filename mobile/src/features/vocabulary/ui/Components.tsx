import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { colors, commonStyles } from '../../../components/theme';

export function VocabularyPage({
  title, subtitle, children, back,
}: {
  title: string; subtitle?: string; children: ReactNode; back?: ReactNode;
}) {
  return (
    <ScrollView
      style={commonStyles.screen}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      accessibilityLabel={title}
    >
      {back}
      <Text style={styles.pageTitle} accessibilityRole="header">{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </ScrollView>
  );
}

export function VocabButton({
  label, onPress, variant = 'primary', disabled = false, testID,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'quiet';
  disabled?: boolean;
  testID?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      focusable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      testID={testID}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.buttonPrimary :
          variant === 'quiet' ? styles.buttonQuiet : styles.buttonSecondary,
        pressed && styles.pressed,
        disabled && styles.disabled,
        focused && styles.focused,
      ]}
    >
      <Text style={variant === 'primary' ? styles.buttonTextPrimary : styles.buttonTextSecondary}>
        {label}
      </Text>
    </Pressable>
  );
}

export function VocabularyPanel({ children }: { children: ReactNode }) {
  return <View style={styles.panel}>{children}</View>;
}

export function VocabularyState({
  title, description, loading = false, retry,
}: {
  title: string; description?: string; loading?: boolean; retry?: () => void;
}) {
  return (
    <VocabularyPanel>
      <View style={styles.state}>
        {loading ? <ActivityIndicator color={colors.primary} accessibilityLabel="Loading vocabulary" /> : null}
        <Text style={styles.stateTitle} accessibilityRole="header">{title}</Text>
        {description ? <Text style={styles.stateDescription}>{description}</Text> : null}
        {retry ? <VocabButton label="Try again" onPress={retry} variant="secondary" /> : null}
      </View>
    </VocabularyPanel>
  );
}

export function CountChip({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.chip} accessibilityLabel={label + ': ' + value}>
      <Text style={styles.chipValue}>{value}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

export const vocabStyles = StyleSheet.create({
  sectionTitle: { fontSize: 18, color: colors.text, fontWeight: '700', marginTop: 8, marginBottom: 8 },
  body: { color: colors.text, fontSize: 16, lineHeight: 24 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  korean: {
    color: colors.text, fontSize: 38, lineHeight: 55, textAlign: 'center',
    fontWeight: '600', flexShrink: 1, includeFontPadding: true,
  },
  meaning: { color: colors.text, fontSize: 22, textAlign: 'center', lineHeight: 32, flexShrink: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  space: { height: 12 },
  label: { color: colors.primaryDark, fontWeight: '700', fontSize: 13, letterSpacing: 0.4 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 14 },
});

const styles = StyleSheet.create({
  scroll: {
    width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 16,
    paddingTop: 24, paddingBottom: 48, gap: 12,
  },
  pageTitle: { fontSize: 27, lineHeight: 36, color: colors.text, fontWeight: '800' },
  subtitle: { fontSize: 16, lineHeight: 23, color: colors.muted, marginBottom: 8 },
  panel: {
    backgroundColor: colors.white, borderRadius: 10, borderWidth: 1,
    borderColor: '#E4E4E4', padding: 20, gap: 12,
  },
  button: {
    minHeight: 48, minWidth: 48, borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonSecondary: { backgroundColor: colors.white, borderColor: colors.border },
  buttonQuiet: { backgroundColor: colors.bgSecondary },
  buttonTextPrimary: { color: colors.white, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  buttonTextSecondary: { color: colors.text, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  focused: { borderColor: colors.blue, borderWidth: 2 },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.5 },
  state: { paddingVertical: 24, alignItems: 'center', gap: 12 },
  stateTitle: { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center' },
  stateDescription: { fontSize: 15, lineHeight: 22, color: colors.muted, textAlign: 'center' },
  chip: {
    backgroundColor: colors.bgSecondary, minWidth: 92, minHeight: 68,
    paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center', borderRadius: 8, gap: 4,
  },
  chipValue: { color: colors.text, fontSize: 21, fontWeight: '800' },
  chipLabel: { color: colors.muted, fontSize: 13 },
});
