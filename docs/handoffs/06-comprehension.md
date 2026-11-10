# Agent 06 — Graded Reading Comprehension Handoff

**PR:** https://github.com/simplysoup/korean-cloze-srs/pull/14 (draft; merge only by Agent 00)  
**Branch:** `feat/reading-comprehension`  
**PR base:** `integration/curriculum-v1`  
**Starting baseline:** `c17cfab84f978056e55665b40fbeaec92ca044ce`

## Deliverables

Six **original** Korean passages, 24 multiple-choice comprehension checks, and 39 optional vocabulary glosses. All source and generated content is marked **editorial-draft**, educatorReviewed=false. No copyrighted readings, translations of outside passages, audio assets, or listening assessment.

| Stable passage ID | Approx. level | Title | Whitespace-delimited Korean words | Checks | Glosses |
|---|---:|---|---:|---:|---:|
| `rc_l1_library` | 1 | 도서관에서 고른 책 / A book from the library | 51 | 4 | 5 |
| `rc_l1_station` | 1 | 지하철역을 찾는 민수 / Finding the subway station | 59 | 4 | 6 |
| `rc_l2_picnic` | 2 | 비 오는 날의 점심 / Lunch on a rainy day | 74 | 4 | 6 |
| `rc_l2_class` | 2 | 바뀐 도자기 수업 / The pottery class that moved | 80 | 4 | 6 |
| `rc_l3_wallet` | 3 | 버스에서 발견한 지갑 / The wallet on the bus | 106 | 4 | 8 |
| `rc_l3_bookexchange` | 3 | 동네 책 교환 행사 / Neighbourhood book exchange | 126 | 4 | 8 |

Questions cover main idea, detail, reference, speaker intention, supported inference and grammar-in-context. All choices are in English for this pilot to isolate Korean passage comprehension from question-reading difficulty; **no full English passage translation is displayed during assessment**. Correct positions are distributed evenly (six each at indices 0, 1, 2, and 3). Each question has a contiguous evidence quote and a rationale. Inference questions carry editorial interpretation notes. Six questions have additional ambiguity notes; this is a *draft audit*, not native-speaker validation.

## Prerequisite map

Prerequisite IDs are from the existing 229-point TOPIK grammar catalogue, not a competing grammar list. The full readable titles are stored in the authoring JSON and checked against the current catalogue:

**도서관에서 고른 책 (L1)**: `gp_ieyo_yeyo` (이에요/예요); `gp_isseoyo` (있다/있어요); `gp_e_loc` (에 (장소)); `gp_eseo` (에서); `gp_eun_neun` (은/는); `gp_eul_reul` (을/를); `gp_ji_anha` (-지 않다); `gp_do` (도).

**지하철역을 찾는 민수 (L1)**: `gp_e_time` (에 (시간)); `gp_e_loc` (에 (장소)); `gp_eseo` (에서); `gp_eopseoyo` (없다/없어요); `gp_position` (위/아래/앞/뒤/옆); `gp_euseyo` (-(으)세요); `gp_eul_reul` (을/를).

**비 오는 날의 점심 (L2)**: `gp_euryeogo_hada` (-(으)려고 하다); `gp_asseoyo` (-았어요/-었어요); `gp_eoduda` (-아/어 두다); `gp_gi_ttaemune` (-기 때문에); `gp_giro_hada` (-기로 하다); `gp_eul_geot_gatda` (-(으)ㄹ 것 같다); `gp_eumyeon` (-(으)면); `gp_aseo_sequence` (-아/어서 (sequence)); `gp_go_sipda` (-고 싶다).

**바뀐 도자기 수업 (L2)**: `gp_go_naseo` (-고 나서); `gp_asseoyo` (-았어요/-었어요); `gp_gi_jeone` (-기 전에); `gp_eul_ttae` (-(으)ㄹ 때); `gp_giro_hada` (-기로 하다); `gp_aya_hada` (-아/어야 하다); `gp_go_seq` (-고); `gp_ani_eyo` (N이/가 아니다 (아니에요)); `gp_a_juseyo` (-아/어 주세요); `gp_gap_benefactive_a_juda` (-아/어 주다 (do for someone)).

