# Munpro linguistic QA and human educator review

**Status:** No Korean educator approvals are represented by this system. Mechanical checks, editorial corrections and source-ledger references are not linguistic certification.

## Scope and authority

The validator reads the six generated grammar bundles, the grammar-source ledger, flagged-card dispositions, answer-ambiguity notes, vocabulary and language-topic content, and any new mobile content named practice-*.json or comprehension-*.json. The vocabulary and language-topic authors retain their original sources; generated mobile bundles are audited as currently consumed by the application. If generation is stale, existing port and content validators should be run separately.

Output is a review inventory, structural findings, a prioritized queue and educator packets. This process cannot establish naturalness, pragmatics, the full acceptable-answer space, or review by a native speaker. It never changes authored content, the source ledger or application code. Only requested report files are written.

## Run

```sh
node scripts/validate-linguistic-qa.mjs
node scripts/validate-linguistic-qa.mjs --check-only
node scripts/validate-linguistic-qa.mjs --tier=1
node scripts/validate-linguistic-qa.mjs --tier=2 --out=/tmp/munpro-linguistic-qa
node scripts/validate-linguistic-qa.mjs --tier=all --limit=100
```

The default output directory is `.qa-reports/linguistic/`. Keep generated packets out of Git unless explicitly approved: they can contain educator identities and copyrighted references. Use `--out` outside the repository or clean generated output before commits. The command writes `audit.json` (machine-readable findings, item statuses, source fingerprints and counts), `review-queue.json` (sorted priority queue), `educator-packet.json` (review forms), `educator-packet.md` (printable packet), and `summary.md`. `--check-only` writes nothing and suits CI. Exit code 1 indicates objective blockers; outstanding human reviews or incomplete evidence alone are not equivalent to mechanical failures.

## Review fields (17 required concepts)

Each packet contains a stable source item ID, Korean text, English meaning/context, target construction, canonical answer, accepted alternatives, proposed near misses, current explanation, reference evidence with scope and whether personally checked, exact educator questions, approval status, source path, and fingerprint. The reviewer separately assesses **formation accuracy, semantic accuracy, register appropriateness, pragmatic naturalness, morphological correctness, lexical restrictions, and prompt clarity**. They record an identity and educator role, ISO calendar date, decision and rationale. An accepted alternate can be valid Korean while failing to show the target grammar. Do not conflate the two.

The current review registry is `review-records.json`: absent item IDs explicitly resolve to `not_reviewed`. This intentionally avoids pretending that all 1,000+ generated items were individually signed. The registry must not use an implicitly approved default.

Allowed decisions: `not_reviewed`, `needs_clarification`, `approved`, `rejected`, `revised_pending_recheck`. A human educator, not a program or a content-maintenance agent, makes approval decisions. Editorial status strings in upstream QA manifests do **not** create approvals.

## Example review record (illustration, NOT a real decision)

Replace all placeholder values and the fingerprint exported in the packet; enter the record only after obtaining the educator's actual judgment. This example stays in documentation and is NOT loaded by the validator.

```json
{
  "sourceItemId": "<exact ID from packet>",
  "status": "needs_clarification",
  "sourceFingerprint": "<sha256 from packet>",
  "reviewer": {"identity": "<actual reviewer name or approved ID>", "role": "<actual teaching/linguistics role>", "type": "human_educator"},
  "reviewDate": "2026-11-10",
  "dimensions": {
    "formationAccuracy": "needs_clarification",
    "semanticAccuracy": "needs_clarification",
    "registerAppropriateness": "needs_clarification",
    "pragmaticNaturalness": "needs_clarification",
    "morphologicalCorrectness": "needs_clarification",
    "lexicalRestrictions": "needs_clarification",
    "promptClarity": "needs_clarification"
  },
  "acceptedAlternativesReview": [],
  "nearMissReview": [],
  "evidence": [{
    "reference": "<specific URL or bibliographic citation>",
    "locator": "<entry, section or verified page if known>",
    "claimSupported": "<precise form/usage supported, not whole-sentence certification>",
    "classification": "form_specific",
    "personallyChecked": false,
    "remainingUncertainty": "<what the source does not establish>"
  }],
  "decisionRationale": "<reviewer explanation and exact correction request>",
  "linkedIssueIds": [],
  "history": [{"status": "needs_clarification", "date": "2026-11-10", "actor": "<reviewer>", "notes": "<finding>", "sourceFingerprint": "<sha256>"}]
}
```

