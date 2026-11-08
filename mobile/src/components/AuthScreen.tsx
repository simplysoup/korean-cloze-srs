import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  countUsers,
  createUserByEmail,
  deviceMayAutoLogin,
  getDeviceTrust,
  getUserByEmail,
  migrateLocalDataToUser,
  setUserPassword,
  userHasPassword,
  type DbUser,
} from '../db';
import {
  validateCode,
  validateEmail,
  validateLoginPassword,
  validatePasswordSet,
  verifyPassword,
  type FieldErrors,
} from '../lib/auth';
import type { AuthUser } from '../lib/auth-context';
import BrandMark from './BrandMark';
import { colors, commonStyles } from './theme';

type Step = 'email' | 'code' | 'password' | 'add-password';

interface AuthScreenProps {
  /** Prefilled email: the last user on this device, or the only account. */
  lastEmail: string | null;
  /** This device's id (for the trust check before sending a code). */
  deviceId: string;
  onAuthed: (user: AuthUser) => void;
}

function toAuthUser(u: DbUser): AuthUser {
  return { id: u.id, username: u.username, email: u.email };
}

const RESEND_COOLDOWN_MS = 60 * 1000;

async function postJson(path: string, body: Record<string, string>): Promise<{ status: number; json: any }> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  let json: any = {};
  try {
    json = await res.json();
  } catch {
    json = {};
  }
  return { status: res.status, json };
}

function requestCodeError(status: number, error: string | undefined): string {
  if (error === 'invalid-email') return 'Enter a valid email address.';
  if (error === 'rate-limited') return 'Too many codes requested. Wait a bit and try again.';
  if (error === 'send-failed') return "Couldn't send the email. Try again in a moment.";
  if (error === 'auth-unavailable') return "Couldn't reach the server. Check your connection and try again.";
  if (status === 429) return 'Too many codes requested. Wait a bit and try again.';
  return "Couldn't send the code. Try again.";
}

function verifyCodeError(status: number, error: string | undefined): string {
  if (error === 'expired') return 'That code expired. Request a new one.';
  if (error === 'too-many-attempts') return 'Too many wrong tries. Request a new code.';
  if (error === 'invalid-code') return "That code doesn't match. Check your email and try again.";
  if (error === 'auth-unavailable') return "Couldn't reach the server. Check your connection and try again.";
  return "Couldn't verify the code. Try again.";
}

/**
 * One form, no login/signup split: enter an email, get a 6-digit code,
 * enter it, you're in. A password is an optional second way in (set after
 * the first verification, or later in Account), never required.
 */
