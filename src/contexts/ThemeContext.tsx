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
  grooveForest: {
    name: 'Groove Forest',
    colors: {
      primary: '#064e3b',
      accent: '#16a34a',
      accentRgb: '22, 163, 74',
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      cardBackground: '#1e3a3a',
      textPrimary: '#e0f2f1',
      textSecondary: '#80cbc4',
      borderColor: '#4b5563',
      success: '#10b981',
      error: '#ef4444'
    }
  },
  oliveGreen: {
    name: 'Olive Green',
    colors: {
      primary: '#556b2f',
      accent: '#b5c58c',
      accentRgb: '181, 197, 140',
      background: '#f5f5dc',
      backgroundSecondary: '#e0e0c0',
      cardBackground: '#dcdcb5',
      textPrimary: '#2e2e1f',
      textSecondary: '#6b705c',
      borderColor: '#9e9e7a',
      success: '#6aa84f',
      error: '#c0392b'
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
  youngClam: {
    name: 'Young Clam',
    colors: {
      primary: '#94a3b8',
      accent: '#f472b6',
      accentRgb: '244, 114, 182',
      background: '#f1f5f9',
      backgroundSecondary: '#e2e8f0',
      cardBackground: '#ffffff',
      textPrimary: '#334155',
      textSecondary: '#64748b',
      borderColor: '#cbd5e1',
      success: '#34d399',
      error: '#f87171'
    }
  },
  discord: {
    name: 'Discord Dark',
    colors: {
      primary: '#5865F2',
      accent: '#7289DA',
      accentRgb: '114, 137, 218',
      background: '#2f3136',
      backgroundSecondary: '#36393f',
      cardBackground: '#40444b',
      textPrimary: '#ffffff',
      textSecondary: '#b9bbbe',
      borderColor: '#4f545c',
      success: '#43b581',
      error: '#f04747'
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
