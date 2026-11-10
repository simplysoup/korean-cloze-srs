# Answer acceptance, alternative display and near-miss feedback

**Status: proposed review product contract, 2026-11-10.** Korean educators should approve nuance, register and the cases below. **The existing app does not yet implement the complete feedback system.** Runtime/UI implementation belongs to the other maintainer.

## The design goal

A learner who produces a genuinely grammatical Korean response must never be told it is *bad Korean* just because the author wrote only one answer. However, a grammatically possible response in a **different register, tense, aspect or construction** does not necessarily demonstrate mastery of the particular grammar point being reviewed.

**Separate two judgments:**
1. **Sentence acceptability:** Does the supplied blank produce natural Korean, consistent with meaning and context?
2. **Target construction mastery:** Does it show the specific form, role, register or time relationship that the current point is teaching?

For a future review outcome, use the following classes rather than a flat correct/wrong Boolean:

| Outcome | Meaning | Learner-facing response | Suggested SRS treatment |
|---|---|---|---|
| `correct_primary` | The authored canonical answer | Confirm, then optionally show other valid phrasings | Ordinary correct grade |
| `correct_alternative_target` | Another valid form of the *same grammar relationship* (e.g. 에게 ↔ 한테) | "Also correct"; explain spoken/written nuance | Ordinary correct grade |
| `correct_alternative_other_construction` | Natural answer using another grammatical strategy (e.g. 와 ↔ 랑/하고) | "Your Korean is natural. This lesson was introducing 와/과"; display the target | Do **not** call it wrong; decide whether it deserves *target mastery* rather than silently assuming it does |
| `near_miss` | Correct stem/basic meaning, but the requested tense, register, subject honorification, aspect or formation differs | Focused hint naming the precise difference; offer retry | Separate from total failure; avoid misleading the learner about what was correct |
| `incorrect` | Ungrammatical, changes meaning materially or fails the target beyond a narrow mismatch | Explain the rule, not just "wrong" | Ordinary incorrect grade |
| `needs_review` | Validity cannot be confidently determined; omitted context or a potentially acceptable form | "This may also work; we're checking it" plus canonical answer | **Never silently penalize**; collect educator decisions and turn them into deterministic future rules |

This is a **proposal for SRS policy**, not a live change to grading. The app's current `correctAnswersForCard` function accepts `alternateAnswers`, while `checkAnswers` returns a Boolean and `answerExplanation` has only a handful of special cases. The other maintainer will need to add the structured result, UI and separate target-mastery outcome.

## Immediately curated accepted alternatives

The 31 new grammar points have 93 cards. **12** of those cards now include **18** accepted alternative strings, in the existing `card.alternateAnswers` field. Their acceptance comes from specific sentences rather than universal substitution:

| Canonical sentence | Answer | Accepted variants | Why |
|---|---|---|---|
| `엄마한테 전화해요.` | `한테` | `에게` | Same human recipient, different speech preference |
| `동생에게서 소식을 들었어요.` | `에게서` | `한테서` | Same source person, conversational variant |
| `우유와 빵을 먹었어요.` | `와` | `랑`, `하고` | Alternative noun connectors in this context |
| `가방과 신발을 샀어요.` | `과` | `이랑`, `하고` | Variant must match the noun's final consonant |
| `엄마랑 이야기했어요.` | `랑` | `와`, `하고` | Companion marker choice; register differs |

Authoritative lexical reference: the National Institute of Korean Language's learner dictionary explicitly lists **한테/에게** as synonyms and **와/과, (이)랑, 하고** as alternatives for noun joining and companionship, with usage/colloquial notes. These are **not** instructions to accept every particle interchangeably:
- https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=69713&nation=eng
- https://krdict.korean.go.kr/m/eng/searchResultView?ParaWordNo=69714&nation=eng
- https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=78624&nation=eng
- https://krdict.korean.go.kr/eng/dicSearch/SearchView?ParaWordNo=80333&nation=eng

A teacher should still check the full sentence and whether the surrounding prompt requires a formal or casual style. **Do not mark `께` and `한테` interchangeable for a lesson explicitly about respected recipients.**

