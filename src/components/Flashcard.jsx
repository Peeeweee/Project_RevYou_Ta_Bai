import { useState, useEffect } from 'react';
import './Flashcard.css';

const Flashcard = ({ question, answer, category, isRevealed, onReveal, onNext }) => {
  // Reactive Font Size Helper
  const getFontSize = (text) => {
    if (!text) return '2rem';
    const length = text.length;
    if (length > 200) return '1.1rem';
    if (length > 100) return '1.4rem';
    if (length > 50) return '1.7rem';
    return '2rem';
  };

  return (
    <div className="flashcard-container">
      <div
        className={`flashcard ${isRevealed ? 'flipped' : ''}`}
        onClick={!isRevealed ? onReveal : undefined}
      >
        <div className="front">
          <div className="category-tag">{category}</div>
          <div className="content">
            <h2 style={{ fontSize: getFontSize(question) }}>{question}</h2>
            <p className="hint">Click to reveal</p>
          </div>
        </div>
        <div className="back">
          <div className="content">
            <h2 style={{ fontSize: getFontSize(answer) }}>{answer}</h2>

            {/* Keeping the internal button but ensuring spacing */}
            <button className="next-btn" onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}>
              Next Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
