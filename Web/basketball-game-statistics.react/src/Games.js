import React, { useEffect, useState } from 'react';
import './Games.css';
import teamBull from './images/team_14.2_bull.png';
import Game from './models/Game';

function getApiBaseUrl() {
  return process.env.REACT_APP_API_GAME;
}

export default function Games() {
  const [games, setGames] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedGame, setSelectedGame] = useState(null);
  const [teamStats, setTeamStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Configuration for carousel based on screen size
  const getCardsToShow = () => {
    if (windowWidth <= 480) return 1; // Mobile: 1 card
    if (windowWidth <= 768) return 2; // Tablet: 2 cards
    return 3; // Desktop: 3 cards
  };
  
  const cardsToShow = getCardsToShow();
  const cardWidth = 240; // Width of each card including margin

  useEffect(() => {
    fetchGames();
    
    // Handle window resize for responsive carousel
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset currentIndex when cardsToShow changes to prevent out-of-bounds
  useEffect(() => {
    if (currentIndex >= games.length - cardsToShow && games.length > 0) {
      setCurrentIndex(Math.max(0, games.length - cardsToShow));
    }
  }, [cardsToShow, games.length, currentIndex]);

  const fetchGames = async () => {
    try {
      const url = `${getApiBaseUrl()}api/games/1`;
      const response = await fetch(url);
      const data = await response.json();
      const mapped = data.map(g => new Game(g));
      mapped.sort((a, b) => (b.createDate || 0) - (a.createDate || 0));
      setGames(mapped);
    } catch (error) {
      setGames([]);
    }
  };

  const fetchGameStatistics = async (gameId) => {
    setLoading(true);
    try {
      const url = `${getApiBaseUrl()}api/games/statistics/${gameId}`;
      const response = await fetch(url);
      const data = await response.json();
      setTeamStats(data);
    } catch (error) {
      setTeamStats([]);
    }
    setLoading(false);
  };

  const handleGameClick = (game) => {
    setSelectedGame(game);
    fetchGameStatistics(game.id);
  };

  const handlePrevClick = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNextClick = () => {
    if (currentIndex < games.length - cardsToShow) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const renderGameCard = (game, index) => (
    <div 
      key={game.id} 
      className={`game-card ${selectedGame?.id === game.id ? 'active' : ''}`}
      onClick={() => handleGameClick(game)}
    >
      <img src={teamBull} alt="Team Bull" className="game-card-image" />
      <h3>{game.gameDescription}</h3>
      <p><strong>Venue:</strong> {game.venue}</p>
      <p><strong>Date:</strong> {game.matchDate ? game.matchDate.toLocaleString() : 'TBA'}</p>
    </div>
  );

  const renderStatistics = () => {
    if (!selectedGame || teamStats.length === 0) return null;

    return (
      <div className="statistics-container">
        <div className="game-statistics-section">
          <h2>Game Statistics</h2>
          <div className="team-statistics">
            <div className="team-stats-section">
              <table className="team-stats-table">
                <thead>
                  <tr>
                    <th>Statistic</th>
                    <th>Light Team</th>
                    <th>Dark Team</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Points</td>
                    <td>{teamStats[0]?.point || 0}</td>
                    <td>{teamStats[1]?.point || 0}</td>
                  </tr>
                  <tr>
                    <td>Hit Rate</td>
                    <td>
                      {(() => {
                        const attempt = teamStats[0]?.shootAttempt || 0;
                        const miss = teamStats[0]?.shootMiss || 0;
                        const total = attempt + miss;
                        const percentage = total > 0 ? ((attempt / total) * 100).toFixed(2) : 0;
                        return `${attempt}/${total} (${percentage}%)`;
                      })()}
                    </td>
                    <td>
                      {(() => {
                        const attempt = teamStats[1]?.shootAttempt || 0;
                        const miss = teamStats[1]?.shootMiss || 0;
                        const total = attempt + miss;
                        const percentage = total > 0 ? ((attempt / total) * 100).toFixed(2) : 0;
                        return `${attempt}/${total} (${percentage}%)`;
                      })()}
                    </td>
                  </tr>
                  <tr>
                    <td>Rebounds</td>
                    <td>{teamStats[0]?.rebound || 0}</td>
                    <td>{teamStats[1]?.rebound || 0}</td>
                  </tr>
                  <tr>
                    <td>Assists</td>
                    <td>{teamStats[0]?.assist || 0}</td>
                    <td>{teamStats[1]?.assist || 0}</td>
                  </tr>
                  <tr>
                    <td>Steals</td>
                    <td>{teamStats[0]?.steal || 0}</td>
                    <td>{teamStats[1]?.steal || 0}</td>
                  </tr>
                  <tr>
                    <td>Blocks</td>
                    <td>{teamStats[0]?.block || 0}</td>
                    <td>{teamStats[1]?.block || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="player-statistics-section">
          <h2>Player Statistics</h2>
          <div className="player-stats-container">
            <div className="player-stats-section">
              <h3 style={{ color: teamStats[0]?.teamColor }}>Light Team Players</h3>
              <table className="player-stats-table">
                <thead>
                  <tr>
                    <th>Player #</th>
                    <th>Points</th>
                    <th>Hit Rate</th>
                    <th>Rebounds</th>
                    <th>Assists</th>
                    <th>Steals</th>
                    <th>Blocks</th>
                  </tr>
                </thead>
                <tbody>
                  {teamStats[0]?.playerStatistics.map((player, pIndex) => (
                    <tr key={pIndex}>
                      <td>{player.playerNumber}</td>
                      <td>{player.point}</td>
                      <td>
                        {(() => {
                          const attempt = player.shootAttempt || 0;
                          const miss = player.shootMiss || 0;
                          const total = attempt + miss;
                          const percentage = total > 0 ? ((attempt / total) * 100).toFixed(2) : 0;
                          return `${attempt}/${total} (${percentage}%)`;
                        })()}
                      </td>
                      <td>{player.rebound}</td>
                      <td>{player.assist}</td>
                      <td>{player.steal}</td>
                      <td>{player.block}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="player-stats-section">
              <h3 style={{ color: teamStats[1]?.teamColor }}>Dark Team Players</h3>
              <table className="player-stats-table">
                <thead>
                  <tr>
                    <th>Player #</th>
                    <th>Points</th>
                    <th>Hit Rate</th>
                    <th>Rebounds</th>
                    <th>Assists</th>
                    <th>Steals</th>
                    <th>Blocks</th>
                  </tr>
                </thead>
                <tbody>
                  {teamStats[1]?.playerStatistics.map((player, pIndex) => (
                    <tr key={pIndex}>
                      <td>{player.playerNumber}</td>
                      <td>{player.point}</td>
                      <td>
                        {(() => {
                          const attempt = player.shootAttempt || 0;
                          const miss = player.shootMiss || 0;
                          const total = attempt + miss;
                          const percentage = total > 0 ? ((attempt / total) * 100).toFixed(2) : 0;
                          return `${attempt}/${total} (${percentage}%)`;
                        })()}
                      </td>
                      <td>{player.rebound}</td>
                      <td>{player.assist}</td>
                      <td>{player.steal}</td>
                      <td>{player.block}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="games-page">
      <div className="carousel-container">
        <button 
          className="carousel-button prev" 
          onClick={handlePrevClick}
          disabled={currentIndex === 0}
        >
          &lt;
        </button>
        <div className="carousel-viewport">
          <div 
            className="carousel" 
            style={{ 
              transform: `translateX(-${currentIndex * cardWidth}px)`,
              width: `${games.length * cardWidth}px`
            }}
          >
            {games.map((game, index) => renderGameCard(game, index))}
          </div>
        </div>
        <button 
          className="carousel-button next" 
          onClick={handleNextClick}
          disabled={currentIndex >= games.length - cardsToShow}
        >
          &gt;
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading statistics...</div>
      ) : (
        renderStatistics()
      )}
    </div>
  );
} 