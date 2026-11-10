# Agent 07 — Linguistic QA / Educator Readiness Handoff

## Pull request and ownership

- Draft PR: https://github.com/simplysoup/korean-cloze-srs/pull/12
- Branch: `qa/curriculum-educator-readiness`
- Base: `integration/curriculum-v1` (original source baseline `c17cfab84f978056e55665b40fbeaec92ca044ce`)
- Do not merge, deploy, or modify another agent's authored curriculum. Only Agent 00 may integrate and wire global CI.
- Added only: `scripts/validate-linguistic-qa.mjs`, `docs/research/educator-review/README.md`, `docs/research/educator-review/review-records.json`, and this handoff.

## Deliverables

The QA script inventories current grammar review cards/points/examples, foundational vocabulary, language-topic sections/checks and any new `mobile/src/content/practice-*.json` / `comprehension-*.json` pilot files.

It flags missing IDs, duplicate IDs, missing explanations, invalid cloze reconstructions, duplicates among accepted answers, ledger omissions/classifications, grammar ID drift, context-sensitive prompts, narrow evidence scope, explicit tense/register metadata contradictions, invalid choice keys, ungrounded comprehension answers, and incomplete human sign-off. It cannot evaluate Korean naturalness algorithmically.

Review statuses are `not_reviewed`, `needs_clarification`, `approved`, `rejected`, and `revised_pending_recheck`. The decision register defaults all items to `not_reviewed`; **zero human educator approvals** are asserted.

## Commands

```sh
# CI-compatible, no output writes; exit 1 for mechanical blockers
node scripts/validate-linguistic-qa.mjs --check-only

# Full JSON audit and educator packet export
node scripts/validate-linguistic-qa.mjs --out=/tmp/munpro-linguistic-qa

# Prioritize first educator session
node scripts/validate-linguistic-qa.mjs --tier=1 --out=/tmp/munpro-educator-tier1

# Inspect subset before sharing
node scripts/validate-linguistic-qa.mjs --tier=1 --limit=25
```

Generated files (in `--out`, otherwise `.qa-reports/linguistic/`):

- `audit.json`: machine-readable findings and all item statuses/fingerprints
- `review-queue.json`: complete ordered queue
- `educator-packet.json`: structured forms with Korean, English, target, canonical answer, alternative assessments, near misses, evidence, and questions
- `educator-packet.md`: readable packet for educators
- `summary.md`: counts and highest-risk examples

These outputs are intentionally generated **on demand**, not committed into Git. Avoid uploading personal reviewer information or third-party textbook content without authorization.

## Baseline results

Verified through script execution with the repository's full baseline JSON data in an isolated JS filesystem harness, including mechanical negative tests (details below). No actual Korean educator has reviewed these exports.

| Review inventory | Count |
| --- | ---: |
| Grammar points | 229 |
| Grammar clozes | 721 |
| Worked examples | 471 |
| Vocabulary entries | 145 |
| Language-topic sections | 14 |
| Language-topic checks | 12 |
| **Total reviewable items** | **1,592** |
| Tier 1 | 379 |
| Tier 2 | 287 |
| Tier 3 | 926 |
| `not_reviewed` | 1,592 |
| Human-approved | **0** |
| Mechanical blockers | **0** |
| Educator-review findings (not necessarily defective sentences) | **466** |

Findings grouped by type:

| Open review finding | Count |
| --- | ---: |
| No item-level grammar-form citation in ledger | 227 |
| Context-sensitive cues still need educator confirmation | 182 |
| Accepted-alternative cases require sentence- and mastery-level verification | 44 |
| Natural-but-off-target accepted variants require differentiation | 11 |
| Reference evidence covers components only, not complete sentence | 2 |
| **Total** | **466** |

