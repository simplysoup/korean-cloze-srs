import { allSoundChecks, SOUND_LESSONS, validateSoundLessons } from '../content';
import { AUDIO_MANIFEST, audioForTarget, isApprovedAudio } from '../audio-manifest';
import { answerTopicCheck, startTopicSession, topicSessionStats } from '../../topics/session';

describe('phonology curriculum', () => {
  it('covers six linked decoding and sound-change lessons with written examples', () => {
    expect(SOUND_LESSONS.map((lesson) => lesson.id)).toEqual([
      'blocks', 'batchim', 'liaison', 'nasal', 'aspiration', 'sound-vs-spelling',
    ]);
    expect(validateSoundLessons(SOUND_LESSONS)).toEqual([]);
    for (const lesson of SOUND_LESSONS) {
      expect(lesson.objective).toBeTruthy();
      expect(lesson.explanation.length).toBeGreaterThan(50);
      expect(lesson.examples.length).toBeGreaterThan(0);
      expect(lesson.checks).toHaveLength(2);
      for (const example of lesson.examples) {
        expect(example.writtenSound).toBeTruthy();
        expect(example.observation).toBeTruthy();
      }
    }
  });

  it('all twelve sound-rule checks can be answered, retried and completed', () => {
    const checks = allSoundChecks();
    expect(checks).toHaveLength(12);
    let session = startTopicSession();
    for (const check of checks) {
      const wrong = (check.correctIndex + 1) % check.choices.length;
      session = answerTopicCheck(session, check, wrong);
      expect(session.answers[check.id].everCorrect).toBe(false);
      session = answerTopicCheck(session, check, check.correctIndex);
      expect(session.answers[check.id].attempts).toBe(2);
      expect(session.answers[check.id].everCorrect).toBe(true);
      expect(check.explanation).toBeTruthy();
    }
    expect(topicSessionStats(session, checks)).toEqual({
      attempted: 12, correct: 12, total: 12, complete: true,
    });
  });

  it('uses attested examples for its claimed phenomena', () => {
    const byId = Object.fromEntries(
      SOUND_LESSONS.flatMap((lesson) => lesson.examples.map((example) => [
        example.spelling, example.writtenSound,
      ])),
    );
    expect(byId['꽃']).toBe('[꼳]');
    expect(byId['꽃이']).toBe('[꼬치]');
    expect(byId['책을']).toBe('[채글]');
    expect(byId['국물']).toBe('[궁물]');
    expect(byId['먹는']).toBe('[멍는]');
    expect(byId['좋고']).toBe('[조코]');
    expect(byId['좋다']).toBe('[조타]');
    expect(byId['좋아']).toBe('[조아]');
  });
});

describe('media policy', () => {
  it('has an explicit unavailable manifest record for every example', () => {
    const targets = SOUND_LESSONS.flatMap((lesson) => lesson.examples.map((item) => item.spelling));
    expect(AUDIO_MANIFEST.length).toBe(new Set(targets).size);
    for (const target of targets) {
      const media = audioForTarget(target);
      expect(media.target).toBe(target);
      expect(media.status).toBe('unavailable');
      expect(media.uri).toBeNull();
      expect(media.license).toBeNull();
      expect(media.speakerOrSynthesis).toBeNull();
      expect(media.pronunciationReviewedBy).toBeNull();
      expect(isApprovedAudio(media)).toBe(false);
    }
    expect(audioForTarget('unlisted').status).toBe('unavailable');
  });

  it('requires source, rights, provenance, review and URI before approval', () => {
    expect(isApprovedAudio({
      status: 'approved', target: '꽃이', uri: '/example.wav', source: 'licensed source',
      license: 'granted', speakerOrSynthesis: 'identified speaker',
      pronunciationReviewedBy: 'reviewer', attribution: 'attribution',
    })).toBe(true);
    expect(isApprovedAudio({
      status: 'approved', target: '꽃이', uri: '/example.wav', source: 'licensed source',
      license: '', speakerOrSynthesis: 'identified speaker',
      pronunciationReviewedBy: 'reviewer', attribution: 'attribution',
    })).toBe(false);
  });
});
