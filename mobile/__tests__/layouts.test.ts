/**
 * Regression guard for the build-24 layout rework (2026-11-09), modelled
 * on Bunpro's Decks page and Grammar Library (see
 * docs/planning/bunpro-decks-grammar-2026-11-09.md):
 *
 * Decks: a grid of cards, not a list. Each card has a typographic
 * "cover" with a thin red progress line along its bottom edge (width
 * proportional to learned/total, no printed percentage) and a bottom
 * panel with three stats in a row separated by vertical dividers.
 *
 * Grammar Library: each level is ONE containing white card; the level
 * header is a light-grey strip at the top of its card; lessons live
 * inside the same card (the shared container + header strip + divider
 * rules make the sub-elements feel connected to their headers, not
 * separate elements). Each lesson header has a divider above it (except
 * the first in the level), a bold "Lesson N", and the subtitle in
 * regular muted grey on the same line, so the lesson number is clearly
 * distinguished from the pale-grey point cards beneath it.
 *
 * This scans the source and fails if any of those devices regress.
 */
import * as fs from 'fs';
import * as path from 'path';

const decks = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'decks.tsx'), 'utf8');
const grammar = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'app', '(tabs)', 'grammar.tsx'),
  'utf8',
);

describe('Decks is a grid, not a list', () => {
  it('the deck grid wraps with a gap', () => {
    expect(decks).toContain('flexWrap:');
    expect(decks).toContain("'wrap'");
  });

  it('each card gets an exact computed width (no stretching on an incomplete row)', () => {
    // A flex-grow grid lets the last card in an incomplete row stretch
    // to full width (7 decks in a 3-column grid). Exact widths keep
    // every card the same size.
    expect(decks).toContain('useWindowDimensions');
    expect(decks).toContain('cardWidth');
    expect(decks).not.toContain('flexGrow: 1');
    expect(decks).not.toContain('flexBasis: 300');
  });

  it('each card has a cover with a red progress line (no printed percentage)', () => {
    expect(decks).toContain('progressLine');
    expect(decks).toContain('learnedPoints / deck.totalPoints');
    expect(decks).toContain('backgroundColor: colors.primary');
    expect(decks).not.toContain('learnedPoints}%');
    expect(decks).not.toContain('Math.round');
  });

  it('the stats row has three stats separated by vertical dividers', () => {
    expect(decks).toContain('statDivider');
    expect(decks).toContain('Points');
    expect(decks).toContain('Learned');
    expect(decks).toContain('Due');
  });

  it('the grid container is wider than the 640px content column', () => {
    expect(decks).toContain('maxWidth: 1080');
  });
});

describe('Grammar Library levels are containing cards', () => {
  it('each level is one white card with a rounded border', () => {
    expect(grammar).toContain('borderRadius: 12');
    expect(grammar).toContain("borderColor: '#E4E4E4'");
    expect(grammar).toContain("overflow: 'hidden'");
  });

  it('the level header is a light-grey strip with a divider when open', () => {
    expect(grammar).toContain("backgroundColor: '#F5F5F5'");
    expect(grammar).toContain('levelRowOpen');
    expect(grammar).toContain('borderBottomWidth: 1');
  });

  it('lesson headers have a divider above (except the first in the level)', () => {
    expect(grammar).toContain('lessonHeaderDivider');
    expect(grammar).toContain('groupIndex > 0');
    expect(grammar).toContain('borderTopWidth: 1');
  });

  it('the lesson number is bold and the subtitle is regular muted grey', () => {
    expect(grammar).toContain('lessonSubtitle');
    expect(grammar).toContain("fontWeight: '400'");
    expect(grammar).toContain('Lesson {group.lessonNumber}');
    // The subtitle wraps instead of truncating on narrow screens.
    expect(grammar).not.toContain('numberOfLines={1}');
  });

  it('point cards are flat pale grey with no border', () => {
    expect(grammar).toContain("backgroundColor: '#F2F2F2'");
    expect(grammar).toContain('borderRadius: 8');
    // The pointCard style must not carry a border.
    const pointCard = grammar.match(/pointCard: \{([\s\S]*?)\n  \},/);
    expect(pointCard).not.toBeNull();
    expect(pointCard![1]).not.toContain('borderWidth');
  });
});
