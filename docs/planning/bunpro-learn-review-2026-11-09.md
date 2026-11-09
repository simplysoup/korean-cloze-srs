# Bunpro Learn + Review study — 2026-11-09

Live study on bunpro.jp as simplysoup (Lv. 30). Nothing was changed in the
account: no lesson finished, no Learn quiz started, no real review touched
(dashboard still Learn 5, Review 21 after). Review flow observed via Cram
(no SRS effect). The Learn "Start Quiz" stage and its summary were NOT
observed (not started).

## Learn flow

- Learn opens straight into a reading session (resumes mid-lesson). A batch
  is 5 items; the dashboard Learn count is the batch size.
- Lesson page: big red heading ("Lesson 1 — N4 Grammar"), "14/19" counter,
  tabs Details / Examples / Resources. Hero: the grammar point in huge type
  (48px+), a short English sub-heading, and a "Mark as Mastered" button
  (the "I already know this" option) top-right, plus bookmark/share icons.
- "Structure" tables (Forms, Meaning in plain English with example
  patterns), an "About" section (2–3 short paragraphs, each with a Japanese
  example + audio Play button + furigana toggle), 12 numbered Examples (each
  with Play, furigana toggle, "Show Translation" revealing the English),
  and Resources (external article/book links).
- Paging: red "Next" bottom-right, ghost "Previous" bottom-left, and a fixed
  dark bar at the bottom centre with five progress pills (completed white,
  current pink/red, upcoming grey). Next advances one item in place, no
  confirmation. On the last batch item the button becomes "Start Quiz" (red)
  — the gateway to the quiz/review stage.

## Review flow (Cram)

- Layout: one centred column, the sentence vertically centred with lots of
  empty space. Top-left: End Session (door icon), Settings, Styling,
  dictionary icons. Top-right HUD: "✓ correct/total", remaining unattempted,
  remaining needing wrap-up, stopwatch (elapsed). A thin red bar runs along
  the very top edge and grows as the session advances.
- Sentence: very large dark type (~36–40px), the blank inline and underlined,
  the grammar point's English name sitting in it in small grey text (e.g.
  "Permissive"); the base verb in parentheses after the sentence. Below it,
  the English hint in smaller type with the blank's translation in red bold.
- Input: a single pill (~500px) at bottom-centre with a Play triangle on the
  left, centred placeholder "答え", and a red ">" submit arrow on the right.
  Typing romaji converts live to kana and appears live in the blank, in red,
  underlined. Bottom-left: the "Hint" button. Bottom-right: Report + Hotkey
  Guide.

### Hint system (tested click-by-click)

- The button label never changes — always "Hint" + 4 dots. It starts at
  level 2 of 4 ("Hint ●●○○"): the full English sentence is visible.
- Click 1 → level 3: adds a Japanese nuance line (lightbulb icon) with
  furigana. Click 2 → level 4: adds the English translation of that nuance
  line. Click 3 → level 0: ALL hints vanish (even the English). Click 4 →
  level 1: only the red/bold English fragment matching the blank. Click 5 →
  back to level 2. It cycles 2→3→4→0→1→2.
- Full reveal (level 4) does NOT show the answer, does NOT mark the card
  wrong/failed, does NOT auto-advance, and you cannot get stuck: the input
  stays live and you can still answer or cycle the hint back down.
- Assessment for a Korean-learner clone: this is progressive disclosure of
  translation + a nuance note, NOT scaffolding toward the answer. Levels 1–2
  (the English sentence) are the only stages usable without already reading
  Japanese; level 3 is a Japanese explanation that assumes fluent reading;
  level 4 is just the English translation of that note. There is no
  first-letter, reading, or word-bank stage. Do NOT copy these stages
  literally; adapt the progressive-disclosure structure to Korean learners.

### Feedback

- Wrong: the mistyped text in the blank turns red, the input pill gets a red
  border + red text and becomes read-only, the submit arrow becomes a red ✕
  that is the "Next question" control. Three small white pill buttons appear
  above the input: "Undo", "Show Info", "See Answer". HUD does not change
  until you advance.
