import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import ProfilePicture from './ProfilePicture';
import Logo from './Logo';
import './NavBar.css';

const NavBar: React.FC = () => {
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
              <Logo size="medium" showText={true} />
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
            
            {/* Authentication Button */}
            {isAuthenticated ? (
              <div className="user-menu">
                <div className="user-info">
                  <ProfilePicture
                    src={user?.profile?.avatar}
                    username={user?.username || 'User'}
                    size="medium"
                    className="navbar-profile-picture"
                  />
                  <span className="username">Welcome, {user?.username}</span>
                </div>
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
