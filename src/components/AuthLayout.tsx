import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-layout">
      <div className="auth-header-nav">
        <Link to="/" className="auth-brand">
          <span className="brand-text">TypeMaster</span>
        </Link>
        <nav className="auth-nav">
          <Link to="/login" className="auth-nav-link">Login</Link>
          <Link to="/signup" className="auth-nav-link">Sign Up</Link>
        </nav>
      </div>
      <main className="auth-main">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
