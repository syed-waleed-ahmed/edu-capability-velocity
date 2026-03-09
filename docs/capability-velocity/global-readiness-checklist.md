# Global Readiness Checklist

Use this before declaring the platform production-ready across regions.

## Product And UX

- Support locale-aware prompts and responses.
- Externalize user-facing strings for translation.
- Support right-to-left layouts where required.
- Ensure all micro-experience components are mobile-first and accessible.

## Architecture

- Keep capability modules independent from chat shell.
- Version schemas (`v1`, `v2`) and maintain backward compatibility.
- Add capability registry metadata (owner, SLA, deprecation policy).
- Enable feature flags per tenant/region.

## Reliability And Performance

- Add request tracing per capability (`capability_id`, latency, token cost, retries).
- Define SLOs for response latency and render success.
- Add retry and timeout policies for all external connectors.
- Cache stable external content where allowed.

## Security And Compliance

- Add tenant isolation and role-aware access controls.
- Add PII/minor-content handling policy before external calls.
- Add audit logs for capability execution and data access.
- Implement data retention and deletion workflows.

## Delivery And Governance

- Add CI for lint, typecheck, and smoke tests.
- Add regression tests for JSON schema and renderer compatibility.
- Track weekly capability velocity KPIs.
- Require go/no-go checklist before enabling new capability in production.
