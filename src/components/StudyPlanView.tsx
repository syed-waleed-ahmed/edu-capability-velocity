"use client";

import React, { useState } from "react";
import type { StudyPlan } from "@/schemas/study-plan";

interface StudyPlanViewProps {
  data: StudyPlan;
}

export function StudyPlanView({ data }: StudyPlanViewProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #14532d 0%, #064e3b 100%)",
        borderRadius: "16px",
        padding: "28px",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        maxWidth: "580px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <span
          style={{
            background: "rgba(34, 197, 94, 0.2)",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            color: "#86efac",
          }}
        >
          📅 Study Plan
        </span>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 700,
            margin: "8px 0 4px",
          }}
        >
          {data.title}
        </h2>
        <p style={{ fontSize: "14px", opacity: 0.6, margin: 0 }}>
          {data.subject} · {data.totalDuration} ·{" "}
          {data.sessions.length} sessions
        </p>
      </div>

      {/* Milestones */}
      {data.milestones.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          {data.milestones.map((milestone, i) => (
            <div
              key={i}
              style={{
                background: "rgba(34,197,94,0.15)",
                border: "1px solid rgba(34,197,94,0.3)",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            >
              🏁 Day {milestone.byDay}: {milestone.name}
            </div>
          ))}
        </div>
      )}

      {/* Sessions Timeline */}
      <div style={{ position: "relative" }}>
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            left: "15px",
            top: "20px",
            bottom: "20px",
            width: "2px",
            background: "rgba(34,197,94,0.2)",
          }}
        />

        {data.sessions.map((session, i) => {
          const isExpanded = expandedDay === i;
          const hasMilestone = data.milestones.some(
            (m) => m.byDay === session.day
          );

          return (
            <div
              key={i}
              onClick={() => setExpandedDay(isExpanded ? null : i)}
              style={{
                position: "relative",
                paddingLeft: "40px",
                marginBottom: "12px",
                cursor: "pointer",
              }}
            >
              {/* Timeline dot */}
              <div
                style={{
                  position: "absolute",
                  left: "8px",
                  top: "16px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: hasMilestone
                    ? "#22c55e"
                    : isExpanded
                      ? "#4ade80"
                      : "rgba(34,197,94,0.3)",
                  border: `2px solid ${hasMilestone ? "#86efac" : "rgba(34,197,94,0.2)"}`,
                  transition: "all 0.2s",
                  zIndex: 1,
                }}
              />

              <div
                style={{
                  background: isExpanded
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(255,255,255,0.03)",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        opacity: 0.4,
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      Day {session.day}
                    </span>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 500,
                        marginTop: "2px",
                      }}
                    >
                      {session.topic}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      opacity: 0.5,
                      background: "rgba(255,255,255,0.06)",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      flexShrink: 0,
                    }}
                  >
                    {session.durationMinutes} min
                  </span>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: "14px" }}>
                    {/* Activities */}
                    <div style={{ marginBottom: "12px" }}>
                      <div
                        style={{
                          fontSize: "11px",
                          opacity: 0.5,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "6px",
                        }}
                      >
                        Activities
                      </div>
                      {session.activities.map((activity, j) => (
                        <div
                          key={j}
                          style={{
                            fontSize: "13px",
                            opacity: 0.8,
                            padding: "4px 0",
                            display: "flex",
                            gap: "8px",
                          }}
                        >
                          <span style={{ opacity: 0.4 }}>•</span>
                          {activity}
                        </div>
                      ))}
                    </div>

                    {/* Resources */}
                    {session.resources.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontSize: "11px",
                            opacity: 0.5,
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                            marginBottom: "6px",
                          }}
                        >
                          Resources
                        </div>
                        {session.resources.map((resource, j) => (
                          <div
                            key={j}
                            style={{
                              fontSize: "13px",
                              opacity: 0.7,
                              padding: "3px 0",
                              display: "flex",
                              gap: "8px",
                            }}
                          >
                            <span>📎</span>
                            {resource}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
