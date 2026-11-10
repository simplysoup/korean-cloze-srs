import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { colors, commonStyles } from '../../components/theme';
import { practice, prerequisiteTitle } from './index';
import { gradeExercise, type Grade } from './scoring';
import { startSession, currentExercise, recordAttempt, reviewMissed, summarizeSession, unitPrerequisites, practiceLayoutWidth, type PracticeSession } from './session';
import type { Exercise, PracticeUnit } from './types';

const { units, exercises } = practice;
function Action({ label, onPress, primary = false, disabled = false }: {
  label: string; onPress: () => void; primary?: boolean; disabled?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label}
    accessibilityState={{ disabled }}
    onPress={onPress} disabled={disabled}
    style={[styles.action, primary ? styles.actionPrimary : styles.actionOutline, disabled && styles.disabled]}>
    <Text style={primary ? styles.primaryLabel : styles.actionLabel}>{label}</Text>
  </Pressable>;
}
function UnitCard({ unit, onStart, expanded, onToggle }: {
  unit: PracticeUnit; onStart: () => void; expanded: boolean; onToggle: () => void;
}) {
  const matches = exercises.filter(e => e.unit === unit.id);
  const prerequisites = unitPrerequisites(exercises, unit.id);
  const after = Math.max(...matches.map(e => e.availableAfterLesson - 1));
  return <View style={styles.panel}>
    <Text style={styles.unitTitle}>{unit.title}</Text>
    <Text style={styles.subtle}>{matches.length} exercises · {matches.filter(e => e.type === 'contrast').length} contrasts · {matches.filter(e => e.type === 'transfer').length} production · short 6-item session</Text>
    <Text style={styles.help}>Recommended after lesson {after}. This preview does not read or change your grammar mastery.</Text>
    <View style={styles.buttonRow}>
      <Action label={expanded ? 'Hide prerequisites' : 'View prerequisites'} onPress={onToggle} />
      <Action label="Start practice" primary onPress={onStart} />
    </View>
    {expanded && <View style={styles.prereqBox}>
      <Text style={styles.prereqTitle}>Grammar needed for this unit</Text>
      {prerequisites.map(id => <Text style={styles.prerequisite} key={id}>• {prerequisiteTitle(id)} <Text style={styles.id}>({id})</Text></Text>)}
    </View>}
  </View>;
}
function AnswerChoices({ exercise, answer, setAnswer, locked }: {
  exercise: Extract<Exercise, { type: 'contrast' }>; answer: string; setAnswer: (value: string) => void; locked: boolean;
}) {
  return <View style={styles.choices}>{exercise.choices.map((choice, i) =>
    <Pressable accessibilityRole="radio" accessibilityState={{ selected: answer === choice.id, disabled: locked }}
      key={choice.id} disabled={locked} onPress={() => setAnswer(choice.id)}
      style={[styles.choice, answer === choice.id && styles.choiceSelected]}>
      <Text style={styles.choiceLetter}>{String.fromCharCode(65 + i)}</Text>
      <Text style={styles.choiceText}>{choice.text}</Text>
    </Pressable>)}</View>;
}
/** This screen is deliberately session-local; Agent 00 owns navigation, saved history, sync and release. */
export default function PracticeScreen() {
  const { width } = useWindowDimensions();
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [prerequisitesOpen, setPrerequisitesOpen] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Grade | null>(null);
  const current = session ? currentExercise(session, exercises) : null;
  const complete = Boolean(session && session.cursor >= session.exerciseIds.length);
  const summary = session && complete ? summarizeSession(session) : null;
  function enter(unitId: string) {
    setSession(startSession(units, exercises, unitId));
    setAnswer(''); setFeedback(null);
  }
  function check() {
    if (!current || !answer.trim()) return;
    setFeedback(gradeExercise(current, answer));
  }
  function next() {
    if (!session || !current || !feedback || feedback.status === 'missing') return;
    const outcome = recordAttempt(session, current, answer);
    if (outcome.grade.status === 'missing') { setFeedback(outcome.grade); return; }
    setSession(outcome.session);
    setAnswer(''); setFeedback(null);
  }
  function back() { setSession(null); setAnswer(''); setFeedback(null); }
  function retryMissed() {
    if (!session) return;
    const fresh = reviewMissed(session);
    if (fresh) { setSession(fresh); setAnswer(''); setFeedback(null); }
  }
  return <ScrollView style={commonStyles.screen} contentContainerStyle={styles.scroll}>
    <View style={[styles.content, { width: practiceLayoutWidth(width) }]}>
      <View style={styles.buttonRow}>
        <Action label={session ? 'All practice units' : 'Back'} onPress={session ? back : () => router.back()} />
      </View>
      <Text style={commonStyles.title}>Grammar in context</Text>
      <Text style={commonStyles.subtitle}>Choose the grammar for a real situation, then apply it in a new sentence. The target lesson title stays hidden until feedback.</Text>
      <Text style={styles.safety}>Editorial pilot · Korean educator approval pending · No effect on grammar SRS, streaks or account progress.</Text>
      {!session && <>
        <Text style={styles.sectionHeading}>Available preview units</Text>
        <Text style={styles.help}>All pilot levels are open for independent practice. Prerequisite mastery is not checked here; the integration lead can connect the pure prerequisite filter later.</Text>
        {units.map(u => <UnitCard key={u.id} unit={u} expanded={prerequisitesOpen === u.id}
          onToggle={() => setPrerequisitesOpen(prev => prev === u.id ? null : u.id)} onStart={() => enter(u.id)} />)}
      </>}
      {session && !complete && !current && <View style={styles.panel}>
        <Text style={styles.unitTitle}>Exercise unavailable</Text>
        <Text style={styles.help}>The current exercise could not be found. No practice or SRS result was stored.</Text>
        <Action label="Choose another unit" onPress={back} />
      </View>}
      {session && !complete && current && <>
        <View style={styles.panel}>
          <Text style={styles.overline}>QUESTION {session.cursor + 1} OF {session.exerciseIds.length} · {current.type === 'contrast' ? 'CHOOSE' : 'WRITE'}</Text>
          <View style={styles.progressBack}><View style={[styles.progressFill, { width: `${(session.cursor / session.exerciseIds.length) * 100}%` }]} /></View>
          <Text style={styles.context}>{current.contextKorean}</Text>
          {Boolean(current.contextEnglish) && <Text style={styles.help}>{current.contextEnglish}</Text>}
          <Text style={styles.task}>{current.task}</Text>
          {current.type === 'contrast'
            ? <AnswerChoices exercise={current} answer={answer} setAnswer={setAnswer} locked={Boolean(feedback)} />
            : <TextInput style={styles.input} multiline accessibilityLabel="Write your Korean sentence"
              value={answer} onChangeText={setAnswer} editable={!feedback} placeholder="완전한 한국어 문장을 쓰세요."
              placeholderTextColor={colors.faint} autoCapitalize="none" autoCorrect={false} />}
          {!feedback
            ? <Action label="Check answer" primary onPress={check} disabled={!answer.trim()} />
            : <View style={styles.feedback} accessibilityRole="summary">
              <Text style={[styles.result, { color: feedback.accepted ? colors.green : colors.primaryDark }]}>
                {feedback.accepted ? 'Correct — curated answer' : feedback.status === 'missing' ? 'Unable to grade' : feedback.status.startsWith('wrong-') ? feedback.status.replace('wrong-', 'Check ') : 'Review this answer'}
              </Text>
              <Text style={commonStyles.body}>{feedback.feedback}</Text>
              <Text style={styles.help}>Accepted answer{feedback.acceptedValues.length > 1 ? 's' : ''}: {feedback.acceptedValues.join(' / ')}</Text>
              <Text style={styles.help}>Learning objective: {current.objective}</Text>
              <Text style={styles.subtle}>Unlisted but valid Korean alternatives require editorial review; no automatic linguistic judgement is made.</Text>
              <Action label={session.cursor + 1 === session.exerciseIds.length ? 'See summary' : 'Next question'}
                primary disabled={feedback.status === 'missing'} onPress={next} />
            </View>}
        </View>
      </>}
      {session && complete && summary && <View style={styles.panel}>
        <Text style={styles.unitTitle}>{session.mode === 'missed-review' ? 'Missed-item review complete' : 'Practice session complete'}</Text>
        <Text style={styles.context}>{summary.correct} / {summary.total} curated answers correct</Text>
        <Text style={styles.help}>{summary.missedIds.length ? `${summary.missedIds.length} item(s) need another look.` : 'No misses in this session.'}</Text>
        <Text style={styles.help}>Scores exist only on this screen. Nothing was added to your grammar reviews or account history.</Text>
        {summary.missedIds.length > 0 && <Action label="Review missed items" primary onPress={retryMissed} />}
        <Action label="Start another session" onPress={() => enter(session.unitId)} />
        <Action label="Choose another level" onPress={back} />
      </View>}
    </View>
  </ScrollView>;
}
const styles = StyleSheet.create({
  scroll: { alignItems: 'center', paddingBottom: 40, paddingTop: 16 },
  content: { maxWidth: 720, gap: 14 },
  panel: { ...commonStyles.card, gap: 12 },
  unitTitle: { fontSize: 19, fontWeight: '700', color: colors.text },
  sectionHeading: { color: colors.text, fontWeight: '700', fontSize: 18, marginTop: 8 },
  help: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  subtle: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  safety: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  action: { paddingHorizontal: 14, paddingVertical: 11, minHeight: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', flexGrow: 1 },
  actionOutline: { backgroundColor: colors.white, borderColor: colors.border, borderWidth: 1 },
  actionPrimary: { backgroundColor: colors.primary },
  actionLabel: { color: colors.text, fontWeight: '600', textAlign: 'center' },
  primaryLabel: { color: colors.white, fontWeight: '600', textAlign: 'center' },
  disabled: { opacity: 0.5 },
  prereqBox: { backgroundColor: colors.bgSecondary, padding: 12, borderRadius: 8, gap: 5 },
  prereqTitle: { fontWeight: '700', color: colors.text, paddingBottom: 4 },
  prerequisite: { color: colors.text, fontSize: 13, lineHeight: 19 },
  id: { color: colors.muted, fontSize: 11 },
  overline: { color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  progressBack: { height: 5, backgroundColor: colors.bgSecondaryDark, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 5, backgroundColor: colors.primary },
  context: { color: colors.text, fontSize: 20, lineHeight: 32, fontWeight: '500', marginTop: 6 },
  task: { color: colors.text, fontSize: 16, lineHeight: 24, fontWeight: '700' },
  choices: { gap: 9 },
  choice: { borderRadius: 9, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, padding: 13, minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 14 },
  choiceSelected: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.bgSecondary },
  choiceLetter: { color: colors.primary, fontSize: 14, fontWeight: '700', width: 22 },
  choiceText: { flex: 1, color: colors.text, fontSize: 16, lineHeight: 25 },
  input: { minHeight: 88, textAlignVertical: 'top', padding: 12, fontSize: 17, borderRadius: 8, borderColor: colors.border, borderWidth: 1, backgroundColor: colors.white, color: colors.text },
  feedback: { gap: 12, borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 12 },
  result: { fontSize: 16, fontWeight: '700' },
});
