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
      const res = await api.post('auth/login/', { username, password });

      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;
      const userId = res.data.user_id; // ✅ make sure backend returns this

      // Save tokens + user info
      setToken(accessToken);
      localStorage.setItem('access', accessToken);
      localStorage.setItem('refresh', refreshToken);
      localStorage.setItem('username', username);
      localStorage.setItem('userId', userId);

      // Attach token to axios
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

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
    </div>
  );
}

export default LoginForm;
