# Top 10 Starter Shortlist

This is a starter list for immediate execution. Validate each item during Phase 1 and Phase 3 before committing roadmap scope.

## Skill/Playbook Scan Starters (10)

1. Lesson text -> flashcards with difficulty tags.
2. Lesson text -> quiz with explanations and answer key.
3. Lesson text -> day-by-day study plan.
4. Reading passage -> comprehension quiz by grade level.
5. Lecture notes -> key concepts and glossaries.
6. Assignment rubric -> personalized revision checklist.
7. Syllabus -> weekly learning milestones.
8. Teacher objective -> differentiated activities by learner level.
9. Student mistakes -> targeted remediation plan.
10. Topic prompt -> exam-style mixed practice set.

## MCP Scan Starters (10)

1. Google Drive connector: ingest docs/slides; auth OAuth 2.0; limits by Google API quotas.
2. Google Docs connector: fetch structured document content; auth OAuth 2.0; limits by API quotas.
3. Microsoft OneDrive connector: ingest files; auth OAuth 2.0 via Microsoft identity; limits by Graph quotas.
4. Microsoft SharePoint connector: access team materials; auth OAuth 2.0; limits by Graph quotas.
5. LMS connector (Moodle): pull course files and assignments; auth token/session; limits depend on host config.
6. LMS connector (Canvas): pull modules/pages/assignments; auth OAuth/token; limits by Canvas API quotas.
7. Calendar connector (Google Calendar): schedule study plans; auth OAuth 2.0; limits by API quotas.
8. Calendar connector (Microsoft Outlook): schedule tasks/reminders; auth OAuth 2.0; limits by Graph quotas.
9. Web/content fetch connector: pull trusted educational pages; auth none or API key; limits by provider.
10. PDF extraction connector: parse uploaded PDFs for downstream conversion; auth local or service key; limits by file size/runtime.

## Starter Top 10 (Scored)

Scoring uses `Impact + Frequency + Feasibility` (max 15).

| Rank | Capability | Type | Impact | Frequency | Feasibility | Score | Requires UI | Suggested Module |
|---|---|---|---:|---:|---:|---:|---|---|
| 1 | Lesson text -> flashcards | Skill | 5 | 5 | 5 | 15 | Yes | `content-converter-agent` |
| 2 | Lesson text -> quiz | Skill | 5 | 5 | 5 | 15 | Yes | `content-converter-agent` |
| 3 | Lesson text -> study plan | Skill | 4 | 5 | 5 | 14 | Yes | `content-converter-agent` |
| 4 | Drive import -> study package | MCP | 5 | 4 | 4 | 13 | Yes | `drive-study-package-agent` |
| 5 | PDF import -> flashcards/quiz | Hybrid | 5 | 4 | 4 | 13 | Yes | `pdf-converter-agent` |
| 6 | LMS import -> study package | MCP | 5 | 4 | 3 | 12 | Yes | `lms-study-package-agent` |
| 7 | Reading passage -> comprehension quiz | Skill | 4 | 4 | 4 | 12 | Yes | `reading-quiz-agent` |
| 8 | Syllabus -> milestones planner | Skill | 4 | 4 | 4 | 12 | Yes | `syllabus-planner-agent` |
| 9 | Calendar sync for study plan | MCP | 4 | 3 | 4 | 11 | Optional | `calendar-study-agent` |
| 10 | Rubric -> revision checklist | Skill | 4 | 4 | 3 | 11 | Yes | `rubric-checklist-agent` |

## Mandatory Prototypes

1. MCP prototype (Connection):
- Flow: Drive or LMS import -> study package JSON -> `StudyPackageCard` renderer.
- Artifacts: Mastra agent module, schema, renderer integration, hello-world evidence.

2. Skill/Playbook prototype (Conversion/Creation):
- Flow: text or PDF content -> flashcards + quiz + study plan JSON -> existing renderers.
- Artifacts: Mastra agent module, schema validation, hello-world evidence.

## Evidence Files To Produce During Tests

- `docs/capability-velocity/evidence/<capability-id>-hello-world.md`
- `docs/capability-velocity/evidence/<capability-id>-output.json`
