"use client";

import React, { useState } from "react";
import type { StudyPackage } from "@/schemas/study-package";
import styles from "./StudyPackageCard.module.css";

interface StudyPackageCardProps {
  data: StudyPackage;
}

export function StudyPackageCard({ data }: StudyPackageCardProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const toggle = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.badge}>📦 Study Package</span>
        <h2 className={styles.packageTitle}>{data.title}</h2>
        <div className={styles.summary}>
          {data.subject} · {data.difficulty} · {data.totalReadingTimeMinutes} min
        </div>
      </div>

      {/* Key Concepts */}
      {data.keyConcepts && data.keyConcepts.length > 0 && (
        <div className={styles.concepts}>
          {data.keyConcepts.map((concept, i) => (
            <span key={i} className={styles.concept} title={concept.definition}>
              {concept.term}
            </span>
          ))}
        </div>
      )}

      {/* Sections */}
      {data.sections && data.sections.length > 0 && (
        <div className={styles.sections}>
          {data.sections.map((section, i) => (
            <div key={i} className={styles.section}>
              <div className={styles.sectionHeader} onClick={() => toggle(i)}>
                <span>{section.title}</span>
                <span className={styles.sectionToggle}>
                  {section.readingTimeMinutes}min{" "}
                  {expandedSection === i ? "▲" : "▼"}
                </span>
              </div>
              {expandedSection === i && (
                <div className={styles.sectionBody}>{section.summary}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reading Order */}
      {data.suggestedReadingOrder && data.suggestedReadingOrder.length > 0 && (
        <div className={styles.readingOrder}>
          <div className={styles.readingLabel}>Suggested reading order</div>
          {data.suggestedReadingOrder.map((item, i) => (
            <div key={i} className={styles.readingItem}>
              <span className={styles.readingNumber}>{i + 1}</span>
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
