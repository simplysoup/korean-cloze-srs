/**
 * Library ordering — pure (no DB access), so it is unit-tested directly.
 *
 * Learn, Review, and Cram pull from all decks in the user's library in
 * dependency order: deck sortOrder first (TOPIK Level 1 before Level 2,
 * and so on), then the grammar point's curriculum position within its
 * deck. Decks with overlapping cards must not duplicate: a grammar
 * point in two library decks appears once, at its earliest position in
 * dependency order.
 */
export interface LibraryPointEntry {
  deckSortOrder: number;
  position: number;
  grammarPointId: string;
}

/** Dedupe by grammar point id and order by (deck sortOrder, position). */
export function orderLibraryPoints(entries: LibraryPointEntry[]): string[] {
  const sorted = [...entries].sort(
    (a, b) => a.deckSortOrder - b.deckSortOrder || a.position - b.position,
  );
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const entry of sorted) {
    if (seen.has(entry.grammarPointId)) continue;
    seen.add(entry.grammarPointId);
    ordered.push(entry.grammarPointId);
  }
  return ordered;
}
