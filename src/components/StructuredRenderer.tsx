"use client";

import React from "react";
import { StudyPackageCard } from "./micro/StudyPackageCard";
import { FlashcardDeckComponent } from "./micro/FlashcardDeck";
import { QuizRunner } from "./micro/QuizRunner";
import { StudyPlanView } from "./micro/StudyPlanView";
import { DriveStudyPackageCard } from "./micro/DriveStudyPackageCard";
import type { StructuredOutput } from "@/schemas/structured-output";
import styles from "./StructuredRenderer.module.css";

interface StructuredRendererProps {
  data: StructuredOutput;
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
  const type = data.type;

  switch (type) {
    case "drive-study-package":
      return <DriveStudyPackageCard data={data} />;
    case "study-package":
      return <StudyPackageCard data={data} />;
    case "flashcards":
      return <FlashcardDeckComponent data={data} />;
    case "quiz":
      return <QuizRunner data={data} />;
    case "study-plan":
      return <StudyPlanView data={data} />;
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
