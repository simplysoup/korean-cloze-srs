import type { ReadingPassage, ReadingQuestion, ReadingResponse } from './types';

export type ReadingResult = {
  passageId: string;
  answered: number;
  total: number;
  correct: number;
  percentage: number;
  complete: boolean;
  missedQuestionIds: string[];
};

/** Unselected questions remain unanswered; never count them as misses yet. */
export function scoreReading(passage: ReadingPassage, responses: ReadingResponse): ReadingResult {
  let correct = 0;
  let answered = 0;
  const missedQuestionIds: string[] = [];
  for (const question of passage.questions) {
    const choice = responses[question.id];
    if (!Number.isInteger(choice) || choice < 0 || choice >= question.choices.length) continue;
    answered += 1;
    if (choice === question.correctIndex) correct += 1;
    else missedQuestionIds.push(question.id);
  }
  const total = passage.questions.length;
  return {
    passageId: passage.id,
    answered,
    total,
    correct,
    percentage: total ? Math.round((100 * correct) / total) : 0,
    complete: total > 0 && answered === total,
    missedQuestionIds,
  };
}

export function isCorrect(question: ReadingQuestion, selected: number): boolean {
  return Number.isInteger(selected) && selected === question.correctIndex;
}

/** Pure responses allow retry/review without touching the grammar SRS store. */
export function chooseAnswer(responses: ReadingResponse, question: ReadingQuestion, index: number): ReadingResponse {
  if (!Number.isInteger(index) || index < 0 || index >= question.choices.length) return responses;
  return { ...responses, [question.id]: index };
}
