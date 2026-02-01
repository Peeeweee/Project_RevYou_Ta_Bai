import React, { useEffect, useState } from 'react';

const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('Initializing...');

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    return 100;
                }
                return prev + 2; // complete in ~2.5s? 50 steps * 50ms = 2.5s
            });
        }, 40);

        // Status text updates
        setTimeout(() => setStatusText('Reading Data...'), 500);
        setTimeout(() => setStatusText('Analyzing Pattern...'), 1200);
        setTimeout(() => setStatusText('Generating Flashcards...'), 2000);
        setTimeout(() => {
            setStatusText('Finalizing...');
            onComplete();
        }, 2800);

        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <div className="loading-screen">
            <div className="loader"></div>
            <h2>{statusText}</h2>
            <div className="loading-bar">
                <div className="loading-fill" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};

export default LoadingScreen;
