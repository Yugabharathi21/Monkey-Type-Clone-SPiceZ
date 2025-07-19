import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

interface UserProfile {
  name: string;
  email: string;
  profileImage: string;
  joinDate: string;
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
  const [profile, setProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImage: 'https://via.placeholder.com/150/007bff/ffffff?text=JD',
    joinDate: '2025-01-01'
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Load user profile from backend
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          setProfile({
            name: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || user.username,
            email: user.email,
            profileImage: user.profile?.avatar || `https://via.placeholder.com/150/007bff/ffffff?text=${user.username.charAt(0).toUpperCase()}`,
            joinDate: user.createdAt || '2025-01-01'
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  // Load user statistics and sessions from backend
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch user statistics
        const statsResponse = await fetch(`/api/stats/user?timeframe=${timeRange}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          
          // Convert database stats to dashboard format
          const dbStats = statsData.stats;
          setStats({
            totalTests: dbStats.totalTests || 0,
            averageWpm: Math.round(dbStats.averageWPM || 0),
            averageAccuracy: Math.round(dbStats.averageAccuracy || 0),
            totalTimeTyping: Math.round(dbStats.totalTimeTyped || 0),
            bestWpm: dbStats.bestWPM || 0,
            bestAccuracy: Math.round(dbStats.bestAccuracy || 0),
            totalCharacters: dbStats.totalCharacters || 0,
            improvementRate: 0 // Calculate this based on progress data
          });

          // Convert recent tests to sessions format
          const recentTests = statsData.recentTests || [];
          const convertedSessions: TypingSession[] = recentTests.map((test: any) => ({
            id: test._id,
            date: test.createdAt,
            wpm: test.results.wpm,
            accuracy: test.results.accuracy,
            duration: test.results.timeElapsed,
            charactersTyped: test.results.totalCharacters,
            errorCount: test.results.totalCharacters - test.results.correctCharacters,
            textLength: test.results.totalCharacters
          }));

          setSessions(convertedSessions);
        } else {
          console.error('Failed to fetch stats:', statsResponse.statusText);
          // Fallback to empty stats
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
          setSessions([]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to empty data
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
        setSessions([]);
      }
    };

    loadDashboardData();
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

  const handleProfileEdit = () => {
    setIsEditingProfile(true);
    setEditedProfile(profile);
  };

  const handleProfileSave = async () => {
    setIsLoadingProfile(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to update your profile');
        return;
      }

      // Split name into first and last name
      const nameParts = editedProfile.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profile: {
            firstName,
            lastName,
            avatar: editedProfile.profileImage
          }
        })
      });

      if (response.ok) {
        setProfile(editedProfile);
        setIsEditingProfile(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to update profile: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleProfileCancel = () => {
    setIsEditingProfile(false);
    setEditedProfile(profile);
  };

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isValidImageUrl = (url: string): boolean => {
    try {
      new URL(url);
      return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(url) || url.includes('placeholder');
    } catch {
      return false;
    }
  };

  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        <div className="analytics-title">
          <h2>Your Typing Analytics</h2>
          <p>Track your progress and improve your typing skills</p>
        </div>

        <div className="theme-selector-section">
          <h3>Customize Your Experience</h3>
          <ThemeSelector />
        </div>

        <div className="profile-management-section">
          <h3>Profile Management</h3>
          <div className="profile-card">
            <div className="profile-image-section">
              <img 
                src={isEditingProfile ? editedProfile.profileImage : profile.profileImage} 
                alt="Profile"
                className="profile-image"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase();
                  img.src = `https://via.placeholder.com/150/007bff/ffffff?text=${initials}`;
                }}
              />
              {isEditingProfile && (
                <div className="image-input-section">
                  <label htmlFor="profileImage">Profile Image URL:</label>
                  <input
                    type="url"
                    id="profileImage"
                    value={editedProfile.profileImage}
                    onChange={(e) => handleProfileChange('profileImage', e.target.value)}
                    placeholder="Enter image URL (jpg, png, gif, etc.)"
                    className={`profile-input ${!isValidImageUrl(editedProfile.profileImage) && editedProfile.profileImage ? 'invalid' : ''}`}
                  />
                  {editedProfile.profileImage && !isValidImageUrl(editedProfile.profileImage) && (
                    <small style={{color: 'var(--error)', fontSize: '0.8rem'}}>
                      Please enter a valid image URL
                    </small>
                  )}
                </div>
              )}
            </div>
            
            <div className="profile-info">
              <div className="profile-field">
                <label>Name:</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="profile-input"
                  />
                ) : (
                  <span>{profile.name}</span>
                )}
              </div>

              <div className="profile-field">
                <label>Email:</label>
                {isEditingProfile ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="profile-input"
                  />
                ) : (
                  <span>{profile.email}</span>
                )}
              </div>

              <div className="profile-field">
                <label>Member Since:</label>
                <span>{new Date(profile.joinDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>

              <div className="profile-actions">
                {isEditingProfile ? (
                  <>
                    <button 
                      onClick={handleProfileSave} 
                      className="btn btn-save"
                      disabled={isLoadingProfile}
                    >
                      {isLoadingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={handleProfileCancel} 
                      className="btn btn-cancel"
                      disabled={isLoadingProfile}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={handleProfileEdit} className="btn btn-edit">
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
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
