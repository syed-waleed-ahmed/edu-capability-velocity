# EDU Capability Velocity

AI-powered learning workspace that converts raw educational content into structured micro-experience UIs.

![License](https://img.shields.io/badge/license-Proprietary-red)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Mastra](https://img.shields.io/badge/Mastra-AI_Agents-purple)

## What This Project Does

This repository implements a capability-first architecture:

`capability -> Mastra agent -> schema-validated JSON -> renderer component`

Core capabilities currently shipped:

- `content-converter-agent`: flashcards, quizzes, and study plans.
- `study-package-agent`: study package generation.
- `drive-study-package-agent`: Drive-grounded study package generation.

Rendered micro-experiences:

- Flashcards (`FlashcardDeckComponent`)
- Quiz (`QuizRunner`)
- Study plan (`StudyPlanView`)
- Study package (`StudyPackageCard`)
- Drive study package (`DriveStudyPackageCard`)

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Mastra + AI SDK v6
- Zod schema validation
- CSS Modules + design tokens

## Runtime and Security Baseline

- `POST /api/chat`
  - Optional API key auth (`COMMERCIAL_API_KEY`)
  - Request size/shape validation
  - Rate limiting (Upstash distributed backend or in-memory fallback)
- `GET /api/health`
- Legal pages:
  - `/legal`
  - `/legal/terms`
  - `/legal/privacy`
- Security headers configured in `next.config.ts`

## Project Layout

```text
src/
  app/
    api/chat/route.ts
    api/health/route.ts
    legal/
    layout.tsx
    page.tsx
  components/
    chat/
    micro/
    StructuredRenderer.tsx
  context/ChatContext.tsx
  config/agents.config.ts
  lib/
    security/request-guards.ts
    structured-output-parser.ts
    telemetry/capability-telemetry.ts
  mastra/
    agents/
    tools/
  schemas/
  styles/design-tokens.css
```

## Environment Variables

Start from `.env.local.example`.

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | Yes | Model access for Mastra agents |
| `GOOGLE_DRIVE_ACCESS_TOKEN` | Optional | Drive connector runtime token |
| `COMMERCIAL_API_KEY` | Recommended in production | Protects `/api/chat` |
| `API_RATE_LIMIT_MAX_REQUESTS` | Optional | Per-window limit |
| `API_RATE_LIMIT_WINDOW_MS` | Optional | Window duration |
| `UPSTASH_REDIS_REST_URL` | Optional | Distributed rate-limit backend |
| `UPSTASH_REDIS_REST_TOKEN` | Optional | Upstash REST auth token |
| `API_MAX_MESSAGES_PER_REQUEST` | Optional | Request message count guard |
| `API_MAX_TEXT_CHARS_PER_REQUEST` | Optional | Total text-size guard |
| `API_MAX_TEXT_CHARS_PER_MESSAGE` | Optional | Per-message text-size guard |
| `CAPABILITY_TELEMETRY_FILE` | Optional | Telemetry output path |

## Local Setup

Prerequisite: Node.js 20+.

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

PowerShell equivalent for env file copy:

```powershell
Copy-Item .env.local.example .env.local
```

Open `http://localhost:3000`.

## Validation Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## CI/CD Workflows

- `/.github/workflows/ci.yml`
  - Runs lint, typecheck, test, build on push and pull request.
- `/.github/workflows/vercel-deploy.yml`
  - Preview deployment on pull requests to `main`.
  - Production deployment on pushes to `main`.

GitHub repository secrets required for Vercel CD:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Capability Velocity Docs

Execution and governance artifacts live in `docs/capability-velocity/`, including:

- `raw-capability-pool.csv`
- `top10-starter-shortlist.md`
- `capability-register.csv`
- `execution-status.md`
- `commercial-readiness.md`
- `global-readiness-checklist.md`
- `evidence/`
- `reports/weekly-kpi-report.md`

Regenerate KPI report:

```bash
npm run kpi:report
```

## Vercel Deployment

1. Import this repository into Vercel.
2. Add runtime environment variables in Vercel Project Settings.
3. Add GitHub secrets for CD (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).
4. Protect `main` with required checks.
5. Merge or push to `main` to trigger production deployment.

## License

Proprietary - All Rights Reserved (c) 2026 MemorAIz. See `LICENSE`.
