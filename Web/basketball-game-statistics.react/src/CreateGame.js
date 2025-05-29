import React, { useState, useEffect } from 'react';
import './Admin.css';

function getApiBaseUrl() {
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_DEV;
  } else {
    return process.env.REACT_APP_API_PROD;
  }
}

export default function CreateGame({ onBack, onLoginRequired }) {
  const [user, setUser] = useState(null);
  const [gameForm, setGameForm] = useState({
    gameDescription: '',
    venue: '',
    matchDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    // Check if user is logged in
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
        // Token expired, redirect to login
        onLoginRequired();
      }
    } else {
      // No login credentials, redirect to login
      onLoginRequired();
    }

    // Handle browser back button
    const handlePopState = (event) => {
      // When back button is pressed, go back to admin
      onBack();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onLoginRequired, onBack]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGameForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const gameData = {
        id: 0, // Always set to 0 as requested
        clubId: 1, // Hardcoded as requested
        gameDescription: gameForm.gameDescription,
        venue: gameForm.venue,
        matchDate: gameForm.matchDate,
        createDate: new Date().toISOString(),
        createBy: user.username,
        isActive: true,
        instruction: '',
        playerStatistics: []
      };

      const response = await fetch(`${getApiBaseUrl()}api/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(gameData)
      });

      if (response.status === 200) {
        // Show popup message box for successful creation
        alert('Game created successfully!');
        setGameForm({
          gameDescription: '',
          venue: '',
          matchDate: ''
        });
        setSubmitMessage('Game created successfully!');
        // Go back to admin panel
        onBack();
      } else {
        setSubmitMessage('Error creating game. Please try again.');
      }
    } catch (error) {
      setSubmitMessage('Error creating game. Please check your connection.');
    }

    setIsSubmitting(false);
  };

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Create New Game</h1>
        <p>Welcome, {user.username}</p>
      </div>

      <div className="admin-content">
        <div className="create-game-section">
          <div className="create-game-header">
            <button className="back-btn" onClick={onBack}>
              ← Back to Admin
            </button>
            <h2>Game Details</h2>
          </div>
          <form onSubmit={handleSubmit} className="game-form">
            <div className="form-group">
              <label htmlFor="gameDescription">Game Description:</label>
              <input
                type="text"
                id="gameDescription"
                name="gameDescription"
                value={gameForm.gameDescription}
                onChange={handleInputChange}
                placeholder="e.g., Test Game 2"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="venue">Venue:</label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={gameForm.venue}
                onChange={handleInputChange}
                placeholder="e.g., City Arena"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="matchDate">Match Date & Time:</label>
              <input
                type="datetime-local"
                id="matchDate"
                name="matchDate"
                value={gameForm.matchDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-info">
              <p><strong>Club ID:</strong> 1 (Auto-assigned)</p>
              <p><strong>Created By:</strong> {user.username}</p>
              <p><strong>Status:</strong> Active</p>
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Game...' : 'Create Game'}
            </button>

            {submitMessage && (
              <div className={`submit-message ${submitMessage.includes('Error') ? 'error' : 'success'}`}>
                {submitMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 