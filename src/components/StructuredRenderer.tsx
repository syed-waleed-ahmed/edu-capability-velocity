"use client";

import React from "react";
import { StudyPackageCard } from "./StudyPackageCard";
import { FlashcardDeckComponent } from "./FlashcardDeck";
import { QuizRunner } from "./QuizRunner";
import { StudyPlanView } from "./StudyPlanView";

interface StructuredRendererProps {
  data: Record<string, unknown>;
}

/**
 * Generic JSON → UI dispatcher.
 * Inspects the `type` field in the structured JSON output and renders
 * the appropriate micro-experience component.
 *
 * This is the key piece of the capability velocity architecture:
 * any new capability that outputs JSON with a `type` field gets
 * automatic UI rendering by adding a case here.
 */
export function StructuredRenderer({ data }: StructuredRendererProps) {
  const type = data?.type as string;

  switch (type) {
    case "study-package":
      return <StudyPackageCard data={data as any} />;
    case "flashcards":
      return <FlashcardDeckComponent data={data as any} />;
    case "quiz":
      return <QuizRunner data={data as any} />;
    case "study-plan":
      return <StudyPlanView data={data as any} />;
    default:
      return (
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "12px",
            padding: "16px",
            fontFamily: "'Inter', sans-serif",
            color: "#94a3b8",
            fontSize: "13px",
          }}
        >
          <p style={{ margin: "0 0 8px", fontWeight: 600, color: "#e2e8f0" }}>
            📦 Structured Output
          </p>
          <pre
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              fontSize: "12px",
              lineHeight: "1.5",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
  }
}
