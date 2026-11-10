import { useRef, useState } from 'react';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { colors, commonStyles } from '../../components/theme';
import { passageById } from './catalog';
import { chooseAnswer, isCorrect, scoreReading } from './assessment';
import { readingMetrics } from './layout';
import type { ReadingPassage, ReadingResponse } from './types';

type Phase = 'read' | 'questions' | 'summary' | 'review';

export default function ReaderSession({ passageId }: { passageId: string | undefined }) {
  const passage = passageById(passageId);
  if (!passage) return <UnknownPassage />;
  return <ReadingActivity key={passage.id} passage={passage} />;
}

function UnknownPassage() {
  return (
    <View style={commonStyles.centered}>
      <Text style={commonStyles.title}>Passage not found</Text>
      <Text style={commonStyles.subtitle}>That reading passage is not in this pilot.</Text>
      <Link href="/comprehension" asChild>
        <Pressable style={[commonStyles.btn, commonStyles.btnPrimary]}>
          <Text style={commonStyles.btnText}>Reading library</Text>
        </Pressable>
      </Link>
    </View>
  );
}

/** Ephemeral assessment only: there are deliberately NO store / DB / sync imports. */
function ReadingActivity({ passage }: { passage: ReadingPassage }) {
  const [phase, setPhase] = useState<Phase>('read');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<ReadingResponse>({});
  const [showPassage, setShowPassage] = useState(true);
  const [showGlosses, setShowGlosses] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const metrics = readingMetrics(width);
  const question = passage.questions[index];
  const results = scoreReading(passage, answers);

  function jumpTop() {
    scroll.current?.scrollTo({ y: 0, animated: false });
  }

  function startQuestions() {
    setIndex(0);
    setPhase('questions');
    setShowPassage(false);
    jumpTop();
  }

  function submitAnswer() {
    if (selected === null || submitted || !question) return;
    setAnswers((old) => chooseAnswer(old, question, selected));
    setSubmitted(true);
  }

  function advance() {
    if (!submitted) return;
    if (index + 1 >= passage.questions.length) {
      setPhase('summary');
    } else {
      setIndex((old) => old + 1);
      setSelected(null);
      setSubmitted(false);
      setShowPassage(false);
    }
    jumpTop();
  }

  function retry() {
    setPhase('read');
    setIndex(0);
    setSelected(null);
    setSubmitted(false);
    setAnswers({});
    setShowGlosses(false);
    setShowPassage(true);
    jumpTop();
  }

  const passageText = (
    <View style={[commonStyles.card, styles.storyPanel]}>
      <Text style={styles.sectionLabel}>KOREAN READING</Text>
      {passage.paragraphs.map((paragraph, paragraphIndex) => (
        <Text
          key={paragraphIndex}
          selectable
          accessibilityRole="text"
          style={[styles.koreanParagraph, { fontSize: metrics.fontSize, lineHeight: metrics.lineHeight }]}
        >
          {paragraph}
        </Text>
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: showGlosses }}
        accessibilityLabel={showGlosses ? 'Hide vocabulary glosses' : 'Show vocabulary glosses'}
        onPress={() => setShowGlosses((value) => !value)}
        style={[commonStyles.btn, commonStyles.btnSecondary, styles.glossButton]}
      >
        <Text style={commonStyles.btnTextDark}>
          {showGlosses ? 'Hide vocabulary glosses' : 'Show vocabulary glosses'}
        </Text>
      </Pressable>
      {showGlosses ? (
        <View style={styles.glossList}>
          <Text style={styles.sectionLabel}>ESSENTIAL VOCABULARY</Text>
          {passage.vocabularyNotes.map((note) => (
            <View key={note.term} style={styles.glossRow}>
              <Text selectable style={styles.glossTerm}>{note.term}</Text>
              <Text style={styles.glossMeaning}>{note.gloss}</Text>
            </View>
          ))}
          <Text style={commonStyles.muted}>These glosses are reading aids, not entries in your grammar SRS.</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <ScrollView
      ref={scroll}
      style={commonStyles.screen}
      contentContainerStyle={[styles.content, { maxWidth: Math.max(288, metrics.contentWidth) }]}
      keyboardShouldPersistTaps="handled"
      accessibilityLabel="Korean reading and comprehension session"
    >
      <Link href="/comprehension" asChild>
        <Pressable accessibilityRole="link" style={styles.back}>
          <Text style={styles.backText}>‹ Reading library</Text>
        </Pressable>
      </Link>
      <Text style={styles.title}>{passage.titleKo}</Text>
      <Text style={styles.subtitle}>{passage.titleEn}</Text>
      <Text style={styles.status}>
        Approx. Level {passage.level} · {passage.wordCount} words · Editorial draft · No audio
      </Text>

      {phase === 'read' ? (
        <>
          <Text style={[commonStyles.body, styles.instruction]}>
            Read the full passage. Vocabulary glosses are optional. An English translation is deliberately not provided during assessment.
          </Text>
          {passageText}
          <Text style={[commonStyles.muted, styles.hint]}>
            This is a reading-only pilot. Your answers will not modify grammar SRS progress.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={startQuestions}
            style={[commonStyles.btn, commonStyles.btnPrimary, styles.action]}
          >
            <Text style={commonStyles.btnText}>Start comprehension questions</Text>
          </Pressable>
        </>
      ) : null}

      {phase === 'questions' && question ? (
        <>
          <Text style={styles.progress} accessibilityRole="header">
            Question {index + 1} of {passage.questions.length}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: showPassage }}
            onPress={() => setShowPassage((value) => !value)}
            style={[commonStyles.btn, commonStyles.btnSecondary, styles.action]}
          >
            <Text style={commonStyles.btnTextDark}>{showPassage ? 'Hide passage' : 'Show passage'}</Text>
          </Pressable>
          {showPassage ? passageText : null}
          <View style={[commonStyles.card, styles.questionPanel]}>
            <Text style={styles.sectionLabel}>{question.type.replace(/-/g, ' ').toUpperCase()}</Text>
            <Text style={styles.questionText}>{question.prompt}</Text>
            <View style={styles.choices} accessibilityRole="radiogroup">
              {question.choices.map((choice, choiceIndex) => {
                const active = selected === choiceIndex;
                const correct = choiceIndex === question.correctIndex;
                return (
                  <Pressable
                    key={choiceIndex}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active, disabled: submitted }}
                    accessibilityLabel={'Option ' + (choiceIndex + 1) + ': ' + choice}
                    disabled={submitted}
                    onPress={() => setSelected(choiceIndex)}
                    style={[
                      styles.choice,
                      active && styles.choiceSelected,
                      submitted && correct && styles.choiceCorrect,
                      submitted && active && !correct && styles.choiceWrong,
                    ]}
                  >
                    <Text style={styles.choiceText}>{choice}</Text>
                  </Pressable>
                );
              })}
            </View>
            {submitted && selected !== null ? (
              <View style={styles.feedback} accessibilityLiveRegion="polite">
                <Text style={[styles.feedbackTitle, { color: isCorrect(question, selected) ? colors.green : colors.red }]}>
                  {isCorrect(question, selected) ? 'Correct' : 'Not quite'}
                </Text>
                <Text style={commonStyles.body}>{question.explanation}</Text>
                <Text style={[commonStyles.muted, styles.evidence]}>Passage evidence: {question.evidence}</Text>
              </View>
            ) : null}
            {!submitted ? (
              <Pressable
                accessibilityRole="button"
                disabled={selected === null}
                onPress={submitAnswer}
                style={[commonStyles.btn, commonStyles.btnPrimary, styles.action, selected === null && commonStyles.btnDisabled]}
              >
                <Text style={commonStyles.btnText}>Check answer</Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={advance}
                style={[commonStyles.btn, commonStyles.btnPrimary, styles.action]}
              >
                <Text style={commonStyles.btnText}>
                  {index + 1 === passage.questions.length ? 'Finish reading' : 'Next question'}
                </Text>
              </Pressable>
            )}
          </View>
        </>
      ) : null}

      {phase === 'summary' ? (
        <View style={[commonStyles.card, styles.summary]}>
          <Text style={commonStyles.title}>Reading complete</Text>
          <Text style={styles.score} accessibilityLabel={'Score ' + results.correct + ' out of ' + results.total}>
            {results.correct} / {results.total} · {results.percentage}%
          </Text>
          <Text style={commonStyles.body}>
            {results.complete ? 'All questions answered.' : 'Some questions were not completed.'}
          </Text>
          <Text style={commonStyles.muted}>
            This score is only for this session. It has not changed your grammar reviews or account progress.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => { setPhase('review'); jumpTop(); }}
            style={[commonStyles.btn, commonStyles.btnPrimary, styles.action]}
          >
            <Text style={commonStyles.btnText}>Review explanations</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={retry}
            style={[commonStyles.btn, commonStyles.btnSecondary, styles.action]}
          >
            <Text style={commonStyles.btnTextDark}>Read again</Text>
          </Pressable>
        </View>
      ) : null}

      {phase === 'review' ? (
        <>
          <Text style={commonStyles.title}>Review explanations</Text>
          <Text style={[commonStyles.muted, styles.hint]}>
            Correct choices, passage evidence and teaching notes. You can reopen the passage below.
          </Text>
          {passageText}
          {passage.questions.map((item, itemIndex) => (
            <View key={item.id} style={[commonStyles.card, styles.reviewCard]}>
              <Text style={styles.sectionLabel}>QUESTION {itemIndex + 1} · {item.type.replace(/-/g, ' ')}</Text>
              <Text style={styles.questionText}>{item.prompt}</Text>
              <Text style={commonStyles.body}>Your answer: {item.choices[answers[item.id]] ?? 'No answer'}</Text>
              <Text style={[commonStyles.body, styles.correctAnswer]}>
                Correct answer: {item.choices[item.correctIndex]}
              </Text>
              <Text style={commonStyles.body}>{item.explanation}</Text>
              <Text selectable style={[commonStyles.muted, styles.evidence]}>Evidence: {item.evidence}</Text>
            </View>
          ))}
          <Pressable accessibilityRole="button" onPress={retry} style={[commonStyles.btn, commonStyles.btnPrimary, styles.action]}>
            <Text style={commonStyles.btnText}>Read again</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { width: '100%', alignSelf: 'center', padding: 16, paddingBottom: 48 },
  back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  backText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  title: { fontSize: 25, fontWeight: '800', color: colors.text, marginTop: 8 },
  subtitle: { fontSize: 16, color: colors.text, marginTop: 4 },
  status: { fontSize: 13, color: colors.orange, lineHeight: 20, marginTop: 8, marginBottom: 14 },
  instruction: { marginBottom: 14 },
  storyPanel: { gap: 12 },
  koreanParagraph: { color: colors.text, flexShrink: 1, writingDirection: 'ltr' },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: colors.muted, letterSpacing: 0.5 },
  glossButton: { marginTop: 8 },
  glossList: { paddingTop: 12, gap: 8, borderTopWidth: 1, borderTopColor: colors.border },
  glossRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'flex-start' },
  glossTerm: { color: colors.text, fontSize: 16, fontWeight: '700', minWidth: 82 },
  glossMeaning: { color: colors.muted, fontSize: 15, flexShrink: 1 },
  hint: { marginVertical: 14 },
  action: { marginTop: 12 },
  progress: { color: colors.primary, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  questionPanel: { marginTop: 14 },
  questionText: { fontSize: 19, color: colors.text, lineHeight: 28, fontWeight: '700', marginTop: 10, marginBottom: 12 },
  choices: { gap: 10 },
  choice: { minHeight: 48, padding: 12, borderWidth: 1, borderRadius: 8, borderColor: colors.border, backgroundColor: colors.white, justifyContent: 'center' },
  choiceSelected: { borderColor: colors.blue, backgroundColor: '#EBF4FB' },
  choiceCorrect: { borderColor: colors.green, backgroundColor: '#EBF7EF' },
  choiceWrong: { borderColor: colors.red, backgroundColor: '#FFF0F0' },
  choiceText: { fontSize: 16, lineHeight: 24, color: colors.text, flexShrink: 1 },
  feedback: { marginTop: 18, gap: 8 },
  feedbackTitle: { fontSize: 18, fontWeight: '800' },
  evidence: { marginTop: 8 },
  summary: { marginTop: 16, gap: 12 },
  score: { fontSize: 32, color: colors.navy, fontWeight: '800' },
  reviewCard: { marginTop: 12, gap: 10 },
  correctAnswer: { color: colors.green, fontWeight: '700' },
});
