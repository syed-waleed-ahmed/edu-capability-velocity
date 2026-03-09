# Hello-World Evidence: Drive Study Package Agent

- `capability_id`: CAP-003
- `agent`: `drive-study-package-agent`
- `type`: MCP/External
- `date`: 2026-03-08
- `owner`: capability-velocity team

## Input

```text
Import files from Google Drive folder 1A2B3C and create a study package for algebra revision.
```

## Tool Flow (expected)

1. `drive-list-files` with `folderId=1A2B3C`
2. `drive-read-file` for selected files
3. Final response as `drive-study-package` JSON

## Output Artifact

- `docs/capability-velocity/evidence/drive-study-package-agent-output.json`

## Validation

- Schema valid: yes
- Render target: `DriveStudyPackageCard`
- Render fallback used: no

## Notes

- Real execution requires valid OAuth token via `GOOGLE_DRIVE_ACCESS_TOKEN`.
- This artifact captures expected structure and renderer compatibility for CI/testing.
