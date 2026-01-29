import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');

  const handleCreateGame = () => {
    const socket = io(API_URL);
    
    socket.on('connect', () => {
      socket.emit('create-game', (response: any) => {
        if (response.success) {
          navigate(`/game/${response.gameCode}?role=facilitator`);
        } else {
          setError(response.error || 'Failed to create game');
          socket.disconnect();
        }
      });
    });
    
    socket.on('connect_error', () => {
      setError('Failed to connect to server');
      socket.disconnect();
    });
  };

  const handleJoinGame = () => {
    if (!gameCode || !playerName) {
      setError('Please enter game code and your name');
      return;
    }
    navigate(`/game/${gameCode}?role=player&name=${encodeURIComponent(playerName)}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '10px', textAlign: 'center' }}>
          TRANSFORM™
        </h1>
        <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '40px' }}>
          Change Leadership Simulation
        </p>

        {mode === 'select' && (
          <div>
            <button
              onClick={() => setMode('create')}
              style={{ width: '100%', padding: '20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}
            >
              🎮 Create New Game (Facilitator)
            </button>
            <button
              onClick={() => setMode('join')}
              style={{ width: '100%', padding: '20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: '600' }}
            >
              👥 Join Game (Player)
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#334155' }}>Create Game</h2>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>
              You'll receive a game code to share with players.
            </p>
            <button
              onClick={handleCreateGame}
              style={{ width: '100%', padding: '16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}
            >
              Create Game
            </button>
            <button
              onClick={() => setMode('select')}
              style={{ width: '100%', padding: '16px', background: 'transparent', color: '#64748b', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
            >
              Back
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#334155' }}>Join Game</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>
                Game Code
              </label>
              <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '6px', fontSize: '16px' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '6px', fontSize: '16px' }}
              />
            </div>

            {error && (
              <div style={{ background: '#fee2e2', border: '2px solid #ef4444', padding: '12px', borderRadius: '6px', color: '#991b1b', marginBottom: '20px' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleJoinGame}
              disabled={!gameCode || !playerName}
              style={{ width: '100%', padding: '16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}
            >
              Join Game
            </button>
            <button
              onClick={() => setMode('select')}
              style={{ width: '100%', padding: '16px', background: 'transparent', color: '#64748b', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