export default function AuthScreen({ lastEmail, deviceId, onAuthed }: AuthScreenProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(lastEmail ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [relayNote, setRelayNote] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Ticks the resend countdown while on the code step.
  useEffect(() => {
    if (step !== 'code') return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [step]);

  function goTo(next: Step) {
    setErrors({});
    setFormError(null);
    setStep(next);
  }

  async function requestCode(targetEmail: string): Promise<boolean> {
    setBusy(true);
    try {
      const { status, json } = await postJson('/api/auth/request-code', { email: targetEmail });
      if (status === 200 && json.ok) {
        setRelayNote(json.delivery === 'relay');
        setResendAt(Date.now() + RESEND_COOLDOWN_MS);
        return true;
      }
      setFormError(requestCodeError(status, json.error));
      return false;
    } catch {
      setFormError(requestCodeError(0, 'auth-unavailable'));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function sendCode() {
    if (busy) return;
    const emailError = validateEmail(email);
    setErrors(emailError ? { email: emailError } : {});
    if (emailError) return;
    setFormError(null);
    const normalized = email.trim().toLowerCase();
    // Already trusted on this device (and inside the logout grace)? Then
    // no code is needed at all — straight in.
    try {
      const existing = getUserByEmail(normalized);
      if (existing && deviceMayAutoLogin(getDeviceTrust(existing.id, deviceId))) {
        onAuthed(toAuthUser(existing));
        return;
      }
    } catch {
      // Local lookup failed; fall through to the code route.
    }
    if (await requestCode(normalized)) goTo('code');
  }

  async function resendCode() {
    if (busy || now < resendAt) return;
    setFormError(null);
    await requestCode(email.trim().toLowerCase());
  }

  async function verify() {
    if (busy) return;
    const codeError = validateCode(code);
    setErrors(codeError ? { code: codeError } : {});
    if (codeError) return;
    setFormError(null);
    setBusy(true);
    try {
      const { status, json } = await postJson('/api/auth/verify-code', {
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });
      if (status !== 200 || !json.ok) {
        setFormError(verifyCodeError(status, json.error));
        return;
      }
      const normalized = email.trim().toLowerCase();
      const existing = getUserByEmail(normalized);
      let user: DbUser;
      let isNew = false;
      if (existing) {
        user = existing;
      } else {
        const hadUsers = countUsers() > 0;
        user = createUserByEmail(normalized);
        isNew = true;
        if (!hadUsers) {
          // First account on this device inherits any pre-auth progress.
          migrateLocalDataToUser(user.id);
        }
      }
      const authed = toAuthUser(user);
      if (isNew && !userHasPassword(user)) {
        // First time in: offer the optional password, never force it.
        setPendingUser(authed);
        goTo('add-password');
        return;
      }
      onAuthed(authed);
    } catch {
      setFormError(verifyCodeError(0, 'auth-unavailable'));
    } finally {
      setBusy(false);
    }
  }

  async function loginWithPassword() {
    if (busy) return;
    const emailError = validateEmail(email);
    const passwordError = validateLoginPassword(password);
    setErrors({
      email: emailError,
      password: passwordError,
    });
    if (emailError || passwordError) return;
    setFormError(null);
    setBusy(true);
    try {
      const user = getUserByEmail(email.trim().toLowerCase());
      if (!user || !userHasPassword(user) || !verifyPassword(password, user.salt, user.passwordHash)) {
        setFormError('Email or password is incorrect.');
        return;
      }
      onAuthed(toAuthUser(user));
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function savePassword() {
    if (busy || !pendingUser) return;
    const errs = validatePasswordSet(password, confirmPassword);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setFormError(null);
    setBusy(true);
    try {
      setUserPassword(pendingUser.id, password);
      onAuthed(pendingUser);
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const resendWaitSeconds = Math.max(0, Math.ceil((resendAt - now) / 1000));

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <View style={styles.brand}>
          <BrandMark size={48} />
        </View>
        {step === 'email' ? (
          <>
            <Text style={styles.heading}>Welcome to Munpro!</Text>
            <Text style={styles.sub}>Enter your email and we&apos;ll send you a 6-digit code.</Text>
          </>
        ) : step === 'code' ? (
          <>
            <Text style={styles.heading}>Check your email</Text>
            <Text style={styles.sub}>Enter the 6-digit code sent to {email.trim()}.</Text>
          </>
        ) : step === 'password' ? (
          <>
            <Text style={styles.heading}>Log in with password</Text>
            <Text style={styles.sub}>Use the password you set for this account.</Text>
          </>
        ) : (
          <>
            <Text style={styles.heading}>Add a password?</Text>
            <Text style={styles.sub}>Optional — it lets you log in without waiting for a code.</Text>
          </>
        )}

        {step === 'email' || step === 'password' ? (
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setErrors((e) => ({ ...e, email: undefined }));
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              returnKeyType="next"
              placeholder="you@example.com"
              placeholderTextColor={colors.faint}
            />
            {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}
          </View>
        ) : null}

        {step === 'code' ? (
          <View style={styles.field}>
            <Text style={styles.label}>6-digit code</Text>
            <TextInput
              style={[styles.input, styles.codeInput]}
              value={code}
              onChangeText={(v) => {
                setCode(v.replace(/[^0-9]/g, '').slice(0, 6));
                setErrors((e) => ({ ...e, code: undefined }));
              }}
              keyboardType="number-pad"
              returnKeyType="go"
              maxLength={6}
              onSubmitEditing={() => void verify()}
              placeholder="123456"
              placeholderTextColor={colors.faint}
            />
            {errors.code ? <Text style={styles.error}>{errors.code}</Text> : null}
            {relayNote ? (
              <Text style={styles.note}>
                Email sending isn&apos;t set up yet — the code was saved for manual delivery. Ask Muse for it.
              </Text>
            ) : null}
          </View>
        ) : null}

        {step === 'password' || step === 'add-password' ? (
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  setErrors((e) => ({ ...e, password: undefined }));
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType={step === 'password' ? 'go' : 'next'}
                onSubmitEditing={() => {
                  if (step === 'password') void loginWithPassword();
                }}
                placeholder="Password"
                placeholderTextColor={colors.faint}
              />
              <Pressable
                onPress={() => setShowPassword((s) => !s)}
                style={styles.showButton}
                accessibilityRole="button"
              >
                <Text style={styles.showText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
            {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}
          </View>
        ) : null}

        {step === 'add-password' ? (
          <View style={styles.field}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                setErrors((e) => ({ ...e, confirmPassword: undefined }));
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={() => void savePassword()}
              placeholder="Password again"
              placeholderTextColor={colors.faint}
            />
            {errors.confirmPassword ? <Text style={styles.error}>{errors.confirmPassword}</Text> : null}
          </View>
        ) : null}

        {formError ? <Text style={styles.error}>{formError}</Text> : null}

        {step === 'email' ? (
          <Pressable
            onPress={() => void sendCode()}
            disabled={busy}
            style={[styles.submit, busy ? commonStyles.btnDisabled : undefined]}
          >
            <Text style={commonStyles.btnText}>{busy ? 'Sending code…' : 'Send code'}</Text>
          </Pressable>
        ) : step === 'code' ? (
          <Pressable
            onPress={() => void verify()}
            disabled={busy}
            style={[styles.submit, busy ? commonStyles.btnDisabled : undefined]}
          >
            <Text style={commonStyles.btnText}>{busy ? 'Verifying…' : 'Verify'}</Text>
          </Pressable>
        ) : step === 'password' ? (
          <Pressable
            onPress={() => void loginWithPassword()}
            disabled={busy}
            style={[styles.submit, busy ? commonStyles.btnDisabled : undefined]}
          >
            <Text style={commonStyles.btnText}>{busy ? 'Logging in…' : 'Log in'}</Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={() => void savePassword()}
              disabled={busy}
              style={[styles.submit, busy ? commonStyles.btnDisabled : undefined]}
            >
              <Text style={commonStyles.btnText}>{busy ? 'Saving…' : 'Save password'}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (pendingUser) onAuthed(pendingUser);
              }}
              disabled={busy}
              style={styles.secondary}
            >
              <Text style={styles.secondaryText}>Skip for now</Text>
            </Pressable>
          </>
        )}

        {step === 'email' ? (
          <Pressable onPress={() => goTo('password')} style={styles.switchRow}>
            <Text style={styles.switchText}>
              Have a password? <Text style={styles.switchLink}>Log in with password instead</Text>
            </Text>
          </Pressable>
        ) : step === 'code' ? (
          <>
            <Pressable
              onPress={() => void resendCode()}
              disabled={busy || resendWaitSeconds > 0}
              style={styles.switchRow}
            >
              <Text style={[styles.switchText, resendWaitSeconds > 0 ? styles.switchMuted : undefined]}>
                {resendWaitSeconds > 0 ? `Resend code in ${resendWaitSeconds}s` : 'Resend code'}
              </Text>
            </Pressable>
            <Pressable onPress={() => goTo('email')} style={styles.switchRow}>
              <Text style={styles.switchText}>
                Wrong email? <Text style={styles.switchLink}>Use a different email</Text>
              </Text>
            </Pressable>
          </>
        ) : step === 'password' ? (
          <Pressable onPress={() => goTo('email')} style={styles.switchRow}>
            <Text style={styles.switchText}>
              No password? <Text style={styles.switchLink}>Send me a code instead</Text>
            </Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.bg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E4E4E4',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
  field: {
    marginTop: 14,
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  showButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  showText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  error: {
    fontSize: 13,
    color: colors.redDark,
  },
  note: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  submit: {
    marginTop: 16,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    marginTop: 12,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
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
  switchMuted: {
    color: colors.faint,
  },
  switchLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});
