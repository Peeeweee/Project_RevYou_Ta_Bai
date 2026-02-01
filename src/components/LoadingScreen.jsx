import React, { useEffect, useState } from 'react';

const LoadingScreen = ({ onComplete, cardCount = 30 }) => {
    const [progress, setProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);

    // Simulate loading progress
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setIsReady(true);
                    return 100;
                }
                return prev + 5; // Faster load
            });
        }, 80); // ~1.6s total

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="loading-card-white">
            {isReady ? (
                <>
                    <h1 className="loading-title">Ready to Review!</h1>
                    <p className="loading-subtitle">
                        We successfully generated <strong>{cardCount} flashcards</strong> for you.
                    </p>
                    <button className="black-pill-btn" onClick={onComplete}>
                        START REVIEW →
                    </button>
                </>
            ) : (
                <>
                    <h1 className="loading-title" style={{ color: 'var(--primary-color)' }}>Analyzing...</h1>
                    <p className="loading-subtitle">
                        Creating your customized deck.
                    </p>
                    {/* Small Progress Bar for aesthetics */}
                    <div className="loading-bar">
                        <div className="loading-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LoadingScreen;
