import Link from "next/link";
import styles from "./legal.module.css";

export default function LegalIndexPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <p className={styles.kicker}>Legal</p>
        <h1 className={styles.title}>Legal and Compliance</h1>
        <p className={styles.subtitle}>
          Review the product terms and privacy commitments before commercial use.
        </p>

        <section className={styles.cards}>
          <Link href="/legal/terms" className={styles.card}>
            <h2 className={styles.cardTitle}>Terms of Service</h2>
            <p className={styles.cardText}>
              Commercial terms, acceptable use, and service limitations.
            </p>
          </Link>

          <Link href="/legal/privacy" className={styles.card}>
            <h2 className={styles.cardTitle}>Privacy Policy</h2>
            <p className={styles.cardText}>
              Data processing, retention, and user privacy rights.
            </p>
          </Link>
        </section>

        <Link href="/" className={styles.backLink}>
          Return to product
        </Link>
      </div>
    </main>
  );
}