**버스에서 발견한 지갑 (L3)**: `gp_t2l3_daga` (-다가); `gp_t2l3_jamaja` (-자마자); `gp_t2l3_neurago` (-느라고); `gp_t2l3_deokbune` (-(으)ㄴ/는 덕분에); `gp_eoduda` (-아/어 두다); `gp_go_naseo` (-고 나서); `gp_t2l3_daesine` (-는 대신에).

**동네 책 교환 행사 (L3)**: `gp_t2l3_barame` (-는 바람에); `gp_t2l3_daesine` (-는 대신에); `gp_t2l3_eulsurok` (-(으)ㄹ수록); `gp_t2l3_dabonikka` (-다 보니까); `gp_t2l3_banmyeone` (-(으)ㄴ/는 반면에); `gp_eumyeon` (-(으)면); `gp_euryeogo_hada` (-(으)려고 하다); `gp_eul_su_issda` (-(으)ㄹ 수 있다); `gp_gap_ge_hada_action` (-게 하다 (make / let someone do)).

These are key structural prerequisites, not claims that all vocabulary is already known. Before expanding beyond the pilot, a Korean educator should audit lexical and structural difficulty, including natural register, reported speech, collocations and distractor plausibility.

## Lexical coverage

Only 145 foundational items in seven vocabulary decks currently exist; they do **not** cover the nouns, verbs and adjectives in these passages. Every gloss is tagged `moveToGeneralVocabulary: true`, allowing a later general-vocabulary agent to classify/deduplicate it without adding lexical facts to grammar SRS.

**rc_l1_library**: 도서관 — library; 직원 — staff member; 그림 — picture or illustration; 빌리다 — to borrow; 쉽다 — to be easy.

**rc_l1_station**: 지하철역 — subway station; 휴대전화 — mobile phone; 가게 — shop; 쭉 — straight ahead; 은행 — bank; 역 — station.

**rc_l2_picnic**: 돗자리 — picnic mat; 냉장고 — refrigerator; 불편하다 — to be inconvenient; 거실 — living room; 창밖 — outside the window; 대신 — instead of.

**rc_l2_class**: 문화센터 — community cultural centre; 도자기 — pottery or ceramic; 퇴근하다 — to finish work; 문자 메시지 — text message; 옮기다 — to move or reschedule; 시간표 — timetable.

**rc_l3_wallet**: 빈 좌석 — empty seat; 지갑 — wallet; 현금 — cash; 안내 데스크 — information desk; 맡기다 — to hand over for safekeeping; 분실 신고 — lost-property report; 대조하다 — to compare against records; 돌려받다 — to get back.

**rc_l3_bookexchange**: 주민 — local resident; 자원봉사자 — volunteer; 안내문 — notice or sign; 회의실 — meeting room; 취소하다 — to cancel; 젖다 — to get wet; 요리책 — cookbook; 활발하다 — to be lively or active.

## Frozen contracts and feature flag

This branch incorporates Agent 00's frozen contract commit through an explicit two-parent merge; no shared history was rewritten. The adapter at `mobile/src/features/comprehension/practiceAdapter.ts` implements `mobile/src/features/contracts/practice.ts`: every reading passage and exercise has `contentReadiness: 'draft'`, each question has stable option IDs and evidence-based explanations, and every `PracticeFeedback.awardsGrammarMastery` is **false** (including correct, incorrect and unclassified submissions).

