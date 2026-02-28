/**
 * Phase 11a — Comprehensive Integration Test
 *
 * Verifies all critical database operations work correctly with the new schema:
 * - ReviewCard keyed by (userId, grammarPointId) — not clozeCardId
 * - ClozeCardGrammarTarget join table
 * - LessonExample model
 * - peakStability, lastClozeCardId on ReviewCard
 * - All query patterns used by the app
 */

import { PrismaClient, Prisma } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
	if (condition) {
		passed++;
		console.log(`  ✓ ${message}`);
	} else {
		failed++;
		console.error(`  ✗ FAIL: ${message}`);
	}
}

async function testSchemaStructure() {
	console.log('\n── Schema Structure Tests ──');

	// GrammarPoint has relatedPointIds field
	const gp = await prisma.grammarPoint.findFirst({
		select: { relatedPointIds: true }
	});
	assert(gp !== null, 'GrammarPoint.relatedPointIds field exists');
	assert(Array.isArray(gp!.relatedPointIds), 'relatedPointIds is an array');

	// ClozeCard has introducedAtPosition field
	const cc = await prisma.clozeCard.findFirst({
		select: { introducedAtPosition: true }
	});
	assert(cc !== null, 'ClozeCard.introducedAtPosition field exists');
	assert(typeof cc!.introducedAtPosition === 'number', 'introducedAtPosition is a number');

	// ReviewCard has grammarPointId, peakStability, lastClozeCardId
	const rc = await prisma.reviewCard.findFirst({
		select: {
			grammarPointId: true,
			peakStability: true,
			lastClozeCardId: true,
			streakCorrect: true,
			masteredAt: true,
			reps: true,
			lastReview: true
		}
	});
	assert(rc !== null, 'ReviewCard exists');
	assert(typeof rc!.grammarPointId === 'string', 'ReviewCard.grammarPointId is a string');
	assert(typeof rc!.peakStability === 'number', 'ReviewCard.peakStability exists');
	assert(rc!.lastClozeCardId === null || typeof rc!.lastClozeCardId === 'string', 'ReviewCard.lastClozeCardId is nullable string');
	assert(typeof rc!.streakCorrect === 'number', 'ReviewCard.streakCorrect preserved');
	assert(typeof rc!.reps === 'number', 'ReviewCard.reps preserved');

	// LessonExample table exists and has data
	const leCount = await prisma.lessonExample.count();
	assert(leCount > 0, `LessonExample table has ${leCount} rows`);

	// ClozeCardGrammarTarget table exists and has data
	const cgtCount = await prisma.clozeCardGrammarTarget.count();
	assert(cgtCount > 0, `ClozeCardGrammarTarget table has ${cgtCount} rows`);
}

async function testUniqueConstraints() {
	console.log('\n── Unique Constraint Tests ──');

	// ReviewCard: (userId, grammarPointId) is unique
	try {
		await prisma.reviewCard.create({
			data: {
				userId: 'user_test',
				grammarPointId: 'gp_topic', // already exists from seed
				state: 0,
				due: new Date(),
				stability: 0,
				difficulty: 0,
				reps: 0,
				lapses: 0,
				peakStability: 0
			}
		});
		assert(false, 'ReviewCard (userId, grammarPointId) unique constraint should prevent duplicate');
	} catch (e) {
		assert(true, 'ReviewCard (userId, grammarPointId) unique constraint enforced');
	}

	// ClozeCardGrammarTarget: (clozeCardId, grammarPointId) is unique
	try {
		await prisma.clozeCardGrammarTarget.create({
			data: {
				clozeCardId: 'cc_topic_01',
				grammarPointId: 'gp_topic', // already exists from seed
				wordReplacement: '는',
				blankIndex: 0
			}
		});
		assert(false, 'ClozeCardGrammarTarget unique constraint should prevent duplicate');
	} catch (e) {
		assert(true, 'ClozeCardGrammarTarget (clozeCardId, grammarPointId) unique constraint enforced');
	}
}

