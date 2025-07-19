import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import './NavBar.css';

interface NavBarProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  themes: Array<{ name: string; displayName: string }>;
}

const NavBar: React.FC<NavBarProps> = ({ currentTheme, onThemeChange, themes }) => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  return (
    <>
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
            
            {/* Theme Selector */}
            <select 
              value={currentTheme} 
              onChange={(e) => onThemeChange(e.target.value)}
              className="theme-selector"
            >
              {themes.map((theme) => (
                <option key={theme.name} value={theme.name}>
                  {theme.displayName}
                </option>
              ))}
            </select>
            
            {/* Authentication Button */}
            {isAuthenticated ? (
              <div className="user-menu">
                <span className="username">Welcome, {user?.username}</span>
                <button className="navbar-logout-btn" onClick={handleLogout}>
                  logout
                </button>
              </div>
            ) : (
              <button className="navbar-login-btn" onClick={handleLoginClick}>
                login
              </button>
            )}
          </nav>
        </div>
      </header>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};

export default NavBar;
