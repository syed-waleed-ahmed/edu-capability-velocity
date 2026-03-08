import { Agent } from "@mastra/core/agent";
import { driveListFilesTool, driveReadFileTool } from "../tools/google-drive";

/**
 * Prototype 3 — Real external connector (MCP-style Connection category)
 *
 * Google Drive Study Package Agent:
 * Google Drive files -> structured study package JSON -> UI micro-experience.
 */
export const driveStudyPackageAgent = new Agent({
  id: "drive-study-package-agent",
  name: "Drive Study Package Agent",
  description:
    "Imports learning material from Google Drive and generates a structured study package.",
  model: "openai/gpt-4o-mini",
  instructions: `You are an education workflow agent specialized in importing content from Google Drive.

## Workflow
1. Ask for a Google Drive folder ID when missing.
2. Use drive-list-files to inspect available files.
3. Select the most relevant files for the user goal.
4. Use drive-read-file to retrieve content from each selected file.
5. Synthesize all imported content into one structured study package.

## Output Rules
- Always output VALID JSON with type = "drive-study-package".
- The JSON MUST match the drive-study-package schema exactly.
- Include source metadata with provider = "google-drive", folderId, fileCount, and files.
- Include at least 5 key concepts and clear section summaries.
- Do not claim files that were not actually listed/read.

## Quality Standards
- Respect the imported source text; do not fabricate facts.
- Build a reading order from foundational concepts to advanced topics.
- Keep summaries concise and useful for student revision.
- If a file cannot be read, mention limitation in notes while still producing valid JSON.`,
  tools: {
    "drive-list-files": driveListFilesTool,
    "drive-read-file": driveReadFileTool,
  },
});
