# Capability Velocity Operating Pack

This folder turns the strategy into an executable workflow for the EDU Suite.

## Purpose

- Standardize `scan -> shortlist -> test -> integrate -> render`.
- Track every capability as a reusable building block.
- Make outputs measurable, not opinion-based.

## Files

- `use-case-table.csv`: Use-case design table aligned to personas and 6C categories.
- `capability-register.csv`: Skill/MCP register with scoring and hello-world status.
- `scoring-and-success-criteria.md`: Scoring formula, phase gates, and measurable outcomes.
- `rapid-test-template.md`: Template to log test inputs/outputs, latency, and blockers.
- `top10-starter-shortlist.md`: Initial candidate pool and suggested mandatory prototypes.
- `global-readiness-checklist.md`: Requirements to scale safely across regions and tenants.
- `commercial-readiness.md`: Launch checklist for auth, abuse controls, legal, and monitoring.
- `raw-capability-pool.csv`: 30+ initial capabilities for Phase 1 scanning baseline.
- `evidence/`: Hello-world test evidence and sample outputs for mandatory prototypes.
- `reports/weekly-kpi-report.md`: Auto-generated weekly KPI artifact from telemetry events.
- `execution-status.md`: Current phase completion status and implemented baseline.

## Commands

- `npm run kpi:report` -> regenerate weekly KPI report.

## Operating Rule

Every shipped feature must map to:

`capability -> Mastra module -> schema-validated JSON -> UI component`
