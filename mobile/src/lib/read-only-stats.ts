// Read-only stats, computed from a server sync document — no DB access.
//
// A locked-out tab cannot open the local SQLite database at all (the
// OPFS one-tab lock), so this module recomputes the dashboard figures,
// due queue, and grammar library from the SyncDocument pulled from the
// server plus the static content bundles already in the JS bundle. It
// mirrors the logic in db/index.ts getDashboardStats / getDueQueue /
// getGrammarList, but every input comes from the document or the
// bundles — nothing here calls getDb() or any other DB function.
//
// Settings come from the document's settings blob (the getUserSettings()
// blob), merged over the defaults; when the user never changed a
// setting the document holds null and the defaults apply.

import contentBundleLevel1 from '../content/topik1-level1.json';
import contentBundleLevel2 from '../content/topik1-level2.json';
import { flattenContent, type ContentBundle, type GrammarPointSeed } from '../content/types';
import type { DashboardStats, GrammarListItem, UserSettings } from '../db';
import { calculateLevel } from './levels';
import { stageForCard } from './srs';
import type { SyncDocument, SyncReviewCard } from './sync-types';

/** Settings defaults, mirroring DEFAULT_USER_SETTINGS in db/index.ts.
 * Kept here (not imported) so this module never imports the DB module
 * at all — importing it would pull in expo-sqlite, which is exactly the
 * thing a locked-out tab cannot load. If the defaults change, change
 * both places. */
const READ_ONLY_DEFAULT_SETTINGS: UserSettings = {
  dailyNewLimit: 5,
  batchSize: 5,
  hideStreak: false,
  showSrsRank: true,
  undoEnabled: true,
  focusMode: false,
  lightningMode: false,
  maxReviewsPerDay: null,
  vacationMode: false,
};

const CONTENT_BUNDLES: ContentBundle[] = [
  contentBundleLevel1 as unknown as ContentBundle,
  contentBundleLevel2 as unknown as ContentBundle,
];

export interface ContentPoint {
  gp: GrammarPointSeed;
  lessonNumber: number;
  lessonTitle: string;
  position: number;
  deckId: string;
  deckTitle: string;
  topikLevel: string;
}

/** Every grammar point in curriculum order, with its deck and lesson. */
export function readOnlyContentPoints(): ContentPoint[] {
  const out: ContentPoint[] = [];
  let position = 0;
  for (const bundle of CONTENT_BUNDLES) {
    for (const { gp, lessonNumber, lessonTitle } of flattenContent(bundle).grammarPoints) {
      position += 1;
      out.push({
        gp,
        lessonNumber,
        lessonTitle,
        position,
        deckId: bundle.deck.id,
        deckTitle: bundle.deck.title,
        topikLevel: bundle.deck.topikLevel,
      });
    }
  }
  return out;
}

function readOnlySettings(doc: SyncDocument): UserSettings {
  const raw = doc.settings;
  if (!raw || typeof raw !== 'object') return { ...READ_ONLY_DEFAULT_SETTINGS };
  const dailyNewLimit =
    typeof raw.dailyNewLimit === 'number' && Number.isFinite(raw.dailyNewLimit)
      ? Math.min(10, Math.max(1, Math.round(raw.dailyNewLimit)))
      : READ_ONLY_DEFAULT_SETTINGS.dailyNewLimit;
  const maxReviewsPerDay =
    raw.maxReviewsPerDay == null
      ? null
      : typeof raw.maxReviewsPerDay === 'number' && Number.isFinite(raw.maxReviewsPerDay)
        ? Math.min(100, Math.max(5, Math.round(raw.maxReviewsPerDay)))
        : null;
  return {
    ...READ_ONLY_DEFAULT_SETTINGS,
    ...raw,
    dailyNewLimit,
    maxReviewsPerDay,
    vacationMode: raw.vacationMode === true,
    hideStreak: raw.hideStreak === true,
  };
}

function libraryGpIds(doc: SyncDocument): Set<string> {
  const deckIds = new Set(doc.libraryDecks.map((d) => d.deckId));
  const ids = new Set<string>();
  for (const point of readOnlyContentPoints()) {
    if (deckIds.has(point.deckId)) ids.add(point.gp.id);
  }
  return ids;
}

