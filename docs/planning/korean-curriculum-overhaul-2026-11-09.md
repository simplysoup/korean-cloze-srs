# Munpro Korean curriculum overhaul — 2026-11-09

## Objective

Make grammar progress from **what a learner can communicate** rather than from a list of unrelated forms. Teach only what the learner needs for that stage, with natural, concise Korean, accurate English meaning, and review cards that require transfer to a new example.

The sequence is influenced by the King Sejong Institute's beginner curriculum focus on introductions, routines, places, times, social interaction, and increasingly complex conversations. This is an **editorially designed curriculum**, **not an official TOPIK grammar list** and not a substitute for independent Korean-educator review.

Sources:
- Online King Sejong Institute beginner curriculum: https://mngr.iksi.or.kr/lms/main/curriculum.do
- Sejong course description: https://www.iksi.or.kr/lms/crse/crseApply.do?crseNo=121519
- King Sejong Institute beginner progression: https://www.ksif.or.kr/com/cmm/EgovContentView.do?menuNo=31101310

## Level 1: redesigned learning order

Level 1 preserves the 48 existing grammar-point IDs, 109 worked examples and 178 review cards (including `additions.ts`), and the original 11-lesson count. The grammar-point sequence and existing card `introducedAtPosition` values **change**: do not assume old position numbers still identify the same grammar.

| Lesson | Theme | Positions | Included material |
|---|---|---|---|
| 1 | Introducing Yourself | 1–5 | 이에요/예요, 은/는, 이것, 그것, 저것 |
| 2 | People, Possession and Existence | 6–11 | 의, 도, 이다, 이/가, 있다/있어요, 없다/없어요 |
| 3 | Everyday Actions and Negation | 12–16 | -아요/어요, 을/를, 안, -지 않다, 못 |
| 4 | Places, Movement and Position | 17–22 | 여기, 거기, 저기, 에 (place), 에서, spatial position nouns |
| 5 | Time, Starting and Finishing | 23–27 | 에 (time), 부터, 까지, 전에, 후에 |
| 6 | Talking About the Past and Describing Things | 28–31 | past tense, adjective modifiers, 만, 하고 |
| 7 | Polite Requests, Needs and Wants | 32–35 | -(으)세요, -아/어 주세요, -아/어야 하다, -고 싶다 |
| 8 | Ability and Giving Reasons | 36–39 | -(으)ㄹ 수 있다, -(으)니까, -아/어서, 그래서 |
| 9 | Conditions and Contrast | 40–42 | -(으)면, -지만, 하지만 |
| 10 | Connecting Actions and Making Plans | 43–45 | -고, -(으)ㄹ게요, -(으)ㄹ 거예요 |
| 11 | Reactions, Confirmation and Uncertainty | 46–48 | -네요, -지요/죠, -(으)ㄴ 것 같다 |

The revision fixes the worst prerequisite problems, including putting polite verb conjugation ahead of object-particle production cards, removing future spatial/time constructions from early examples, correcting invalid alternate answers such as `이거은`, and explicitly describing ㄹ-final conjugation rules. All existing IDs are retained, including IDs of examples and cards.

**Known limitation:** a sequence that is fully strict at the morpheme level is hard to combine with natural conversation. Early present-tense examples sometimes omit an obvious object to avoid using 을/를 before it is formally taught. A future version should treat simple lexical chunks as allowable *preview vocabulary* and track grammatical prerequisites separately.

## Level 2: learner-first lesson order

Level 2 starts at lesson 12 and position 49. The separately supplied `munpro-topik1-level2-overhaul.zip` contains 12 TS source files (lessons 12–22 plus `index.ts`) and **51 points / 102 worked examples / 153 cards**.

| Lesson | Theme | Positions |
|---|---|---|
| 12 | Plans, Invitations and Purposes | 49–53 |
| 13 | Formal Speech and Everyday Rules | 54–58 |
| 14 | Before, After and When | 59–63 |
| 15 | Ongoing Actions and Choices | 64–67 |
| 16 | Describing People and Things | 68–71 |
| 17 | Trying Things and Talking About Experience | 72–76 |
| 18 | Giving Reasons and Background | 77–81 |
| 19 | Changes and Prepared Results | 82–85 |
| 20 | Comparisons and Everyday Quantities | 86–90 |
| 21 | Unexpected Results and Concessions | 91–95 |
| 22 | Reporting What People Say (**optional bridge**) | 96–99 |

