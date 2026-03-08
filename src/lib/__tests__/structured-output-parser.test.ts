import { describe, expect, it } from "vitest";
import { parseStructuredOutputFromText } from "@/lib/structured-output-parser";

describe("parseStructuredOutputFromText", () => {
  it("normalizes quiz payloads that use snake_case answer keys", () => {
    const rawText = JSON.stringify({
      type: "quiz",
      questions: [
        {
          question: "What event is commonly considered the start of World War II?",
          options: [
            "A) The signing of the Treaty of Versailles",
            "B) The invasion of Poland by Germany",
            "C) The attack on Pearl Harbor",
            "D) The dropping of the atomic bomb",
          ],
          correct_answer: "B",
          explanation:
            "Germany invaded Poland on September 1, 1939, triggering the start of the war.",
        },
        {
          question: "Which alliance included Germany, Italy, and Japan?",
          options: ["A) Allied Powers", "B) Axis Powers", "C) Entente", "D) NATO"],
          correct_answer: "B",
          explanation: "Germany, Italy, and Japan formed the Axis Powers.",
        },
        {
          question: "What was the code name for the Allied invasion of Normandy?",
          options: ["A) Operation Torch", "B) Operation Overlord", "C) Operation Market Garden", "D) Operation Barbarossa"],
          correct_answer: "B",
          explanation: "Operation Overlord launched the D-Day landings.",
        },
      ],
    });

    const parsed = parseStructuredOutputFromText(rawText);

    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe("quiz");

    if (parsed?.type === "quiz") {
      expect(parsed.title).toBe("Generated Quiz");
      expect(parsed.subject).toBe("General");
      expect(parsed.totalQuestions).toBe(3);
      expect(parsed.questions[0].type).toBe("multiple_choice");
      expect(parsed.questions[0].correctAnswer).toBe(
        "The invasion of Poland by Germany"
      );
      expect(parsed.questions[0].options?.[0]).toBe(
        "The signing of the Treaty of Versailles"
      );
    }
  });

  it("extracts JSON objects embedded in plain assistant text", () => {
    const rawText = `Here is your quiz:\n\n{
  "type": "quiz",
  "title": "WW2 Basics",
  "subject": "History",
  "difficulty": "medium",
  "questions": [
    {
      "id": 1,
      "question": "When did WW2 start?",
      "type": "multiple_choice",
      "options": ["1939", "1940", "1941", "1945"],
      "correctAnswer": "1939",
      "explanation": "Germany invaded Poland in 1939."
    },
    {
      "id": 2,
      "question": "Who was UK PM in 1940?",
      "type": "multiple_choice",
      "options": ["Churchill", "Attlee", "Blair", "Cameron"],
      "correctAnswer": "Churchill",
      "explanation": "Churchill became PM in 1940."
    },
    {
      "id": 3,
      "question": "What was D-Day?",
      "type": "open_ended",
      "correctAnswer": "Allied invasion of Normandy in 1944",
      "explanation": "D-Day is the Normandy landings."
    }
  ],
  "totalQuestions": 3
}\n\nGood luck!`;

    const parsed = parseStructuredOutputFromText(rawText);

    expect(parsed).not.toBeNull();
    expect(parsed?.type).toBe("quiz");

    if (parsed?.type === "quiz") {
      expect(parsed.title).toBe("WW2 Basics");
      expect(parsed.questions).toHaveLength(3);
    }
  });
});
