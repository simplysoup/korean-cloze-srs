# Core Korean language-system gap fill — draft, 2026-11-10

## Goal and content ownership

This extension addresses the highest-priority gaps from `docs/research/korean-reference-led-curriculum.md` without turning vocabulary into fake grammar cards. It builds on the six existing TOPIK practice decks from PR #2 and the source ledger from PR #3.

| Content layer | Source and generated app copy | What is implemented | What still needs app work |
|---|---|---|---|
| **Grammar SRS** | `prisma/seed-data/grammar-expansion/level-1.json` through `level-4.json`; existing six `mobile/src/content/topik*.json` | **31 new grammar points**, each with 2 original worked examples and 3 independent clozes, clear meaning, formation, worked reasoning and a concrete trap; inserted by stable preceding point ID | Korean educator review, on-device migration and learn/review smoke tests |
| **Vocabulary content** | `prisma/seed-data/vocabulary/foundations.json` → `mobile/src/content/vocabulary-foundations.json` | **7 independent starter vocabulary decks with 145 entries**; numeric forms, classifiers, weekdays/months, time, prices/age, question/indefinite words; phrases and usage notes | **No independent vocabulary-SRS tables, review queue, library registration or UI yet**. Never report these 145 as accessible in the app |
| **Language system topics** | `prisma/seed-data/language-topics/foundations.json` → `mobile/src/content/language-topics.json` | Four authored modules, with 14 explanatory sections and **12 knowledge checks**: pronunciation/liaison/assimilation, choosing registers, counting in sentences, active/passive/causative/evidence | **No topic UI, scoring, actual audio, or reading/listening assessment**; content files only |
| **Research review** | `docs/research/korean-grammar-source-ledger.json`, `korean-reference-gap-backlog.json` | 229 grammar IDs tracked and all 24 originally flagged pathways classified by current status | Precise Korean reference chapter/entry verification and native-teacher signoff |

### Resulting grammar counts

| Deck | Points | Worked examples | SRS clozes | Global positions |
|---|---:|---:|---:|---|
| TOPIK I Level 1 | 65 | 143 | 229 | 1–65 |
| TOPIK I Level 2 | 59 | 118 | 177 | 66–124 |
| TOPIK II Level 3 | 32 | 64 | 96 | 125–156 |
| TOPIK II Level 4 | 25 | 50 | 75 | 157–181 |
| TOPIK II Level 5 | 24 | 48 | 72 | 182–205 |
| TOPIK II Level 6 | 24 | 48 | 72 | 206–229 |
| **Total** | **229** | **471** | **721** | **1–229** |

The original **198 grammar-point IDs and associated example/card IDs are unchanged**. Old cards receive recalculated introduction positions in generated JSON. New points occupy the same existing lessons as their prerequisite/nearby patterns; the course still has 46 grammar lessons. This avoids resetting review states but reorders some new/old items; test the reseed against a real existing-user SQLite database before release.

## New grammar systems

**Early Level 1 (15):** ㅂ/ㄷ/ㅅ/르/으/ㅎ/ㄹ conjugation changes; casual 해체; -지 못하다; recipient 에게/한테 and source 에게서/한테서; noun connectors 와/과 and (이)랑; respectful subject 께서 and recipient 께.

**Level 2 (7):** plain narrative -ㄴ다/-는다, special honorific verbs (계시다, 드시다, 주무시다), -겠- intention, -겠- inference, benefactive -아/어 주다, result state -아/어 있다, and indefinite + negative predicate as an actual polarity combination.

**Level 3 (8):** passive verb pairs, passive/spontaneous -아/어지다, lexical causatives, -게 하다 causing an action and causing a state, third-person -고 싶어 하다, firsthand -더라고요, and indirect inference -나 보다/-(으)ㄴ가 보다.

**Level 4 (1):** -(으)ㅁ written nominalization; contrasts with -기 and -는 것.

Some irregular verbs, passive verb pairs, special honorific verbs and noun counters necessarily introduce lexical examples. What makes each of these a *grammar point* is the productive structure or role difference being reviewed, not an isolated English translation. Counter names/numeric words remain vocabulary entries only.

## Reproducible authoring and validation

1. Edit authoritative files: `prisma/seed-data/grammar-expansion/level-*.json`, `prisma/seed-data/vocabulary/foundations.json`, or `prisma/seed-data/language-topics/foundations.json`.
2. Run:
   ```sh
   bun scripts/port-content.ts
   node scripts/port-vocabulary.mjs
   node scripts/port-language-topics.mjs
   bun scripts/validate-grammar-catalogue.ts
   node scripts/validate-content.mjs
   node scripts/validate-vocabulary.mjs
   node scripts/validate-language-topics.mjs
   ```
3. From `mobile/`, run `npm ci && npm run typecheck && npm test -- --ci && npx expo export --platform web`.
4. CI regenerates content, fails on a Git difference, and runs all validators before app tests/export.
5. The pure assembly routine `scripts/curriculum-overlay.mjs` adds points *by existing grammar ID*, catches missing anchors/duplicates, and recalculates introduction positions including multigrammar cards.

Newly authored sentences are **original** rather than lifted from commercial texts. Coverage references are named in manifests, but **item-level claims and examples are not yet verified against full textbook chapters or individual NIKL form entries**; the source ledger explicitly tracks that distinction.

## Source hierarchy and review cautions

- **NIKL Korean Teaching-Learning Center**: https://klp.korean.go.kr/kcenter/search/dgrammar.do — grammar uses, contrast senses and formation (especially -겠- intention vs inference, -게 하다 action vs state, -고 있다 progression vs resulting state). Public portal index is evidence of coverage, not a blanket endorsement of each example.
- **Darakwon, Korean Grammar in Use – Beginning** (publisher TOC): https://www.darakwon.co.kr/books/detailProduct.asp?p_id=3291&pc_id_2=11&pc_id_3=76 — negative expressions, noun particles and irregulars, basic speech and number/date/time foundation. Page order is *not* an established optimum.
- **NIKL Standard Pronunciation**: https://www.korean.go.kr/front/onlineQna/onlineQnaView.do?mn_id=&pageIndex=1&qna_seq=311009 and https://www.korean.go.kr/front/onlineQna/onlineQnaView.do?mn_id=&pageIndex=1&qna_seq=326779 — specific examples for liaison, nasal assimilation and aspiration.

### Remaining blockers, not claims of completeness

- Independently verify Korean naturalness, register, pattern restrictions, irregular exceptions, idiomatic translation and ambiguous cloze answers with Korean educators before publication.
- Build **independent vocabulary SRS** with separate review histories, statistics and mastery (never reuse grammar-point IDs or give grammar credit for `한 개`/calendar words).
- Build a topic screen and record audio from permitted sources/native speakers; the pronunciation examples are text **without synthesized or recorded listening practice**.
- Add graded comprehension, dialogue, writing and listening assessment; do not equate SRS mastery with TOPIK score or overall language fluency.
- Expand genuinely important grammar beyond this priority set based on references, frequency, and educator findings; the six-deck labels are pedagogical placements, not official per-score Korean grammar lists.

This is a source-reviewed-by-model **draft**, not a fully vetted or exhaustive Korean curriculum.
