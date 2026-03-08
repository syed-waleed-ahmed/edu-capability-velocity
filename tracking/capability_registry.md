# EDU Suite — Capability Registry

> Skills/MCP servers that can power our use cases, with evaluation scores.

## Scoring Formula

```
Score = Impact (1-5) + Frequency (1-5) + Feasibility (1-5)    [max = 15]
```

- **Impact**: Learning value or teacher workload reduction
- **Frequency**: How often a user would invoke this
- **Feasibility**: Ease of auth + UI + integration (5 = easiest)

## Classification Rules

| If the capability...                     | Type              |
|------------------------------------------|-------------------|
| Is mostly prompt instructions/standards  | **Skill/Playbook**|
| Needs to fetch/push external data        | **MCP**           |
| Needs both prompts + external data       | **Hybrid**        |

---

## Skills / Playbooks (Prompt-Based)

| # | Capability | Type | Use Cases Covered | Auth | Complexity | Risks | Impact | Freq | Feasibility | Score | Notes |
|---|-----------|------|-------------------|------|------------|-------|--------|------|-------------|-------|-------|
| S1 | **Quiz Generator Skill** | Skill | #1 Quiz from Content | None | S | Low — no external data | 5 | 5 | 5 | **15** | High-value, trivial to implement. Pure prompt engineering. |
| S2 | **Flashcard Creator Skill** | Skill | #2 Flashcard Deck | None | S | Low | 5 | 5 | 5 | **15** | Pairs perfectly with spaced repetition UI. |
| S3 | **Study Plan Generator Skill** | Skill | #3 Study Plan | None | S | Low | 4 | 4 | 5 | **13** | Needs syllabus parsing logic in prompt. |
| S4 | **Lesson Plan Builder Skill** | Skill | #5 Lesson Plan | None | S | Low | 5 | 3 | 5 | **13** | Teacher-focused. High impact but lower frequency. |
| S5 | **Rubric Creator Skill** | Skill | #6 Rubric | None | S | Low | 4 | 3 | 5 | **12** | Teacher-focused. Weights must sum correctly. |
| S6 | **Content Summarizer Skill** | Skill | #7 Summarize at Grade Level | None | S | Low | 4 | 5 | 5 | **14** | Very frequent use. Grade-level targeting is key. |
| S7 | **Practice Problem Generator Skill** | Skill | #8 Practice Problems | None | S | Low | 4 | 4 | 5 | **13** | Especially valuable for STEM subjects. |
| S8 | **Vocabulary Builder Skill** | Skill | #9 Vocabulary List | None | S | Low | 3 | 3 | 5 | **11** | Lower-impact standalone, good as compound. |
| S9 | **Concept Map Generator Skill** | Skill | #10 Concept Map | None | S | Low | 4 | 3 | 4 | **11** | Rendering the graph UI is moderately complex. |
| S10 | **Essay Feedback Engine Skill** | Skill | #12 Essay Feedback | None | S | Medium — student PII in essays | 5 | 3 | 4 | **12** | Rubric-aligned feedback is high value. Privacy considerations with student work. |
| S11 | **Assessment from Objectives Skill** | Skill | #15 Assessment Builder | None | S | Low | 4 | 3 | 4 | **11** | Bloom's taxonomy mapping adds complexity. |
| S12 | **Content Converter Skill** | Skill | #1, #2, #3 combined | None | S | Low | 5 | 5 | 5 | **15** | Multi-output: content → quiz + flashcards + study plan in one agent. |

---

## MCP Servers (External Data/Actions)

