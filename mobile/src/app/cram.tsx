import { useCallback, useState } from 'react';
import { Link, useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  checkQueueItem,
  getActiveDeckId,
  getCramCounts,
  getCramLessonRows,
  getCramPointIds,
  getCramPointIdsForLesson,
  getCramQueue,
  getDecks,
  type CramCounts,
  type CramLessonRow,
  type CramSetKind,
  type ReviewQueueItem,
} from '../db';
import { romanToHangul } from '../lib/romanToHangul';
import ClozeSentence from '../components/ClozeSentence';
import EnglishHint from '../components/EnglishHint';
import { colors, commonStyles } from '../components/theme';

/**
 * Cram — drill anything you have learned, with no limits and no effect on
 * SRS status. Quick Crams (Masters / Reviews / Ghosts / Difficult) or a
 * custom per-lesson selection, 1 set = 25 questions.
 */

const QUICK_SETS: { kind: CramSetKind; label: string; description: string }[] = [
  { kind: 'masters', label: 'Masters', description: 'Points at Master stage' },
  { kind: 'reviews', label: 'Reviews', description: 'Everything you have learned' },
  { kind: 'ghosts', label: 'Ghost Reviews', description: 'Points you have missed (lapses)' },
  { kind: 'difficult', label: 'Difficult Reviews', description: 'Points with low stability' },
];

type Phase = 'setup' | 'quiz' | 'summary';

