"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useChat, Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AGENTS, getAgentById, type AgentConfig } from "@/config/agents.config";
import type { UIMessage } from "ai";

const CHAT_HISTORY_STORAGE_KEY = "edu-capability-velocity:chat-history:v1";
const THEME_STORAGE_KEY = "edu-capability-velocity:theme:v1";
const MAX_CHAT_SESSIONS = 30;
const MAX_SESSION_MESSAGES = 120;

type ThemeMode = "light" | "dark";

interface StoredChatMessage {
  id: string;
  role: UIMessage["role"];
  text: string;
}

interface ChatSession {
  id: string;
  title: string;
  agentId: string;
  updatedAt: string;
  messages: StoredChatMessage[];
}

interface InitialChatState {
  sessions: ChatSession[];
  activeSessionId: string;
  agentId: string;
  initialMessages: UIMessage[];
  theme: ThemeMode;
}

export interface ChatHistorySessionSummary {
  id: string;
  title: string;
  agentId: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
}

function createSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
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

function toStoredMessages(messages: UIMessage[]): StoredChatMessage[] {
  return messages
    .map((message) => ({
      id: message.id,
      role: message.role,
      text: getTextFromMessage(message),
    }))
    .filter((message) => message.text.length > 0)
    .slice(-MAX_SESSION_MESSAGES);
}

function toUiMessages(messages: StoredChatMessage[]): UIMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    parts: [{ type: "text", text: message.text }],
  }));
}

function deriveSessionTitle(agentId: string, messages: StoredChatMessage[]): string {
  const firstUserMessage = messages.find((message) => message.role === "user");

  if (firstUserMessage?.text) {
    return firstUserMessage.text.slice(0, 60);
  }

  return `${getAgentById(agentId).name} chat`;
}

function clampSessions(sessions: ChatSession[]): ChatSession[] {
  return sessions
    .filter((session) => session.messages.length > 0)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, MAX_CHAT_SESSIONS);
}

function parseStoredSessions(value: string | null): ChatSession[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    const validSessions: ChatSession[] = [];

    for (const session of parsed) {
      if (!session || typeof session !== "object") {
        continue;
      }

      const record = session as Record<string, unknown>;
      const rawMessages = Array.isArray(record.messages) ? record.messages : [];

      const messages: StoredChatMessage[] = rawMessages
        .filter((message): message is Record<string, unknown> => {
          return Boolean(
            message &&
              typeof message === "object" &&
              typeof message.id === "string" &&
              typeof message.role === "string" &&
              typeof message.text === "string"
          );
        })
        .map((message) => ({
          id: String(message.id),
          role: message.role as UIMessage["role"],
          text: String(message.text),
        }))
        .slice(-MAX_SESSION_MESSAGES);

      if (
        typeof record.id === "string" &&
        typeof record.title === "string" &&
        typeof record.agentId === "string" &&
        typeof record.updatedAt === "string"
      ) {
        validSessions.push({
          id: record.id,
          title: record.title,
          agentId: record.agentId,
          updatedAt: record.updatedAt,
          messages,
        });
      }
    }

    return clampSessions(validSessions);
  } catch {
    return [];
  }
}

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function loadInitialState(): InitialChatState {
  const defaultAgentId = AGENTS[0].id;

  if (typeof window === "undefined") {
    return {
      sessions: [],
      activeSessionId: "",
      agentId: defaultAgentId,
      initialMessages: [],
      theme: "light",
    };
  }

  const sessions = parseStoredSessions(
    window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY)
  );
  const activeSession = sessions[0];

  return {
    sessions,
    activeSessionId: activeSession?.id ?? "",
    agentId: activeSession?.agentId ?? defaultAgentId,
    initialMessages: activeSession ? toUiMessages(activeSession.messages) : [],
    theme: getInitialTheme(),
  };
}

function persistSessions(sessions: ChatSession[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(sessions));
}

interface ChatContextValue {
  /* Agent */
  selectedAgent: AgentConfig;
  setSelectedAgentId: (id: string) => void;

  /* Chat */
  messages: UIMessage[];
  sendMessage: (opts: { text: string }) => Promise<void>;
  regenerateAssistantResponse: (assistantMessageId: string) => Promise<void>;
  editUserMessage: (messageId: string, text: string) => Promise<void>;
  deleteMessage: (messageId: string) => void;
  clearMessages: () => void;
  startNewChat: () => void;
  status: string;
  isLoading: boolean;

  /* History */
  historySessions: ChatHistorySessionSummary[];
  activeSessionId: string;
  openHistorySession: (sessionId: string) => void;
  renameHistorySession: (sessionId: string, title: string) => void;
  deleteHistorySession: (sessionId: string) => void;
  clearHistory: () => void;

  /* Sidebar */
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  /* Theme */
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  /* Input */
  inputText: string;
  setInputText: React.Dispatch<React.SetStateAction<string>>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [initialState] = useState<InitialChatState>(() => loadInitialState());
  const [agentId, setAgentId] = useState(initialState.agentId);
  const [inputText, setInputText] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>(initialState.sessions);
  const [activeSessionId, setActiveSessionId] = useState(
    initialState.activeSessionId
  );
  const [theme, setThemeState] = useState<ThemeMode>(initialState.theme);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const activeSessionIdRef = useRef(initialState.activeSessionId);
  const selectedAgent = getAgentById(agentId);

