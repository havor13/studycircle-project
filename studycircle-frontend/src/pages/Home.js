import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';
import GlobalSearch from '../components/GlobalSearch'; // ✅ import the search component

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>📚 Welcome to StudyCircle</h1>
        <p className="home-subtitle">
          Connect, collaborate, and grow together in study groups.
        </p>
      </header>

      {/* 🔎 Global Search */}
      <section className="home-search">
        <GlobalSearch />
      </section>

      {/* ✨ Action Buttons */}
      <section className="home-actions">
        <div className="action-buttons">
          <Link to="/signup" className="home-button signup">
            Get Started
          </Link>
          <Link to="/login" className="home-button login">
            Already have an account? Login
          </Link>
        </div>
      </section>

      {/* 🌟 Features */}
      <section className="home-features">
        <h2>✨ Features</h2>
        <ul>
          <li>Join or create study groups</li>
          <li>Share posts, comments, and likes</li>
          <li>Chat with peers in real time</li>
          <li>Build your learning profile</li>
        </ul>
      </section>
    </div>
  );
}

export default Home;
