import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Stack } from 'expo-router';
import {
  clearSessionToken,
  clearSessionUserId,
  getSessionToken,
  initStore,
  markDeviceLogout,
  setCurrentUserId,
  setLastUserId,
  setSessionUserId,
  trustDevice,
  LOCAL_USER_ID,
} from '../store';
import { logoutServer } from '../lib/api';
import { syncNow } from '../store/sync';
import { AuthContext, type AuthUser } from '../lib/auth-context';
import AuthScreen from '../components/AuthScreen';
import AppHeader from '../components/AppHeader';
import BrandMark from '../components/BrandMark';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { colors, commonStyles } from '../components/theme';

// Root layout — web store boot (no SQLite, no OPFS).
//
// initStore() loads the user's progress from IndexedDB, then pulls the
// server snapshot when there is a token. It never throws for a storage
// failure: a missing cache just means "start from the server (or empty)",
// and a failed pull just means "work from the cache". There is no
// database to fail opening, so there is no error screen — the app always
// boots, shows the auth screen when logged out, and syncs in the
// background when logged in.

export default function RootLayout() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [lastEmail, setLastEmail] = useState<string | null>(null);
  const [initDone, setInitDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    initStore()
      .then(({ sessionUser, deviceId, lastEmail }) => {
        if (cancelled) return;
        setDeviceId(deviceId);
        setLastEmail(lastEmail);
        if (sessionUser) {
          setCurrentUserId(sessionUser.id);
          setUser(sessionUser);
          // Auto-login restored a session: pull the server state (a new
          // device gets its progress back) and push anything local.
          // Best-effort — offline, the app just works from the cache.
          void syncNow();
        }
        setInitDone(true);
      })
      .catch(() => {
        // initStore is designed not to throw for storage failures; if
        // something unexpected still goes wrong, show the auth screen
        // rather than bricking the app — logging in re-syncs from the
        // server.
        if (cancelled) return;
        setInitDone(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAuthed = useCallback(
    (authed: AuthUser) => {
      // Any successful auth (email code or password) trusts this device
      // for the user and keeps the session, so the next launch on the
      // same device goes straight in.
      setCurrentUserId(authed.id);
      try {
        if (deviceId) {
          trustDevice(authed.id, deviceId);
          setSessionUserId(authed.id);
          setLastUserId(authed.id);
        }
      } catch {
        // Trust/session bookkeeping failed; the login itself still stands
        // for this launch (next launch will ask for a code again).
      }
      setUser(authed);
      // Fresh login: pull the server state (a new device gets its
      // progress back) and push anything local. Best-effort.
      void syncNow();
    },
    [deviceId],
  );

  const logout = useCallback(() => {
    try {
      clearSessionUserId();
      // Invalidate the server session too, so the token cannot be reused.
      const token = getSessionToken();
      if (token) void logoutServer(token);
      clearSessionToken();
      // Stamps the trust row: this device may auto-log the user back in
      // for 30 minutes; past that, the email-code route is required.
      if (user && deviceId) markDeviceLogout(user.id, deviceId);
    } catch {
      // Session bookkeeping failed; ignore.
    }
    setCurrentUserId(LOCAL_USER_ID);
    setUser(null);
  }, [user, deviceId]);

  // The frontend loads immediately: while the store boots and the
  // session restores in the background, the shell (nav bar + dashboard
  // skeleton) paints right away and the deck details fill in when they
  // arrive. There is no blocking "loading" screen.
  if (!user && !initDone) {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: colors.navy,
            minHeight: 56,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
          }}
        >
          <BrandMark size={28} dark />
        </View>
        <ScrollView
          style={commonStyles.screen}
          contentContainerStyle={commonStyles.scrollContent}
        >
          <DashboardSkeleton />
        </ScrollView>
      </View>
    );
  }

  if (!user) {
    return (
      <AuthContext.Provider value={{ user: null, logout }}>
        <AuthScreen
          lastEmail={lastEmail}
          deviceId={deviceId ?? ''}
          onAuthed={handleAuthed}
        />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      <View style={{ flex: 1 }}>
        <AppHeader user={user} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="grammar/[id]" />
          <Stack.Screen name="account" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="decks" />
          <Stack.Screen name="decks/[id]" />
          <Stack.Screen name="cram" />
          <Stack.Screen name="practice-tests" />
          <Stack.Screen name="reading" />
          <Stack.Screen name="stories" />
          <Stack.Screen name="hangul" />
          <Stack.Screen name="not-yet-implemented" />
        </Stack>
      </View>
    </AuthContext.Provider>
  );
}