Each point uses **2 worked examples plus 3 non-identical practice sentences**. The previous practice-card duplication of worked example #2 has been replaced for every point. IDs remain stable compared with the earlier, unintegrated Level 2 draft; the lesson and global position values have changed for Level 2's first ten points because of the swap of lessons 12 and 13.

**Level classification caveat:** reported speech, some change/result auxiliaries, and complex clause combinations sit near or beyond the usual TOPIK I beginner boundary. Lesson 22 is intentionally `optional-bridge` enrichment, not a claim that all the material is necessary for TOPIK I. TOPIK grammar lists are not perfectly uniform across teaching resources.

## Remaining gaps that matter to genuine beginners

The **next content expansion** should prioritize highly useful missing basic constructions *before* adding further intermediate patterns:

1. **아니다 / 아니에요**: negative noun identification ("I am not a student"), contrasted explicitly with 안 and -지 않다. This is especially important immediately after 이에요/예요.
2. **Question words and everyday questions**: 뭐/무엇, 누구, 어디, 언제, 왜, 어떻게, 얼마, 몇; distinguish expression vocabulary from grammatical question formation.
3. **Numbers, dates and counters**: native and Sino-Korean numbers in context (hours vs minutes, age, prices, dates), plus 개/명/마리. Counting is more useful for daily life than some of the last Level 1 grammar points.
4. **Honorifics and social setting**: honorific -(으)시-, 계시다, 드시다, polite address and request contexts, with clear register cues.
5. **Receiving and giving**: 한테/에게 and 주다/받다, social exchange and direction.

These are *not yet authored into the current 48-point Level 1 deck*. Adding them would change the enforced 48-point count, shift all later positions, and require a content-version and progress-migration plan. Avoid silently adding them into a seeded product without managing existing users' positions. These are recommended next-scope items rather than a claim of complete beginner coverage.

## Learning-experience recommendations

- **Show the grammatical target and its input form**: e.g. `먹다 → ___` together with a natural sentence. An English translation alone may permit many Korean answers.
- **Use different examples in Learn and Review**: an unseen review sentence checks generalization rather than memory of the worked example.
- **Provide a one-line reason for correctness** after submission: stem class / irregular / particle choice and its discourse meaning.
- **Label register and who is speaking** when important: a form like -ㄹ게요 refers to the speaker's commitment, and formal -ㅂ니다 has a different social setting from -아요/어요.
- **Permit only context-valid alternate answers**; an alternate must be inserted into `sentenceWithBlank` and validated against the *whole* resulting sentence. `이거` is not a valid replacement for `이것` in `___은`.
- **Test meaning as well as form**: minimal pairs (은/는 vs 이/가, 에 vs 에서, 안 vs 못, -아/어서 vs -(으)니까) need grounded scenarios. Distinctive English hints can disambiguate where the cloze otherwise has multiple valid Korean responses.
- **Keep the density learner-friendly**: no more than 4–6 grammar points per daily lesson, and interleave comprehensible listening and short writing with SRS production. More grammar points alone won't create proficiency.

## Validation and safe integration

**Level 1** is committed to GitHub branch `content/learner-first-curriculum-2026-11-09`. **Level 2** is supplied as a separate ZIP; it is not included in that Git branch. The ZIP's `prisma/seed-data/topik1-level2/` hierarchy is ready to copy into a checkout.

Local Level 2 verification completed:
- TypeScript `tsc --noEmit --strict` against repository `LessonSeed` types.
- Every grammar point has at least two worked examples and three review cards.
- Every `___` replacement reconstructs `fullSentence` exactly.
- All grammar-point, card and example IDs unique across Level 2.
- Positions continuous 49–99, and 51 distinct review sentences from worked examples.

Level 1 was inspected via the connected GitHub source files: 11 lessons, 48 unique grammar points, 98 original worked examples, 154 original review cards, plus 11 worked examples and 24 review cards in additions; all 252 base clozes reconstruct correctly. The GitHub branch has **not been end-to-end executed in the running Expo app** from this environment.

Before rollout, the main agent must:
1. Merge/copy both content sources, run `bun scripts/port-content.ts` and `node scripts/validate-content.mjs` (or equivalent tooling for both levels).
2. Update JSON seeds, descriptions/provenance and any hard-coded lesson/position ordering references. Add the Level 2 port and registration workflow.
3. Reconcile SRS/gating for **existing user progress**. IDs remain stable but positions do not; position-based checkpoints must be remapped or intentionally reset after user notice.
4. Run lesson-order, card-reconstruction and ID checks on *ported JSON*, then UI review and independent Korean teacher/native-editor review before public deployment.

The main agent should keep the default branch unchanged until these checks and any necessary migrations pass.
