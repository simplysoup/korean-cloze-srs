import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { initDb } from '../db';
import { colors, commonStyles } from '../components/theme';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // On web, expo-sqlite runs SQLite in a worker (wa-sqlite). The first
  // synchronous open races worker startup (wasm fetch + compile + OPFS
  // VFS init) against a ~73ms Atomics.pause spin budget in the sync
  // channel, so it can fail with "Sync operation timeout" even though the
  // worker keeps initializing in the background. Retrying a moment later
  // succeeds once the worker is warm. On native the first attempt
  // succeeds and no retry ever runs.
  const init = useCallback(async () => {
    setError(null);
    for (let i = 0; i < 8; i++) {
      try {
        initDb();
        setReady(true);
        return;
      } catch (e) {
        if (i === 7) {
          setError(e instanceof Error ? e.message : 'Failed to open the database.');
          return;
        }
        await sleep(400 * (i + 1));
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
