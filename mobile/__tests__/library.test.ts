/**
 * Library ordering: Learn, Review, and Cram pull from all library decks
 * in dependency order (deck sortOrder, then curriculum position), and a
 * grammar point in two library decks must appear once.
 */
import { orderLibraryPoints } from '../src/lib/library';

describe('orderLibraryPoints', () => {
  it('orders by deck sortOrder, then position', () => {
    expect(
      orderLibraryPoints([
        { deckSortOrder: 1, position: 1, grammarPointId: 'gp_l2_a' },
        { deckSortOrder: 0, position: 2, grammarPointId: 'gp_l1_b' },
        { deckSortOrder: 0, position: 1, grammarPointId: 'gp_l1_a' },
      ]),
    ).toEqual(['gp_l1_a', 'gp_l1_b', 'gp_l2_a']);
  });

  it('dedupes a point shared by two decks, keeping its earliest position', () => {
    // gp_shared is in Level 1 (position 2) and Level 2 (position 1):
    // it appears once, at its Level 1 position.
    expect(
      orderLibraryPoints([
        { deckSortOrder: 1, position: 1, grammarPointId: 'gp_shared' },
        { deckSortOrder: 0, position: 2, grammarPointId: 'gp_shared' },
        { deckSortOrder: 0, position: 3, grammarPointId: 'gp_l1_c' },
      ]),
    ).toEqual(['gp_shared', 'gp_l1_c']);
  });

  it('returns an empty list for an empty library', () => {
    expect(orderLibraryPoints([])).toEqual([]);
  });
});
