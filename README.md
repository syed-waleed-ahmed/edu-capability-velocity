# EDU Capability Velocity

AI-powered learning workspace that turns free-form content into structured micro-experiences (flashcards, quizzes, study plans, and study packages).

![License](https://img.shields.io/badge/license-Proprietary-red)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Mastra](https://img.shields.io/badge/Mastra-AI_Agents-purple)

## Overview

EDU Capability Velocity is built around a capability pipeline:

`capability -> Mastra module -> schema-validated JSON -> UI component`

The application includes:

- `content-converter-agent` for flashcards, quizzes, and study plans.
- `study-package-agent` for structured package generation.
- `drive-study-package-agent` for Google Drive grounded package creation.
- Capability telemetry and KPI reporting artifacts under `docs/capability-velocity/`.

## Tech Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript 5
- AI Runtime: Mastra + AI SDK v6
- Validation: Zod schemas
- UI: React 19 + CSS Modules + design tokens
- Deployment target: Vercel

## Current Production Baseline

- Structured rendering reliability hardening for model output variants.
- `/api/chat` request guards:
  - Optional API key auth (`COMMERCIAL_API_KEY`)
  - Rate limiting (distributed Upstash support + in-memory fallback)
  - Payload shape and size validation
- Health endpoint: `/api/health`
- Legal routes:
  - `/legal`
  - `/legal/terms`
  - `/legal/privacy`
- Security headers configured in `next.config.ts`.

## Project Structure

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
  config/agents.config.ts
  context/ChatContext.tsx
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

Copy `.env.local.example` to `.env.local`.

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | Yes | Model access for Mastra agents |
| `GOOGLE_DRIVE_ACCESS_TOKEN` | Optional | Drive connector capability |
| `COMMERCIAL_API_KEY` | Recommended (prod) | Protect `/api/chat` with key auth |
| `API_RATE_LIMIT_MAX_REQUESTS` | Optional | Per-window request limit |
| `API_RATE_LIMIT_WINDOW_MS` | Optional | Rate limit window duration |
| `UPSTASH_REDIS_REST_URL` | Optional (recommended on Vercel) | Distributed rate limiting backend |
| `UPSTASH_REDIS_REST_TOKEN` | Optional (recommended on Vercel) | Upstash REST token |
| `API_MAX_MESSAGES_PER_REQUEST` | Optional | Max messages accepted per request |
| `API_MAX_TEXT_CHARS_PER_REQUEST` | Optional | Total text budget per request |
| `API_MAX_TEXT_CHARS_PER_MESSAGE` | Optional | Per-message text budget |
| `CAPABILITY_TELEMETRY_FILE` | Optional | Telemetry NDJSON output path |

## Local Development

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Quality Gates

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## CI/CD

- CI workflow: `.github/workflows/ci.yml`
  - Runs lint, typecheck, test, build on push and pull request.
- CD workflow: `.github/workflows/vercel-deploy.yml`
  - Preview deploy on PRs targeting `main`.
  - Production deploy on push to `main`.

Required GitHub repository secrets for CD:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Capability Velocity Artifacts

Operational pack is stored at `docs/capability-velocity/`:

- `raw-capability-pool.csv`
- `top10-starter-shortlist.md`
- `capability-register.csv`
- `execution-status.md`
- `commercial-readiness.md`
- `global-readiness-checklist.md`
- `evidence/`
- `reports/weekly-kpi-report.md`

Regenerate weekly KPI report:

```bash
npm run kpi:report
```

## Vercel Deployment (Step by Step)

### Option 1: GitHub + Automated CI/CD (recommended)

1. Import the repository in Vercel.
2. In Vercel Project Settings, add runtime environment variables used by the app (`OPENAI_API_KEY`, `COMMERCIAL_API_KEY`, rate-limit vars, and optional Upstash vars).
3. In GitHub repository settings, add secrets used by CD:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
4. Protect `main` with required checks (at least CI workflow).
5. Merge to `main` to trigger production deployment workflow.

### Option 2: Manual deployment from local machine

```bash
npm install -g vercel
vercel login
vercel link
vercel env pull .env.local
vercel --prod
```

## Security Notes

- Keep `COMMERCIAL_API_KEY` enabled in production.
- Use distributed rate limiting (`UPSTASH_REDIS_*`) for multi-instance/serverless environments.
- Keep legal pages publicly available.
- Monitor `/api/health` and telemetry output.

## License

Proprietary - All Rights Reserved (c) 2026 MemorAIz. See `LICENSE`.
