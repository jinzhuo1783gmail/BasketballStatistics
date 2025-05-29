import React, { useState, useEffect } from 'react';
import './Admin.css';

function getApiBaseUrl() {
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_DEV;
  } else {
    return process.env.REACT_APP_API_PROD;
  }
}

export default function EditGame({ game, onBack, onLoginRequired }) {
  const [user, setUser] = useState(null);
  const [gameForm, setGameForm] = useState({
    gameDescription: '',
    venue: '',
    matchDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Helper function to format dates as dd/MM/yyyy HH:mm
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return 'N/A';
    }
  };

  // Helper function to convert API date to datetime-local format (YYYY-MM-DDTHH:MM)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // Get local date and time in YYYY-MM-DDTHH:MM format
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      return '';
    }
  };

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

  useEffect(() => {
    // Populate form when game prop is available
    if (game) {
      setGameForm({
        gameDescription: game.gameDescription || '',
        venue: game.venue || '',
        matchDate: formatDateForInput(game.matchDate)
      });
    }
  }, [game]);

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
        id: game.id,
        clubId: 1, // Hardcoded as requested
        gameDescription: gameForm.gameDescription,
        venue: gameForm.venue,
        matchDate: gameForm.matchDate,
        createDate: game.createDate,
        createBy: game.createBy,
        isActive: true,
        instruction: '',
        playerStatistics: []
      };

      // Use PATCH method without ID in URL (server expects ID in body)
      const response = await fetch(`${getApiBaseUrl()}api/games`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(gameData)
      });

      if (response.status === 200 || response.status === 204) {
        // Show popup message box for successful update
        alert('Game updated successfully!');
        setSubmitMessage('Game updated successfully!');
        // Go back to admin panel
        onBack();
      } else {
        const errorText = await response.text();
        console.error('Update failed:', response.status, errorText);
        setSubmitMessage(`Error updating game: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      setSubmitMessage('Error updating game. Please check your connection.');
    }

    setIsSubmitting(false);
  };

  // Don't render anything if user is not authenticated or no game provided
  if (!user || !game) {
    return null;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Edit Game</h1>
        <p>Welcome, {user.username}</p>
      </div>

      <div className="admin-content">
        <div className="edit-game-section">
          <div className="edit-game-header">
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
              <p><strong>Game ID:</strong> {game.id}</p>
              <p><strong>Created By:</strong> {game.createBy || 'N/A'}</p>
              <p><strong>Created Date:</strong> {formatDate(game.createDate)}</p>
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating Game...' : 'Update Game'}
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