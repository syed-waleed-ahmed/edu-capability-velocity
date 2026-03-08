import { z } from "zod";

export const studyPlanSchema = z.object({
  type: z.literal("study-plan"),
  title: z.string().describe("Title of the study plan"),
  subject: z.string().describe("Subject area"),
  totalDuration: z
    .string()
    .describe("Human-readable total duration (e.g., '2 weeks')"),
  sessions: z
    .array(
      z.object({
        day: z.number().describe("Day number in the plan"),
        topic: z.string().describe("Topic to study this session"),
        activities: z
          .array(z.string())
          .describe("List of study activities for this session"),
        durationMinutes: z
          .number()
          .describe("Duration of this session in minutes"),
        resources: z
          .array(z.string())
          .describe("Suggested resources or materials"),
      })
    )
    .min(3)
    .describe("Study sessions — minimum 3"),
  milestones: z
    .array(
      z.object({
        name: z
          .string()
          .describe("Milestone name (e.g., 'Complete Chapter 1')"),
        byDay: z.number().describe("Target day to reach this milestone"),
      })
    )
    .describe("Key milestones to track progress"),
});

export type StudyPlan = z.infer<typeof studyPlanSchema>;