| # | Capability | Type | Use Cases Covered | Auth | Complexity | Risks | Impact | Freq | Feasibility | Score | Notes |
|---|-----------|------|-------------------|------|------------|-------|--------|------|-------------|-------|-------|
| M1 | **Filesystem MCP** | MCP | #4 Study Package from Files | None | S | Low — local files only | 4 | 4 | 5 | **13** | No auth needed. Reads local uploads. Ideal for prototype. |
| M2 | **Google Drive MCP** | MCP | #4, #11 Import from Drive | OAuth 2.0 | M | Medium — requires Google auth, GDPR | 5 | 4 | 3 | **12** | High value but OAuth setup adds friction. |
| M3 | **Google Docs MCP** | MCP | #4 Study Package | OAuth 2.0 | M | Medium | 4 | 3 | 3 | **10** | Subset of Drive functionality. |
| M4 | **Google Calendar MCP** | MCP | #13 Schedule Study Sessions | OAuth 2.0 | M | Low | 3 | 3 | 3 | **9** | Nice-to-have for study plan scheduling. |
| M5 | **EduChain MCP** | MCP | #1, #8 Quiz/Problem Gen | API Key | S | Low | 4 | 4 | 4 | **12** | EDU-specific MCP. Mock data capable. Worth testing. |
| M6 | **Moodle MCP** | MCP | #11 LMS Import | API Key + URL | M | Medium — LMS data is sensitive | 4 | 3 | 3 | **10** | Requires Moodle instance. Good for LMS integration proof. |
| M7 | **Web Fetch / Brave Search MCP** | MCP | Curriculum research | API Key | S | Low | 3 | 3 | 4 | **10** | Useful for fetching web resources for lesson plans. |
| M8 | **PDF/Doc Parser (Unstructured)** | MCP | #4, #7 Parse uploads | API Key | S | Low | 4 | 4 | 4 | **12** | Key for handling uploaded documents. |
| M9 | **Canvas LMS API** | MCP | #11 LMS Import | OAuth 2.0 | L | High — sensitive student data | 4 | 2 | 2 | **8** | Complex auth. Maybe Phase 2. |
| M10 | **Notion MCP** | MCP | #4 Import from Notion | OAuth 2.0 | M | Low | 3 | 2 | 3 | **8** | Niche — only if users store notes in Notion. |

---

## Top 10 Shortlist

*Ranked by score, with ties broken by implementation order priority.*

| Rank | Capability | Type | Score | 1-Line Rationale | Requires Custom UI? |
|------|-----------|------|-------|-------------------|---------------------|
| 🥇 1 | **Content Converter Skill** (S12) | Skill | 15 | Multi-output powerhouse: one prompt → quiz + flashcards + study plan. Maximum reuse. | ✅ FlashcardDeck + QuizRunner + StudyPlanView |
| 🥇 1 | **Quiz Generator Skill** (S1) | Skill | 15 | Most requested EDU feature. Simple input/output. | ✅ QuizRunner |
| 🥇 1 | **Flashcard Creator Skill** (S2) | Skill | 15 | Core study tool. High frequency + high impact. | ✅ FlashcardDeck |
| 🥈 4 | **Content Summarizer Skill** (S6) | Skill | 14 | Used constantly. Grade-level targeting differentiates from generic summaries. | ⚠️ SummaryCard (simple) |
| 🥉 5 | **Study Plan Generator Skill** (S3) | Skill | 13 | Unique value prop: personalized study schedules from syllabus. | ✅ StudyPlanView |
| 🥉 5 | **Lesson Plan Builder Skill** (S4) | Skill | 13 | High impact for teachers. Saves hours of prep work. | ⚠️ LessonPlanView |
| 🥉 5 | **Practice Problem Generator** (S7) | Skill | 13 | Essential for STEM. Difficulty grading is key. | ✅ ProblemSet |
| 🥉 5 | **Filesystem MCP** (M1) | MCP | 13 | Zero-auth file ingestion. Perfect for Prototype 1. | ✅ StudyPackageCard |
| 9 | **Rubric Creator Skill** (S5) | Skill | 12 | Teacher productivity. Weight validation logic needed. | ⚠️ RubricTable |
| 9 | **PDF/Doc Parser MCP** (M8) | MCP | 12 | Enables document upload flow. Pairs with any skill. | ❌ No custom UI (feeds into other components) |

---

## Chosen Prototypes

### Prototype 1 — MCP-based (Connection): Study Package Agent
**Capabilities**: M1 (Filesystem MCP) + S6 (Content Summarizer)
**Why**: Zero-auth MCP, validates the external-data pipeline end-to-end.

### Prototype 2 — Skill-based (Conversion): Content Converter Agent
**Capabilities**: S12 (Content Converter) = S1 + S2 + S3 combined
**Why**: Highest-scoring skill. Proves multi-output structured generation + rich UI.
