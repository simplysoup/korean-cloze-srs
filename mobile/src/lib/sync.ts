// Sync protocol: pull the server document, merge it into the in-memory
// web store, push the local document when dirty. Best-effort — a failed
// fetch (offline, server down) is silent; the app keeps working from
// memory + IndexedDB and syncs later. See docs/planning/sync-server-accounts.md.
//
// The implementation lives in src/store/sync.ts (it works on the web
// store state, not the SQLite DB). This module re-exports it so existing
// importers (`../lib/sync`) keep working unchanged.

export { syncNow, syncPushNow, type SyncResult } from '../store/sync';
