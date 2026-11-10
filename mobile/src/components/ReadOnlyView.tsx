// Read-only view for a locked-out tab.
//
// When the OPFS database is already open in another tab, this tab cannot
// open it at all — expo-sqlite's web worker fails at VFS init with
// 'Invalid VFS state'. Instead of only offering a reload, this screen
// renders the user's progress from the server sync document: it
// authenticates without touching the local DB (the session token comes
// from the localStorage mirror, or from an email-code login whose token
// is kept in memory/localStorage), pulls the document, and shows the
// dashboard, due queue, and grammar library from it.
//
// Nothing here reads or writes the local DB, and nothing here writes to
// the server either — no sync push, no review answers, no learning.
// Reviews and learning stay in the main tab/device.

import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { getSessionToken, setSessionTokenMirror } from '../db';
import { requestCode as requestCodeApi, ServerUnreachable, syncPull, verifyCode as verifyCodeApi } from '../lib/api';
import { validateCode, validateEmail } from '../lib/auth';
import { computeReadOnlyStats, readOnlyDueQueue, readOnlyGrammarList } from '../lib/read-only-stats';
import { formatNextReview } from '../lib/srs';
import type { SyncDocument } from '../lib/sync-types';
import BrandMark from './BrandMark';
import { colors, commonStyles } from './theme';

type Phase =
  | { kind: 'checking' }
  | { kind: 'auth'; step: 'email' | 'code' }
  | { kind: 'loading' }
  | { kind: 'ready'; doc: SyncDocument }
  | { kind: 'error'; message: string };

function reloadApp() {
  if (Platform.OS === 'web') {
    window.location.reload();
  }
}

function dueLabel(dueIso: string): string {
  const due = new Date(dueIso);
  const diffMin = Math.round((due.getTime() - Date.now()) / 60_000);
  if (diffMin <= 0) return 'due now';
  return `due in ${formatNextReview(due)}`;
}

