// Pure account-namespace and provenance policy shared by grammar persistence
// and the future vocabulary storage adapter. Never use email as an IDB key.
import type { SyncDocument } from '../../lib/sync-types';

export const LEGACY_DOCUMENT_KEY = 'state-v1';
export const ACCOUNT_DOCUMENT_PREFIX = 'state-v2:';

export interface AccountPersistedSnapshot {
  readonly ownerId: string;
  readonly doc: SyncDocument;
  readonly lastSyncedVersion: number;
  readonly lastSyncedAt: string | null;
  readonly syncDirty: boolean;
}

export interface LegacyPersistedSnapshot {
  readonly doc: SyncDocument;
  readonly lastSyncedVersion: number;
  readonly lastSyncedAt: string | null;
  readonly syncDirty: boolean;
}

/** A syntactically valid server ID is necessary, but NOT proof of ownership.
 * Only recordServerUser(successful server auth) may mark an ID verified. */
export function isValidServerAccountId(id: unknown): id is string {
  return typeof id === 'string' &&
    /^[A-Za-z0-9_-]{1,128}$/.test(id) &&
    id !== 'local' && id !== 'guest';
}

export function accountDocumentKey(id: string): string {
  if (!isValidServerAccountId(id)) throw new Error('invalid verified account id');
  return `${ACCOUNT_DOCUMENT_PREFIX}${id}`;
}

/** A duplicate/random log ID observed on an authenticated server snapshot
 * is stronger evidence than an email, card grammarPointId or lastUserId.
 * The original shared snapshot has no cryptographic owner provenance.
 * Zero shared logs means quarantine, including all-new/offline-only history. */
export function legacyHasPositiveOwnerEvidence(
  legacy: LegacyPersistedSnapshot | null,
  remote: SyncDocument,
  verifiedEmail: string,
): boolean {
  if (!legacy?.doc || !remote || !verifiedEmail) return false;
  const email = verifiedEmail.trim().toLowerCase();
  if (!email || legacy.doc.user?.email?.trim().toLowerCase() !== email) return false;
  if (remote.user?.email?.trim().toLowerCase() !== email) return false;
  if (!Array.isArray(legacy.doc.reviewLogs) || !Array.isArray(remote.reviewLogs)) return false;
  const remoteIds = new Set(remote.reviewLogs.map((entry) => entry.id));
  return legacy.doc.reviewLogs.some((entry) =>
    typeof entry.id === 'string' && entry.id.length > 0 && remoteIds.has(entry.id)
  );
}

export function isAccountSnapshot(value: unknown, expectedOwner: string): value is AccountPersistedSnapshot {
  if (!value || typeof value !== 'object') return false;
  const snapshot = value as Partial<AccountPersistedSnapshot>;
  return snapshot.ownerId === expectedOwner &&
    !!snapshot.doc && Array.isArray(snapshot.doc.reviewCards) &&
    Array.isArray(snapshot.doc.reviewLogs) && Array.isArray(snapshot.doc.libraryDecks) &&
    Number.isSafeInteger(snapshot.lastSyncedVersion) &&
    (snapshot.lastSyncedVersion ?? -1) >= 0 &&
    typeof snapshot.syncDirty === 'boolean';
}

/** JSON clone at capture time: an IDB write cannot follow a later account's
 * mutable in-memory doc (nor borrow the later account's key). */
export function copyAccountSnapshot(snapshot: AccountPersistedSnapshot): AccountPersistedSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as AccountPersistedSnapshot;
}
