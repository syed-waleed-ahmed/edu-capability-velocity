"use client";

import { FormEvent, KeyboardEvent } from "react";
import { useChatContext } from "@/context/ChatContext";
import styles from "./ChatInput.module.css";

export function ChatInput() {
  const { selectedAgent, inputText, setInputText, sendMessage, isLoading } =
    useChatContext();

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText("");
    await sendMessage({ text });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask ${selectedAgent.name} to generate learning materials...`}
          className={styles.input}
          rows={1}
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className={styles.sendButton}
        >
          Send ↑
        </button>
      </form>
      <p className={styles.hint}>Enter to send, Shift+Enter for a new line</p>
    </div>
  );
}
