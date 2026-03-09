import Link from "next/link";
import styles from "../legal.module.css";

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <p className={styles.kicker}>Legal</p>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.subtitle}>Last updated: March 8, 2026</p>

        <section className={styles.section}>
          <h2>1. Service Scope</h2>
          <p>
            EDU Capability Velocity provides AI-assisted educational content generation,
            including flashcards, quizzes, study plans, and study-package outputs.
            Generated outputs are assistive and must be reviewed by educators or users
            before high-stakes usage.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Commercial License and Accounts</h2>
          <p>
            Commercial use requires a valid subscription or written license agreement.
            You are responsible for account security, API key handling, and ensuring
            only authorized personnel access the platform.
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. Acceptable Use</h2>
          <ul>
            <li>No unlawful, abusive, or deceptive use of the service.</li>
            <li>No attempts to bypass rate limits, authentication, or access controls.</li>
            <li>
              No use of generated outputs as sole authority for medical, legal, or
              safety-critical decisions.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. AI Output Disclaimer</h2>
          <p>
            AI outputs may contain inaccuracies or omissions. You must independently
            validate generated material, especially in grading, certification,
            or institutional decision workflows.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Data and Ownership</h2>
          <p>
            You retain ownership of content you provide. MemorAIz retains ownership of
            the platform, software, and proprietary models, integrations, and workflows.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, the service is provided &quot;as is&quot;
            without warranties, and MemorAIz is not liable for indirect or
            consequential damages arising from service use.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Contact</h2>
          <p>Questions about these terms: damiano@memoraiz.com</p>
        </section>

        <Link href="/legal" className={styles.backLink}>
          Back to legal home
        </Link>
      </div>
    </main>
  );
}
