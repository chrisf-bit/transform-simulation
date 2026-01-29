import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import IndividualTrendCharts from '../components/IndividualTrendCharts';
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

const METRIC_ICONS: Record<string, string> = {
  BP: 'B',
  CA: 'C',
  EE: 'E',
  TR: 'T',
  RS: 'R',
  LC: 'L',
  MO: 'M'
};

export default function Game() {
  const { gameCode } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  const playerName = searchParams.get('name');

  // Early return if no game code
  if (!gameCode) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#0f172a', color: 'white', minHeight: '100vh' }}>
        <h2>No game code provided</h2>
        <button 
          onClick={() => window.location.href = '/'}
          style={{ marginTop: '20px', padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Return Home
        </button>
      </div>
    );
  }

  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any>({});
  const [outcome, setOutcome] = useState<any>(null);
  const [error, setError] = useState('');
  const [newsFeed, setNewsFeed] = useState<any[]>([]);
  const [metricHistory, setMetricHistory] = useState<any[]>([]);
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'metrics' | 'trends'>('metrics');
  const [isConnected, setIsConnected] = useState(false);
  const socketInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple socket connections
    if (socketInitialized.current) {
      console.log('Socket already initialized, skipping...');
      return;
    }

    console.log('Initializing socket connection...');
    socketInitialized.current = true;

    const newSocket = io(API_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10
    });
    setSocket(newSocket);

    // Heartbeat to keep connection alive
    const heartbeatInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('heartbeat', { gameCode });
      }
    }, 30000); // Every 30 seconds

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      if (role === 'facilitator') {
        newSocket.emit('join', gameCode);
        
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

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // Server disconnected, manually reconnect
        newSocket.connect();
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      // Refresh game state after reconnection
      newSocket.emit('get-game-state', { gameCode }, (response: any) => {
        if (response.success) {
          setGameState(response.game);
          setPlayers(response.game.players);
          setNewsFeed(response.game.newsFeed || []);
          setMetricHistory(response.game.metricHistory || []);
          setActiveEvent(response.game.activeEvent);
        }
      });
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
      console.log('Next round data received:', data); // Debug
      setGameState((prev: any) => ({ 
        ...prev, 
        currentRound: data.currentRound,
        scenario: data.scenario,
        state: data.state,
        allSubmitted: false
      }));
      setNewsFeed(data.newsFeed || []);
      setMetricHistory(data.metricHistory || []);
      setActiveEvent(null);
      setOutcome(null);
      setDecisions({});
    });

    return () => {
      console.log('Cleaning up socket connection...');
      clearInterval(heartbeatInterval);
      newSocket.disconnect();
      socketInitialized.current = false;
    };
  }, [gameCode, role, playerName]);

  const handleSelectOption = (decisionId: string, optionId: string) => {
    setDecisions((prev: any) => ({ ...prev, [decisionId]: optionId }));
  };

  const handleBudgetAllocation = (decisionId: string, allocation: number[]) => {
    setDecisions((prev: any) => ({ ...prev, [decisionId]: allocation }));
  };

  const handleStartGame = () => {
    socket?.emit('start-game', { gameCode }, (response: any) => {
      if (!response.success) {
        setError(response.error);
      }
    });
  };

  const handleSubmit = () => {
    const scenario = gameState?.scenario;
    if (!scenario) return;

    const allDecided = scenario.decisions.every((d: any) => decisions[d.id]);
    if (!allDecided) {
      setError('Please complete all decisions');
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
    return <div style={{ padding: '40px', textAlign: 'center', background: '#0f172a', color: 'white', minHeight: '100vh' }}>Loading...</div>;
  }

  const getMetricColor = (value: number) => {
    if (value > 70) return '#10b981';
    if (value > 50) return '#3b82f6';
    if (value > 30) return '#f59e0b';
    return '#ef4444';
  };

  // Separate investments from questions
  const investments = gameState.scenario?.decisions.filter((d: any) => d.type === 'budget-allocation') || [];
  const questions = gameState.scenario?.decisions.filter((d: any) => d.type === 'multiple-choice') || [];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
      {/* Premium Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)', padding: '12px 30px', color: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', flexShrink: 0, borderBottom: '2px solid #6366f1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '30px', fontSize: '13px', alignItems: 'center' }}>
            <span style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '1px' }}>TRANSFORM</span>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '4px' }}>
              <strong>{gameCode}</strong>
            </span>
            {role === 'facilitator' && <span style={{ background: '#10b981', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>FACILITATOR</span>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: isConnected ? '#10b981' : '#ef4444',
                boxShadow: isConnected ? '0 0 8px #10b981' : '0 0 8px #ef4444'
              }}></div>
              <span style={{ fontSize: '11px', color: isConnected ? '#d1fae5' : '#fecaca' }}>
                {isConnected ? 'LIVE' : 'DISCONNECTED'}
              </span>
            </div>
            <span>Players: <strong>{players.length}</strong></span>
            {gameState.gameStarted && <span>Round <strong>{gameState.currentRound}</strong>/6</span>}
          </div>
          {gameState.gameStarted && gameState.state && (
            <div style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '6px' }}>
              <strong>{gameState.state.bridgesStage}</strong> • {gameState.state.changeCurveState}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: '#7f1d1d', border: '2px solid #ef4444', padding: '10px 20px', color: '#fecaca', margin: '10px 20px', borderRadius: '6px', flexShrink: 0, fontSize: '13px' }}>
          ⚠ {error}
        </div>
      )}

      {/* Waiting Room */}
      {!gameState.gameStarted && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#1e293b', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', maxWidth: '600px', width: '100%', border: '1px solid #334155' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '25px', color: 'white', fontWeight: '600' }}>WAITING ROOM</h2>
            <div style={{ marginBottom: '25px' }}>
              <div style={{ color: '#94a3b8', marginBottom: '15px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Players ({players.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                {players.map((p: any) => (
                  <div key={p.id} style={{ padding: '12px', background: '#334155', borderRadius: '6px', border: '1px solid #475569', fontSize: '14px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: '900', flexShrink: 0 }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    {p.name}
                  </div>
                ))}
              </div>
            </div>
            {role === 'facilitator' && (
              <button
                onClick={handleStartGame}
                disabled={players.length === 0}
                style={{ 
                  padding: '14px 40px', 
                  background: players.length > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : '#475569', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  cursor: players.length > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: players.length > 0 ? '0 4px 15px rgba(16, 185, 129, 0.4)' : 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                Start Game
              </button>
            )}
            {role === 'player' && (
              <div style={{ padding: '14px', background: '#1e40af', borderRadius: '8px', color: '#93c5fd', fontSize: '14px', textAlign: 'center' }}>
                Waiting for facilitator to start...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Active - 3 Column Layout */}
      {gameState.gameStarted && !gameState.gameEnded && (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', maxWidth: '1800px', width: '100%', margin: '0 auto', padding: '0 20px', gap: '15px' }}>
          
          {/* Column 1: Investments (30%) */}
          <div style={{ flex: '0 0 28%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Tabs */}
            {gameState.state && (
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => setActiveTab('metrics')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: activeTab === 'metrics' ? '#1e3a8a' : '#1e293b',
                    color: activeTab === 'metrics' ? '#fff' : '#94a3b8',
                    border: activeTab === 'metrics' ? '2px solid #6366f1' : '1px solid #475569',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: 'pointer'
                  }}
                >
                  METRICS
                </button>
                <button
                  onClick={() => setActiveTab('trends')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: activeTab === 'trends' ? '#1e3a8a' : '#1e293b',
                    color: activeTab === 'trends' ? '#fff' : '#94a3b8',
                    border: activeTab === 'trends' ? '2px solid #6366f1' : '1px solid #475569',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: 'pointer'
                  }}
                >
                  TRENDS
                </button>
              </div>
            )}

            {/* Metrics Tab */}
            {activeTab === 'metrics' && gameState.state && (
              <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', marginBottom: '8px', flexShrink: 0, border: '1px solid #475569' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px' }}>
                  {Object.entries(gameState.state.metrics).map(([key, value]: [string, any]) => (
                    <div key={key} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      background: '#0f172a', 
                      padding: '5px 8px', 
                      borderRadius: '4px', 
                      border: `2px solid ${getMetricColor(value)}` 
                    }}>
                      <div style={{ 
                        width: '22px', 
                        height: '22px', 
                        borderRadius: '50%', 
                        background: getMetricColor(value),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#000',
                        fontSize: '11px',
                        fontWeight: '900',
                        flexShrink: 0
                      }}>
                        {METRIC_ICONS[key]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '600' }}>{METRIC_LABELS[key]}</div>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: getMetricColor(value), lineHeight: 1 }}>{Math.round(value)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trends Tab */}
            {activeTab === 'trends' && metricHistory.length > 1 && (
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                <IndividualTrendCharts history={metricHistory} />
              </div>
            )}

            {activeTab === 'trends' && metricHistory.length <= 1 && (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b', borderRadius: '8px', border: '1px solid #475569', padding: '20px' }}>
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>Trends will appear after Round 1</div>
                </div>
              </div>
            )}

            {/* Investments Section - Only show on metrics tab */}
            {activeTab === 'metrics' && (
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                {!outcome && investments.length > 0 && (
                  <div style={{ background: '#1e293b', padding: '8px', borderRadius: '6px', marginBottom: '6px', border: '1px solid #475569' }}>
                    <h3 style={{ fontSize: '10px', marginBottom: '6px', color: '#f1f5f9', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      RESOURCE INVESTMENTS
                    </h3>
                    {investments.map((decision: any) => (
                      <div key={decision.id} style={{ marginBottom: '6px' }}>
                        <div style={{ fontSize: '9px', marginBottom: '4px', color: '#cbd5e1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{decision.prompt}</div>
                        <BudgetAllocation
                          categories={decision.budgetAllocation.categories}
                          totalBudget={decision.budgetAllocation.totalBudget}
                          minPerCategory={decision.budgetAllocation.minPerCategory}
                          onAllocationChange={(allocation) => handleBudgetAllocation(decision.id, allocation)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Column 2: Scenario Questions (45%) */}
          <div style={{ flex: '0 0 47%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
              {/* Event */}
              {activeEvent && !outcome && (
                <EventDisplay event={activeEvent} />
              )}

              {/* Scenario Questions */}
              {!outcome && questions.length > 0 && (
                <div style={{ background: '#1e293b', padding: '22px', borderRadius: '10px', marginBottom: '12px', border: '1px solid #334155' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '6px', color: 'white', fontWeight: '700' }}>{gameState.scenario.title}</h2>
                    <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>{gameState.scenario.scenarioText}</p>
                  </div>

                  {questions.map((decision: any, idx: number) => (
                    <div key={decision.id} style={{ marginBottom: '25px' }}>
                      <h3 style={{ fontSize: '13px', marginBottom: '12px', color: '#cbd5e1', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <span style={{ color: '#6366f1', marginRight: '6px' }}>Q{idx + 1}.</span>
                        {decision.prompt}
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {decision.options.map((option: any) => (
                          <label
                            key={option.id}
                            style={{
                              padding: '14px 16px',
                              border: decisions[decision.id] === option.id ? '2px solid #6366f1' : '1px solid #334155',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              background: decisions[decision.id] === option.id ? '#1e1b4b' : '#0f172a',
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              color: 'white',
                              transition: 'all 0.2s',
                              boxShadow: decisions[decision.id] === option.id ? '0 0 0 3px rgba(99, 102, 241, 0.2)' : 'none'
                            }}
                          >
                            <input
                              type="radio"
                              name={decision.id}
                              checked={decisions[decision.id] === option.id}
                              onChange={() => handleSelectOption(decision.id, option.id)}
                              style={{ marginRight: '12px', width: '16px', height: '16px', accentColor: '#6366f1' }}
                            />
                            <span><strong style={{ color: '#818cf8', fontSize: '15px' }}>{option.id}.</strong> <span style={{ color: '#e2e8f0' }}>{option.label}</span></span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Action Buttons */}
                  {role === 'player' && !gameState.allSubmitted && (
                    <button
                      onClick={handleSubmit}
                      style={{ 
                        padding: '12px 28px', 
                        background: 'linear-gradient(135deg, #10b981, #059669)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        fontSize: '14px', 
                        fontWeight: '700', 
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      SUBMIT DECISIONS
                    </button>
                  )}

                  {gameState.allSubmitted && role === 'facilitator' && (
                    <button
                      onClick={handleResolve}
                      style={{ 
                        padding: '12px 28px', 
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        fontSize: '14px', 
                        fontWeight: '700', 
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      → Resolve Round
                    </button>
                  )}

                  {gameState.allSubmitted && role === 'player' && (
                    <div style={{ padding: '12px', background: '#78350f', borderRadius: '8px', color: '#fcd34d', fontSize: '13px', textAlign: 'center', border: '1px solid #f59e0b' }}>
                      Waiting for facilitator...
                    </div>
                  )}
                </div>
              )}

              {/* Outcomes */}
              {outcome && (
                <div style={{ background: '#1e293b', padding: '22px', borderRadius: '10px', border: '1px solid #334155' }}>
                  <h2 style={{ fontSize: '20px', marginBottom: '15px', color: 'white', fontWeight: '700' }}>Round {gameState.currentRound - 1} Results</h2>
                  
                  {outcome.event && <EventDisplay event={outcome.event} />}
                  
                  <p style={{ marginBottom: '15px', color: '#94a3b8', fontSize: '13px' }}>{outcome.summary}</p>
                  
                  <h3 style={{ fontSize: '13px', marginBottom: '10px', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '1px' }}>Outcomes:</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                    {outcome.outcomes.map((text: string, i: number) => (
                      <div key={i} style={{ padding: '10px', background: '#0f172a', borderLeft: '3px solid #6366f1', borderRadius: '4px', fontSize: '13px', color: '#e2e8f0' }}>
                        {text}
                      </div>
                    ))}
                  </div>

                  {!outcome.gameEnded && (
                    <div style={{ padding: '12px', background: '#1e40af', borderRadius: '6px', color: '#93c5fd', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>
                      Continuing to Round {outcome.nextRound}...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Column 3: News Feed (25%) */}
          <div style={{ flex: '0 0 25%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ background: '#1e293b', padding: '18px', borderRadius: '10px', height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #334155' }}>
              <h3 style={{ fontSize: '12px', marginBottom: '12px', color: 'white', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                LIVE FEED
              </h3>
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                {newsFeed.slice().reverse().map((item: any) => (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px',
                      marginBottom: '10px',
                      borderLeft: `3px solid ${item.sentiment === 'positive' ? '#10b981' : item.sentiment === 'negative' ? '#ef4444' : '#64748b'}`,
                      background: item.sentiment === 'positive' ? '#064e3b' : item.sentiment === 'negative' ? '#7f1d1d' : '#0f172a',
                      borderRadius: '6px',
                      fontSize: '12px',
                      border: '1px solid #334155'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: item.sentiment === 'positive' ? '#10b981' : item.sentiment === 'negative' ? '#ef4444' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '900',
                        flexShrink: 0
                      }}>
                        {item.type === 'employee' ? 'E' : item.type === 'department' ? 'D' : item.type === 'external' ? 'X' : item.type === 'rumor' ? 'R' : 'N'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#e2e8f0', lineHeight: '1.5', marginBottom: '6px' }}>{item.text}</div>
                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {item.type} • {new Date(item.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Ended */}
      {gameState.gameEnded && outcome?.finalScore && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#1e293b', padding: '50px', borderRadius: '16px', textAlign: 'center', maxWidth: '900px', width: '100%', border: '2px solid #6366f1', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '25px', color: 'white', fontWeight: '700' }}>TRANSFORMATION COMPLETE</h2>
            <div style={{ fontSize: '72px', fontWeight: '900', color: '#6366f1', marginBottom: '15px', textShadow: '0 0 30px rgba(99, 102, 241, 0.5)' }}>
              {outcome.finalScore.score}
            </div>
            <div style={{ fontSize: '24px', color: '#cbd5e1', marginBottom: '35px', fontWeight: '600' }}>
              {outcome.finalScore.tier}
            </div>
            
            {metricHistory.length > 1 && (
              <div style={{ marginBottom: '35px' }}>
                <IndividualTrendCharts history={metricHistory} />
              </div>
            )}

            <button
              onClick={() => window.location.href = '/'}
              style={{ 
                padding: '14px 40px', 
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '16px', 
                fontWeight: '700', 
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Start New Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
