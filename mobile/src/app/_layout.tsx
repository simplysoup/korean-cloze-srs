import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { openDatabaseAsync } from 'expo-sqlite';
import { initDb } from '../db';
import { colors, commonStyles } from '../components/theme';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // On web, expo-sqlite runs SQLite in a worker (wa-sqlite). A synchronous
  // open races worker startup (wasm fetch + compile + OPFS VFS init)
  // against a ~73ms Atomics.pause spin budget in the sync channel, so the
  // first sync open fails with "Sync operation timeout" — and blind
  // retries make it worse, because the worker has no guard against
  // concurrent init and a second open mid-init fails with SQLITE_MISUSE
  // (error 21). Fix: on web, warm the worker up once through the async
  // API, which has no spin budget and waits for init to finish, then
  // close it and do the normal synchronous init against the warm worker.
  // On native the warm-up is skipped and the first attempt just works.
  const init = useCallback(async () => {
    setError(null);
    try {
      if (Platform.OS === 'web') {
        const warm = await openDatabaseAsync('korean-cloze-srs.db');
        await warm.closeAsync();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to open the database.');
      return;
    }
    for (let i = 0; i < 3; i++) {
      try {
        initDb();
        setReady(true);
        return;
      } catch (e) {
        if (i === 2) {
          setError(e instanceof Error ? e.message : 'Failed to open the database.');
          return;
        }
        await sleep(1000);
      }
    }
  }, []);

  useEffect(() => {
    void init();
  }, [init, attempt]);

  if (error) {
    return (
      <View style={commonStyles.centered}>
        <Text style={commonStyles.title}>Couldn&apos;t open the database</Text>
        <Text style={commonStyles.subtitle}>{error}</Text>
        <Text style={commonStyles.muted}>Try restarting the app. Your progress is stored on this device.</Text>
        <Pressable
          onPress={() => {
            setReady(false);
            setAttempt((a) => a + 1);
          }}
          style={{ marginTop: 16, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: colors.primary, borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={commonStyles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={commonStyles.subtitle}>Loading your deck…</Text>
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="grammar/[id]" options={{ title: 'Grammar' }} />
    </Stack>
  );
}
