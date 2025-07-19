import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="navbar-header">
      <div className="navbar-content">
        <div className="navbar-logo">
          <Link to="/">
            <h1>TypeMonkey</h1>
          </Link>
        </div>
        <nav className="navbar-links">
          <Link 
            to="/" 
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
          >
            home
          </Link>
          <Link 
            to="/dashboard" 
            className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            analytics
          </Link>
          <Link 
            to="/leaderboard" 
            className={`navbar-link ${isActive('/leaderboard') ? 'active' : ''}`}
          >
            leaderboard
          </Link>
          <button className="navbar-logout-btn">logout</button>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
