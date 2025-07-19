import React from 'react';
import './Logo.css';
import '../styles/logo-theme.css';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  showText = true, 
  className = '' 
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'logo-small';
      case 'large': return 'logo-large';
      default: return 'logo-medium';
    }
  };

  return (
    <div className={`logo-container ${getSizeClass()} ${className}`}>
      <svg 
        className="logo-svg theme-aware" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect 
          width="100" 
          height="100" 
          rx="20" 
          className="logo-background"
        />
        <path 
          d="M20 30H80V40H60V70H50V40H30V70H20V30Z" 
          className="logo-text"
        />
        <path 
          d="M25 75H75V85H25V75Z" 
          className="logo-underline"
        />
        <circle 
          cx="70" 
          cy="25" 
          r="8" 
          className="logo-accent"
        />
      </svg>
      {showText && (
        <span className="logo-text-label">TypeMonkey</span>
      )}
    </div>
  );
};

export default Logo;
