# Phase 7 — Content Expansion

> **Status:** 📋 Planned

## Goals

Scale the card library beyond manually seeded data and add near-miss answer detection.

## Tasks

### 7.1 AI Card Generation
- Script or API endpoint that uses an LLM to generate GrammarPoint + ClozeCard records
- Input: grammar topic description → output: structured card data
- Validate generated Korean for grammatical correctness
- Integration with seed pipeline or admin UI

### 7.2 Close Answer Detection (Phase 3.3 Implementation)
- Add `closeAnswers Json?` column to ClozeCard
- Character-level diff logic in the frontend (correct segments green, incorrect red)
- Generate close-answer variants from seed data or via AI
- Schema migration required

### 7.3 Additional Grammar Points
- Expand beyond Part 3 particles to verb endings, conjunctions, honorifics
- Part 4+ content from Korean grammar curriculum
- Graduated difficulty levels (TOPIK 1 → TOPIK 6)

### 7.4 Multi-blank Cards
- Support sentences with more than one blank
- `romanInputs` array sized to match blank count
- Per-blank answer validation
- UI for tabbing between blanks

## Dependencies
- LLM API access (OpenAI, Anthropic, or local model) for AI generation
- Schema migration for `closeAnswers` column
