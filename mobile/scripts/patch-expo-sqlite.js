// Patch expo-sqlite's web sync bridge for Firefox.
//
// Problem: on web, expo-sqlite's synchronous API (openDatabaseSync,
// execSync, getFirstSync, ...) busy-spins the main thread on a
// SharedArrayBuffer lock while the SQLite worker answers. The spin loop
// uses Atomics.pause() when the engine has it. Firefox miscompiles that
// pattern (bug 1752287, closed WONTFIX): the JIT stops re-reading the
// SharedArrayBuffer inside a pause spin loop, so the worker's response
// is never seen and EVERY sync call throws 'Sync operation timeout'.
// Chrome is unaffected, which is why the app worked in Chrome and
// failed identically on both origins in Firefox for Android.
//
// Fix: force the plain Atomics.load busy loop (no Atomics.pause()).
// The plain loop re-reads the lock correctly in every engine, and its
// 1e9-iteration budget is wall-clock generous for a warmed-up worker.
// This only affects the web sync bridge; native is untouched.
//
// This is a string replacement on node_modules, run from package.json
// `postinstall`, so it survives `npm install` / `npm ci` (including on
// the VPS deploy). It is idempotent and fails loudly if the upstream
// text changes, so a future expo-sqlite update cannot silently drop it.
// If upstream fixes the Firefox behaviour, delete this script and the
// postinstall hook.
const fs = require('node:fs');
const path = require('node:path');

const target = path.join(__dirname, '..', 'node_modules', 'expo-sqlite', 'web', 'WorkerChannel.ts');
const marker = '// PATCHED-FOR-FIREFOX: no Atomics.pause() in the sync spin loop';

const original =
  "  // @ts-expect-error: Remove this when TypeScript supports Atomics.pause\n" +
  "  const useAtomicsPause = typeof Atomics.pause === 'function';";

const patched =
  '  // PATCHED-FOR-FIREFOX: no Atomics.pause() in the sync spin loop.\n' +
  '  // Firefox miscompiles Atomics.pause() in a spin loop (bug 1752287,\n' +
  '  // WONTFIX): the JIT stops re-reading the SharedArrayBuffer, so the\n' +
  '  // worker response is never seen and every sync call throws\n' +
  "  // 'Sync operation timeout'. A plain Atomics.load loop re-reads\n" +
  '  // correctly in every engine. See scripts/patch-expo-sqlite.js.\n' +
  '  const useAtomicsPause = false;';

let src;
try {
  src = fs.readFileSync(target, 'utf8');
} catch (e) {
  console.error(`[patch-expo-sqlite] cannot read ${target}: ${e.message}`);
  process.exit(1);
}

if (src.includes(marker)) {
  console.log('[patch-expo-sqlite] already patched, skipping.');
  process.exit(0);
}

if (!src.includes(original)) {
  console.error(
    '[patch-expo-sqlite] upstream text not found in WorkerChannel.ts — ' +
      'expo-sqlite may have changed; update scripts/patch-expo-sqlite.js.'
  );
  process.exit(1);
}

fs.writeFileSync(target, src.replace(original, patched));
console.log('[patch-expo-sqlite] patched WorkerChannel.ts (Firefox: no Atomics.pause()).');
