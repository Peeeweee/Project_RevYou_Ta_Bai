import React from 'react';

const StartConfirmation = ({ count, onConfirm }) => {
    return (
        <div className="start-confirmation">
            <h2>Ready to Review!</h2>
            <p>We successfully generated <strong>{count}</strong> flashcards for you.</p>

            <button className="start-btn" onClick={onConfirm}>
                Start Review Session
            </button>
        </div>
    );
};

export default StartConfirmation;
