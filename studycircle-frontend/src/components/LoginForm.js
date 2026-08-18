import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles.css';

function LoginForm({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ✅ Call backend login endpoint
      const res = await api.post('auth/login/', { username, password });

      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;

      if (!accessToken || !refreshToken) {
        throw new Error('No tokens returned from server');
      }

      // ✅ Save tokens + username
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('username', username);

      // ✅ Attach token to axios instance
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // ✅ Update parent state
      setToken(accessToken);

      alert('✅ Login successful!');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.detail ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper to refresh token manually if needed
  const handleRefresh = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token found');

      const res = await api.post('auth/refresh/', { refresh: refreshToken });
      const newAccessToken = res.data.access;

      localStorage.setItem('token', newAccessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
      setToken(newAccessToken);

      alert('🔄 Token refreshed!');
    } catch (err) {
      console.error('Refresh error:', err);
      setError('Session expired. Please log in again.');
      navigate('/login');
    }
  };

  return (
    <div className="main">
      <h2>🔐 Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* ✅ Optional manual refresh button for testing */}
      <button onClick={handleRefresh} style={{ marginTop: '10px' }}>
        Refresh Token
      </button>
    </div>
  );
}

export default LoginForm;
