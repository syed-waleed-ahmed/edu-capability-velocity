"use client";

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
    isHistoryOpen,
    closeHistory,
    startNewChat,
    theme,
    setTheme,
  } = useChatContext();

  const handleRename = (sessionId: string, title: string) => {
    const renamed = window.prompt("Rename chat", title)?.trim();
    if (!renamed) {
      return;
    }

    renameHistorySession(sessionId, renamed);
  };

  const handleDelete = (sessionId: string) => {
    const shouldDelete = window.confirm(
      "Delete this chat from history? This cannot be undone."
    );

    if (!shouldDelete) {
      return;
    }

    deleteHistorySession(sessionId);
  };

  return (
    <>
      <div
        className={isHistoryOpen ? styles.mobileBackdropVisible : styles.mobileBackdrop}
        onClick={closeHistory}
        role="presentation"
      />

      <aside
        className={isHistoryOpen ? styles.sidebarOpen : styles.sidebar}
        aria-label="Chat history sidebar"
      >
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Conversation Memory</p>
            <h2 className={styles.title}>Chat History</h2>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={closeHistory}
            aria-label="Close history"
          >
            Close
          </button>
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
          <button type="button" className={styles.secondaryAction} onClick={clearHistory}>
            Clear history
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
                      <div className={styles.sessionActions}>
                        <button
                          type="button"
                          className={styles.iconButton}
                          aria-label={`Rename ${session.title}`}
                          onClick={() => handleRename(session.id, session.title)}
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
          <p className={styles.footerLabel}>Theme</p>
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
    </>
  );
}
