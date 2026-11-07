import {
  checkAnswers,
  computeFsrsReview,
  correctAnswersForCard,
  formatNextReview,
  newFsrsState,
  ratingForCheck,
} from '../src/lib/srs';
import { calculateLevel } from '../src/lib/levels';

describe('checkAnswers (port of POST /api/reviews/check)', () => {
  it('accepts the exact answer', () => {
    expect(checkAnswers(['는'], ['는', '은'])).toBe(true);
  });

  it('accepts an alternate answer', () => {
    expect(checkAnswers(['와'], ['하고', '와', '과', '(이)랑'])).toBe(true);
  });

  it('rejects a wrong answer', () => {
    expect(checkAnswers(['가'], ['는', '은'])).toBe(false);
  });

  it('trims whitespace before comparing', () => {
    expect(checkAnswers(['  는  '], ['는'])).toBe(true);
  });

  it('requires every blank to match', () => {
    expect(checkAnswers(['는', '가'], ['는'])).toBe(false);
  });

  it('rejects an empty submission', () => {
    expect(checkAnswers([], ['는'])).toBe(false);
    expect(checkAnswers([''], ['는'])).toBe(false);
  });
});

describe('correctAnswersForCard', () => {
  it('dedupes answer, alternates, and the target word replacement', () => {
    expect(
      correctAnswersForCard({ answer: '하고', alternateAnswers: ['와', '과', '하고'] }, '하고'),
    ).toEqual(['하고', '와', '과']);
  });

  it('works without a word replacement', () => {
    expect(correctAnswersForCard({ answer: '는', alternateAnswers: [] })).toEqual(['는']);
  });
});

describe('ratingForCheck', () => {
  it('maps correct to Good (3) and wrong to Again (1)', () => {
    expect(ratingForCheck(true)).toBe(3);
    expect(ratingForCheck(false)).toBe(1);
  });
});

describe('computeFsrsReview (port of POST /api/reviews)', () => {
  const now = new Date('2026-11-07T12:00:00Z');

  it('advances a new card on Good and schedules it in the future', () => {
    const result = computeFsrsReview(newFsrsState(now), 3, now);
    expect(result.state.reps).toBe(1);
    expect(result.state.due.getTime()).toBeGreaterThan(now.getTime());
    expect(result.state.streakCorrect).toBe(1);
    expect(result.log.rating).toBe(3);
  });

  it('resets the correct streak on Again', () => {
    const prev = { ...newFsrsState(now), streakCorrect: 5 };
    const result = computeFsrsReview(prev, 1, now);
    expect(result.state.streakCorrect).toBe(0);
    expect(result.state.masteredAt).toBeNull();
  });

  it('masters a card after 8 correct reviews in a row', () => {
    const prev = { ...newFsrsState(now), streakCorrect: 7 };
    const result = computeFsrsReview(prev, 3, now);
    expect(result.state.streakCorrect).toBe(8);
    expect(result.state.masteredAt).toEqual(now);
  });

  it('does not master before 8 in a row', () => {
    const prev = { ...newFsrsState(now), streakCorrect: 6 };
    const result = computeFsrsReview(prev, 3, now);
    expect(result.state.masteredAt).toBeNull();
  });

  it('tracks peak stability', () => {
    const result = computeFsrsReview(newFsrsState(now), 3, now);
    expect(result.state.peakStability).toBeGreaterThan(0);
    expect(result.state.peakStability).toBe(result.state.stability);
  });

  it('records elapsed days from the previous review', () => {
    const prev = {
      ...newFsrsState(new Date('2026-11-05T12:00:00Z')),
      lastReview: new Date('2026-11-05T12:00:00Z'),
    };
    const result = computeFsrsReview(prev, 3, now);
    expect(result.log.elapsedDays).toBeCloseTo(2, 6);
  });
});

describe('calculateLevel (port of src/lib/levels.ts)', () => {
  it('starts at level 1 with 0 XP', () => {
    expect(calculateLevel(0)).toMatchObject({ level: 1, totalXP: 0 });
  });

  it('needs 100 XP (10 reviews) for level 2', () => {
    expect(calculateLevel(10)).toMatchObject({ level: 2, totalXP: 100 });
    expect(calculateLevel(9)).toMatchObject({ level: 1, totalXP: 90 });
  });

  it('needs a further 200 XP for level 3', () => {
    expect(calculateLevel(30)).toMatchObject({ level: 3, totalXP: 300 });
  });
});

describe('formatNextReview', () => {
  it('formats minutes, hours, and days', () => {
    const now = new Date('2026-11-07T12:00:00Z');
    expect(formatNextReview(new Date('2026-11-07T12:05:00Z'), now)).toBe('5 minutes');
    expect(formatNextReview(new Date('2026-11-07T14:00:00Z'), now)).toBe('2 hours');
    expect(formatNextReview(new Date('2026-11-09T12:00:00Z'), now)).toBe('2 days');
    expect(formatNextReview(null, now)).toBe('');
  });
});
