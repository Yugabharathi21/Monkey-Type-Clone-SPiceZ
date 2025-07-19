import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import ThemeSelector from '../components/ThemeSelector';
import '../styles/Dashboard.css';

interface TypingSession {
  id: string;
  date: string;
  wpm: number;
  accuracy: number;
  duration: number;
  charactersTyped: number;
  errorCount: number;
  textLength: number;
}

interface DashboardStats {
  totalTests: number;
  averageWpm: number;
  averageAccuracy: number;
  totalTimeTyping: number;
  bestWpm: number;
  bestAccuracy: number;
  totalCharacters: number;
  improvementRate: number;
}

const Dashboard: React.FC = () => {
  const [sessions, setSessions] = useState<TypingSession[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 0,
    averageWpm: 0,
    averageAccuracy: 0,
    totalTimeTyping: 0,
    bestWpm: 0,
    bestAccuracy: 0,
    totalCharacters: 0,
    improvementRate: 0
  });
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    // Mock session data - in a real app, this would come from an API
    const mockSessions: TypingSession[] = [
      {
        id: '1',
        date: '2025-01-19T14:30:00Z',
        wpm: 85,
        accuracy: 94,
        duration: 60,
        charactersTyped: 425,
        errorCount: 26,
        textLength: 451
      },
      {
        id: '2',
        date: '2025-01-19T09:15:00Z',
        wpm: 78,
        accuracy: 91,
        duration: 90,
        charactersTyped: 585,
        errorCount: 58,
        textLength: 643
      },
      {
        id: '3',
        date: '2025-01-18T16:45:00Z',
        wpm: 82,
        accuracy: 96,
        duration: 75,
        charactersTyped: 513,
        errorCount: 21,
        textLength: 534
      },
      {
        id: '4',
        date: '2025-01-18T11:20:00Z',
        wpm: 73,
        accuracy: 89,
        duration: 60,
        charactersTyped: 365,
        errorCount: 45,
        textLength: 410
      },
      {
        id: '5',
        date: '2025-01-17T19:30:00Z',
        wpm: 80,
        accuracy: 93,
        duration: 120,
        charactersTyped: 800,
        errorCount: 60,
        textLength: 860
      },
      {
        id: '6',
        date: '2025-01-17T13:10:00Z',
        wpm: 76,
        accuracy: 87,
        duration: 60,
        charactersTyped: 380,
        errorCount: 59,
        textLength: 439
      },
      {
        id: '7',
        date: '2025-01-16T20:45:00Z',
        wpm: 71,
        accuracy: 92,
        duration: 90,
        charactersTyped: 533,
        errorCount: 46,
        textLength: 579
      },
      {
        id: '8',
        date: '2025-01-16T15:25:00Z',
        wpm: 68,
        accuracy: 85,
        duration: 60,
        charactersTyped: 340,
        errorCount: 64,
        textLength: 404
      }
    ];

    // Filter sessions based on time range
    const now = new Date();
    const filteredSessions = mockSessions.filter(session => {
      const sessionDate = new Date(session.date);
      if (timeRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sessionDate >= weekAgo;
      } else if (timeRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return sessionDate >= monthAgo;
      }
      return true;
    });

    setSessions(filteredSessions);
    console.log('Filtered sessions:', filteredSessions); // Debug log

    // Calculate stats
    if (filteredSessions.length > 0) {
      const totalTests = filteredSessions.length;
      const totalWpm = filteredSessions.reduce((sum, s) => sum + s.wpm, 0);
      const totalAccuracy = filteredSessions.reduce((sum, s) => sum + s.accuracy, 0);
      const totalTime = filteredSessions.reduce((sum, s) => sum + s.duration, 0);
      const totalChars = filteredSessions.reduce((sum, s) => sum + s.charactersTyped, 0);
      const bestWpm = Math.max(...filteredSessions.map(s => s.wpm));
      const bestAccuracy = Math.max(...filteredSessions.map(s => s.accuracy));

      // Calculate improvement rate (comparing first half vs second half)
      const midPoint = Math.floor(filteredSessions.length / 2);
      const firstHalf = filteredSessions.slice(0, midPoint);
      const secondHalf = filteredSessions.slice(midPoint);
      
      let improvementRate = 0;
      if (firstHalf.length > 0 && secondHalf.length > 0) {
        const firstHalfAvg = firstHalf.reduce((sum, s) => sum + s.wpm, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, s) => sum + s.wpm, 0) / secondHalf.length;
        improvementRate = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
      }

      setStats({
        totalTests,
        averageWpm: totalTests > 0 ? Math.round(totalWpm / totalTests) : 0,
        averageAccuracy: totalTests > 0 ? Math.round(totalAccuracy / totalTests) : 0,
        totalTimeTyping: totalTime,
        bestWpm,
        bestAccuracy,
        totalCharacters: totalChars,
        improvementRate: Math.round(improvementRate)
      });
    } else {
      // Set default stats when no sessions
      setStats({
        totalTests: 0,
        averageWpm: 0,
        averageAccuracy: 0,
        totalTimeTyping: 0,
        bestWpm: 0,
        bestAccuracy: 0,
        totalCharacters: 0,
        improvementRate: 0
      });
    }
  }, [timeRange]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="dashboard-container">
      <NavBar />

      <main className="dashboard-main">
        <div className="analytics-title">
          <h2>Your Typing Analytics</h2>
          <p>Track your progress and improve your typing skills</p>
        </div>

        <div className="theme-selector-section">
          <h3>Customize Your Experience</h3>
          <ThemeSelector />
        </div>

        <div className="time-filter">
          <button 
            className={`filter-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Last Week
          </button>
          <button 
            className={`filter-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Last Month
          </button>
          <button 
            className={`filter-btn ${timeRange === 'all' ? 'active' : ''}`}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <h3>Average WPM</h3>
              <div className="stat-value">{stats.averageWpm}</div>
              <div className="stat-change positive">
                +{stats.improvementRate}% improvement
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>Average Accuracy</h3>
              <div className="stat-value">{stats.averageAccuracy}%</div>
              <div className="stat-label">precision matters</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <h3>Best WPM</h3>
              <div className="stat-value">{stats.bestWpm}</div>
              <div className="stat-label">personal record</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Tests Completed</h3>
              <div className="stat-value">{stats.totalTests}</div>
              <div className="stat-label">keep practicing</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <h3>Time Spent</h3>
              <div className="stat-value">{formatDuration(stats.totalTimeTyping)}</div>
              <div className="stat-label">dedicated practice</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔤</div>
            <div className="stat-content">
              <h3>Characters Typed</h3>
              <div className="stat-value">{stats.totalCharacters.toLocaleString()}</div>
              <div className="stat-label">keystrokes logged</div>
            </div>
          </div>
        </div>

        <div className="charts-section">
          <div className="chart-container">
            <h3>WPM Progress Over Time</h3>
            <div className="line-chart">
              {sessions.length > 0 ? (
                <div className="chart-grid">
                  {sessions.slice(-7).map((session) => {
                    const maxWpm = Math.max(...sessions.map(s => s.wpm));
                    const height = maxWpm > 0 ? (session.wpm / maxWpm) * 100 : 50;
                    return (
                      <div key={session.id} className="chart-bar">
                        <div 
                          className="bar wpm-bar"
                          style={{ height: `${height}%` }}
                          title={`${session.wpm} WPM`}
                        ></div>
                        <span className="bar-label">
                          {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-chart-data">
                  <p>📊 No data available yet</p>
                  <p>Complete some typing tests to see your progress!</p>
                </div>
              )}
            </div>
          </div>

          <div className="chart-container">
            <h3>Accuracy Trends</h3>
            <div className="line-chart">
              {sessions.length > 0 ? (
                <div className="chart-grid">
                  {sessions.slice(-7).map((session) => {
                    const height = session.accuracy;
                    return (
                      <div key={session.id} className="chart-bar">
                        <div 
                          className="bar accuracy-bar"
                          style={{ height: `${height}%` }}
                          title={`${session.accuracy}% Accuracy`}
                        ></div>
                        <span className="bar-label">
                          {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-chart-data">
                  <p>🎯 No accuracy data yet</p>
                  <p>Start typing to track your accuracy!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="typing-heatmap-section">
          <div className="chart-container full-width">
            <h3>Weekly Typing Activity</h3>
            <div className="heatmap">
              <div className="heatmap-grid">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="heatmap-column">
                    <div className="heatmap-label">{day}</div>
                    {[0, 1, 2, 3].map(week => {
                      const intensity = Math.floor(Math.random() * 4); // Mock data
                      return (
                        <div 
                          key={week}
                          className={`heatmap-cell intensity-${intensity}`}
                          title={`${day} - Week ${week + 1}: ${intensity * 25}% activity`}
                        ></div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="heatmap-legend">
                <span>Less</span>
                <div className="legend-scale">
                  {[0, 1, 2, 3].map(level => (
                    <div key={level} className={`legend-cell intensity-${level}`}></div>
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>

        <div className="performance-insights">
          <h3>Performance Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <h4>Improvement Trend</h4>
                <p>
                  {stats.improvementRate >= 0 
                    ? `You've improved by ${stats.improvementRate}% over time!` 
                    : `Focus on consistency to improve your average speed.`
                  }
                </p>
              </div>
            </div>
            
            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <h4>Accuracy Analysis</h4>
                <p>
                  {stats.averageAccuracy >= 95 
                    ? 'Excellent accuracy! You maintain high precision while typing.'
                    : stats.averageAccuracy >= 90 
                    ? 'Good accuracy. Try to maintain precision while increasing speed.'
                    : 'Focus on accuracy first - speed will naturally follow.'
                  }
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">⚡</div>
              <div className="insight-content">
                <h4>Speed Target</h4>
                <p>
                  {stats.averageWpm >= 60 
                    ? 'Great typing speed! You\'re above average for most users.'
                    : stats.averageWpm >= 40 
                    ? 'Good progress! Aim for 60+ WPM for professional typing.'
                    : 'Keep practicing! Focus on proper finger placement and rhythm.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="recent-sessions">
          <h3>Recent Sessions</h3>
          <div className="sessions-table">
            <div className="table-header">
              <div>Date</div>
              <div>WPM</div>
              <div>Accuracy</div>
              <div>Duration</div>
              <div>Characters</div>
            </div>
            <div className="table-body">
              {sessions.slice(0, 10).map(session => (
                <div key={session.id} className="table-row">
                  <div className="session-date">{formatDate(session.date)}</div>
                  <div className="session-wpm">{session.wpm}</div>
                  <div className="session-accuracy">{session.accuracy}%</div>
                  <div className="session-duration">{formatDuration(session.duration)}</div>
                  <div className="session-characters">{session.charactersTyped}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {sessions.length === 0 && (
          <div className="no-data">
            <h3>No typing sessions found</h3>
            <p>Start typing to see your analytics!</p>
            <Link to="/" className="start-typing-btn">Start Typing Test</Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
