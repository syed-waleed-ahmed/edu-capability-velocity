"use client";

import { StructuredRenderer } from "@/components/StructuredRenderer";
import { parseStructuredOutputFromText } from "@/lib/structured-output-parser";
import styles from "./ChatBubble.module.css";
import type { UIMessage } from "ai";

interface ChatBubbleProps {
  message: UIMessage;
}

function getTextFromMessage(message: UIMessage): string {
  if (!message.parts) return "";
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text"
    )
    .map((part) => part.text)
    .join("");
}

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const codeBlock = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i);

  return codeBlock ? codeBlock[1].trim() : text;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const text = getTextFromMessage(message);
  const fallbackText = !isUser ? stripCodeFence(text) : text;
  const structuredData = !isUser ? parseStructuredOutputFromText(text) : null;

  return (
    <div className={isUser ? styles.wrapperUser : styles.wrapperAssistant}>
      <div className={styles.label}>
        {isUser ? "You" : "Assistant"}
      </div>

      {structuredData ? (
        <StructuredRenderer data={structuredData} />
      ) : (
        <div
          className={isUser ? styles.bubbleUser : styles.bubbleAssistant}
        >
          {fallbackText || "..."}
        </div>
      )}
    </div>
  );
}
