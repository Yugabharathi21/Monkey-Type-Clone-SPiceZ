import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TypingTest from './pages/TypingTest';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import NavBar from './components/NavBar';
import { ThemeProvider, useTheme, themes } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function AppContent() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  
  const themeOptions = availableThemes.map(themeName => ({
    name: themeName,
    displayName: themes[themeName].name
  }));

  return (
    <Router>
      <div className="App">
        <NavBar 
          currentTheme={currentTheme}
          onThemeChange={setTheme}
          themes={themeOptions}
        />
        <Routes>
          <Route path="/" element={<TypingTest />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
