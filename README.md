# EDU Capability Velocity

> **Proving (and improving) our capability velocity for the EDU Suite** — how quickly we can take an external capability, wrap it into a Mastra building block, and ship it with a rendered UI.

## Quick Start

```bash
# Install dependencies
npm install

# Set your API key
export OPENAI_API_KEY=your-key-here

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Architecture

```
User Input → Mastra Agent (+ tools) → Structured JSON (Zod) → UI Component (React)
```

Every feature follows this architecture, making each one a **reusable building block**.

## What's Inside

### Prototypes

| # | Agent | Category | What it does |
|---|-------|----------|-------------|
| 1 | **Study Package Agent** | Connection (MCP) | Reads files from filesystem → creates structured study packages |
| 2 | **Content Converter Agent** | Conversion (Skill) | Takes text → generates flashcards, quizzes, and study plans |

### Schemas (`src/schemas/`)
- `study-package.ts` — Study package with key concepts, sections, reading order
- `flashcard.ts` — Flashcard deck with front/back cards and difficulty levels
- `quiz.ts` — Quiz with MCQ + open-ended questions, answers, explanations
- `study-plan.ts` — Study plan with sessions, activities, milestones

### UI Components (`src/components/`)
- `StudyPackageCard` — Dark gradient card with expandable sections
- `FlashcardDeck` — Interactive flip cards with progress tracking
- `QuizRunner` — MCQ quiz with scoring and explanation reveal
- `StudyPlanView` — Timeline view with sessions and milestones
- `StructuredRenderer` — Generic JSON → UI dispatcher

### Tracking (`tracking/`)
- `use_case_table.md` — 15 EDU use cases with personas, triggers, success criteria
- `capability_registry.md` — 22 capabilities (12 skills + 10 MCP servers) scored and ranked
- `sources.md` — Reference links to guides and catalogs

## Project Structure

```
edu-capability-velocity/
├── src/
│   ├── mastra/
│   │   ├── agents/           # Mastra agents (2 prototypes)
│   │   ├── tools/            # Mastra tools (filesystem reader)
│   │   └── index.ts          # Mastra instance config
│   ├── schemas/              # Zod output schemas (4 types)
│   ├── components/           # React UI micro-experiences (5 components)
│   └── app/
│       ├── api/chat/route.ts # Vercel AI SDK chat endpoint
│       └── page.tsx          # Chat UI with agent selector
├── tracking/                 # Research & evaluation documents
└── package.json
```

## Tech Stack

- **Framework**: Next.js 16 + TypeScript
- **Agents**: Mastra (`@mastra/core`)
- **Schemas**: Zod
- **Chat**: Vercel AI SDK v6 (`ai` + `@ai-sdk/react`)
- **LLM**: OpenAI GPT-4o-mini (configurable)
