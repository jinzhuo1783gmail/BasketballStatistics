import React, { useState, useEffect } from 'react';
import './Admin.css';
import VoiceStatisticsInput from './VoiceStatisticsInput';
import CreateGame from './CreateGame';
import EditGame from './EditGame';

function getApiBaseUrl() {
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_DEV;
  } else {
    return process.env.REACT_APP_API_PROD;
  }
}

export default function Admin({ onLoginRequired }) {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [showVoiceStats, setShowVoiceStats] = useState(false);
  const [selectedGameForStats, setSelectedGameForStats] = useState(null);
  const [currentPage, setCurrentPage] = useState('admin'); // 'admin', 'create', 'edit'
  const [selectedGameForEdit, setSelectedGameForEdit] = useState(null);

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
        const userData = {
          token,
          username,
          userRole,
          validUntil
        };
        setUser(userData);
        // Load games by default when user is authenticated
        loadGamesForUser(userData);
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
      const state = event.state;
      if (state) {
        if (state.page === 'stats') {
          setCurrentPage('admin');
          setShowVoiceStats(true);
          setSelectedGameForStats(state.selectedGame);
          setSelectedGameForEdit(null);
        } else if (state.page === 'edit') {
          setCurrentPage('edit');
          setSelectedGameForEdit(state.selectedGame);
          setShowVoiceStats(false);
          setSelectedGameForStats(null);
        } else if (state.page === 'create') {
          setCurrentPage('create');
          setSelectedGameForEdit(null);
          setShowVoiceStats(false);
          setSelectedGameForStats(null);
        } else {
          // Default to admin page
          setCurrentPage('admin');
          setSelectedGameForEdit(null);
          setShowVoiceStats(false);
          setSelectedGameForStats(null);
        }
      } else {
        // No state means we're going back to the main admin page
        setCurrentPage('admin');
        setSelectedGameForEdit(null);
        setShowVoiceStats(false);
        setSelectedGameForStats(null);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Set initial state for the admin page
    if (window.history.state === null) {
      window.history.replaceState({ page: 'admin' }, '', window.location.pathname);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onLoginRequired]);

  const loadGamesForUser = async (userData) => {
    setLoadingGames(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}api/games/1`, {
        headers: {
          'Authorization': `Bearer ${userData.token}`
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

  const handleStatsInput = (game) => {
    setSelectedGameForStats(game);
    setShowVoiceStats(true);
    // Push stats state to history
    window.history.pushState({ 
      page: 'stats', 
      selectedGame: game 
    }, '', window.location.pathname);
  };

  const handleBackToGames = () => {
    setShowVoiceStats(false);
    setSelectedGameForStats(null);
    setSelectedGameForEdit(null);
    // Push admin state to history
    window.history.pushState({ page: 'admin' }, '', window.location.pathname);
  };

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  // Render different pages based on currentPage state
  if (currentPage === 'create') {
    return (
      <CreateGame
        onBack={() => {
          setCurrentPage('admin');
          setSelectedGameForEdit(null);
          loadGamesForUser(user); // Refresh games list
          // Push admin state to history
          window.history.pushState({ page: 'admin' }, '', window.location.pathname);
        }}
        onLoginRequired={onLoginRequired}
      />
    );
  }

  if (currentPage === 'edit' && selectedGameForEdit) {
    return (
      <EditGame
        game={selectedGameForEdit}
        onBack={() => {
          setCurrentPage('admin');
          setSelectedGameForEdit(null);
          loadGamesForUser(user); // Refresh games list
          // Push admin state to history
          window.history.pushState({ page: 'admin' }, '', window.location.pathname);
        }}
        onLoginRequired={onLoginRequired}
      />
    );
  }

  // Default admin page
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Welcome, {user.username}</p>
      </div>

      <div className="admin-content">
        <div className="manage-games-section">
          {showVoiceStats && selectedGameForStats ? (
            <VoiceStatisticsInput
              gameId={selectedGameForStats.id}
              gameName={selectedGameForStats.gameDescription}
              onBack={handleBackToGames}
            />
          ) : (
            <>
              <div className="games-header">
                <h2>Manage Games</h2>
                <button 
                  className="create-game-btn"
                  onClick={() => {
                    setCurrentPage('create');
                    // Push create state to history
                    window.history.pushState({ page: 'create' }, '', window.location.pathname);
                  }}
                >
                  <span className="create-game-icon">+</span>
                  Create Game
                </button>
              </div>
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
                          <th>Statistics</th>
                          <th>Edit</th>
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
                              </div>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="action-btn edit-btn"
                                  onClick={() => {
                                    setSelectedGameForEdit(game);
                                    setCurrentPage('edit');
                                    // Push edit state to history with selected game
                                    window.history.pushState({ 
                                      page: 'edit', 
                                      selectedGame: game 
                                    }, '', window.location.pathname);
                                  }}
                                  title="Edit Game"
                                >
                                  ✏️
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
      </div>
    </div>
  );
} 