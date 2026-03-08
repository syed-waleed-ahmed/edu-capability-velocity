# Scoring And Success Criteria

## Objective

Prove and improve capability velocity for the EDU Suite:

- Discover external capabilities quickly.
- Test and integrate them into reusable Mastra modules.
- Render schema-validated JSON as micro-experiences in UI.

## 4-Phase Workflow With Exit Criteria

### Phase 0 - Setup (0.5 day)

Exit criteria:

- Tracking tables exist and are shareable.
- Sources are linked (Skill references, MCP catalogs, docs).
- Owners and review cadence are assigned.

### Phase 1 - Scan (1-2 days)

Exit criteria:

- At least 30 raw candidates collected.
- Each candidate has type, persona, and rough integration notes.

### Phase 2 - Shortlist + Classify (1-2 days)

Scoring formula:

`Score = Impact (1-5) + Frequency (1-5) + Feasibility (1-5)`

Classification rules:

- Mostly instructions/standards -> Skill/Playbook
- Needs external data/actions -> MCP
- Needs both -> Hybrid

Exit criteria:

- Top 10 selected with rationale and score.
- UI requirement flagged per capability.

### Phase 3 - Rapid Test + 2 Prototypes (4-5 days)

Exit criteria:

- Hello-world run recorded for each Top 10 candidate.
- Two prototypes implemented end-to-end:
  - 1 MCP-based module (Connection)
  - 1 Skill/Playbook module (Conversion or Creation)
- For each prototype:
  - Mastra module
  - JSON schema
  - UI renderer/component

## Success Criteria (Anthropic-Style Measurement)

### Quantitative

- Skill trigger rate >= 90% on representative prompts.
- Workflow completion in <= X tool calls (set baseline first).
- Failed API calls per workflow <= Y.
- Schema-valid output rate >= 95%.
- UI render success rate >= 95% (no fallback JSON block).
- Median integration lead time (candidate -> merged module) in days.

### Qualitative

- Users rarely need to redirect the assistant to next step.
- Workflow outputs are structurally consistent across repeated runs.
- New users can complete target tasks with minimal guidance.

## Capability Velocity Baseline Metrics

Track weekly:

- Candidates evaluated per week.
- Candidates passing hello-world per week.
- Building blocks shipped per week.
- Reusable modules created vs one-off implementations.

## Global-Ready Guardrails

- Enforce schema validation before rendering.
- Separate capability logic from UI for reuse.
- Add observability (latency, failure, token cost per capability).
- Add privacy checks for minors/PII before external connectors.
- Add locale readiness (language prompts, date/time, content policy).
