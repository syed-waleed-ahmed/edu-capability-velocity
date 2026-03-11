"use client";

import { useEffect } from "react";
import styles from "@/components/chat/EmptyState.module.css";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "var(--color-bg-base)",
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-family-sans)",
        textAlign: "center",
        padding: "var(--space-2xl)",
      }}
    >
      <div className={styles.icon}>⚠️</div>
      <h2 className={styles.title} style={{ marginTop: "var(--space-xl)" }}>Something went wrong!</h2>
      <p
        className={styles.description}
        style={{ maxWidth: "500px", margin: "var(--space-md) auto var(--space-xl)" }}
      >
        An unexpected error has occurred in the application. Please try reloading the page or resetting the task.
      </p>
      <button
        onClick={() => reset()}
        style={{
          background: "var(--gradient-accent)",
          color: "var(--color-on-accent)",
          border: "none",
          padding: "10px var(--space-xl)",
          borderRadius: "var(--radius-pill)",
          cursor: "pointer",
          fontWeight: 600,
          boxShadow: "0 10px 22px rgba(31, 95, 191, 0.2)",
          transition: "filter 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.07)")}
        onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
      >
        Try again
      </button>
    </div>
  );
}
