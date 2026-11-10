import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readingMetrics } from '../layout';

describe('responsive reading / accessibility guardrails', () => {
  test('safe column widths and readable line heights on phone and desktop', () => {
    expect(readingMetrics(320)).toEqual({ contentWidth: 288, fontSize: 18, lineHeight: 31, touchMinHeight: 48 });
    expect(readingMetrics(1366)).toEqual({ contentWidth: 760, fontSize: 20, lineHeight: 35, touchMinHeight: 48 });
    expect(readingMetrics(0).contentWidth).toBe(0);
  });

  test('source contract preserves selection, labels, and long-text scrolling', () => {
    const ui = readFileSync(join(__dirname, '..', 'ReaderSession.tsx'), 'utf8');
    expect(ui).toContain('<ScrollView');
    expect(ui).toContain('selectable');
    expect(ui).toContain('accessibilityRole="radio"');
    expect(ui).toContain('accessibilityState=');
    expect(ui).toContain('Show vocabulary glosses');
    expect(ui).toContain('Review explanations');
    expect(ui).not.toMatch(/from ['"][^'"]*\/store/);
    expect(ui).not.toMatch(/from ['"][^'"]*\/db/);
  });
});
