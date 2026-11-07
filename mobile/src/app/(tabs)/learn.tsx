import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import {
  completeLearnSession,
  getGrammarDetail,
  getLearnSession,
  type LearnSession,
} from '../../db';
import { checkAnswers } from '../../lib/srs';
import { romanToHangul } from '../../lib/romanToHangul';
import ClozeSentence from '../../components/ClozeSentence';
import EnglishHint from '../../components/EnglishHint';
import { colors, commonStyles } from '../../components/theme';

const DECK_ID = 'deck_topik1_level1';
const SESSION_SIZE = 5;

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

export default function LearnScreen() {
  const [session, setSession] = useState<LearnSession | null>(null);
  const [phase, setPhase] = useState<Phase>('learning');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'examples'>('details');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [quizCards, setQuizCards] = useState<QuizCard[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizRoman, setQuizRoman] = useState('');
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizAnswerRevealed, setQuizAnswerRevealed] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(() => {
    setSession(getLearnSession(DECK_ID, SESSION_SIZE));
    setPhase('learning');
    setCurrentIndex(0);
    setActiveTab('details');
    setAddedIds(new Set());
    setQuizCards([]);
    setQuizIndex(0);
    setQuizCorrect(0);
    setQuizAnswered(0);
    setError(null);
  }, []);

  useFocusEffect(loadSession);

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

  const currentQuizCard = quizCards[quizIndex] ?? null;
  const quizHangul = romanToHangul(quizRoman);
  const quizAnswers = currentQuizCard
    ? [currentQuizCard.answer, ...currentQuizCard.alternateAnswers]
    : [];
  const quizIsCorrect =
    quizSubmitted && currentQuizCard
      ? checkAnswers([quizHangul], quizAnswers)
      : false;

  function addToDeck() {
    if (!currentGP) return;
    const nextAdded = new Set(addedIds);
    nextAdded.add(currentGP.id);
    setAddedIds(nextAdded);
    if (nextAdded.size >= SESSION_SIZE || currentIndex >= grammarPoints.length - 1) {
      startQuiz([...nextAdded]);
    } else {
      setCurrentIndex((i) => i + 1);
      setActiveTab('details');
    }
  }

  function startQuiz(ids: string[]) {
    if (!session) return;
    try {
      const cards = completeLearnSession(session.deckId, ids);
      setQuizCards(shuffle(cards));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add these points to your deck.');
      return;
    }
    setQuizIndex(0);
    setQuizCorrect(0);
    setQuizAnswered(0);
    resetQuizCard();
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
    setQuizAnswered((n) => n + 1);
    if (checkAnswers([quizHangul], quizAnswers)) {
      setQuizCorrect((n) => n + 1);
    }
  }

  function nextQuizCard() {
    if (quizIndex < quizCards.length - 1) {
      setQuizIndex((i) => i + 1);
      resetQuizCard();
    } else {
      setPhase('complete');
    }
  }

  // ── Deck complete ──────────────────────────────────────────────────────────
  if (session?.deckComplete) {
    return (
      <View style={commonStyles.centered}>
        <Text style={styles.bigTitle}>🎉 Deck Complete!</Text>
        <Text style={[commonStyles.subtitle, styles.centerText]}>
          You&apos;ve learned all grammar points in {session.deckTitle}.
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

  // ── Session complete ───────────────────────────────────────────────────────
  if (phase === 'complete') {
    const learned = grammarPoints.filter((gp) => addedIds.has(gp.id));
    return (
      <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
        <View style={commonStyles.centered}>
          <Text style={styles.bigTitle}>🎉 Session Complete!</Text>
          <Text style={commonStyles.subtitle}>
            You learned {learned.length} grammar {learned.length === 1 ? 'point' : 'points'}:
          </Text>
          {learned.map((gp) => (
            <Text key={gp.id} style={commonStyles.body}>
              • {gp.title}
            </Text>
          ))}
          <Text style={commonStyles.body}>{quizCards.length} practice cards added to your queue.</Text>
          {quizAnswered > 0 ? (
            <Text style={commonStyles.body}>
              Practice quiz: {quizCorrect}/{quizAnswered} correct (
              {Math.round((quizCorrect / quizAnswered) * 100)}%)
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

  // ── Practice quiz ──────────────────────────────────────────────────────────
  if (phase === 'quiz' && currentQuizCard) {
    return (
      <ScrollView
        style={commonStyles.screen}
        contentContainerStyle={[commonStyles.scrollContent, styles.quizContent]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={commonStyles.title}>Practice Quiz</Text>
        <Text style={commonStyles.subtitle}>Test what you just learned</Text>
        <Text style={commonStyles.muted}>
          {quizIndex + 1} / {quizCards.length}
          {quizAnswered > 0 ? `  (${quizCorrect}/${quizAnswered} correct)` : ''}
        </Text>

        <ClozeSentence
          sentenceWithBlank={currentQuizCard.sentenceWithBlank}
          hangulValues={[quizHangul]}
          submitted={quizSubmitted}
          answers={quizAnswers}
          answerRevealed={quizAnswerRevealed}
          placeholder=""
        />

        <EnglishHint parts={currentQuizCard.englishHint} />

        {!quizSubmitted && !quizAnswerRevealed ? (
          <TextInput
            style={commonStyles.input}
            placeholder="Type romanized Korean…"
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
              ? '✓ Correct!'
              : quizAnswerRevealed
                ? `Answer: ${quizAnswers.join(' / ')}`
                : '✗ Incorrect'}
          </Text>
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
                {quizIndex < quizCards.length - 1 ? 'Next →' : 'Finish'}
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
              <Text style={commonStyles.btnText}>
                {quizIndex < quizCards.length - 1 ? 'Next →' : 'Finish'}
              </Text>
            </Pressable>
          )}
        </View>

        <Pressable onPress={() => setPhase('complete')} style={styles.ghostButton}>
          <Text style={styles.ghostText}>Skip Quiz &amp; Finish</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ── Learning phase ─────────────────────────────────────────────────────────
  if (!currentGP) {
    return (
      <View style={commonStyles.centered}>
        <Text style={commonStyles.subtitle}>Loading…</Text>
      </View>
    );
  }

  const alreadyAdded = addedIds.has(currentGP.id);

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
      {/* Session progress */}
      <View style={styles.sessionBar}>
        <Text style={commonStyles.muted}>
          {addedIds.size} / {SESSION_SIZE} grammar points · {session?.totalRemaining ?? 0} left in
          deck
        </Text>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(100, (addedIds.size / SESSION_SIZE) * 100)}%` },
            ]}
          />
        </View>
      </View>
      {error ? <Text style={styles.error}>⚠️ {error}</Text> : null}

      {/* Hero */}
      <Text style={styles.heroTitle}>{currentGP.title}</Text>
      {vocabBaseForm ? <Text style={styles.heroVocab}>{vocabBaseForm}</Text> : null}
      <Text style={commonStyles.subtitle}>{currentGP.hint}</Text>
      <Text style={commonStyles.muted}>
        {currentIndex + 1} of {grammarPoints.length} in this session
      </Text>

      {/* Tabs */}
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
                {note.type === 'caution' ? '⚠️' : note.type === 'tip' ? '💡' : '✨'} {note.title}
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
                <EnglishHint parts={ex.englishHint} />
                {ex.notes ? <Text style={commonStyles.muted}>{ex.notes}</Text> : null}
              </View>
            ))
          ) : (
            <Text style={commonStyles.muted}>No lesson examples for this point yet.</Text>
          )}
        </View>
      )}

      {/* Footer nav */}
      <View style={styles.footer}>
        <Pressable
          onPress={() => {
            if (currentIndex > 0) {
              setCurrentIndex((i) => i - 1);
              setActiveTab('details');
            }
          }}
          disabled={currentIndex === 0}
          style={[
            commonStyles.btn,
            commonStyles.btnSecondary,
            currentIndex === 0 ? commonStyles.btnDisabled : undefined,
          ]}
        >
          <Text style={commonStyles.btnTextDark}>← Previous</Text>
        </Pressable>
        <View style={styles.pellets}>
          {grammarPoints.map((gp, i) => (
            <View
              key={gp.id}
              style={[
                styles.pellet,
                i === currentIndex ? styles.pelletActive : undefined,
                addedIds.has(gp.id) ? styles.pelletDone : undefined,
              ]}
            />
          ))}
        </View>
        <Pressable
          onPress={addToDeck}
          disabled={alreadyAdded}
          style={[
            commonStyles.btn,
            commonStyles.btnPrimary,
            alreadyAdded ? commonStyles.btnDisabled : undefined,
          ]}
        >
          <Text style={commonStyles.btnText}>{alreadyAdded ? '✓ Added' : 'Add to Deck'}</Text>
        </Pressable>
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
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  controlButton: {
    minWidth: 120,
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
  sessionBar: {
    gap: 6,
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
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
  },
  heroVocab: {
    fontSize: 20,
    color: colors.primaryDark,
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
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 20,
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
