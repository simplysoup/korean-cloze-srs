import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import {
  checkQueueItem,
  getDueQueue,
  getNextReviewAt,
  getUserSettings,
  submitReview,
  type ReviewQueueItem,
  type UserSettings,
} from '../../store';
import { formatNextReview, ratingForCheck, srsRankLabel, answerExplanation } from '../../lib/srs';
import { romanToHangul } from '../../lib/romanToHangul';
import { syncNow } from '../../lib/sync';
import ClozeSentence from '../../components/ClozeSentence';
import EnglishHint from '../../components/EnglishHint';
import { colors, commonStyles } from '../../components/theme';

/**
 * Bunpro-style Reviews: minimal screen, sentence centered in large type,
 * nuance hint above the blank, English hint below, one pill-shaped input
 * at the bottom. Misses go to a Wrap-Up round and re-queue until answered
 * correctly; the session ends with a Summary screen.
 */

export default function ReviewScreen() {
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [missed, setMissed] = useState<ReviewQueueItem[]>([]);
  const [round, setRound] = useState<'main' | 'wrapup'>('main');
  const [romanInputs, setRomanInputs] = useState<string[]>(['']);
  const [submitted, setSubmitted] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [altIndex, setAltIndex] = useState(0);
  const [autoFailed, setAutoFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextReviewAt, setNextReviewAt] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [summary, setSummary] = useState(false);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  const loadQueue = useCallback(() => {
    setSettings(getUserSettings());
    setQueue(getDueQueue(10));
    setQueueIndex(0);
    setMissed([]);
    setRound('main');
    setRight(0);
    setWrong(0);
    setSummary(false);
    resetCardState();
    setNextReviewAt(getNextReviewAt());
  }, []);

  useFocusEffect(loadQueue);

  const currentCard = summary ? undefined : queue[queueIndex];
  const parts = currentCard ? currentCard.sentenceWithBlank.split('___') : [''];
  const blankCount = parts.length - 1;
  const hangulValues = romanInputs.map((r) => romanToHangul(r));
  const allBlankFilled = hangulValues.slice(0, blankCount).every((h) => h.trim() !== '');
  const isCorrect =
    currentCard ? checkQueueItem(currentCard, hangulValues.slice(0, blankCount)) : false;
  const allCorrect = submitted && isCorrect;
  const nuanceHint = currentCard
    ? [currentCard.grammar.tense, currentCard.grammar.register].filter(Boolean).join(' · ') ||
      currentCard.grammar.hint
    : '';
  const rank = currentCard
    ? srsRankLabel(currentCard.fsrsState, currentCard.stability, currentCard.masteredAt !== null)
    : '';
  const remaining = currentCard ? queue.length - queueIndex : 0;
  // Thin session progress bar (Bunpro has one along the top edge): the
  // fraction of cards completed, counting the current card once submitted.
  const sessionProgressPct =
    queue.length > 0 ? ((queueIndex + (submitted ? 1 : 0)) / queue.length) * 100 : 0;

  // Targeted explanation for a wrong answer (에/에서 confusion, particle
  // pairs) — ported from the old app's answers.ts.
  const explanation =
    currentCard && submitted && !allCorrect
      ? answerExplanation(
          currentCard.grammarPointId,
          currentCard.wordReplacement || currentCard.answers[0] || '',
          hangulValues[0] ?? '',
        )
      : undefined;

  function resetCardState() {
    setRomanInputs(['']);
    setSubmitted(false);
    setAnswerRevealed(false);
    setAltIndex(0);
    setAutoFailed(false);
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
    if (isCorrect) {
      setRight((n) => n + 1);
    } else {
      setWrong((n) => n + 1);
    }
    // Lightning mode: advance immediately on a correct answer, with no
    // confirmation step.
    if (isCorrect && settings?.lightningMode) {
      void next(true);
      return;
    }
    setSubmitted(true);
  }

  function undo() {
    // Undo only restores the pre-submit input; re-enable editing.
    setSubmitted(false);
    setAnswerRevealed(false);
  }

  // No hint system (dropped in build 23). The Meaning stage was the
  // question itself, the Sound stage (romanization) was the answer, and
  // the formation-rule stage gave the answer away for binary points
  // (the rule + the visible word before the blank determines the form).
  // Until a genuinely useful hint is designed, the only pre-submit escape
  // is Show Answer below: it reveals the answer, marks the card failed,
  // and submits the card so Next appears — the same fail-and-advance
  // behaviour the old full-reveal stage had, but labelled honestly
  // instead of pretending to be a hint.
  function revealAnswer() {
    if (!currentCard) return;
    setAnswerRevealed(true);
    setAutoFailed(true);
    setSubmitted(true);
    setWrong((n) => n + 1);
  }

  function cycleAlt() {
    if (!currentCard) return;
    setAltIndex((i) => (i + 1) % currentCard.answers.length);
  }

  async function next(correct: boolean) {
    if (!currentCard || saving) return;
    setSaving(true);
    setError(null);
    // Revealing the answer marks the review as failed, whatever was typed.
    const finalRating = autoFailed ? 1 : ratingForCheck(correct);
    try {
      submitReview(currentCard.reviewCardId, finalRating, currentCard.clozeCardId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save this review.');
      setSaving(false);
      return;
    }
    setSaving(false);
    const wasMiss = autoFailed || !correct;
    const nextMissed = wasMiss ? [...missed, currentCard] : missed;
    if (queueIndex + 1 < queue.length) {
      setMissed(nextMissed);
      setQueueIndex((i) => i + 1);
      resetCardState();
    } else if (nextMissed.length > 0) {
      // Round over with misses: Wrap-Up round — missed cards recur until correct.
      setQueue(nextMissed);
      setQueueIndex(0);
      setMissed([]);
      setRound('wrapup');
      resetCardState();
    } else {
      setQueue([]);
      setNextReviewAt(getNextReviewAt());
      setSummary(true);
      // Session done: back the progress up to the server (best-effort).
      void syncNow();
    }
  }

  // ── Summary screen ─────────────────────────────────────────────────────────
  if (summary) {
    const total = right + wrong;
    return (
      <View style={commonStyles.centered}>
        <Text style={styles.bigTitle}>Session Complete!</Text>
        <Text style={commonStyles.subtitle}>
          {right} right · {wrong} wrong
          {total > 0 ? ` — ${Math.round((right / total) * 100)}% correct` : ''}
        </Text>
        <Text style={commonStyles.muted}>
          {round === 'wrapup'
            ? 'Missed cards were re-tested in the Wrap-Up round until every one was answered correctly.'
            : 'Every card was answered correctly.'}
        </Text>
        <Link href="/" asChild>
          <Pressable style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnPrimary, styles.wideButton])}>
            <Text style={commonStyles.btnText}>Dashboard</Text>
          </Pressable>
        </Link>
        <Pressable
          onPress={loadQueue}
          style={[commonStyles.btn, commonStyles.btnSecondary, styles.wideButton]}
        >
          <Text style={commonStyles.btnTextDark}>Review Again</Text>
        </Pressable>
      </View>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!currentCard) {
    const next = nextReviewAt ? new Date(nextReviewAt) : null;
    return (
      <View style={commonStyles.centered}>
        <Text style={styles.emptyTitle}>All caught up!</Text>
        {next ? (
          <Text style={commonStyles.subtitle}>Next review in {formatNextReview(next)}.</Text>
        ) : (
          <Text style={commonStyles.subtitle}>
            No reviews scheduled yet. Start learning from the Learn tab!
          </Text>
        )}
        <Link href="/" asChild>
          <Pressable style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnPrimary])}>
            <Text style={commonStyles.btnText}>Dashboard</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View style={commonStyles.screen}>
      <View style={styles.sessionProgress}>
        <View style={[styles.sessionProgressFill, { width: `${sessionProgressPct}%` }]} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[commonStyles.scrollContent, styles.content]}
        keyboardShouldPersistTaps="handled"
      >
      {/* HUD */}
      <View style={styles.hud}>
        <Pressable onPress={() => router.replace('/')} style={styles.hudButton}>
          <Text style={styles.hudText}>End Session</Text>
        </Pressable>
        {settings?.showSrsRank !== false ? <Text style={styles.rank}>{rank}</Text> : null}
      </View>
      <View style={styles.hud}>
        <Text style={styles.hudText}>
          Right {right} · Wrong {wrong}
        </Text>
        <Text style={styles.hudText}>
          {round === 'wrapup' ? 'Wrap-Up · ' : ''}Remaining {remaining}
        </Text>
      </View>

      {/* Nuance hint above the blank */}
      {nuanceHint ? <Text style={styles.nuance}>{nuanceHint}</Text> : null}

      <ClozeSentence
        sentenceWithBlank={currentCard.sentenceWithBlank}
        hangulValues={hangulValues}
        submitted={submitted}
        answers={currentCard.answers}
        answerRevealed={answerRevealed}
        altIndex={altIndex}
        placeholder=""
      />

      <EnglishHint text={currentCard.englishHint} />

      {!submitted && !answerRevealed ? (
        <View style={styles.inputRow}>
          {Array.from({ length: blankCount }, (_, i) => (
            <TextInput
              key={i}
              style={commonStyles.pillInput}
              placeholder="답"
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
          <Pressable
            onPress={submit}
            disabled={!allBlankFilled}
            style={[styles.arrowButton, !allBlankFilled ? commonStyles.btnDisabled : undefined]}
            accessibilityRole="button"
          >
            <Text style={styles.arrowText}>→</Text>
          </Pressable>
        </View>
      ) : null}

      {submitted ? (
        <Text style={[styles.result, allCorrect && !autoFailed ? styles.resultCorrect : styles.resultIncorrect]}>
          {allCorrect && !autoFailed
            ? 'Correct!'
            : answerRevealed
              ? `Answer: ${currentCard.answers.join(' / ')}`
              : 'Incorrect'}
        </Text>
      ) : null}

      {submitted && !allCorrect && explanation ? (
        <Text style={styles.explanation}>{explanation}</Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Controls */}
      <View style={styles.controls}>
        {!submitted ? (
          <Pressable onPress={revealAnswer} style={[commonStyles.btn, commonStyles.btnSecondary, styles.controlButton]}>
            <Text style={commonStyles.btnTextDark}>Show Answer</Text>
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
              onPress={() => void next(isCorrect)}
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
                {settings?.undoEnabled !== false ? (
                  <Pressable
                    onPress={undo}
                    style={[commonStyles.btn, commonStyles.btnSecondary, styles.controlButton]}
                  >
                    <Text style={commonStyles.btnTextDark}>Undo</Text>
                  </Pressable>
                ) : null}
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
                  onPress={() => void next(isCorrect)}
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

      {/* Grammar info after answering */}
      {submitted ? (
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
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Thin session progress bar along the top edge (Bunpro-style): the fill
  // grows as cards are completed.
  sessionProgress: {
    height: 4,
    backgroundColor: colors.border,
  },
  sessionProgressFill: {
    height: 4,
    backgroundColor: colors.primary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    gap: 18,
    paddingTop: 16,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  hudButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  hudText: {
    fontSize: 14,
    color: colors.muted,
  },
  rank: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  nuance: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
  },
  explanation: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  arrowButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
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
  bigTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  wideButton: {
    minWidth: 220,
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