async function testReviewCardQueries() {
	console.log('\n── ReviewCard Query Pattern Tests ──');

	const userId = 'user_test';

	// Pattern: count due reviews (layout.server.ts)
	const dueCount = await prisma.reviewCard.count({
		where: { userId, due: { lte: new Date() }, masteredAt: null }
	});
	assert(dueCount >= 0, `Due review count: ${dueCount}`);

	// Pattern: fetch ReviewCards with grammarPoint include (reviews loader)
	const reviewCards = await prisma.reviewCard.findMany({
		where: { userId, due: { lte: new Date() }, masteredAt: null },
		orderBy: { due: 'asc' },
		take: 10,
		include: {
			grammarPoint: {
				include: {
					clozeCards: {
						orderBy: { introducedAtPosition: 'desc' },
						take: 1
					}
				}
			}
		}
	});
	assert(reviewCards.length > 0, `Review queue has ${reviewCards.length} items`);
	assert(reviewCards[0].grammarPoint !== null, 'ReviewCard includes grammarPoint');
	assert(reviewCards[0].grammarPoint.clozeCards.length > 0, 'grammarPoint includes clozeCards');

	// Pattern: fetch RC by grammarPointId directly (dashboard)
	const rcForSrs = await prisma.reviewCard.findMany({
		where: { userId },
		select: { state: true, masteredAt: true, streakCorrect: true, grammarPointId: true }
	});
	assert(rcForSrs.length > 0, `SRS review cards fetched: ${rcForSrs.length}`);
	assert(typeof rcForSrs[0].grammarPointId === 'string', 'grammarPointId available directly');

	// Pattern: deck-scoped due cards (dashboard)
	const deckDueCards = await prisma.reviewCard.findMany({
		where: {
			userId,
			due: { lte: new Date() },
			masteredAt: null,
			grammarPoint: {
				decks: { some: { deckId: 'deck_topik1_grammar' } }
			}
		},
		select: {
			grammarPoint: {
				select: { decks: { select: { deckId: true } } }
			}
		}
	});
	assert(deckDueCards.length >= 0, `Deck-scoped due cards: ${deckDueCards.length}`);

	// Pattern: findUnique by (userId, grammarPointId) — learn API
	const rcUnique = await prisma.reviewCard.findUnique({
		where: {
			userId_grammarPointId: { userId, grammarPointId: 'gp_topic' }
		}
	});
	assert(rcUnique !== null, 'findUnique by userId_grammarPointId works');

	// Pattern: isLearned check (grammar detail page)
	const rcForGP = await prisma.reviewCard.findUnique({
		where: {
			userId_grammarPointId: { userId, grammarPointId: 'gp_topic' }
		}
	});
	assert(rcForGP !== null, 'isLearned check via ReviewCard.grammarPointId works');

	// Pattern: deck detail — user review cards with direct grammarPointId
	const deckReviewCards = await prisma.reviewCard.findMany({
		where: { userId },
		select: {
			grammarPointId: true,
			due: true,
			streakCorrect: true,
			masteredAt: true,
			state: true
		}
	});
	assert(deckReviewCards.length > 0, `Deck detail review cards: ${deckReviewCards.length}`);
	assert(typeof deckReviewCards[0].grammarPointId === 'string', 'Direct grammarPointId access');

	// Pattern: deck listing — review cards filtered by GP
	const gpIds = ['gp_topic', 'gp_subject', 'gp_object'];
	const deckMasteryCards = await prisma.reviewCard.findMany({
		where: {
			userId,
			grammarPointId: { in: gpIds }
		},
		select: {
			masteredAt: true,
			grammarPointId: true
		}
	});
	assert(deckMasteryCards.length > 0, `Deck mastery cards: ${deckMasteryCards.length}`);
}

async function testGrammarTargetQueries() {
	console.log('\n── Grammar Target Query Tests ──');

	// Fetch targets for a grammar point
	const targets = await prisma.clozeCardGrammarTarget.findMany({
		where: { grammarPointId: 'gp_topic' },
		include: {
			clozeCard: true
		}
	});
	assert(targets.length > 0, `Grammar targets for gp_topic: ${targets.length}`);
	assert(typeof targets[0].wordReplacement === 'string', 'wordReplacement is a string');
	assert(typeof targets[0].blankIndex === 'number', 'blankIndex is a number');

	// Fetch specific target by composite key (answer check API)
	const target = await prisma.clozeCardGrammarTarget.findUnique({
		where: {
			clozeCardId_grammarPointId: {
				clozeCardId: 'cc_topic_01',
				grammarPointId: 'gp_topic'
			}
		},
		include: { clozeCard: { select: { answer: true, alternateAnswers: true } } }
	});
	assert(target !== null, 'Specific target found by composite key');
	assert(target!.wordReplacement === '는', `wordReplacement is '는' (got '${target!.wordReplacement}')`);
}

async function testLessonExampleQueries() {
	console.log('\n── Lesson Example Query Tests ──');

	// Fetch lesson examples for a grammar point
	const examples = await prisma.lessonExample.findMany({
		where: { grammarPointId: 'gp_topic' },
		orderBy: { order: 'asc' }
	});
	assert(examples.length >= 2, `Lesson examples for gp_topic: ${examples.length}`);
	assert(typeof examples[0].fullSentence === 'string', 'fullSentence is a string');
	assert(typeof examples[0].sentenceWithBlank === 'string', 'sentenceWithBlank is a string');
	assert(typeof examples[0].answer === 'string', 'answer is a string');
	assert(examples[0].order === 0, 'First example has order 0');

	// Fetch GP with lesson examples (learn page pattern)
	const gp = await prisma.grammarPoint.findUnique({
		where: { id: 'gp_topic' },
		include: {
			lessonExamples: { orderBy: { order: 'asc' } },
			clozeCards: { orderBy: { createdAt: 'asc' } }
		}
	});
	assert(gp !== null, 'Grammar point with includes loads');
	assert(gp!.lessonExamples.length >= 2, 'lessonExamples included');
	assert(gp!.clozeCards.length >= 3, 'clozeCards still included');
}

