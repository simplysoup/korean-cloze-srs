# Reference-led Korean curriculum design (research baseline, 2026-11-10)

**Status:** A documented research and editorial method; **not** an educator-approved or comprehensive language course. This document accompanies the existing 198-point Munpro grammar catalogue and 96-point TOPIK II draft. It does not change study order, cards, or user progress.

## The source hierarchy

| Source | Verified public entry | We can use it to decide | What it does *not* establish |
|---|---|---|---|
| **National Institute of Korean Language (NIKL), _Standard Curriculum for Korean Language_ (2020, English edition released 2021)** | https://www.korean.go.kr/front/etcData/etcDataView.do?etc_seq=660&mn_id=208&pageIndex=1 | The six-level outcome framework across topics, functions, contexts, strategies, texts and language knowledge; listening, speaking, reading and writing | Exact SRS item ordering, mandated TOPIK grammar-by-score lists |
| **King Sejong Institute, online curriculum and Sejong Korean 2022 books** | https://www.iksi.or.kr/lms/main/curriculum.do ; https://nuri.iksi.or.kr/front/cms/contents/layout2/learningsejong/detail.do?csCmsMastrSeq=15203&menuSn=649 | A tested *staged teaching model*: pre-Hangul introductory course, beginner, intermediate and advanced; communicative lessons including culture and skills; useful lesson-level sequencing to inspect | That Munpro's TOPIK Level 1–6 deck labels exactly match a Sejong book/lesson |
| **NIKL Korean Teaching-Learning Center, grammar/expression search (문법·표현 내용 검색)** | https://klp.korean.go.kr/kcenter/search/dgrammar.do ; overview https://klp.korean.go.kr/kcenter/faq.do | **Best directly accessible grammar-editor reference**: 92 beginner and 113 intermediate searchable entries, form/meaning, usage constraints, similar grammar and example-based teaching; distinguish separate meanings of identical surface forms | Complete advanced 5–6 coverage, automatic validation of a Munpro sentence, copyright permission to republish its lessons |
| **Darakwon, _Korean Grammar in Use – Beginning_ (publisher contents)** | https://www.darakwon.co.kr/books/detailproduct.asp?p_id=3291&pc_id_2=11&pc_id_3=76 | A **published grammar coverage benchmark**. Its TOC explicitly includes numbers/dates/time, negative forms, recipient particles, irregular conjugations, modifiers, quotations, honorifics and sentence structure; useful missing-content list | A pedagogically proven *single optimal order* (its 24-unit grammar index is organized by function), full chapter explanations (not inspected) |
| **University of Hawaiʻi Press, KLEAR _Integrated Korean_ series** | https://uhpress.hawaii.edu/klear/ | Integration of all four skills, learner-centered activities, usage and cultural context; model for applied checkpoints alongside SRS | Exact form-level placement from a TOC alone |
| **NIKL Korean-English Learners' Dictionary** | https://krdict.korean.go.kr/m/eng/help ; grammar-search support https://krdict.korean.go.kr/eng/openApi/openApiInfo | Check word senses, part of speech, lexical restrictions and examples; dictionary explicitly distinguishes words, phrases and grammar expressions | A ready-made grammar dependency graph or free right to copy example sentences |
| **NIIED official TOPIK overview** | https://www.niied.go.kr/web/NIIED/contents/niiedEng/eng_topikOverview | Assessment constraints: TOPIK I reading/listening; TOPIK II reading/listening/writing; levels 3–6 awarded by score on TOPIK II | An official 24-item-per-level grammar catalogue or mastery guarantee |

**Confidence tags:**
- `published_index`: publisher/official source visibly lists the specific form or named instructional system. It verifies *coverage*, **not** an ideal lesson position.
- `official_reference`: an official search index explicitly lists and describes that grammar expression/meaning.
- `framework`: source supports outcomes, level bands or whole-skill design, **not** a claim that an individual grammar point appears at a specific level.
- `pending_primary_review`: a full chapter/teacher guide or form-specific entry has **not** yet been inspected; do not cite it as confirmation.
- `pedagogical_inference`: our proposed design choice, not a quotation or official placement.
- `needs_educator_review`: uncertain nuance, frequency, correctness or placement requiring human review.

The machine-readable starting ledger is `docs/research/korean-grammar-source-ledger.json`. Entries without a verified item-level source are **open research**, not silently assigned to a textbook.

## What the comparisons actually tell us

### 1. Teach constructions *as systems*, not as 198 isolated facts

NIKL's official teacher portal distinguishes **-겠-1 (intention)** from **-겠-2 (inference)**; **-고 있다1 (progressive)** from **-고 있다2 (persisting resultant state)**; **-게 하다1 (causing/allowing an action)** from **-게 하다2 (causing a state)**. Our SRS should allow distinct *uses* of one surface form to have separate explanations/contrast checks, without multiplying vocabulary cards.

For example, add the missing `-겠-` system as a pair, contrasting `-(으)ㄹ 거예요` (forecast/plan) and `-(으)ㄹ게요` (speaker commitment). Verify contexts through official grammar-entry descriptions before writing a detailed lesson.

### 2. A book's contents are a coverage check, not necessarily the best sequence

