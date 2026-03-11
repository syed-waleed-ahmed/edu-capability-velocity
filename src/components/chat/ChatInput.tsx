"use client";

import { FormEvent, KeyboardEvent } from "react";
import { useChatContext } from "@/context/ChatContext";
import styles from "./ChatInput.module.css";

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
);

export function ChatInput() {
  const { selectedAgent, inputText, setInputText, sendMessage, isLoading } = useChatContext();

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!inputText.trim() || isLoading) {
      return;
    }
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
          onChange={(event) => setInputText(event.target.value)}
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
          <SendIcon />
          Send
        </button>
      </form>
    </div>
  );
}
