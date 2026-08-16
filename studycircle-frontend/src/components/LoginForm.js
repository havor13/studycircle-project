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
      // ✅ Call backend with credentials enabled
      const res = await api.post(
        'auth/login/',
        { username, password },
        { withCredentials: true } // important for CORS + cookies
      );

      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;

      // ✅ Save tokens + username
      setToken(accessToken);
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('username', username);

      // ✅ Attach token to axios instance
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      alert('✅ Login successful!');

      // ✅ Redirect to homepage
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials.');
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
