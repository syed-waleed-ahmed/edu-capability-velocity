"use client";

import React, { useState } from "react";
import type { Quiz } from "@/schemas/quiz";

interface QuizRunnerProps {
  data: Quiz;
}

export function QuizRunner({ data }: QuizRunnerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const question = data.questions[currentQuestion];
  const isAnswered = selectedAnswers[question.id] !== undefined;
  const isCorrect = selectedAnswers[question.id] === question.correctAnswer;

  const score = Object.entries(selectedAnswers).reduce((acc, [qId, answer]) => {
    const q = data.questions.find((q) => q.id === Number(qId));
    return acc + (q && q.correctAnswer === answer ? 1 : 0);
  }, 0);

  const diffColor = {
    easy: "#22c55e",
    medium: "#eab308",
    hard: "#ef4444",
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswers((prev) => ({ ...prev, [question.id]: answer }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentQuestion < data.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  if (quizCompleted) {
    const percentage = Math.round((score / data.totalQuestions) * 100);
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #0c4a6e 0%, #164e63 100%)",
          borderRadius: "16px",
          padding: "32px",
          color: "#fff",
          fontFamily: "'Inter', sans-serif",
          maxWidth: "540px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ fontSize: "56px", marginBottom: "12px" }}>
          {percentage >= 80 ? "🎉" : percentage >= 50 ? "👍" : "📖"}
        </div>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
          Quiz Complete!
        </h2>
        <p style={{ fontSize: "16px", opacity: 0.8, marginBottom: "24px" }}>
          {data.title}
        </p>
        <div
          style={{
            fontSize: "48px",
            fontWeight: 800,
            marginBottom: "8px",
            background: `linear-gradient(135deg, ${percentage >= 80 ? "#22c55e" : percentage >= 50 ? "#eab308" : "#ef4444"}, #ffffff)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {percentage}%
        </div>
        <p style={{ fontSize: "15px", opacity: 0.6 }}>
          {score} / {data.totalQuestions} correct
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0c4a6e 0%, #164e63 100%)",
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
              background: "rgba(14, 165, 233, 0.2)",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              color: "#7dd3fc",
            }}
          >
            📝 Quiz
          </span>
          <h2
            style={{ fontSize: "18px", fontWeight: 700, margin: "8px 0 0" }}
          >
            {data.title}
          </h2>
        </div>
        <span
          style={{
            background: diffColor[data.difficulty],
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        >
          {data.difficulty}
        </span>
      </div>

      {/* Progress */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "20px",
        }}
      >
        {data.questions.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "4px",
              borderRadius: "2px",
              background:
                i === currentQuestion
                  ? "#0ea5e9"
                  : i < currentQuestion
                    ? "rgba(14,165,233,0.5)"
                    : "rgba(255,255,255,0.1)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>

      {/* Question */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            fontSize: "12px",
            opacity: 0.5,
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Question {currentQuestion + 1} of {data.totalQuestions} ·{" "}
          {question.type === "multiple_choice"
            ? "Multiple Choice"
            : "Open Ended"}
        </div>
        <p
          style={{
            fontSize: "17px",
            fontWeight: 500,
            lineHeight: "1.6",
            margin: 0,
          }}
        >
          {question.question}
        </p>
      </div>

      {/* Options */}
      {question.type === "multiple_choice" && question.options && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {question.options.map((option, i) => {
            const isSelected = selectedAnswers[question.id] === option;
            const isCorrectOption = question.correctAnswer === option;

            let bgColor = "rgba(255,255,255,0.05)";
            let borderColor = "rgba(255,255,255,0.1)";

            if (isAnswered) {
              if (isCorrectOption) {
                bgColor = "rgba(34,197,94,0.15)";
                borderColor = "#22c55e";
              } else if (isSelected && !isCorrectOption) {
                bgColor = "rgba(239,68,68,0.15)";
                borderColor = "#ef4444";
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                disabled={isAnswered}
                style={{
                  background: bgColor,
                  border: `1px solid ${borderColor}`,
                  color: "#fff",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  textAlign: "left",
                  cursor: isAnswered ? "default" : "pointer",
                  fontSize: "14px",
                  lineHeight: "1.4",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 600,
                    flexShrink: 0,
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      )}

      {/* Explanation */}
      {showExplanation && isAnswered && (
        <div
          style={{
            marginTop: "16px",
            background: isCorrect
              ? "rgba(34,197,94,0.1)"
              : "rgba(239,68,68,0.1)",
            border: `1px solid ${isCorrect ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            borderRadius: "10px",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "6px",
              color: isCorrect ? "#4ade80" : "#f87171",
            }}
          >
            {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
          </div>
          <p
            style={{
              fontSize: "13px",
              opacity: 0.8,
              lineHeight: "1.5",
              margin: 0,
            }}
          >
            {question.explanation}
          </p>
        </div>
      )}

      {/* Next Button */}
      {isAnswered && (
        <button
          onClick={handleNext}
          style={{
            marginTop: "16px",
            width: "100%",
            background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
            border: "none",
            color: "#fff",
            padding: "14px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: 600,
            transition: "opacity 0.2s",
          }}
        >
          {currentQuestion < data.questions.length - 1
            ? "Next Question →"
            : "See Results 🎯"}
        </button>
      )}
    </div>
  );
}
