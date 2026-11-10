/** Independent reading content: intentionally not a grammar review-card model. */
export type ComprehensionType =
  | 'main-idea'
  | 'specific-detail'
  | 'referential'
  | 'speaker-intention'
  | 'inference'
  | 'grammar-in-context';

export type ReadingQuestion = {
  id: string;
  type: ComprehensionType;
  prompt: string;
  answerLanguage: 'en';
  choices: string[];
  correctIndex: number;
  evidence: string;
  explanation: string;
  interpretationNote?: string;
};

export type ReadingPassage = {
  id: string;
  level: 1 | 2 | 3;
  titleKo: string;
  titleEn: string;
  situation: string;
  prerequisiteGrammarIds: string[];
  prerequisiteGrammarLabels: string[];
  paragraphs: string[];
  wordCount: number;
  vocabularyNotes: { term: string; gloss: string; moveToGeneralVocabulary: boolean }[];
  editorialStatus: 'editorial-draft';
  educatorReviewed: false;
  audio: null | { kind: 'recording'; rights: 'cleared'; uri: string };
  questions: ReadingQuestion[];
};

export type ReadingCatalog = {
  type: 'comprehension-pilot';
  schemaVersion: 1;
  provenance: string;
  review: { status: 'editorial-draft'; educatorReviewed: false; reviewNeeded: string[] };
  passages: ReadingPassage[];
};

export type ReadingResponse = Record<string, number>;