  const chat = useMemo(
    () =>
      new Chat({
        messages: initialState.initialMessages,
        transport: new DefaultChatTransport({
          api: "/api/chat",
        }),
      }),
    [initialState.initialMessages]
  );

  const {
    messages,
    sendMessage: rawSendMessage,
    regenerate: rawRegenerate,
    stop: rawStop,
    setMessages,
    status,
  } = useChat({ chat });
  const messagesRef = useRef<UIMessage[]>(messages);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    isLoadingRef.current = status === "streaming" || status === "submitted";
  }, [status]);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.setAttribute("data-theme", theme);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  useEffect(() => {
    const sessionId = activeSessionIdRef.current;
    if (!sessionId) {
      return;
    }

    const storedMessages = toStoredMessages(messages);
    if (storedMessages.length === 0) {
      return;
    }

    const nowIso = new Date().toISOString();

    setSessions((previousSessions) => {
      const existingSession = previousSessions.find(
        (session) => session.id === sessionId
      );

      const resolvedAgentId = existingSession ? existingSession.agentId : agentId;
      const nextSession: ChatSession = {
        id: sessionId,
        agentId: resolvedAgentId,
        updatedAt: nowIso,
        title: (() => {
          const fallbackTitle = `${getAgentById(resolvedAgentId).name} chat`;
          if (!existingSession) {
            return deriveSessionTitle(resolvedAgentId, storedMessages);
          }

          const hasCustomTitle =
            existingSession.title !== fallbackTitle &&
            !existingSession.title.endsWith(" chat");

          if (hasCustomTitle) {
            return existingSession.title;
          }

          return deriveSessionTitle(resolvedAgentId, storedMessages);
        })(),
        messages: storedMessages,
      };

      const mergedSessions = clampSessions([
        nextSession,
        ...previousSessions.filter((session) => session.id !== sessionId),
      ]);

      persistSessions(mergedSessions);
      return mergedSessions;
    });
  }, [messages, agentId, selectedAgent.name]);

  const ensureActiveSession = useCallback(
    (seedText: string): string => {
      const currentSessionId = activeSessionIdRef.current;
      if (currentSessionId) {
        return currentSessionId;
      }

      const nextSession: ChatSession = {
        id: createSessionId(),
        title: seedText.trim().slice(0, 60) || `${selectedAgent.name} chat`,
        agentId,
        updatedAt: new Date().toISOString(),
        messages: [],
      };

      activeSessionIdRef.current = nextSession.id;
      setActiveSessionId(nextSession.id);
      setSessions((previousSessions) => {
        const mergedSessions = clampSessions([nextSession, ...previousSessions]);
        persistSessions(mergedSessions);
        return mergedSessions;
      });

      return nextSession.id;
    },
    [agentId, selectedAgent.name]
  );

  const sendMessage = useCallback(
    async (opts: { text: string }) => {
      ensureActiveSession(opts.text);

      await rawSendMessage(opts, {
        body: { agent: agentId },
      });
    },
    [rawSendMessage, agentId, ensureActiveSession]
  );

  const stopActiveStream = useCallback(() => {
    if (!isLoadingRef.current) {
      return;
    }

    rawStop();
  }, [rawStop]);

  const regenerateAssistantResponse = useCallback(
    async (assistantMessageId: string) => {
      stopActiveStream();

      const messageSnapshot = messagesRef.current;
      const assistantIndex = messageSnapshot.findIndex(
        (message) =>
          message.id === assistantMessageId && message.role === "assistant"
      );

      if (assistantIndex < 0) {
        return;
      }

      const branchedMessages = messageSnapshot.slice(0, assistantIndex + 1);
      setMessages(branchedMessages);

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 0);
      });

      await rawRegenerate({
        messageId: assistantMessageId,
        body: { agent: agentId },
      });
    },
    [agentId, rawRegenerate, setMessages, stopActiveStream]
  );

  const editUserMessage = useCallback(
    async (messageId: string, text: string) => {
      const nextText = text.trim();
      if (!nextText) {
        return;
      }

      stopActiveStream();

      const messageSnapshot = messagesRef.current;
      const userIndex = messageSnapshot.findIndex(
        (message) => message.id === messageId && message.role === "user"
      );

      if (userIndex < 0) {
        return;
      }

      let assistantIndex = -1;

      for (let index = userIndex + 1; index < messageSnapshot.length; index += 1) {
        if (messageSnapshot[index].role === "assistant") {
          assistantIndex = index;
          break;
        }
      }

      if (assistantIndex > -1) {
        const assistantId = messageSnapshot[assistantIndex].id;

        const branchMessages: UIMessage[] = messageSnapshot
          .slice(0, assistantIndex + 1)
          .map((message): UIMessage => {
            if (message.id !== messageId) {
              return message;
            }

            return {
              ...message,
              parts: [{ type: "text", text: nextText }],
            };
          });

        setMessages(branchMessages);

        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, 0);
        });

        await rawRegenerate({
          messageId: assistantId,
          body: { agent: agentId },
        });

        return;
      }

      await rawSendMessage(
        {
          text: nextText,
          messageId,
        },
        {
          body: { agent: agentId },
        }
      );
    },
    [agentId, rawRegenerate, rawSendMessage, setMessages, stopActiveStream]
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      stopActiveStream();

      const messageSnapshot = messagesRef.current;
      const targetIndex = messageSnapshot.findIndex(
        (message) => message.id === messageId
      );

      if (targetIndex < 0) {
        return;
      }

      const targetMessage = messageSnapshot[targetIndex];
      let nextMessages: UIMessage[];

      if (
        targetMessage.role === "user" &&
        messageSnapshot[targetIndex + 1]?.role === "assistant"
      ) {
        nextMessages = [
          ...messageSnapshot.slice(0, targetIndex),
          ...messageSnapshot.slice(targetIndex + 2),
        ];
      } else {
        nextMessages = [
          ...messageSnapshot.slice(0, targetIndex),
          ...messageSnapshot.slice(targetIndex + 1),
        ];
      }

      setMessages(nextMessages);
    },
    [setMessages, stopActiveStream]
  );

  const isLoading = status === "streaming" || status === "submitted";

  const startNewChat = useCallback(() => {
    stopActiveStream();
    activeSessionIdRef.current = "";
    setActiveSessionId("");
    setMessages([]);
    setInputText("");
  }, [setMessages, stopActiveStream]);

  const clearMessages = useCallback(() => {
    startNewChat();
  }, [startNewChat]);

  const openHistorySession = useCallback(
    (sessionId: string) => {
      stopActiveStream();

      const targetSession = sessions.find((session) => session.id === sessionId);
      if (!targetSession) {
        return;
      }

      setAgentId(targetSession.agentId);
      setActiveSessionId(targetSession.id);
      activeSessionIdRef.current = targetSession.id;
      setMessages(toUiMessages(targetSession.messages));
      setInputText("");

      setSessions((previousSessions) => {
        const reorderedSessions = clampSessions([
          targetSession,
          ...previousSessions.filter((session) => session.id !== targetSession.id),
        ]);
        persistSessions(reorderedSessions);
        return reorderedSessions;
      });
    },
    [sessions, setMessages, stopActiveStream]
  );

  const renameHistorySession = useCallback(
    (sessionId: string, title: string) => {
      const nextTitle = title.trim();
      if (!nextTitle) {
        return;
      }

      const renamedSessions = clampSessions(
        sessions.map((session) =>
          session.id === sessionId
            ? { ...session, title: nextTitle, updatedAt: new Date().toISOString() }
            : session
        )
      );

      setSessions(renamedSessions);
      persistSessions(renamedSessions);
    },
    [sessions]
  );

  const deleteHistorySession = useCallback(
    (sessionId: string) => {
      if (activeSessionIdRef.current === sessionId) {
        stopActiveStream();
      }

      const remainingSessions = sessions.filter(
        (session) => session.id !== sessionId
      );

      setSessions(remainingSessions);
      persistSessions(remainingSessions);

      if (activeSessionIdRef.current !== sessionId) {
        return;
      }

      const nextActive = remainingSessions[0];
      if (nextActive) {
        activeSessionIdRef.current = nextActive.id;
        setActiveSessionId(nextActive.id);
        setAgentId(nextActive.agentId);
        setMessages(toUiMessages(nextActive.messages));
      } else {
        activeSessionIdRef.current = "";
        setActiveSessionId("");
        setMessages([]);
      }
    },
    [sessions, setMessages, stopActiveStream]
  );

  const clearHistory = useCallback(() => {
    stopActiveStream();

    activeSessionIdRef.current = "";
    setSessions([]);
    setActiveSessionId("");
    setMessages([]);
    setInputText("");
    persistSessions([]);
  }, [setMessages, stopActiveStream]);

  const historySessions = useMemo<ChatHistorySessionSummary[]>(() => {
    return sessions.map((session) => {
      const firstUserMessage = session.messages.find((message) => message.role === "user");
      return {
        id: session.id,
        title: session.title,
        agentId: session.agentId,
        updatedAt: session.updatedAt,
        messageCount: session.messages.length,
        preview: firstUserMessage?.text ?? "No messages yet",
      };
    });
  }, [sessions]);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "light" ? "dark" : "light"));
  }, []);

  return (
    <ChatContext.Provider
      value={{
        selectedAgent,
        setSelectedAgentId: setAgentId,
        messages,
        sendMessage,
        regenerateAssistantResponse,
        editUserMessage,
        deleteMessage,
        clearMessages,
        startNewChat,
        status,
        isLoading,
        historySessions,
        activeSessionId,
        openHistorySession,
        renameHistorySession,
        deleteHistorySession,
        clearHistory,
        isSidebarOpen,
        setSidebarOpen: setIsSidebarOpen,
        theme,
        setTheme,
        toggleTheme,
        inputText,
        setInputText,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}
