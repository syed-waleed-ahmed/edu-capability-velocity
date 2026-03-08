"use client";

import styles from "./SuggestionChip.module.css";

interface SuggestionChipProps {
  text: string;
  onClick: (text: string) => void;
}

export function SuggestionChip({ text, onClick }: SuggestionChipProps) {
  return (
    <button className={styles.chip} onClick={() => onClick(text)}>
      {text}
    </button>
  );
}
