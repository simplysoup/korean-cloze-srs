import type {
  PracticeExercise,
  PracticeFeedback,
  PracticeResponse,
  ReadingPassage as ContractReadingPassage,
} from '../contracts/practice';
import type { ReadingPassage, ReadingQuestion } from './types';

/**
 * Agent 00's frozen practice contract is an integration boundary only.
 * Editorial drafts are never relabelled educator-approved, and no reading
 * score is permitted to grant target grammar mastery.
 */
export function toPracticeReadingPassage(passage: ReadingPassage): ContractReadingPassage {
  return {
    id: passage.id,
    title: passage.titleKo,
    koreanText: passage.paragraphs.join('\n\n'),
    prerequisiteGrammarIds: passage.prerequisiteGrammarIds,
    contentReadiness: 'draft',
    questionIds: passage.questions.map((question) => question.id),
    // No English translation by default and no fabricated vocab mastery.
  };
}

function optionId(question: ReadingQuestion, index: number): string {
  return question.id + ':option:' + index;
}

export function toPracticeExercise(passage: ReadingPassage, question: ReadingQuestion): PracticeExercise {
  return {
    id: question.id,
    kind: 'reading_comprehension',
    prerequisiteGrammarIds: passage.prerequisiteGrammarIds,
    contentReadiness: 'draft',
    prompt: question.prompt,
    responseType: 'single_choice',
    options: question.choices.map((label, index) => ({ id: optionId(question, index), label })),
    canonicalAnswer: optionId(question, question.correctIndex),
    acceptedAlternatives: [],
    explanation: { type: 'passage', text: question.explanation, evidenceExcerpt: question.evidence },
  };
}

export function toPracticeFeedback(question: ReadingQuestion, selected: number): PracticeFeedback {
  const valid = Number.isInteger(selected) && selected >= 0 && selected < question.choices.length;
  const response: PracticeResponse = {
    exerciseId: question.id,
    responseType: 'single_choice',
    value: valid ? optionId(question, selected) : '',
  };
  return {
    exerciseId: question.id,
    response,
    explanation: { type: 'passage', text: question.explanation, evidenceExcerpt: question.evidence },
    awardsGrammarMastery: false,
    status: !valid ? 'unclassified' : selected === question.correctIndex ? 'correct' : 'incorrect',
  };
}
