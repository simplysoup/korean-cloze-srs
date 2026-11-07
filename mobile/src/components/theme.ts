import { StyleSheet } from 'react-native';

/** Dark-on-light theme matching the old Svelte app. */
export const colors = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  green: '#16a34a',
  red: '#dc2626',
  redDark: '#b91c1c',
  amber: '#b45309',
  text: '#1f2937',
  muted: '#6b7280',
  faint: '#c5c9d0',
  border: '#d1d5db',
  bg: '#ffffff',
  bgSecondary: '#f3f4f6',
  bgSecondaryDark: '#e5e7eb',
  white: '#ffffff',
} as const;

/** Shared button / layout styles. Every touch target is at least 44pt tall. */
export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    lineHeight: 22,
  },
  body: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  muted: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 16,
  },
  btn: {
    minHeight: 44,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnSecondary: {
    backgroundColor: colors.bgSecondaryDark,
  },
  btnDanger: {
    backgroundColor: colors.red,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  btnTextDark: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    width: '100%',
    maxWidth: 320,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 17,
    textAlign: 'center',
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.bg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
