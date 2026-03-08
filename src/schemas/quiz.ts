import { z } from "zod";

export const quizSchema = z.object({
  type: z.literal("quiz"),
  title: z.string().describe("Title of the quiz"),
  subject: z.string().describe("Subject area"),
  difficulty: z
    .enum(["easy", "medium", "hard"])
    .describe("Overall quiz difficulty"),
  questions: z
    .array(
      z.object({
        id: z.number().describe("Question number"),
        question: z.string().describe("The question text"),
        type: z
          .enum(["multiple_choice", "open_ended"])
          .describe("Question type"),
        options: z
          .array(z.string())
          .optional()
          .describe("Answer options (for multiple choice only)"),
        correctAnswer: z.string().describe("The correct answer"),
        explanation: z
          .string()
          .describe("Explanation of why this answer is correct"),
      })
    )
    .min(3)
    .describe("Quiz questions — minimum 3"),
  totalQuestions: z.number().describe("Total number of questions"),
});

export type Quiz = z.infer<typeof quizSchema>;
