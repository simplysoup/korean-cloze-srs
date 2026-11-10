// Web store barrel — the DB-compatible surface for screens.
//
// Screens import their data functions from here (not from ../db), so the
// web bundle never loads expo-sqlite. The exported names and signatures
// match src/db/index.ts, so swapping the import source is the only
// change a screen needs. src/db stays untouched for native builds.
//
// State / boot / session / sync-metadata live in ./state, queries in
// ./queries, mutations in ./mutations, account + device trust in ./auth,
// sync in ./sync, shared types in ./types.

export {
  initStore,
  getState,
  currentUid,
  isStoreReady,
  getSessionToken,
  setSessionToken,
  clearSessionToken,
  setSessionToken as setSessionTokenMirror,
  getOrCreateDeviceId,
  getLastUserId,
  setLastUserId,
  getSessionUserId,
  setSessionUserId,
  clearSessionUserId,
  saveUserRecord,
  clearUserRecord,
  persistNow,
  schedulePersist,
  markDirty,
  markSyncDirty,
  isSyncDirty,
  clearSyncDirty,
  getLastSyncedVersion,
  setLastSyncedVersion,
  getLastSyncedAt,
  setLastSyncedAt,
  mergeServerDoc,
  getSyncSnapshot,
  type StoreInit,
  type WebState,
  type ServerUserRecord,
  type DeviceTrust,
} from './state';

export {
  getDueQueue,
  getNextReviewAt,
  getDashboardStats,
  getGrammarList,
  getGrammarDetail,
  getDecks,
  getLibraryDeckIds,
  isDeckInLibrary,
  getLibraryGrammarPointIds,
  getLearnSession,
  getLearnedToday,
  getCramCounts,
  getCramPointIds,
  getCramLessonRows,
  getCramPointIdsForLesson,
  getCramQueue,
  getUserSettings,
  checkQueueItem,
  checkAnswers,
  correctAnswersForCard,
} from './queries';

export {
  completeLearnSession,
  completeLearnSessionWithRetry,
  submitReview,
  markPointKnown,
  updateUserSettings,
  addDeckToLibrary,
  removeDeckFromLibrary,
  applySyncSnapshot,
} from './mutations';

export {
  LOCAL_USER_ID,
  setCurrentUserId,
  getCurrentUserId,
  recordServerUser,
  countUsers,
  getUserByEmail,
  getUserById,
  getSoleUser,
  createUserByEmail,
  userHasPassword,
  setUserPassword,
  migrateLocalDataToUser,
  getDeviceTrust,
  trustDevice,
  markDeviceLogout,
  deviceMayAutoLogin,
  type DbUser,
} from './auth';

export { syncNow, type SyncResult } from './sync';

export {
  DAILY_NEW_LIMIT,
  DEFAULT_USER_SETTINGS,
  type ReviewQueueItem,
  type GrammarListItem,
  type DashboardStats,
  type DeckInfo,
  type UserSettings,
  type LearnSession,
  type CramSetKind,
  type CramCounts,
  type CramLessonRow,
} from './types';
