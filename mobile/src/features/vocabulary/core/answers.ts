import { failure, success, type VocabularyEntry, type VocabularyLibrary, type VocabularyResult } from './content';
import type { VocabularyMode } from './progress';

/** Variants are context-scoped. A shortened counter form is not a standalone synonym. */
export type LexicalContext = 'standalone' | 'before-counter' | 'clock-hour' | 'clock-minute' | 'spoken-month';
export interface LexicalPrompt {
  entryId: string;
  deckId: string;
  mode: VocabularyMode;
  context: LexicalContext;
  question: string;
  acceptedAnswers: string[];
  usageNote: string;
  usageExample: VocabularyEntry['usageExample'];
}
export type LexicalOutcome = 'correct' | 'near' | 'incorrect';
export interface LexicalFeedback {
  outcome: LexicalOutcome;
  correct: boolean;
  submitted: string;
  acceptedAnswers: string[];
  matchedAnswer?: string;
  hint?: string;
  usageNote: string;
  usageExample: VocabularyEntry['usageExample'];
}

export function normalizeLexicalAnswer(answer: string, language: 'ko' | 'en' = 'ko'): string {
  const trimmed = answer.normalize('NFC').trim().replace(/\s+/g, ' ').replace(/[.!?。？！]+$/u, '');
  return language === 'en' ? trimmed.toLocaleLowerCase('en') : trimmed;
}

/** Only split explicit slash-separated English gloss alternatives. */
export function acceptedEnglishGlosses(meaning: string): string[] {
  const tokens = meaning.split(/\s+\/\s+/).flatMap(p => [p.trim(), p.replace(/\s*\([^()]*\)\s*$/, '').trim()]);
  return [...new Set(tokens.filter(Boolean))];
}

const isNative = (entry: VocabularyEntry) => entry.tags.includes('native_numbers');
const isSino = (entry: VocabularyEntry) => entry.tags.includes('sino_numbers');
const isMonth = (entry: VocabularyEntry) => entry.tags.includes('calendar') && /\d+월/u.test(entry.front);

/** Returns a contextual prompt; invalid combinations fail rather than silently teaching the wrong numeral system. */
export function makeLexicalPrompt(entry: VocabularyEntry, mode: VocabularyMode,
  context: LexicalContext = 'standalone'): VocabularyResult<LexicalPrompt> {
  let shownForm = entry.front;
  let expected = entry.front;
  let qualifier = '';
  if (context === 'before-counter' || context === 'clock-hour') {
    if (!isNative(entry)) return failure('INVALID_CONTEXT', 'Native Korean number required before a counter or clock hour.');
    expected = entry.variant || entry.front;
    shownForm = expected;
    qualifier = context === 'clock-hour' ? ' (clock hour; native Korean)' : ' (immediately before a counter; native Korean)';
    if (context === 'clock-hour') { expected += ' 시'; shownForm += ' 시'; }
  } else if (context === 'clock-minute') {
    if (!isSino(entry)) return failure('INVALID_CONTEXT', 'Sino-Korean number required for clock minutes.');
    expected = entry.front + ' 분';
    shownForm = expected;
    qualifier = ' (clock minutes; Sino-Korean)';
  } else if (context === 'spoken-month') {
    if (!isMonth(entry) || !entry.spokenForm) return failure('INVALID_CONTEXT', 'Spoken month reading is unavailable.');
    expected = shownForm = entry.spokenForm;
    qualifier = ' (spoken month name)';
  }
  const question = mode === 'recognition' ? shownForm : `${entry.meaning} — ${entry.deckId.replace(/^vocab_foundations_/, '').replace(/_/g, ' ')}${qualifier}`;
  const acceptedAnswers = mode === 'recognition' ? acceptedEnglishGlosses(entry.meaning) : [expected];
  return success({ entryId: entry.id, deckId: entry.deckId, mode, context, question,
    acceptedAnswers, usageNote: entry.usageNote, usageExample: { ...entry.usageExample } });
}

/** Explicit overrides must come from reviewed contextual metadata, never an unrestricted `entry.variant`. */
export function withAcceptedLexicalVariants(prompt: LexicalPrompt, variants: readonly string[]): LexicalPrompt {
  return { ...prompt, acceptedAnswers: [...new Set([...prompt.acceptedAnswers, ...variants.filter(Boolean)])] };
}

function distanceOne(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, errors = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++errors > 1) return false;
    if (a.length >= b.length) i++;
    if (a.length <= b.length) j++;
  }
  return errors + Number(i < a.length || j < b.length) <= 1;
}

export function checkLexicalResponse(prompt: LexicalPrompt, submitted: string,
  entry?: VocabularyEntry, library?: VocabularyLibrary): LexicalFeedback {
  const language = prompt.mode === 'recognition' ? 'en' : 'ko';
  const answer = normalizeLexicalAnswer(submitted, language);
  const matchedAnswer = prompt.acceptedAnswers.find(a => normalizeLexicalAnswer(a, language) === answer);
  const common = { submitted, acceptedAnswers: [...prompt.acceptedAnswers],
    usageNote: prompt.usageNote, usageExample: { ...prompt.usageExample } };
  if (answer && matchedAnswer) return { ...common, outcome: 'correct', correct: true, matchedAnswer };
  if (prompt.mode === 'production' && entry) {
    const canonical = normalizeLexicalAnswer(entry.front);
    const variant = entry.variant && normalizeLexicalAnswer(entry.variant);
    if (variant && (answer === variant || answer === canonical) && !prompt.acceptedAnswers.some(a => normalizeLexicalAnswer(a) === answer)) {
      return { ...common, outcome: 'near', correct: false, hint: prompt.context === 'standalone'
        ? `Use the standalone form ${entry.front}. ${entry.usageNote || 'The shortened form needs an explicit context.'}`
        : `Use ${prompt.acceptedAnswers[0]} in this context. ${entry.usageNote}`.trim() };
    }
    if (library) {
      for (const other of Object.values(library.entries)) {
        if (other.id === entry.id || normalizeLexicalAnswer(other.front) !== answer) continue;
        const strip = (s: string) => normalizeLexicalAnswer(s.replace(/\s*\([^()]*\)/g, ''), 'en');
        if (strip(other.meaning) === strip(entry.meaning) && other.deckId !== entry.deckId) {
          return { ...common, outcome: 'near', correct: false,
            hint: `You used ${other.deckId.includes('sino_numbers') ? 'Sino-Korean' : 'native Korean'}; this prompt requires the other number system.` };
        }
      }
    }
  }
  if (answer && prompt.acceptedAnswers.some(a => a.length >= 3 && distanceOne(answer, normalizeLexicalAnswer(a, language))))
    return { ...common, outcome: 'near', correct: false, hint: 'Check the spelling and spacing. The form is close, but not an accepted answer.' };
  return { ...common, outcome: 'incorrect', correct: false,
    hint: prompt.mode === 'production' && prompt.context !== 'standalone' ? 'Check the required number system and grammatical context.' : undefined };
}

/** Composition uses source entries rather than duplicating Korean numerals in code. */
export function composeSinoMinute(tens: VocabularyEntry, ones?: VocabularyEntry): VocabularyResult<string> {
  if (!isSino(tens) || (ones && !isSino(ones))) return failure('INVALID_CONTEXT', 'Clock minutes require Sino-Korean number entries.');
  return success(`${tens.front}${ones?.front || ''} 분`);
}
