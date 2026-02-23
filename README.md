# Korean Cloze SRS

A spaced repetition system for learning Korean through cloze-deletion exercises. Built with **SvelteKit 2**, **Svelte 5**, **TypeScript**, and **Prisma 7**.

## Project Overview

Korean Cloze SRS is an interactive language learning application that helps users master Korean grammar and vocabulary through cloze-deletion cards (fill-in-the-blank). Each card presents a Korean sentence with a blank space, grammar hints, English translations, and support for romanized input that auto-converts to Hangul.

### Current Features

- **Cloze Card Interface**: Interactive Korean sentence filling exercises
- **Romanization Support**: Convert romanized input automatically to Hangul using the `hangul-js` library
- **Grammar Point Display**: Learn grammar rules with title, description, and contextual hints
- **Translation Hints**: See English translations with the blank highlighted for context

### Future Features

- **Database Integration**: PostgreSQL + Prisma 7 for persistent card storage and user progress
- **Spaced Repetition Algorithm**: Track card difficulty and optimal review timing
- **User Authentication**: Account management and progress tracking
- **Comprehensive Card Library**: Community-contributed Korean learning content

## Quick Start

### Prerequisites

- Node.js (v18+)
- npm, pnpm, yarn, or Bun

### Installation

```sh
# Install dependencies
npm install
# or
bun install
```

### Development

Start the development server:

```sh
npm run dev
```

Open your browser and navigate to `http://localhost:5173`. The app will reload on file changes.

To automatically open the app in your browser:

```sh
npm run dev -- --open
```

### Building

Create an optimized production build:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Project Structure

```
src/
├── lib/
│   ├── index.ts              # Library exports
│   ├── romanToHangul.ts      # Romanization to Hangul conversion
│   └── assets/               # Static images and media
├── routes/
│   ├── +layout.svelte        # Main layout with romanization guide
│   ├── +page.svelte          # Cloze card exercise page
│   └── roman-to-hangul/      # Romanization tool page
├── app.html                  # HTML entry point
├── app.css                   # Global styles
└── app.d.ts                  # Type definitions
```

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run check` — Run type checking and Svelte validation
- `npm run check:watch` — Watch mode for type checking
- `npm run test` — Run unit tests with Vitest

## Tech Stack

- **Frontend**: SvelteKit 2, Svelte 5, TypeScript
- **Styling**: CSS with custom properties
- **Build**: Vite
- **Testing**: Vitest
- **Future Backend**: Prisma 7, PostgreSQL
- **Utilities**: hangul-js (romanization)
