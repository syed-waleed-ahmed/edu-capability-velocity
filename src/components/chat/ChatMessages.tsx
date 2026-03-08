"use client";

import { useEffect, useRef } from "react";
import { useChatContext } from "@/context/ChatContext";
import { ChatBubble } from "./ChatBubble";
import { EmptyState } from "./EmptyState";
import { LoadingIndicator } from "./LoadingIndicator";
import styles from "./ChatMessages.module.css";

export function ChatMessages() {
  const { messages, isLoading } = useChatContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0;

  return (
    <main className={isEmpty ? styles.empty : styles.hasMessages}>
      {isEmpty ? (
        <EmptyState />
      ) : (
        messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))
      )}

      {isLoading && <LoadingIndicator />}

      <div ref={bottomRef} />
    </main>
  );
}
