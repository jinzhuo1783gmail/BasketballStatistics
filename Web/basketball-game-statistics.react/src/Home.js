import React, { useEffect, useState } from 'react';
import './Home.css';
import homeBack from './images/home_back_2.png';
import teamBull from './images/team_14.2_bull.png';
import Game from './models/Game';

function getApiBaseUrl() {
  return process.env.REACT_APP_API_GAME;
}

export default function Home() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const url = `${getApiBaseUrl()}api/games/1`;
        console.log('Fetching from:', url);
        const response = await fetch(url);
        const data = await response.json();
        const mapped = data.map(g => new Game(g));
        mapped.sort((a, b) => (b.createDate || 0) - (a.createDate || 0));
        setGames(mapped.slice(0, 3));
      } catch (error) {
        setGames([]);
      }
    };
    fetchGames();
  }, []);

  return (
    <>
      <div className="hero-section" style={{ backgroundImage: `url(${homeBack})` }}>
        <div className="hero-content">
          <h1>DRAWS, RESULTS & LADDERS</h1>
        </div>
      </div>

      <div className="content-section">
        <div className="container">
          <h2>Recent Games</h2>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            {games.length === 0 && <p>No games found.</p>}
            {games.map(game => (
              <div key={game.id} style={{
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 16,
                background: '#fff',
                color: '#333',
                width: 320,
                boxSizing: 'border-box',
              }}>
                <img src={teamBull} alt="Team Bull" style={{ width: '100%', borderRadius: 8, marginBottom: 12 }} />
                <h3 style={{ margin: '8px 0', color: '#333' }}>{game.gameDescription}</h3>
                <p style={{ color: '#333' }}><strong>Venue:</strong> {game.venue}</p>
                <p style={{ color: '#333' }}><strong>Date:</strong> {game.matchDate ? game.matchDate.toLocaleString() : 'TBA'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
} 