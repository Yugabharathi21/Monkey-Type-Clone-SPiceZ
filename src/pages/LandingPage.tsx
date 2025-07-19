import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>ModernApp</h2>
          </div>
          <div className="nav-menu">
            <Link to="/login" className="nav-link btn-outline">
              Login
            </Link>
            <Link to="/signup" className="nav-link btn-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to the Future of
              <span className="gradient-text"> Digital Experience</span>
            </h1>
            <p className="hero-description">
              Discover a modern, intuitive platform designed to streamline your workflow 
              and enhance productivity. Join thousands of users who have already transformed 
              their digital experience with our cutting-edge solutions.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-primary-large">
                Get Started Free
              </Link>
              <button className="btn btn-secondary-large">
                Watch Demo
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Fast & Secure</h3>
              <p>Lightning-fast performance with enterprise-grade security</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💡</div>
              <h3>Innovative</h3>
              <p>Cutting-edge features powered by the latest technology</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Focused</h3>
              <p>Designed with user experience and efficiency in mind</p>
            </div>
          </div>
        </div>
      </main>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose ModernApp?</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon-large">🔒</div>
              <h3>Secure by Design</h3>
              <p>Your data is protected with industry-leading security measures and encryption.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon-large">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Optimized for speed with minimal loading times and smooth interactions.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon-large">🎨</div>
              <h3>Beautiful Design</h3>
              <p>Modern, clean interface that's both functional and visually appealing.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon-large">📱</div>
              <h3>Mobile Ready</h3>
              <p>Fully responsive design that works perfectly on all devices.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>ModernApp</h3>
              <p>Building the future, one user at a time.</p>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li><a href="#">Features</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Documentation</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 ModernApp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
