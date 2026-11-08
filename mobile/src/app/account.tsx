import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { getUserById, setUserPassword, userHasPassword } from '../db';
import { validatePasswordSet, verifyPassword } from '../lib/auth';
import { useAuth } from '../lib/auth-context';
import { colors, commonStyles } from '../components/theme';

/**
 * Account screen: shows the signed-in email and manages the optional
 * password (email-code auth is the preferred route; the password is only
 * a second way in). Reached from the dashboard profile card.
 */
export default function AccountScreen() {
  const { user } = useAuth();
  const [hasPassword, setHasPassword] = useState(() => {
    const dbUser = user ? getUserById(user.id) : null;
    return dbUser ? userHasPassword(dbUser) : false;
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ currentPassword?: string; password?: string; confirmPassword?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  async function save() {
    if (busy || !user) return;
    const dbUser = getUserById(user.id);
    if (!dbUser) {
      setFormError('Account not found. Try logging in again.');
      return;
    }
    if (hasPassword && !verifyPassword(currentPassword, dbUser.salt, dbUser.passwordHash)) {
      setErrors({ currentPassword: 'Current password is incorrect.' });
      return;
    }
    const errs = validatePasswordSet(password, confirmPassword);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setFormError(null);
    setBusy(true);
    try {
      setUserPassword(user.id, password);
      setHasPassword(true);
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      setSaved(true);
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={styles.scroll}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>
      <View style={styles.card}>
        <Text style={styles.heading}>Account</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{user.username}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{hasPassword ? 'Change password' : 'Add a password'}</Text>
          <Text style={styles.sub}>
            Optional — email codes are the preferred way in. A password just lets you log in
            without waiting for a code.
          </Text>
        </View>

        {hasPassword ? (
          <View style={styles.field}>
            <Text style={styles.label}>Current password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={(v) => {
                setCurrentPassword(v);
                setSaved(false);
                setErrors((e) => ({ ...e, currentPassword: undefined }));
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Current password"
              placeholderTextColor={colors.faint}
            />
            {errors.currentPassword ? <Text style={styles.error}>{errors.currentPassword}</Text> : null}
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>New password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setSaved(false);
                setErrors((e) => ({ ...e, password: undefined }));
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="At least 8 characters"
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

        <View style={styles.field}>
          <Text style={styles.label}>Confirm new password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={(v) => {
              setConfirmPassword(v);
              setSaved(false);
              setErrors((e) => ({ ...e, confirmPassword: undefined }));
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Password again"
            placeholderTextColor={colors.faint}
          />
          {errors.confirmPassword ? <Text style={styles.error}>{errors.confirmPassword}</Text> : null}
        </View>

        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        {saved ? <Text style={styles.saved}>Password saved.</Text> : null}

        <Pressable
          onPress={() => void save()}
          disabled={busy}
          style={[styles.submit, busy ? commonStyles.btnDisabled : undefined]}
        >
          <Text style={commonStyles.btnText}>{busy ? 'Saving…' : 'Save password'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: {
    paddingVertical: 8,
    marginBottom: 4,
  },
  backText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  scroll: {
    flexGrow: 1,
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
    gap: 4,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
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
  value: {
    fontSize: 16,
    color: colors.text,
  },
  sub: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
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
  saved: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  submit: {
    marginTop: 16,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
