# EDU Capability Velocity

> AI-powered learning micro-experiences — transform text into interactive flashcards, quizzes, and study plans in seconds.

![License](https://img.shields.io/badge/license-Proprietary-red)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Overview

EDU Capability Velocity is a production-ready AI learning platform that converts natural language into structured, interactive learning materials. Built with a **micro-experience architecture**, each capability (flashcards, quizzes, study plans, study packages) is a self-contained, reusable module with its own schema, UI component, and rendering pipeline.

### Key Features

- **🔄 Content Converter Agent** — Generate flashcards, quizzes, and study plans from any topic
- **📚 Study Package Agent** — Create structured study packages from files and notes
- **🃏 Interactive Flashcards** — Flip cards, track progress, navigate decks
- **📝 Quiz Runner** — Multiple-choice quizzes with scoring and explanations
- **📋 Study Plans** — Day-by-day learning schedules with milestones
- **📦 Study Packages** — Organized sections with key concepts and reading order

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| AI | Mastra agents + OpenAI GPT-4o-mini |
| Streaming | AI SDK v6 (UIMessageStream) |
| Schemas | Zod (structured output validation) |
| Styling | CSS Modules + Design Tokens |
| Deployment | Vercel |

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your OPENAI_API_KEY to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT-4o-mini |

## Architecture

```
src/
├── app/                     # Next.js App Router
│   ├── layout.tsx           # Root layout (Inter font, SEO)
│   ├── page.tsx             # Entry point (5 lines)
│   ├── globals.css          # Global styles + animations
│   └── api/chat/route.ts    # Chat API (Mastra → AI SDK bridge)
├── styles/
│   └── design-tokens.css    # Design system (CSS custom properties)
├── config/
│   └── agents.config.ts     # Agent definitions + suggestions
├── context/
│   └── ChatContext.tsx       # Shared state provider
├── components/
│   ├── chat/                # Chat UI (8 components + CSS Modules)
│   ├── micro/               # Micro-experience renderers
│   │   ├── FlashcardDeck/
│   │   ├── QuizRunner/
│   │   ├── StudyPlanView/
│   │   └── StudyPackageCard/
│   └── StructuredRenderer.tsx  # JSON → UI dispatcher
├── schemas/                 # Zod schemas for structured output
└── mastra/                  # Mastra agent + tool definitions
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repository in [Vercel Dashboard](https://vercel.com/new)
3. Add `OPENAI_API_KEY` to Environment Variables
4. Deploy

### Manual Build

```bash
npm run build
npm start
```

## License

Proprietary — All Rights Reserved. See [LICENSE](./LICENSE) for details.
