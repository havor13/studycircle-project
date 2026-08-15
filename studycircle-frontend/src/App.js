import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Home from './pages/Home';
import Groups from './pages/Groups';
import Posts from './pages/Posts';
import Chats from './pages/Chats';
import './styles.css'; // ✅ Global stylesheet import

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // ✅ ProtectedRoute wrapper
  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      {/* ✅ Pass setToken and token to Navbar so it can show Login/Signup or Logout */}
      <Navbar setToken={setToken} token={token} />
      <main className="main">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm setToken={setToken} />} />
          <Route path="/signup" element={<SignupForm setToken={setToken} />} />

          {/* ✅ Protected routes */}
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <Groups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/posts"
            element={
              <ProtectedRoute>
                <Posts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chats"
            element={
              <ProtectedRoute>
                <Chats />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