Both `/comprehension` and `/comprehension/[id]` check `isCurriculumFeatureEnabled('readingComprehension')`; the Agent 00 default is **false**. While disabled, direct visits redirect to the existing not-yet-implemented screen. No URL flag, localStorage or hidden override is supplied. The standalone UI is implemented but **not live or user-accessible under the default release flag**. Agent 00 must make an explicit enablement decision after the appropriate review gates. `/reading` remains untouched until Agent 00 integrates routing.

## Source of truth, generated mobile content, code

- Authoritative source: `prisma/seed-data/comprehension/pilot.json`
- Generated mobile copy: `mobile/src/content/comprehension-pilot.json`
- Deterministic export: `node scripts/port-comprehension.mjs`
- Structural, provenance and prerequisite validation: `node scripts/validate-comprehension.mjs`
- Static catalogue, scoring, layout and UI: `mobile/src/features/comprehension/**`
- Independent Expo routes: `/comprehension` and `/comprehension/[id]`
- Jest suites: `mobile/src/features/comprehension/__tests__/*.test.ts`

The interface offers a passage library and level filters, title/level/prerequisite labels, selectable Korean text with natural wrapping, hidden-by-default vocabulary glosses, answer selection and feedback, a session summary, and review with evidence and explanations. Scores are **in memory only**; retry resets local responses. No imports from store/db/sync and no grammar review, schedule, streak, or account writes.

### Audio

Every passage currently has `audio: null`. The schema allows a future `{ kind: 'recording', rights: 'cleared', uri }` object only, and validator rejects unsupported audio metadata. No audio playback or listening tests are claimed.

## Test and verification commands

From repo root:

```bash
node scripts/port-comprehension.mjs
node scripts/validate-comprehension.mjs
cd mobile
npm ci
npm run typecheck
npm test -- --ci
npx expo export --platform web
```

Tests assert six loads, stable IDs, 24 questions, valid correct indices, evidence and draft status, inference ambiguity notes, scoring and completion, unsupported IDs, missing-audio handling, responsive layout dimensions and accessibility affordances. A Jest suite executes the standalone Node content validator; another verifies Agent 00's practice adapter, stable option IDs, no grammar-mastery awarding, and both default-disabled route guards. The source-code test also verifies reading UI does not import grammar store or database APIs.

**Release verification:** GitHub Mobile (Expo) runs typecheck, Jest tests, web export and existing content QA on this PR. Agent 00 should add `node scripts/port-comprehension.mjs` to CI's content-reproducibility step and `node scripts/validate-comprehension.mjs` to CI validation after integrating this PR. These edits are outside Agent 06 ownership.

### Human QA remaining

On 320px phone, short-height phone, tablet and desktop: confirm paragraph wrapping, text selection, scroll position across questions, visibility of long answers, keyboard/screen-reader announcements, labels, and scroll through a full explanation review. Validate English comprehension questions against genuinely possible alternative interpretations. Conduct native Korean educator review **before considering content approved**.

## Agent 00 — Integration instructions

1. Merge this PR only into `integration/curriculum-v1`, after shared-contract compatibility and CI checks. The frozen contracts are already merged into this feature branch with history preserved.
2. Agent 00 owns the existing `mobile/src/app/reading.tsx`; when approved to enable the reading pilot, replace the placeholder with `<Redirect href="/comprehension" />` and decide whether to enable the frozen `readingComprehension` flag. If desired, register `comprehension/index` and `comprehension/[id]` in `mobile/src/app/_layout.tsx`, though Expo Router discovers the new files.
3. Keep the current header/navigation link to `/reading` until the redirect works. Do **not** change grammar SRS state when opening/answering a reading.
4. Add the two scripts to integrated CI as described above. If persistent reading results are desired later, define separate account/storage contracts before any change—no grammar SRS review history should be repurposed.
5. Preserve unrelated stacked PR history. Do not merge to main or deploy without authorization.

**Acceptance boundary:** this is a complete standalone reading pilot, not a validated TOPIK examination, full lexical curriculum, listening feature, or synchronized reading-progress system.
