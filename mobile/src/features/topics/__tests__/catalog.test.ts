import {
  getTopicModule,
  getTopicModules,
  moduleOverview,
  prerequisiteLabel,
  TOPIC_CONTENT_STATUS,
  validateTopicModules,
} from '../catalog';
import { REGISTER_DIMENSIONS, REGISTER_PRACTICE, topicPracticeChecks } from '../register-practice';
import { answerTopicCheck, startTopicSession, topicSessionStats } from '../session';

describe('existing language-system authored curriculum', () => {
  const topics = getTopicModules();

  it('loads exactly the four authored modules, fourteen sections and twelve checks', () => {
    expect(topics).toHaveLength(4);
    expect(topics.map((topic) => topic.id)).toEqual([
      'topic_hangul_sound_changes',
      'topic_speech_register',
      'topic_number_application',
      'topic_voice_evidence',
    ]);
    expect(topics.reduce((sum, item) => sum + item.sections.length, 0)).toBe(14);
    expect(topics.reduce((sum, item) => sum + item.checks.length, 0)).toBe(12);
    expect(validateTopicModules(topics)).toEqual([]);
  });

  it('preserves every section, Korean example, objectives, prerequisites and sources', () => {
    for (const topic of topics) {
      const view = moduleOverview(topic);
      expect(getTopicModule(topic.id)).toBe(topic);
      expect(view.objective).toBe(topic.learningGoal);
      expect(view.sections).toBe(topic.sections.length);
      expect(view.authoredChecks).toBe(topic.checks.length);
      expect(view.grammarPrerequisites).toHaveLength(topic.prerequisiteGrammarIds.length);
      expect(view.vocabularyPrerequisites).toHaveLength(topic.prerequisiteVocabDeckIds.length);
      expect(topic.sourceReferences.length).toBeGreaterThan(0);
      for (const section of topic.sections) {
        expect(section.heading).toBeTruthy();
        expect(section.explanation).toBeTruthy();
        expect(section.examples.length).toBeGreaterThan(0);
        for (const example of section.examples) {
          expect(example.korean).toBeTruthy();
          expect(example.english).toBeTruthy();
        }
      }
    }
    expect(getTopicModule('unrecognised')).toBeUndefined();
    expect(TOPIC_CONTENT_STATUS).toMatch(/review/i);
    expect(prerequisiteLabel('gp_ayo_eoyo')).toContain('polite');
  });

  it('all twelve authored checks accept exactly their answer index and have feedback', () => {
    const authoredChecks = topics.flatMap((topic) => topic.checks);
    expect(authoredChecks).toHaveLength(12);
    for (const check of authoredChecks) {
      expect(check.explanation.length).toBeGreaterThan(10);
      for (let index = 0; index < check.choices.length; index++) {
        const session = answerTopicCheck(startTopicSession(), check, index);
        expect(session.answers[check.id].everCorrect).toBe(index === check.correctIndex);
        expect(session.answers[check.id].selectedIndex).toBe(index);
        expect(session.answers[check.id].attempts).toBe(1);
      }
    }
  });

  it('rejects invalid answer indices and malformed/duplicated checks', () => {
    const check = topics[0].checks[0];
    const session = startTopicSession();
    expect(answerTopicCheck(session, check, -1)).toBe(session);
    expect(answerTopicCheck(session, check, 100)).toBe(session);
    expect(answerTopicCheck(session, check, 1.5)).toBe(session);
    expect(validateTopicModules([topics[0], topics[0]]).length).toBeGreaterThan(0);
  });
});

describe('listener register and subject honorification remain independent', () => {
  it('adds applied register tasks without modifying authored content', () => {
    const authored = getTopicModule('topic_speech_register')!;
    expect(authored.checks).toHaveLength(3);
    expect(topicPracticeChecks(authored.id)).toEqual(REGISTER_PRACTICE);
    expect(REGISTER_PRACTICE).toHaveLength(4);
    expect(topicPracticeChecks('topic_number_application')).toEqual([]);
  });

  it('contrasts casual/polite listeners, formal-polite, plain narrative', () => {
    expect(REGISTER_DIMENSIONS).toHaveLength(4);
    expect(REGISTER_DIMENSIONS[0].sentence).toBe('선생님이 오셨어.');
    expect(REGISTER_DIMENSIONS[0].subject).toMatch(/honor/);
    expect(REGISTER_DIMENSIONS[0].listener).toMatch(/Casual/);
    expect(REGISTER_DIMENSIONS[1].listener).toMatch(/polite/);
    expect(REGISTER_DIMENSIONS[2].listener).toMatch(/Formal-polite/);
    expect(REGISTER_DIMENSIONS[3].listener).toMatch(/Plain narrative/);
    for (const check of REGISTER_PRACTICE) {
      expect(check.explanation.length).toBeGreaterThan(20);
      const success = answerTopicCheck(startTopicSession(), check, check.correctIndex);
      expect(topicSessionStats(success, [check]).complete).toBe(true);
    }
  });
});

describe('session-only completion is not grammar SRS mastery', () => {
  const checks = getTopicModule('topic_hangul_sound_changes')!.checks;

  it('tracks incorrect attempts, explanatory retries and correct completion', () => {
    let session = startTopicSession();
    expect(topicSessionStats(session, checks)).toEqual({
      attempted: 0, correct: 0, total: 3, complete: false,
    });
    const first = checks[0];
    const wrong = (first.correctIndex + 1) % first.choices.length;
    session = answerTopicCheck(session, first, wrong);
    expect(session.answers[first.id]).toEqual({
      selectedIndex: wrong, attempts: 1, everCorrect: false,
    });
    expect(topicSessionStats(session, checks).complete).toBe(false);
    session = answerTopicCheck(session, first, first.correctIndex);
    expect(session.answers[first.id]).toEqual({
      selectedIndex: first.correctIndex, attempts: 2, everCorrect: true,
    });
    for (const check of checks.slice(1)) {
      session = answerTopicCheck(session, check, check.correctIndex);
    }
    expect(topicSessionStats(session, checks)).toEqual({
      attempted: 3, correct: 3, total: 3, complete: true,
    });
    expect(answerTopicCheck(session, first, wrong)).toBe(session);
    expect(startTopicSession()).toEqual({ answers: {} });
  });

  it('completion state contains only check indices/attempts, no store or SRS mutation API', () => {
    const answer = answerTopicCheck(startTopicSession(), checks[0], 0);
    expect(Object.keys(answer)).toEqual(['answers']);
    expect(Object.keys(answer.answers[checks[0].id])).toEqual([
      'selectedIndex', 'attempts', 'everCorrect',
    ]);
  });
});
