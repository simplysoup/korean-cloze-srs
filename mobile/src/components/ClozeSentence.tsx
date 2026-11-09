import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

interface ClozeSentenceProps {
  /** Sentence containing one or more '___' blanks. */
  sentenceWithBlank: string;
  /** Live Hangul value per blank (from romanToHangul). */
  hangulValues: string[];
  submitted: boolean;
  /** All acceptable answers (used for correctness + revealed display). */
  answers: string[];
  answerRevealed: boolean;
  /** Which answer to show when revealed / in the Alt button. */
  altIndex?: number;
  /** Faint text shown in an empty blank (e.g. tense/register hint). */
  placeholder?: string;
}

/**
 * Renders a cloze sentence with the live Hangul value in each blank.
 * Blank colour: green when submitted-correct, red when submitted-wrong,
 * blue when the answer is revealed, faint placeholder when empty.
 */
export default function ClozeSentence({
  sentenceWithBlank,
  hangulValues,
  submitted,
  answers,
  answerRevealed,
  altIndex = 0,
  placeholder = '',
}: ClozeSentenceProps) {
  const parts = sentenceWithBlank.split('___');
  const blankCount = parts.length - 1;

  return (
    <View style={styles.sentence}>
      {parts.map((part, i) => {
        const isLast = i === blankCount;
        const hangul = hangulValues[i] ?? '';
        const isEmpty = hangul.trim() === '';
        const blankCorrect =
          submitted && !isEmpty && answers.some((a) => a === hangul.trim());
        const blankIncorrect = submitted && !blankCorrect;
        return (
          <Text key={i} style={styles.sentenceText}>
            {part}
            {!isLast && (
              <Text
                style={[
                  styles.blank,
                  isEmpty && !answerRevealed ? styles.blankPlaceholder : undefined,
                  blankCorrect && !answerRevealed ? styles.blankCorrect : undefined,
                  blankIncorrect && !answerRevealed ? styles.blankIncorrect : undefined,
                  answerRevealed ? styles.blankRevealed : undefined,
                ]}
              >
                {answerRevealed
                  ? answers[altIndex] ?? answers[0] ?? ''
                  : isEmpty
                    ? placeholder || BLANK_FILLER
                    : hangul}
              </Text>
            )}
          </Text>
        );
      })}
    </View>
  );
}

/**
 * An empty blank has no text, so a nested Text with no content renders
 * zero-width and its underline disappears. A run of non-breaking spaces
 * keeps the blank wide enough for the underline to show.
 */
const BLANK_FILLER = '\u00A0\u00A0\u00A0\u00A0';

const styles = StyleSheet.create({
  sentence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentenceText: {
    fontSize: 26,
    lineHeight: 40,
    color: colors.text,
  },
  // Hard underline: thick and dark, so the blank is obvious even before
  // anything is typed. Correctness states keep their own colours.
  blank: {
    fontSize: 26,
    lineHeight: 40,
    borderBottomWidth: 3,
    borderBottomColor: colors.text,
    paddingHorizontal: 4,
  },
  blankPlaceholder: {
    fontSize: 14,
    color: colors.faint,
  },
  blankCorrect: {
    color: colors.green,
    borderBottomColor: colors.green,
  },
  blankIncorrect: {
    color: colors.red,
    borderBottomColor: colors.red,
  },
  blankRevealed: {
    color: colors.primaryDark,
    borderBottomColor: colors.primaryDark,
  },
});
