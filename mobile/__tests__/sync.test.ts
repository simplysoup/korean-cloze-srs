// Sync merge rules + wiring. The merge must never lose a review, so the
// "which side wins" decisions are pure functions tested here. The DB
// apply (db/index.ts) and the protocol (lib/sync.ts) use them.
import * as fs from 'fs';
import * as path from 'path';
import { mergeDailyLearned, mergeStreaks, serverCardWins } from '../src/lib/sync-merge';

describe('serverCardWins (review cards)', () => {
  it('server wins when its lastReview is later', () => {
    expect(
      serverCardWins(
        { lastReview: '2026-11-08T20:00:00.000Z', reps: 5 },
        { lastReview: '2026-11-09T20:00:00.000Z', reps: 6 },
      ),
    ).toBe(true);
  });

  it('local wins when its lastReview is later', () => {
    expect(
      serverCardWins(
        { lastReview: '2026-11-09T20:00:00.000Z', reps: 6 },
        { lastReview: '2026-11-08T20:00:00.000Z', reps: 5 },
      ),
    ).toBe(false);
  });

  it('a reviewed card beats a never-reviewed one', () => {
    expect(
      serverCardWins(
        { lastReview: null, reps: 0 },
        { lastReview: '2026-11-09T20:00:00.000Z', reps: 1 },
      ),
    ).toBe(true);
    expect(
      serverCardWins(
        { lastReview: '2026-11-09T20:00:00.000Z', reps: 1 },
        { lastReview: null, reps: 0 },
      ),
    ).toBe(false);
  });

  it('equal lastReview falls back to higher reps', () => {
    expect(
      serverCardWins(
        { lastReview: '2026-11-09T20:00:00.000Z', reps: 5 },
        { lastReview: '2026-11-09T20:00:00.000Z', reps: 6 },
      ),
    ).toBe(true);
    expect(
      serverCardWins(
        { lastReview: '2026-11-09T20:00:00.000Z', reps: 6 },
        { lastReview: '2026-11-09T20:00:00.000Z', reps: 5 },
      ),
    ).toBe(false);
  });

  it('identical cards do not flip', () => {
    expect(
      serverCardWins(
        { lastReview: '2026-11-09T20:00:00.000Z', reps: 5 },
        { lastReview: '2026-11-09T20:00:00.000Z', reps: 5 },
      ),
    ).toBe(false);
  });
});

describe('mergeStreaks', () => {
  it('takes the max of each count and the later date', () => {
    expect(
      mergeStreaks(
        { currentStreak: 4, longestStreak: 9, lastStudiedDate: '2026-11-08' },
        { currentStreak: 2, longestStreak: 12, lastStudiedDate: '2026-11-09' },
      ),
    ).toEqual({ currentStreak: 4, longestStreak: 12, lastStudiedDate: '2026-11-09' });
  });

  it('handles a null lastStudiedDate on either side', () => {
    expect(
      mergeStreaks(
        { currentStreak: 0, longestStreak: 0, lastStudiedDate: null },
        { currentStreak: 3, longestStreak: 3, lastStudiedDate: '2026-11-09' },
      ),
    ).toEqual({ currentStreak: 3, longestStreak: 3, lastStudiedDate: '2026-11-09' });
  });
});

describe('mergeDailyLearned', () => {
  it('takes the max count per date and keeps both sides’ dates', () => {
    expect(
      mergeDailyLearned(
        { '2026-11-08': 5, '2026-11-09': 2 },
        { '2026-11-09': 4, '2026-11-10': 1 },
      ),
    ).toEqual({ '2026-11-08': 5, '2026-11-09': 4, '2026-11-10': 1 });
  });
});

describe('sync wiring (source-level)', () => {
  const src = (rel: string) => fs.readFileSync(path.join(__dirname, '..', 'src', rel), 'utf8');

  it('the API client covers every server endpoint', () => {
    const api = src('lib/api.ts');
    for (const fn of [
      'requestCode', 'verifyCode', 'loginPassword', 'setServerPassword',
      'logoutServer', 'syncPull', 'syncPush', 'ServerUnreachable',
    ]) {
      expect(api).toContain(fn);
    }
    expect(api).toContain('/api/auth/verify-code');
    expect(api).toContain('/api/auth/login-password');
    expect(api).toContain('/api/auth/set-password');
    expect(api).toContain('/api/sync/pull');
    expect(api).toContain('/api/sync/push');
  });

  it('the DB exports the snapshot, apply, token, and dirty-flag helpers', () => {
    const db = src('db/index.ts');
    for (const fn of [
      'getSyncSnapshot', 'applySyncSnapshot', 'markSyncDirty', 'isSyncDirty',
      'clearSyncDirty', 'getSessionToken', 'setSessionToken', 'clearSessionToken',
      'getLastSyncedVersion', 'setLastSyncedVersion', 'getLastSyncedAt', 'setLastSyncedAt',
    ]) {
      expect(db).toContain(fn);
    }
  });

  it('the sync document is keyed by grammar point, not by local ids', () => {
    const types = src('lib/sync-types.ts');
    expect(types).toContain('grammarPointId');
    expect(types).not.toContain('rc_${');
    const db = src('db/index.ts');
    // The snapshot drops the local review-card id (it embeds the user id,
    // which differs per device) and recomputes it on apply.
    expect(db).toContain('`rc_${uid()}_${sc.grammarPointId}`');
  });

  it('writes to synced tables mark the local copy dirty', () => {
    const db = src('db/index.ts');
    // Each of the six write paths must call markSyncDirty.
    expect(db.match(/markSyncDirty\(\)/g)?.length).toBeGreaterThanOrEqual(6);
  });

  it('a first sync (never synced) uploads the local copy', () => {
    // Local progress created before sync existed never set the dirty
    // flag, so "never synced" alone must trigger the first push —
    // otherwise that progress would stay local-only forever.
    const sync = src('lib/sync.ts');
    expect(sync).toContain('lastVersion === 0');
  });

  it('login and session end trigger a sync, and logout drops the token', () => {
    const layout = src('app/_layout.tsx');
    expect(layout).toContain('syncNow()');
    expect(layout).toContain('clearSessionToken()');
  });

  it('Settings has a Sync now button and a last-synced status', () => {
    const settings = src('app/settings.tsx');
    expect(settings).toContain('Sync now');
    expect(settings).toContain('Last synced');
    expect(settings).toContain('syncNow');
  });

  it('review and learn sessions back up on completion', () => {
    expect(src('app/(tabs)/review.tsx')).toContain('syncNow()');
    expect(src('app/(tabs)/learn.tsx')).toContain('syncNow()');
  });
});
