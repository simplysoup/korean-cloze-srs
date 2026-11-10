import { useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  HANGUL_BATCHES,
  isCorrectRomanization,
  type HangulBatch,
  type HangulJamo,
} from '../content/hangul';
import { colors, commonStyles } from '../components/theme';

/**
 * Hangul Practice — free practice in two modes, no SRS, nothing scheduled
 * or graded. Batches run vowels first, then consonants, then the advanced
 * vowels and double consonants. Learn flips through a batch's jamo (sound
 * + example word); Cram quizzes a batch (type the romanization, misses
 * re-queue until every jamo is answered correctly).
 */

type Phase = 'batches' | 'learn' | 'cram' | 'summary';

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function HangulScreen() {
  const [phase, setPhase] = useState<Phase>('batches');
  const [batch, setBatch] = useState<HangulBatch | null>(null);

  // Learn state.
  const [learnIndex, setLearnIndex] = useState(0);

  // Cram state.
  const [cramQueue, setCramQueue] = useState<HangulJamo[]>([]);
  const [cramFinished, setCramFinished] = useState(0);
  const [cramRight, setCramRight] = useState(0);
  const [cramWrong, setCramWrong] = useState(0);
  const [cramInput, setCramInput] = useState('');
  const [cramSubmitted, setCramSubmitted] = useState(false);

  function startLearn(b: HangulBatch) {
    setBatch(b);
    setLearnIndex(0);
    setPhase('learn');
  }

  function startCram(b: HangulBatch) {
    setBatch(b);
    setCramQueue(shuffle(b.jamo));
    setCramFinished(0);
    setCramRight(0);
    setCramWrong(0);
    setCramInput('');
    setCramSubmitted(false);
    setPhase('cram');
  }

  function backToBatches() {
    setBatch(null);
    setPhase('batches');
  }

  const currentLearn = batch && phase === 'learn' ? batch.jamo[learnIndex] : undefined;
  const currentCram = phase === 'cram' ? cramQueue[0] : undefined;
  const cramCorrect = currentCram ? isCorrectRomanization(currentCram, cramInput) : false;

  function submitCram() {
    if (!currentCram || cramInput.trim() === '') return;
    setCramSubmitted(true);
    if (cramCorrect) setCramRight((n) => n + 1);
    else setCramWrong((n) => n + 1);
  }

  function nextCramCard() {
    if (!currentCram) return;
    if (cramCorrect) {
      const remaining = cramQueue.slice(1);
      setCramQueue(remaining);
      setCramFinished((f) => f + 1);
      if (remaining.length === 0) {
        setPhase('summary');
        return;
      }
    } else {
      // Misses re-queue to the back — the cram ends when every jamo in
      // the batch has been answered correctly.
      setCramQueue([...cramQueue.slice(1), currentCram]);
    }
    setCramInput('');
    setCramSubmitted(false);
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  if (phase === 'summary' && batch) {
    const total = cramRight + cramWrong;
    return (
      <View style={commonStyles.centered}>
        <Text style={styles.bigTitle}>Cram Complete!</Text>
        <Text style={commonStyles.subtitle}>
          {batch.title} — {cramRight} right · {cramWrong} wrong
          {total > 0 ? ` — ${Math.round((cramRight / total) * 100)}% correct` : ''}
        </Text>
        <Text style={commonStyles.muted}>
          Hangul Practice doesn&apos;t use SRS — nothing here was scheduled or graded.
        </Text>
        <Pressable
          onPress={() => startCram(batch)}
          style={[commonStyles.btn, commonStyles.btnPrimary, styles.wideButton]}
        >
          <Text style={commonStyles.btnText}>Cram Again</Text>
        </Pressable>
        <Pressable
          onPress={backToBatches}
          style={[commonStyles.btn, commonStyles.btnSecondary, styles.wideButton]}
        >
          <Text style={commonStyles.btnTextDark}>Back to Batches</Text>
        </Pressable>
      </View>
    );
  }

  // ── Cram ─────────────────────────────────────────────────────────────────
  if (phase === 'cram' && batch && currentCram) {
    const total = cramFinished + cramQueue.length;
    return (
      <ScrollView
        style={commonStyles.screen}
        contentContainerStyle={[commonStyles.scrollContent, styles.quizContent]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hud}>
          <Text style={styles.hudText}>
            {batch.title} · {cramFinished + 1} / {total}
          </Text>
          <Text style={styles.hudText}>
            Right {cramRight} · Wrong {cramWrong}
          </Text>
        </View>

        <Text style={styles.bigJamo}>{currentCram.jamo}</Text>
        <Text style={commonStyles.muted}>Type the romanization</Text>

        {!cramSubmitted ? (
          <TextInput
            style={commonStyles.pillInput}
            placeholder="a"
            placeholderTextColor={colors.faint}
            value={cramInput}
            onChangeText={setCramInput}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={() => {
              if (!cramSubmitted) submitCram();
            }}
          />
        ) : null}

        {cramSubmitted ? (
          <Text style={[styles.result, cramCorrect ? styles.resultCorrect : styles.resultIncorrect]}>
            {cramCorrect ? 'Correct!' : `Incorrect — ${currentCram.romanization}`}
          </Text>
        ) : null}

        {cramSubmitted ? (
          <View style={commonStyles.card}>
            <Text style={commonStyles.body}>{currentCram.sound}</Text>
            <Text style={[commonStyles.muted, styles.example]}>
              {currentCram.example.hangul} ({currentCram.example.romanization}) —{' '}
              {currentCram.example.english}
            </Text>
          </View>
        ) : null}

        <View style={styles.controls}>
          {!cramSubmitted ? (
            <Pressable
              onPress={submitCram}
              disabled={cramInput.trim() === ''}
              style={[
                commonStyles.btn,
                commonStyles.btnPrimary,
                styles.controlButton,
                cramInput.trim() === '' ? commonStyles.btnDisabled : undefined,
              ]}
            >
              <Text style={commonStyles.btnText}>Check</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={nextCramCard}
              style={[commonStyles.btn, commonStyles.btnPrimary, styles.controlButton]}
            >
              <Text style={commonStyles.btnText}>
                {cramQueue.length <= 1 && cramCorrect ? 'Finish' : 'Next →'}
              </Text>
            </Pressable>
          )}
        </View>

        <Pressable onPress={backToBatches} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Back to Batches</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ── Learn ────────────────────────────────────────────────────────────────
  if (phase === 'learn' && batch && currentLearn) {
    const isLast = learnIndex === batch.jamo.length - 1;
    return (
      <ScrollView
        style={commonStyles.screen}
        contentContainerStyle={[commonStyles.scrollContent, styles.quizContent]}
      >
        <View style={styles.hud}>
          <Text style={styles.hudText}>
            {batch.title} · Learn {learnIndex + 1} / {batch.jamo.length}
          </Text>
        </View>

        <Text style={styles.bigJamo}>{currentLearn.jamo}</Text>
        <Text style={styles.romanization}>{currentLearn.romanization}</Text>
        <Text style={[commonStyles.body, styles.centerText]}>{currentLearn.sound}</Text>

        <View style={commonStyles.card}>
          <Text style={styles.cardLabel}>Example</Text>
          <Text style={styles.exampleWord}>{currentLearn.example.hangul}</Text>
          <Text style={commonStyles.muted}>
            {currentLearn.example.romanization} — {currentLearn.example.english}
          </Text>
        </View>

        <View style={styles.controls}>
          <Pressable
            onPress={() => setLearnIndex((i) => Math.max(0, i - 1))}
            disabled={learnIndex === 0}
            style={[
              commonStyles.btn,
              commonStyles.btnSecondary,
              styles.controlButton,
              learnIndex === 0 ? commonStyles.btnDisabled : undefined,
            ]}
          >
            <Text style={commonStyles.btnTextDark}>← Previous</Text>
          </Pressable>
          {isLast ? (
            <Pressable
              onPress={() => startCram(batch)}
              style={[commonStyles.btn, commonStyles.btnPrimary, styles.controlButton]}
            >
              <Text style={commonStyles.btnText}>Start Cram →</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setLearnIndex((i) => Math.min(batch.jamo.length - 1, i + 1))}
              style={[commonStyles.btn, commonStyles.btnPrimary, styles.controlButton]}
            >
              <Text style={commonStyles.btnText}>Next →</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.pellets}>
          {batch.jamo.map((j, i) => (
            <View
              key={j.jamo}
              style={[styles.pellet, i === learnIndex ? styles.pelletActive : undefined]}
            />
          ))}
        </View>

        <Pressable onPress={backToBatches} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Back to Batches</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ── Batches ──────────────────────────────────────────────────────────────
  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
      <Text style={commonStyles.title}>Hangul Practice</Text>
      <Text style={[commonStyles.subtitle, { marginTop: 8 }]}>
        Learn the letters in batches, then drill them — no SRS, nothing here is scheduled or
        graded.
      </Text>

      {HANGUL_BATCHES.map((b) => (
        <View key={b.id} style={styles.batchCard}>
          <Text style={styles.batchTitle}>{b.title}</Text>
          <Text style={commonStyles.muted}>{b.description}</Text>
          <Text style={styles.jamoRow}>{b.jamo.map((j) => j.jamo).join('  ')}</Text>
          <View style={styles.batchButtons}>
            <Pressable
              onPress={() => startLearn(b)}
              style={[commonStyles.btn, commonStyles.btnSecondary, styles.batchButton]}
            >
              <Text style={commonStyles.btnTextDark}>Learn</Text>
            </Pressable>
            <Pressable
              onPress={() => startCram(b)}
              style={[commonStyles.btn, commonStyles.btnPrimary, styles.batchButton]}
            >
              <Text style={commonStyles.btnText}>Cram</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <Link href="/" asChild>
        <Pressable
          style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnSecondary, styles.dashboardButton])}
        >
          <Text style={commonStyles.btnTextDark}>Dashboard</Text>
        </Pressable>
      </Link>
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
  wideButton: {
    minWidth: 220,
  },
  centerText: {
    textAlign: 'center',
  },
  quizContent: {
    alignItems: 'center',
    gap: 18,
    paddingTop: 24,
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
  bigJamo: {
    fontSize: 96,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 110,
  },
  romanization: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    marginBottom: 4,
  },
  exampleWord: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  example: {
    marginTop: 8,
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
  pellets: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  pellet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  pelletActive: {
    backgroundColor: colors.primary,
  },
  backLink: {
    marginTop: 4,
  },
  backLinkText: {
    fontSize: 15,
    color: colors.muted,
  },
  batchCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginTop: 12,
    gap: 8,
  },
  batchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  jamoRow: {
    fontSize: 22,
    color: colors.text,
    lineHeight: 32,
  },
  batchButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  batchButton: {
    minWidth: 120,
  },
  dashboardButton: {
    marginTop: 20,
    alignSelf: 'flex-start',
  },
});
