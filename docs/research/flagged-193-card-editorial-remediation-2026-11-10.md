# Remediation of the 193 flagged inherited grammar cards

**Status (2026-11-10):** All 193 risk flags have an explicit editorial disposition and the card-level corrections are built into all six app content bundles. This is an **editorial remediation**, not a certification of grammatical naturalness by a native-speaking Korean educator. Original flags are retained as historical signals, not an outstanding code defect count.

## Scope and results

The pre-existing heuristic scan found 193 distinct flagged review cards in the inherited 628-card catalogue. Flags overlapped (for example location particles with accepted directional alternatives). They were never proof of 193 broken sentences. Content has been reviewed without introducing a new grammar point, review card ID, lesson or database change.

| Result | Count | What changed |
|---|---:|---|
| Flagged card editorial dispositions | 193/193 | Before/after and reason for every card |
| Context and register cues added | 187 | A specific grammatical role rather than a bare English translation |
| Fixed-phrase false positives | 6 | Kept otherwise correct comparative `보다` / distributive `마다` clozes |
| Unbounded cloze spans fixed | 6 | Learners must form the target part, not fill a whole Korean sentence with no anchor |
| Additional accepted full-sentence variants | 13 strings on 13 cards | Expanded/contracted verb and auxiliary spelling only where it reconstructs the entire sentence |
| Inherited review cards with accepted variants | 32 | 19 existing, 13 new; each alternative has a nuance and target-mastery classification |
| Outstanding identified editorial remediation | 0 | Pending *educator approval* is different: 193 items remain in that queue |

The machine-readable ledger at `prisma/seed-data/review-qa/flagged-card-fixes.json` stores every flagged card ID, owning grammar point, source and revised cloze, explanation, accepted variant disposition, and explicit `educatorReview: pending`. `docs/research/legacy-answer-ambiguity-backlog.json` retains the original flags and records the editor's action.

### Why a prompt sometimes needs a grammatical role cue

- **Topic vs subject:** `은/는` and `이/가` can both yield legitimate sentences, but their information structure differs. English alone rarely disambiguates this; cues identify topic introduction vs focused subject. **Do not grant automatic topic mastery for a grammatical subject-marker response.**
- **Destination vs direction:** `학교에 가요` and `학교로 가요` can both work, but `에` identifies destination and `로` commonly brings directional meaning. Existing `-로/(으)로` alternatives remain accepted as natural sentences, **classified separately from exact target mastery**.
- **Place of action:** `에서` indicates where the action occurs; `에` has different place/time functions. Do not auto-substitute them.
- **Tense/register/aspect:** English sentences such as “I work” often fit several Korean forms; prompts now clarify polite vs plain vs formal, ongoing vs completed, reported vs direct, honorific subject, tentative vs certain and other actual lesson distinctions.
- **Fixed expressions:** `보다` (comparison) and `마다` (every) were falsely flagged as tense/register questions by the mechanical scanner. Their six cards are retained intact, with a documented dismissal.

### Repaired cloze boundaries

| Review ID | Previously blanked | Revised blank and target answer |
|---|---|---|
| `cc_t2l5_eulgyeoreul_01` | Entire `생각할 겨를도 없었어요` | `생각___ 없었어요` → `할 겨를도` |
| `cc_t2l5_eulgyeoreul_02` | Entire `인사할 겨를이 없었어요` | `인사___ 없었어요` → `할 겨를이` |
| `cc_t2l5_eodo_soyongeopda_01` | Entire `후회해도 소용없어요` | `후회___ 소용없어요` → `해도` |
| `cc_t2l6_euryeoya_01` | Entire `믿으려야 믿을 수 없어요` | `믿___ 믿을 수 없어요` → `으려야` |
| `cc_t2l6_euryeoya_02` | Entire `참으려야 참을 수 없어요` | `참___ 참을 수 없어요` → `으려야` |
| `cc_t2l6_euryeoya_03` | Entire `막으려야 막을 수 없어요` | `막___ 막을 수 없어요` → `으려야` |

Each sentence and card ID is unchanged. Only the blank span/answer changed, so cards still assess their original grammar but offer a bounded production challenge.

### New accepted alternatives

The extra 13 accepted responses are *context-limited*:
- `cc_asseoyo_03`: `보았어요` alongside `봤어요`.
- `cc_eoboda_01`, `cc_eoboda_03`: `보았어요` alongside `봤어요`.
- `cc_ge_doeda_01..03`: `되었어요` alongside `됐어요`.
- `cc_eoduda_01..03`: `두었어요` alongside `뒀어요`.
- `cc_t2l3_eonota_01..03`: `닫아 놨어요`, `찾아 놨어요`, `만들어 놓았어요` alongside each card's existing `놓았어요/놨어요` version.
- `cc_t2l4_nyago_hada_02`: `되었냐고 물었어요` alongside `됐냐고 물었어요`.

These are not universal rewrite rules. Every variant must reconstruct a natural complete sentence in its actual context, and the native editor is asked to verify that fact.

## Source evidence and limitations

- NIKL directly confirms `-죠` as a contracted form of `-지요`: https://www.korean.go.kr/front/onlineQna/onlineQnaView.do?mn_id=216&pageIndex=1&qna_seq=319772
- NIKL directly confirms `되었어요/됐어요` as a standard full/contracted pair: https://www.korean.go.kr/front/onlineQna/onlineQnaView.do?mn_id=216&qna_seq=312276
- NIKL discusses `-게 되었어요/-게 됐어요` in context and the interpretation of `-었-`: https://www.korean.go.kr/front/onlineQna/onlineQnaView.do?mn_id=216&qna_seq=310857
- Earlier source-led curriculum research and NIKL dictionary links support contextual *categories*, not every English hint or authored example. All new sentence-level decisions retain `educatorReview: pending`. The 435 inherited cards not flagged by these heuristics are **not automatically approved**.

## Programmatic safety and release gates

Changes are port-time authored content, not app runtime changes:

```sh
bun scripts/port-content.ts
node scripts/validate-grammar-catalogue.ts
node scripts/validate-content.mjs
node scripts/validate-answer-audit.mjs
node scripts/validate-topik2-contrast.mjs
node scripts/validate-flagged-card-fixes.mjs
cd mobile
npm run typecheck
npm test -- --ci
npm run export
```

The pure `scripts/flagged-card-overrides.mjs` function matches the exact prior content recorded in the manifest (or its own previous result); unexpected upstream edits fail loudly instead of being silently overwritten. The new validator checks 193 IDs, before/after cloze reconstruction, 187 context changes, six false positives, six new cloze boundaries, 13 new variants, all six generated bundles, 229 point identities and 721 review-card identities. CI also tests content reproducibility.

## Educator adjudication and integration handoff

**Educator:** Review complete Korean sentences (not only blank strings), including register, honorifics, direction vs destination, contraction preference and nuance. Confirm each alternative's naturalness and whether it demonstrates the *target construction*. Update per-row human-review status only after actual review. Two potentially subtle legacy areas deserving special attention are `퇴근 다음에` (vs `퇴근 후에`) and uncontracted `마시어요` in everyday speech.

**Integration maintainer:** The current app still accepts `alternateAnswers` through its binary correct/wrong path. It does **not** yet show all valid alternatives after an answer, distinguish `same_target_construction` from `natural_other_construction` for mastery, or give close-answer hints on tense/register/honorific/aspect mistakes. These remain in `docs/planning/answer-evaluation-and-feedback-spec.md`; do not silently claim the runtime now implements them.

**Merge order:** #2 → #3 → #4 → #5 → #6 → #7. No branch was merged or deployed by this work.
