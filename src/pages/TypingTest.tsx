import React, { useState, useEffect } from 'react';
import SessionGraph from '../components/SessionGraph';
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
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet.",
  "Programming is not about typing, it's about thinking. Speed comes with practice and understanding.",
  "Type like the wind, think like the storm. Every keystroke brings you closer to mastery."
];

const TypingTest: React.FC = () => {
  const [currentText, setCurrentText] = useState(sampleTexts[0]);
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [accuracyHistory, setAccuracyHistory] = useState<number[]>([]);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 0,
    timeElapsed: 0,
    totalCharacters: 0,
    correctCharacters: 0,
    incorrectCharacters: 0
  });

  const handleStart = React.useCallback(() => {
    if (!isStarted) {
      setIsStarted(true);
      setStartTime(Date.now());
    }
  }, [isStarted]);

  const calculateStats = React.useCallback((input: string) => {
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

    const newStats = {
      wpm,
      accuracy: Math.round(accuracy),
      timeElapsed: Math.round((Date.now() - startTime) / 1000),
      totalCharacters,
      correctCharacters,
      incorrectCharacters
    };

    setStats(newStats);

    // Update history every few characters for smooth graph updates
    if (totalCharacters > 0 && totalCharacters % 5 === 0) {
      setWpmHistory(prev => [...prev, wpm]);
      setAccuracyHistory(prev => [...prev, Math.round(accuracy)]);
    }
  }, [startTime, currentText]);

  const calculateFinalStats = React.useCallback(() => {
    if (!startTime) return;
    
    const timeElapsed = (Date.now() - startTime) / 1000 / 60;
    let correctCharacters = 0;

    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === currentText[i]) {
        correctCharacters++;
      }
    }

    const accuracy = userInput.length > 0 ? (correctCharacters / userInput.length) * 100 : 0;
    const wpm = timeElapsed > 0 ? Math.round((correctCharacters / 5) / timeElapsed) : 0;
    
    setStats({
      wpm,
      accuracy: Math.round(accuracy),
      timeElapsed: Math.round((Date.now() - startTime) / 1000),
      totalCharacters: userInput.length,
      correctCharacters,
      incorrectCharacters: userInput.length - correctCharacters
    });
  }, [userInput, currentText, startTime]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent default for most keys except special ones
      if (!['Tab', 'F5', 'F12'].includes(e.key)) {
        e.preventDefault();
      }

      if (!isStarted && e.key.length === 1) {
        handleStart();
      }

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
  }, [userInput, currentText, isStarted, isCompleted, calculateStats, handleStart]);

  // Check if test is completed
  useEffect(() => {
    if (userInput.length === currentText.length && userInput.length > 0) {
      setIsCompleted(true);
      calculateFinalStats();
    }
  }, [userInput, currentText, calculateFinalStats]);

  const resetTest = () => {
    setUserInput('');
    setCurrentIndex(0);
    setIsStarted(false);
    setIsCompleted(false);
    setStartTime(null);
    setWpmHistory([]);
    setAccuracyHistory([]);
    setStats({
      wpm: 0,
      accuracy: 0,
      timeElapsed: 0,
      totalCharacters: 0,
      correctCharacters: 0,
      incorrectCharacters: 0
    });
    // Generate new text
    const randomIndex = Math.floor(Math.random() * sampleTexts.length);
    setCurrentText(sampleTexts[randomIndex]);
  };

  const renderText = () => {
    return (
      <div className="text-content">
        {currentText.split('').map((char, index) => {
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
        })}
      </div>
    );
  };

  return (
    <div className="typing-container">
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

        {isStarted && (
          <div className="session-graph-container">
            <SessionGraph 
              wpmHistory={wpmHistory} 
              accuracyHistory={accuracyHistory}
              currentWpm={stats.wpm}
              currentAccuracy={stats.accuracy}
              isActive={isStarted && !isCompleted}
            />
          </div>
        )}

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
            
            {/* Session Performance Graph */}
            <div className="results-graph-section">
              <h3>Your Performance Graph</h3>
              <SessionGraph 
                wpmHistory={wpmHistory} 
                accuracyHistory={accuracyHistory}
                currentWpm={stats.wpm}
                currentAccuracy={stats.accuracy}
                isActive={false}
              />
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
