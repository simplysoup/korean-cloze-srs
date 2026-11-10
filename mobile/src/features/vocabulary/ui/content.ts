import foundations from '../../../content/vocabulary-foundations.json';

/** Read-only teaching copy. Scheduling and grading always belong to VocabController. */
export interface FoundationEntry {
  id: string;
  front: string;
  meaning: string;
  spokenForm?: string | null;
  variant?: string | null;
  usageExample?: { korean: string; english: string } | null;
  usageNote?: string | null;
}
interface FoundationDeck {
  deck: { id: string; title: string; goal: string; sortOrder: number };
  entries: FoundationEntry[];
}
const collection = foundations as unknown as { decks: FoundationDeck[] };

export function getFoundationDeck(deckId: string): FoundationDeck | null {
  return collection.decks.find((deck) => deck.deck.id === deckId) ?? null;
}

export function getFoundationEntry(entryId: string): FoundationEntry | null {
  for (const deck of collection.decks) {
    const entry = deck.entries.find((item) => item.id === entryId);
    if (entry) return entry;
  }
  return null;
}

export function foundationDeckCount(): number {
  return collection.decks.length;
}
