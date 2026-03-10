"use client";

import { KeyboardEvent, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { StructuredRenderer } from "@/components/StructuredRenderer";
import { parseStructuredOutputFromText } from "@/lib/structured-output-parser";
import { useChatContext } from "@/context/ChatContext";
import styles from "./ChatBubble.module.css";
import type { UIMessage } from "ai";

interface ChatBubbleProps {
  message: UIMessage;
}

function getTextFromMessage(message: UIMessage): string {
  if (!message.parts) {
    return "";
  }

  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text"
    )
    .map((part) => part.text)
    .join("")
    .trim();
}

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const codeBlock = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/i);

  return codeBlock ? codeBlock[1].trim() : text;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const {
    editUserMessage,
    deleteMessage,
    regenerateAssistantResponse,
    isLoading,
  } = useChatContext();

  const isUser = message.role === "user";
  const text = getTextFromMessage(message);
  const fallbackText = !isUser ? stripCodeFence(text) : text;
  const structuredData = !isUser ? parseStructuredOutputFromText(text) : null;

  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(text);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDraftText(text);
  }, [text]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCopied(false);
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    const value = structuredData
      ? JSON.stringify(structuredData, null, 2)
      : fallbackText;

    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleSaveEdit = async () => {
    const nextValue = draftText.trim();
    if (!nextValue) {
      return;
    }

    setIsEditing(false);
    await editUserMessage(message.id, nextValue);
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setDraftText(text);
      setIsEditing(false);
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSaveEdit();
    }
  };

  return (
    <div className={isUser ? styles.wrapperUser : styles.wrapperAssistant}>
      <div className={styles.label}>{isUser ? "You" : "Assistant"}</div>

      {isUser && isEditing ? (
        <div className={styles.editorPanel}>
          <textarea
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            onKeyDown={handleEditKeyDown}
            className={styles.editorInput}
            aria-label="Edit message"
            rows={3}
          />
          <div className={styles.editorActions}>
            <button
              type="button"
              className={styles.editorButtonPrimary}
              onClick={() => void handleSaveEdit()}
            >
              Save
            </button>
            <button
              type="button"
              className={styles.editorButtonSecondary}
              onClick={() => {
                setDraftText(text);
                setIsEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : structuredData ? (
        <StructuredRenderer data={structuredData} />
      ) : (
        <div className={isUser ? styles.bubbleUser : styles.bubbleAssistant}>
          <div className={styles.markdown}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {fallbackText || "..."}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {!isEditing && (
        <div
          className={
            isUser ? styles.actionRowUser : styles.actionRowAssistant
          }
        >
          <button
            type="button"
            className={styles.actionButton}
            aria-label={copied ? "Copied" : "Copy message"}
            onClick={handleCopy}
          >
            {copied ? "✓" : "⧉"}
          </button>

          {isUser ? (
            <button
              type="button"
              className={styles.actionButton}
              aria-label="Edit your message"
              onClick={() => setIsEditing(true)}
            >
              ✎
            </button>
          ) : (
            <button
              type="button"
              className={styles.actionButton}
              aria-label="Regenerate response"
              onClick={() => void regenerateAssistantResponse(message.id)}
              disabled={isLoading}
            >
              ↻
            </button>
          )}

          <button
            type="button"
            className={styles.actionButtonDanger}
            aria-label="Delete message"
            onClick={() => deleteMessage(message.id)}
          >
            ✖
          </button>
        </div>
      )}
    </div>
  );
}
