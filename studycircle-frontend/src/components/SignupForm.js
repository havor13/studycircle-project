import React, { useState } from 'react';
import api from '../api/api'; // ✅ Axios instance with interceptors
import '../styles.css'; // ✅ Global stylesheet import

function SignupForm({ setToken }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('auth/signup/', { username, email, password });

      // ✅ Save both tokens
      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;

      setToken(accessToken);
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // ✅ Configure Axios to use token automatically
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      alert('🎉 Signup successful! You are now logged in.');
    } catch (err) {
      console.error('Signup error:', err);
      setError(
        err.response?.data?.detail ||
        'Signup failed. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <h2>📝 Signup</h2>
      <form onSubmit={handleSignup} className="signup-form">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional)"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Signup'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default SignupForm;
