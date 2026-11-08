import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

/**
 * The dashboard's loading state: the frontend (Learn/Review cards,
 * stats bar, section cards) renders immediately with placeholder bars,
 * and the deck details fill in when the database answers. No loading
 * text — the placeholders are the loading state.
 */
export default function DashboardSkeleton() {
  return (
    <View style={styles.wrap}>
      <View style={[styles.bigCard, { backgroundColor: colors.navy }]}>
        <Text style={styles.bigTitle}>Learn</Text>
        <View style={styles.segments}>
          {Array.from({ length: 5 }, (_, i) => (
            <View key={i} style={[styles.segment, styles.segmentEmpty]} />
          ))}
        </View>
      </View>
      <View style={[styles.bigCard, { backgroundColor: colors.primary, marginTop: 12 }]}>
        <View style={styles.reviewRow}>
          <View>
            <Text style={styles.bigTitle}>Review</Text>
            <Text style={styles.bigSubtitle}>Grammar &amp; Vocab</Text>
          </View>
          <View style={styles.pillPlaceholder} />
        </View>
      </View>
      <View style={styles.statsPlaceholder} />
      <View style={styles.cardPlaceholder}>
        <View style={styles.linePlaceholder} />
        <View style={[styles.linePlaceholder, { width: '70%' }]} />
      </View>
      <View style={styles.cardPlaceholder}>
        <View style={styles.linePlaceholder} />
        <View style={[styles.linePlaceholder, { width: '55%' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 0,
  },
  bigCard: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
    minHeight: 88,
    justifyContent: 'center',
  },
  bigTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  bigSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  segments: {
    flexDirection: 'row',
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  segmentEmpty: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pillPlaceholder: {
    width: 56,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  statsPlaceholder: {
    height: 56,
    borderRadius: 12,
    backgroundColor: '#D9D9D9',
    marginTop: 16,
  },
  cardPlaceholder: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    gap: 10,
  },
  linePlaceholder: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E4E4E4',
  },
});