/** Dashboard figures for the read-only view, same shape as the normal one. */
export function computeReadOnlyStats(doc: SyncDocument): DashboardStats {
  const settings = readOnlySettings(doc);
  const nowIso = new Date().toISOString();
  const today = nowIso.slice(0, 10);
  const allCards = doc.reviewCards;
  const logs = doc.reviewLogs;
  const libraryIds = libraryGpIds(doc);
  const reviewedToday = logs.filter((l) => l.reviewedAt.slice(0, 10) === today).length;
  const rawDueCount = allCards.filter(
    (c) => c.due <= nowIso && !c.masteredAt && libraryIds.has(c.grammarPointId),
  ).length;
  const dueCount = settings.vacationMode
    ? 0
    : settings.maxReviewsPerDay != null
      ? Math.min(rawDueCount, Math.max(0, settings.maxReviewsPerDay - reviewedToday))
      : rawDueCount;
  const totalReviews = logs.length;
  const levelInfo = calculateLevel(totalReviews);
  const dist = { new: 0, learning: 0, review: 0, relearning: 0, mastered: 0 };
  for (const c of allCards) {
    if (c.masteredAt) dist.mastered += 1;
    else if (c.state === 0) dist.new += 1;
    else if (c.state === 1) dist.learning += 1;
    else if (c.state === 2) dist.review += 1;
    else dist.relearning += 1;
  }
  const history: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = d.toISOString().slice(0, 10);
    history.push({ date: day, count: logs.filter((l) => l.reviewedAt.slice(0, 10) === day).length });
  }
  const daysStudied = new Set(logs.map((l) => l.reviewedAt.slice(0, 10))).size;
  const sessionDates = [...new Set(logs.map((l) => l.reviewedAt.slice(0, 10)))].sort().reverse();
  const lastDate = sessionDates[0];
  let lastSessionAccuracy: number | null = null;
  if (lastDate) {
    const sessionLogs = logs.filter((l) => l.reviewedAt.slice(0, 10) === lastDate);
    const correct = sessionLogs.filter((l) => l.rating >= 3).length;
    lastSessionAccuracy = sessionLogs.length > 0 ? Math.round((correct / sessionLogs.length) * 100) : null;
  }
  const stageCounts = { beginner: 0, adept: 0, seasoned: 0, expert: 0, master: 0, selfStudy: 0, ghost: 0 };
  for (const c of allCards) {
    const stage = stageForCard(c.state, c.stability, c.masteredAt !== null);
    stageCounts[stage] += 1;
    if (c.lapses > 0 && !c.masteredAt) stageCounts.ghost += 1;
  }
  const points = readOnlyContentPoints();
  const totalGrammarPoints = points.length;
  const learnedIds = new Set(allCards.map((c) => c.grammarPointId));
  const levelProgress = CONTENT_BUNDLES.map((bundle) => {
    const bundlePoints = points.filter((p) => p.deckId === bundle.deck.id);
    const lessons = new Map<number, { lessonTitle: string; total: number; learned: number }>();
    let learned = 0;
    for (const p of bundlePoints) {
      const entry = lessons.get(p.lessonNumber) ?? { lessonTitle: p.lessonTitle, total: 0, learned: 0 };
      entry.total += 1;
      if (learnedIds.has(p.gp.id)) {
        entry.learned += 1;
        learned += 1;
      }
      lessons.set(p.lessonNumber, entry);
    }
    return {
      deckId: bundle.deck.id,
      level: bundle.deck.topikLevel,
      title: bundle.deck.title,
      learned,
      total: bundlePoints.length,
      lessons: [...lessons.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([lessonNumber, entry]) => ({ lessonNumber, ...entry })),
    };
  });
  const nextReviewAt =
    [...allCards]
      .filter((c) => libraryIds.has(c.grammarPointId))
      .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0))[0]?.due ?? null;
  return {
    dueCount,
    totalReviews,
    level: levelInfo.level,
    currentXP: levelInfo.currentXP,
    xpForNextLevel: levelInfo.xpForNextLevel,
    progress: levelInfo.progress,
    totalXP: levelInfo.totalXP,
    currentStreak: doc.streak?.currentStreak ?? 0,
    longestStreak: doc.streak?.longestStreak ?? 0,
    srsDistribution: dist,
    history,
    learnedCount: allCards.length,
    totalGrammarPoints,
    newCount: Math.max(0, totalGrammarPoints - allCards.length),
    nextReviewAt,
    learnedToday: doc.dailyLearned[today] ?? 0,
    dailyLearnLimit: settings.dailyNewLimit,
    libraryCount: doc.libraryDecks.length,
    levelProgress,
    vacationMode: settings.vacationMode,
    daysStudied,
    lastSessionAccuracy,
    stageCounts,
  };
}

export interface ReadOnlyDueItem {
  card: SyncReviewCard;
  title: string;
  hint: string;
}

/** Due review cards, earliest due first, library decks only. Read-only:
 * the list is for viewing — answering a review needs the local DB. */
export function readOnlyDueQueue(doc: SyncDocument, limit = 10): ReadOnlyDueItem[] {
  const settings = readOnlySettings(doc);
  if (settings.vacationMode) return [];
  const libraryIds = libraryGpIds(doc);
  const nowIso = new Date().toISOString();
  const byGp = new Map(readOnlyContentPoints().map((p) => [p.gp.id, p] as const));
  return doc.reviewCards
    .filter((c) => c.due <= nowIso && !c.masteredAt && libraryIds.has(c.grammarPointId))
    .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0))
    .slice(0, limit)
    .map((card) => {
      const point = byGp.get(card.grammarPointId);
      return { card, title: point?.gp.title ?? card.grammarPointId, hint: point?.gp.hint ?? '' };
    });
}

/** Grammar library, same shape as the normal list, from the document. */
export function readOnlyGrammarList(doc: SyncDocument): GrammarListItem[] {
  const byGp = new Map(doc.reviewCards.map((c) => [c.grammarPointId, c] as const));
  return readOnlyContentPoints().map((point) => {
    const card = byGp.get(point.gp.id);
    return {
      id: point.gp.id,
      title: point.gp.title,
      hint: point.gp.hint,
      category: point.gp.category,
      lessonNumber: point.lessonNumber,
      lessonTitle: point.lessonTitle,
      position: point.position,
      status: !card ? 'new' : card.masteredAt ? 'mastered' : 'learning',
      streakCorrect: card?.streakCorrect ?? 0,
      deckId: point.deckId,
      deckTitle: point.deckTitle,
      topikLevel: point.topikLevel,
    };
  });
}
