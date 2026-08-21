import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Home from './pages/Home';
import Groups from './pages/Groups';
import GroupEvents from './pages/GroupEvents'; // ✅ Events page
import Posts from './pages/Posts';
import Chats from './pages/Chats';
import UserProfile from './pages/UserProfile'; // ✅ New profile page
import PlannerPage from './pages/PlannerPage'; // ✅ StudyPlanner page
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
      {/* ✅ Navbar receives token state so it can toggle Login/Signup vs Logout */}
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
            path="/groups/:groupId/events"
            element={
              <ProtectedRoute>
                <GroupEvents />
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
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <PlannerPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* ✅ Inline footer */}
      <footer style={{
        backgroundColor: '#111416',
        textAlign: 'center',
        padding: '1rem',
        borderTop: '1px solid #ddd'
      }}>
        © {new Date().getFullYear()} StudyCircle. All rights reserved.Sampson Havor
      </footer>
    </Router>
  );
}

export default App;
