import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StructuredRenderer } from "@/components/StructuredRenderer";

describe("StructuredRenderer", () => {
  it("renders study-package card", () => {
    render(
      <StructuredRenderer
        data={{
          type: "study-package",
          title: "Physics Revision",
          subject: "Physics",
          difficulty: "beginner",
          keyConcepts: [
            { term: "Force", definition: "Push or pull." },
            { term: "Mass", definition: "Amount of matter." },
            { term: "Acceleration", definition: "Rate of velocity change." },
            { term: "Energy", definition: "Capacity to do work." },
            { term: "Momentum", definition: "Mass times velocity." },
          ],
          sections: [
            {
              title: "Newton Basics",
              summary: "Learn Newton's laws and examples.",
              readingTimeMinutes: 25,
            },
          ],
          suggestedReadingOrder: ["Newton Basics"],
          totalReadingTimeMinutes: 25,
        }}
      />
    );

    expect(screen.getByText("Physics Revision")).toBeInTheDocument();
  });

  it("renders flashcards deck", () => {
    render(
      <StructuredRenderer
        data={{
          type: "flashcards",
          deckTitle: "Chemistry Quick Deck",
          subject: "Chemistry",
          cards: [
            { front: "H2O is?", back: "Water", difficulty: "easy" },
            { front: "NaCl is?", back: "Salt", difficulty: "easy" },
            { front: "pH 7 means?", back: "Neutral", difficulty: "easy" },
            {
              front: "Atomic number means?",
              back: "Number of protons",
              difficulty: "medium",
            },
            {
              front: "Avogadro constant?",
              back: "6.022e23",
              difficulty: "hard",
            },
          ],
          totalCards: 5,
        }}
      />
    );

    expect(screen.getByText("Chemistry Quick Deck")).toBeInTheDocument();
  });

  it("renders quiz runner", () => {
    render(
      <StructuredRenderer
        data={{
          type: "quiz",
          title: "History Check",
          subject: "History",
          difficulty: "medium",
          questions: [
            {
              id: 1,
              question: "When did WW2 start?",
              type: "multiple_choice",
              options: ["1939", "1941", "1914", "1945"],
              correctAnswer: "1939",
              explanation: "Germany invaded Poland in 1939.",
            },
            {
              id: 2,
              question: "Who was the UK PM in early WW2?",
              type: "multiple_choice",
              options: ["Churchill", "Attlee", "Thatcher", "Blair"],
              correctAnswer: "Churchill",
              explanation: "Winston Churchill became PM in 1940.",
            },
            {
              id: 3,
              question: "What was D-Day?",
              type: "open_ended",
              correctAnswer: "Allied invasion of Normandy in 1944",
              explanation: "D-Day refers to the Normandy landings.",
            },
          ],
          totalQuestions: 3,
        }}
      />
    );

    expect(screen.getByText("History Check")).toBeInTheDocument();
  });

  it("renders study plan", () => {
    render(
      <StructuredRenderer
        data={{
          type: "study-plan",
          title: "Calculus Prep",
          subject: "Math",
          totalDuration: "3 days",
          sessions: [
            {
              day: 1,
              topic: "Limits",
              activities: ["Read notes", "Solve 10 exercises"],
              durationMinutes: 45,
              resources: ["Chapter 1"],
            },
            {
              day: 2,
              topic: "Derivatives",
              activities: ["Watch lecture"],
              durationMinutes: 40,
              resources: ["Chapter 2"],
            },
            {
              day: 3,
              topic: "Applications",
              activities: ["Mixed practice"],
              durationMinutes: 50,
              resources: ["Worksheet"],
            },
          ],
          milestones: [{ name: "Finish fundamentals", byDay: 2 }],
        }}
      />
    );

    expect(screen.getByText("Calculus Prep")).toBeInTheDocument();
  });

  it("renders drive study package panel", () => {
    render(
      <StructuredRenderer
        data={{
          type: "drive-study-package",
          title: "Drive Imported Algebra",
          subject: "Math",
          difficulty: "intermediate",
          keyConcepts: [
            { term: "Variable", definition: "Symbol representing unknown." },
            { term: "Equation", definition: "Statement of equality." },
            { term: "Term", definition: "Single mathematical expression." },
            { term: "Factor", definition: "Number that divides another." },
            { term: "Coefficient", definition: "Number multiplying variable." },
          ],
          sections: [
            {
              title: "Core Notes",
              summary: "Foundational algebra skills from Drive docs.",
              readingTimeMinutes: 30,
            },
          ],
          suggestedReadingOrder: ["Core Notes"],
          totalReadingTimeMinutes: 30,
          source: {
            provider: "google-drive",
            folderId: "folder-abc",
            fileCount: 1,
            files: [
              {
                id: "file-abc",
                name: "algebra-notes",
                mimeType: "text/plain",
                sizeBytes: 1024,
              },
            ],
          },
        }}
      />
    );

    expect(screen.getByText("Google Drive Source")).toBeInTheDocument();
    expect(screen.getByText("Drive Imported Algebra")).toBeInTheDocument();
  });
});
