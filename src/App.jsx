
import { useState } from 'react';
import Flashcard from './components/Flashcard';
import WelcomeScreen from './components/WelcomeScreen';
import InputSelection from './components/InputSelection';
import LoadingScreen from './components/LoadingScreen';
import StartConfirmation from './components/StartConfirmation';
import questionsData from './data/questions.json';
import './App.css';

function App() {
  const [appStep, setAppStep] = useState(1); // 1: Welcome, 2: Input, 3: Loading, 4: Confirm, 5: App
  const [cards, setCards] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Default to local data if no input is given (or used as base)
  const handleStartFlow = () => setAppStep(2);

  const handleDataReady = (data) => {
    setCards(data);
    setAppStep(3); // Go to loading
  };

  const handleLoadingComplete = () => {
    handleStartSession(); // Skip Step 4 (Confirmation) and go straight to App (Step 5)
  };

  const handleStartSession = () => {
    setAppStep(5); // Go to main app
    setCurrentQuestionIndex(0);
    setIsRevealed(false);
  };

  // --- Main App Logic (Step 5) ---
  const currentQuestion = cards[currentQuestionIndex];
  const maxQuestions = cards.length;

  const handleReveal = () => setIsRevealed(true);

  const handleNext = () => {
    setIsRevealed(false);
    setTimeout(() => {
      setCurrentQuestionIndex((prev) => (prev === maxQuestions - 1 ? 0 : prev + 1));
    }, 300);
  };

  const handlePrev = () => {
    setIsRevealed(false);
    setCurrentQuestionIndex((prev) => (prev === 0 ? maxQuestions - 1 : prev - 1));
  };

  const handleRestart = () => {
    setAppStep(1);
    setCards([]);
  };

  return (
    <div className="app-container">
      {appStep === 1 && <WelcomeScreen onStart={handleStartFlow} />}

      {appStep === 2 && <InputSelection onAnalyze={handleDataReady} />}

      {appStep === 3 && <LoadingScreen onComplete={handleLoadingComplete} />}

      {appStep === 4 && <StartConfirmation count={cards.length} onConfirm={handleStartSession} />}

      {appStep === 5 && (
        <>
          <header className="app-header">
            <div className="header-top">
              <button className="back-btn-small" onClick={handleRestart} aria-label="Home">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </button>
              <h1>RevYou nata Bai?</h1>
            </div>
            <p>Session Active • {maxQuestions} Cards</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentQuestionIndex + 1) / maxQuestions) * 100}%` }}
              ></div>
            </div>
            <p className="progress-text">Card {currentQuestionIndex + 1} / {maxQuestions}</p>
          </header>

          <main className="card-area">
            {currentQuestion ? (
              <Flashcard
                key={currentQuestion.id || currentQuestionIndex}
                question={currentQuestion.question}
                answer={currentQuestion.answer}
                category={currentQuestion.category}
                isRevealed={isRevealed}
                onReveal={handleReveal}
                onNext={handleNext}
              />
            ) : (
              <div className="error-state">No cards available.</div>
            )}
          </main>

          <div className="navigation-controls">
            <button className="nav-btn prev" onClick={handlePrev} disabled={isRevealed}>
              &#8592; Previous
            </button>
            <button className="nav-btn next" onClick={handleNext}>
              Skip / Next &#8594;
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
