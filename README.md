# EDU Capability Velocity

> AI-powered learning micro-experiences — transform text into interactive flashcards, quizzes, and study plans in seconds.

![License](https://img.shields.io/badge/license-Proprietary-red)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Mastra](https://img.shields.io/badge/Mastra-AI_Agents-purple)

## Overview

EDU Capability Velocity is a production-ready AI learning platform that converts natural language into structured, interactive learning materials. Built with a **micro-experience architecture**, each capability (flashcards, quizzes, study plans, study packages) is a self-contained, reusable module with its own schema, UI component, and rendering pipeline.

### Features

- **🔄 Content Converter Agent** — Generate flashcards, quizzes, and study plans from any topic
- **📚 Study Package Agent** — Create structured study packages from notes
- **📂 Drive Import Agent** — Import Google Drive files into structured study packages
- **🃏 Interactive Flashcards** — Flip cards, track progress, navigate decks
- **📝 Quiz Runner** — Multiple-choice quizzes with scoring and explanations
- **📋 Study Plans** — Day-by-day learning schedules with milestones
- **📦 Study Packages** — Organized sections with key concepts and reading order
- **📈 Capability Telemetry + KPI Report** — Capture runtime metrics and generate weekly capability reports

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| AI Agents | Mastra + OpenAI GPT-4o-mini |
| Streaming | AI SDK v6 (UIMessageStream) |
| Schemas | Zod (structured output validation) |
| Styling | CSS Modules + CSS Custom Properties |
| Font | Inter (via next/font) |
| Deployment | Vercel |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# PowerShell alternative:
# Copy-Item .env.local.example .env.local
# Add your OPENAI_API_KEY to .env.local

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ | OpenAI API key for GPT-4o-mini |
| `GOOGLE_DRIVE_ACCESS_TOKEN` | Optional | OAuth access token for Drive connector tools |
| `COMMERCIAL_API_KEY` | Recommended (Prod) | Protects `/api/chat` (send via `x-api-key` or `Authorization: Bearer`) |
| `API_RATE_LIMIT_MAX_REQUESTS` | Optional | Max chat requests allowed per rate-limit window (default `30`) |
| `API_RATE_LIMIT_WINDOW_MS` | Optional | Rate-limit window duration in milliseconds (default `60000`) |
| `API_MAX_MESSAGES_PER_REQUEST` | Optional | Maximum message count accepted by `/api/chat` (default `40`) |
| `API_MAX_TEXT_CHARS_PER_REQUEST` | Optional | Maximum cumulative text characters per chat request (default `40000`) |
| `API_MAX_TEXT_CHARS_PER_MESSAGE` | Optional | Maximum text characters for a single message in chat history (default `8000`) |
| `CAPABILITY_TELEMETRY_FILE` | Optional | Custom output path for telemetry NDJSON (defaults to `artifacts/telemetry/capability-events.ndjson`) |

## Architecture

```
src/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout (Inter font, SEO metadata)
│   ├── page.tsx                 # Entry point (5 lines)
│   ├── globals.css              # Global styles + keyframe animations
│   └── api/chat/route.ts        # Chat API (Mastra → AI SDK v6 bridge)
├── styles/
│   └── design-tokens.css        # Design system (100+ CSS custom properties)
├── config/
│   └── agents.config.ts         # Agent definitions + suggestion prompts
├── context/
│   └── ChatContext.tsx           # Shared state provider (agent, chat, input)
├── components/
│   ├── chat/                    # Chat UI (8 components + CSS Modules)
│   │   ├── ChatLayout.tsx       # Main shell (flex column layout)
│   │   ├── ChatHeader.tsx       # Brand + agent selector tabs
│   │   ├── ChatMessages.tsx     # Message list with auto-scroll
│   │   ├── ChatBubble.tsx       # Message bubble (user vs assistant)
│   │   ├── ChatInput.tsx        # Glass input bar + gradient send button
│   │   ├── EmptyState.tsx       # Welcome screen with suggestion chips
│   │   ├── SuggestionChip.tsx   # Clickable prompt pill
│   │   └── LoadingIndicator.tsx # Pulsing "thinking" indicator
│   ├── micro/                   # Micro-experience renderers
│   │   ├── FlashcardDeck/       # Interactive flashcard UI
│   │   ├── QuizRunner/          # Quiz with scoring + explanations
│   │   ├── StudyPlanView/       # Day-by-day study schedule
│   │   ├── StudyPackageCard/    # Organized study materials
│   │   └── DriveStudyPackageCard/ # Drive import source + study package view
│   └── StructuredRenderer.tsx   # JSON → UI dispatcher (type registry)
├── lib/
│   ├── structured-output-parser.ts
│   └── telemetry/
│       └── capability-telemetry.ts # Runtime capability telemetry hooks
├── schemas/                     # Zod schemas for structured AI output
│   ├── drive-study-package.ts
│   ├── flashcard.ts
│   ├── quiz.ts
│   ├── study-plan.ts
│   ├── study-package.ts
│   └── structured-output.ts
└── mastra/                      # Mastra agent + tool definitions
    ├── agents/
    └── tools/
```

## Quality Gates

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

CI runs these checks on push and pull requests via `.github/workflows/ci.yml`.

## Capability KPI Reporting

```bash
npm run kpi:report
```

This generates `docs/capability-velocity/reports/weekly-kpi-report.md` from telemetry events.

## Capability Velocity Docs

Operational planning and execution artifacts are stored under `docs/capability-velocity/`:

- `execution-status.md`: current phase completion status.
- `raw-capability-pool.csv`: Phase 1 candidate pool.
- `top10-starter-shortlist.md`: scored shortlist baseline.
- `evidence/`: hello-world prototype evidence files.
- `reports/weekly-kpi-report.md`: weekly KPI report artifact.
- `commercial-readiness.md`: commercialization gate checklist.

## Commercial Deployment Essentials

- Enable `COMMERCIAL_API_KEY` in production.
- Set rate-limit and payload controls (`API_RATE_LIMIT_*`, `API_MAX_*`).
- Expose legal pages to end users: `/legal/terms` and `/legal/privacy`.
- Monitor health endpoint: `/api/health`.
- Keep CI gates (`lint`, `typecheck`, `test`, `build`) mandatory before release.

## Telemetry Output

Capability run telemetry is persisted to NDJSON at:

- default: `artifacts/telemetry/capability-events.ndjson`
- override with: `CAPABILITY_TELEMETRY_FILE`

## Design System

The UI uses a **glassmorphism design system** with CSS Custom Properties:

- Animated gradient background orbs
- Glass blur (`backdrop-filter`) on all interactive surfaces
- Gradient accent text and buttons
- Slide-in message animations
- Glow/shadow effects on focus and hover
- Responsive breakpoints at 640px

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repository in [Vercel Dashboard](https://vercel.com/new)
3. Add `OPENAI_API_KEY` to Environment Variables
4. Deploy — production-ready with zero config

### Manual Build

```bash
npm run build   # Production build
npm start       # Start production server
```

## Security

Production builds include the following security headers:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

`/api/chat` also includes:

- Optional API key authentication (`COMMERCIAL_API_KEY`)
- IP-based rate limiting
- Payload shape and size validation

## License

Proprietary — All Rights Reserved © 2026 MemorAIz. See [LICENSE](./LICENSE).
