import React, { useState, useEffect } from 'react';
import './Admin.css';
import VoiceStatisticsInput from './VoiceStatisticsInput';

function getApiBaseUrl() {
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_DEV;
  } else {
    return process.env.REACT_APP_API_PROD;
  }
}

export default function Admin({ onLoginRequired }) {
  const [activeTab, setActiveTab] = useState('create-game');
  const [user, setUser] = useState(null);
  const [gameForm, setGameForm] = useState({
    gameDescription: '',
    venue: '',
    matchDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [showVoiceStats, setShowVoiceStats] = useState(false);
  const [selectedGameForStats, setSelectedGameForStats] = useState(null);

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
  }, [onLoginRequired]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGameForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchGames = async () => {
    setLoadingGames(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}api/games/1`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Sort games by match date from most recent to oldest
        const sortedGames = data.sort((a, b) => {
          const dateA = a.matchDate ? new Date(a.matchDate) : new Date(0);
          const dateB = b.matchDate ? new Date(b.matchDate) : new Date(0);
          return dateB - dateA; // Most recent first
        });
        setGames(sortedGames);
      } else {
        setGames([]);
      }
    } catch (error) {
      setGames([]);
    }
    setLoadingGames(false);
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'manage-games' && user) {
      fetchGames();
    }
  };

  const handleStatsInput = (game) => {
    setSelectedGameForStats(game);
    setShowVoiceStats(true);
  };

  const handleBackToGames = () => {
    setShowVoiceStats(false);
    setSelectedGameForStats(null);
  };

  const handleDeleteGame = (gameId) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      // TODO: Implement delete API call
      alert(`Delete game with ID: ${gameId}`);
    }
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
        <h1>Admin Panel</h1>
        <p>Welcome, {user.username}</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'create-game' ? 'active' : ''}`}
          onClick={() => handleTabChange('create-game')}
        >
          Create Game
        </button>
        <button 
          className={`tab-button ${activeTab === 'manage-games' ? 'active' : ''}`}
          onClick={() => handleTabChange('manage-games')}
        >
          Manage Games
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'create-game' && (
          <div className="create-game-section">
            <h2>Create New Game</h2>
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
        )}

        {activeTab === 'manage-games' && (
          <div className="manage-games-section">
            {showVoiceStats && selectedGameForStats ? (
              <VoiceStatisticsInput
                gameId={selectedGameForStats.id}
                gameName={selectedGameForStats.gameDescription}
                onBack={handleBackToGames}
              />
            ) : (
              <>
                <h2>Manage Games</h2>
                {loadingGames ? (
                  <div className="loading-games">Loading games...</div>
                ) : (
                  <div className="games-table-container">
                    {games.length === 0 ? (
                      <p>No games found.</p>
                    ) : (
                      <table className="games-table">
                        <thead>
                          <tr>
                            <th>Game Description</th>
                            <th>Game Time</th>
                            <th>Venue</th>
                            <th>Create Time</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {games.map((game, index) => (
                            <tr key={game.id || index}>
                              <td>{game.gameDescription || 'N/A'}</td>
                              <td>
                                {game.matchDate 
                                  ? formatDate(game.matchDate)
                                  : 'TBA'
                                }
                              </td>
                              <td>{game.venue || 'N/A'}</td>
                              <td>
                                {game.createDate 
                                  ? formatDate(game.createDate)
                                  : 'N/A'
                                }
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button 
                                    className="action-btn stats-btn"
                                    onClick={() => handleStatsInput(game)}
                                    title="Input Statistics"
                                  >
                                    📊
                                  </button>
                                  <button 
                                    className="action-btn delete-btn"
                                    onClick={() => handleDeleteGame(game.id)}
                                    title="Delete Game"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 