_Darakwon Beginning_ places irregular conjugations in a dedicated final unit while also teaching tenses, requests and conditionals earlier. **Editorial inference:** teach a short conjugation primer before the first productive ending and introduce irregular families again when they become useful; retain a later reference chapter for consolidation. Never assume page order equals a prerequisite graph.

The publisher also explicitly includes **numbers/dates/time** as pre-unit foundations; `에게/한테`, `와/과/(이)랑` and `-지 못하다` with early particles/negation; and `V-아/어 있다` versus `V-고 있다` as separate state/progressive expressions. These are significant gaps or incomplete contrasts in the 198-point draft, **not** mere nouns/verbs to leave entirely to a lexical deck.

### 3. Anchor the course to real communicative capabilities

Sejong's published pathway begins with Hangul and extends through staged beginner/intermediate/advanced programs; KLEAR describes a progression combining skill acquisition with skill use. NIKL's Standard Curriculum specifies outcomes across language skills and topics. A credible course therefore needs:
1. **Form readiness:** Hangul/받침, core conjugation, question and number systems;
2. **Grammar SRS:** productive forms, worked examples, genuine near-neighbor traps and spaced review;
3. **System topics:** counting, phonology, registers, discourse and morphological families;
4. **Applied checkpoints:** short original dialogues, listening and reading, later writing/argumentation;
5. **Evidence of progress:** measured recognition/production at a target level; never automatically convert point mastery into a TOPIK qualification.

### 4. Do not overinterpret TOPIK score bands

NIIED tests Levels 3–6 in **one TOPIK II exam**. Sejong's 1–6 is a teaching-level system, and Darakwon Beginning/Intermediate/Advanced is a publisher categorization. They are not one-to-one official per-pattern grade labels.

**Specific placement flag:** `-거니와` is indexed under **intermediate** in the NIKL teaching-center public list, but Munpro currently places it among the Level 6 literary forms. That discrepancy merits reconsideration; a single listed placement does not require an automatic move (context and register might differ).

## Three passes before an item is approved

**Pass A — Reference and scope.** Record source, precise TOC unit/grammar-entry label, meaning/sense and evidence tag. Identify whether it is a productive grammatical form, a lexical word, or a whole-language system. Check neighboring forms and current IDs before adding anything.

**Pass B — Sequence and teaching.** Document prerequisites, beginner-friendly meaning, formation from dictionary form, at least 2 newly authored worked examples, a genuine misuse/near-neighbor trap, and 3 *different* cloze review sentences. For highly advanced forms, consider recognition-first review rather than compulsory rare literary production.

**Pass C — Verification.** Validate unique IDs/positions, cloze reconstruction, base forms, answer ambiguity, example naturalness and register with Korean-native educators. Add a graded passage or dialogue checkpoint for the system; compare actual learner error rates to proposed ordering.

A hypothesis about a better path should be **testable**: measure learner errors when confusing `안` and `못`, when using `-게 하다` vs a lexical causative, and when producing native vs Sino numbers. Favor the order reducing persistent misconceptions without adding unnecessary repetition. Initial placement decisions are **editorial hypotheses**, not scientifically established optima.

## Rights and attribution

Use bibliographic links, short properly attributed names of forms, and **original Korean sentences and teaching explanations**. Do **not** copy textbook dialogues, exercise banks, audio, tables or extended explanations. Access to the Sejong ebook or an NIKL dictionary does not by itself authorize inclusion of their material in Munpro. Check the individual source license/terms before any asset reuse. The public Sejong book portal displays a restrictive attribution/noncommercial/no-derivatives license for some materials.

## Near-term editorial order of operations

| Order | Change | Evidence | Where it belongs |
|---|---|---|---|
| 0 | Hangul, batchim, liaison, sound changes; basic clause and word order | Sejong introductory track, Darakwon Korean sentence-structure intro, NIKL framework | Prep track / short topic, not all separate GP cards |
| 1 | Base conjugation and seven major irregular families | Darakwon Beginning unit 24 + intro | Early linked GP system with contextual review |
| 2 | Both number systems, counters, dates, time, age and price | Darakwon Getting Ready numbers/dates/time; Sejong beginner communicative curriculum | System topic with counter patterns and contextual practice |
| 3 | Noun connections and recipient particles; giving/receiving and status | Darakwon Beginning unit 3 (recipient/connective particles); KLEAR usage/culture framework | Grammar points + register topic |
| 4 | Negation variants, `-겠-` uses, plain/intimate speech, quotes and questions | Darakwon Beginning units 2, 23; NIKL teacher search for `-겠-` | Grammar points + spoken/written contrasts |
| 5 | Passive, causative, state vs progression, descriptive-verb desire | NIKL teacher search `-게 하다` and `-고 싶어 하다`; Darakwon unit 19 | Intermediate GP systems |
| 6 | Re-audit the advanced 3–6 deck placements and use recognition-first where needed | NIKL teacher index + later primary textbook chapter review | Advanced grammar editorial pass |
| 7 | Staged dialogues, readings, listening, writing checkpoints | NIKL Standard Curriculum, KLEAR integrated methodology, NIIED tested skills | Companion to decks, not vocab cards |

See `docs/research/korean-reference-gap-backlog.json` for concrete, research-tagged candidate additions. **Do not silently renumber or delete existing SRS IDs** as coverage expands; migrate ordering deliberately, version the content and preserve study history.
