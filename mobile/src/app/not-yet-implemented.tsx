import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { commonStyles } from '../components/theme';

/**
 * Shared placeholder for features that are not built yet (content-blocked
 * practice modes, Topics, Content Search, Bookmarks). The route takes a
 * `feature` query param naming the feature. Links back to the dashboard.
 */
export default function NotYetImplementedScreen() {
  const { feature } = useLocalSearchParams<{ feature?: string | string[] }>();
  const name = Array.isArray(feature) ? feature[0] : feature;
  const title = name ? `${name}` : 'This feature';

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
      <View style={[commonStyles.card, styles.card]}>
        <Text style={commonStyles.title}>{title} isn&apos;t built yet</Text>
        <Text style={[commonStyles.body, styles.body]}>
          {name
            ? `${name} is on the list, but it needs content or work that isn't ready yet.`
            : 'This feature is on the list, but it needs content or work that isn\u2019t ready yet.'}
        </Text>
        <Text style={[commonStyles.muted, styles.body]}>
          The dashboard, Learn, Reviews, the deck catalogue, and the Grammar Library are ready
          to use.
        </Text>
        <Link href="/" asChild>
          <Pressable
            style={StyleSheet.flatten([commonStyles.btn, commonStyles.btnPrimary, styles.button])}
          >
            <Text style={commonStyles.btnText}>Back to Dashboard</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    gap: 12,
  },
  body: {
    marginTop: 4,
  },
  button: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});
