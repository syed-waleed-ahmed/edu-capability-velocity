"use client";

import { useChatContext } from "@/context/ChatContext";
import { StructuredRenderer } from "@/components/StructuredRenderer";
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

function tryParseStructuredOutput(
  text: string
): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && parsed.type) return parsed;
  } catch {
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed && typeof parsed === "object" && parsed.type) return parsed;
      } catch {
        /* not JSON */
      }
    }
  }
  return null;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const { selectedAgent } = useChatContext();
  const isUser = message.role === "user";
  const text = getTextFromMessage(message);
  const structuredData = !isUser ? tryParseStructuredOutput(text) : null;

  return (
    <div className={isUser ? styles.wrapperUser : styles.wrapperAssistant}>
      <div className={styles.label}>
        {isUser ? "You" : selectedAgent.name}
      </div>

      {structuredData ? (
        <StructuredRenderer data={structuredData} />
      ) : (
        <div
          className={isUser ? styles.bubbleUser : styles.bubbleAssistant}
          style={
            isUser
              ? {
                  background: `${selectedAgent.color}18`,
                  border: `1px solid ${selectedAgent.color}30`,
                }
              : undefined
          }
        >
          {text || "..."}
        </div>
      )}
    </div>
  );
}
