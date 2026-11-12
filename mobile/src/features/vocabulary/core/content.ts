/** Independent vocabulary content model. No grammar review or database dependency. */
import foundations from '../../../content/vocabulary-foundations.json';

export interface VocabularyEntry {
  id: string;
  deckId: string;
  front: string;
  meaning: string;
  spokenForm: string | null;
  variant: string | null;
  usageExample: { korean: string; english: string };
  usageNote: string;
  reviewType: 'lexical';
  tags: string[];
}
export interface VocabularyDeck {
  id: string;
  type: 'vocabulary';
  title: string;
  sortOrder: number;
  goal: string;
  entryIds: string[];
}
export interface VocabularyLibrary {
  version: string;
  provenance: string;
  decks: VocabularyDeck[];
  entries: Record<string, VocabularyEntry>;
}
export interface VocabularyError {
  code: 'INVALID_COLLECTION' | 'INVALID_DECK' | 'INVALID_ENTRY' | 'DUPLICATE_ID' | 'UNKNOWN_ENTRY' | 'UNKNOWN_DECK' | 'INVALID_CONTEXT' | 'SESSION_COMPLETE' | 'INVALID_RATING' | 'NOTHING_TO_UNDO';
  message: string;
  path?: string;
}
export type VocabularyResult<T> = { ok: true; value: T } | { ok: false; errors: VocabularyError[] };
export const success = <T>(value: T): VocabularyResult<T> => ({ ok: true, value });
export const failure = <T>(code: VocabularyError['code'], message: string, path?: string): VocabularyResult<T> => ({ ok: false, errors: [{ code, message, path }] });

const obj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const nonempty = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const optional = (v: unknown): v is string | null => v === null || typeof v === 'string';

/** Validates all entries atomically; never silently discards invalid or duplicate IDs. */
export function loadVocabulary(raw: unknown): VocabularyResult<VocabularyLibrary> {
  if (!obj(raw) || !Array.isArray(raw.decks) || !nonempty(raw.version) || raw.type !== 'vocabulary-collection')
    return failure('INVALID_COLLECTION', 'Expected a versioned vocabulary-collection with decks.');
  const errors: VocabularyError[] = [];
  const entries: Record<string, VocabularyEntry> = Object.create(null);
  const decks: VocabularyDeck[] = [];
  const deckIds = new Set<string>();
  for (let i = 0; i < raw.decks.length; i++) {
    const source = raw.decks[i];
    const path = `decks[${i}]`;
    if (!obj(source) || !obj(source.deck) || !Array.isArray(source.entries)) {
      errors.push({ code: 'INVALID_DECK', message: 'Expected deck metadata and entries array.', path });
      continue;
    }
    const d = source.deck;
    if (!nonempty(d.id) || d.type !== 'vocabulary' || !nonempty(d.title) || typeof d.sortOrder !== 'number' || !Number.isSafeInteger(d.sortOrder) || typeof d.goal !== 'string') {
      errors.push({ code: 'INVALID_DECK', message: 'Invalid vocabulary deck metadata.', path });
      continue;
    }
    if (deckIds.has(d.id)) {
      errors.push({ code: 'DUPLICATE_ID', message: `Repeated deck ID ${d.id}`, path });
      continue;
    }
    deckIds.add(d.id);
    const entryIds: string[] = [];
    for (let j = 0; j < source.entries.length; j++) {
      const value = source.entries[j];
      const entryPath = `${path}.entries[${j}]`;
      if (!obj(value) || !nonempty(value.id) || !nonempty(value.front) || !nonempty(value.meaning) ||
        !optional(value.spokenForm) || !optional(value.variant) || !obj(value.usageExample) ||
        !nonempty(value.usageExample.korean) || !nonempty(value.usageExample.english) ||
        typeof value.usageNote !== 'string' || value.reviewType !== 'lexical' ||
        !Array.isArray(value.tags) || !value.tags.every(nonempty)) {
        errors.push({ code: 'INVALID_ENTRY', message: 'Invalid lexical entry or feedback metadata.', path: entryPath });
        continue;
      }
      if (Object.hasOwn(entries, value.id)) {
        errors.push({ code: 'DUPLICATE_ID', message: `Repeated entry ID ${value.id} across decks.`, path: entryPath });
        continue;
      }
      entries[value.id] = {
        id: value.id, deckId: d.id, front: value.front, meaning: value.meaning,
        spokenForm: value.spokenForm, variant: value.variant,
        usageExample: { korean: value.usageExample.korean, english: value.usageExample.english },
        usageNote: value.usageNote, reviewType: 'lexical', tags: [...value.tags],
      };
      entryIds.push(value.id);
    }
    decks.push({ id: d.id, type: 'vocabulary', title: d.title, sortOrder: d.sortOrder, goal: d.goal, entryIds });
  }
  if (errors.length) return { ok: false, errors };
  return success({ version: raw.version, provenance: typeof raw.provenance === 'string' ? raw.provenance : '',
    decks: decks.sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)), entries });
}

/** Bundled source is generated from prisma/seed-data/vocabulary/foundations.json. */
export function loadFoundationalVocabulary(): VocabularyResult<VocabularyLibrary> {
  return loadVocabulary(foundations);
}

export function getVocabularyEntry(library: VocabularyLibrary, entryId: string): VocabularyResult<VocabularyEntry> {
  const entry = Object.hasOwn(library.entries, entryId) ? library.entries[entryId] : undefined;
  return entry ? success(entry) : failure('UNKNOWN_ENTRY', `Unknown vocabulary entry: ${entryId}`);
}
