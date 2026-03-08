"use client";

import { useChat, Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, FormEvent } from "react";
import { StructuredRenderer } from "@/components/StructuredRenderer";
import type { UIMessage } from "ai";

const AGENTS = [
  {
    id: "content-converter-agent",
    name: "Content Converter",
    icon: "🔄",
    description: "Text → Flashcards, Quizzes, Study Plans",
    color: "#6366f1",
  },
  {
    id: "study-package-agent",
    name: "Study Package",
    icon: "📚",
    description: "Files → Structured Study Package",
    color: "#22c55e",
  },
];

function getTextFromMessage(message: UIMessage): string {
  if (!message.parts) return "";
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function tryParseStructuredOutput(
  text: string
): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && parsed.type) {
      return parsed;
    }
  } catch {
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed && typeof parsed === "object" && parsed.type) {
          return parsed;
        }
      } catch {
        // Not valid JSON
      }
    }
  }
  return null;
}

export default function Home() {
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0].id);
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const chat = useRef(
    new Chat({
      transport: new DefaultChatTransport({
        api: "/api/chat",
        body: { agent: selectedAgent },
      }),
    })
  ).current;

  const { messages, sendMessage, status } = useChat({ chat });

  const isLoading = status === "streaming" || status === "submitted";
  const currentAgent = AGENTS.find((a) => a.id === selectedAgent)!;

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText("");
    await sendMessage({ text });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0a0f 0%, #111827 100%)",
        color: "#e2e8f0",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(10,10,15,0.8)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "24px" }}>⚡</span>
          <div>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: 700,
                margin: 0,
                letterSpacing: "-0.3px",
              }}
            >
              EDU Capability Velocity
            </h1>
            <p style={{ fontSize: "12px", opacity: 0.5, margin: 0 }}>
              Micro-Experience Prototypes
            </p>
          </div>
        </div>

        {/* Agent Selector */}
        <div style={{ display: "flex", gap: "8px" }}>
          {AGENTS.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              style={{
                background:
                  selectedAgent === agent.id
                    ? `${agent.color}22`
                    : "rgba(255,255,255,0.04)",
                border: `1px solid ${selectedAgent === agent.id ? `${agent.color}44` : "rgba(255,255,255,0.08)"}`,
                color:
                  selectedAgent === agent.id ? agent.color : "#94a3b8",
                padding: "8px 16px",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
            >
              <span>{agent.icon}</span>
              {agent.name}
            </button>
          ))}
        </div>
      </header>

      {/* Chat Area */}
      <main
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "24px",
          paddingBottom: "120px",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 20px",
              opacity: 0.6,
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>
              {currentAgent.icon}
            </div>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              {currentAgent.name}
            </h2>
            <p
              style={{
                fontSize: "14px",
                opacity: 0.7,
                maxWidth: "400px",
                margin: "0 auto",
                lineHeight: "1.6",
              }}
            >
              {currentAgent.description}
            </p>
            <div
              style={{
                marginTop: "24px",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                justifyContent: "center",
              }}
            >
              {selectedAgent === "content-converter-agent" ? (
                <>
                  <SuggestionChip
                    text="Generate flashcards about photosynthesis"
                    onClick={(t) => setInputText(t)}
                  />
                  <SuggestionChip
                    text="Create a quiz on World War II"
                    onClick={(t) => setInputText(t)}
                  />
                  <SuggestionChip
                    text="Build a study plan for linear algebra"
                    onClick={(t) => setInputText(t)}
                  />
                </>
              ) : (
                <>
                  <SuggestionChip
                    text="Create a study package from my notes"
                    onClick={(t) => setInputText(t)}
                  />
                  <SuggestionChip
                    text="Summarize and organize study material"
                    onClick={(t) => setInputText(t)}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const text = getTextFromMessage(message);
          const structuredData =
            message.role === "assistant" ? tryParseStructuredOutput(text) : null;

          return (
            <div
              key={message.id}
              style={{
                marginBottom: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems:
                  message.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  opacity: 0.4,
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {message.role === "user" ? "You" : currentAgent.name}
              </div>

              {structuredData ? (
                <StructuredRenderer data={structuredData} />
              ) : (
                <div
                  style={{
                    background:
                      message.role === "user"
                        ? `${currentAgent.color}18`
                        : "rgba(255,255,255,0.04)",
                    border: `1px solid ${message.role === "user" ? `${currentAgent.color}30` : "rgba(255,255,255,0.06)"}`,
                    borderRadius:
                      message.role === "user"
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",
                    padding: "14px 18px",
                    maxWidth: "85%",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {text || "..."}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div
            style={{
              display: "flex",
              gap: "6px",
              padding: "12px 0",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: currentAgent.color,
                animation: "pulse 1.2s infinite",
              }}
            />
            <span style={{ fontSize: "13px", opacity: 0.5 }}>
              {currentAgent.name} is thinking...
            </span>
          </div>
        )}
      </main>

      {/* Input */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 24px",
          background: "linear-gradient(0deg, #0a0a0f 60%, transparent)",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            display: "flex",
            gap: "10px",
          }}
        >
          <input
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${currentAgent.name} to generate learning materials...`}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "14px 18px",
              color: "#e2e8f0",
              fontSize: "14px",
              outline: "none",
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            style={{
              background: `linear-gradient(135deg, ${currentAgent.color}, ${currentAgent.color}cc)`,
              border: "none",
              color: "#fff",
              padding: "14px 24px",
              borderRadius: "12px",
              cursor:
                isLoading || !inputText.trim() ? "not-allowed" : "pointer",
              opacity: isLoading || !inputText.trim() ? 0.5 : 1,
              fontSize: "14px",
              fontWeight: 600,
              transition: "all 0.2s",
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            Send ↑
          </button>
        </form>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}
      </style>
    </div>
  );
}

function SuggestionChip({
  text,
  onClick,
}: {
  text: string;
  onClick: (text: string) => void;
}) {
  return (
    <div
      onClick={() => onClick(text)}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "8px 14px",
        borderRadius: "20px",
        fontSize: "12px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {text}
    </div>
  );
}
