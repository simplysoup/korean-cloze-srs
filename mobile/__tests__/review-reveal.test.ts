/**
 * Regression guard for the build-23 hint removal (2026-11-09): the hint
 * system was dropped because every stage either restated the question
 * (Meaning = the grammar point's English meaning) or gave the answer away
 * (Sound = the romanization; the formation rule + the visible word before
 * the blank determines the form for binary points). Until a genuinely
 * useful hint is designed, there is no hint button and no hint stages.
 *
 * The pre-submit escape is a plain, honestly-labelled "Show Answer"
 * button: it reveals the answer, marks the card failed, and submits the
 * card so the Next button appears — so the user is never stuck on a card
 * (the build-22 stuck bug) and never has to submit a wrong guess just to
 * see the answer.
 *
 * This scans review.tsx source (the reveal is UI state, not a pure
 * helper) and fails if a hint creeps back in or the reveal stops
 * submitting the card.
 */
import * as fs from 'fs';
import * as path from 'path';

const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', '(tabs)', 'review.tsx'), 'utf8');

describe('review has no hint system', () => {
  it('no hint stages, hint button, or hint state', () => {
    expect(src).not.toContain('hintStage');
    expect(src).not.toContain('advanceHint');
    expect(src).not.toContain('Hint: meaning');
    expect(src).not.toContain('Hint: sound');
    expect(src).not.toContain('Reveal answer');
    expect(src).not.toContain('hangulToRoman');
  });

  it('the old first-letter / first-half hint is gone', () => {
    expect(src).not.toContain('answer.slice(0, 1)');
    expect(src).not.toContain('Math.ceil(answer.length / 2)');
  });
});

describe('pre-submit Show Answer', () => {
  it('a Show Answer button exists before submitting', () => {
    // The !submitted controls branch must offer Show Answer (not a hint).
    const controls = src.match(/\{\!submitted \? \(([\s\S]*?)\) : allCorrect/);
    expect(controls).not.toBeNull();
    expect(controls![1]).toContain('revealAnswer');
    expect(controls![1]).toContain('Show Answer');
  });

  it('revealing the answer submits the card as failed (no stuck state)', () => {
    const reveal = src.match(/function revealAnswer\(\) \{([\s\S]*?)\n  \}/);
    expect(reveal).not.toBeNull();
    expect(reveal![1]).toContain('setAnswerRevealed(true)');
    expect(reveal![1]).toContain('setAutoFailed(true)');
    expect(reveal![1]).toContain('setSubmitted(true)');
    expect(reveal![1]).toContain('setWrong(');
  });
});
