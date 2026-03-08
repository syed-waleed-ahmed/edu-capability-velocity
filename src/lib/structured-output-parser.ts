import {
  parseStructuredOutput,
  type StructuredOutput,
} from "@/schemas/structured-output";

export function parseStructuredOutputFromText(
  text: string
): StructuredOutput | null {
  try {
    return parseStructuredOutput(JSON.parse(text));
  } catch {
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (!jsonMatch) {
      return null;
    }

    try {
      return parseStructuredOutput(JSON.parse(jsonMatch[1]));
    } catch {
      return null;
    }
  }
}
