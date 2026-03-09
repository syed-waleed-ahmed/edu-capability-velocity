"use client";

import React, { useState } from "react";
import type { Quiz } from "@/schemas/quiz";
import styles from "./QuizRunner.module.css";

interface QuizRunnerProps {
  data: Quiz;
}

function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function QuizRunner({ data }: QuizRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = data.questions[currentIndex];
  const progress = (((currentIndex + 1) / data.questions.length) * 100).toFixed(0);
  const isOpenEnded = question.type === "open_ended";
  const currentAnswer = isOpenEnded ? typedAnswer : selectedAnswer ?? "";
  const canCheckAnswer = currentAnswer.trim().length > 0;

  const handleSelect = (option: string) => {
    if (showExplanation) return;
    setSelectedAnswer(option);
  };

  const handleCheck = () => {
    if (!canCheckAnswer) return;

    setShowExplanation(true);
    const correct =
      normalizeAnswer(currentAnswer) === normalizeAnswer(question.correctAnswer);
    setIsAnswerCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < data.questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setTypedAnswer("");
      setShowExplanation(false);
      setIsAnswerCorrect(null);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    const pct = ((score / data.questions.length) * 100).toFixed(0);
    return (
      <div className={styles.quiz}>
        <div className={styles.results}>
          <div className={styles.resultsEmoji}>
            {Number(pct) >= 80 ? "🏆" : Number(pct) >= 50 ? "👏" : "📚"}
          </div>
          <h2 className={styles.resultsTitle}>Quiz Complete!</h2>
          <div className={styles.resultsScore}>
            {score}/{data.questions.length} ({pct}%)
          </div>
          <p className={styles.resultsText}>
            {Number(pct) >= 80
              ? "Excellent work!"
              : Number(pct) >= 50
                ? "Good effort! Review the material and try again."
                : "Keep studying! You'll get there."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.quiz}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <span className={styles.badge}>📝 Quiz</span>
          <h2 className={styles.quizTitle}>{data.title}</h2>
        </div>
        <div className={styles.progress}>
          <div className={styles.progressCurrent}>{currentIndex + 1}</div>
          of {data.questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className={styles.question}>
        <span className={styles.questionNumber}>Q{currentIndex + 1}.</span>
        {question.question}
      </div>

      {/* Options */}
      {question.type === "multiple_choice" && question.options && (
        <div className={styles.options}>
          {question.options.map((option: string, i: number) => {
            let className = styles.option;
            if (showExplanation) {
              if (option === question.correctAnswer) {
                className = styles.optionCorrect;
              } else if (option === selectedAnswer) {
                className = styles.optionIncorrect;
              }
            } else if (option === selectedAnswer) {
              className = styles.optionSelected;
            }

            return (
              <button
                key={i}
                className={className}
                onClick={() => handleSelect(option)}
                disabled={showExplanation}
              >
                <span className={styles.optionLetter}>
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      )}

      {isOpenEnded && (
        <div className={styles.openEnded}>
          <label className={styles.openEndedLabel} htmlFor={`open-ended-${question.id}`}>
            Your answer
          </label>
          <textarea
            id={`open-ended-${question.id}`}
            className={styles.openEndedInput}
            value={typedAnswer}
            onChange={(event) => setTypedAnswer(event.target.value)}
            placeholder="Write your answer here"
            disabled={showExplanation}
          />
        </div>
      )}

      {showExplanation && isOpenEnded && (
        <div className={styles.answerReview}>
          <div className={styles.answerRow}>
            <span className={styles.answerKey}>Your answer:</span>
            <span>{typedAnswer}</span>
          </div>
          <div className={styles.answerRow}>
            <span className={styles.answerKey}>Expected answer:</span>
            <span>{question.correctAnswer}</span>
          </div>
          <div
            className={
              isAnswerCorrect ? styles.answerCorrectText : styles.answerIncorrectText
            }
          >
            {isAnswerCorrect
              ? "Marked correct based on normalized text match."
              : "Marked incorrect because the answer does not match closely enough."}
          </div>
        </div>
      )}

      {/* Explanation */}
      {showExplanation && question.explanation && (
        <div className={styles.explanation}>
          <div className={styles.explanationLabel}>💡 Explanation</div>
          {question.explanation}
        </div>
      )}

      {/* Action */}
      {!showExplanation ? (
        <button
          className={styles.nextButton}
          onClick={handleCheck}
          disabled={!canCheckAnswer}
        >
          Check Answer
        </button>
      ) : (
        <button className={styles.nextButton} onClick={handleNext}>
          {currentIndex < data.questions.length - 1 ? "Next Question →" : "See Results"}
        </button>
      )}
    </div>
  );
}
