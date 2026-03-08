"use client";

import { useChatContext } from "@/context/ChatContext";
import styles from "./LoadingIndicator.module.css";

export function LoadingIndicator() {
  const { selectedAgent } = useChatContext();

  return (
    <div className={styles.container}>
      <div
        className={styles.dot}
        style={{ background: selectedAgent.color }}
      />
      <span className={styles.text}>
        {selectedAgent.name} is thinking...
      </span>
    </div>
  );
}
