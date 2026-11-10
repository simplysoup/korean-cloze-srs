import source from '../../content/language-topics.json';

/**
 * The generated language-topics JSON is the sole source of instructional content.
 * Topics are not SRS cards. Keep this adapter independent of stores, DB and sync.
 */
export interface TopicExample {
  korean: string;
  english: string;
  pronunciation?: string;
  comment?: string;
}

export interface TopicSection {
  heading: string;
  explanation: string;
  examples: TopicExample[];
}

export interface TopicCheck {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  skills: string[];
}

export interface TopicModule {
  id: string;
  title: string;
  stage: number;
  kind: string;
  learningGoal: string;
  sourceReferences: string[];
  prerequisiteGrammarIds: string[];
  prerequisiteVocabDeckIds: string[];
  sections: TopicSection[];
  checks: TopicCheck[];
}

interface TopicDataset {
  version: string;
  status: string;
  provenance: string;
  topics: TopicModule[];
}

const dataset = source as unknown as TopicDataset;

export function validateTopicModules(modules: readonly TopicModule[]): string[] {
  const issues: string[] = [];
  const topicIds = new Set<string>();
  const checkIds = new Set<string>();
  for (const module of modules) {
    if (!module.id || topicIds.has(module.id)) issues.push('Missing or duplicate topic ID: ' + module.id);
    topicIds.add(module.id);
    if (!module.title || !module.learningGoal) issues.push('Missing title or learning goal: ' + module.id);
    if (!Array.isArray(module.sections) || module.sections.length === 0) issues.push('Missing sections: ' + module.id);
    for (const section of module.sections ?? []) {
      if (!section.heading || !section.explanation || !Array.isArray(section.examples)) {
        issues.push('Incomplete section in ' + module.id);
      }
    }
    if (!Array.isArray(module.checks) || module.checks.length === 0) issues.push('Missing checks: ' + module.id);
    for (const check of module.checks ?? []) {
      if (!check.id || checkIds.has(check.id)) issues.push('Missing or duplicate check ID: ' + check.id);
      checkIds.add(check.id);
      if (!check.prompt || !check.explanation || check.choices.length < 2 ||
          !Number.isInteger(check.correctIndex) || check.correctIndex < 0 ||
          check.correctIndex >= check.choices.length) {
        issues.push('Invalid check: ' + check.id);
      }
    }
  }
  return issues;
}

const errors = validateTopicModules(dataset.topics);
if (errors.length) throw new Error('Invalid language-topics content: ' + errors.join('; '));

export const TOPIC_CONTENT_STATUS = dataset.status;
export const TOPIC_CONTENT_PROVENANCE = dataset.provenance;
export const TOPIC_VERSION = dataset.version;

export function getTopicModules(): readonly TopicModule[] {
  return dataset.topics;
}

export function getTopicModule(id: string): TopicModule | undefined {
  return dataset.topics.find((topic) => topic.id === id);
}

export function checkTopicAnswer(check: TopicCheck, choiceIndex: number): boolean {
  return Number.isInteger(choiceIndex) && choiceIndex === check.correctIndex;
}

const grammarLabels: Record<string, string> = {
  gp_ayo_eoyo: '-아요/-어요 (polite endings)',
  gp_gap_informal_haeche: '해체 (casual speech)',
  gp_eusi_honorific: '-(으)시- (subject honorific)',
  gp_gap_subject_kkeseo: '께서 (respectful subject)',
  gp_seumnida: '-ㅂ니다/-습니다 (formal-polite)',
  gp_e_time: '에 (time marker)',
  gp_i_ga: '이/가 (subject marker)',
  gp_eul_reul: '을/를 (object marker)',
  gp_gap_passive_suffix: 'Passive verb forms',
  gp_gap_causative_suffix: 'Causative verb forms',
  gp_gap_ge_hada_action: '-게 하다 (causative)',
  gp_gap_deoragoyo: '-더라고요 (direct experience)',
  gp_gap_na_boda: '-나 보다 (inference)',
};

const vocabLabels: Record<string, string> = {
  vocab_foundations_native_numbers: 'Native Korean numbers',
  vocab_foundations_sino_numbers: 'Sino-Korean numbers',
  vocab_foundations_counters: 'Counters',
  vocab_foundations_clock: 'Clock and time expressions',
  vocab_foundations_calendar: 'Calendar and dates',
};

export function prerequisiteLabel(id: string): string {
  return grammarLabels[id] ?? vocabLabels[id] ?? id.replace(/_/g, ' ');
}

export function moduleOverview(module: TopicModule) {
  return {
    id: module.id,
    title: module.title,
    stage: module.stage,
    objective: module.learningGoal,
    sections: module.sections.length,
    authoredChecks: module.checks.length,
    grammarPrerequisites: module.prerequisiteGrammarIds.map(prerequisiteLabel),
    vocabularyPrerequisites: module.prerequisiteVocabDeckIds.map(prerequisiteLabel),
  };
}
