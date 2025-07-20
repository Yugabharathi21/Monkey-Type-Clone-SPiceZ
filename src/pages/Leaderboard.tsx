import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Leaderboard.css';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface LeaderboardEntry {
  _id: string;
  username: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    country?: string;
    preferredLanguage?: string;
    avatar?: string;
  };
  bestWPM: number;
  bestAccuracy: number;
  averageWPM: number;
  averageAccuracy: number;
  totalTests: number;
  recentTestDate: string;
  consistencyScore?: number;
  rank: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  metadata: {
    timeframe: string;
    metric: string;
    category: string;
    totalParticipants: number;
    entriesShown: number;
    lastUpdated: string;
  };
}

const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [timeFilter, setTimeFilter] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [sortBy, setSortBy] = useState<'wpm' | 'accuracy' | 'consistency'>('wpm');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  // Fetch leaderboard data from API
  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        timeframe: timeFilter,
        metric: sortBy,
        limit: '50',
        category: 'all'
      });

      const response = await fetch(`${API_BASE_URL}/leaderboard?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.status}`);
      }

      const data: LeaderboardResponse = await response.json();
      setLeaderboardData(data.leaderboard);
      setMetadata(data.metadata);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard data');
      // Fallback to empty array if API fails
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeFilter, sortBy]);

  const getDisplayName = (entry: LeaderboardEntry) => {
    if (entry.profile?.firstName && entry.profile?.lastName) {
      return `${entry.profile.firstName} ${entry.profile.lastName}`;
    }
    return entry.username;
  };

  const getMetricValue = (entry: LeaderboardEntry) => {
    switch (sortBy) {
      case 'accuracy':
        return `${entry.bestAccuracy}%`;
      case 'consistency':
        return entry.consistencyScore ? `${entry.consistencyScore}%` : 'N/A';
      default:
        return `${entry.bestWPM}`;
    }
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <main className="leaderboard-main">
          <div className="leaderboard-title">
            <h2>Global Leaderboard</h2>
            <p>Loading leaderboard data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <main className="leaderboard-main">
          <div className="leaderboard-title">
            <h2>Global Leaderboard</h2>
            <p>Error: {error}</p>
            <button onClick={fetchLeaderboardData} style={{padding: '10px 20px', marginTop: '10px'}}>
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <main className="leaderboard-main">
        <div className="leaderboard-title">
          <h2>Global Leaderboard</h2>
          <p>Top performers from around the world</p>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>Time Period:</label>
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value as 'all' | 'weekly' | 'monthly')}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort By:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'wpm' | 'accuracy' | 'consistency')}
              className="filter-select"
            >
              <option value="wpm">WPM</option>
              <option value="accuracy">Accuracy</option>
              <option value="consistency">Consistency</option>
            </select>
          </div>
        </div>

        <div className="leaderboard-table">
          <div className="table-header">
            <div className="header-cell rank-col">Rank</div>
            <div className="header-cell username-col">Name</div>
            <div className="header-cell wpm-col">Best WPM</div>
            <div className="header-cell accuracy-col">Best Accuracy</div>
            <div className="header-cell date-col">Last Test</div>
            <div className="header-cell characters-col">Total Tests</div>
          </div>

          <div className="table-body">
            {leaderboardData.map((entry) => (
              <div key={entry._id} className={`table-row ${getRankStyle(entry.rank)}`}>
                <div className="table-cell rank-col">
                  <span className="rank-number">#{entry.rank}</span>
                  {entry.rank <= 3 && (
                    <span className={`medal ${getRankStyle(entry.rank)}`}>
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                    </span>
                  )}
                </div>
                <div className="table-cell username-col">
                  <div className="user-info">
                    <div className="profile-picture">
                      {entry.profile?.avatar ? (
                        <img 
                          src={entry.profile.avatar} 
                          alt={`${getDisplayName(entry)}'s profile`}
                          className="profile-img"
                        />
                      ) : (
                        <div className="profile-placeholder">
                          {getDisplayName(entry).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="user-details">
                      <span className="username">{getDisplayName(entry)}</span>
                      {entry.profile?.country && (
                        <span className="country"> ({entry.profile.country})</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="table-cell wpm-col">
                  <span className="wpm-value">{getMetricValue(entry)}</span>
                </div>
                <div className="table-cell accuracy-col">
                  <span className="accuracy-value">{entry.bestAccuracy}%</span>
                </div>
                <div className="table-cell date-col">
                  <span className="date-value">{formatDate(entry.recentTestDate)}</span>
                </div>
                <div className="table-cell characters-col">
                  <span className="characters-value">{entry.totalTests}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {leaderboardData.length === 0 && (
          <div className="no-data">
            <p>No results found for the selected time period.</p>
          </div>
        )}

        <div className="leaderboard-info">
          <div className="info-card">
            <h3>How Rankings Work</h3>
            <ul>
              <li>Rankings are based on your highest WPM or accuracy score</li>
              <li>Only completed tests (100% progress) count toward rankings</li>
              <li>Tests must be at least 30 seconds long to qualify</li>
              <li>Updates happen in real-time</li>
            </ul>
          </div>
          <div className="info-card">
            <h3>Want to Compete?</h3>
            <p>
              <Link to="/signup" className="signup-link">Create an account</Link> to track your progress and compete for the top spots!
            </p>
            <Link to="/" className="start-test-btn">Start Typing Test</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
