import React from 'react';

const SessionCompletion = ({ onRestart, onNewSession }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <h3>Deck Completed!</h3>
                <p>You've reached the end of your cards. Would you like to study this one again or start something new?</p>
                <div className="modal-actions" style={{ flexDirection: 'column', gap: '0.8rem' }}>
                    <button className="modal-btn-primary" onClick={onRestart} style={{ width: '100%' }}>
                        Study Again (Restart)
                    </button>
                    <button className="modal-btn-cancel" onClick={onNewSession} style={{ width: '100%', margin: 0 }}>
                        Study Something New
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionCompletion;
