/**
 * Validate original, separately owned vocabulary content. Does not count
 * vocabulary mastery as grammar mastery and requires no new SQLite tables.
 * Run: node scripts/validate-vocabulary.mjs
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = JSON.parse(readFileSync(join(root, 'prisma/seed-data/vocabulary/foundations.json'), 'utf8'));
const generated = JSON.parse(readFileSync(join(root, 'mobile/src/content/vocabulary-foundations.json'), 'utf8'));
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
check(src.type === 'vocabulary-collection', 'Vocabulary collection type missing');
check(JSON.stringify(src) === JSON.stringify(generated), 'Generated vocabulary differs from original source; run node scripts/port-vocabulary.mjs');
check(src.decks?.length === 7, 'Expected seven early foundation decks');
const counts = [28,18,21,27,16,16,19];
const seenIds = new Set(), seenDecks = new Set();
for (const [i, deck] of (src.decks ?? []).entries()) {
  check(deck.deck?.type === 'vocabulary', 'Vocabulary deck must have explicit independent type');
  check(!seenDecks.has(deck.deck?.id), `Duplicate deck ID ${deck.deck?.id}`);
  seenDecks.add(deck.deck?.id);
  check(deck.deck?.sortOrder === i, `Wrong deck sort order for ${deck.deck?.id}`);
  check(deck.entries?.length === counts[i], `Wrong count for ${deck.deck?.id}`);
  for (const row of (deck.entries ?? [])) {
    check(!seenIds.has(row.id), `Duplicate vocabulary ID ${row.id}`);
    seenIds.add(row.id);
    check(row.reviewType === 'lexical', `${row.id} must not be a grammar review card`);
    check(!('grammarPointId' in row) && !('introducedAtPosition' in row),
      `${row.id} incorrectly counts as a grammar card`);
    check(typeof row.front === 'string' && row.front.trim().length > 0, `${row.id}: missing Korean text`);
    check(typeof row.meaning === 'string' && row.meaning.trim().length > 0, `${row.id}: missing gloss`);
    check(typeof row.usageExample?.korean === 'string' && row.usageExample.korean.trim().length > 0,
      `${row.id}: missing original Korean phrase`);
    check(typeof row.usageExample?.english === 'string' && row.usageExample.english.trim().length > 0,
      `${row.id}: missing original English gloss`);
  }
}
check(seenIds.size === 145, `Expected 145 vocabulary entries, found ${seenIds.size}`);
const calendar = src.decks.find(d => d.deck.id === 'vocab_foundations_calendar');
check(calendar?.entries.some(e => e.front === '6월' && e.spokenForm === '유월'), '6월 must be read 유월');
check(calendar?.entries.some(e => e.front === '10월' && e.spokenForm === '시월'), '10월 must be read 시월');
const native = src.decks.find(d => d.deck.id === 'vocab_foundations_native_numbers');
check(native?.entries.some(e => e.front === '스물' && e.variant === '스무'), 'Native twenty counter form must be 스무');
if (errors.length) {
  console.error(`FAIL: ${errors.length} vocabulary validation errors`);
  for (const problem of errors) console.error(' - ' + problem);
  process.exitCode = 1;
} else {
  console.log(`OK: ${src.decks.length} independent vocabulary decks, ${seenIds.size} entries; no grammar ID mixing`);
}
