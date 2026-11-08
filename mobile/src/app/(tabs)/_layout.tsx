import { Tabs } from 'expo-router';

// The tab navigator is only the router now: all navigation lives in the
// top AppHeader (desktop navbar / mobile hamburger), so the bottom tab
// bar is hidden entirely. The bar style still carries height: 0 so the
// navigator reports a zero tab-bar height and screens get no bottom
// padding reserved for a bar that isn't there.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none', height: 0 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
      <Tabs.Screen name="review" options={{ title: 'Reviews' }} />
      <Tabs.Screen name="grammar" options={{ title: 'Grammar' }} />
    </Tabs>
  );
}
