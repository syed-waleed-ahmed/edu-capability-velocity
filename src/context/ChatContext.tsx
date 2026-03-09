"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useChat, Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AGENTS, getAgentById, type AgentConfig } from "@/config/agents.config";
import type { UIMessage } from "ai";

interface ChatContextValue {
  /* Agent */
  selectedAgent: AgentConfig;
  setSelectedAgentId: (id: string) => void;

  /* Chat */
  messages: UIMessage[];
  sendMessage: (opts: { text: string }) => Promise<void>;
  clearMessages: () => void;
  status: string;
  isLoading: boolean;

  /* Input */
  inputText: string;
  setInputText: (text: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [agentId, setAgentId] = useState(AGENTS[0].id);
  const [inputText, setInputText] = useState("");
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

  const sendMessage = useCallback(
    async (opts: { text: string }) => {
      await rawSendMessage(opts, {
        body: { agent: agentId },
      });
    },
    [rawSendMessage, agentId]
  );

  const isLoading = status === "streaming" || status === "submitted";

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  return (
    <ChatContext.Provider
      value={{
        selectedAgent,
        setSelectedAgentId: setAgentId,
        messages,
        sendMessage,
        clearMessages,
        status,
        isLoading,
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
