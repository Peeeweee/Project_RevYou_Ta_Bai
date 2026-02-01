import React, { useState, useEffect } from 'react';
import { parseComplexJson } from '../utils/jsonParser';

const InputSelection = ({ onAnalyze }) => {
    // State for the list of cards
    const [cards, setCards] = useState([]);

    // State for current input
    const [qInput, setQInput] = useState('');
    const [aInput, setAInput] = useState('');

    const [error, setError] = useState('');
    const [savedDataAvailable, setSavedDataAvailable] = useState(false);

    // --- Modal State ---
    const [modal, setModal] = useState({ visible: false, message: '', type: 'confirm', onConfirm: null });

    // --- Toast State ---
    const [toast, setToast] = useState({ show: false, message: '' });

    useEffect(() => {
        const checkSaved = localStorage.getItem('revyou_deck');
        if (checkSaved) setSavedDataAvailable(true);
    }, []);

    const triggerToast = (msg) => {
        setToast({ show: true, message: msg });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    // --- Helper to Show Modal ---
    const showConfirm = (msg, action) => {
        setModal({
            visible: true,
            message: msg,
            type: 'confirm',
            onConfirm: () => {
                action();
                setModal({ ...modal, visible: false });
            }
        });
    };

    const showAlert = (msg) => {
        setModal({
            visible: true,
            message: msg,
            type: 'alert',
            onConfirm: () => setModal({ ...modal, visible: false })
        });
    };

    // --- Mode 1: Manual Add ---
    const handleAddCard = () => {
        if (!qInput.trim() || !aInput.trim()) {
            setError('Both Question and Answer are required.');
            return;
        }

        const newCard = {
            id: Date.now(),
            question: qInput.trim(),
            answer: aInput.trim(),
            category: "General"
        };

        setCards([...cards, newCard]);
        setQInput('');
        setAInput('');
        setError('');
    };

    const handleDeleteCard = (id) => {
        setCards(cards.filter(c => c.id !== id));
    };

    const handleDemoData = () => {
        const demoCards = [
            { id: 1, question: "What is the powerhouse of the cell?", answer: "Mitochondria", category: "General" },
            { id: 2, question: "What process converts sunlight to energy?", answer: "Photosynthesis", category: "General" },
            { id: 3, question: "Who is the National Hero of the Philippines?", answer: "Dr. Jose Rizal", category: "General" }
        ];
        setCards([...cards, ...demoCards]);
        setError('');
    };

    // --- Mode 2: File Upload ---
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                const complexCards = parseComplexJson(json);
                setCards([...cards, ...complexCards]);
            } catch (err) {
                setError('Error reading JSON file. Invalid format.');
            }
        };
        reader.readAsText(file);
    };

    // --- Mode 3: Saved Data ---
    const handleLoadSaved = () => {
        const performLoad = () => {
            try {
                const saved = localStorage.getItem('revyou_deck');
                if (saved) {
                    setCards(JSON.parse(saved));
                    triggerToast("Session Loaded Successfully!");
                } else {
                    setError('No saved data found.');
                }
            } catch (err) {
                setError('Failed to load saved data.');
            }
        };

        if (cards.length > 0) {
            showConfirm("Load saved deck? This will replace your current cards.", performLoad);
        } else {
            performLoad();
        }
    };

    // --- Mode 4: Download / Save Actions ---
    const handleSaveBrowser = () => {
        if (cards.length === 0) {
            setError('No cards to save.');
            return;
        }

        const performSave = () => {
            localStorage.setItem('revyou_deck', JSON.stringify(cards));
            setSavedDataAvailable(true);
            triggerToast("Deck Saved to Browser!");
        };

        showConfirm("Save this deck to browser? This will overwrite any previously saved deck.", performSave);
    };

    const handleDownloadJSON = () => {
        if (cards.length === 0) {
            setError('No cards to export.');
            return;
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cards, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "revyou_deck.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    // --- Submit ---
    const handleStartReview = () => {
        if (cards.length === 0) {
            setError('Please add at least one card to start.');
            return;
        }

        // Save and Proceed
        localStorage.setItem('revyou_deck', JSON.stringify(cards));
        onAnalyze(cards);
    };

    return (
        <>
            <div className="input-section">
                <header style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    <h1 style={{ color: 'var(--primary-color)', margin: 0, fontSize: '2.5rem' }}>RevYou ta Bai</h1>
                    <p style={{ color: '#666', fontSize: '1.1rem', marginTop: '0.5rem' }}>Project USeP • Flashcard Reviewer</p>
                </header>

                <div className="input-grid">
                    {/* Left Col: Form & Actions */}
                    <div className="form-area">
                        <h2>Create Your Deck</h2>

                        <input
                            className="modern-input"
                            placeholder="Enter Question..."
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                        />

                        <textarea
                            className="modern-textarea"
                            placeholder="Enter Answer..."
                            value={aInput}
                            onChange={(e) => setAInput(e.target.value)}
                        />

                        <div className="form-actions">
                            <button className="add-btn" onClick={handleAddCard}>
                                + Add Card
                            </button>
                            <button className="text-link-btn" onClick={handleDemoData}>
                                + Load Demo
                            </button>
                        </div>

                        {error && <p className="error-msg-small">{error}</p>}
                    </div>

                    <div className="divider-vertical"></div>

                    {/* Right Col: List Preview */}
                    <div className="list-area">
                        <div className="list-header">
                            <h2>Your Cards ({cards.length})</h2>
                            <div className="quick-icons">
                                <label title="Import JSON" className="icon-btn">
                                    <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
                                    {/* Upload Icon */}
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                </label>

                                <button title="Export JSON" className="icon-btn" onClick={handleDownloadJSON}>
                                    {/* Download Icon */}
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                </button>

                                <button title="Save to Browser" className="icon-btn" onClick={handleSaveBrowser}>
                                    {/* Floppy / Save Icon */}
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                </button>

                                {savedDataAvailable && (
                                    <button title="Resume / Load Saved" className="icon-btn" onClick={handleLoadSaved}>
                                        {/* Folder / Open Icon */}
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="card-list-container">
                            {cards.length === 0 ? (
                                <div className="empty-state">No cards added yet.</div>
                            ) : (
                                cards.map((card, idx) => (
                                    <div key={card.id} className="preview-card-item">
                                        <div className="preview-content">
                                            <strong>Q: {card.question}</strong>
                                            <span className="preview-answer">A: {card.answer}</span>
                                        </div>
                                        <button className="delete-btn" onClick={() => handleDeleteCard(card.id)}>×</button>
                                    </div>
                                ))
                            )}
                        </div>

                        <button className="primary-btn full-width" onClick={handleStartReview}>
                            Start Review Session
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Custom Modal --- */}
            {
                modal.visible && (
                    <div className="modal-overlay">
                        <div className="modal-card">
                            <h3>{modal.type === 'confirm' ? 'Confirm Action' : 'Notification'}</h3>
                            <p>{modal.message}</p>
                            <div className="modal-actions">
                                <button className="modal-btn-primary" onClick={modal.onConfirm}>
                                    {modal.type === 'confirm' ? 'Yes, Proceed' : 'Okay'}
                                </button>
                                {modal.type === 'confirm' && (
                                    <button className="modal-btn-cancel" onClick={() => setModal({ ...modal, visible: false })}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* --- Success Toast --- */}
            {
                toast.show && (
                    <div className="success-toast">
                        <div className="toast-icon">✓</div>
                        <span>{toast.message}</span>
                    </div>
                )
            }
        </>
    );
};

export default InputSelection;
