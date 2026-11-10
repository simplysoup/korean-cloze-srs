import type { TopicCheck } from './catalog';
import { checkTopicAnswer } from './catalog';

/**
 * Ephemeral topic/check state. No store imports or IO are allowed here.
 * There is deliberately no route to SRS credit, vocabulary credit, or sync.
 */
export interface TopicAttempt {
  selectedIndex: number;
  attempts: number;
  everCorrect: boolean;
}

export interface TopicSession {
  answers: Record<string, TopicAttempt>;
}

export function startTopicSession(): TopicSession {
  return { answers: {} };
}

export function answerTopicCheck(
  session: TopicSession,
  check: TopicCheck,
  selectedIndex: number,
): TopicSession {
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= check.choices.length) {
    return session;
  }
  const previous = session.answers[check.id];
  if (previous?.everCorrect) return session;
  return {
    answers: {
      ...session.answers,
      [check.id]: {
        selectedIndex,
        attempts: (previous?.attempts ?? 0) + 1,
        everCorrect: checkTopicAnswer(check, selectedIndex),
      },
    },
  };
}

export function topicSessionStats(session: TopicSession, checks: readonly TopicCheck[]) {
  const attempted = checks.filter((check) => session.answers[check.id] !== undefined).length;
  const correct = checks.filter((check) => session.answers[check.id]?.everCorrect === true).length;
  return {
    attempted,
    correct,
    total: checks.length,
    complete: checks.length > 0 && correct === checks.length,
  };
}
