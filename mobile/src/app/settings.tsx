import { useCallback, useState } from 'react';
import { Link, useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { getLastSyncedAt, getSessionToken, getUserSettings, updateUserSettings, type UserSettings } from '../store';
import { syncNow } from '../lib/sync';
import Stepper from '../components/Stepper';
import { colors, commonStyles } from '../components/theme';

/**
 * Settings — General + Reviews, modelled on Bunpro's settings pages.
 * Every control saves immediately and actually drives the app (daily
 * limit and batch size feed Learn, the review toggles feed the review
 * HUD, vacation mode pauses reviews/learning and bridges the streak).
 * Per-deck daily goal and batch size live on each deck's page.
 */

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={commonStyles.muted}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary }} />
    </View>
  );
}

function syncStatusText(): string {
  if (!getSessionToken()) return 'Not signed in on the server — log in by email code to enable sync.';
  const last = getLastSyncedAt();
  if (!last) return 'Never synced yet. Your progress is only on this device.';
  return `Last synced ${new Date(last).toLocaleString()}.`;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<UserSettings>(() => getUserSettings());
  const [syncStatus, setSyncStatus] = useState<string>(() => syncStatusText());
  const [syncing, setSyncing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setSettings(getUserSettings());
      setSyncStatus(syncStatusText());
    }, []),
  );

  function update(patch: Partial<UserSettings>) {
    updateUserSettings(patch);
    setSettings(getUserSettings());
  }

  async function doSync() {
    if (syncing) return;
    setSyncing(true);
    setSyncStatus('Syncing…');
    try {
      const result = await syncNow();
      if (result.status === 'offline') {
        setSyncStatus('Could not reach the server. Your progress is safe on this device and will sync later.');
      } else if (result.status === 'no-token' || result.status === 'unauthorized') {
        setSyncStatus('Not signed in on the server — log in by email code to enable sync.');
      } else {
        setSyncStatus(syncStatusText());
      }
    } finally {
      setSyncing(false);
    }
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={commonStyles.scrollContent}>
      <Text style={commonStyles.title}>Settings</Text>

      <Text style={styles.sectionTitle}>General</Text>
      <View style={commonStyles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Daily new-items limit</Text>
            <Text style={commonStyles.muted}>
              New grammar points Learn offers each day (1–10).
            </Text>
          </View>
          <Stepper
            value={settings.dailyNewLimit}
            min={1}
            max={10}
            step={1}
            format={(v) => String(v)}
            onChange={(v) => update({ dailyNewLimit: v })}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Batch size</Text>
            <Text style={commonStyles.muted}>
              New points presented in a single Learn session (never more than the daily limit).
            </Text>
          </View>
          <Stepper
            value={settings.batchSize}
            min={1}
            max={10}
            step={1}
            format={(v) => String(v)}
            onChange={(v) => update({ batchSize: v })}
          />
        </View>
        <View style={styles.divider} />
        <ToggleRow
          label="Hide streak"
          description="Hide the streak box on the dashboard."
          value={settings.hideStreak}
          onChange={(v) => update({ hideStreak: v })}
        />
        <View style={styles.divider} />
        <ToggleRow
          label="Vacation mode"
          description="Pause reviews and learning completely. Your streak is frozen while it is on, and resumes when you turn it off."
          value={settings.vacationMode}
          onChange={(v) => update({ vacationMode: v })}
        />
      </View>

      <Text style={styles.sectionTitle}>Reviews</Text>
      <View style={commonStyles.card}>
        <ToggleRow
          label="Show SRS rank"
          description="Show the SRS rank (Beginner, Seasoned, Master…) in the review HUD."
          value={settings.showSrsRank}
          onChange={(v) => update({ showSrsRank: v })}
        />
        <View style={styles.divider} />
        <ToggleRow
          label="Undo"
          description="Show the Undo button after answering a review, to re-type your answer."
          value={settings.undoEnabled}
          onChange={(v) => update({ undoEnabled: v })}
        />
        <View style={styles.divider} />
        <ToggleRow
          label="Lightning mode"
          description="Advance automatically on a correct answer, with no confirmation step."
          value={settings.lightningMode}
          onChange={(v) => update({ lightningMode: v })}
        />
        <View style={styles.divider} />
        <ToggleRow
          label="Focus mode"
          description="Hide the top navigation bar during reviews."
          value={settings.focusMode}
          onChange={(v) => update({ focusMode: v })}
        />
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Max reviews per day</Text>
            <Text style={commonStyles.muted}>
              Cap the reviews offered each day. Off means no cap.
            </Text>
          </View>
          <Stepper
            value={settings.maxReviewsPerDay ?? 0}
            min={0}
            max={100}
            step={5}
            format={(v) => (v === 0 ? 'Off' : String(v))}
            onChange={(v) => update({ maxReviewsPerDay: v === 0 ? null : v })}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Sync & backup</Text>
      <View style={commonStyles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Cloud backup</Text>
            <Text style={commonStyles.muted}>
              Your reviews, streak, and settings are backed up to the server so they survive a lost device or a new phone. Sync also runs automatically after you log in and after each session.
            </Text>
            <Text style={[commonStyles.muted, { marginTop: 6 }]}>{syncStatus}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Pressable onPress={() => void doSync()} disabled={syncing} style={styles.syncButton}>
          <Text style={styles.syncButtonText}>{syncing ? 'Syncing…' : 'Sync now'}</Text>
        </Pressable>
      </View>

      <Text style={[commonStyles.muted, { marginTop: 16 }]}>
        Per-deck daily goal and batch size are set on each deck&apos;s page.
      </Text>
      <Link href="/account" asChild>
        <Pressable style={styles.accountLink}>
          <Text style={styles.accountLinkText}>Account & password ›</Text>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  syncButton: {
    marginTop: 12,
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  accountLink: {
    marginTop: 16,
    paddingVertical: 8,
  },
  accountLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});
