import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import TrendChart from '../components/TrendChart';
import BudgetAllocation from '../components/BudgetAllocation';
import EventDisplay from '../components/EventDisplay';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const METRIC_LABELS: Record<string, string> = {
  BP: 'Business Performance',
  CA: 'Change Adoption',
  EE: 'Employee Energy',
  TR: 'Trust',
  RS: 'Resistance',
  LC: 'Leadership Credibility',
  MO: 'Momentum'
};

export default function Game() {
  const { gameCode } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  const playerName = searchParams.get('name');

  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any>({});
  const [outcome, setOutcome] = useState<any>(null);
  const [error, setError] = useState('');
  const [newsFeed, setNewsFeed] = useState<any[]>([]);
  const [metricHistory, setMetricHistory] = useState<any[]>([]);
  const [activeEvent, setActiveEvent] = useState<any>(null);

  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      if (role === 'facilitator') {
        newSocket.emit('join', gameCode);
        
        // Facilitator gets game state after joining
        newSocket.emit('get-game-state', { gameCode }, (response: any) => {
          if (response.success) {
            setGameState(response.game);
            setPlayers(response.game.players);
            setNewsFeed(response.game.newsFeed || []);
            setMetricHistory(response.game.metricHistory || []);
            setActiveEvent(response.game.activeEvent);
          }
        });
      } else if (role === 'player' && playerName) {
        newSocket.emit('join-game', { gameCode, playerName }, (response: any) => {
          if (!response.success) {
            setError(response.error);
          } else {
            setPlayers(response.players);
            
            // Player gets game state AFTER successfully joining
            newSocket.emit('get-game-state', { gameCode }, (response: any) => {
              if (response.success) {
                setGameState(response.game);
                setPlayers(response.game.players);
                setNewsFeed(response.game.newsFeed || []);
                setMetricHistory(response.game.metricHistory || []);
                setActiveEvent(response.game.activeEvent);
              }
            });
          }
        });
      }
    });

    newSocket.on('player-joined', (data) => {
      setPlayers(data.players);
    });

    newSocket.on('game-started', (data) => {
      setGameState((prev: any) => ({ ...prev, ...data, gameStarted: true }));
      setNewsFeed(data.newsFeed || []);
      setMetricHistory(data.metricHistory || []);
      setOutcome(null);
    });

    newSocket.on('all-submitted', () => {
      setGameState((prev: any) => ({ ...prev, allSubmitted: true }));
    });

    newSocket.on('round-resolved', (data) => {
      setOutcome(data);
      setGameState((prev: any) => ({
        ...prev,
        state: data.newState,
        allSubmitted: false,
        gameEnded: data.gameEnded
      }));
      setNewsFeed(data.newsFeed || []);
      setMetricHistory(data.metricHistory || []);
      if (data.event) {
        setActiveEvent(data.event);
      }
      setDecisions({});
    });

    newSocket.on('next-round', (data) => {
      setGameState((prev: any) => ({ ...prev, ...data }));
      setNewsFeed(data.newsFeed || []);
      setMetricHistory(data.metricHistory || []);
      setActiveEvent(null);
      setOutcome(null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [gameCode, role, playerName]);

  const handleStartGame = () => {
    socket?.emit('start-game', { gameCode }, (response: any) => {
      if (!response.success) {
        setError(response.error);
      }
    });
  };

  const handleSelectOption = (decisionId: string, optionId: string) => {
    setDecisions((prev: any) => ({ ...prev, [decisionId]: optionId }));
  };

  const handleBudgetAllocation = (decisionId: string, allocation: number[]) => {
    setDecisions((prev: any) => ({ ...prev, [decisionId]: allocation }));
  };

  const handleSubmit = () => {
    const scenario = gameState?.scenario;
    if (!scenario) return;

    const allDecided = scenario.decisions.every((d: any) => decisions[d.id]);
    if (!allDecided) {
      setError('Please make all decisions');
      return;
    }

    socket?.emit('submit-decisions', { gameCode, decisions }, (response: any) => {
      if (!response.success) {
        setError(response.error);
      }
    });
  };

  const handleResolve = () => {
    socket?.emit('resolve-round', { gameCode }, (response: any) => {
      if (!response.success) {
        setError(response.error);
      }
    });
  };

  if (!gameState) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  const getMetricColor = (value: number) => {
    if (value > 70) return '#10b981';
    if (value > 50) return '#3b82f6';
    if (value > 30) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f5f9' }}>
      {/* Fixed Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', padding: '15px 30px', color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1600px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>TRANSFORM™</span>
            <span>Game: <strong>{gameCode}</strong></span>
            {role === 'facilitator' && <span>👑 Facilitator</span>}
            <span>Players: <strong>{players.length}</strong></span>
            {gameState.gameStarted && <span>Round: <strong>{gameState.currentRound}/6</strong></span>}
          </div>
          {gameState.gameStarted && gameState.state && (
            <div style={{ fontSize: '13px' }}>
              <strong>{gameState.state.bridgesStage} / {gameState.state.changeCurveState}</strong>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '2px solid #ef4444', padding: '12px 20px', color: '#991b1b', margin: '10px 20px', borderRadius: '6px', flexShrink: 0 }}>
          {error}
        </div>
      )}

      {/* Main Content Area - Scrollable */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', maxWidth: '1600px', width: '100%', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Waiting Room */}
        {!gameState.gameStarted && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', maxWidth: '600px', width: '100%' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Waiting Room</h2>
              <div style={{ marginBottom: '20px' }}>
                <strong>Players ({players.length}):</strong>
                <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                  {players.map((p: any) => (
                    <div key={p.id} style={{ padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '2px solid #e2e8f0', fontSize: '14px' }}>
                      👤 {p.name}
                    </div>
                  ))}
                </div>
              </div>
              {role === 'facilitator' && (
                <button
                  onClick={handleStartGame}
                  disabled={players.length === 0}
                  style={{ padding: '12px 32px', background: players.length > 0 ? '#3b82f6' : '#94a3b8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: players.length > 0 ? 'pointer' : 'not-allowed' }}
                >
                  Start Game
                </button>
              )}
              {role === 'player' && (
                <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '6px', color: '#1e40af', fontSize: '14px' }}>
                  Waiting for facilitator to start the game...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Game Active */}
        {gameState.gameStarted && !gameState.gameEnded && (
          <>
            {/* Left Column - Main Content */}
            <div style={{ flex: '1 1 70%', display: 'flex', flexDirection: 'column', paddingRight: '15px', overflow: 'hidden' }}>
              
              {/* Compact Metrics */}
              {gameState.state && (
                <div style={{ background: 'white', padding: '12px 15px', borderRadius: '8px', marginBottom: '10px', flexShrink: 0 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                    {Object.entries(gameState.state.metrics).map(([key, value]: [string, any]) => (
                      <div key={key} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>{METRIC_LABELS[key]}</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: getMetricColor(value) }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scrollable Content Area */}
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                
                {/* Event Display */}
                {activeEvent && !outcome && (
                  <EventDisplay event={activeEvent} />
                )}

                {/* Scenario & Decisions */}
                {gameState.scenario && !outcome && (
                  <div style={{ background: 'white', padding: '20px', borderRadius: '10px', marginBottom: '10px' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '8px', color: '#1e3a8a' }}>{gameState.scenario.title}</h2>
                    <p style={{ color: '#64748b', marginBottom: '15px', fontSize: '13px', lineHeight: '1.5' }}>{gameState.scenario.scenarioText}</p>

                    {gameState.scenario.decisions.map((decision: any) => (
                      <div key={decision.id} style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#334155', fontWeight: '600' }}>{decision.prompt}</h3>
                        
                        {decision.type === 'multiple-choice' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {decision.options.map((option: any) => (
                              <label
                                key={option.id}
                                style={{
                                  padding: '10px 12px',
                                  border: decisions[decision.id] === option.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  background: decisions[decision.id] === option.id ? '#eff6ff' : 'white',
                                  fontSize: '13px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <input
                                  type="radio"
                                  name={decision.id}
                                  checked={decisions[decision.id] === option.id}
                                  onChange={() => handleSelectOption(decision.id, option.id)}
                                  style={{ marginRight: '10px' }}
                                />
                                <span><strong style={{ color: '#3b82f6' }}>{option.id}.</strong> {option.label}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {decision.type === 'budget-allocation' && decision.budgetAllocation && (
                          <BudgetAllocation
                            categories={decision.budgetAllocation.categories}
                            totalBudget={decision.budgetAllocation.totalBudget}
                            minPerCategory={decision.budgetAllocation.minPerCategory}
                            onAllocationChange={(allocation) => handleBudgetAllocation(decision.id, allocation)}
                          />
                        )}
                      </div>
                    ))}

                    {role === 'player' && !gameState.allSubmitted && (
                      <button
                        onClick={handleSubmit}
                        style={{ padding: '10px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Submit Decisions
                      </button>
                    )}

                    {gameState.allSubmitted && role === 'facilitator' && (
                      <button
                        onClick={handleResolve}
                        style={{ padding: '10px 24px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Resolve Round →
                      </button>
                    )}

                    {gameState.allSubmitted && role === 'player' && (
                      <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '6px', color: '#92400e', fontSize: '13px' }}>
                        ⏳ Waiting for facilitator to resolve round...
                      </div>
                    )}
                  </div>
                )}

                {/* Outcomes */}
                {outcome && (
                  <div style={{ background: 'white', padding: '20px', borderRadius: '10px' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#1e3a8a' }}>Round {gameState.currentRound - 1} Results</h2>
                    
                    {outcome.event && <EventDisplay event={outcome.event} />}
                    
                    <p style={{ marginBottom: '15px', color: '#64748b', fontSize: '13px' }}>{outcome.summary}</p>
                    
                    <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#334155' }}>Outcomes:</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                      {outcome.outcomes.map((text: string, i: number) => (
                        <div key={i} style={{ padding: '10px', background: '#f8fafc', borderLeft: '3px solid #3b82f6', borderRadius: '4px', fontSize: '13px' }}>
                          {text}
                        </div>
                      ))}
                    </div>

                    {!outcome.gameEnded && (
                      <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '6px', color: '#1e40af', fontSize: '13px', fontWeight: '500' }}>
                        📊 Continuing to Round {outcome.nextRound}...
                      </div>
                    )}
                  </div>
                )}

                {/* Trend Chart */}
                {metricHistory.length > 1 && (
                  <div style={{ marginTop: '10px' }}>
                    <TrendChart history={metricHistory} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - News Feed */}
            <div style={{ flex: '0 0 28%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ background: 'white', padding: '15px', borderRadius: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#334155' }}>📰 Live News Feed</h3>
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                  {newsFeed.slice().reverse().map((item: any) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '10px',
                        marginBottom: '8px',
                        borderLeft: `3px solid ${item.sentiment === 'positive' ? '#10b981' : item.sentiment === 'negative' ? '#ef4444' : '#64748b'}`,
                        background: item.sentiment === 'positive' ? '#f0fdf4' : item.sentiment === 'negative' ? '#fef2f2' : '#f8fafc',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '14px' }}>
                          {item.type === 'employee' ? '💬' : item.type === 'department' ? '📊' : item.type === 'external' ? '🌐' : item.type === 'rumor' ? '🤫' : '⚡'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#334155', lineHeight: '1.4', marginBottom: '4px' }}>{item.text}</div>
                          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>
                            {item.type} • {new Date(item.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Game Ended */}
        {gameState.gameEnded && outcome?.finalScore && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', maxWidth: '800px', width: '100%' }}>
              <h2 style={{ fontSize: '28px', marginBottom: '20px', color: '#1e3a8a' }}>Transformation Complete!</h2>
              <div style={{ fontSize: '60px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '10px' }}>
                {outcome.finalScore.score}
              </div>
              <div style={{ fontSize: '20px', color: '#64748b', marginBottom: '30px', fontWeight: '500' }}>
                {outcome.finalScore.tier}
              </div>
              
              {metricHistory.length > 1 && (
                <div style={{ marginBottom: '30px' }}>
                  <TrendChart history={metricHistory} />
                </div>
              )}

              <button
                onClick={() => window.location.href = '/'}
                style={{ padding: '12px 32px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
              >
                Start New Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