export default function ReadOnlyView({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>({ kind: 'checking' });
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  // Ticks the resend countdown while on the code step (same pattern as
  // AuthScreen — Date.now() is impure, so render must read state).
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (phase.kind !== 'auth' || phase.step !== 'code') return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const pull = useCallback(async (t: string) => {
    setPhase({ kind: 'loading' });
    try {
      const res = await syncPull(t);
      if (!res.ok) {
        if (res.error === 'unauthorized') {
          setPhase({ kind: 'auth', step: 'email' });
          return;
        }
        setPhase({ kind: 'error', message: res.error ?? 'Could not load your progress from the server.' });
        return;
      }
      if (!res.payload) {
        setPhase({ kind: 'error', message: 'The server has no synced progress for this account yet.' });
        return;
      }
      setPhase({ kind: 'ready', doc: res.payload });
    } catch (e) {
      setPhase({
        kind: 'error',
        message:
          e instanceof ServerUnreachable
            ? 'Could not reach the server. Check your connection and try again.'
            : 'Could not load your progress from the server.',
      });
    }
  }, []);

  // On entry: a mirrored token (from a normal login on this browser) is
  // enough to pull — no DB access, so the lock cannot bite here. The
  // async wrapper keeps the state updates out of the effect body itself
  // (same shape as the init promise in _layout.tsx).
  useEffect(() => {
    void (async () => {
      const t = getSessionToken();
      if (!t) {
        setPhase({ kind: 'auth', step: 'email' });
        return;
      }
      await pull(t);
    })();
  }, [pull]);

  async function sendCode() {
    if (busy) return;
    const emailError = validateEmail(email);
    if (emailError) {
      setFormError(emailError);
      return;
    }
    setFormError(null);
    setBusy(true);
    try {
      const { status, ok, error } = await requestCodeApi(email.trim().toLowerCase());
      if (status === 200 && ok) {
        setResendAt(Date.now() + 60_000);
        setPhase({ kind: 'auth', step: 'code' });
        return;
      }
      setFormError(error === 'rate-limited' ? 'Too many codes requested. Wait a bit and try again.' : "Couldn't send the code. Try again.");
    } catch (e) {
      setFormError(e instanceof ServerUnreachable ? "Couldn't reach the server. Check your connection and try again." : "Couldn't send the code. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (busy) return;
    const codeError = validateCode(code);
    if (codeError) {
      setFormError(codeError);
      return;
    }
    setFormError(null);
    setBusy(true);
    try {
      const { status, ok, token: newToken, error } = await verifyCodeApi(email.trim().toLowerCase(), code.trim());
      if (status !== 200 || !ok || !newToken) {
        setFormError(
          error === 'expired'
            ? 'That code expired. Request a new one.'
            : error === 'too-many-attempts'
              ? 'Too many wrong tries. Request a new code.'
              : error === 'invalid-code'
                ? "That code doesn't match. Check your email and try again."
                : "Couldn't verify the code. Try again.",
        );
        return;
      }
      // Mirror-only: the DB is locked, so the normal setSessionToken
      // would throw. The token lives in localStorage + memory instead.
      setSessionTokenMirror(newToken);
      await pull(newToken);
    } catch (e) {
      setFormError(e instanceof ServerUnreachable ? "Couldn't reach the server. Check your connection and try again." : "Couldn't verify the code. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const resendWaitSeconds = Math.max(0, Math.ceil((resendAt - now) / 1000));

  if (phase.kind === 'checking' || phase.kind === 'loading') {
    return (
      <View style={commonStyles.centered}>
        <BrandMark size={48} />
        <Text style={commonStyles.title}>Loading your progress…</Text>
        <Text style={commonStyles.muted}>Reading a snapshot from the server — the database stays closed in this tab.</Text>
      </View>
    );
  }

  if (phase.kind === 'error') {
    return (
      <View style={commonStyles.centered}>
        <Text style={commonStyles.title}>Couldn&apos;t load the read-only view</Text>
        <Text style={commonStyles.subtitle}>{phase.message}</Text>
        <Pressable onPress={reloadApp} style={[commonStyles.btn, commonStyles.btnPrimary, styles.button]}>
          <Text style={commonStyles.btnText}>Reload app</Text>
        </Pressable>
        <Pressable onPress={onBack} style={[commonStyles.btn, commonStyles.btnSecondary, styles.button]}>
          <Text style={commonStyles.btnTextDark}>Back</Text>
        </Pressable>
      </View>
    );
  }

  if (phase.kind === 'auth') {
    return (
      <ScrollView style={commonStyles.screen} contentContainerStyle={styles.authScroll}>
        <View style={styles.authCard}>
          <View style={styles.brand}>
            <BrandMark size={48} />
          </View>
          <Text style={styles.heading}>Read-only view</Text>
          <Text style={styles.sub}>
            The database is open in another tab, so this tab can only show your progress. Log in to load it
            from the server — no reviews or learning here.
          </Text>
          {phase.step === 'email' ? (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setFormError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor={colors.faint}
              />
            </>
          ) : (
            <>
              <Text style={styles.label}>6-digit code</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={code}
                onChangeText={(v) => {
                  setCode(v.replace(/[^0-9]/g, '').slice(0, 6));
                  setFormError(null);
                }}
                keyboardType="number-pad"
                maxLength={6}
                onSubmitEditing={() => void verify()}
                placeholder="123456"
                placeholderTextColor={colors.faint}
              />
            </>
          )}
          {formError ? <Text style={styles.error}>{formError}</Text> : null}
          <Pressable
            onPress={() => void (phase.step === 'email' ? sendCode() : verify())}
            disabled={busy}
            style={[styles.submit, busy ? commonStyles.btnDisabled : undefined]}
          >
            <Text style={commonStyles.btnText}>
              {busy ? 'Please wait…' : phase.step === 'email' ? 'Send code' : 'Verify'}
            </Text>
          </Pressable>
          {phase.step === 'code' ? (
            <Pressable
              onPress={() => {
                if (resendWaitSeconds === 0) void sendCode();
              }}
              disabled={busy || resendWaitSeconds > 0}
              style={styles.switchRow}
            >
              <Text style={styles.switchText}>
                {resendWaitSeconds > 0 ? `Resend code in ${resendWaitSeconds}s` : 'Resend code'}
              </Text>
            </Pressable>
          ) : null}
          <Pressable onPress={onBack} style={styles.switchRow}>
            <Text style={styles.switchText}>
              <Text style={styles.switchLink}>Back to the error screen</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // phase.kind === 'ready'
  const doc = phase.doc;
  const stats = computeReadOnlyStats(doc);
  const due = readOnlyDueQueue(doc, 10);
  const grammar = readOnlyGrammarList(doc);
  const nextReview = stats.nextReviewAt ? new Date(stats.nextReviewAt) : null;
  const stageRows: { label: string; count: number }[] = [
    { label: 'Beginner', count: stats.stageCounts.beginner },
    { label: 'Adept', count: stats.stageCounts.adept },
    { label: 'Seasoned', count: stats.stageCounts.seasoned },
    { label: 'Expert', count: stats.stageCounts.expert },
    { label: 'Master', count: stats.stageCounts.master },
    { label: 'Ghost', count: stats.stageCounts.ghost },
  ];
  const levels = new Map<string, { title: string; items: typeof grammar }>();
  for (const item of grammar) {
    const level = levels.get(item.deckId) ?? { title: item.deckTitle, items: [] };
    level.items.push(item);
    levels.set(item.deckId, level);
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Read-only view</Text>
        <Text style={styles.bannerText}>
          The database is open in another tab. This tab shows your progress from the server — reviews and
          learning are disabled here. Use your main tab or device to review or learn.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{doc.user.username}</Text>
        <Text style={commonStyles.muted}>
          Lvl {stats.level} · {stats.currentXP} / {stats.xpForNextLevel} XP · {stats.totalReviews} reviews ·
          streak {stats.currentStreak} (best {stats.longestStreak})
        </Text>
        <Text style={commonStyles.muted}>
          Learned {stats.learnedCount} / {stats.totalGrammarPoints} grammar points · {stats.dueCount} due
          {nextReview && stats.dueCount === 0 ? ` · next review in ${formatNextReview(nextReview)}` : ''}
        </Text>
        {stats.vacationMode ? (
          <Text style={commonStyles.muted}>Vacation mode is on — reviews and learning are paused.</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress by stage</Text>
        <View style={styles.stageCards}>
          {stageRows.map((row) => (
            <View key={row.label} style={styles.stageCard}>
              <Text style={styles.stageCount}>{row.count}</Text>
              <Text style={styles.stageLabel}>{row.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TOPIK progress</Text>
        {stats.levelProgress.map((level) => (
          <View key={level.deckId} style={styles.levelRow}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelTitle}>{level.title}</Text>
              <Text style={commonStyles.muted}>
                {level.learned}/{level.total}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${level.total > 0 ? Math.min(100, (level.learned / level.total) * 100) : 0}%` },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Due now ({due.length})</Text>
        {due.length === 0 ? (
          <Text style={commonStyles.muted}>Nothing due right now.</Text>
        ) : (
          due.map(({ card, title, hint }) => (
            <View key={card.grammarPointId} style={styles.dueRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dueTitle}>{title}</Text>
                <Text style={commonStyles.muted}>{hint}</Text>
              </View>
              <Text style={commonStyles.muted}>{dueLabel(card.due)}</Text>
            </View>
          ))
        )}
        <Text style={[commonStyles.muted, { marginTop: 8 }]}>
          Answering reviews is disabled in this view.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Grammar library</Text>
        {[...levels.values()].map((level) => (
          <View key={level.title} style={{ marginBottom: 12 }}>
            <Text style={styles.levelTitle}>{level.title}</Text>
            {level.items.map((item) => (
              <View key={item.id} style={styles.grammarRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.grammarTitle}>{item.title}</Text>
                  <Text style={commonStyles.muted}>
                    Lesson {item.lessonNumber} · {item.lessonTitle}
                  </Text>
                </View>
                <Text style={[styles.pill, item.status === 'mastered' ? styles.pillMastered : item.status === 'learning' ? styles.pillLearning : styles.pillNew]}>
                  {item.status === 'mastered' ? 'Mastered' : item.status === 'learning' ? 'Learning' : 'New'}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <Pressable onPress={reloadApp} style={[commonStyles.btn, commonStyles.btnPrimary, styles.button]}>
        <Text style={commonStyles.btnText}>Reload app</Text>
      </Pressable>
      <Text style={[commonStyles.muted, { textAlign: 'center', marginTop: 8 }]}>
        Snapshot from the server, {new Date(doc.updatedAt).toLocaleString()}. Reload after closing the other
        Munpro tab to use the full app here.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
    alignSelf: 'stretch',
  },
  banner: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#E6C87A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 4,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  bannerText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  stageCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stageCard: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 96,
    minWidth: 96,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 2,
  },
  stageCount: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 32,
  },
  stageLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  levelRow: {
    marginBottom: 8,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.bgSecondaryDark,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    padding: 12,
    marginBottom: 8,
  },
  dueTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  grammarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    padding: 12,
    marginBottom: 6,
  },
  grammarTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  pill: {
    fontSize: 13,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  pillNew: {
    color: colors.muted,
    backgroundColor: '#FFFFFF',
  },
  pillLearning: {
    color: colors.blue,
    backgroundColor: '#E3EEF8',
  },
  pillMastered: {
    color: colors.green,
    backgroundColor: '#E2F2E9',
  },
  authScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.bg,
  },
  authCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    gap: 4,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  sub: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 21,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 14,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  codeInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
  },
  error: {
    fontSize: 13,
    color: colors.redDark,
    marginTop: 8,
  },
  submit: {
    marginTop: 16,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRow: {
    marginTop: 16,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  switchText: {
    fontSize: 15,
    color: colors.muted,
  },
  switchLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});
