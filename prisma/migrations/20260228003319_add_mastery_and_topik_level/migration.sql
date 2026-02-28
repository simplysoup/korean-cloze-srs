-- AlterTable
ALTER TABLE "decks" ADD COLUMN     "topik_level" TEXT NOT NULL DEFAULT 'topik1-1';

-- AlterTable
ALTER TABLE "review_cards" ADD COLUMN     "mastered_at" TIMESTAMP(3),
ADD COLUMN     "streak_correct" INTEGER NOT NULL DEFAULT 0;
