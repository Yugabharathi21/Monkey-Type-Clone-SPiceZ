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

  return (
    <div className={`session-graph ${isActive ? 'active' : ''}`}>
      <div className="graph-header">
        <h3>Real-time Performance</h3>
        <div className="current-stats">
          <span className="current-wpm">{currentWpm} WPM</span>
          <span className="current-accuracy">{currentAccuracy}%</span>
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
                  stroke="var(--accent-color)"
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
                  stroke="#4CAF50"
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
                  fill="var(--accent-color)"
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
