"use client";

import { FormEvent, useRef } from "react";
import { useChatContext } from "@/context/ChatContext";
import styles from "./ChatInput.module.css";

export function ChatInput() {
  const { selectedAgent, inputText, setInputText, sendMessage, isLoading } =
    useChatContext();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText("");
    await sendMessage({ text });
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          ref={inputRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ask ${selectedAgent.name} to generate learning materials...`}
          className={styles.input}
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className={styles.sendButton}
          style={{
            background: `linear-gradient(135deg, ${selectedAgent.color}, ${selectedAgent.color}cc)`,
          }}
        >
          Send ↑
        </button>
      </form>
    </div>
  );
}
