import { z } from "zod";

export const flashcardSchema = z.object({
  type: z.literal("flashcards"),
  deckTitle: z.string().describe("Title of the flashcard deck"),
  subject: z.string().describe("Subject area"),
  cards: z
    .array(
      z.object({
        front: z
          .string()
          .describe("Question or prompt shown on the front of the card"),
        back: z
          .string()
          .describe("Answer or explanation shown on the back of the card"),
        difficulty: z
          .enum(["easy", "medium", "hard"])
          .describe("Difficulty level of this card"),
      })
    )
    .min(5)
    .describe("The flashcard deck — minimum 5 cards"),
  totalCards: z.number().describe("Total number of flashcards in the deck"),
});

export type FlashcardDeck = z.infer<typeof flashcardSchema>;
