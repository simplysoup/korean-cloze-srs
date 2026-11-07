import { useCallback, useState } from 'react';
import { Text } from 'react-native';
import { Tabs, useFocusEffect } from 'expo-router';
import { getDashboardStats } from '../../db';
import { colors } from '../../components/theme';

function TabIcon({ label }: { label: string }) {
  return <Text style={{ fontSize: 20 }}>{label}</Text>;
}

export default function TabsLayout() {
  const [dueCount, setDueCount] = useState(0);

  // Refresh the Review badge whenever the user lands on any tab.
  useFocusEffect(
    useCallback(() => {
      try {
        setDueCount(getDashboardStats().dueCount);
      } catch {
        // DB not ready yet; the root layout gates on initDb, so this is defensive.
      }
    }, []),
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 12 },
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: () => <TabIcon label="📊" />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarLabel: 'Learn',
          tabBarIcon: () => <TabIcon label="📚" />,
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Review',
          tabBarLabel: 'Review',
          tabBarIcon: () => <TabIcon label="✏️" />,
          tabBarBadge: dueCount > 0 ? dueCount : undefined,
        }}
      />
      <Tabs.Screen
        name="grammar"
        options={{
          title: 'Grammar',
          tabBarLabel: 'Grammar',
          tabBarIcon: () => <TabIcon label="🔤" />,
        }}
      />
    </Tabs>
  );
}
