import React from 'react';
import { useTheme, themes } from '../contexts/ThemeContext';
import './ThemeSelector.css';

const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();

  return (
    <div className="theme-selector">
      <h3>Color Theme</h3>
      <p>Customize the appearance of your typing environment</p>
      
      <div className="theme-grid">
        {availableThemes.map(themeName => {
          const themeConfig = themes[themeName];
          return (
            <div
              key={themeName}
              className={`theme-option ${currentTheme === themeName ? 'active' : ''}`}
              onClick={() => setTheme(themeName)}
            >
              <div className="theme-preview">
                <div 
                  className="preview-bg"
                  style={{ backgroundColor: themeConfig.colors.background }}
                >
                  <div 
                    className="preview-card"
                    style={{ backgroundColor: themeConfig.colors.cardBackground }}
                  >
                    <div 
                      className="preview-accent"
                      style={{ backgroundColor: themeConfig.colors.accent }}
                    ></div>
                    <div 
                      className="preview-text"
                      style={{ color: themeConfig.colors.textPrimary }}
                    >Aa</div>
                  </div>
                </div>
              </div>
              <span className="theme-name">{themeConfig.name}</span>
              {currentTheme === themeName && (
                <div className="active-indicator">✓</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSelector;