- "See Answer": the correct answer appears in the blank in green with
  furigana, and a pager appears under the English; "See Answer" becomes
  "Alternatives" (cycles accepted variants; "No Alts." when there are none).
  See Answer does not change grading by itself; the card still counts as
  missed.
- Advancing: click the "→"/"✓" at the right end of the pill ("Next question")
  or press Enter. HUD updates only then.
- "Undo" opens a confirmation modal ("Undo Answer?", "Using Undo will act
  like this attempt never happened!", advice to use it only for genuine
  slip-ups, "Don't show this message again" checkbox, "Keep Answer" /
  "Undo Answer").
- "Almost correct" (third state): a valid answer for the wrong target grammar
  turns the blank amber/orange, keeps the input editable, and shows an amber
  warning: "This works! However, we are looking for a grammar point that
  uses something less formal than なければ here." The HUD does not count it.
- Correct: the blank turns soft sage green with furigana, the matching
  English fragment turns green, the pill gets a green border + green text,
  and the right-hand control becomes a green "✓" ("Next question"). Instant
  and in place — no modal, banner, or sound; the colour change IS the
  feedback. Wrong cards go to a Wrap-Up round and are re-presented until
  correct.

### Session summary

- Big red heading + "Congratulations, you finished your Cram!" + "Input - N
  items". Left stat card: huge accuracy % (first attempts only), Correct %
  vs Incorrect %, a solid red bar. Small cards: "XP Earned", "B-Points
  Earned". A red-outlined "Return to Cram Selection" button. Right: filter
  pills All / Correct / Missed, then one white card per item (✕ + audio,
  the sentence with the correct answer in red, the English below, a "→" to
  open the item).

### Keyboard shortcuts (Hotkey Guide)

Submit: Enter; Play Audio: P; Answer Input: I; See Hint: Shift+Spacebar;
Item Info: F; Finish/Wrap Up: 0; Change Tabs: ←/→; Hotkey Guide: /;
Undo: Backspace/Delete; Show All Furigana: Ctrl+Shift+F (hold). Fill-in —
Show Answer: A; Next Alt.: A again; Previous Alt.: Shift+A; Close: Esc.

## Visual polish (concrete)

- Palette: near-white warm light grey background, no visible card container
  in the session — content floats. One muted crimson red is the single
  accent: submit arrow, Next/Start Quiz, the matching English fragment, the
  ✕/wrong state, the summary heading. Correct is muted sage green; wrong is
  softened crimson (not harsh); "almost correct" is amber/orange. Furigana
  is tiny grey. Red is used sparingly, so it always means "the important
  thing".
- Typography: hierarchy by size and weight, not colour or decoration. The
  sentence dominates (~36–40px, medium weight); the English hint is much
  smaller (~19–20px, mid-grey); the blank's label ~15px; HUD numbers ~15px;
  buttons ~15px. On Learn the grammar point is enormous (48px+), section
  headings bold dark, body ~16px.
- Spacing: ruthlessly minimal in the session — one centred column, hundreds
  of pixels of empty space around the sentence, input fixed near the bottom
  centre, Hint bottom-left, Report/Hotkey bottom-right. Nothing competes
  with the sentence. Learn uses generous white space, a wide card, and a
  fixed bottom bar keeping Previous/Next/pills reachable.
- Buttons: everything is a pill/fully-rounded rectangle with a thin
  light-grey border and white fill; the primary action is unmistakable
  (solid red Next/Start Quiz; the lone red arrow in the input pill).
  Secondary actions are quiet white/grey pills. Cards have large radii and
  soft shadows; modals are centred white rounded cards on a dimmed overlay.
- Feedback feel: instant, in place, gentle — the same elements change colour
  and the right-hand control morphs (">" → "→"/"✓") with no layout jump, no
  pop-up, no extra narration. Wrong is red but not alarming; correct is
  green but not celebratory; the amber "almost correct" state with a
  plain-English explanation ("This works! However…") teaches rather than
  just grading.
