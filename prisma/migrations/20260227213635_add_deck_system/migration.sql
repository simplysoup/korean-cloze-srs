-- CreateTable
CREATE TABLE "decks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "icon" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deck_grammar_points" (
    "id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "grammar_point_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "lesson_number" INTEGER NOT NULL,

    CONSTRAINT "deck_grammar_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_deck_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "deck_id" TEXT NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_studied_at" TIMESTAMP(3),
    "last_learned_index" INTEGER NOT NULL DEFAULT -1,

    CONSTRAINT "user_deck_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "decks_title_key" ON "decks"("title");

-- CreateIndex
CREATE UNIQUE INDEX "decks_slug_key" ON "decks"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "deck_grammar_points_deck_id_grammar_point_id_key" ON "deck_grammar_points"("deck_id", "grammar_point_id");

-- CreateIndex
CREATE UNIQUE INDEX "deck_grammar_points_deck_id_sort_order_key" ON "deck_grammar_points"("deck_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "user_deck_progress_user_id_deck_id_key" ON "user_deck_progress"("user_id", "deck_id");

-- AddForeignKey
ALTER TABLE "deck_grammar_points" ADD CONSTRAINT "deck_grammar_points_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_grammar_points" ADD CONSTRAINT "deck_grammar_points_grammar_point_id_fkey" FOREIGN KEY ("grammar_point_id") REFERENCES "grammar_points"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_deck_progress" ADD CONSTRAINT "user_deck_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_deck_progress" ADD CONSTRAINT "user_deck_progress_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
