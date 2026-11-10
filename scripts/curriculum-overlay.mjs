/**
 * Pure assembly of new grammar content into the existing six-deck catalogue.
 *
 * - Inserts after stable grammar-point IDs, never by brittle array indexes.
 * - Retains all existing GP, example and review-card IDs and their history.
 * - Recalculates global positions and multi-target card release positions.
 * - Adds no vocabulary entries to the grammar catalogue.
 *
 * This module runs in Bun (source validation and content porting) and Node
 * (generated JSON validation). No app runtime code depends on it.
 */
export function applyGrammarExpansions(baseBundles, expansionBundles) {
  if (!Array.isArray(baseBundles) || baseBundles.length !== 6) {
    throw new Error('Expected exactly six ordered grammar content bundles');
  }
  const bundles = structuredClone(baseBundles);
  const byLevel = new Map();
  for (const manifest of expansionBundles) {
    if (byLevel.has(manifest.level)) throw new Error(`Duplicate grammar expansion level ${manifest.level}`);
    if (manifest.level < 1 || manifest.level > 6) throw new Error(`Invalid expansion level ${manifest.level}`);
    byLevel.set(manifest.level, manifest.insertions ?? []);
  }
  const beforeIds = new Set();
  const insertedIds = new Set();
  for (const bundle of bundles) {
    for (const lesson of bundle.lessons) for (const gp of lesson.grammarPoints) {
      if (beforeIds.has(gp.id)) throw new Error(`Duplicate existing grammar point ${gp.id}`);
      beforeIds.add(gp.id);
    }
  }
  for (const [index, bundle] of bundles.entries()) {
    const level = index + 1;
    if (bundle.deck.level !== level) throw new Error(`Deck level mismatch at ${level}`);
    const additions = byLevel.get(level) ?? [];
    const byAnchor = new Map();
    const pointIdsHere = new Set(bundle.lessons.flatMap(lesson => lesson.grammarPoints.map(gp => gp.id)));
    for (const entry of additions) {
      const gp = entry.grammarPoint;
      if (!pointIdsHere.has(entry.afterPointId)) {
        throw new Error(`Grammar expansion ${gp?.id}: missing anchor ${entry.afterPointId} in Level ${level}`);
      }
      if (!gp || gp.level !== level || beforeIds.has(gp.id) || insertedIds.has(gp.id)) {
        throw new Error(`Wrong-level or duplicate added grammar point ${gp?.id}`);
      }
      insertedIds.add(gp.id);
      const arr = byAnchor.get(entry.afterPointId) ?? [];
      arr.push(structuredClone(gp));
      byAnchor.set(entry.afterPointId, arr);
    }
    for (const lesson of bundle.lessons) {
      const out = [];
      for (const gp of lesson.grammarPoints) {
        out.push(gp);
        out.push(...(byAnchor.get(gp.id) ?? []));
      }
      lesson.grammarPoints = out;
    }
  }
  const positions = new Map();
  let position = 0;
  const cardIds = new Set();
  const exampleIds = new Set();
  for (const bundle of bundles) for (const lesson of bundle.lessons) for (const gp of lesson.grammarPoints) {
    positions.set(gp.id, ++position);
  }
  for (const bundle of bundles) for (const lesson of bundle.lessons) for (const gp of lesson.grammarPoints) {
    const ownPosition = positions.get(gp.id);
    for (const ex of gp.lessonExamples) {
      if (exampleIds.has(ex.id)) throw new Error(`Duplicate worked-example ID ${ex.id}`);
      exampleIds.add(ex.id);
    }
    for (const card of gp.cards) {
      if (cardIds.has(card.id)) throw new Error(`Duplicate card ID ${card.id}`);
      cardIds.add(card.id);
      const targetPositions = (card.extraTargets ?? []).map(target => {
        const pos = positions.get(target.grammarPointId);
        if (pos === undefined) throw new Error(`Unknown extra grammar target ${target.grammarPointId}`);
        return pos;
      });
      card.introducedAtPosition = Math.max(ownPosition, ...targetPositions);
    }
  }
  return bundles;
}
