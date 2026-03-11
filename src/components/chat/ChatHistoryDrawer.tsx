"use client";

import { KeyboardEvent, useState } from "react";
import { useChatContext } from "@/context/ChatContext";
import styles from "./ChatHistoryDrawer.module.css";

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

export function ChatHistoryDrawer() {
  const {
    historySessions,
    activeSessionId,
    openHistorySession,
    renameHistorySession,
    deleteHistorySession,
    clearHistory,
    startNewChat,
    isLoading,
    theme,
    setTheme,
    isSidebarOpen,
    setSidebarOpen,
  } = useChatContext();

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single', id: string } | { type: 'all' } | null>(null);

  const beginRename = (sessionId: string, title: string) => {
    setEditingSessionId(sessionId);
    setDraftTitle(title);
  };

  const handleDelete = (sessionId: string) => {
    setDeleteConfirm({ type: 'single', id: sessionId });
  };

  const handleClearHistory = () => {
    if (historySessions.length === 0) {
      return;
    }
    setDeleteConfirm({ type: 'all' });
  };

  const executeDelete = () => {
    if (!deleteConfirm) return;
    
    if (deleteConfirm.type === 'single') {
      deleteHistorySession(deleteConfirm.id);
      if (editingSessionId === deleteConfirm.id) {
        setEditingSessionId(null);
        setDraftTitle("");
      }
    } else if (deleteConfirm.type === 'all') {
      clearHistory();
      setEditingSessionId(null);
      setDraftTitle("");
    }
    
    setDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
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

  /** Summarize session title to max ~25 chars */
  const summarize = (title: string) => {
    if (title.length <= 25) return title;
    return title.slice(0, 22) + "…";
  };

  return (
    <>
      {isSidebarOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ""}`} aria-label="Chat history sidebar">
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
            disabled={isLoading}
            aria-label="Start a new chat"
            title={isLoading ? "Wait for the current response to finish" : undefined}
          >
            <span className={styles.actionIcon}>✚</span>
            {isLoading ? "Generating…" : "New chat"}
          </button>
        </div>

        <div className={styles.listHeader}>
          <p className={styles.listTitle}>Recent chats</p>
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={handleClearHistory}
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
              const isEditing = editingSessionId === session.id;

              return (
                <li key={session.id}>
                  <article
                    className={isActive ? styles.sessionItemActive : styles.sessionItem}
                  >
                    {isEditing ? (
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
                            <CheckIcon />
                          </button>
                          <button
                            type="button"
                            className={styles.iconButton}
                            onClick={cancelRename}
                            aria-label="Cancel rename"
                          >
                            <XIcon />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', minWidth: 0, opacity: isLoading && !isActive ? 0.5 : 1 }}>
                        <button
                          type="button"
                          className={styles.sessionMain}
                          onClick={() => openHistorySession(session.id)}
                          disabled={isLoading}
                          title={isLoading ? "Wait for the current response to finish" : session.title}
                        >
                          {summarize(session.title)}
                        </button>
                        <button
                          type="button"
                          className={styles.iconButton}
                          aria-label={`Rename ${session.title}`}
                          onClick={() => beginRename(session.id, session.title)}
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          className={styles.iconButtonDanger}
                          aria-label={`Delete ${session.title}`}
                          onClick={() => handleDelete(session.id)}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    )}
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

      {deleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <h3 id="modal-title" className={styles.modalTitle}>
              {deleteConfirm.type === 'all' ? "Clear all chat history?" : "Delete this chat?"}
            </h3>
            <p className={styles.modalText}>
              This action cannot be undone. Are you sure you want to proceed?
            </p>
            <div className={styles.modalActions}>
              <button type="button" className={styles.modalButtonCancel} onClick={cancelDelete}>Cancel</button>
              <button type="button" className={styles.modalButtonDanger} onClick={executeDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
