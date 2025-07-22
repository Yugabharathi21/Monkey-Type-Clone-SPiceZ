import React, { useState, useEffect } from 'react';
import SessionGraph from '../components/SessionGraph';
import { generateText, getTextOptions } from '../services/textGenerator';
import '../styles/TypingTest.css';

// API Configuration for test submission only
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface TypingStats {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  totalCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
}

interface TestSubmissionData {
  testConfig: {
    textType: string;
    difficulty: string;
    duration: number;
    language: string;
  };
  testContent: {
    originalText: string;
    textSource: string;
    textId: null;
  };
  results: TypingStats;
  keystrokeData: unknown[];
  wpmHistory: { timestamp: number; wpm: number; }[];
  accuracyHistory: { timestamp: number; accuracy: number; }[];
  metadata: {
    userAgent: string;
    timestamp: string;
  };
  isCompleted: boolean;
  isGuest?: boolean;
  guestId?: string;
}

interface TextOptions {
  categories: string[];
  difficulties: string[];
  languages: string[];
}

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet.",
  "Programming is not about typing, it's about thinking. Speed comes with practice and understanding.",
  "Type like the wind, think like the storm. Every keystroke brings you closer to mastery."
];

const TypingTest: React.FC = () => {
  const [currentText, setCurrentText] = useState(sampleTexts[0] || "Start typing to begin your test...");
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [accuracyHistory, setAccuracyHistory] = useState<number[]>([]);
  
  // Text configuration state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('medium');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('english');
  const [textOptions, setTextOptions] = useState<TextOptions>({
    categories: ['quotes', 'literature', 'programming', 'common-words'],
    difficulties: ['easy', 'medium', 'hard'],
    languages: ['english']
  });
  const [isLoadingText, setIsLoadingText] = useState(false);
  
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
    if (!startTime || !currentText) return;

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

  const submitTestResults = React.useCallback(async () => {
    if (!startTime || isSubmitted) return; // Prevent multiple submissions
    
    setIsSubmitted(true); // Mark as submitted to prevent duplicates

    const finalStats = {
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      timeElapsed: Math.round((Date.now() - startTime) / 1000),
      totalCharacters: userInput.length,
      correctCharacters: stats.correctCharacters,
      incorrectCharacters: userInput.length - stats.correctCharacters,
    };

    const testData: TestSubmissionData = {
      testConfig: {
        textType: 'random',
        difficulty: 'medium',
        duration: finalStats.timeElapsed,
        language: 'english',
      },
      testContent: {
        originalText: currentText,
        textSource: 'default',
        textId: null,
      },
      results: finalStats,
      keystrokeData: [], // Could be enhanced to track individual keystrokes
      wpmHistory: wpmHistory.map((wpm, index) => ({
        timestamp: startTime + (index * 5000), // Approximate timestamp every 5 seconds
        wpm
      })),
      accuracyHistory: accuracyHistory.map((accuracy, index) => ({
        timestamp: startTime + (index * 5000), // Approximate timestamp every 5 seconds
        accuracy
      })),
      metadata: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
      isCompleted: true,
    };

    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Handle as guest user
        testData.isGuest = true;
        testData.guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      const response = await fetch(`${API_BASE_URL}/tests/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(testData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Test results submitted successfully:', result);
      } else {
        const error = await response.json();
        console.error('❌ Failed to submit test results:', error);
        setIsSubmitted(false); // Reset on error so user can retry
      }
    } catch (error) {
      console.error('❌ Error submitting test results:', error);
      setIsSubmitted(false); // Reset on error so user can retry
    }
  }, [startTime, stats, userInput.length, currentText, wpmHistory, accuracyHistory, isSubmitted]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle keyboard events if we're on the typing test page
      // Check if any form input is currently focused
      const activeElement = document.activeElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.tagName === 'SELECT' ||
        activeElement.hasAttribute('contenteditable')
      )) {
        return; // Don't interfere with form inputs
      }

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
        // Only allow typing if we haven't reached the end and currentText exists
        if (currentText && userInput.length < currentText.length) {
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
    if (currentText && userInput.length === currentText.length && userInput.length > 0 && !isSubmitted) {
      setIsCompleted(true);
      calculateFinalStats();
      // Submit results to database only once
      submitTestResults();
    }
  }, [userInput, currentText, calculateFinalStats, submitTestResults, isSubmitted]);

  const resetTest = () => {
    setUserInput('');
    setCurrentIndex(0);
    setIsStarted(false);
    setIsCompleted(false);
    setIsSubmitted(false); // Reset submission state
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

  // Load available text options on component mount
  useEffect(() => {
    // Load text options from the generator
    const options = getTextOptions();
    setTextOptions({
      categories: options.categories,
      difficulties: options.difficulties,
      languages: options.languages
    });
    
    // Load initial text using the generator
    const initialText = generateText({
      category: 'literature',
      difficulty: 'medium',
      language: 'english'
    });
    setCurrentText(initialText.content);
  }, []);

  // Function to load a new text based on current settings
  const loadNewText = () => {
    setIsLoadingText(true);
    try {
      const textData = generateText({
        category: selectedCategory === 'all' ? 'literature' : selectedCategory,
        difficulty: selectedDifficulty as 'easy' | 'medium' | 'hard',
        language: selectedLanguage
      });
      
      setCurrentText(textData.content);
      
      // Reset test state without changing the text
      setUserInput('');
      setCurrentIndex(0);
      setIsStarted(false);
      setIsCompleted(false);
      setIsSubmitted(false);
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
    } catch (error) {
      console.error('Error loading new text:', error);
    } finally {
      setIsLoadingText(false);
    }
  };

  const renderText = () => {
    // Safety check to ensure currentText is defined
    const textToRender = currentText || sampleTexts[0] || "Start typing to begin your test...";
    
    return (
      <div className="text-content">
        {textToRender.split('').map((char, index) => {
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

        <div className="text-configuration">
          <div className="config-row">
            <div className="config-group">
              <label htmlFor="category-select">Category:</label>
              <select 
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={isStarted}
              >
                <option value="all">All Categories</option>
                {textOptions.categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="config-group">
              <label htmlFor="difficulty-select">Difficulty:</label>
              <select 
                id="difficulty-select"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                disabled={isStarted}
              >
                {textOptions.difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="config-group">
              <label htmlFor="language-select">Language:</label>
              <select 
                id="language-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isStarted}
              >
                {textOptions.languages.map(language => (
                  <option key={language} value={language}>
                    {language.charAt(0).toUpperCase() + language.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={loadNewText} 
              className="control-btn new-text-btn"
              disabled={isStarted || isLoadingText}
            >
              {isLoadingText ? 'Loading...' : 'New Text'}
            </button>
          </div>
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
