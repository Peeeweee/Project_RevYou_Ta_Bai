import React, { useState, useEffect, useRef } from 'react';
import { parseComplexJson } from '../utils/jsonParser';

const InputSelection = ({ onAnalyze, onBack }) => {
    // State for the list of cards
    const [cards, setCards] = useState([]);

    // State for current input
    const [qInput, setQInput] = useState('');
    const [aInput, setAInput] = useState('');

    // --- Bulk Modal State ---
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkText, setBulkText] = useState('');

    const [error, setError] = useState('');
    const [savedDataAvailable, setSavedDataAvailable] = useState(false);

    // --- Modal State ---
    const [modal, setModal] = useState({ visible: false, message: '', type: 'confirm', onConfirm: null });

    // --- File System Handle State ---
    const [fileHandle, setFileHandle] = useState(null);
    const fileInputRef = useRef(null);

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

    // --- Mode 1.5: Bulk Add ---
    const handleBulkSubmit = () => {
        if (!bulkText.trim()) {
            setShowBulkModal(false);
            return;
        }

        try {
            // Attempt to parse as JSON Array
            const json = JSON.parse(bulkText);
            const complexCards = parseComplexJson(json);

            // Append to existing cards instead of replacing
            setCards([...cards, ...complexCards]);
            triggerToast(`Added ${complexCards.length} cards from list!`);
            setBulkText('');
            setShowBulkModal(false);
        } catch (err) {
            // If JSON fails, maybe valid line-by-line? (Future enhancement)
            // For now, alert error
            setModal({
                visible: true,
                message: 'Invalid JSON format. Please ensure it is a valid list of questions.',
                type: 'alert',
                onConfirm: () => setModal({ ...modal, visible: false })
            });
        }
    };

    const handleDeleteCard = (id) => {
        setCards(cards.filter(c => c.id !== id));
    };

    // --- Shuffle ---
    const handleShuffle = () => {
        if (cards.length < 2) return;
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        triggerToast("Deck Randomized!");
    };

    // --- Smart Load (File System API) ---
    const handleSmartLoad = async () => {
        if ('showOpenFilePicker' in window) {
            try {
                const [handle] = await window.showOpenFilePicker({
                    types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
                    multiple: false
                });

                const file = await handle.getFile();
                const text = await file.text();
                const json = JSON.parse(text);
                const complexCards = parseComplexJson(json);

                setCards(complexCards);
                setFileHandle(handle);
                triggerToast("Reviewer Loaded & Linked!");
                setError('');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError('Failed to open file.');
                }
            }
        } else {
            // Fallback to legacy input
            if (fileInputRef.current) {
                fileInputRef.current.click();
            }
        }
    };

    // --- Legacy Fallback Load ---
    const handleReviewerFileLoad = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                const complexCards = parseComplexJson(json);
                setCards(complexCards);
                setFileHandle(null);
                triggerToast("Reviewer Loaded (Read-Only)!");
                setError('');
            } catch (err) {
                setError('Error reading JSON file. Invalid format.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    // --- Smart Save (Overwrite or Save As) ---
    const handleSmartSave = async () => {
        if (cards.length === 0) {
            setError('No cards to save.');
            return;
        }

        if (fileHandle) {
            try {
                const writable = await fileHandle.createWritable();
                await writable.write(JSON.stringify(cards, null, 2));
                await writable.close();

                // ALSO save to localStorage
                localStorage.setItem('revyou_deck', JSON.stringify(cards));
                setSavedDataAvailable(true);

                triggerToast("File Overwritten & Session Saved!");
            } catch (err) {
                setError('Failed to overwrite file. Try "Save As".');
            }
        } else {
            handleSaveAs();
        }
    };

    const handleSaveAs = async () => {
        if ('showSaveFilePicker' in window) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: 'revyou_deck.json',
                    types: [{ description: 'JSON Files', accept: { 'application/json': ['.json'] } }],
                });
                const writable = await handle.createWritable();
                await writable.write(JSON.stringify(cards, null, 2));
                await writable.close();
                setFileHandle(handle);
                triggerToast("File Saved Successfully!");
            } catch (err) {
                if (err.name !== 'AbortError') handleDownloadJSON();
            }
        } else {
            handleDownloadJSON();
        }
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
    const handleSaveCopy = () => {
        handleSaveAs();
    };

    // --- Fallback Download ---
    const handleDownloadJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cards, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "revyou_deck.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    // --- Submit ---
    const handleStartReview = () => {
        if (cards.length === 0) {
            setError('Please add at least one card to start.');
            return;
        }
        localStorage.setItem('revyou_deck', JSON.stringify(cards));
        onAnalyze(cards);
    };

    return (
        <>
            <div className="input-section">
                <header style={{ textAlign: 'left', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button className="back-btn-small" onClick={onBack} aria-label="Go Back" style={{ color: '#333' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#111' }}>
                            RevYou <span style={{ color: 'var(--primary-color)' }}>ta Bai</span>
                        </h1>
                        <p style={{ color: '#666', fontSize: '1.1rem', marginTop: '0.2rem' }}>Project USeP • Flashcard Reviewer</p>
                    </div>
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

                            {/* NEW: Bulk Add List Button */}
                            <button className="secondary-btn" onClick={() => setShowBulkModal(true)} style={{ marginLeft: '10px', background: '#eee', color: '#333', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                + Add List
                            </button>

                            {/* Hidden input kept for legacy fallback */}
                            <input
                                type="file"
                                accept=".json"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleReviewerFileLoad}
                            />
                        </div>

                        {error && <p className="error-msg-small">{error}</p>}
                    </div>

                    <div className="divider-vertical"></div>

                    {/* Right Col: List Preview */}
                    <div className="list-area">
                        <div className="list-header">
                            <h2>Your Cards ({cards.length})</h2>
                            <div className="quick-icons">
                                {/* Load / Open File */}
                                <button title="Open Reviewer File" className="icon-btn" onClick={handleSmartLoad}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                </button>

                                {/* Shuffle / Randomize */}
                                <button title="Randomize Order" className="icon-btn" onClick={handleShuffle}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
                                </button>

                                {/* Save As New File */}
                                <button title="Save As New File..." className="icon-btn" onClick={handleSaveAs}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                                </button>

                                {/* Overwrite / Save Changes */}
                                <button
                                    title={fileHandle ? "Save Changes (Overwrite)" : "Save to File"}
                                    className="icon-btn"
                                    onClick={handleSmartSave}
                                    style={fileHandle ? { borderColor: 'var(--primary-color)', color: 'var(--primary-color)', background: '#fff5f5' } : {}}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                </button>
                            </div>
                        </div>

                        <div className="card-list-container">
                            {cards.length === 0 ? (
                                <div className="empty-state">No cards added yet.</div>
                            ) : (
                                cards.map((card) => (
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
            {modal.visible && (
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
            )}

            {/* --- Bulk Add Modal --- */}
            {showBulkModal && (
                <div className="modal-overlay">
                    <div className="modal-card" style={{ maxWidth: '600px', width: '90%' }}>
                        <h3>Add List of Questions</h3>
                        <p>Paste your JSON list here.</p>
                        <textarea
                            className="modern-textarea"
                            style={{ height: '200px', fontSize: '14px', fontFamily: 'monospace' }}
                            placeholder={'[\n  {"question": "...", "answer": "..."},\n  ...\n]'}
                            value={bulkText}
                            onChange={(e) => setBulkText(e.target.value)}
                        />
                        <div className="modal-actions">
                            <button className="modal-btn-primary" onClick={handleBulkSubmit}>
                                Add Questions
                            </button>
                            <button className="modal-btn-cancel" onClick={() => setShowBulkModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Success Toast --- */}
            {toast.show && (
                <div className="success-toast">
                    <span>{toast.message}</span>
                </div>
            )}
        </>
    );
};

export default InputSelection;
