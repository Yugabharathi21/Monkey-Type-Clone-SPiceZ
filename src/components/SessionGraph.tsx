import React from 'react';
import './SessionGraph.css';

interface SessionGraphProps {
  wpmHistory: number[];
  accuracyHistory: number[];
  currentWpm: number;
  currentAccuracy: number;
  isActive: boolean;
}

const SessionGraph: React.FC<SessionGraphProps> = ({
  wpmHistory,
  accuracyHistory,
  currentWpm,
  currentAccuracy,
  isActive
}) => {
  const maxWpm = Math.max(...wpmHistory, currentWpm, 100);
  const maxDataPoints = 20; // Show last 20 data points

  // Get the last N data points for display
  const displayWpmHistory = wpmHistory.slice(-maxDataPoints);
  const displayAccuracyHistory = accuracyHistory.slice(-maxDataPoints);

  // Calculate additional statistics
  const avgWpm = wpmHistory.length > 0 ? Math.round(wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length) : 0;
  const maxWpmReached = wpmHistory.length > 0 ? Math.max(...wpmHistory) : 0;
  const avgAccuracy = accuracyHistory.length > 0 ? Math.round(accuracyHistory.reduce((a, b) => a + b, 0) / accuracyHistory.length) : 0;

  return (
    <div className={`session-graph ${isActive ? 'active' : ''}`}>
      <div className="graph-header">
        <h3>Real-time Performance</h3>
        <div className="current-stats">
          <span className="current-wpm">{currentWpm} WPM</span>
          <span className="current-accuracy">{currentAccuracy}%</span>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="performance-summary">
        <div className="summary-item">
          <span className="summary-label">Avg WPM</span>
          <span className="summary-value">{avgWpm}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Peak WPM</span>
          <span className="summary-value">{maxWpmReached}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Avg Accuracy</span>
          <span className="summary-value">{avgAccuracy}%</span>
        </div>
      </div>
      
      <div className="graph-container">
        <div className="graph-content">
          {/* WPM Line Chart */}
          <div className="chart-overlay wpm-chart">
            <svg width="100%" height="100%" viewBox="0 0 400 100">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(y => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="400"
                  y2={y}
                  stroke="rgba(100, 102, 105, 0.2)"
                  strokeWidth="1"
                />
              ))}
              
              {/* WPM Line */}
              {displayWpmHistory.length > 1 && (
                <polyline
                  points={displayWpmHistory
                    .map((wpm, index) => {
                      const x = (index / (maxDataPoints - 1)) * 400;
                      const y = 100 - (wpm / maxWpm) * 100;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
              
              {/* Accuracy Line */}
              {displayAccuracyHistory.length > 1 && (
                <polyline
                  points={displayAccuracyHistory
                    .map((accuracy, index) => {
                      const x = (index / (maxDataPoints - 1)) * 400;
                      const y = 100 - accuracy;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="var(--success)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="5,5"
                />
              )}
              
              {/* Current position indicator */}
              {displayWpmHistory.length > 0 && (
                <circle
                  cx="400"
                  cy={100 - (currentWpm / maxWpm) * 100}
                  r="4"
                  fill="var(--accent)"
                  className="pulse-dot"
                />
              )}
            </svg>
          </div>
          
          {/* Legend */}
          <div className="graph-legend">
            <div className="legend-item">
              <div className="legend-color wpm-color"></div>
              <span>WPM</span>
            </div>
            <div className="legend-item">
              <div className="legend-color accuracy-color"></div>
              <span>Accuracy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionGraph;
