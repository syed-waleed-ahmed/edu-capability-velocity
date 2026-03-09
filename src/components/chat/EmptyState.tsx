"use client";

import { useChatContext } from "@/context/ChatContext";
import { SuggestionChip } from "./SuggestionChip";
import styles from "./EmptyState.module.css";

export function EmptyState() {
  const { selectedAgent, setInputText } = useChatContext();

  return (
    <div className={styles.container}>
      <div className={styles.icon}>{selectedAgent.icon}</div>
      <h2 className={styles.title}>{selectedAgent.name}</h2>
      <p className={styles.description}>{selectedAgent.description}</p>

      <div className={styles.suggestions}>
        {selectedAgent.suggestions.map((suggestion) => (
          <SuggestionChip
            key={suggestion}
            text={suggestion}
            onClick={setInputText}
          />
        ))}
      </div>
    </div>
  );
}
