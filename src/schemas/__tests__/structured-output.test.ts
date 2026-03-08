import { describe, expect, it } from "vitest";
import {
  parseStructuredOutput,
  structuredOutputSchema,
} from "@/schemas/structured-output";

describe("structuredOutputSchema", () => {
  it("accepts valid flashcards payload", () => {
    const payload = {
      type: "flashcards",
      deckTitle: "Cell Biology Basics",
      subject: "Biology",
      cards: [
        {
          front: "What is a cell membrane?",
          back: "A selective barrier around the cell.",
          difficulty: "easy",
        },
        {
          front: "What does mitochondria do?",
          back: "Produces ATP through cellular respiration.",
          difficulty: "medium",
        },
        {
          front: "Where does glycolysis happen?",
          back: "In the cytoplasm.",
          difficulty: "easy",
        },
        {
          front: "What is osmosis?",
          back: "Diffusion of water across a semipermeable membrane.",
          difficulty: "medium",
        },
        {
          front: "What is ATP?",
          back: "The main energy currency of cells.",
          difficulty: "easy",
        },
      ],
      totalCards: 5,
    };

    const result = structuredOutputSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("accepts valid drive-study-package payload", () => {
    const payload = {
      type: "drive-study-package",
      title: "Linear Algebra Week 1",
      subject: "Mathematics",
      difficulty: "intermediate",
      keyConcepts: [
        { term: "Vector", definition: "An ordered list of numbers." },
        { term: "Matrix", definition: "A rectangular array of numbers." },
        {
          term: "Linear Combination",
          definition: "A weighted sum of vectors.",
        },
        {
          term: "Span",
          definition: "All vectors that can be formed from combinations.",
        },
        {
          term: "Basis",
          definition: "A linearly independent spanning set.",
        },
      ],
      sections: [
        {
          title: "Foundations",
          summary: "Covers vectors and basic operations.",
          readingTimeMinutes: 20,
        },
      ],
      suggestedReadingOrder: ["Foundations"],
      totalReadingTimeMinutes: 20,
      source: {
        provider: "google-drive",
        folderId: "folder-123",
        fileCount: 1,
        files: [
          {
            id: "file-123",
            name: "lecture-notes.md",
            mimeType: "text/markdown",
            sizeBytes: 1420,
          },
        ],
      },
    };

    const parsed = parseStructuredOutput(payload);
    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe("drive-study-package");
  });

  it("rejects unknown payload type", () => {
    const payload = {
      type: "random-type",
      foo: "bar",
    };

    const parsed = parseStructuredOutput(payload);
    expect(parsed).toBeNull();
  });
});
