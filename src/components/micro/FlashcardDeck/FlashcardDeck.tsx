"use client";

import React, { useState } from "react";
import type { FlashcardDeck } from "@/schemas/flashcard";
import styles from "./FlashcardDeck.module.css";

interface FlashcardDeckProps {
  data: FlashcardDeck;
}

const DIFF_COLORS = {
  easy: { bg: "var(--color-diff-easy-bg)", border: "var(--color-diff-easy-border)" },
  medium: { bg: "var(--color-diff-medium-bg)", border: "var(--color-diff-medium-border)" },
  hard: { bg: "var(--color-diff-hard-bg)", border: "var(--color-diff-hard-border)" },
};

export function FlashcardDeckComponent({ data }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);

  const card = data.cards[currentIndex];
  const totalCards = data.totalCards || data.cards.length;
  const progress = ((completed.size / totalCards) * 100).toFixed(0);
  const isLastCard = currentIndex === data.cards.length - 1;

  const markCurrentCompleted = () => {
    setCompleted((prev) => {
      if (prev.has(currentIndex)) {
        return prev;
      }

      const next = new Set(prev);
      next.add(currentIndex);
      return next;
    });
  };

  const handleNext = () => {
    markCurrentCompleted();
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.min(prev + 1, data.cards.length - 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleFinish = () => {
    markCurrentCompleted();
    setFinished(true);
    setIsFlipped(false);
  };

  const handleReviewAgain = () => {
    setFinished(false);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleRestart = () => {
    setFinished(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted(new Set());
  };

  const diff = DIFF_COLORS[card.difficulty] || DIFF_COLORS.medium;

  if (finished) {
    return (
      <div className={styles.deck}>
        <div className={styles.results}>
          <div className={styles.resultsEmoji}>✅</div>
          <h2 className={styles.resultsTitle}>Deck complete</h2>
          <p className={styles.resultsText}>
            You reviewed {completed.size}/{totalCards} cards.
          </p>

          <div className={styles.resultsActions}>
            <button
              type="button"
              className={styles.navButton}
              onClick={handleReviewAgain}
            >
              Review again
            </button>
            <button
              type="button"
              className={styles.navButtonNext}
              onClick={handleRestart}
            >
              Restart deck
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.deck}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <span className={styles.badge}>🃏 Flashcards</span>
          <h2 className={styles.deckTitle}>{data.deckTitle}</h2>
        </div>
        <div className={styles.stats}>
          <div className={styles.progress}>{progress}%</div>
          <div className={styles.count}>
            {completed.size}/{totalCards} cards
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      {/* Card */}
      <button
        type="button"
        className={isFlipped ? styles.cardBack : styles.cardFront}
        onClick={() => setIsFlipped(!isFlipped)}
        aria-label={isFlipped ? "Show question" : "Show answer"}
      >
        <div
          className={styles.diffBadge}
          style={{ background: diff.bg, border: `1px solid ${diff.border}` }}
        >
          {card.difficulty}
        </div>
        <div className={styles.sideLabel}>
          {isFlipped ? "ANSWER" : "QUESTION"}
        </div>
        <p
          className={styles.cardText}
          style={{ fontWeight: isFlipped ? 400 : 500, opacity: isFlipped ? 0.9 : 1 }}
        >
          {isFlipped ? card.back : card.front}
        </p>
        <div className={styles.flipHint}>
          {isFlipped ? "Click to see question" : "Click to flip"}
        </div>
      </button>

      {/* Navigation */}
      <div className={styles.nav}>
        <button
          className={styles.navButton}
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>
        <span className={styles.navCounter}>
          {currentIndex + 1} / {data.cards.length}
        </span>
        <button
          className={styles.navButtonNext}
          onClick={isLastCard ? handleFinish : handleNext}
        >
          {isLastCard ? "Finish Deck" : "Next →"}
        </button>
      </div>
    </div>
  );
}
