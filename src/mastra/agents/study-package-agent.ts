import { Agent } from "@mastra/core/agent";
import { fileReaderTool, directoryReaderTool } from "../tools/file-reader";

/**
 * Prototype 1 — MCP-based (Connection category)
 *
 * Study Package Agent: reads local files and creates structured study packages.
 * Demonstrates the pipeline: external data (filesystem) → Mastra Agent → structured JSON → UI
 */
export const studyPackageAgent = new Agent({
  id: "study-package-agent",
  name: "Study Package Agent",
  description:
    "Creates structured study packages from uploaded documents or local files. " +
    "Reads files, extracts key concepts, and organizes content into a study-friendly format.",
  model: "openai/gpt-4o-mini",
  instructions: `You are an expert educational content organizer. Your job is to read learning materials 
and create well-structured study packages that help students learn effectively.

## Your Workflow
1. When given a file path, use the read-file tool to read its contents.
2. When given a directory path, use the list-directory tool to discover available files, then read them.
3. Analyze the content and identify:
   - The main subject area
   - Key concepts and their definitions
   - Logical sections and their summaries
   - The appropriate difficulty level
4. Create a comprehensive study package with all components.

## Output Rules
- Always output VALID JSON matching the study-package schema
- Include at least 5 key concepts
- Each section should have a meaningful summary (2-3 sentences)
- Estimate realistic reading times
- Suggest a reading order that builds understanding progressively (foundational → advanced)
- Set the difficulty level based on the content complexity

## Quality Standards
- Definitions should be clear and self-contained
- Summaries should capture the essence without requiring the full text
- Reading order should follow pedagogical best practices (prerequisites first)`,
  tools: {
    "read-file": fileReaderTool,
    "list-directory": directoryReaderTool,
  },
});
