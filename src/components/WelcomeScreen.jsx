import React from 'react';

const WelcomeScreen = ({ onStart }) => {
  return (
    <div className="welcome-container">
      <div className="welcome-card-unique">
        <div className="status-label">STUDENT PROJECT</div>

        <div className="content-left">
          <h1 className="brand-title-large">
            RevYou<br />
            <span className="highlight-maroon">nata Bai?</span>
          </h1>

          <p className="brand-subtitle-left">
            Your personalized review system for <span className="bold-text">USeP</span> students.
            It's simple, gamified, and open for all willing to learn.
          </p>

          <button className="start-btn-block" onClick={onStart}>
            START REVIEW <span className="arrow">→</span>
          </button>

          <div className="footer-links">
            <span>Privacy</span> • <span>Open Source</span>
          </div>
        </div>

        {/* Decorative Icon on Right */}
        <div className="decorative-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
