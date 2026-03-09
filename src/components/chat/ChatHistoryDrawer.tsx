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
    clearHistory,
    isHistoryOpen,
    closeHistory,
    startNewChat,
  } = useChatContext();

  if (!isHistoryOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={closeHistory} role="presentation">
      <aside
        className={styles.drawer}
        aria-label="Chat history"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Conversation Memory</p>
            <h2 className={styles.title}>Chat History</h2>
          </div>
          <button type="button" className={styles.closeButton} onClick={closeHistory}>
            Close
          </button>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.primaryAction} onClick={startNewChat}>
            New chat
          </button>
          <button type="button" className={styles.secondaryAction} onClick={clearHistory}>
            Clear history
          </button>
        </div>

        {historySessions.length === 0 ? (
          <p className={styles.emptyState}>No chats saved yet.</p>
        ) : (
          <ul className={styles.sessionList}>
            {historySessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const agent = getAgentById(session.agentId);

              return (
                <li key={session.id}>
                  <button
                    type="button"
                    className={isActive ? styles.sessionItemActive : styles.sessionItem}
                    onClick={() => openHistorySession(session.id)}
                  >
                    <div className={styles.sessionTopRow}>
                      <span className={styles.sessionTitle}>{session.title}</span>
                      <span className={styles.sessionTime}>
                        {formatTimestamp(session.updatedAt)}
                      </span>
                    </div>
                    <div className={styles.sessionMeta}>
                      <span>{agent.name}</span>
                      <span>{session.messageCount} messages</span>
                    </div>
                    <p className={styles.sessionPreview}>{session.preview}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>
    </div>
  );
}