export default function CramScreen() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [counts, setCounts] = useState<CramCounts | null>(null);
  const [lessonRows, setLessonRows] = useState<CramLessonRow[]>([]);
  const [deckTitle, setDeckTitle] = useState('');
  const [quickKind, setQuickKind] = useState<CramSetKind | null>(null);
  const [selectedLessons, setSelectedLessons] = useState<Set<number>>(new Set());
  const [sets, setSets] = useState(1);

  // Quiz state.
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [romanInputs, setRomanInputs] = useState<string[]>(['']);
  const [submitted, setSubmitted] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [altIndex, setAltIndex] = useState(0);
  const [hintStage, setHintStage] = useState(0);
  const [autoFailed, setAutoFailed] = useState(false);
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState(0);

  const loadSetup = useCallback(() => {
    const deckId = getActiveDeckId();
    setCounts(getCramCounts());
    setLessonRows(getCramLessonRows(deckId));
    setDeckTitle(getDecks().find((d) => d.id === deckId)?.title ?? '');
    setQuickKind(null);
    setSelectedLessons(new Set());
    setSets(1);
    setPhase('setup');
  }, []);

  useFocusEffect(loadSetup);

  /** Grammar point ids in the current selection (quick set or lessons). */
  function selectedPointIds(): string[] {
    if (quickKind) return getCramPointIds(quickKind);
    const deckId = getActiveDeckId();
    const ids: string[] = [];
    for (const lessonNumber of selectedLessons) {
      ids.push(...getCramPointIdsForLesson(deckId, lessonNumber));
    }
    return [...new Set(ids)];
  }

  const selectedCount = quickKind
    ? (counts?.[quickKind] ?? 0)
    : lessonRows
        .filter((r) => selectedLessons.has(r.lessonNumber))
        .reduce((n, r) => n + r.learned, 0);
  const questionCount = Math.min(sets * 25, selectedCount);

  function toggleLesson(lessonNumber: number) {
    setQuickKind(null);
    setSelectedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonNumber)) next.delete(lessonNumber);
      else next.add(lessonNumber);
      return next;
    });
  }

  function pickQuick(kind: CramSetKind) {
    setSelectedLessons(new Set());
    setQuickKind((cur) => (cur === kind ? null : kind));
  }

  function start() {
    const ids = selectedPointIds();
    if (ids.length === 0) return;
    const q = getCramQueue(ids, sets * 25);
    if (q.length === 0) return;
    setQueue(q);
    setQueueIndex(0);
    setRight(0);
    setWrong(0);
    resetCardState();
    setPhase('quiz');
  }

  function resetCardState() {
    setRomanInputs(['']);
    setSubmitted(false);
    setAnswerRevealed(false);
    setAltIndex(0);
    setHintStage(0);
    setAutoFailed(false);
  }

  const currentCard = phase === 'quiz' ? queue[queueIndex] : undefined;
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
  const hintText = (() => {
    if (!currentCard || hintStage === 0) return '';
    const answer = currentCard.answers[altIndex] ?? currentCard.answers[0] ?? '';
    if (hintStage === 1) return answer.slice(0, 1);
    if (hintStage === 2) return answer.slice(0, Math.max(1, Math.ceil(answer.length / 2)));
    return answer;
  })();

  function submit() {
    if (!currentCard || !allBlankFilled) return;
    setSubmitted(true);
    if (isCorrect && !autoFailed) setRight((n) => n + 1);
    else setWrong((n) => n + 1);
  }

  function advanceHint() {
    if (!currentCard) return;
    const nextStage = Math.min(3, hintStage + 1);
    setHintStage(nextStage);
    if (nextStage === 3) {
      setAnswerRevealed(true);
      setAutoFailed(true);
    }
  }

  function next() {
    if (!currentCard) return;
    if (queueIndex + 1 < queue.length) {
      setQueueIndex((i) => i + 1);
      resetCardState();
    } else {
      setPhase('summary');
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  if (phase === 'summary') {
    const total = right + wrong;
    return (
      <View style={commonStyles.centered}>
        <Text style={styles.bigTitle}>Cram Complete!</Text>
        <Text style={commonStyles.subtitle}>
          {right} right · {wrong} wrong
          {total > 0 ? ` — ${Math.round((right / total) * 100)}% correct` : ''}
        </Text>
        <Text style={commonStyles.muted}>
          Cram does not affect your SRS status — nothing here was scheduled or graded.
        </Text>
        <Link href="/" asChild>
          <Pressable style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnPrimary, styles.wideButton])}>
            <Text style={commonStyles.btnText}>Dashboard</Text>
          </Pressable>
        </Link>
        <Pressable
          onPress={loadSetup}
          style={[commonStyles.btn, commonStyles.btnSecondary, styles.wideButton]}
        >
          <Text style={commonStyles.btnTextDark}>Cram Again</Text>
        </Pressable>
      </View>
    );
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────
  if (phase === 'quiz' && currentCard) {
    return (
      <ScrollView
        style={commonStyles.screen}
        contentContainerStyle={[commonStyles.scrollContent, styles.quizContent]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hud}>
          <Text style={styles.hudText}>Cram · {queueIndex + 1} / {queue.length}</Text>
          <Text style={styles.hudText}>
            Right {right} · Wrong {wrong}
          </Text>
        </View>
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
        <EnglishHint parts={currentCard.englishHint} />
        {hintStage > 0 ? <Text style={styles.hint}>Hint: {hintText}</Text> : null}
        {!submitted && !answerRevealed ? (
          <View style={styles.inputRow}>
            {Array.from({ length: blankCount }, (_, i) => (
              <TextInput
                key={i}
                style={commonStyles.pillInput}
                placeholder="답"
                placeholderTextColor={colors.faint}
                value={romanInputs[i] ?? ''}
                onChangeText={(v) =>
                  setRomanInputs((prev) => {
                    const next = [...prev];
                    while (next.length <= i) next.push('');
                    next[i] = v;
                    return next;
                  })
                }
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
        <View style={styles.controls}>
          {!submitted ? (
            <Pressable onPress={advanceHint} style={[commonStyles.btn, commonStyles.btnSecondary, styles.controlButton]}>
              <Text style={commonStyles.btnTextDark}>{hintStage === 0 ? 'Hint' : 'More Hint'}</Text>
            </Pressable>
          ) : (
            <>
              {!answerRevealed ? (
                <Pressable
                  onPress={() => setAnswerRevealed(true)}
                  style={[commonStyles.btn, commonStyles.btnDanger, styles.controlButton]}
                >
                  <Text style={commonStyles.btnText}>Show Answer</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={next}
                style={[commonStyles.btn, commonStyles.btnPrimary, styles.controlButton]}
              >
                <Text style={commonStyles.btnText}>
                  {queueIndex + 1 < queue.length ? 'Next →' : 'Finish'}
                </Text>
              </Pressable>
            </>
          )}
        </View>
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
          </View>
        ) : null}
      </ScrollView>
    );
  }

  // ── Setup ────────────────────────────────────────────────────────────────
  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
      <Text style={commonStyles.title}>Cram</Text>
      <Text style={[commonStyles.subtitle, { marginTop: 8 }]}>
        Drill anything you want, with no limits — it won&apos;t affect your SRS status.
      </Text>

      <Text style={styles.sectionTitle}>Quick Crams</Text>
      <View style={commonStyles.card}>
        {QUICK_SETS.map((item) => {
          const count = counts?.[item.kind] ?? 0;
          const selected = quickKind === item.kind;
          return (
            <Pressable
              key={item.kind}
              style={[styles.quickRow, selected && styles.quickRowSelected]}
              onPress={() => pickQuick(item.kind)}
            >
              <View style={styles.quickText}>
                <Text style={styles.quickLabel}>{item.label}</Text>
                <Text style={commonStyles.muted}>{item.description}</Text>
              </View>
              <Text style={styles.quickCount}>{count}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Custom — {deckTitle}</Text>
      <View style={commonStyles.card}>
        {lessonRows.length === 0 ? (
          <Text style={commonStyles.muted}>No lessons in this deck yet.</Text>
        ) : (
          lessonRows.map((row) => {
            const selected = selectedLessons.has(row.lessonNumber);
            return (
              <Pressable
                key={row.lessonNumber}
                style={[styles.lessonRow, selected && styles.lessonRowSelected]}
                onPress={() => toggleLesson(row.lessonNumber)}
              >
                <Text style={styles.lessonCheck}>{selected ? '✓' : '○'}</Text>
                <View style={styles.lessonText}>
                  <Text style={styles.lessonTitle}>
                    Lesson {row.lessonNumber}: {row.lessonTitle}
                  </Text>
                  <Text style={commonStyles.muted}>
                    Learned {row.learned} · Selected {selected ? row.learned : 0} · New{' '}
                    {row.total - row.learned}
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}
      </View>

      <Text style={styles.sectionTitle}>How many sets?</Text>
      <View style={commonStyles.card}>
        <View style={styles.setsRow}>
          <Text style={styles.setsLabel}>1 set = 25 questions</Text>
          <View style={styles.stepper}>
            <Pressable
              onPress={() => setSets((s) => Math.max(1, s - 1))}
              disabled={sets <= 1}
              style={[styles.stepButton, sets <= 1 && styles.stepDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Fewer sets"
            >
              <Text style={styles.stepGlyph}>−</Text>
            </Pressable>
            <Text style={styles.stepValue}>{sets}</Text>
            <Pressable
              onPress={() => setSets((s) => Math.min(4, s + 1))}
              disabled={sets >= 4}
              style={[styles.stepButton, sets >= 4 && styles.stepDisabled]}
              accessibilityRole="button"
              accessibilityLabel="More sets"
            >
              <Text style={styles.stepGlyph}>+</Text>
            </Pressable>
          </View>
        </View>
        <Text style={commonStyles.muted}>
          {selectedCount === 0
            ? 'Pick a Quick Cram or some lessons to start.'
            : `${questionCount} question${questionCount === 1 ? '' : 's'} from ${selectedCount} selected item${selectedCount === 1 ? '' : 's'}.`}
        </Text>
        <Pressable
          onPress={start}
          disabled={selectedCount === 0}
          style={[
            commonStyles.btn,
            commonStyles.btnPrimary,
            styles.startButton,
            selectedCount === 0 ? commonStyles.btnDisabled : undefined,
          ]}
        >
          <Text style={commonStyles.btnText}>Start Cram</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  quickRowSelected: {
    backgroundColor: '#FDECEC',
  },
  quickText: {
    flex: 1,
    gap: 2,
  },
  quickLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  quickCount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  lessonRowSelected: {
    backgroundColor: '#FDECEC',
  },
  lessonCheck: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 1,
  },
  lessonText: {
    flex: 1,
    gap: 2,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  setsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  setsLabel: {
    fontSize: 16,
    color: colors.text,
  },
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
  startButton: {
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  quizContent: {
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
  hudText: {
    fontSize: 14,
    color: colors.muted,
  },
  nuance: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
  },
  hint: {
    fontSize: 16,
    color: colors.blue,
    textAlign: 'center',
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
});
