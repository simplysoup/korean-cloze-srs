import type { TopicCheck } from '../topics/catalog';

export interface PhonologyExample {
  spelling: string;
  meaning: string;
  writtenSound: string;
  observation: string;
}

export interface SoundLesson {
  id: string;
  title: string;
  objective: string;
  explanation: string;
  examples: PhonologyExample[];
  checks: TopicCheck[];
}

/**
 * Written phonological forms below are instructional transcriptions, NOT
 * recordings. Examples draw on the Standard Korean Pronunciation rules
 * and the cited language topic, pending instructor/native audio validation.
 *
 * Minimal pair 달 / 탈 contrasts a plain versus aspirated initial; the app
 * does not claim this is an auditory identification task without media.
 */
export const SOUND_LESSONS: readonly SoundLesson[] = [
  {
    id: 'blocks',
    title: 'Build and decode a syllable block',
    objective: 'Identify initial consonant, medial vowel and optional final consonant (받침).',
    explanation: 'A complete Hangul syllable occupies one square block. For example, 강 is ㄱ + ㅏ + ㅇ. At the start of a block, ㅇ carries no consonant sound; as a final consonant it represents the ng sound. Read by block position, not by a single romanization label.',
    examples: [
      { spelling: '가', meaning: 'go (verb stem example)', writtenSound: '가', observation: 'ㄱ initial + ㅏ medial; no final.' },
      { spelling: '강', meaning: 'river', writtenSound: '강', observation: 'ㄱ initial + ㅏ medial + ㅇ final (받침).' },
      { spelling: '아', meaning: 'ah (exclamation)', writtenSound: '아', observation: 'The initial ㅇ is silent; ㅏ is the vowel.' },
    ],
    checks: [
      { id: 'ph_block_01', prompt: 'How is the written block 강 divided?', choices: ['ㄱ + ㅏ + ㅇ (final)', 'ㄱ + ㅗ + ㅇ', 'ㅋ + ㅏ + ㄴ', 'ㄱ + ㅏ with no final'], correctIndex: 0, explanation: '강 has an initial ㄱ, a medial ㅏ and a final ㅇ. Initial and final ㅇ behave differently.', skills: ['pronunciation'] },
      { id: 'ph_block_02', prompt: 'What is the role of ㅇ in 아?', choices: ['Final ng sound', 'Silent initial before ㅏ', 'Aspirated consonant', 'A final vowel'], correctIndex: 1, explanation: 'In 아, ㅇ is the silent initial; it is not pronounced as ng.', skills: ['pronunciation'] },
    ],
  },
  {
    id: 'batchim',
    title: 'Recognize 받침 and coda neutralization',
    objective: 'Find the final consonant in a block and distinguish its written identity from its word-final sound.',
    explanation: 'The spelling keeps the underlying consonant. In a closed final position, several different consonants are realized as one of a smaller set of final sounds. Do not rewrite the spelling to match the sound.',
    examples: [
      { spelling: '꽃', meaning: 'flower', writtenSound: '[꼳]', observation: 'Written final ㅊ is a [ㄷ]-type sound word-finally.' },
      { spelling: '책', meaning: 'book', writtenSound: '[책]', observation: 'Final ㄱ is kept in spelling and realized as a final stop.' },
    ],
    checks: [
      { id: 'ph_batchim_01', prompt: 'Which bracketed form represents word-final 꽃?', choices: ['[꼳]', '[꼬치]', '[꼬시]', '[꼰]'], correctIndex: 0, explanation: 'In isolation, final ㅊ is neutralized to a [ㄷ]-type coda. Before a vowel-initial particle the outcome can differ.', skills: ['pronunciation'] },
      { id: 'ph_batchim_02', prompt: 'Which consonant is the written 받침 in 책?', choices: ['ㅊ', 'ㅐ', 'ㄱ', 'ㅋ'], correctIndex: 2, explanation: '책 decomposes into ㅊ + ㅐ + ㄱ, so ㄱ is its final consonant.', skills: ['pronunciation'] },
    ],
  },
  {
    id: 'liaison',
    title: 'Link across blocks: liaison (연음)',
    objective: 'Identify consonant linking into a following vowel-initial particle.',
    explanation: 'Before a vowel-initial particle beginning with silent ㅇ, the final consonant of the previous syllable is often pronounced as the next onset. The written morphemes stay unchanged. Exceptions and other resyllabification patterns require later study.',
    examples: [
      { spelling: '꽃이', meaning: 'flower + subject particle', writtenSound: '[꼬치]', observation: 'The written ㅊ links into the next syllable before 이.' },
      { spelling: '책을', meaning: 'book + object particle', writtenSound: '[채글]', observation: 'The written ㄱ links into the next syllable before 을.' },
    ],
    checks: [
      { id: 'ph_liaison_01', prompt: 'Choose the standard written pronunciation of 꽃이.', choices: ['[꼳이]', '[꼬치]', '[꼬기]', '[꼬시]'], correctIndex: 1, explanation: 'The underlying ㅊ moves before vowel-initial 이, so 꽃이 is pronounced [꼬치], not as word-final [꼳] + 이.', skills: ['pronunciation'] },
      { id: 'ph_liaison_02', prompt: 'Which is the standard written pronunciation of 책을?', choices: ['[채글]', '[채클]', '[책을]', '[챙을]'], correctIndex: 0, explanation: 'ㄱ links across the boundary before 을; the spelling 책을 remains the same.', skills: ['pronunciation'] },
    ],
  },
  {
    id: 'nasal',
    title: 'Nasal assimilation (비음화)',
    objective: 'Recognize how a final stop changes before ㄴ or ㅁ.',
    explanation: 'Some syllable-final stops take on a nasal place before ㄴ or ㅁ in connected speech. Spell the word conventionally, but identify the spoken nasal when reading or listening.',
    examples: [
      { spelling: '국물', meaning: 'broth', writtenSound: '[궁물]', observation: 'Final ㄱ becomes [ㅇ] before ㅁ.' },
      { spelling: '먹는', meaning: 'eating (modifier)', writtenSound: '[멍는]', observation: 'Final ㄱ becomes [ㅇ] before ㄴ.' },
    ],
    checks: [
      { id: 'ph_nasal_01', prompt: 'Which is the standard pronounced form of 국물?', choices: ['[국물]', '[군물]', '[궁물]', '[굼물]'], correctIndex: 2, explanation: 'The ㄱ before ㅁ is realized as nasal [ㅇ]: 국물 → [궁물].', skills: ['pronunciation'] },
      { id: 'ph_nasal_02', prompt: 'Which pronounced form matches 먹는?', choices: ['[먹는]', '[멍는]', '[먼는]', '[멍므]'], correctIndex: 1, explanation: 'Final ㄱ nasalizes to [ㅇ] before ㄴ: 먹는 → [멍는].', skills: ['pronunciation'] },
    ],
  },
  {
    id: 'aspiration',
    title: 'ㅎ-triggered aspiration',
    objective: 'Recognize the effect of ㅎ beside ㄱ/ㄷ without treating ㅎ as always audible.',
    explanation: 'In examples such as 좋고, ㅎ combines with ㄱ to produce aspirated ㅋ. In 좋다, ㄷ becomes ㅌ. This rule is positional: do not expect the same audible ㅎ in every combination; for example 좋아 is pronounced [조아].',
    examples: [
      { spelling: '좋고', meaning: 'good and...', writtenSound: '[조코]', observation: 'ㅎ + ㄱ gives aspirated ㅋ.' },
      { spelling: '좋다', meaning: 'to be good', writtenSound: '[조타]', observation: 'ㅎ + ㄷ gives aspirated ㅌ.' },
      { spelling: '좋아', meaning: 'good (casual form)', writtenSound: '[조아]', observation: 'ㅎ is not heard as aspiration before this vowel-initial ending.' },
    ],
    checks: [
      { id: 'ph_aspiration_01', prompt: 'How is 좋고 ordinarily pronounced?', choices: ['[조고]', '[조코]', '[존고]', '[조호고]'], correctIndex: 1, explanation: 'The ㅎ and following ㄱ combine to make ㅋ: 좋고 → [조코].', skills: ['pronunciation'] },
      { id: 'ph_aspiration_02', prompt: 'What happens in 좋다?', choices: ['ㄷ becomes aspirated ㅌ in [조타].', 'The ㄷ becomes nasal ㄴ.', 'ㅎ always sounds as a separate h.', 'The written spelling changes to 조타.'], correctIndex: 0, explanation: 'The spelling stays 좋다; ㅎ combines with ㄷ so it is pronounced [조타].', skills: ['pronunciation'] },
    ],
  },
  {
    id: 'sound-vs-spelling',
    title: 'Written letters and spoken sounds are not identical',
    objective: 'Predict a change without changing conventional Hangul spelling and recognize a basic aspiration contrast.',
    explanation: 'A standard spoken transcription is in square brackets. The word remains spelled normally in reading and writing, even when several sounds shift in context. Compare 달 (moon) and 탈 (mask): the initial ㄷ/ㅌ contrast is plain versus aspirated. This contrast is shown visually until licensed, reviewed audio is available.',
    examples: [
      { spelling: '국물', meaning: 'broth', writtenSound: '[궁물]', observation: 'Keep the spelling 국물, even when you hear a nasal.' },
      { spelling: '달 / 탈', meaning: 'moon / mask', writtenSound: '달 / 탈', observation: 'The written ㄷ and ㅌ distinguish a plain and aspirated initial; no audio contrast is claimed.' },
    ],
    checks: [
      { id: 'ph_spelling_01', prompt: 'When 꽃이 is pronounced [꼬치], what happens to its spelling?', choices: ['Write 꼬치 instead.', 'Keep the written form 꽃이.', 'Write 꼳이 instead.', 'Remove the subject particle.'], correctIndex: 1, explanation: 'Sound changes do not authorize phonetic respelling. The conventional spelling remains 꽃이.', skills: ['pronunciation'] },
      { id: 'ph_contrast_01', prompt: 'Which written onset contrasts distinguish 달 and 탈?', choices: ['ㄷ (plain) versus ㅌ (aspirated)', 'ㄹ versus ㅁ', 'ㅏ versus ㅓ', 'Both have the same initial consonant'], correctIndex: 0, explanation: 'The initial consonants differ: ㄷ in 달, ㅌ in 탈. Listening discrimination is unavailable until reviewed audio is provided.', skills: ['pronunciation'] },
    ],
  },
];

