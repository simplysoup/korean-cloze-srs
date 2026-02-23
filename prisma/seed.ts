import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Grammar Point: Topic Particle ──────────────────────────────────────
  const topicParticle = await prisma.grammarPoint.upsert({
    where: { id: 'gp_topic_particle' },
    update: {},
    create: {
      id: 'gp_topic_particle',
      title: 'Topic Particle',
      category: 'particle',
      tense: 'present',
      register: 'polite',
      hint: 'topic particle',
      description:
        'Attaches directly after a noun to mark it as the sentence topic. ' +
        'Use 은 after a noun ending in a consonant (받침), ' +
        '는 after a noun ending in a vowel. ' +
        'Sets contrast or emphasis relative to other things in the sentence.',
      level: 1,
      tags: ['particle', 'beginner', 'TOPIK1'],
    },
  });

  // ── Cloze Card 1 ───────────────────────────────────────────────────────
  await prisma.clozeCard.upsert({
    where: { id: 'cc_topic_01' },
    update: {},
    create: {
      id: 'cc_topic_01',
      grammarPointId: topicParticle.id,
      fullSentence: '저는 한국어를 공부해요.',
      sentenceWithBlank: '저___ 한국어를 공부해요.',
      vocabBaseForm: '은/는',
      answer: '는',
      alternateAnswers: [],
      englishHint: [
        { text: 'I', highlight: true },
        { text: ' study Korean.', highlight: false },
      ],
    },
  });

  console.log('✓ Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