The 193 historically flagged cards were editorially disposed in the source, but **all still require educator sign-off**; the 193 should not be double-counted as confirmed linguistic defects. The 31 newly expanded grammar points and their exercises are included in Tier 1, as are context-sensitive prompts. Grammar cards may appear in multiple risk categories but only once in the review queue.

### Highest-risk targeted educator questions

The 11 explicit natural-but-off-target variants are associated with:
`cc_e_loc_01`, `cc_e_loc_03`, `cc_e_variant_park`, `cc_e_variant_store`, `cc_hue_01`, `cc_hue_02`, `cc_hue_03`, `cc_hago_01`, `cc_hago_02`, `cc_hago_03`, `cc_and_variant`.

Ask educators whether each variant is a natural full Korean utterance **and independently** whether it demonstrates the named target construction. Cases such as destination `에` versus direction `로` must not be collapsed into a single undifferentiated mastery result. Other Tier 1 focus areas include particle role, speech register, modality, and contextual hints. Some are already editorially clarified and are review candidates, not automatically broken cards.

## Testing performed

- Executed the actual branch script against the 13 relevant repository data/script files using an isolated V8 JS filesystem harness (with a fingerprint stub only for test execution): **1,592 items, 0 blockers, exit 0**.
- Injected an invalid cloze: correctly blocked.
- Injected duplicate grammar-card ID: correctly blocked.
- Injected duplicate accepted answer: correctly blocked.
- Injected an unsigned, stale, artificial approval: correctly blocked for sign-off, evidence, rationale, fingerprint.
- Injected comprehension question with choices but no correct answer: correctly blocked.
- `--check-only`: exit 0 with **zero file writes**.
- Actual Node CLI execution in a native checkout and CI workflow run are **not yet verified**; Agent 00 should run the command in integration CI before merge.

At this baseline there are no `practice-*.json` or `comprehension-*.json` mobile pilot files. When Agents 05 and 06 land these, validate the answer-key and passage-evidence shapes. The schema-neutral scanner is conservative; update this agent-owned script if their contracted schema uses different names. Do not claim those new pilots have passed before running them.

## Educator decision/rejection workflow

1. Export a Tier 1 packet; present full sentence, context, target, canonical answer, variants, near misses, explanation, verified source scope and exact questions to a real Korean educator.
2. Human reviewer supplies identity/role, ISO date, separate judgments for formation, meaning, register, pragmatics, morphology, lexical restrictions and prompt clarity, plus alternative-vs-near-miss classifications.
3. Record the current decision in `docs/research/educator-review/review-records.json` with the packet's source fingerprint, item-specific personally checked citation, uncertainty, rationale and an append-only history event. Never backfill approvals from editor or machine findings.
4. For a `rejected` or `needs_clarification` item, create a correction request with the exact ID and send it to the responsible authoring agent. Agent 07 reports defects; it does not change that agent's source.
5. After substantive source changes, preserve the original decision trail, mark `revised_pending_recheck`, re-export packet/fingerprint, and obtain a fresh human signoff. Stale approval fingerprints are structural blockers.
6. Only human-approved, unchanged items can be called educator-reviewed; a passed CI result means **mechanical health only**.

For PR reviews, categorize feedback as blocking correctness, likely educator verification, nonblocking style, or unverified assumption. Cite source paths and IDs. Do not make unsolicited changes to other agents' branches.

## Requests to integration lead / follow-up

- Agent 00: execute `node scripts/validate-linguistic-qa.mjs --check-only` in the native checkout and wire it into CI after accepting the PR. Preserve all existing grammar IDs and SRS history.
- Agents 05–06: send stable item IDs, correct-answer schema, passage/answer-evidence anchors and sample output for their new pilot JSON content; request QA after files land.
- External Korean educator(s): supply real judgments; nothing in this PR constitutes that review.
- Content owners: correct individually reported issues and trigger recheck, never silently rewrite an educator decision.

No authored Korean, existing cloze cards, source ledger, global CI, app runtime, other agent paths, or release branches were modified by Agent 07.
