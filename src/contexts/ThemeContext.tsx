import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface Theme {
  name: string;
  colors: {
    primary: string;
    accent: string;
    accentRgb: string;
    background: string;
    backgroundSecondary: string;
    cardBackground: string;
    textPrimary: string;
    textSecondary: string;
    borderColor: string;
    success: string;
    error: string;
  };
}

export const themes: Record<string, Theme> = {
  typeMonkey: {
    name: 'Type Monkey',
    colors: {
      primary: '#323437',
      accent: '#e2b714',
      accentRgb: '226, 183, 20',
      background: '#323437',
      backgroundSecondary: '#2c2e31',
      cardBackground: '#2c2e31',
      textPrimary: '#d1d0c5',
      textSecondary: '#646669',
      borderColor: '#646669',
      success: '#4CAF50',
      error: '#f44336'
    }
  },
  ocean: {
    name: 'Ocean Blue',
    colors: {
      primary: '#1e3a8a',
      accent: '#3b82f6',
      accentRgb: '59, 130, 246',
      background: '#1e293b',
      backgroundSecondary: '#334155',
      cardBackground: '#334155',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      borderColor: '#475569',
      success: '#10b981',
      error: '#ef4444'
    }
  },
  forest: {
    name: 'Forest Green',
    colors: {
      primary: '#14532d',
      accent: '#22c55e',
      accentRgb: '34, 197, 94',
      background: '#1f2937',
      backgroundSecondary: '#374151',
      cardBackground: '#374151',
      textPrimary: '#f9fafb',
      textSecondary: '#9ca3af',
      borderColor: '#4b5563',
      success: '#10b981',
      error: '#ef4444'
    }
  },
  sunset: {
    name: 'Sunset Orange',
    colors: {
      primary: '#7c2d12',
      accent: '#ea580c',
      accentRgb: '234, 88, 12',
      background: '#292524',
      backgroundSecondary: '#44403c',
      cardBackground: '#44403c',
      textPrimary: '#fafaf9',
      textSecondary: '#a8a29e',
      borderColor: '#57534e',
      success: '#22c55e',
      error: '#dc2626'
    }
  },
  purple: {
    name: 'Royal Purple',
    colors: {
      primary: '#581c87',
      accent: '#a855f7',
      accentRgb: '168, 85, 247',
      background: '#1e1b4b',
      backgroundSecondary: '#312e81',
      cardBackground: '#312e81',
      textPrimary: '#f8fafc',
      textSecondary: '#a1a1aa',
      borderColor: '#52525b',
      success: '#10b981',
      error: '#ef4444'
    }
  }
};

interface ThemeContextType {
  currentTheme: string;
  theme: Theme;
  setTheme: (themeName: string) => void;
  availableThemes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<string>('typeMonkey');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('typingTestTheme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme CSS variables
    const theme = themes[currentTheme];
    if (theme) {
      const root = document.documentElement;
      Object.entries(theme.colors).forEach(([key, value]) => {
        const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        root.style.setProperty(`--${cssVar}`, value);
      });
      
      // Save to localStorage
      localStorage.setItem('typingTestTheme', currentTheme);
    }
  }, [currentTheme]);

  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const availableThemes = Object.keys(themes);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        theme: themes[currentTheme],
        setTheme,
        availableThemes
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
