import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import {
  clearSessionToken,
  clearSessionUserId,
  deviceMayAutoLogin,
  getDeviceTrust,
  getLastUserId,
  getOrCreateDeviceId,
  getSessionToken,
  getSessionUserId,
  getSoleUser,
  getUserById,
  initDb,
  markDeviceLogout,
  setCurrentUserId,
  setLastUserId,
  setSessionUserId,
  trustDevice,
  LOCAL_USER_ID,
} from '../db';
import { logoutServer } from '../lib/api';
import { syncNow } from '../lib/sync';
import { AuthContext, type AuthUser } from '../lib/auth-context';
import AuthScreen from '../components/AuthScreen';
import AppHeader from '../components/AppHeader';
import BrandMark from '../components/BrandMark';
import DashboardSkeleton from '../components/DashboardSkeleton';
import ReadOnlyView from '../components/ReadOnlyView';
import { colors, commonStyles } from '../components/theme';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 'Invalid VFS state' comes from expo-sqlite's web worker (see
 * node_modules/expo-sqlite/web/worker.ts `maybeInitAsync`): the wasm module
 * loaded, but creating the OPFS access-handle pool failed, so the worker
 * records a half-initialized state and every later call throws the same
 * error. The pool's `createSyncAccessHandle()` takes an exclusive lock per
 * file, so the usual cause is another tab (or a still-alive old worker)
 * holding the database open — the DB can only be opened by one tab at a
 * time. In-page retries can NEVER fix this: the worker is bricked for the
 * life of the page. Only a full page reload (fresh worker) recovers, after
 * any other Munpro tab is closed. */
function isVfsStateError(e: unknown): boolean {
  return e instanceof Error && e.message.includes('Invalid VFS state');
}

function reloadApp() {
  if (Platform.OS === 'web') {
    window.location.reload();
  }
}

