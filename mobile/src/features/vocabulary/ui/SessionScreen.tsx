import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Pressable, StyleSheet, Text, TextInput,
  useWindowDimensions, View,
} from 'react-native';
import { colors } from '../../../components/theme';
import { getFoundationEntry } from './content';
import { CountChip, VocabButton, VocabularyPage, VocabularyPanel, VocabularyState, vocabStyles } from './Components';
import {
  directionLabel, feedbackLabel, promptContext, verifiedAlternatives,
} from './presentation';
import { currentPrompt, type SessionFeedback, type VocabularySessionState } from './session-state';

function Feedback({
  feedback, onNext, onRetry, nextLabel,
}: {
  feedback: SessionFeedback;
  onNext: () => void;
  onRetry: () => void;
  nextLabel: string;
}) {
  const evaluated = feedback.kind === 'graded' ? feedback.result.evaluation : null;
  const isCorrect = evaluated?.outcome === 'target_correct';
  const heading = evaluated ? feedbackLabel(evaluated) : 'Answer revealed';
  const canonical = evaluated?.canonicalAnswer ?? (
    feedback.kind === 'revealed' ? feedback.result.canonicalAnswer : ''
  );
  const alternatives = verifiedAlternatives(
    evaluated?.acceptedAlternatives ?? (
      feedback.kind === 'revealed' ? feedback.result.acceptedAlternatives : []
    ),
  );
  const explanation = evaluated?.explanation ?? (
    feedback.kind === 'revealed' ? feedback.result.explanation : ''
  );
  const canRetry = evaluated?.outcome === 'near_miss' && evaluated.retryAllowed;

  return (
    <VocabularyPanel>
      <View accessibilityLiveRegion="polite" style={styles.feedbackHead}>
        <Text style={[styles.feedbackTitle, { color: isCorrect ? colors.green : colors.text }]}
          accessibilityRole="header">
          {isCorrect ? '✓ ' : '! '}{heading}
        </Text>
        <Text style={vocabStyles.muted}>
          {feedback.kind === 'revealed'
            ? 'This reveal did not count as successful recall or update your review schedule.'
            : feedback.result.progress === null
              ? 'Answer evaluated. No vocabulary scheduling change was recorded.'
              : isCorrect
                ? 'Vocabulary review recorded. Grammar mastery was not affected.'
                : 'Vocabulary review recorded. No grammar mastery awarded.'}
        </Text>
      </View>
      <Text style={vocabStyles.label}>EXPECTED IN THIS CONTEXT</Text>
      <Text style={styles.answerText} selectable>{canonical}</Text>
      {alternatives.length ? (
        <View style={styles.alternatives}>
          <Text style={vocabStyles.sectionTitle}>Also accepted in this context</Text>
          {alternatives.map((alternative) => (
            <View key={alternative.answer} style={styles.alternative}>
              <Text selectable style={vocabStyles.body}>{alternative.answer}</Text>
              {alternative.note ? <Text style={vocabStyles.muted}>{alternative.note}</Text> : null}
            </View>
          ))}
        </View>
      ) : null}
      {explanation ? <Text style={vocabStyles.body}>{explanation}</Text> : null}
      {evaluated?.errorType ? (
        <Text style={vocabStyles.muted}>Check: {evaluated.errorType.replace(/_/g, ' ')}</Text>
      ) : null}
      {canRetry ? <VocabButton label="Try the answer again" onPress={onRetry} variant="secondary" /> : null}
      <VocabButton label={nextLabel} onPress={onNext} />
    </VocabularyPanel>
  );
}

