# Phase 2 — UI & Layout Simplifications

> **Status:** ✅ Complete (2026-02-24)
> **Steps:** 12–15 in execution order

## Summary

Removed the grammar header card from the review page, replaced blank placeholder text with tense/register metadata, removed card bounding boxes for a clean centered layout, and upgraded English hint highlighting from `boolean` to a three-level `highlightType` system.

## Changes Made

### 2.1 Remove Grammar Header
- Deleted the `.grammar-card` element (blue header bar + description) from the review page
- Description moved into the toggleable "Reveal Info" panel (Phase 3)
- Removed `.grammar-card`, `.grammar-header`, `.grammar-label`, `.grammar-title`, `.grammar-desc` CSS rules

### 2.2 Placeholder Text (Tense/Register)
- Blank placeholder now shows tense/register metadata (e.g. "Present, standard polite") instead of the grammar hint
- Falls back to `grammar.hint` when both tense and register are null
- Lighter font color for placeholder state

### 2.3 Layout — Remove Bounding Boxes
- Removed `background`, `box-shadow`, `border-radius` from `.cloze-card` on the review page
- Centered Hangul sentence and English hint vertically and horizontally
- Clean, minimal review layout with sentence → hint → input → controls flow

### 2.4 Syntax Highlighting
- Replaced `highlight: boolean` with `highlightType: 'none' | 'direct' | 'related'` on `EnglishHintPart`
- `'direct'` = red (word replaced by blank), `'related'` = amber (affected by particle)
- Added `normalizeHint()` for backward compatibility with old `highlight: boolean` data
- All seed data updated to use `highlightType` format

## Files Modified
- `src/routes/reviews/+page.svelte` — grammar header removal, placeholder text, layout
- `src/app.css` — removed old grammar styles, added centered review layout
