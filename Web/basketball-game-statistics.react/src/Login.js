import React, { useState } from 'react';
import './Login.css';

function getApiBaseUrl() {
  return process.env.REACT_APP_AUTH_API;
}

export default function Login({ onLoginSuccess, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = `${getApiBaseUrl()}api/identity/token`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          UserName: username,
          Password: password,
        }),
      });

      const data = await response.json();

      if (data.isSuccess && data.value) {
        // Store token and user info in localStorage
        localStorage.setItem('authToken', data.value.token);
        localStorage.setItem('userRole', data.value.userRole);
        localStorage.setItem('username', username);
        localStorage.setItem('tokenValidUntil', data.value.validUntilUTC);

        // Call success callback
        onLoginSuccess({
          token: data.value.token,
          userRole: data.value.userRole,
          username: username,
          validUntil: data.value.validUntilUTC,
        });
      } else {
        setError(data.failureReason || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Login error:', error);
    }

    setLoading(false);
  };

  return (
    <div className="login-overlay">
      <div className="login-container">
        <div className="login-header">
          <h2>Login</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
} 