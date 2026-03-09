"use client";

import React, { useState } from "react";
import type { StudyPlan } from "@/schemas/study-plan";
import styles from "./StudyPlanView.module.css";

interface StudyPlanViewProps {
  data: StudyPlan;
}

export function StudyPlanView({ data }: StudyPlanViewProps) {
  const [expandedSession, setExpandedSession] = useState<number | null>(0);

  const toggle = (index: number) => {
    setExpandedSession(expandedSession === index ? null : index);
  };

  return (
    <div className={styles.plan}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.badge}>📋 Study Plan</span>
        <h2 className={styles.planTitle}>{data.title}</h2>
        <div className={styles.meta}>
          <span>⏱ {data.totalDuration}</span>
          <span>📚 {data.subject}</span>
        </div>
      </div>

      {/* Sessions */}
      <div className={styles.sessions}>
        {data.sessions.map((session, i) => {
          const isExpanded = expandedSession === i;

          return (
            <div key={i} className={styles.session}>
              <button
                type="button"
                className={styles.sessionHeader}
                onClick={() => toggle(i)}
                aria-expanded={isExpanded}
                aria-controls={`study-plan-session-${i}`}
              >
                <span className={styles.sessionTitle}>
                  Day {session.day}: {session.topic}
                </span>
                <span className={styles.sessionDuration}>
                  {session.durationMinutes}min {isExpanded ? "▲" : "▼"}
                </span>
              </button>

              {isExpanded && (
                <div id={`study-plan-session-${i}`} className={styles.sessionBody}>
                  {/* Activities */}
                  {session.activities && session.activities.length > 0 && (
                    <div className={styles.activities}>
                      <div className={styles.activityLabel}>Activities</div>
                      {session.activities.map((activity, j) => (
                        <div key={j} className={styles.activity}>
                          <div className={styles.activityDot} />
                          {activity}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resources */}
                  {session.resources && session.resources.length > 0 && (
                    <>
                      <div className={styles.resourceLabel}>Resources</div>
                      {session.resources.map((resource, j) => (
                        <div key={j} className={styles.resource}>
                          📎 {resource}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Milestones */}
      {data.milestones && data.milestones.length > 0 && (
        <div className={styles.sessions} style={{ marginTop: "16px" }}>
          <div className={styles.activityLabel}>🏁 Milestones</div>
          {data.milestones.map((milestone, i) => (
            <div key={i} className={styles.milestone}>
              <div className={styles.milestoneHeader}>
                <span className={styles.sessionTitle}>
                  <span className={styles.milestoneIcon}>🏁</span>
                  {milestone.name}
                </span>
                <span className={styles.sessionDuration}>
                  By day {milestone.byDay}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