The machine-readable first-pass audit is `docs/research/grammar-answer-ambiguity-audit.json`. It tracks **all 93 new cards**, the 12 with accepted variants, and **14** concrete near-miss examples, each awaiting Korean educator review. The other **628 inherited review cards** have received a *mechanical risk scan* in `docs/research/legacy-answer-ambiguity-backlog.json`: **190** are flagged for potentially ambiguous particles, endings/register or already-curated alternatives; **438** were not flagged by these heuristics. **None of the inherited cards has completed a full sentence-by-sentence educator adjudication**, including the 438 not flagged. Do not represent this as full-course linguistic verification.

## Near miss examples to recognize

| Expected | Learner submits | Diagnosis | Helpful response |
|---|---|---|---|
| `먹어` (casual) | `먹어요` | Right verb, wrong *requested* listener register | "The verb is correct; this exercise is practicing casual speech without 요." |
| `먹는다` (plain) | `먹어요` | Grammatical polite version, but not plain narrative | "This lesson asks for the plain declarative -는다 ending." |
| `지 못했어요` | `지 못해요` | Correct inability form, wrong tense for "couldn't" | "The inability is correct; this happened in the past." |
| `게 했어요` | `게 해요` | Correct causative, different tense | "You have -게 하다; the example describes a completed past event." |
| `계세요` | `있어요` | Describes presence but lacks subject honorification | "This lesson is about a respected subject; use 계세요." |
| `서 있어요` | `서고 있어요` | Resulting *state* versus *ongoing change* | "The people are already standing; don't describe them as becoming upright." |
| `들어요` | `듣어요` | Same verb but missing ㄷ→ㄹ irregular | "The stem changes before 어요: 듣다 → 들어요." |

**Important:** Some submitted sentences above are grammatical Korean in a different situation. Do not call them grammatically wrong. Only call them a near miss if the lesson/prompt really establishes the intended register, time frame or meaning. If the prompt does not distinguish them, either **accept both** or revise the prompt to contain the needed cue. Avoid "mind-reading" hidden metadata as a grading requirement.

## Proposed learner experience

1. **Before answering:** display the source sentence, translation or situational context, and the targeted grammar / appropriate register. Do **not** leak the full accepted-answer list before the attempt.
2. **On submit:** normalize Unicode NFC and whitespace, then test curated primary and accepted variants. If not matched, attempt a small number of *rule-based* near-miss comparisons for known morphology, tense, honorific and register features.
3. **If correct:** show "Correct" and, where relevant, a compact **"Also acceptable"** line revealing all context-approved alternatives. Explain why forms differ (e.g. `에게` more written, `한테` more conversational). Mark variants using other constructions distinctly if assessing targeted mastery.
4. **If near miss:** show a precise **"Close—register"**, **"Close—tense"**, **"Close—honorific"** or **"Close—formation"** explanation, preserve the typed attempt for a one-tap retry, and distinguish this from a total semantic mistake.
5. **When uncertain:** do not auto-fail a potentially valid answer based solely on edit distance, a generic LLM verdict or a noun/verb dictionary lookup. Allow a provisional result and route unresolved examples to an educator review queue.
6. **After answering:** display the canonical answer plus alternatives; if a learner supplied a valid but off-target construction, show the contrast and let them optionally retry the targeted form.
7. **Over time:** track frequent accepted variants and near misses to prioritize new examples and source verification. Avoid collecting raw learner text in telemetry without explicit permission and privacy controls.

## Content QA and teacher review process

The content-only validator `node scripts/validate-answer-audit.mjs` cross-checks 93 stable card IDs, canonical answer reconstruction, alternative consistency, collisions with near misses and the curated examples. These are **structural checks, not native-speaker judgments**.

An educator review should record for every proposed alternative:
- Does the resulting **whole sentence** sound natural? Does it preserve meaning?
- Is it valid in the stated register, age/status relationship, tense and aspect?
- Does it demonstrate the intended grammar, or is it a valid different construction?
- Should it be a true accepted variant, a "valid elsewhere" near miss, or a cue to rewrite the question?
- What specific, non-shaming feedback would help the learner transfer the rule?

**Do not modify runtime SRS grading or existing review logs from this content branch.** A separate app integration PR should expose `acceptedAlternatives`, richer results, and post-answer display while preserving the existing stable IDs and review history.
