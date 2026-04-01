import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/AdminPanel';
import Dashboard from './pages/Dashboard';
import PredictPage from './pages/PredictPage';
import ResultsPage from './pages/ResultsPage';
import AboutPage from './pages/AboutPage';
import './App.css';

function Navbar({ user, onLogout }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'navbar-link active' : 'navbar-link';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">ES</div>
        <div>
          <div className="navbar-title">EduSense</div>
          <div className="navbar-subtitle">VNRVJIET • CSE Department</div>
        </div>
      </div>

      <div className="navbar-links">
        {user.role === 'admin' ? (
          <>
            <Link to="/admin" className={isActive('/admin')}>📊 Admin Panel</Link>
            <Link to="/about" className={isActive('/about')}>ℹ️ About</Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className={isActive('/dashboard')}>🏠 Dashboard</Link>
            <Link to="/predict" className={isActive('/predict')}>🔮 Predict</Link>
            <Link to="/results" className={isActive('/results')}>📊 Results</Link>
            <Link to="/about" className={isActive('/about')}>ℹ️ About</Link>
          </>
        )}
      </div>

      <div className="navbar-user">
        <div className="navbar-avatar">{(user.name || user.username || '?')[0].toUpperCase()}</div>
        <span>{user.name || user.username}</span>
        <button className="btn-logout" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p>© 2026 EduSense — Powered by <a href="#">VNRVJIET CSE Department</a></p>
      <p style={{ fontSize: '0.72rem', marginTop: '4px', opacity: 0.7 }}>
        Sensing academic trouble before it hits
      </p>
    </footer>
  );
}

function AppContent() {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('edusense_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [results, setResults] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    sessionStorage.setItem('edusense_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setResults(null);
    sessionStorage.removeItem('edusense_user');
  };

  // Not logged in — show login
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <Routes>
        {user.role === 'admin' ? (
          <>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </>
        ) : (
          <>
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/predict" element={<PredictPage user={user} setResults={setResults} />} />
            <Route path="/results" element={<ResultsPage results={results} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
