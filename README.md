# EDU Capability Velocity (MemorAIz)

An AI-powered learning workspace designed for the rapid generation of structured micro-experiences. This platform bridges advanced generative capabilities (powered by Mastra and OpenAI) to real-time, glassmorphic React rendering.

**Live Demo:** [https://edu-capability-velocity.vercel.app/](https://edu-capability-velocity.vercel.app/)

---

## 🚀 Features

- **Dynamic Micro-Experiences:** Instantly generated Flashcards, Quizzes, and Study Plans from parsed context.
- **Agentic AI Connectors:**
  - `content-converter-agent`: Transforms raw educational text into interactive learning assessments.
  - `study-package-agent`: Curates comprehensive learning modules.
  - `drive-study-package-agent`: Grounds AI outputs using personal data securely fetched from Google Drive.
- **Beautiful Glassmorphic UI:** A next-generation premium interface seamlessly blending Light and Dark modes with sleek frosted glass panels, animated mesh gradients, and floating z-index elements.
- **Persistent AI Chat:** Session-aware memory using `sessionStorage` (per-tab) and `localStorage` (cross-tab). Reloading the page restores the active conversation; opening a new tab starts a fresh chat.
- **Compact Chat History:** A ChatGPT-like sidebar with summarized single-line titles and always-visible edit ✏️ and delete 🗑️ icons for quick session management.
- **Speech-to-Text Support:** Integrated microphone dictation via the Web Speech API, with Permissions API detection that guides users to unblock the microphone if the browser has permanently denied access.

---

## 🏗️ Architecture

This repository implements a capability-first architectural pipeline:

`Raw Input -> Mastra Agent -> Semantic Processing -> Schema-Validated JSON -> Next.js React Renderer Component`

By enforcing Zod schemas at the edge, the LLM outputs are guaranteed to match the exact prop requirements of the React components (e.g., `FlashcardDeckComponent`, `QuizRunner`), eliminating messy parsing logic on the frontend.

---

## 📖 Development Journey: From Prototype to Production

This project underwent a rigorous polish phase to transform it from a functional prototype into a production-ready, visually stunning application. Here is a breakdown of what was accomplished:

### 1. Premium UI & UX Overhaul

- **Glassmorphism Design System:** Ripped out hardcoded hex values and replaced them with a robust CSS variables system (`design-tokens.css`). Introduced frosted glass panels using `backdrop-filter: blur()`, subtle semi-transparent borders, and animated mesh background gradients.
- **True Dark/Light Mode:** Re-engineered the color palette so that components dynamically adapt to system preferences. Addressed critical contrast issues where "is thinking" bubbles or active tabs were unreadable in Dark Mode.
- **Micro-interactions:** Added smooth transitions, scaling active states, and glowing hover effects on buttons and suggestion chips to create a tactile feeling.
- **Legal Page Unification:** Stripped legacy opaque backgrounds from the `/legal`, `/terms`, and `/privacy` routes, ensuring they fluidly inherit the glassmorphic theme.

### 2. Session & Chat History Management

- **Tab-Aware Session Persistence:** Implemented a dual-storage approach using `sessionStorage` (per-tab, survives reload) and `localStorage` (cross-tab session library). Reloading a page restores the active conversation; opening a new browser tab starts a fresh empty chat.
- **Compact History Sidebar:** Redesigned from a multi-line card layout to a ChatGPT-style single-line format with truncated titles and always-visible inline edit/delete SVG icons — no hover tricks that fail on touch devices.
- **Custom Modals:** Replaced native `window.confirm()` dialogues with a state-driven React modal for confirming chat deletions.
- **Smart Context Previews:** The sidebar plucks the first user prompt as the clean preview text instead of raw AI JSON.

### 3. Functional Polish & Bug Squashing

- **React Hydration Fixes:** Resolved a critical Client/Server mismatch (`Minified React Error #418`) by deferring all `localStorage` reads to a client-side `useEffect`.
- **Robust Speech-to-Text:** Uses the Permissions API to detect permanently blocked microphone access and shows a clear, dismissible instruction banner guiding users to reset browser permissions via Site Settings.
- **Empty State Scaling:** Fixed layout shifts by enforcing a strict `100vh` flex-column architecture where only the chat area grows.

### 4. Production Readiness & Vercel Optimization

- **Vercel Analytics Handling:** `SpeedInsights` and `Analytics` components are strictly gated behind `process.env.VERCEL === "1"` environment checks.
- **Component Pruning:** Cleaned up unused legacy monolithic components in favor of modularized `/micro/` directory variants.
- **Security Headers:** Configured in `next.config.ts` with API rate limiting and key-based authentication for `/api/chat`.

---

## 💻 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Vanilla CSS Modules (Custom Glassmorphism & Tokens)
- **AI Orchestration:** Mastra + AI SDK v6
- **Type Safety & Schemas:** TypeScript 5 + Zod validates AI outputs natively
- **Typography:** Self-hosted Inter font (`next/font/google`)

---

## 🏁 Getting Started (Local Development)

### 1. Prerequisites

- Node.js 20+
- An active OpenAI API Key

### 2. Installation

```bash
git clone https://github.com/syed-waleed-ahmed/edu-capability-velocity.git
cd edu-capability-velocity
npm install
```

### 3. Environment Variables

Copy the template and populate it:

```bash
cp .env.local.example .env.local
```

**.env.local:**

```env
OPENAI_API_KEY=your_openai_api_key_here
COMMERCIAL_API_KEY=your_optional_secure_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🏎 Vercel Production Deployment

This project is natively structured for Vercel's Edge architecture.

1. Import this repository into Vercel.
2. In your Vercel **Project Settings** -> **Environment Variables**, add:
   - `OPENAI_API_KEY` (Required)
   - `COMMERCIAL_API_KEY` (Recommended for securing route endpoints against scraping)
3. Connect your Git repository. Vercel will automatically detect the Next.js framework and compile the standalone App Router build.

### Quality Code Checks

Before merging to deployment branches, run the required lint targets:

```bash
npm run lint
npm run typecheck
npm run build
```

---

## ⚖️ License
Proprietary - All Rights Reserved (c) 2026 MemorAIz. Use requires explicit commercial permission and licensing.