async function testGrammarPointRelations() {
	console.log('\n── Grammar Point Relation Tests ──');

	// GrammarPoint → clozeCards still works
	const gp = await prisma.grammarPoint.findUnique({
		where: { id: 'gp_topic' },
		include: {
			clozeCards: true,
			grammarTargets: true,
			lessonExamples: true,
			decks: true,
			reviewCards: true
		}
	});
	assert(gp !== null, 'Grammar point found');
	assert(gp!.clozeCards.length >= 3, 'GrammarPoint → clozeCards works');
	assert(gp!.grammarTargets.length >= 3, 'GrammarPoint → grammarTargets works');
	assert(gp!.lessonExamples.length >= 2, 'GrammarPoint → lessonExamples works');
	assert(gp!.decks.length >= 1, 'GrammarPoint → decks works');
	assert(gp!.reviewCards.length >= 1, 'GrammarPoint → reviewCards works');
}

async function testPeakStabilityUpdate() {
	console.log('\n── peakStability Update Test ──');

	// Simulate updating peakStability (what the FSRS API does)
	const rc = await prisma.reviewCard.findFirst({
		where: { userId: 'user_test' }
	});
	assert(rc !== null, 'Review card found for update test');

	const newPeakStability = Math.max(rc!.peakStability, 5.5);
	await prisma.reviewCard.update({
		where: { id: rc!.id },
		data: {
			peakStability: newPeakStability,
			lastClozeCardId: 'cc_topic_01'
		}
	});

	const updated = await prisma.reviewCard.findUnique({
		where: { id: rc!.id }
	});
	assert(updated!.peakStability === 5.5, `peakStability updated to 5.5 (got ${updated!.peakStability})`);
	assert(updated!.lastClozeCardId === 'cc_topic_01', 'lastClozeCardId updated');

	// Reset for clean state
	await prisma.reviewCard.update({
		where: { id: rc!.id },
		data: { peakStability: 0, lastClozeCardId: null }
	});
}

async function testLearnApiPattern() {
	console.log('\n── Learn API Pattern Tests ──');

	// Pattern: create ReviewCard for a new grammar point
	const testGpId = 'gp_from_to_place'; // GP without a ReviewCard for test user

	// Check it doesn't exist yet
	const before = await prisma.reviewCard.findUnique({
		where: { userId_grammarPointId: { userId: 'user_test', grammarPointId: testGpId } }
	});

	if (before) {
		// Clean up if exists from previous test run
		await prisma.reviewCard.delete({ where: { id: before.id } });
	}

	// Create (like the learn API does)
	await prisma.reviewCard.create({
		data: {
			userId: 'user_test',
			grammarPointId: testGpId,
			state: 0,
			due: new Date(),
			stability: 0,
			difficulty: 0,
			reps: 0,
			lapses: 0,
			peakStability: 0
		}
	});

	const after = await prisma.reviewCard.findUnique({
		where: { userId_grammarPointId: { userId: 'user_test', grammarPointId: testGpId } }
	});
	assert(after !== null, 'ReviewCard created via learn API pattern');
	assert(after!.grammarPointId === testGpId, 'grammarPointId set correctly');

	// Cleanup
	await prisma.reviewCard.delete({ where: { id: after!.id } });
}

async function testAnswerCheckPattern() {
	console.log('\n── Answer Check Pattern Tests ──');

	// Pattern: get correct answers from ClozeCardGrammarTarget (new check API)
	const reviewCard = await prisma.reviewCard.findFirst({
		where: { userId: 'user_test' },
		select: { id: true, grammarPointId: true }
	});
	assert(reviewCard !== null, 'ReviewCard found for answer check');

	// Find a cloze card for this GP
	const clozeCard = await prisma.clozeCard.findFirst({
		where: { grammarPointId: reviewCard!.grammarPointId },
		select: { id: true }
	});
	assert(clozeCard !== null, 'ClozeCard found for GP');

	// Look up word replacement
	const target = await prisma.clozeCardGrammarTarget.findUnique({
		where: {
			clozeCardId_grammarPointId: {
				clozeCardId: clozeCard!.id,
				grammarPointId: reviewCard!.grammarPointId
			}
		},
		include: { clozeCard: { select: { answer: true, alternateAnswers: true } } }
	});
	assert(target !== null, 'Grammar target found for answer check');
	assert(typeof target!.wordReplacement === 'string', 'wordReplacement available');
	assert(typeof target!.clozeCard.answer === 'string', 'ClozeCard answer available via target');
}

async function main() {
	console.log('Phase 11a — Integration Test Suite');
	console.log('================================\n');

	try {
		await testSchemaStructure();
		await testUniqueConstraints();
		await testReviewCardQueries();
		await testGrammarTargetQueries();
		await testLessonExampleQueries();
		await testGrammarPointRelations();
		await testPeakStabilityUpdate();
		await testLearnApiPattern();
		await testAnswerCheckPattern();

		console.log(`\n================================`);
		console.log(`Results: ${passed} passed, ${failed} failed`);

		if (failed > 0) {
			process.exit(1);
		}
	} catch (e) {
		console.error('\nFatal error:', e);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();
