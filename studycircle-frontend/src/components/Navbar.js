import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import '../styles.css'; // ✅ Global stylesheet import

function Navbar({ token, setToken }) {
  const navigate = useNavigate();

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute(
      'data-theme',
      currentTheme === 'dark' ? 'light' : 'dark'
    );
  };

  // ✅ Logout function
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username'); // clear stored username
    delete api.defaults.headers.common['Authorization'];
    alert('👋 Logged out successfully!');
    navigate('/');
  };

  // ✅ Get username from localStorage if available
  const username = localStorage.getItem('username');

  return (
    <nav className="navbar">
      <div className="nav-left">
        <ul className="nav-list">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/groups">Groups</Link></li>
          <li><Link to="/posts">Posts</Link></li>
          <li><Link to="/chats">Chats</Link></li>
        </ul>
      </div>

      <div className="nav-right">
        {!token ? (
          <>
            <Link to="/login" className="nav-button">Login</Link>
            <Link to="/signup" className="nav-button signup">Signup</Link>
          </>
        ) : (
          <>
            {username && <span className="welcome-text">Welcome, {username}!</span>}
            <button onClick={handleLogout} className="nav-button logout">
              Logout
            </button>
          </>
        )}
        <button onClick={toggleTheme} className="theme-toggle">
          Toggle Theme
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
