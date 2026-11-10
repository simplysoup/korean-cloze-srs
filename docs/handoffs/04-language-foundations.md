# Agent 04 — Language foundations handoff

Repository: https://github.com/simplysoup/korean-cloze-srs
Branch: **feat/language-foundations**
PR base: **integration/curriculum-v1**
Baseline ancestor: **c17cfab84f978056e55665b40fbeaec92ca044ce**

## Agent 00 integration hooks

Navigation links are the **only** required shared-file integration:

- Add Language topics to the shared AppHeader or Agent 00's preferred hub → **/topics**
- Add Sound changes to the existing Hangul jamo screen → **/hangul/sound-changes**
- Optional pronunciation-topic link → **/topics/topic_hangul_sound_changes**

The feature branch does not edit shared navigation, stores, authentication, sync,
database, generated grammar sources or package manifests. There is no new SRS
progress record and no need for a topic-progress synchronization contract.

## Route list

| Path | Implementation | Purpose |
| --- | --- | --- |
| /topics | mobile/src/app/topics/index.tsx | Four-module topic library |
| /topics/[id] | mobile/src/app/topics/[id].tsx | Full lessons, feedback, visit-only progress |
| /hangul/sound-changes | mobile/src/app/hangul/sound-changes.tsx | Interactive written decoder and phonology drills |
| /hangul | existing route, unchanged | Existing Hangul jamo batches, learn and cram |

Valid module IDs:
- topic_hangul_sound_changes
- topic_speech_register
- topic_number_application
- topic_voice_evidence

## Coverage delivered

The feature imports existing **mobile/src/content/language-topics.json** directly
and does not change the authoritative **prisma/seed-data/language-topics/foundations.json**.
All **four modules, 14 ordered sections and 12 authored checks** render with
objectives, prerequisite names, worked examples, explanations and references.

All 12 authored checks are answerable. Every selection displays the explanation;
incorrect selections can be retried. Correctness is tracked only in local React
state until navigating away or restarting. Completing checks does not grant
grammar or vocabulary SRS credit and does not persist or sync.

The speech-register lesson additionally renders four worked contrasts and
**four supplemental register checks**. They distinguish subject honorification,
casual listener speech, everyday polite listener speech, formal-polite speech,
and plain narrative style. These additions do not modify authored JSON.

Hangul pronunciation extends the existing jamo approach with:

1. Unicode syllable-block decoding: initial, medial, final, positional ㅇ
2. 받침 and final neutralization
3. Liaison/연음 (꽃이, 책을)
4. Nasal assimilation/비음화 (국물, 먹는)
5. ㅎ aspiration (좋고, 좋다); 좋아 as a non-aspirating counterexample
6. Spelling versus pronounced forms; visual 달/탈 plain/aspirated contrast

The new lab offers **12 deterministic sound-rule checks** across six lessons,
with explanations and retries. The decoder decomposes written blocks only;
it does not claim to algorithmically predict all surface pronunciations.

Totals: **12 authored topic checks + 4 applied register checks + 12 sound-rule
checks = 28 answerable tasks**.

## Audio manifest / provenance

File: **mobile/src/features/phonology/audio-manifest.ts**

**0 approved audio items / 14 distinct example targets.** All targets are
explicitly unavailable with null URI, source, permission/license, attribution,
speaker/synthesis provenance and reviewer details. Unknown targets also return
unavailable. No audio is downloaded, bundled or played, and the screens label
all media as unavailable. There is no listening assessment.

An audio asset can only become approved once the target, URI, source, license/
permission, speaker-or-synthesis provenance, pronunciation reviewer and
attribution field are populated. Human-speaker consent and an educator audio
QA review must precede any future distribution.

Textual explanations, transcriptions, distractors, and register examples remain
**pending Korean educator review**. Existing source references are preserved in
the authored topic; no native-speaker validation is claimed.

## Verification

Pure-Jest tests are inside the owned feature trees:
- topics/__tests__/catalog.test.ts: four modules, 14 sections, 12 authored
  checks, all choices, explanation fields, visit-only completion, register drills
- phonology/__tests__/decoder.test.ts: block composition, positional ㅇ,
  compound vowels/finals, invalid input
- phonology/__tests__/content.test.ts: six units, 12 sound checks, written
  pronunciation fixtures, audio manifest and approval gating
- topics/__tests__/routes-and-safety.test.ts: route contracts, content mapping,
  screen-reader labels/roles, width styles, no persistence/SRS mutation

Workflow: **Mobile (Expo)** checks content generation/validation, TypeScript,
Jest, and Expo Web export. Reproduce with:

    cd mobile
    npm ci
    npm run typecheck
    npm test -- --ci
    npx expo export --platform web

**Limitations:** source-level accessibility and responsive tests plus a web
export do not substitute for live 320px/mobile/desktop browser QA or real
VoiceOver, TalkBack and native-device interactions. These manual checks and
qualified Korean educator review are required before a production release.

## Agent 00 acceptance checklist

1. Open /topics at narrow phone and desktop widths, review all four modules
2. Open each module and verify all 14 authored sections and source references
3. Answer all 12 original checks incorrectly then correctly, inspect feedback
4. Answer 4 applied register checks (subject vs hearer vs narrative style)
5. Open /hangul/sound-changes and decode 가, 강, 아, 꽃, 책, 읽, 괜
6. Answer all 12 phonology checks; verify feedback, completion and reset
7. Confirm missing-audio labels, no fake playback, no unreviewed audio claims
8. Keyboard/tab, focus order, screen reader heading and radio-group controls
9. Confirm review queues, grammar/vocab SRS state and account sync remain intact
10. Hook discovery links into shared navigation and the original Hangul screen

## Explicitly untouched

- mobile/src/app/hangul.tsx
- mobile/src/components/AppHeader.tsx
- mobile/src/app/_layout.tsx
- mobile/src/store/** and mobile/src/db/**
- mobile/package.json / lockfile
- prisma/seed-data/**, generated language-topic/vocab/grammar JSON

Agent 04 must not merge this work into integration/main or deploy it.
