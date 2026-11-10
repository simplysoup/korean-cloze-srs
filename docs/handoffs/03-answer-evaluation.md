# Agent 03 — Context-aware grammar answer evaluation

## Scope and PR

Branch `feat/contextual-answer-evaluation`; target `integration/curriculum-v1`. All changed paths are within Agent 03's ownership. No edits to `mobile/src/lib/srs.ts`, Learn/Review screens, persistence, navigation, FSRS, shared contracts, feature flags, or grading policy. No merge or deployment is authorized.

## API and frozen contract

```ts
import {
  bundledAnswerEvaluator, evaluateGrammarAnswer,
  evaluateAnswer, AnswerFeedbackPanel,
} from '@/features/answer-evaluation';

// Pure, internal structured result:
const result = evaluateGrammarAnswer({
  cardId: card.id,
  submittedAnswer: answer,
  grammarPointId: grammarPoint.id, // optional stale-point guard
});
// { cardId, submittedAnswer, normalizedAnswer, expectedCanonicalAnswer,
//   curatedAlternatives, targetGrammarPointId, classification,
//   targetMasteryEligible, feedback, relevantAlternativeForms,
//   errorCategory, sentenceStatus, editorialReview }

// Frozen Agent 00 interface (no grading or persistence here):
const contracted = bundledAnswerEvaluator.evaluate({
  exerciseId: card.id,
  targetGrammarIds: [grammarPoint.id],
  canonicalAnswer: card.answer,
  acceptedAlternatives: card.alternateAnswers.map(answer => ({ answer })),
  submittedAnswer: answer,
  sentenceContext: card.sentenceWithBlank, // fullSentence also accepted
  register: grammarPoint.register,
  tense: grammarPoint.tense,
});
// { outcome, canonicalAnswer, acceptedAlternatives, explanation,
//   errorType?, retryAllowed, targetMasteryEligible }

// Test custom datasets: evaluateAnswer({ cardId, submittedAnswer, grammarPointId? }, catalog)
// Display only: <AnswerFeedbackPanel result={result} />
```

The canonical source of shared types is `mobile/src/features/contracts/answers.ts` (Agent 00 owns it). The owned `contract-adapter.ts` implements `AnswerEvaluator`, translating `classification` → `outcome`, `feedback` → `explanation`, and curated alternatives/diagnostics to the frozen shapes. **It abstains if the card ID, grammar point, canonical string, set of accepted alternatives, or sentence context do not match the compiled editorial snapshot.** Caller-supplied alternatives never gain mastery simply because the caller listed them.

The core evaluator accepts injected JSON and has no React Native, FSRS, I/O, network or persistence dependencies. Its only normalization is NFC, trim, and whitespace collapse; it never deletes Korean particles, alters register, changes tense or fuzzily expands conjugations.

## Outcome policy and Agent 00 gating

| Outcome | Mastery eligible | Recommended integration |
|---|---|---|
| `target_correct` | Yes | Only outcome that can feed an eligible grammar success. |
| `valid_off_target` | No | Show natural/contextual alternative, not wrong Korean; do not automatically award target grammar. |
| `near_miss` | No | Show the exact curated tense/register/honorific/particle/irregular/aspect/perspective diagnosis. Some are grammatical other forms, distinguished by `sentenceStatus`. |
| `incorrect` | No | Not among curated exercise responses. Never assert that the response is universally ungrammatical Korean. |
| `unclassified` | No | Abstain on unknown/stale metadata or under-specified context. No automatic penalty for ambiguity. |

**Do not feed `valid_off_target` or `unclassified` through the old Boolean `ratingForCheck` and silently award `Again`.** Agent 00 must design a deliberate no-auto-grade/feedback/retry policy, preserve existing review history, and run integration tests before enabling `answerFeedback`. `near_miss` gives actionable feedback but also requires an explicit grading decision; it never automatically counts as mastery. Keep the feature disabled until approved.

## Source and reproducibility

```sh
node scripts/port-answer-feedback.mjs
node scripts/validate-answer-feedback.mjs
cd mobile
npm test -- --runInBand src/features/answer-evaluation/evaluator.test.ts
npm run typecheck
```

The compiler reads six generated mobile grammar bundles, the 93-card new grammar gap audit (`docs/research/grammar-answer-ambiguity-audit.json`), the 193-card inherited ledger (`prisma/seed-data/review-qa/flagged-card-fixes.json`), and the corresponding legacy backlog (`docs/research/legacy-answer-ambiguity-backlog.json`). Every alternate must match the actual card and have an explicit editorial classification. Unexpected categories, duplicate normalized responses, ID drift, or missing audit judgement fail generation. Output is sorted and timestamp-free.

Baseline: **721** review clozes; **44** cards with **54** curated alternative strings; **14** auditor-supplied exact near-miss examples plus **2** exact topic/subject diagnostics anchored to both published sentence frames `cc_i_ga_01` and `cc_eun_neun_02`. Those two added diagnostics are not newly accepted alternatives; both remain provisional for educators. All judgement records are explicitly `educatorReview: pending`. Nothing is described as native-speaker approved.

Examples: `cc_e_loc_01` allows directional `로` as `valid_off_target` without mastery of destination `에`; `cc_jiyo_01` allows `죠` as target-equivalent to `지요`; `cc_gap_wa_gwa_01` allows `랑` and `하고` as other noun connector constructions, without automatically awarding `와` mastery; `cc_gap_recipient_ege_hante_01` allows `에게` as the target point includes both person-recipient particles; `cc_gap_informal_haeche_02` identifies `먹어요` as a grammatical polite near miss for casual `먹어`. The ambiguity status of legacy cards derives only from explicit audit flags and whether their prompts were clarified; unresolved context abstains.

## Regression fixtures and limits

The Jest suite exercises NFC/whitespace, all 54 classified alternatives, destination/direction (`cc_e_loc_01`, `cc_e_variant_park`), subject/topic (`cc_i_ga_01`, `cc_eun_neun_02`), register (`cc_gap_informal_haeche_02`, `cc_gap_plain_declarative_01`, `cc_gap_get_intention_03`), honorifics (`cc_gap_honorific_special_verbs_03`, `cc_gap_recipient_kke_01`), tense (`cc_gap_neg_ji_mot_02`, `cc_gap_ge_hada_action_01`), aspect (`cc_gap_resultative_eo_itda_01`), irregulars (`cc_gap_b_irregular_01`, `cc_gap_d_irregular_01`), particle errors (`cc_gap_wa_gwa_03`), curated contractions (`cc_jiyo_01`, `cc_ge_doeda_01`), independently valid forms, unrelated answers, missing IDs, synthetic unresolved ambiguity, and forged/stale contract requests.

This is a deterministic, **exact per-card editorial lexicon**, not an unrestricted Korean morphological parser, native-speaker judge or general equivalence model. Unlisted natural forms may be unrecognized; no global fuzzy threshold or automated near-synonym adoption exists. Editors should assess additional responses and add documented, per-card metadata upstream before recompiling. No source alternatives or grammar cards were modified. Agent 00 is responsible for a native supported-or-excluded decision, sync/history safety, enabling flags, and UI integration.
