import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: PageServerLoad = async () => {
  const card = await prisma.clozeCard.findFirstOrThrow({
    include: { grammarPoint: true },
  });

  return {
    card: {
      id: card.id,
      fullSentence: card.fullSentence,
      sentenceWithBlank: card.sentenceWithBlank,
      vocabBaseForm: card.vocabBaseForm,
      answers: [card.answer, ...card.alternateAnswers],
      grammar: {
        title: card.grammarPoint.title,
        category: card.grammarPoint.category,
        tense: card.grammarPoint.tense,
        register: card.grammarPoint.register,
        hint: card.grammarPoint.hint,
        description: card.grammarPoint.description,
      },
      englishHint: card.englishHint as { text: string; highlight: boolean }[],
    },
  };
};
