import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { initDb } from '../db';
import { colors, commonStyles } from '../components/theme';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      initDb();
      setReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to open the database.');
    }
  }, []);

  if (error) {
    return (
      <View style={commonStyles.centered}>
        <Text style={commonStyles.title}>Couldn&apos;t open the database</Text>
        <Text style={commonStyles.subtitle}>{error}</Text>
        <Text style={commonStyles.muted}>Try restarting the app. Your progress is stored on this device.</Text>
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
