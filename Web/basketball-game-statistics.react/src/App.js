import React, { useState, useEffect } from 'react';
import './App.css';
import homeBack from './images/home_back_2.png';
import teamBull from './images/team_14.2_bull.png';
import Game from './models/Game';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Home from './Home';
import Games from './Games';
import Login from './Login';
import Admin from './Admin';

// This function is no longer needed in App.js as fetching is in Home.js
// function getApiBaseUrl() {
//   if (process.env.NODE_ENV === 'development') {
//     return process.env.REACT_APP_API_DEV;
//   } else {
//     return process.env.REACT_APP_API_PROD;
//   }
// }

function App() {
  const [showLoginForAdmin, setShowLoginForAdmin] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<MainLayout content={<Home />} showLoginForAdmin={showLoginForAdmin} setShowLoginForAdmin={setShowLoginForAdmin} />} />
        <Route path="/games" element={<MainLayout content={<Games />} showLoginForAdmin={showLoginForAdmin} setShowLoginForAdmin={setShowLoginForAdmin} />} />
        <Route path="/admin" element={<MainLayout content={<Admin onLoginRequired={() => setShowLoginForAdmin(true)} />} showLoginForAdmin={showLoginForAdmin} setShowLoginForAdmin={setShowLoginForAdmin} />} />
      </Routes>
    </Router>
  );
}

function MainLayout({ content, showLoginForAdmin, setShowLoginForAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [previousLocation, setPreviousLocation] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');
    const validUntil = localStorage.getItem('tokenValidUntil');

    if (token && username && validUntil) {
      // Check if token is still valid
      const now = new Date();
      const expiry = new Date(validUntil);
      
      if (now < expiry) {
        setUser({
          token,
          username,
          userRole,
          validUntil
        });
      } else {
        // Token expired, clear storage
        handleLogout();
      }
    }
  }, []);

  const handleLoginClick = () => {
    if (user) {
      handleLogout();
    } else {
      setShowLogin(true);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('tokenValidUntil');
    setUser(null);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
    if (showLoginForAdmin) {
      setShowLoginForAdmin(false);
      // If user was trying to access admin and closed login, navigate back to previous page
      if (previousLocation && previousLocation !== '/admin') {
        navigate(previousLocation);
      } else if (!previousLocation) {
        navigate('/home');
      }
    }
  };

  // Handle admin login requirement
  useEffect(() => {
    if (showLoginForAdmin) {
      // Store the current location before showing login
      setPreviousLocation(location.pathname);
      setShowLogin(true);
    }
  }, [showLoginForAdmin, location.pathname]);

  return (
    <div className="App">
      <header className="header">
        <div className="top-bar">
          <div className="welcome-section">
            {user && (
              <span className="welcome-user">Welcome, {user.username}</span>
            )}
          </div>
          <p className="bulls-signature" onClick={handleLoginClick}>
            {user ? 'Logout' : 'Login'}
          </p>
        </div>
        <div className="main-header">
          <nav className="main-nav">
            <ul>
              <li>
                <img
                  src={require('./images/bull.png')}
                  alt="Bull Icon"
                  className="bull-icon"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/home')}
                />
                <a href="/home" className={location.pathname === '/home' ? 'active' : ''}>Home</a>
              </li>
              <li><a href="/games" onClick={() => navigate('/games')} className={location.pathname === '/games' ? 'active' : ''}>Games</a></li>
              <li><a href="/admin" onClick={() => navigate('/admin')} className={location.pathname === '/admin' ? 'active' : ''}>Admin</a></li>
              <li><a href="#">Contacts</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {content}

      {showLogin && (
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onClose={handleCloseLogin}
        />
      )}
    </div>
  );
}

export default App;
