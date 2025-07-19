import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import '../styles/Leaderboard.css';

interface LeaderboardEntry {
  id: string;
  username: string;
  wpm: number;
  accuracy: number;
  testDate: string;
  testDuration: number;
  charactersTyped: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'wpm' | 'accuracy'>('wpm');

  // Mock data - in a real app, this would come from an API
  const mockLeaderboardData: LeaderboardEntry[] = [
    {
      id: '1',
      username: 'SpeedTyper',
      wpm: 142,
      accuracy: 98,
      testDate: '2025-01-19',
      testDuration: 60,
      charactersTyped: 712
    },
    {
      id: '2',
      username: 'KeyboardNinja',
      wpm: 138,
      accuracy: 96,
      testDate: '2025-01-19',
      testDuration: 60,
      charactersTyped: 690
    },
    {
      id: '3',
      username: 'TypeMaster',
      wpm: 135,
      accuracy: 99,
      testDate: '2025-01-18',
      testDuration: 60,
      charactersTyped: 675
    },
    {
      id: '4',
      username: 'QuickFingers',
      wpm: 128,
      accuracy: 94,
      testDate: '2025-01-18',
      testDuration: 60,
      charactersTyped: 640
    },
    {
      id: '5',
      username: 'TypeRacer',
      wpm: 125,
      accuracy: 97,
      testDate: '2025-01-17',
      testDuration: 60,
      charactersTyped: 625
    },
    {
      id: '6',
      username: 'FastTypist',
      wpm: 122,
      accuracy: 95,
      testDate: '2025-01-17',
      testDuration: 60,
      charactersTyped: 610
    },
    {
      id: '7',
      username: 'CodeTyper',
      wpm: 118,
      accuracy: 92,
      testDate: '2025-01-16',
      testDuration: 60,
      charactersTyped: 590
    },
    {
      id: '8',
      username: 'TypingPro',
      wpm: 115,
      accuracy: 98,
      testDate: '2025-01-16',
      testDuration: 60,
      charactersTyped: 575
    },
    {
      id: '9',
      username: 'KeyWarrior',
      wpm: 112,
      accuracy: 89,
      testDate: '2025-01-15',
      testDuration: 60,
      charactersTyped: 560
    },
    {
      id: '10',
      username: 'TypingGuru',
      wpm: 108,
      accuracy: 93,
      testDate: '2025-01-15',
      testDuration: 60,
      charactersTyped: 540
    }
  ];

  useEffect(() => {
    // Filter and sort data based on current filters
    let filteredData = [...mockLeaderboardData];

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      if (timeFilter === 'week') {
        filterDate.setDate(now.getDate() - 7);
      } else if (timeFilter === 'month') {
        filterDate.setMonth(now.getMonth() - 1);
      }

      filteredData = filteredData.filter(entry => 
        new Date(entry.testDate) >= filterDate
      );
    }

    // Sort data
    filteredData.sort((a, b) => {
      if (sortBy === 'wpm') {
        return b.wpm - a.wpm;
      } else {
        return b.accuracy - a.accuracy;
      }
    });

    setLeaderboardData(filteredData);
  }, [timeFilter, sortBy]);

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

  return (
    <div className="leaderboard-container">
      <NavBar />

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
              onChange={(e) => setTimeFilter(e.target.value as 'all' | 'week' | 'month')}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Sort By:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as 'wpm' | 'accuracy')}
              className="filter-select"
            >
              <option value="wpm">WPM</option>
              <option value="accuracy">Accuracy</option>
            </select>
          </div>
        </div>

        <div className="leaderboard-table">
          <div className="table-header">
            <div className="header-cell rank-col">Rank</div>
            <div className="header-cell username-col">Username</div>
            <div className="header-cell wpm-col">WPM</div>
            <div className="header-cell accuracy-col">Accuracy</div>
            <div className="header-cell date-col">Date</div>
            <div className="header-cell characters-col">Characters</div>
          </div>

          <div className="table-body">
            {leaderboardData.map((entry, index) => (
              <div key={entry.id} className={`table-row ${getRankStyle(index + 1)}`}>
                <div className="table-cell rank-col">
                  <span className="rank-number">#{index + 1}</span>
                  {index < 3 && (
                    <span className={`medal ${getRankStyle(index + 1)}`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  )}
                </div>
                <div className="table-cell username-col">
                  <span className="username">{entry.username}</span>
                </div>
                <div className="table-cell wpm-col">
                  <span className="wpm-value">{entry.wpm}</span>
                </div>
                <div className="table-cell accuracy-col">
                  <span className="accuracy-value">{entry.accuracy}%</span>
                </div>
                <div className="table-cell date-col">
                  <span className="date-value">{formatDate(entry.testDate)}</span>
                </div>
                <div className="table-cell characters-col">
                  <span className="characters-value">{entry.charactersTyped}</span>
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
