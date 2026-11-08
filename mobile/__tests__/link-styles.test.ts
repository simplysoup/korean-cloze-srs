/**
 * Regression guard for the build-3 / build-12 whitescreen: on web,
 * expo-router's Slot rejects an array style on a Pressable inside
 * `<Link asChild>` ("Failed to set an indexed property [0] on
 * 'CSSStyleDeclaration'"), which unmounts the whole root and leaves a
 * blank white page. Every `Link asChild` child Pressable must therefore
 * carry a single flattened style (StyleSheet.flatten) or a single style
 * object — never `style={[...]}`.
 *
 * This scans the source (heuristic: the child Pressable sits within a
 * few lines after the `<Link ... asChild>` line) and fails if any such
 * Pressable has an array style.
 */
import * as fs from 'fs';
import * as path from 'path';

function tsxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...tsxFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

describe('Link asChild children never use array styles', () => {
  it('no Pressable inside <Link asChild> has style={[...]}', () => {
    const srcDir = path.join(__dirname, '..', 'src');
    const offenders: string[] = [];
    for (const file of tsxFiles(srcDir)) {
      const lines = fs.readFileSync(file, 'utf8').split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (!lines[i].includes('<Link') || !lines[i].includes('asChild')) continue;
        // The child Pressable is on one of the next few lines.
        for (let j = i + 1; j <= Math.min(i + 4, lines.length - 1); j++) {
          const line = lines[j];
          if (!line.includes('<Pressable')) continue;
          if (/style=\{\[/.test(line)) {
            offenders.push(`${path.relative(srcDir, file)}:${j + 1}`);
          }
          break;
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
