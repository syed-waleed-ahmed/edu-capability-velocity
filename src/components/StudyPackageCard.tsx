"use client";

import React, { useState } from "react";
import type { StudyPackage } from "@/schemas/study-package";

interface StudyPackageCardProps {
  data: StudyPackage;
}

export function StudyPackageCard({ data }: StudyPackageCardProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const difficultyColor = {
    beginner: "#22c55e",
    intermediate: "#eab308",
    advanced: "#ef4444",
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        borderRadius: "16px",
        padding: "28px",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        maxWidth: "640px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,0.1)",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            📚 Study Package
          </span>
          <span
            style={{
              background: difficultyColor[data.difficulty],
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {data.difficulty}
          </span>
        </div>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            margin: "8px 0 4px",
          }}
        >
          {data.title}
        </h2>
        <p style={{ fontSize: "14px", opacity: 0.7, margin: 0 }}>
          {data.subject} · {data.totalReadingTimeMinutes} min total
        </p>
      </div>

      {/* Key Concepts */}
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "12px",
            opacity: 0.8,
          }}
        >
          🔑 Key Concepts
        </h3>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {data.keyConcepts.map((concept, i) => (
            <div
              key={i}
              title={concept.definition}
              style={{
                background: "rgba(99, 102, 241, 0.3)",
                border: "1px solid rgba(99, 102, 241, 0.5)",
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                cursor: "help",
                transition: "all 0.2s",
              }}
            >
              {concept.term}
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div>
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "12px",
            opacity: 0.8,
          }}
        >
          📖 Sections
        </h3>
        {data.sections.map((section, i) => (
          <div
            key={i}
            onClick={() =>
              setExpandedSection(expandedSection === i ? null : i)
            }
            style={{
              background:
                expandedSection === i
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.03)",
              borderRadius: "10px",
              padding: "14px 16px",
              marginBottom: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 500, fontSize: "15px" }}>
                {data.suggestedReadingOrder.indexOf(section.title) + 1 > 0
                  ? `${data.suggestedReadingOrder.indexOf(section.title) + 1}. `
                  : ""}
                {section.title}
              </span>
              <span
                style={{ fontSize: "12px", opacity: 0.5, flexShrink: 0 }}
              >
                {section.readingTimeMinutes} min
              </span>
            </div>
            {expandedSection === i && (
              <p
                style={{
                  fontSize: "13px",
                  opacity: 0.75,
                  marginTop: "10px",
                  lineHeight: "1.6",
                }}
              >
                {section.summary}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
