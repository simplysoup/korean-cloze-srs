import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import {
  checkQueueItem,
  getDueQueue,
  getNextReviewAt,
  submitReview,
  type ReviewQueueItem,
} from '../../db';
import { formatNextReview, type Grade } from '../../lib/srs';
import { romanToHangul } from '../../lib/romanToHangul';
import ClozeSentence from '../../components/ClozeSentence';
import EnglishHint from '../../components/EnglishHint';
import MasteryPips from '../../components/MasteryPips';
import RatingButtons from '../../components/RatingButtons';
import { colors, commonStyles } from '../../components/theme';

type RevealState = 'hidden' | 'confirming' | 'revealed';

export default function ReviewScreen() {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [romanInputs, setRomanInputs] = useState<string[]>(['']);
  const [submitted, setSubmitted] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [altIndex, setAltIndex] = useState(0);
  const [revealState, setRevealState] = useState<RevealState>('hidden');
  const [autoFailed, setAutoFailed] = useState(false);
  const [rating, setRating] = useState<Grade>(3);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextReviewAt, setNextReviewAt] = useState<string | null>(null);

  const loadQueue = useCallback(() => {
    setQueue(getDueQueue(10));
    setQueueIndex(0);
    resetCardState();
    setNextReviewAt(getNextReviewAt());
  }, []);

  useFocusEffect(loadQueue);

  const currentCard = queue[queueIndex];
  const parts = currentCard ? currentCard.sentenceWithBlank.split('___') : [''];
  const blankCount = parts.length - 1;
  const hangulValues = romanInputs.map((r) => romanToHangul(r));
  const allBlankFilled = hangulValues.slice(0, blankCount).every((h) => h.trim() !== '');
  const allCorrect =
    submitted && currentCard ? checkQueueItem(currentCard, hangulValues.slice(0, blankCount)) : false;
  const placeholderText = currentCard
    ? [currentCard.grammar.tense, currentCard.grammar.register].filter(Boolean).join(', ') ||
      currentCard.grammar.hint
    : '';

  function resetCardState() {
    setRomanInputs(['']);
    setSubmitted(false);
    setAnswerRevealed(false);
    setAltIndex(0);
    setRevealState('hidden');
    setAutoFailed(false);
    setRating(3);
    setError(null);
  }

  function setRomanAt(index: number, value: string) {
    setRomanInputs((prev) => {
      const next = [...prev];
      while (next.length <= index) next.push('');
      next[index] = value;
      return next;
    });
  }

  function submit() {
    if (!currentCard || !allBlankFilled) return;
    setSubmitted(true);
  }

  function undo() {
    // Undo only restores the pre-submit input; the snapshot is the current
    // input, since nothing edits it after submit. Re-enable editing.
    setSubmitted(false);
    setAnswerRevealed(false);
  }

  function toggleReveal() {
    if (revealState === 'hidden') {
      // Revealing before answering (and getting it wrong) costs the card.
      if (!allCorrect && !submitted) {
        setRevealState('confirming');
      } else {
        setRevealState('revealed');
      }
    } else if (revealState === 'confirming') {
      setRevealState('revealed');
      setAutoFailed(true);
    } else {
      setRevealState('hidden');
    }
  }

  function cycleAlt() {
    if (!currentCard) return;
    setAltIndex((i) => (i + 1) % currentCard.answers.length);
  }

  async function next() {
    if (!currentCard || saving) return;
    setSaving(true);
    setError(null);
    // Revealing the info marks the review as failed, whatever the answer was.
    const finalRating: Grade = autoFailed ? 1 : allCorrect ? rating : 1;
    try {
      submitReview(currentCard.reviewCardId, finalRating, currentCard.clozeCardId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save this review.');
      setSaving(false);
      return;
    }
    setSaving(false);
    if (queueIndex + 1 >= queue.length) {
      // Queue finished: reload so the empty state (and next review time) shows.
      setQueue([]);
      setNextReviewAt(getNextReviewAt());
    } else {
      setQueueIndex((i) => i + 1);
      resetCardState();
    }
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!currentCard) {
    const next = nextReviewAt ? new Date(nextReviewAt) : null;
    return (
      <View style={commonStyles.centered}>
        <Text style={styles.emptyTitle}>🎉 All caught up!</Text>
        {next ? (
          <Text style={commonStyles.subtitle}>Next review in {formatNextReview(next)}.</Text>
        ) : (
          <Text style={commonStyles.subtitle}>
            No reviews scheduled yet. Start learning from the Learn tab!
          </Text>
        )}
        <Link href="/" asChild>
          <Pressable style={[commonStyles.btn, commonStyles.btnPrimary]}>
            <Text style={commonStyles.btnText}>Dashboard</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView
      style={commonStyles.screen}
      contentContainerStyle={[commonStyles.scrollContent, styles.content]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={commonStyles.muted}>
        {queueIndex + 1} / {queue.length}
      </Text>

      <ClozeSentence
        sentenceWithBlank={currentCard.sentenceWithBlank}
        hangulValues={hangulValues}
        submitted={submitted}
        answers={currentCard.answers}
        answerRevealed={answerRevealed}
        altIndex={altIndex}
        placeholder={placeholderText}
      />

      <EnglishHint parts={currentCard.englishHint} />

      <MasteryPips streakCorrect={currentCard.streakCorrect} masteredAt={currentCard.masteredAt} />

      {!submitted && !answerRevealed ? (
        <View style={styles.inputGroup}>
          {Array.from({ length: blankCount }, (_, i) => (
            <TextInput
              key={i}
              style={commonStyles.input}
              placeholder="Type romanized Korean…"
              placeholderTextColor={colors.faint}
              value={romanInputs[i] ?? ''}
              onChangeText={(v) => setRomanAt(i, v)}
              autoFocus={i === 0}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={() => {
                if (!submitted) submit();
              }}
            />
          ))}
        </View>
      ) : null}

      {submitted ? (
        <Text style={[styles.result, allCorrect && !autoFailed ? styles.resultCorrect : styles.resultIncorrect]}>
          {allCorrect && !autoFailed
            ? '✓ Correct!'
            : answerRevealed
              ? `Answer: ${currentCard.answers.join(' / ')}`
              : '✗ Incorrect'}
        </Text>
      ) : null}

      {error ? <Text style={styles.error}>⚠️ {error}</Text> : null}

      {/* Controls */}
      <View style={styles.controls}>
        {!submitted ? (
          <Pressable
            onPress={submit}
            disabled={!allBlankFilled}
            style={[
              commonStyles.btn,
              commonStyles.btnPrimary,
              styles.controlButton,
              !allBlankFilled ? commonStyles.btnDisabled : undefined,
            ]}
          >
            <Text style={commonStyles.btnText}>Check</Text>
          </Pressable>
        ) : allCorrect && !autoFailed ? (
          <>
            {currentCard.answers.length > 1 ? (
              <Pressable
                onPress={cycleAlt}
                style={[commonStyles.btn, commonStyles.btnSecondary, styles.controlButton]}
              >
                <Text style={commonStyles.btnTextDark}>Alt ({currentCard.answers[altIndex]})</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={next}
              disabled={saving}
              style={[
                commonStyles.btn,
                commonStyles.btnPrimary,
                styles.controlButton,
                saving ? commonStyles.btnDisabled : undefined,
              ]}
            >
              <Text style={commonStyles.btnText}>{saving ? 'Saving…' : 'Next →'}</Text>
            </Pressable>
          </>
        ) : (
          <>
            {!answerRevealed ? (
              <>
                <Pressable
                  onPress={() => setAnswerRevealed(true)}
                  style={[commonStyles.btn, commonStyles.btnDanger, styles.controlButton]}
                >
                  <Text style={commonStyles.btnText}>Show Answer</Text>
                </Pressable>
                <Pressable
                  onPress={undo}
                  style={[commonStyles.btn, commonStyles.btnSecondary, styles.controlButton]}
                >
                  <Text style={commonStyles.btnTextDark}>Undo</Text>
                </Pressable>
              </>
            ) : (
              <>
                {currentCard.answers.length > 1 ? (
                  <Pressable
                    onPress={cycleAlt}
                    style={[commonStyles.btn, commonStyles.btnSecondary, styles.controlButton]}
                  >
                    <Text style={commonStyles.btnTextDark}>
                      Alt ({currentCard.answers[altIndex]})
                    </Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={next}
                  disabled={saving}
                  style={[
                    commonStyles.btn,
                    commonStyles.btnPrimary,
                    styles.controlButton,
                    saving ? commonStyles.btnDisabled : undefined,
                  ]}
                >
                  <Text style={commonStyles.btnText}>{saving ? 'Saving…' : 'Next →'}</Text>
                </Pressable>
              </>
            )}
          </>
        )}
      </View>

      {/* Rating picker after a correct first attempt (defaults to Good). */}
      {submitted && allCorrect && !autoFailed ? (
        <View style={styles.ratingBlock}>
          <Text style={commonStyles.muted}>How well did you know it?</Text>
          <RatingButtons value={rating} onChange={setRating} disabled={saving} />
        </View>
      ) : null}

      {/* Reveal Info */}
      <View style={styles.revealBlock}>
        <Pressable onPress={toggleReveal} style={styles.ghostButton}>
          <Text style={styles.ghostText}>
            {revealState === 'hidden'
              ? 'Reveal Info'
              : revealState === 'confirming'
                ? '⚠️ Revealing will mark this review as failed. Tap again to confirm.'
                : 'Hide Info'}
          </Text>
        </Pressable>
        {revealState === 'revealed' ? (
          <View style={commonStyles.card}>
            <Text style={styles.grammarTitle}>{currentCard.grammar.title}</Text>
            <Text style={commonStyles.muted}>
              {currentCard.grammar.category}
              {currentCard.grammar.tense ? ` · ${currentCard.grammar.tense}` : ''}
              {currentCard.grammar.register ? ` · ${currentCard.grammar.register}` : ''}
            </Text>
            <Text style={[commonStyles.body, styles.grammarDescription]}>
              {currentCard.grammar.description}
            </Text>
            <Pressable
              onPress={() => router.push(`/grammar/${currentCard.grammarPointId}`)}
              style={[commonStyles.btn, commonStyles.btnSecondary, styles.viewGrammarButton]}
            >
              <Text style={commonStyles.btnTextDark}>View Grammar →</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: 18,
    paddingTop: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  inputGroup: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  result: {
    fontSize: 18,
    fontWeight: '600',
  },
  resultCorrect: {
    color: colors.green,
  },
  resultIncorrect: {
    color: colors.red,
  },
  error: {
    fontSize: 14,
    color: colors.redDark,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  controlButton: {
    minWidth: 120,
  },
  ratingBlock: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  revealBlock: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  ghostButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  ghostText: {
    fontSize: 14,
    color: colors.muted,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  grammarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  grammarDescription: {
    marginTop: 8,
  },
  viewGrammarButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
});
