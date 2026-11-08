import { StyleSheet } from 'react-native';

/**
 * Munpro theme — modelled on Bunpro's flat, minimal look:
 * light-grey page, white cards, dark navy text, coral-red primary,
 * teal-navy header. Green = known/correct, blue = advance, orange =
 * caution — only those meanings, nowhere else. No gradients except the
 * CTA button (which is a flat coral-red here; the app stays flat).
 */
export const colors = {
  primary: '#C74A4A', // coral-red CTA / headwords / badges
  primaryDark: '#A83A3A',
  navy: '#082630', // teal-navy header
  green: '#2E9E5B', // known / correct
  blue: '#2F7FC4', // advance
  orange: '#E08A2E', // caution notes
  red: '#C74A4A',
  redDark: '#9E3636',
  text: '#1A2B33', // dark navy text
  muted: '#6B7A80',
  faint: '#A8B4B9',
  border: '#D9D9D9',
  bg: '#EDEDED', // light-grey page background
  bgSecondary: '#F5F5F5',
  bgSecondaryDark: '#E0E0E0',
  white: '#FCFCFC',
} as const;

/** Shared button / layout styles. Every touch target is at least 44pt tall. */
export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  /** Centered content column (max 640px) for scrollable screens. */
  scrollContent: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: colors.bg,
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
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
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
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  /** Bunpro-style pill input for review answers. */
  pillInput: {
    width: '100%',
    maxWidth: 360,
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 18,
    textAlign: 'center',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.white,
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
