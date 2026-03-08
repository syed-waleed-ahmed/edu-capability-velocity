import { z } from "zod";

export const studyPackageSchema = z.object({
  type: z.literal("study-package"),
  title: z.string().describe("Title of the study package"),
  subject: z.string().describe("Subject area (e.g., Biology, History)"),
  difficulty: z
    .enum(["beginner", "intermediate", "advanced"])
    .describe("Overall difficulty level"),
  keyConcepts: z
    .array(
      z.object({
        term: z.string().describe("Key term or concept name"),
        definition: z
          .string()
          .describe("Clear, concise definition of the concept"),
      })
    )
    .describe("Core concepts extracted from the source material"),
  sections: z
    .array(
      z.object({
        title: z.string().describe("Section heading"),
        summary: z.string().describe("Concise summary of this section"),
        readingTimeMinutes: z
          .number()
          .describe("Estimated reading time in minutes"),
      })
    )
    .describe("Organized sections of the study package"),
  suggestedReadingOrder: z
    .array(z.string())
    .describe("Recommended order to study the sections"),
  totalReadingTimeMinutes: z
    .number()
    .describe("Total estimated reading time in minutes"),
});

export type StudyPackage = z.infer<typeof studyPackageSchema>;
