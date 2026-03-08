import Link from "next/link";
import styles from "../legal.module.css";

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <p className={styles.kicker}>Legal</p>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.subtitle}>Last updated: March 8, 2026</p>

        <section className={styles.section}>
          <h2>1. Data We Process</h2>
          <ul>
            <li>Chat prompts and AI responses needed to provide the service.</li>
            <li>Operational telemetry (latency, success/failure, schema-validity).</li>
            <li>Connector metadata required to process integrated content sources.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>2. Purpose of Processing</h2>
          <p>
            Data is processed to generate learning outputs, improve reliability,
            detect abuse, and maintain commercial service quality.
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. Data Retention</h2>
          <p>
            Operational logs and telemetry are retained according to business and
            compliance requirements. Customers may request retention controls in
            enterprise agreements.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. Security Controls</h2>
          <ul>
            <li>Security headers enabled in production builds.</li>
            <li>Configurable API key authentication and request rate limiting.</li>
            <li>Input validation at API boundaries to reduce abuse and misuse.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. International Use</h2>
          <p>
            If deployed globally, customers are responsible for configuring the service
            in alignment with local regulations including GDPR, FERPA, and other
            jurisdiction-specific requirements.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. Contact</h2>
          <p>Privacy inquiries: damiano@memoraiz.com</p>
        </section>

        <Link href="/legal" className={styles.backLink}>
          Back to legal home
        </Link>
      </div>
    </main>
  );
}
