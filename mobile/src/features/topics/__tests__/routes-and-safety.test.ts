import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '../../../');
const read = (relative: string) => fs.readFileSync(path.resolve(ROOT, relative), 'utf8');

describe('routing and accessibility integration contracts', () => {
  const topicsLibrary = read('features/topics/ui/TopicLibraryScreen.tsx');
  const topicsModule = read('features/topics/ui/TopicModuleScreen.tsx');
  const checks = read('features/topics/ui/KnowledgeCheck.tsx');
  const pronunciation = read('features/phonology/ui/SoundChangesScreen.tsx');
  const state = read('features/topics/session.ts');

  it('dedicated screens and return routes exist without editing shared navigation', () => {
    expect(read('app/topics/index.tsx')).toContain('TopicLibraryScreen');
    expect(read('app/topics/[id].tsx')).toContain('TopicModuleScreen');
    expect(read('app/hangul/sound-changes.tsx')).toContain('SoundChangesScreen');
    expect(topicsLibrary).toContain("'/hangul/sound-changes'");
    expect(topicsModule).toContain("'/topics'");
    expect(pronunciation).toContain("'/hangul'");
    expect(pronunciation).toContain("'/topics/topic_hangul_sound_changes'");
  });

  it('renders every authored section, example and check with explanation', () => {
    expect(topicsModule).toContain('module.sections.map');
    expect(topicsModule).toContain('section.examples.map');
    expect(topicsModule).toContain('module.checks');
    expect(topicsModule).toContain('checks.map');
    expect(checks).toContain('check.explanation');
    expect(checks).toContain('accessibilityLiveRegion="polite"');
  });

  it('keeps text legible and screens navigable on phone and web', () => {
    expect(topicsLibrary).toContain('commonStyles.scrollContent');
    expect(topicsModule).toContain('commonStyles.scrollContent');
    expect(pronunciation).toContain('commonStyles.scrollContent');
    expect(pronunciation).toContain("flexWrap: 'wrap'");
    expect(topicsModule).toContain("flexWrap: 'wrap'");
    expect(checks).toContain('minHeight: 48');
    expect(topicsModule).toContain('accessibilityRole="header"');
    expect(pronunciation).toContain('accessibilityRole="header"');
    expect(checks).toContain('accessibilityRole="radio"');
    expect(checks).toContain('accessibilityState=');
  });

  it('does not create fake media controls, sync writes or SRS mastery credit', () => {
    expect(pronunciation).toContain('Audio unavailable');
    expect(topicsModule).toContain('No native-speaker audio');
    expect(state).not.toMatch(/(?:import|require).*\/store/);
    expect(state).not.toMatch(/(?:import|require).*\/db/);
    expect(state).not.toMatch(/awardMastery|scheduleReview|syncNow|persist|AsyncStorage/);
    expect(topicsModule).not.toMatch(/awardMastery|scheduleReview|syncNow|persist/);
    expect(pronunciation).not.toMatch(/awardMastery|scheduleReview|syncNow|persist/);
  });
});
