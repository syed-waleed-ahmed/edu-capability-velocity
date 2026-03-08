"use client";

import React from "react";
import { StudyPackageCard } from "./micro/StudyPackageCard";
import { FlashcardDeckComponent } from "./micro/FlashcardDeck";
import { QuizRunner } from "./micro/QuizRunner";
import { StudyPlanView } from "./micro/StudyPlanView";
import styles from "./StructuredRenderer.module.css";

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
        <div className={styles.fallback}>
          <p className={styles.fallbackTitle}>📦 Structured Output</p>
          <pre className={styles.fallbackCode}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
  }
}