For `approved`, the validator requires a real human educator identity/type/role/date, a passing or not-applicable judgment for every dimension, an item-specific reference explicitly checked by the reviewer, a rationale, and an unchanged content fingerprint. It cannot verify that claimed identities or source consultation are genuine. Approval must follow real external review; never prepopulate or infer it. A subsequent substantive text change invalidates the fingerprint and requires `revised_pending_recheck` until a new judgment is recorded.

## Evidence hierarchy and scope

1. National Institute of Korean Language official materials/rulings.
2. National Institute of Korean Language Korean Learners' Dictionary entries.
3. King Sejong Institute teaching material.
4. Reputable published Korean grammar reference with verified locator.
5. Specialist educational sources, individually checked.

Keep the actual reference URL or bibliographic citation; the specific entry/chapter/page *only when actually verified*; exactly what form or claim the source supports; whether the reviewer checked it; and remaining uncertainty. A curriculum overview or general grammar category is not sentence-level evidence. A URL listed in the source ledger is a lead to inspect, not an automatically checked citation. Do not fabricate evidence, page numbers, or reviewer identities. Use paraphrases/short quotations as licensing allows; do not redistribute copyrighted textbook pages.

## Review order

**Tier 1:** 44 currently variant-bearing cloze cards; 193 historically flagged cards; the 31 new structural grammar points and their dependent exercises; particle/register cues with context sensitivity. Overlaps count once in the exported queue. These labels identify review risk, not proven linguistic faults.

**Tier 2:** Level 5–6 formal and literary constructions, passive/causative forms, irregulars, negation, honorific and evidential distinctions.

**Tier 3:** Remaining Level 1–4 content, seven vocabulary decks, language-topic modules and new reading/transfer pilots. Review all tiers before claiming educator-certified coverage.

## Decision and correction protocol

1. Export the packet and give a Korean educator the exact sentence, English context, target, accepted variants, suspected near misses, explanation, source scopes and question.
2. Distinguish grammatical validity, pragmatic naturalness and demonstration of the *target form*. Record each variant's classification and any acceptable off-target answer separately.
3. The reviewer supplies a named/identified role, date, dimension judgments, evidence checked, uncertainty and one of the five allowed decisions. Preserve every earlier decision in the append-only `history` array; keep a single current record per source ID.
4. Log any blocking correctness defect or likely ambiguity with exact item IDs; ask the responsible agent/content owner to make the change. Agent 07 does not edit other agents' source files.
5. After any substantive correction, mark `revised_pending_recheck`, retain previous history and rerun export. Do not carry over prior approvals to a new fingerprint. Only a fresh educator judgment may restore `approved`.
6. Integration lead may wire `node scripts/validate-linguistic-qa.mjs --check-only` into global CI. This agent does not edit CI, merge branches or deploy. Unreviewed is an external release/claim gate, not an automatic CI blocker.

## Collaboration / reporting contract

For another agent's PR, send categorized findings with source paths and exact IDs: **blocking correctness defect**, **likely educator-verification issue**, **nonblocking style suggestion**, or **unverified assumption**. Never edit their branch without request. If a new pilot schema is unrecognized, the validator marks an explicit finding; coordinate the answer-evidence contract with Agents 05 and 06 instead of claiming it was tested. Report review counts by status, queue tier, and unresolved findings in `docs/handoffs/07-linguistic-qa.md`.
