import { useState } from 'react';
import { login as apiLogin } from '../api';

export default function LoginPage({ onLogin }) {
  const [tab, setTab] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiLogin(username, password, tab);
      if (res.data.success) {
        onLogin(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">ES</div>
          <p className="login-college">VNRVJIET • CSBS Department</p>
          <h1 className="login-title">EduSense</h1>
          <p className="login-tagline">Sensing academic trouble before it hits</p>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab ${tab === 'student' ? 'active' : ''}`}
            onClick={() => { setTab('student'); setError(''); }}
          >
            Student
          </button>
          <button
            className={`login-tab ${tab === 'admin' ? 'active' : ''}`}
            onClick={() => { setTab('admin'); setError(''); }}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              {tab === 'student' ? 'Roll Number' : 'Username'}
            </label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              placeholder={tab === 'student' ? 'e.g., 24071A3200' : 'admin'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder={tab === 'student' ? 'edusense123' : 'Enter password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner-sm"></span>
                Signing in...
              </>
            ) : (
              `Sign in as ${tab === 'student' ? 'Student' : 'Admin'}`
            )}
          </button>
        </form>

        {tab === 'student' && (
          <p style={{
            textAlign: 'center',
            fontSize: '0.78rem',
            color: '#999',
            marginTop: '20px'
          }}>
            Use your Roll Number and password <strong>edusense123</strong>
          </p>
        )}
        {tab === 'student' && (
          <p style={{
            textAlign: 'center',
            fontSize: '0.85rem',
            marginTop: '15px'
          }}>
            Don't have an account? <a href="#" style={{ color: '#1a6b6b', fontWeight: 'bold', textDecoration: 'none' }}>Sign Up</a>
          </p>
        )}
        {tab === 'admin' && (
          <p style={{
            textAlign: 'center',
            fontSize: '0.78rem',
            color: '#999',
            marginTop: '20px'
          }}>
            Admin: <strong>admin</strong> / <strong>admin123</strong>
          </p>
        )}
      </div>
    </div>
  );
}
