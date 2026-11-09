/**
 * Regression guard for the build-22 review-hint rework (2026-11-09):
 * the old hint just gave the first letter / first half of the answer, the
 * button never said what the next tap would reveal, and reaching the final
 * hint stage left the card un-submitted with the input hidden and only a
 * dead Hint button — the user was stuck on the card with no way forward
 * except End Session. The new hint is a 3-stage progressive disclosure
 * adapted for Korean learners (Meaning -> Sound -> Answer), the button
 * labels what the next tap reveals, and the full reveal submits the card
 * (marked wrong) so the Next button appears.
 *
 * This scans review.tsx source (the hint is UI state, not a pure helper)
 * and fails if any of those invariants regress.
 */
import * as fs from 'fs';
import * as path from 'path';

const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', '(tabs)', 'review.tsx'), 'utf8');

describe('review hint stages', () => {
  it('the full reveal submits the card (no stuck state)', () => {
    // advanceHint's stage-3 block must move the card to the submitted
    // state and count it wrong, so the Next button appears.
    const stage3 = src.match(/if \(nextStage === 3\) \{([\s\S]*?)\n  \}/);
    expect(stage3).not.toBeNull();
    expect(stage3![1]).toContain('setSubmitted(true)');
    expect(stage3![1]).toContain('setWrong(');
    expect(stage3![1]).toContain('setAnswerRevealed(true)');
    expect(stage3![1]).toContain('setAutoFailed(true)');
  });

  it('the old first-letter / first-half hint is gone', () => {
    expect(src).not.toContain('answer.slice(0, 1)');
    expect(src).not.toContain('Math.ceil(answer.length / 2)');
  });

  it('the hint stages are Meaning, Sound (romanization), Answer', () => {
    expect(src).toContain('hangulToRoman(hintAnswer)');
    expect(src).toContain('currentCard.grammar.hint');
    expect(src).toContain('Meaning:');
    expect(src).toContain('Sound:');
  });

  it('the button labels what the next tap reveals', () => {
    expect(src).toContain("'Hint: meaning'");
    expect(src).toContain("'Hint: sound'");
    expect(src).toContain("'Reveal answer'");
  });

  it('the reveal consequence is stated before the user commits to it', () => {
    expect(src).toContain('Revealing the answer marks this card incorrect.');
  });
});
