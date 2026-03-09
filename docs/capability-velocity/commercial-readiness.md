# Commercial Readiness Checklist

Use this checklist before launching EDU Capability Velocity to external users.

## 1. Access and Abuse Controls

- Enable `COMMERCIAL_API_KEY` in production.
- Rotate API keys on a fixed schedule.
- Set request throttling values:
  - `API_RATE_LIMIT_MAX_REQUESTS`
  - `API_RATE_LIMIT_WINDOW_MS`
- For multi-instance/serverless deployments, configure distributed throttling:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- Enforce payload limits:
  - `API_MAX_MESSAGES_PER_REQUEST`
  - `API_MAX_TEXT_CHARS_PER_REQUEST`
- Confirm blocked requests return `401` and `429` as expected.

## 2. Reliability and Monitoring

- Verify `/api/health` returns `200` and include it in uptime checks.
- Enable telemetry output (`CAPABILITY_TELEMETRY_FILE`).
- Run weekly KPI generation (`npm run kpi:report`) and review trends.
- Configure alerting for elevated failure rates and latency regressions.
- Verify GitHub Actions deployment workflow is configured with:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

## 3. Legal and Compliance

- Publish legal pages:
  - `/legal/terms`
  - `/legal/privacy`
- Ensure customer-facing policies are reviewed by legal counsel.
- For global deployments, confirm regional compliance obligations (for example GDPR, FERPA, COPPA).

## 4. Product Safety and Quality

- Keep schema validation enabled for all agent outputs.
- Maintain CI gates (`lint`, `typecheck`, `test`, `build`) as merge blockers.
- Add capability-specific tests for each newly introduced agent and renderer.
- Define customer-facing SLAs and support incident response.

## 5. Go-Live Gate

- Security controls enabled and validated.
- Legal pages live and reviewed.
- Monitoring dashboards and alerts active.
- Backup/rollback and incident runbook completed.
- Pilot customer acceptance completed.
