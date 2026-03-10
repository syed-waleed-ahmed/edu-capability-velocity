# EDU Capability Velocity

AI-powered learning workspace designed for rapid generation of structured micro-experiences. This platform bridges advanced generative capabilities (powered by Mastra and OpenAI) to real-time React rendering.

## 🚀 Features

- **Dynamic Micro-Experiences:** Instantly generated Flashcards, Quizzes, and Study Plans.
- **Agentic AI Connectors:**
  - `content-converter-agent`: Transforms raw educational text into interactive learning assessments.
  - `study-package-agent`: Curates comprehensive learning modules.
  - `drive-study-package-agent`: Grounds AI outputs using personal data from Google Drive.
- **Beautiful Glassmorphic UI:** Next-generation premium interface seamlessly blending light and dark modes with sleek glass panels, animated gradients, and floating elements.
- **Persistent AI Chat:** Retains deep session memory and stateful generation in local storage with context-aware tab isolation.
- **Speech-to-Text Support:** Integrated robust microphone dictation using the native Web Speech API.

## 💻 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Vanilla CSS Modules (Custom Glassmorphism & Tokens)
- **AI Orchestration:** Mastra + AI SDK v6
- **Type Safety & Schemas:** TypeScript 5 + Zod validates AI outputs natively
- **Typography:** Self-hosted Inter font (`next/font/google`)

## 🛠 Prerequisites

- Node.js 20+
- An active OpenAI API Key

## 🏁 Getting Started (Local Development)

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment variables:

   ```bash
   cp .env.local.example .env.local
   # or natively on windows:
   # copy .env.local.example .env.local
   ```

3. Populate `.env.local`:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   COMMERCIAL_API_KEY=your_optional_secure_key
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## 🏎 Vercel Production Deployment

This project is fully optimized for Vercel deployment natively leveraging NextJS capabilities.

1. Import this repository into Vercel.
2. In your Vercel **Project Settings** -> **Environment Variables**, add:
   - `OPENAI_API_KEY` (Required)
   - `COMMERCIAL_API_KEY` (Recommended for securing route points)
3. Connect your Git repository. Vercel will automatically build the standalone App Router build.

### Quality Code Checks

Before merging to deployment branches, run the required lint targets:

```bash
npm run lint
npm run typecheck
npm run build
```

## ⚖️ License

Proprietary - All Rights Reserved (c) 2026 MemorAIz. Use requires explicit commercial permission and licensing.
