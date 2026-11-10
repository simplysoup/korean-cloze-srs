# Curriculum v1 educator review — rubric, intake and record lifecycle

**Authority:** This is a queue and review procedure, not educator certification. The source registry at `docs/research/educator-review/review-records.json` has `defaultStatus: not_reviewed` and zero real decisions as of the Phase 2 kickoff. Never backfill approval from validator output or internal editorial dispositions.

## Intake packet

Use `node scripts/validate-linguistic-qa.mjs --tier=1 --out=/tmp/munpro-educator-review` in a fresh checkout to export content and per-item SHA-256 fingerprints. Also consult `curriculum-v1-priority-queue.json` for the **1,674-item full release census**, including **52 practice exercises and six reading passages** that the existing generic question scanner does not currently inventory. For a practice task, provide the whole situation, choices and validity constraints; for reading, provide the entire passage, question, four choices, evidence span and interpretation note. For vocabulary, provide written/spoken forms, counter contexts and usage examples. For Hangul, provide syllable, underlying spelling, bracketed reading and the rule/source.

Do not distribute unpublished reviewer identities, private review notes or third-party copyrighted teaching pages as public packets. Source-ledger URLs are leads, not independently verified item-level evidence.

## Required human review rubric

Record each dimension separately as `pass`, `fail`, `needs_clarification`, or `not_applicable`; an `approved` registry entry may use only `pass`/`not_applicable` on all seven dimensions. Supplement with the five curricular checks below and a short rationale.

| Dimension | Reviewer must verify |
| --- | --- |
| Formation accuracy | Grammatical construction, conjugation, spacing, spelling, irregular forms and phonological derivation |
| Semantic accuracy | Meaning of Korean utterance, English gloss, pragmatic entailment and whether stated evidence supports the intended interpretation |
| Register appropriateness | Politeness, honorific status, tense, aspect, modality, participant roles and consistency across sentence and explanation |
| Pragmatic naturalness | Real context of utterance, plausible speaker intent and native acceptability; distinguish grammatical but odd expressions |
| Morphological correctness | Particle attachment, stem alternation, inflection, negation, passive/causative, lexical restrictions |
| Lexical restrictions | Collocations, noun/counter selection, native versus Sino-Korean numbers, pronunciation/exceptions, idiomatic usage |
| Prompt clarity | Explicit situation, unique or scoped answer, credible distractors, explanation and accessibility for learners |

**Also record:** (1) learner prerequisites and correct lesson ordering; (2) TOPIK level as *curricular calibration*, not official TOPIK endorsement; (3) whether each accepted alternative is valid Korean **and separately** demonstrates the specific target; (4) whether each near miss is a genuine error versus a valid off-target response, with actionable hints; (5) accessibility—clear English, transcript for phonology without audio, contrast conveyed without color alone, no arbitrary dependence on unseen context.

## Priority and assignment

- **P0** (18 items): 11 explicitly documented off-target-but-natural accepted-answer candidates, plus the seven Hangul topic sections/checks. Review target-mastery separation and sound-change examples before exposing these experiences.
- **P1** (1,206 items): remaining higher-risk flagged/alternative clozes, 31 new grammar points and descendants, TOPIK II, reading/transfer pilots, number/counter vocabulary, topic contrasts and source-ledger evidence gaps.
- **P2** (450 items): remaining content; lower priority is **not** an approval or permission to claim educator-verified coverage.

Suggested reviewer specialties: beginner grammar/register and particles; higher-level contrast/passive/causative; Korean phonology and pronunciation; vocabulary usage and numeral/counter forms; reading assessment/distractor review. A qualified educator can review more than one specialty; do not imply assignments are staffed.

## Acceptance and source provenance

For each item, record stable `sourceItemId`, source commit, `sourceFingerprint` from the current exported packet, actual reviewer identity and qualification/role (if supplied), actual review date, seven dimension results, explicit decision, rationale, accepted-alternative and near-miss judgments, item-specific sources checked, precise claim scope, uncertainty, and corrections. Save decisions only after real external review.

Allowed registry decisions: `not_reviewed`, `needs_clarification`, `approved`, `rejected`, `revised_pending_recheck`. Treat the template as documentation, not as a real registry entry. Preserve append-only `history`. If text, context, answer space or explanation changes, compare fingerprint and invalidate any prior approval until a new educator decision is recorded.

**Approval conditions:** identified real human educator with a role, date, every required dimension passing or N/A, checked item-specific reference including the exact supported claim, rationale, fingerprint matching current content, and decision history. Multiple educators may disagree; log the unresolved issue, not a synthetic consensus.

## Correction routing

Log a proposed fix with `sourceItemId`, source path, current hash, observed problem, reproducible Korean/English context, impact (correctness, grading, level, accessibility), proposed change, source reference and reviewer decision. Do not patch other agents' seed data. Agent 00 routes accepted proposals to the correct content owner. Re-run porting, strict validators and fresh educator review after changes.

## Review session flow

1. Select a bounded batch of P0/P1 IDs and export full exact-source packets on a pinned SHA.
2. Reviewer verifies references independently, evaluates seven dimensions plus curricular checks, and records alternatives/near misses separately.
3. Enter authentic decisions and evidence in the review registry only after sign-off; never enter this template as a real approval.
4. Run `node scripts/validate-linguistic-qa.mjs --check-only` to reject stale/unsigned approvals; then run all pilot-specific validators.
5. Report remaining `not_reviewed`, unresolved `needs_clarification`/`rejected`, fingerprints invalidated by edits and risk-specific release blockers to Agent 00.

## Advertising / release wording

Allowed for an authorized limited pilot: **“Original Korean-learning curriculum in editorial preview; educator review is ongoing. Feedback may change.”** Clearly identify draft modules *in the product* and invitation material, and provide report/error links. Do not describe it as “educator-approved,” “native-speaker certified,” “official TOPIK curriculum,” “TOPIK-endorsed,” or a validated predictor of TOPIK performance. Passing mechanical tests permits only “structural checks passed” when the exact test report actually exists.

