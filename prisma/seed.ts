import { PrismaClient, Prisma } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash, type Options } from '@node-rs/argon2';
import { allLessons } from './seed-data/topik1-level1';
import type { GrammarPointSeed } from './seed-data/types';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Argon2id options matching src/lib/server/password.ts
const argon2Opts: Options = {
	memoryCost: 65536,
	timeCost: 3,
	parallelism: 4,
	outputLen: 32,
	algorithm: 2
};

// ══════════════════════════════════════════════════════════════════════════════
// Main seed function
// ══════════════════════════════════════════════════════════════════════════════

async function main() {
	// ── 1. Clean existing grammar-related data ───────────────────────────
	// Delete in dependency order. Cascading deletes handle most children,
	// but explicit deleteMany ensures a clean slate even for orphaned rows.
	console.log('Cleaning existing data...');
	await prisma.reviewLog.deleteMany({});
	await prisma.reviewCard.deleteMany({});
	await prisma.clozeCardGrammarTarget.deleteMany({});
	await prisma.lessonExample.deleteMany({});
	await prisma.clozeCard.deleteMany({});
	await prisma.deckGrammarPoint.deleteMany({});
	await prisma.userDeckProgress.deleteMany({});
	await prisma.deck.deleteMany({});
	await prisma.grammarPoint.deleteMany({});
	console.log('✓ Existing grammar data cleaned');

	// ── 2. Seed test user with BetterAuth account (argon2id-hashed password) ──
	const passwordHash = await hash('testpassword123', argon2Opts);

	await prisma.user.upsert({
		where: { id: 'user_test' },
		update: {},
		create: {
			id: 'user_test',
			email: 'test@example.com',
			name: 'Test User',
			emailVerified: true
		}
	});

	await prisma.account.upsert({
		where: { id: 'account_test' },
		update: {},
		create: {
			id: 'account_test',
			userId: 'user_test',
			accountId: 'user_test',
			providerId: 'credential',
			password: passwordHash
		}
	});
	console.log('✓ Test user + account seeded');

	// ── 3. Flatten all lessons into ordered grammar points ───────────────
	let globalPosition = 0;
	const allGrammarPoints: { gp: GrammarPointSeed; lessonNumber: number; position: number }[] = [];

	for (const lesson of allLessons) {
		for (const gp of lesson.grammarPoints) {
			globalPosition++;
			allGrammarPoints.push({
				gp,
				lessonNumber: lesson.lessonNumber,
				position: globalPosition
			});
		}
	}

	console.log(`Seeding ${allGrammarPoints.length} grammar points across ${allLessons.length} lessons...`);

	// ── 4. Seed grammar points, cloze cards, grammar targets, and lesson examples ──
	let totalCards = 0;
	let totalExamples = 0;

	for (const { gp, position } of allGrammarPoints) {
		await prisma.grammarPoint.create({
			data: {
				id: gp.id,
				title: gp.title,
				category: gp.category,
				tense: gp.tense,
				register: gp.register,
				hint: gp.hint,
				description: gp.description,
				level: gp.level,
				tags: gp.tags,
				structurePattern: gp.structurePattern,
				notes: gp.notes as unknown as Prisma.InputJsonValue ?? undefined,
				relatedPointIds: gp.relatedPointIds ?? []
			}
		});

		// Seed cloze cards
		for (const card of gp.cards) {
			await prisma.clozeCard.create({
				data: {
					id: card.id,
					grammarPointId: gp.id,
					fullSentence: card.fullSentence,
					sentenceWithBlank: card.sentenceWithBlank,
					vocabBaseForm: card.vocabBaseForm,
					answer: card.answer,
					alternateAnswers: card.alternateAnswers,
					englishHint: card.englishHint as unknown as Prisma.InputJsonValue,
					introducedAtPosition: card.introducedAtPosition
				}
			});

			// Primary grammar target
			await prisma.clozeCardGrammarTarget.create({
				data: {
					id: `cgt_${card.id}_${gp.id}`,
					clozeCardId: card.id,
					grammarPointId: gp.id,
					wordReplacement: card.answer,
					blankIndex: 0
				}
			});

			// Extra grammar targets (for multi-GP cards)
			if (card.extraTargets) {
				for (const target of card.extraTargets) {
					await prisma.clozeCardGrammarTarget.create({
						data: {
							id: `cgt_${card.id}_${target.grammarPointId}`,
							clozeCardId: card.id,
							grammarPointId: target.grammarPointId,
							wordReplacement: target.wordReplacement,
							blankIndex: target.blankIndex
						}
					});
				}
			}
			totalCards++;
		}

		// Seed lesson examples
		for (const example of gp.lessonExamples) {
			await prisma.lessonExample.create({
				data: {
					id: example.id,
					grammarPointId: gp.id,
					fullSentence: example.fullSentence,
					sentenceWithBlank: example.sentenceWithBlank,
					answer: example.answer,
					englishHint: example.englishHint as unknown as Prisma.InputJsonValue,
					order: example.order,
					notes: example.notes ?? null
				}
			});
			totalExamples++;
		}
	}

	console.log(`✓ ${allGrammarPoints.length} grammar points seeded`);
	console.log(`✓ ${totalCards} cloze cards seeded`);
	console.log(`✓ ${totalExamples} lesson examples seeded`);

	// ── 5. Seed TOPIK I Level 1 Grammar deck ─────────────────────────────
	await prisma.deck.create({
		data: {
			id: 'deck_topik1_level1',
			title: 'TOPIK I Level 1 Grammar',
			slug: 'topik-i-level-1-grammar',
			description:
				'Essential Korean grammar patterns for TOPIK I Level 1. ' +
				'48 grammar points across 11 lessons covering particles, verb endings, ' +
				'connectives, and common expressions.',
			level: 1,
			topikLevel: 'topik1-1',
			icon: '📘',
			isPublished: true,
			sortOrder: 0
		}
	});
	console.log('✓ TOPIK I Level 1 Grammar deck seeded');

	// ── 6. Link grammar points to deck with curriculum ordering ──────────
	for (const { gp, lessonNumber, position } of allGrammarPoints) {
		const dgpId = `dgp_topik1l1_${String(position).padStart(2, '0')}`;
		await prisma.deckGrammarPoint.create({
			data: {
				id: dgpId,
				deckId: 'deck_topik1_level1',
				grammarPointId: gp.id,
				sortOrder: position - 1, // 0-indexed
				lessonNumber
			}
		});
	}
	console.log(`✓ ${allGrammarPoints.length} deck grammar points linked`);

	// ── 7. Create ReviewCards for the first 5 GPs (test user starts with some progress) ──
	const initialGpCount = 5;
	for (let i = 0; i < initialGpCount && i < allGrammarPoints.length; i++) {
		const { gp } = allGrammarPoints[i];
		await prisma.reviewCard.create({
			data: {
				userId: 'user_test',
				grammarPointId: gp.id,
				state: 0, // New
				due: new Date(),
				stability: 0,
				difficulty: 0,
				reps: 0,
				lapses: 0,
				peakStability: 0
			}
		});
	}
	console.log(`✓ ${initialGpCount} review cards seeded for test user`);

	// ── 8. Enroll test user in deck ──────────────────────────────────────
	await prisma.userDeckProgress.create({
		data: {
			userId: 'user_test',
			deckId: 'deck_topik1_level1',
			lastLearnedIndex: initialGpCount - 1 // learned first N grammar points (0-indexed)
		}
	});
	console.log('✓ Test user enrolled in TOPIK I Level 1 deck');

	// ── 9. Seed UserStreak for test user ─────────────────────────────────
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	await prisma.userStreak.upsert({
		where: { userId: 'user_test' },
		update: {},
		create: {
			userId: 'user_test',
			currentStreak: 3,
			longestStreak: 5,
			lastStudiedDate: today
		}
	});
	console.log('✓ Test user streak seeded');

	console.log('\n✓ Seed complete');
	console.log(`  ${allLessons.length} lessons`);
	console.log(`  ${allGrammarPoints.length} grammar points`);
	console.log(`  ${totalCards} cloze cards`);
	console.log(`  ${totalExamples} lesson examples`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
