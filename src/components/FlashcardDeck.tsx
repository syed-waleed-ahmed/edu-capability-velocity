"use client";

import React, { useState } from "react";
import type { FlashcardDeck } from "@/schemas/flashcard";

interface FlashcardDeckProps {
  data: FlashcardDeck;
}

export function FlashcardDeckComponent({ data }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const card = data.cards[currentIndex];
  const totalCards = data.totalCards || data.cards.length;
  const progress = ((completed.size / totalCards) * 100).toFixed(0);

  const diffColors = {
    easy: { bg: "#065f46", border: "#10b981" },
    medium: { bg: "#78350f", border: "#f59e0b" },
    hard: { bg: "#7f1d1d", border: "#ef4444" },
  };

  const handleNext = () => {
    setCompleted((prev) => new Set([...prev, currentIndex]));
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.min(prev + 1, data.cards.length - 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        borderRadius: "16px",
        padding: "28px",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        maxWidth: "540px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <span
            style={{
              background: "rgba(99, 102, 241, 0.2)",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              color: "#a5b4fc",
            }}
          >
            🃏 Flashcards
          </span>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              margin: "8px 0 0",
            }}
          >
            {data.deckTitle}
          </h2>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#a5b4fc" }}>
            {progress}%
          </div>
          <div style={{ fontSize: "11px", opacity: 0.5 }}>
            {completed.size}/{totalCards} cards
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          height: "4px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "2px",
          marginBottom: "20px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #6366f1, #a855f7)",
            borderRadius: "2px",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          background: isFlipped
            ? "linear-gradient(135deg, #1e1b4b, #312e81)"
            : "linear-gradient(135deg, #1e293b, #334155)",
          borderRadius: "14px",
          padding: "32px 24px",
          minHeight: "180px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          transition: "all 0.3s ease",
          border: `1px solid ${isFlipped ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)"}`,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: diffColors[card.difficulty].bg,
            border: `1px solid ${diffColors[card.difficulty].border}`,
            padding: "2px 10px",
            borderRadius: "12px",
            fontSize: "11px",
            textTransform: "capitalize",
          }}
        >
          {card.difficulty}
        </div>

        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            fontSize: "11px",
            opacity: 0.4,
          }}
        >
          {isFlipped ? "ANSWER" : "QUESTION"}
        </div>

        <p
          style={{
            fontSize: "17px",
            lineHeight: "1.6",
            textAlign: "center",
            margin: 0,
            fontWeight: isFlipped ? 400 : 500,
            opacity: isFlipped ? 0.9 : 1,
          }}
        >
          {isFlipped ? card.back : card.front}
        </p>

        <div
          style={{
            marginTop: "16px",
            fontSize: "12px",
            opacity: 0.3,
          }}
        >
          {isFlipped ? "Click to see question" : "Click to flip"}
        </div>
      </div>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
        }}
      >
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "none",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "10px",
            cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            opacity: currentIndex === 0 ? 0.3 : 1,
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          ← Previous
        </button>
        <span style={{ fontSize: "13px", opacity: 0.5 }}>
          {currentIndex + 1} / {data.cards.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentIndex === data.cards.length - 1}
          style={{
            background:
              currentIndex === data.cards.length - 1
                ? "rgba(255,255,255,0.08)"
                : "linear-gradient(135deg, #6366f1, #a855f7)",
            border: "none",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "10px",
            cursor:
              currentIndex === data.cards.length - 1
                ? "not-allowed"
                : "pointer",
            opacity: currentIndex === data.cards.length - 1 ? 0.3 : 1,
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
