import type { TopicCheck } from './catalog';

/**
 * Supplemental interpretation drills, not grammar SRS cards. The underlying
 * authored topic stays in language-topics.json without duplication or edits.
 *
 * Subject honorification and hearer politeness are separate; plain narrative
 * is NOT synonymous with casual conversation.
 */
export const REGISTER_DIMENSIONS = [
  {
    sentence: '선생님이 오셨어.',
    subject: 'Teacher is honored by -시-.',
    listener: 'Casual speech to the listener (-어).',
  },
  {
    sentence: '선생님이 오셨어요.',
    subject: 'Teacher is honored by -시-.',
    listener: 'Everyday polite speech to the listener (-요).',
  },
  {
    sentence: '민수가 옵니다.',
    subject: 'No subject-honorific marker for Minsu.',
    listener: 'Formal-polite statement (-ㅂ니다).',
  },
  {
    sentence: '민수가 온다.',
    subject: 'No subject-honorific marker for Minsu.',
    listener: 'Plain narrative style (-ㄴ다); not the polite -ㅂ니다 style.',
  },
] as const;

export const REGISTER_PRACTICE: readonly TopicCheck[] = [
  {
    id: 'register_application_01',
    prompt: 'In 선생님이 오셨어, which dimensions are present?',
    choices: [
      'The teacher is honored; the listener is addressed casually.',
      'The teacher is not honored; the listener is addressed politely.',
      'Both the teacher and listener are necessarily honored.',
      'The sentence is a formal-polite announcement.',
    ],
    correctIndex: 0,
    explanation: '-시- in 오셨어 honors the teacher, whereas the final -어 is casual toward the hearer. Subject respect does not force a polite ending.',
    skills: ['pragmatics'],
  },
  {
    id: 'register_application_02',
    prompt: 'What changes from 선생님이 오셨어 to 선생님이 오셨어요?',
    choices: [
      'The teacher loses honorification.',
      'Only the listener-facing politeness increases.',
      'The sentence becomes passive.',
      'The speaker switches from present to past tense.',
    ],
    correctIndex: 1,
    explanation: 'Both sentences honor the teacher with -시-. Adding -요 marks the listener-facing polite style. The past tense is the same in both.',
    skills: ['pragmatics'],
  },
  {
    id: 'register_application_03',
    prompt: 'Does 민수가 옵니다 necessarily honor Minsu?',
    choices: [
      'Yes, all formal-polite endings honor the subject.',
      'No. -ㅂ니다 is formal-polite toward the listener; there is no -시-.',
      'Yes, because Minsu is named.',
      'No, because the sentence is casual.',
    ],
    correctIndex: 1,
    explanation: '-ㅂ니다 expresses the formal-polite style, not subject honorification. Subject respect would be marked separately where appropriate.',
    skills: ['pragmatics'],
  },
  {
    id: 'register_application_04',
    prompt: 'Which describes 민수가 온다 best?',
    choices: [
      'Everyday polite speech to a stranger',
      'Formal-polite public announcement style',
      'Plain narrative style; not interchangeable with casual 해체',
      'Subject-honorific casual speech',
    ],
    correctIndex: 2,
    explanation: '-ㄴ다/는다 is commonly the plain narrative style, for example in writing and descriptions. It is not the same ending as casual conversation -아/-어.',
    skills: ['pragmatics'],
  },
];

export function topicPracticeChecks(moduleId: string): readonly TopicCheck[] {
  return moduleId === 'topic_speech_register' ? REGISTER_PRACTICE : [];
}
