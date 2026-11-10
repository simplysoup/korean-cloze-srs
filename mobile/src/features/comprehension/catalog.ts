import data from '../../content/comprehension-pilot.json';
import type { ReadingCatalog, ReadingPassage } from './types';

/** Static, explicitly versioned content. No account state or server requests. */
export const readingCatalog = data as unknown as ReadingCatalog;

export function allPassages(): ReadingPassage[] {
  return readingCatalog.passages;
}

export function passageById(id: string | undefined): ReadingPassage | undefined {
  return readingCatalog.passages.find((passage) => passage.id === id);
}
