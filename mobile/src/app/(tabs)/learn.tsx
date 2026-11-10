import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';
import {
  completeLearnSession,
  completeLearnSessionWithRetry,
  getGrammarDetail,
  getLearnSession,
  markPointKnown,
  type LearnSession,
} from '../../store';
import { checkAnswers } from '../../lib/srs';
import { romanToHangul } from '../../lib/romanToHangul';
import { syncNow } from '../../lib/sync';
import ClozeSentence from '../../components/ClozeSentence';
import EnglishHint from '../../components/EnglishHint';
import { colors, commonStyles } from '../../components/theme';

type Phase = 'learning' | 'quiz' | 'complete';
type Note = { type: string; title: string; content: string };
type QuizCard = ReturnType<typeof completeLearnSession>[number];

function asNotes(value: unknown): Note[] | null {
  return Array.isArray(value) ? (value as Note[]) : null;
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const NOTE_LABEL: Record<string, string> = {
  caution: 'Caution',
  tip: 'Tip',
  funfact: 'Note',
};

export default function LearnScreen() {
  const [session, setSession] = useState<LearnSession | null>(null);
  const [phase, setPhase] = useState<Phase>('learning');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'examples'>('details');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [quizQueue, setQuizQueue] = useState<QuizCard[]>([]);
  const [quizRoman, setQuizRoman] = useState('');
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizAnswerRevealed, setQuizAnswerRevealed] = useState(false);
  const [quizRight, setQuizRight] = useState(0);
  const [quizWrong, setQuizWrong] = useState(0);
  const [quizFinished, setQuizFinished] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Self-study is an explicit opt-in beyond the daily queue (Bunpro-style:
  // the daily queue is the default, extra learning is the user's choice).
  const [selfStudy, setSelfStudy] = useState(false);

  const loadSession = useCallback(() => {
    setSession(getLearnSession(selfStudy));
    setPhase('learning');
    setCurrentIndex(0);
    setActiveTab('details');
    setAddedIds(new Set());
    setKnownIds(new Set());
    setQuizQueue([]);
    setQuizRight(0);
    setQuizWrong(0);
    setQuizFinished(0);
    setError(null);
  }, [selfStudy]);

  useFocusEffect(loadSession);

  // Opting into self-study reloads the session without the daily cap.
  // Deferred to a timeout: the lint rule forbids synchronous setState in
  // the effect body.
  useEffect(() => {
    if (!selfStudy) return;
    const t = setTimeout(loadSession, 0);
    return () => clearTimeout(t);
  }, [selfStudy, loadSession]);

  const grammarPoints = session?.grammarPoints ?? [];
  const currentGP = grammarPoints[currentIndex];
  // getLearnSession returns no examples/cards, so fetch the full detail
  // for the point being shown (examples + vocab base form).
  const detail = useMemo(
    () => (currentGP ? getGrammarDetail(currentGP.id) : null),
    [currentGP],
  );
  const vocabBaseForm = detail?.cards[0]?.vocabBaseForm;
  const notes = currentGP ? asNotes(currentGP.notes) : null;

  const currentQuizCard = quizQueue[0] ?? null;
  const quizHangul = romanToHangul(quizRoman);
  const quizAnswers = currentQuizCard
    ? [currentQuizCard.answer, ...currentQuizCard.alternateAnswers]
    : [];
  const quizIsCorrect =
    quizSubmitted && currentQuizCard
      ? checkAnswers([quizHangul], quizAnswers)
      : false;

  /** Advance past the current point, adding it to the deck. */
  function advance() {
    if (!currentGP) return;
    const nextAdded = new Set(addedIds);
    nextAdded.add(currentGP.id);
    setAddedIds(nextAdded);
    moveToNextPoint(nextAdded);
  }

  /** "I already know this": master the point immediately, never test it. */
  function markKnown() {
    if (!currentGP || !session) return;
    try {
      markPointKnown(currentGP.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not mark this point as known.');
      return;
    }
    const nextKnown = new Set(knownIds);
    nextKnown.add(currentGP.id);
    setKnownIds(nextKnown);
    moveToNextPoint(addedIds);
  }

  function moveToNextPoint(nextAdded: Set<string>) {
    if (currentIndex >= grammarPoints.length - 1) {
      finishLearning(nextAdded);
    } else {
      setCurrentIndex((i) => i + 1);
      setActiveTab('details');
    }
  }

  async function finishLearning(nextAdded: Set<string>) {
    if (!session) return;
    if (nextAdded.size === 0) {
      // Everything was already known — nothing to quiz.
      setPhase('complete');
      return;
    }
    setSaving(true);
    try {
      const cards = await completeLearnSessionWithRetry([...nextAdded]);
      setQuizQueue(shuffle(cards));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add these points.');
      setSaving(false);
      return;
    }
    setQuizRight(0);
    setQuizWrong(0);
    setQuizFinished(0);
    resetQuizCard();
    setSaving(false);
    setPhase('quiz');
  }

  function resetQuizCard() {
    setQuizRoman('');
    setQuizSubmitted(false);
    setQuizAnswerRevealed(false);
  }

  function submitQuiz() {
    if (!currentQuizCard || quizHangul.trim() === '') return;
    setQuizSubmitted(true);
    if (checkAnswers([quizHangul], quizAnswers)) {
      setQuizRight((n) => n + 1);
    } else {
      setQuizWrong((n) => n + 1);
    }
  }

  function nextQuizCard() {
    if (!currentQuizCard) return;
    if (quizIsCorrect) {
      // Answered correctly: this card is done. Finish when the queue empties.
      const remaining = quizQueue.slice(1);
      setQuizFinished((n) => n + 1);
      if (remaining.length === 0) {
        setPhase('complete');
        // Session done: back the new cards up to the server (best-effort).
        void syncNow();
      } else {
        setQuizQueue(remaining);
        resetQuizCard();
      }
    } else {
      // Wrong: the card goes back to the end of the queue until it is
      // answered correctly — every new point must eventually be right.
      setQuizQueue([...quizQueue.slice(1), currentQuizCard]);
      resetQuizCard();
    }
  }

  // ── Vacation mode ────────────────────────────────────────────────────────
  if (session?.vacation) {
    return (
      <View style={commonStyles.centered}>
        <Text style={styles.bigTitle}>Vacation mode is on</Text>
        <Text style={[commonStyles.subtitle, styles.centerText]}>
          Learning is paused, and your streak is frozen. Turn it off in Settings to resume.
        </Text>
        <Link href="/settings" asChild>
          <Pressable style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnPrimary, styles.wideButton])}>
            <Text style={commonStyles.btnText}>Settings</Text>
          </Pressable>
        </Link>
        <Link href="/" asChild>
          <Pressable style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnSecondary, styles.wideButton])}>
            <Text style={commonStyles.btnTextDark}>Dashboard</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  // ── Library empty ────────────────────────────────────────────────────────
  if (session?.libraryEmpty) {
    return (
      <View style={commonStyles.centered}>
        <Text style={styles.bigTitle}>Your library is empty</Text>
        <Text style={[commonStyles.subtitle, styles.centerText]}>
          Add a deck to your library to start learning — Learn pulls from
          every deck in your library at once.
        </Text>
        <Link href="/decks" asChild>
          <Pressable style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnPrimary, styles.wideButton])}>
            <Text style={commonStyles.btnText}>Browse decks</Text>
          </Pressable>
        </Link>
        <Link href="/" asChild>
          <Pressable style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnSecondary, styles.wideButton])}>
            <Text style={commonStyles.btnTextDark}>Dashboard</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  // ── Library complete ───────────────────────────────────────────────────────
  if (session?.deckComplete) {
    return (
      <View style={commonStyles.centered}>
        <Text style={styles.bigTitle}>Deck Complete!</Text>
        <Text style={[commonStyles.subtitle, styles.centerText]}>
          You&apos;ve learned all grammar points in your library.
        </Text>
        <Link href="/review" asChild>
          <Pressable style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnPrimary, styles.wideButton])}>
            <Text style={commonStyles.btnText}>Review Now</Text>
          </Pressable>
        </Link>
        <Link href="/" asChild>
          <Pressable style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnSecondary, styles.wideButton])}>
            <Text style={commonStyles.btnTextDark}>Dashboard</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  // ── Daily queue complete (self-study is opt-in) ──────────────────────────
  if (session?.queueDone) {
    return (
      <View style={commonStyles.centered}>
        <Text style={styles.bigTitle}>Today&apos;s queue complete</Text>
        <Text style={[commonStyles.subtitle, styles.centerText]}>
          You learned {session.learnedToday}/{session.dailyLimit} grammar points today.
          {session.totalRemaining > 0
            ? ` ${session.totalRemaining} ${session.totalRemaining === 1 ? 'point' : 'points'} left in your library.`
            : ''}
        </Text>
        <Pressable
          onPress={() => setSelfStudy(true)}
          style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnPrimary, styles.wideButton])}
        >
          <Text style={commonStyles.btnText}>Self-Study (extra points)</Text>
        </Pressable>
        <Link href="/review" asChild>
          <Pressable style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnSecondary, styles.wideButton])}>
            <Text style={commonStyles.btnTextDark}>Review Now</Text>
          </Pressable>
        </Link>
        <Link href="/" asChild>
          <Pressable style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnSecondary, styles.wideButton])}>
            <Text style={commonStyles.btnTextDark}>Dashboard</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  // ── Session complete ───────────────────────────────────────────────────────
  if (phase === 'complete') {
    const learned = grammarPoints.filter((gp) => addedIds.has(gp.id));
    const known = grammarPoints.filter((gp) => knownIds.has(gp.id));
    return (
      <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
        <View style={commonStyles.centered}>
          <Text style={styles.bigTitle}>Session Complete!</Text>
          <Text style={commonStyles.subtitle}>
            You learned {learned.length} grammar {learned.length === 1 ? 'point' : 'points'}
            {known.length > 0 ? ` and marked ${known.length} as already known` : ''}:
          </Text>
          {learned.map((gp) => (
            <Text key={gp.id} style={commonStyles.body}>
              • {gp.title}
            </Text>
          ))}
          {quizFinished > 0 ? (
            <Text style={commonStyles.body}>
              Review stage: {quizFinished} {quizFinished === 1 ? 'card' : 'cards'} answered
              correctly ({quizRight} right, {quizWrong} wrong along the way).
            </Text>
          ) : null}
          <Link href="/review" asChild>
            <Pressable style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnPrimary, styles.wideButton])}>
              <Text style={commonStyles.btnText}>Review Now</Text>
            </Pressable>
          </Link>
          <Pressable
            onPress={loadSession}
            style={[commonStyles.btn, commonStyles.btnSecondary, styles.wideButton]}
          >
            <Text style={commonStyles.btnTextDark}>Learn More</Text>
          </Pressable>
          <Link href="/" asChild>
            <Pressable style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnSecondary, styles.wideButton])}>
              <Text style={commonStyles.btnTextDark}>Dashboard</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    );
  }

  // ── Review stage (quiz) — one card per new point, misses re-queue ─────────
  if (phase === 'quiz' && currentQuizCard) {
    return (
      <ScrollView
        style={commonStyles.screen}
        contentContainerStyle={[commonStyles.scrollContent, styles.quizContent]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={commonStyles.title}>Review Stage</Text>
        <Text style={commonStyles.subtitle}>Test what you just learned — every card must be answered correctly to finish.</Text>
        <Text style={commonStyles.muted}>
          {quizFinished + 1} / {quizFinished + quizQueue.length}
          {quizRight + quizWrong > 0 ? `  (${quizRight} right, ${quizWrong} wrong)` : ''}
        </Text>
        <View style={[styles.barTrack, { width: '100%' }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.min(100, (quizFinished / (quizFinished + quizQueue.length)) * 100)}%`,
              },
            ]}
          />
        </View>

        <ClozeSentence
          sentenceWithBlank={currentQuizCard.sentenceWithBlank}
          hangulValues={[quizHangul]}
          submitted={quizSubmitted}
          answers={quizAnswers}
          answerRevealed={quizAnswerRevealed}
          placeholder=""
        />

        <EnglishHint text={currentQuizCard.englishHint} />

        {!quizSubmitted && !quizAnswerRevealed ? (
          <TextInput
            style={commonStyles.pillInput}
            placeholder="답"
            placeholderTextColor={colors.faint}
            value={quizRoman}
            onChangeText={setQuizRoman}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={() => {
              if (!quizSubmitted) submitQuiz();
            }}
          />
        ) : null}

        {quizSubmitted ? (
          <Text
            style={[styles.result, quizIsCorrect ? styles.resultCorrect : styles.resultIncorrect]}
          >
            {quizIsCorrect
              ? 'Correct!'
              : quizAnswerRevealed
                ? `Answer: ${quizAnswers.join(' / ')}`
                : 'Incorrect'}
          </Text>
        ) : null}

        {/* Grammar info after answering — same card as the review queue. */}
        {quizSubmitted ? (
          <View style={commonStyles.card}>
            <Text style={styles.grammarTitle}>{currentQuizCard.grammar.title}</Text>
            <Text style={commonStyles.muted}>
              {currentQuizCard.grammar.category}
              {currentQuizCard.grammar.tense ? ` · ${currentQuizCard.grammar.tense}` : ''}
              {currentQuizCard.grammar.register ? ` · ${currentQuizCard.grammar.register}` : ''}
            </Text>
            <Text style={[commonStyles.body, styles.grammarDescription]}>
              {currentQuizCard.grammar.description}
            </Text>
            <Pressable
              onPress={() => router.push(`/grammar/${currentQuizCard.grammarPointId}`)}
              style={[commonStyles.btn, commonStyles.btnSecondary, styles.viewGrammarButton]}
            >
              <Text style={commonStyles.btnTextDark}>View Grammar →</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.controls}>
          {!quizSubmitted ? (
            <Pressable
              onPress={submitQuiz}
              disabled={quizHangul.trim() === ''}
              style={[
                commonStyles.btn,
                commonStyles.btnPrimary,
                styles.controlButton,
                quizHangul.trim() === '' ? commonStyles.btnDisabled : undefined,
              ]}
            >
              <Text style={commonStyles.btnText}>Check</Text>
            </Pressable>
          ) : quizIsCorrect ? (
            <Pressable
              onPress={nextQuizCard}
              style={[commonStyles.btn, commonStyles.btnPrimary, styles.controlButton]}
            >
              <Text style={commonStyles.btnText}>
                {quizQueue.length <= 1 ? 'Finish' : 'Next →'}
              </Text>
            </Pressable>
          ) : !quizAnswerRevealed ? (
            <Pressable
              onPress={() => setQuizAnswerRevealed(true)}
              style={[commonStyles.btn, commonStyles.btnDanger, styles.controlButton]}
            >
              <Text style={commonStyles.btnText}>Show Answer</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={nextQuizCard}
              style={[commonStyles.btn, commonStyles.btnPrimary, styles.controlButton]}
            >
              <Text style={commonStyles.btnText}>Try Again Later</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    );
  }

  // ── Saving the learned set ───────────────────────────────────────────────
  if (saving) {
    return (
      <View style={commonStyles.centered}>
        <Text style={commonStyles.subtitle}>Saving your progress…</Text>
      </View>
    );
  }

  // ── Learning phase: one point page at a time ───────────────────────────────
  if (!currentGP) {
    return (
      <View style={commonStyles.centered}>
        <Text style={commonStyles.subtitle}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
      {/* The library the session pulls from + a way to manage it. */}
      <View style={styles.deckLine}>
        <Text style={commonStyles.muted}>Learning from your library</Text>
        <Link href="/decks" asChild>
          <Pressable>
            <Text style={styles.changeDeck}>Manage decks ›</Text>
          </Pressable>
        </Link>
      </View>
      {/* Session progress — today's queue (or self-study count). */}
      <View style={styles.sessionBar}>
        <Text style={commonStyles.muted}>
          {selfStudy
            ? `${addedIds.size + knownIds.size} / ${grammarPoints.length} grammar points · Self-Study`
            : `${(session?.learnedToday ?? 0) + addedIds.size + knownIds.size} / ${
                session?.dailyLimit ?? 5
              } today · ${session?.totalRemaining ?? 0} left in deck`}
        </Text>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              {
                width: selfStudy
                  ? `${Math.min(
                      100,
                      grammarPoints.length > 0
                        ? ((addedIds.size + knownIds.size) / grammarPoints.length) * 100
                        : 0,
                    )}%`
                  : `${Math.min(
                      100,
                      (((session?.learnedToday ?? 0) + addedIds.size + knownIds.size) /
                        (session?.dailyLimit ?? 5)) *
                        100,
                    )}%`,
              },
            ]}
          />
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Point page: huge red form, meaning, tabs */}
      <Text style={styles.heroTitle}>{currentGP.title}</Text>
      {vocabBaseForm ? <Text style={styles.heroVocab}>{vocabBaseForm}</Text> : null}
      <Text style={commonStyles.subtitle}>{currentGP.hint}</Text>
      <Text style={commonStyles.muted}>
        {currentIndex + 1} of {grammarPoints.length} in this session
      </Text>

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setActiveTab('details')}
          style={[styles.tab, activeTab === 'details' ? styles.tabActive : undefined]}
        >
          <Text style={activeTab === 'details' ? styles.tabTextActive : styles.tabText}>
            Details
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('examples')}
          style={[styles.tab, activeTab === 'examples' ? styles.tabActive : undefined]}
        >
          <Text style={activeTab === 'examples' ? styles.tabTextActive : styles.tabText}>
            Examples
          </Text>
        </Pressable>
      </View>

      {activeTab === 'details' ? (
        <View style={styles.tabContent}>
          {currentGP.structurePattern ? (
            <View style={commonStyles.card}>
              <Text style={styles.cardLabel}>Structure</Text>
              <Text style={commonStyles.body}>{currentGP.structurePattern}</Text>
            </View>
          ) : null}
          <View style={commonStyles.card}>
            <Text style={styles.cardLabel}>About</Text>
            <Text style={commonStyles.body}>{currentGP.description}</Text>
          </View>
          <View style={commonStyles.card}>
            <Text style={styles.cardLabel}>Details</Text>
            <Text style={commonStyles.body}>
              Category: {currentGP.category}
              {currentGP.tense ? `\nTense: ${currentGP.tense}` : ''}
              {currentGP.register ? `\nRegister: ${currentGP.register}` : ''}
              {`\nLevel: ${currentGP.level}`}
              {currentGP.tags.length > 0 ? `\nTags: ${currentGP.tags.join(', ')}` : ''}
            </Text>
          </View>
          {notes?.map((note, i) => (
            <View key={i} style={commonStyles.card}>
              <Text style={styles.cardLabel}>
                {NOTE_LABEL[note.type] ?? 'Note'} — {note.title}
              </Text>
              <Text style={commonStyles.body}>{note.content}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.tabContent}>
          {detail && detail.examples.length > 0 ? (
            detail.examples.map((ex) => (
              <View key={ex.id} style={commonStyles.card}>
                <Text style={styles.exampleSentence}>
                  {ex.sentenceWithBlank.replace('___', ex.answer)}
                </Text>
                <EnglishHint text={ex.englishHint} />
                {ex.notes ? <Text style={commonStyles.muted}>{ex.notes}</Text> : null}
              </View>
            ))
          ) : (
            <Text style={commonStyles.muted}>No lesson examples for this point yet.</Text>
          )}
        </View>
      )}

      {/* Footer: green "I already know this" + blue advance arrow */}
      <View style={styles.footer}>
        <Pressable onPress={markKnown} style={styles.knownButton}>
          <Text style={styles.knownText}>I already know this</Text>
        </Pressable>
        <Pressable onPress={advance} style={styles.advanceButton} accessibilityRole="button">
          <Text style={styles.advanceText}>→</Text>
        </Pressable>
      </View>
      <View style={styles.footerNav}>
        <Pressable
          onPress={() => {
            if (currentIndex > 0) {
              setCurrentIndex((i) => i - 1);
              setActiveTab('details');
            }
          }}
          disabled={currentIndex === 0}
          style={styles.ghostButton}
        >
          <Text style={[styles.ghostText, currentIndex === 0 ? styles.ghostTextDisabled : undefined]}>
            ← Previous
          </Text>
        </Pressable>
        <View style={styles.pellets}>
          {grammarPoints.map((gp, i) => (
            <View
              key={gp.id}
              style={[
                styles.pellet,
                i === currentIndex ? styles.pelletActive : undefined,
                addedIds.has(gp.id) || knownIds.has(gp.id) ? styles.pelletDone : undefined,
              ]}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bigTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  wideButton: {
    minWidth: 220,
  },
  quizContent: {
    alignItems: 'center',
    gap: 18,
    paddingTop: 24,
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
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  controlButton: {
    minWidth: 120,
  },
  sessionBar: {
    gap: 6,
  },
  deckLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  changeDeck: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bgSecondaryDark,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  error: {
    fontSize: 14,
    color: colors.redDark,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 12,
  },
  heroVocab: {
    fontSize: 20,
    color: colors.muted,
    marginTop: 4,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.bgSecondary,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  tabTextActive: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  tabContent: {
    gap: 12,
    marginTop: 12,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  exampleSentence: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.text,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  knownButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  knownText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  advanceButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advanceText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  footerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
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
  },
  ghostTextDisabled: {
    color: colors.faint,
    textDecorationLine: 'none',
  },
  pellets: {
    flexDirection: 'row',
    gap: 6,
  },
  pellet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.bgSecondaryDark,
  },
  pelletActive: {
    backgroundColor: colors.primary,
  },
  pelletDone: {
    backgroundColor: colors.green,
  },
});
