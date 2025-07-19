import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TypingTest from './pages/TypingTest';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<TypingTest />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