export default function RootLayout() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [lastEmail, setLastEmail] = useState<string | null>(null);
  const [initDone, setInitDone] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  // Read-only mode: entered from the VFS error screen. The DB stays
  // locked in this tab; progress is shown from the server sync document
  // instead (see components/ReadOnlyView). Never set in normal flow.
  const [readOnly, setReadOnly] = useState(false);

  // The DB init promise, started once on mount. The auth screen paints
  // immediately and does not wait for it — on web, expo-sqlite runs in a
  // worker (wa-sqlite) and the wasm fetch/compile + OPFS init takes
  // seconds, so blocking first paint on it is the slow initial load.
  const initPromise = useRef<Promise<void> | null>(null);

  // Holds the warm async connection for the life of the app. expo-sqlite
  // web runs SQLite in a worker; the sync channel spins on Atomics.pause
  // with a 1,000,000-iteration budget and throws 'Sync operation timeout'
  // if the worker hasn't answered. Warming up through the async API (no
  // spin budget) and KEEPING that connection open means the worker has the
  // database open and cached, so the first sync open hits the cache and
  // returns immediately. The old code closed the warm connection, which
  // forced the sync open to redo the slow OPFS open_v2 — that times out
  // on a phone. Warming up before every attempt (cheap when warm — the
  // worker reuses the cached connection) also covers a sync open that
  // timed out mid-open on a previous attempt.
  const warmDb = useRef<SQLiteDatabase | null>(null);

  // Mirrors the deviceId state for handleAuthed, which is a stable
  // callback and would otherwise close over the initial null.
  const deviceIdRef = useRef<string | null>(null);

  // Returns the post-init facts; the caller applies them to state. Kept
  // free of setState calls so the effect that starts it stays clean for
  // the react-hooks/set-state-in-effect rule.
  const initDatabase = useCallback(async (): Promise<{
    sessionUser: AuthUser | null;
    deviceId: string;
    lastEmail: string | null;
  }> => {
    for (let i = 0; i < 5; i++) {
      try {
        if (Platform.OS === 'web') {
          const warm = await openDatabaseAsync('korean-cloze-srs.db');
          // Force the worker to actually open the file (wasm + OPFS VFS
          // init), not just create the handle.
          await warm.execAsync('SELECT 1');
          warmDb.current = warm;
        }
        initDb();
        break;
      } catch (e) {
        // A bricked worker (Invalid VFS state) never recovers in-page —
        // retrying just burns time. Fail fast so the error screen can
        // offer a reload instead.
        if (isVfsStateError(e) || i === 4) throw e;
        await sleep(1500);
      }
    }
    const deviceId = getOrCreateDeviceId();
    // Auto-login rules (email-code auth): an active session on a trusted
    // device goes straight in; a device whose user logged out within the
    // 30-minute grace also goes straight in; anything else sees the email
    // form. A session without a trust row (e.g. from before device trust
    // existed) is dropped, not honoured.
    let sessionUser: AuthUser | null = null;
    const sessionUserId = getSessionUserId();
    if (sessionUserId) {
      const found = getUserById(sessionUserId);
      if (found && deviceMayAutoLogin(getDeviceTrust(found.id, deviceId))) {
        setCurrentUserId(found.id);
        sessionUser = { id: found.id, username: found.username, email: found.email };
      } else {
        clearSessionUserId();
      }
    }
    if (!sessionUser) {
      const lastUserId = getLastUserId();
      const lastUser = lastUserId ? getUserById(lastUserId) : null;
      if (lastUser && deviceMayAutoLogin(getDeviceTrust(lastUser.id, deviceId))) {
        setCurrentUserId(lastUser.id);
        setSessionUserId(lastUser.id);
        sessionUser = { id: lastUser.id, username: lastUser.username, email: lastUser.email };
      }
    }
    // Prefill the email form: the last user on this device, else the only
    // account when there is exactly one.
    const lastUserId = getLastUserId();
    const lastUser = lastUserId ? getUserById(lastUserId) : null;
    const lastEmail = lastUser?.email ?? getSoleUser()?.email ?? null;
    return { sessionUser, deviceId, lastEmail };
  }, []);

  useEffect(() => {
    initPromise.current = initDatabase()
      .then(({ sessionUser, deviceId, lastEmail }) => {
        deviceIdRef.current = deviceId;
        setDeviceId(deviceId);
        setLastEmail(lastEmail);
        if (sessionUser) {
          setUser(sessionUser);
          // Auto-login restored a session: pull the server state (a new
          // device gets its progress back) and push anything local.
          // Best-effort — offline, the app just works locally.
          void syncNow();
        }
        setInitDone(true);
      })
      .catch((e) => {
        setDbError(e instanceof Error ? e.message : 'Failed to open the database.');
        throw e;
      });
  }, [initDatabase, attempt]);

  const handleAuthed = useCallback(
    (authed: AuthUser) => {
      // Any successful auth (email code or password) trusts this device
      // for the user and keeps the session, so the next launch on the
      // same device goes straight in.
      setCurrentUserId(authed.id);
      try {
        if (deviceIdRef.current) {
          trustDevice(authed.id, deviceIdRef.current);
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
    [],
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
      if (user && deviceIdRef.current) markDeviceLogout(user.id, deviceIdRef.current);
    } catch {
      // DB already gone (should not happen while logged in); ignore.
    }
    setCurrentUserId(LOCAL_USER_ID);
    setUser(null);
  }, [user]);

  if (readOnly) {
    return <ReadOnlyView onBack={() => setReadOnly(false)} />;
  }

  if (dbError) {
    const vfsError = dbError.includes('Invalid VFS state');
    return (
      <View style={commonStyles.centered}>
        <Text style={commonStyles.title}>Couldn&apos;t open the database</Text>
        <Text style={commonStyles.subtitle}>{dbError}</Text>
        {vfsError ? (
          <Text style={commonStyles.muted}>
            The database can only be opened by one tab at a time. If Munpro is open in another
            tab, close that tab first, then reload this one. Your progress is stored on this
            device. Or view your progress read-only from the server — no reviews or learning
            in this tab.
          </Text>
        ) : (
          <Text style={commonStyles.muted}>Try restarting the app. Your progress is stored on this device.</Text>
        )}
        {vfsError ? (
          <>
            <Pressable
              onPress={() => setReadOnly(true)}
              style={{ marginTop: 16, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: colors.primary, borderRadius: 8 }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>View read-only</Text>
            </Pressable>
            <Pressable
              onPress={() => reloadApp()}
              style={{ marginTop: 12, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 8 }}
            >
              <Text style={{ color: colors.text, fontWeight: '600' }}>Reload app</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={() => {
              setDbError(null);
              setAttempt((a) => a + 1);
            }}
            style={{ marginTop: 16, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: colors.primary, borderRadius: 8 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
          </Pressable>
        )}
      </View>
    );
  }

  // The frontend loads immediately: while the database warms up and the
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
