import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-container">
          <h2>ModernApp Dashboard</h2>
          <div className="nav-menu">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <button className="btn btn-outline">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="welcome-section">
            <h1>Welcome to your Dashboard! 🎉</h1>
            <p>You have successfully logged in to ModernApp.</p>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="card-icon">📊</div>
              <h3>Analytics</h3>
              <p>View your performance metrics and insights</p>
              <button className="btn btn-primary">View Analytics</button>
            </div>

            <div className="dashboard-card">
              <div className="card-icon">⚙️</div>
              <h3>Settings</h3>
              <p>Manage your account and preferences</p>
              <button className="btn btn-primary">Open Settings</button>
            </div>

            <div className="dashboard-card">
              <div className="card-icon">👥</div>
              <h3>Team</h3>
              <p>Collaborate with your team members</p>
              <button className="btn btn-primary">Manage Team</button>
            </div>

            <div className="dashboard-card">
              <div className="card-icon">📋</div>
              <h3>Projects</h3>
              <p>Access and manage your projects</p>
              <button className="btn btn-primary">View Projects</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
