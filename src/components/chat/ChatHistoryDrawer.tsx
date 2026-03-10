"use client";

import { KeyboardEvent, useState } from "react";
import { getAgentById } from "@/config/agents.config";
import { useChatContext } from "@/context/ChatContext";
import styles from "./ChatHistoryDrawer.module.css";

function formatTimestamp(iso: string): string {
  const timestamp = new Date(iso);
  if (Number.isNaN(timestamp.valueOf())) {
    return "Unknown time";
  }

  return timestamp.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatHistoryDrawer() {
  const {
    historySessions,
    activeSessionId,
    openHistorySession,
    renameHistorySession,
    deleteHistorySession,
    clearHistory,
    startNewChat,
    theme,
    setTheme,
  } = useChatContext();

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  const beginRename = (sessionId: string, title: string) => {
    setEditingSessionId(sessionId);
    setDraftTitle(title);
  };

  const handleDelete = (sessionId: string) => {
    deleteHistorySession(sessionId);

    if (editingSessionId === sessionId) {
      setEditingSessionId(null);
      setDraftTitle("");
    }
  };

  const saveRename = (sessionId: string) => {
    const nextTitle = draftTitle.trim();
    if (!nextTitle) {
      return;
    }

    renameHistorySession(sessionId, nextTitle);
    setEditingSessionId(null);
    setDraftTitle("");
  };

  const cancelRename = () => {
    setEditingSessionId(null);
    setDraftTitle("");
  };

  const handleRenameKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    sessionId: string
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveRename(sessionId);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelRename();
    }
  };

  return (
    <aside className={styles.sidebar} aria-label="Chat history sidebar">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Conversation Memory</p>
            <h2 className={styles.title}>Chat History</h2>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryAction}
            onClick={startNewChat}
            aria-label="Start a new chat"
          >
            <span className={styles.actionIcon}>✚</span>
            New chat
          </button>
        </div>

        <div className={styles.listHeader}>
          <p className={styles.listTitle}>Recent chats</p>
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={clearHistory}
          >
            Clear all
          </button>
        </div>

        {historySessions.length === 0 ? (
          <p className={styles.emptyState}>
            Start a conversation to save it in history.
          </p>
        ) : (
          <ul className={styles.sessionList}>
            {historySessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const agent = getAgentById(session.agentId);

              return (
                <li key={session.id}>
                  <article
                    className={isActive ? styles.sessionItemActive : styles.sessionItem}
                  >
                    <div className={styles.sessionTopRow}>
                      {editingSessionId === session.id ? (
                        <div className={styles.renameEditor}>
                          <input
                            value={draftTitle}
                            onChange={(event) => setDraftTitle(event.target.value)}
                            onKeyDown={(event) => handleRenameKeyDown(event, session.id)}
                            className={styles.renameInput}
                            autoFocus
                            aria-label={`Rename ${session.title}`}
                          />
                          <div className={styles.renameActions}>
                            <button
                              type="button"
                              className={styles.iconButton}
                              onClick={() => saveRename(session.id)}
                              aria-label="Save rename"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              className={styles.iconButton}
                              onClick={cancelRename}
                              aria-label="Cancel rename"
                            >
                              ↺
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={styles.sessionMain}
                          onClick={() => openHistorySession(session.id)}
                        >
                          <span className={styles.sessionTitle}>{session.title}</span>
                          <span className={styles.sessionTime}>
                            {formatTimestamp(session.updatedAt)}
                          </span>
                        </button>
                      )}

                      <div className={styles.sessionActions}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          aria-label={`Rename ${session.title}`}
                          onClick={() => beginRename(session.id, session.title)}
                          disabled={editingSessionId === session.id}
                        >
                          ✏
                        </button>
                        <button
                          type="button"
                          className={styles.iconButtonDanger}
                          aria-label={`Delete ${session.title}`}
                          onClick={() => handleDelete(session.id)}
                        >
                          ✖
                        </button>
                      </div>
                    </div>
                    <div className={styles.sessionMeta}>
                      <span>{agent.name}</span>
                      <span>{session.messageCount} messages</span>
                    </div>
                    <p className={styles.sessionPreview}>{session.preview}</p>
                  </article>
                </li>
              );
            })}
          </ul>
        )}

        <div className={styles.footer}>
          <p className={styles.footerLabel}>Appearance</p>
          <div className={styles.themeSwitch}>
            <button
              type="button"
              className={theme === "light" ? styles.themeButtonActive : styles.themeButton}
              onClick={() => setTheme("light")}
            >
              Light
            </button>
            <button
              type="button"
              className={theme === "dark" ? styles.themeButtonActive : styles.themeButton}
              onClick={() => setTheme("dark")}
            >
              Dark
            </button>
          </div>
        </div>
    </aside>
  );
}
