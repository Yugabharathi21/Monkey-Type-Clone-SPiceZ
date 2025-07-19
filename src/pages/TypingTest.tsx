import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import '../styles/TypingTest.css';

interface TypingStats {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  totalCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
}

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once, making it perfect for typing practice.",
  "In the digital age, typing skills have become essential. Whether you're coding, writing emails, or creating documents, speed and accuracy matter.",
  "Programming requires patience, logic, and attention to detail. Every semicolon, bracket, and variable name must be precisely typed to avoid errors.",
  "The art of touch typing transforms the keyboard into an extension of your thoughts, allowing ideas to flow seamlessly from mind to screen."
];

const TypingTest: React.FC = () => {
  const [currentText, setCurrentText] = useState(sampleTexts[0]);
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 0,
    timeElapsed: 0,
    totalCharacters: 0,
    correctCharacters: 0,
    incorrectCharacters: 0
  });

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent default for most keys except special ones
      if (!['Tab', 'F5', 'F12'].includes(e.key)) {
        e.preventDefault();
      }

      if (!isStarted && e.key.length === 1) {
        handleStart();
      }

      if (isCompleted) return;

      if (e.key === 'Backspace') {
        if (userInput.length > 0) {
          const newInput = userInput.slice(0, -1);
          setUserInput(newInput);
          setCurrentIndex(newInput.length);
          calculateStats(newInput);
        }
      } else if (e.key.length === 1) {
        // Only allow typing if we haven't reached the end
        if (userInput.length < currentText.length) {
          const newInput = userInput + e.key;
          setUserInput(newInput);
          setCurrentIndex(newInput.length);
          calculateStats(newInput);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [userInput, currentText, isStarted, isCompleted]);

  const calculateFinalStats = React.useCallback(() => {
    if (!startTime) return;
    
    const timeElapsed = (Date.now() - startTime) / 1000 / 60;
    let correctCharacters = 0;

    for (let i = 0; i < currentText.length; i++) {
      if (userInput[i] === currentText[i]) {
        correctCharacters++;
      }
    }

    const accuracy = (correctCharacters / currentText.length) * 100;
    const wpm = Math.round((correctCharacters / 5) / timeElapsed);

    setStats(prev => ({
      ...prev,
      wpm,
      accuracy: Math.round(accuracy),
      timeElapsed: Math.round(timeElapsed * 60)
    }));
  }, [startTime, currentText, userInput]);

  useEffect(() => {
    if (userInput.length === currentText.length && userInput.length > 0) {
      setIsCompleted(true);
      calculateFinalStats();
    }
  }, [userInput, currentText, calculateFinalStats]);

  const handleStart = () => {
    if (!isStarted) {
      setIsStarted(true);
      setStartTime(Date.now());
    }
  };

  const calculateStats = (input: string) => {
    if (!startTime) return;

    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
    const totalCharacters = input.length;
    let correctCharacters = 0;

    for (let i = 0; i < input.length; i++) {
      if (input[i] === currentText[i]) {
        correctCharacters++;
      }
    }

    const incorrectCharacters = totalCharacters - correctCharacters;
    const accuracy = totalCharacters > 0 ? (correctCharacters / totalCharacters) * 100 : 0;
    const wpm = timeElapsed > 0 ? Math.round((correctCharacters / 5) / timeElapsed) : 0;

    setStats({
      wpm,
      accuracy: Math.round(accuracy),
      timeElapsed: Math.round(timeElapsed * 60), // back to seconds for display
      totalCharacters,
      correctCharacters,
      incorrectCharacters
    });
  };

  const resetTest = () => {
    setUserInput('');
    setCurrentIndex(0);
    setIsStarted(false);
    setIsCompleted(false);
    setStartTime(null);
    setStats({
      wpm: 0,
      accuracy: 0,
      timeElapsed: 0,
      totalCharacters: 0,
      correctCharacters: 0,
      incorrectCharacters: 0
    });
  };

  const changeText = () => {
    const randomIndex = Math.floor(Math.random() * sampleTexts.length);
    setCurrentText(sampleTexts[randomIndex]);
    resetTest();
  };

  const renderText = () => {
    return currentText.split('').map((char, index) => {
      let className = 'char';
      
      if (index < userInput.length) {
        className += userInput[index] === char ? ' correct' : ' incorrect';
      } else if (index === currentIndex) {
        className += ' current';
      }

      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="typing-container">
      <NavBar />

      <main className="typing-main">
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-label">wpm</span>
            <span className="stat-value">{stats.wpm}</span>
          </div>
          <div className="stat">
            <span className="stat-label">accuracy</span>
            <span className="stat-value">{stats.accuracy}%</span>
          </div>
          <div className="stat">
            <span className="stat-label">time</span>
            <span className="stat-value">{stats.timeElapsed}s</span>
          </div>
        </div>

        <div className="text-display" tabIndex={0}>
          {renderText()}
          {!isStarted && (
            <div className="start-prompt">
              Start typing to begin...
            </div>
          )}
        </div>

        <div className="controls">
          <button onClick={resetTest} className="control-btn">
            reset
          </button>
          <button onClick={changeText} className="control-btn">
            new text
          </button>
        </div>

        {isCompleted && (
          <div className="results">
            <h2>Test Complete!</h2>
            <div className="results-grid">
              <div className="result-item">
                <span className="result-label">Words per minute</span>
                <span className="result-value">{stats.wpm}</span>
              </div>
              <div className="result-item">
                <span className="result-label">Accuracy</span>
                <span className="result-value">{stats.accuracy}%</span>
              </div>
              <div className="result-item">
                <span className="result-label">Time taken</span>
                <span className="result-value">{stats.timeElapsed}s</span>
              </div>
              <div className="result-item">
                <span className="result-label">Characters typed</span>
                <span className="result-value">{stats.totalCharacters}</span>
              </div>
            </div>
            <button onClick={resetTest} className="retry-btn">
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default TypingTest;
