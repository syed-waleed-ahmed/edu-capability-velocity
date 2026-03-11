import Link from "next/link";
import styles from "@/components/chat/EmptyState.module.css";

export default function NotFound() {
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
      <div className={styles.icon}>🧭</div>
      <h2 className={styles.title} style={{ marginTop: "var(--space-xl)" }}>404 - Page Not Found</h2>
      <p
        className={styles.description}
        style={{ maxWidth: "500px", margin: "var(--space-md) auto var(--space-xl)" }}
      >
        We couldn&apos;t find the page you were looking for. It might have been moved or deleted.
      </p>
      <Link
        href="/"
        style={{
          background: "var(--gradient-accent)",
          color: "var(--color-on-accent)",
          border: "none",
          padding: "10px var(--space-xl)",
          borderRadius: "var(--radius-pill)",
          cursor: "pointer",
          fontWeight: 600,
          boxShadow: "0 10px 22px rgba(31, 95, 191, 0.2)",
          textDecoration: "none",
          transition: "filter 0.2s ease",
        }}
      >
        Return Home
      </Link>
    </div>
  );
}
