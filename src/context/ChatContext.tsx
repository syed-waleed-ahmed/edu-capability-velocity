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
const MAX_CHAT_SESSIONS = 30;
const MAX_SESSION_MESSAGES = 120;

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

    return validSessions.slice(0, MAX_CHAT_SESSIONS);
  } catch {
    return [];
  }
}

function persistSessions(sessions: ChatSession[]): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(sessions));
}

function createNewSession(agentId: string): ChatSession {
  return {
    id: createSessionId(),
    title: `${getAgentById(agentId).name} chat`,
    agentId,
    updatedAt: new Date().toISOString(),
    messages: [],
  };
}

interface ChatContextValue {
  /* Agent */
  selectedAgent: AgentConfig;
  setSelectedAgentId: (id: string) => void;

  /* Chat */
  messages: UIMessage[];
  sendMessage: (opts: { text: string }) => Promise<void>;
  clearMessages: () => void;
  startNewChat: () => void;
  status: string;
  isLoading: boolean;

  /* History */
  historySessions: ChatHistorySessionSummary[];
  activeSessionId: string;
  openHistorySession: (sessionId: string) => void;
  clearHistory: () => void;
  isHistoryOpen: boolean;
  toggleHistory: () => void;
  closeHistory: () => void;

  /* Input */
  inputText: string;
  setInputText: (text: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [agentId, setAgentId] = useState(AGENTS[0].id);
  const [inputText, setInputText] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const hasHydratedHistory = useRef(false);
  const selectedAgent = getAgentById(agentId);

  const chat = useMemo(
    () =>
      new Chat({
        transport: new DefaultChatTransport({
          api: "/api/chat",
        }),
      }),
    []
  );

  const {
    messages,
    sendMessage: rawSendMessage,
    setMessages,
    status,
  } = useChat({ chat });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loadedSessions = parseStoredSessions(
      window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY)
    );

    if (loadedSessions.length > 0) {
      const latestSession = loadedSessions[0];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessions(loadedSessions);
      setActiveSessionId(latestSession.id);
      setAgentId(latestSession.agentId);
      setMessages(toUiMessages(latestSession.messages));
    } else {
      const initialSession = createNewSession(AGENTS[0].id);
      const initialSessions = [initialSession];
      setSessions(initialSessions);
      setActiveSessionId(initialSession.id);
      setMessages([]);
      persistSessions(initialSessions);
    }

    hasHydratedHistory.current = true;
  }, [setMessages]);

  useEffect(() => {
    if (!hasHydratedHistory.current || !activeSessionId) {
      return;
    }

    const storedMessages = toStoredMessages(messages);
    const nowIso = new Date().toISOString();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessions((previousSessions) => {
      const existingSession = previousSessions.find(
        (session) => session.id === activeSessionId
      );

      const nextSession: ChatSession = {
        id: activeSessionId,
        agentId,
        updatedAt: nowIso,
        title:
          storedMessages.length > 0
            ? deriveSessionTitle(agentId, storedMessages)
            : (existingSession?.title ?? `${selectedAgent.name} chat`),
        messages: storedMessages,
      };

      const mergedSessions = [
        nextSession,
        ...previousSessions.filter((session) => session.id !== activeSessionId),
      ].slice(0, MAX_CHAT_SESSIONS);

      persistSessions(mergedSessions);
      return mergedSessions;
    });
  }, [messages, agentId, activeSessionId, selectedAgent.name]);

  const sendMessage = useCallback(
    async (opts: { text: string }) => {
      await rawSendMessage(opts, {
        body: { agent: agentId },
      });
    },
    [rawSendMessage, agentId]
  );

  const isLoading = status === "streaming" || status === "submitted";

  const startNewChat = useCallback(() => {
    const newSession = createNewSession(agentId);

    setActiveSessionId(newSession.id);
    setMessages([]);
    setInputText("");
    setSessions((previousSessions) => {
      const mergedSessions = [newSession, ...previousSessions].slice(
        0,
        MAX_CHAT_SESSIONS
      );
      persistSessions(mergedSessions);
      return mergedSessions;
    });
    setIsHistoryOpen(false);
  }, [agentId, setMessages]);

  const clearMessages = useCallback(() => {
    startNewChat();
  }, [startNewChat]);

  const openHistorySession = useCallback(
    (sessionId: string) => {
      const targetSession = sessions.find((session) => session.id === sessionId);
      if (!targetSession) {
        return;
      }

      setAgentId(targetSession.agentId);
      setActiveSessionId(targetSession.id);
      setMessages(toUiMessages(targetSession.messages));
      setInputText("");

      setSessions((previousSessions) => {
        const reorderedSessions = [
          targetSession,
          ...previousSessions.filter((session) => session.id !== targetSession.id),
        ];
        persistSessions(reorderedSessions);
        return reorderedSessions;
      });

      setIsHistoryOpen(false);
    },
    [sessions, setMessages]
  );

  const clearHistory = useCallback(() => {
    const freshSession = createNewSession(agentId);
    const freshSessions = [freshSession];

    setSessions(freshSessions);
    setActiveSessionId(freshSession.id);
    setMessages([]);
    setInputText("");
    persistSessions(freshSessions);
    setIsHistoryOpen(false);
  }, [agentId, setMessages]);

  const historySessions = useMemo<ChatHistorySessionSummary[]>(() => {
    return sessions.map((session) => {
      const latestMessage = session.messages[session.messages.length - 1];
      return {
        id: session.id,
        title: session.title,
        agentId: session.agentId,
        updatedAt: session.updatedAt,
        messageCount: session.messages.length,
        preview: latestMessage?.text ?? "No messages yet",
      };
    });
  }, [sessions]);

  const toggleHistory = useCallback(() => {
    setIsHistoryOpen((current) => !current);
  }, []);

  const closeHistory = useCallback(() => {
    setIsHistoryOpen(false);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        selectedAgent,
        setSelectedAgentId: setAgentId,
        messages,
        sendMessage,
        clearMessages,
        startNewChat,
        status,
        isLoading,
        historySessions,
        activeSessionId,
        openHistorySession,
        clearHistory,
        isHistoryOpen,
        toggleHistory,
        closeHistory,
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
