import { z } from "zod";
import { driveStudyPackageSchema } from "./drive-study-package";
import { flashcardSchema } from "./flashcard";
import { quizSchema } from "./quiz";
import { studyPackageSchema } from "./study-package";
import { studyPlanSchema } from "./study-plan";

export const structuredOutputSchema = z.discriminatedUnion("type", [
  driveStudyPackageSchema,
  studyPackageSchema,
  flashcardSchema,
  quizSchema,
  studyPlanSchema,
]);

export type StructuredOutput = z.infer<typeof structuredOutputSchema>;

export function parseStructuredOutput(value: unknown): StructuredOutput | null {
  const parsed = structuredOutputSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