export const PHONOLOGY_STATUS =
  'Written recognition and decoding lesson; phonological examples await Korean educator review. No audio has been licensed or validated.';

export function validateSoundLessons(lessons: readonly SoundLesson[]): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();
  for (const lesson of lessons) {
    if (!lesson.id || !lesson.title || !lesson.objective || !lesson.explanation) {
      issues.push('Incomplete lesson: ' + lesson.id);
    }
    for (const example of lesson.examples) {
      if (!example.spelling || !example.writtenSound || !example.observation) {
        issues.push('Incomplete example in ' + lesson.id);
      }
    }
    for (const check of lesson.checks) {
      if (!check.id || ids.has(check.id) || !check.explanation || !check.prompt ||
        check.choices.length < 2 || !Number.isInteger(check.correctIndex) ||
        check.correctIndex < 0 || check.correctIndex >= check.choices.length) {
        issues.push('Invalid/duplicate sound check: ' + check.id);
      }
      ids.add(check.id);
    }
  }
  return issues;
}

const issues = validateSoundLessons(SOUND_LESSONS);
if (issues.length) throw new Error('Invalid phonology content: ' + issues.join('; '));

export function allSoundChecks(): TopicCheck[] {
  return SOUND_LESSONS.flatMap((lesson) => lesson.checks);
}