export function VocabularySessionScreen({
  state, deckTitle, saving, error, submit, reveal, next, retry,
  leave, reviewMissed, retrySave,
}: {
  state: VocabularySessionState;
  deckTitle: string;
  saving: boolean;
  error: string | null;
  submit: (answer: string) => void;
  reveal: () => void;
  next: () => void;
  retry: () => void;
  leave: () => void;
  reviewMissed: () => void;
  retrySave: () => void;
}) {
  const [answer, setAnswer] = useState('');
  const [focused, setFocused] = useState(false);
  const { width } = useWindowDimensions();
  const prompt = currentPrompt(state);
  const entry = prompt ? getFoundationEntry(prompt.entryId) : null;
  const heading = state.mode === 'learn'
    ? 'Learn vocabulary'
    : state.mode === 'missed' ? 'Review missed vocabulary' : 'Vocabulary review';

  // A route remount preserves the provider's cursor and completed reviews.
  // Clear text only when moving to another card, never for a rejected save.
  useEffect(() => {
    setAnswer('');
  }, [state.key, state.index]);

  const leaveControl = (
    <View style={styles.topAction}>
      <VocabButton label="← Leave session" onPress={leave} variant="quiet" />
    </View>
  );

  if (state.prompts.length === 0) {
    return (
      <VocabularyPage title={heading} back={leaveControl}>
        <VocabularyState
          title="Nothing to review here"
          description={state.mode === 'learn'
            ? 'There are no new words in this selection. Try another deck or review due words.'
            : 'There are no due words matching this selection right now.'}
        />
        <VocabButton label="Back to deck" onPress={leave} />
      </VocabularyPage>
    );
  }

  if (state.phase === 'complete') {
    return (
      <VocabularyPage title="Vocabulary session complete" back={leaveControl}>
        <VocabularyPanel>
          <Text style={vocabStyles.body}>Your answered vocabulary reviews have been committed by the vocabulary engine.</Text>
          <View style={vocabStyles.row}>
            <CountChip label="Attempts" value={state.attempts} />
            <CountChip label="Correct" value={state.correct} />
            <CountChip label="Near misses" value={state.nearMiss} />
            <CountChip label="Missed" value={state.missedPromptIds.length} />
          </View>
          {state.missedPromptIds.length ? (
            <VocabButton label="Practice missed entries again" onPress={reviewMissed} />
          ) : (
            <Text style={vocabStyles.muted}>No missed entries in this session.</Text>
          )}
          <VocabButton label="Back to decks" onPress={leave} variant="secondary" />
        </VocabularyPanel>
      </VocabularyPage>
    );
  }

  if (!prompt) {
    return (
      <VocabularyPage title={heading} back={leaveControl}>
        <VocabularyState title="Session unavailable" description="The current prompt could not be loaded." />
      </VocabularyPage>
    );
  }

  const intro = state.phase === 'introduction';
  const isFeedback = state.phase === 'feedback';
  const isProduction = prompt.direction !== 'korean_to_english';
  const contexts = promptContext(prompt, deckTitle, entry);

  return (
    <VocabularyPage
      title={heading}
      subtitle={deckTitle + ' · ' + (state.index + 1) + ' of ' + state.prompts.length}
      back={leaveControl}
    >
      <View
        style={styles.progressTrack}
        accessibilityLabel={(state.index + 1) + ' of ' + state.prompts.length + ' entries'}
      >
        <View style={[styles.progressFill, {
          width: ((state.index + (isFeedback ? 1 : 0)) / state.prompts.length * 100) + '%',
        }]} />
      </View>

      {intro ? (
        <VocabularyPanel>
          <Text style={vocabStyles.label}>NEW VOCABULARY</Text>
          <Text style={[vocabStyles.korean, width < 360 && styles.koreanSmall]} selectable>{entry?.front ?? prompt.canonicalAnswer}</Text>
          <Text style={vocabStyles.meaning}>{entry?.meaning ?? prompt.cue}</Text>
          {entry?.spokenForm ? (
            <Text style={vocabStyles.muted}>Spoken form: {entry.spokenForm}</Text>
          ) : null}
          {entry?.variant ? (
            <View style={styles.infoBox}>
              <Text style={vocabStyles.label}>CONTEXTUAL FORM</Text>
              <Text style={vocabStyles.body} selectable>{entry.variant}</Text>
              {entry.usageNote ? <Text style={vocabStyles.muted}>{entry.usageNote}</Text> : null}
            </View>
          ) : entry?.usageNote ? <Text style={vocabStyles.body}>{entry.usageNote}</Text> : null}
          {entry?.usageExample ? (
            <View style={styles.infoBox}>
              <Text style={vocabStyles.label}>USAGE EXAMPLE</Text>
              <Text style={vocabStyles.body} selectable>{entry.usageExample.korean}</Text>
              <Text style={vocabStyles.muted}>{entry.usageExample.english}</Text>
            </View>
          ) : null}
          <VocabButton label="Continue to practice" onPress={next} />
        </VocabularyPanel>
      ) : (
        <>
          <VocabularyPanel>
            <Text style={vocabStyles.label}>{directionLabel(prompt.direction)}</Text>
            <Text
              style={[isProduction ? vocabStyles.meaning : vocabStyles.korean,
                !isProduction && width < 360 && styles.koreanSmall]}
              selectable
              accessibilityRole="header"
            >
              {prompt.cue}
            </Text>
            {contexts.length ? (
              <View style={styles.context}>
                <Text style={vocabStyles.label}>CONTEXT FOR THIS ANSWER</Text>
                {contexts.map((value, index) => (
                  <Text key={index} style={vocabStyles.muted} selectable>{value}</Text>
                ))}
              </View>
            ) : null}
            {!isFeedback ? (
              <>
                <Text style={styles.inputLabel}>
                  {isProduction ? 'Type the Korean answer in Hangul' : 'Type the English meaning'}
                </Text>
                <TextInput
                  testID="vocab-review-answer"
                  value={answer}
                  onChangeText={setAnswer}
                  onSubmitEditing={() => !saving && submit(answer)}
                  returnKeyType="done"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!saving}
                  accessibilityLabel={isProduction ? 'Korean answer in Hangul' : 'English meaning'}
                  accessibilityHint="Press Enter or activate Check answer to submit"
                  placeholder={isProduction ? '한국어로 입력하세요' : 'Your meaning'}
                  placeholderTextColor={colors.muted}
                  style={[styles.input, focused && styles.inputFocused]}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                />
                {error ? (
                  <View style={styles.error} accessibilityLiveRegion="assertive">
                    <Text style={styles.errorText}>{error}</Text>
                    <VocabButton label="Retry saving answer" onPress={retrySave} variant="secondary" />
                  </View>
                ) : null}
                <VocabButton label={saving ? 'Checking…' : 'Check answer'} onPress={() => submit(answer)} disabled={saving || !answer.trim()} />
                <VocabButton label="Reveal answer (no credit)" onPress={reveal} disabled={saving} variant="quiet" />
                {saving ? <ActivityIndicator color={colors.primary} accessibilityLabel="Saving vocabulary response" /> : null}
              </>
            ) : null}
          </VocabularyPanel>
          {state.feedback ? (
            <Feedback
              feedback={state.feedback}
              nextLabel={state.index === state.prompts.length - 1 ? 'Finish session' : 'Next word'}
              onNext={next}
              onRetry={retry}
            />
          ) : null}
        </>
      )}
      <Text style={vocabStyles.muted}>
        You can leave and return without losing committed answers. Vocabulary and grammar progress remain separate.
      </Text>
    </VocabularyPage>
  );
}

const styles = StyleSheet.create({
  topAction: { alignItems: 'flex-start' },
  progressTrack: { height: 5, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: colors.primary },
  koreanSmall: { fontSize: 30, lineHeight: 46 },
  infoBox: { padding: 12, borderRadius: 8, backgroundColor: colors.bgSecondary, gap: 6 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 6 },
  input: {
    width: '100%', minHeight: 52, borderWidth: 2, borderColor: colors.border,
    borderRadius: 12, backgroundColor: colors.white, color: colors.text,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 20,
  },
  inputFocused: { borderColor: colors.blue },
  context: { gap: 6, padding: 10, borderRadius: 8, backgroundColor: colors.bgSecondary },
  feedbackHead: { gap: 6 },
  feedbackTitle: { fontSize: 20, lineHeight: 28, fontWeight: '800' },
  answerText: { fontSize: 27, lineHeight: 40, color: colors.text, fontWeight: '700' },
  alternatives: { gap: 8 },
  alternative: { gap: 4, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  error: { backgroundColor: '#FFF4F2', padding: 12, gap: 8, borderRadius: 8 },
  errorText: { fontSize: 14, lineHeight: 22, color: colors.redDark },
});
