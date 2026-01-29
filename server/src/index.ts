import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { nanoid } from 'nanoid';
import { Game, GameState, TeamDecisions, METRIC_LABELS, RandomEvent } from './types.js';
import { scenarios } from './scenarios.js';
import { processRound, calculateScore } from './engine.js';
import { generateNewsForRound, generateStartingNews } from './newsGenerator.js';
import { shouldTriggerEvent, selectRandomEvent } from './events.js';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// Parse CORS origins (split comma-separated string into array)
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5173'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// In-memory game storage
const games = new Map<string, Game>();

// Initial game state
const INITIAL_STATE: GameState = {
  metrics: { BP: 50, CA: 30, EE: 60, TR: 55, RS: 40, LC: 60, MO: 35 },
  bridgesStage: 'Ending',
  changeCurveState: 'Shock'
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', games: games.size });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // CREATE GAME (Facilitator)
  socket.on('create-game', (callback) => {
    const gameCode = nanoid(6).toUpperCase();
    
    const game: Game = {
      gameCode,
      facilitatorId: socket.id,
      players: new Map(),
      currentRound: 1,
      state: JSON.parse(JSON.stringify(INITIAL_STATE)),
      teamDecisions: {},
      allSubmitted: false,
      gameStarted: false,
      gameEnded: false,
      log: [],
      newsFeed: generateStartingNews(),
      metricHistory: [{ round: 0, metrics: JSON.parse(JSON.stringify(INITIAL_STATE.metrics)) }],
      activeEvent: null,
      totalBudget: 2000000, // £2M total transformation budget
      budgetSpent: 0
    };
    
    games.set(gameCode, game);
    socket.join(gameCode);
    
    console.log(`Game created: ${gameCode}`);
    callback({ success: true, gameCode });
  });
  
  // JOIN ROOM (Facilitator rejoining)
  socket.on('join', (gameCode) => {
    const game = games.get(gameCode);
    if (game) {
      // Update facilitator ID (socket may have changed)
      game.facilitatorId = socket.id;
      socket.join(gameCode);
      console.log(`Facilitator rejoined game ${gameCode} with socket ${socket.id}`);
    }
  });
  
  // JOIN GAME (Player)
  socket.on('join-game', ({ gameCode, playerName }, callback) => {
    const game = games.get(gameCode);
    
    if (!game) {
      callback({ success: false, error: 'Game not found' });
      return;
    }
    
    if (game.gameStarted) {
      callback({ success: false, error: 'Game already started' });
      return;
    }
    
    game.players.set(socket.id, { id: socket.id, name: playerName });
    socket.join(gameCode);
    
    // Notify all players
    io.to(gameCode).emit('player-joined', {
      players: Array.from(game.players.values())
    });
    
    console.log(`${playerName} joined game ${gameCode}`);
    callback({ success: true, players: Array.from(game.players.values()) });
  });
  
  // START GAME (Facilitator)
  socket.on('start-game', ({ gameCode }, callback) => {
    const game = games.get(gameCode);
    
    if (!game) {
      callback({ success: false, error: 'Game not found' });
      return;
    }
    
    if (socket.id !== game.facilitatorId) {
      callback({ success: false, error: 'Only facilitator can start' });
      return;
    }
    
    if (game.players.size === 0) {
      callback({ success: false, error: 'Need at least one player' });
      return;
    }
    
    game.gameStarted = true;
    
    const scenario = scenarios.find(s => s.roundNumber === 1);
    
    io.to(gameCode).emit('game-started', {
      currentRound: 1,
      scenario,
      state: game.state,
      newsFeed: game.newsFeed,
      metricHistory: game.metricHistory
    });
    
    console.log(`Game ${gameCode} started`);
    callback({ success: true });
  });
  
  // SUBMIT DECISIONS (Player)
  socket.on('submit-decisions', ({ gameCode, decisions }, callback) => {
    const game = games.get(gameCode);
    
    if (!game) {
      callback({ success: false, error: 'Game not found' });
      return;
    }
    
    if (!game.gameStarted || game.gameEnded) {
      callback({ success: false, error: 'Game not active' });
      return;
    }
    
    // Store player's decisions (simple version - all players must agree)
    game.teamDecisions = decisions;
    game.allSubmitted = true;
    
    // Notify all that decisions are in
    io.to(gameCode).emit('all-submitted', { 
      message: 'Decisions submitted! Waiting for facilitator to resolve.'
    });
    
    console.log(`Decisions submitted for ${gameCode}`);
    callback({ success: true });
  });
  
  // RESOLVE ROUND (Facilitator)
  socket.on('resolve-round', ({ gameCode }, callback) => {
    const game = games.get(gameCode);
    
    if (!game) {
      callback({ success: false, error: 'Game not found' });
      return;
    }
    
    if (socket.id !== game.facilitatorId) {
      callback({ success: false, error: 'Only facilitator can resolve' });
      return;
    }
    
    if (!game.allSubmitted) {
      callback({ success: false, error: 'Waiting for decisions' });
      return;
    }
    
    const scenario = scenarios.find(s => s.roundNumber === game.currentRound);
    if (!scenario) {
      callback({ success: false, error: 'Scenario not found' });
      return;
    }
    
    // Process round
    const result = processRound(game.state, scenario, game.teamDecisions);
    
    game.state = result.newState;
    
    // Add to metric history
    game.metricHistory.push({ 
      round: game.currentRound, 
      metrics: JSON.parse(JSON.stringify(result.newState.metrics)) 
    });
    
    // Generate news based on round results
    const roundNews = generateNewsForRound(
      game.currentRound,
      result.newState.metrics,
      result.newState,
      result.chosenThemes
    );
    game.newsFeed = [...game.newsFeed, ...roundNews].slice(-15); // Keep last 15 items
    
    // Check for random event
    let triggeredEvent: RandomEvent | null = null;
    if (shouldTriggerEvent(game.currentRound, result.newState.metrics)) {
      const event = selectRandomEvent(result.newState.metrics, game.currentRound);
      triggeredEvent = event;
      game.activeEvent = event;
      
      // Apply event impact immediately
      Object.keys(event.impact).forEach((key) => {
        const metricKey = key as keyof typeof result.newState.metrics;
        game.state.metrics[metricKey] = Math.max(0, Math.min(100, 
          game.state.metrics[metricKey] + event.impact[metricKey]
        ));
      });
      
      // Add event to news feed
      game.newsFeed.push({
        id: `event_${game.currentRound}`,
        timestamp: Date.now(),
        type: 'event',
        text: `🚨 ${event.title}: ${event.description}`,
        sentiment: event.type === 'positive' ? 'positive' : event.type === 'negative' ? 'negative' : 'neutral'
      });
    }
    
    game.log.push({
      round: game.currentRound,
      decisions: game.teamDecisions,
      outcomes: result.outcomes,
      stateBefore: game.state,
      stateAfter: result.newState,
      event: triggeredEvent
    });
    
    // Check if game ended
    const isLastRound = game.currentRound >= 6;
    let finalScore = null;
    
    if (isLastRound) {
      game.gameEnded = true;
      finalScore = calculateScore(game.state.metrics);
    } else {
      game.currentRound++;
      game.teamDecisions = {};
      game.allSubmitted = false;
      game.activeEvent = null;
    }
    
    // Send results to all players
    io.to(gameCode).emit('round-resolved', {
      newState: game.state,
      outcomes: result.outcomes,
      summary: result.summary,
      nextRound: isLastRound ? null : game.currentRound,
      gameEnded: isLastRound,
      finalScore,
      newsFeed: game.newsFeed,
      metricHistory: game.metricHistory,
      event: triggeredEvent
    });
    
    // If not ended, send next scenario
    if (!isLastRound) {
      const nextScenario = scenarios.find(s => s.roundNumber === game.currentRound);
      io.to(gameCode).emit('next-round', {
        currentRound: game.currentRound,
        scenario: nextScenario,
        state: game.state,
        newsFeed: game.newsFeed,
        metricHistory: game.metricHistory
      });
    }
    
    console.log(`Round ${scenario.roundNumber} resolved for ${gameCode}`);
    callback({ success: true });
  });
  
  // GET GAME STATE
  socket.on('get-game-state', ({ gameCode }, callback) => {
    const game = games.get(gameCode);
    
    if (!game) {
      callback({ success: false, error: 'Game not found' });
      return;
    }
    
    const scenario = scenarios.find(s => s.roundNumber === game.currentRound);
    
    callback({
      success: true,
      game: {
        gameCode: game.gameCode,
        players: Array.from(game.players.values()),
        currentRound: game.currentRound,
        state: game.state,
        gameStarted: game.gameStarted,
        gameEnded: game.gameEnded,
        allSubmitted: game.allSubmitted,
        scenario,
        newsFeed: game.newsFeed,
        metricHistory: game.metricHistory,
        activeEvent: game.activeEvent
      }
    });
  });
  
  // HEARTBEAT - Keep connection alive
  socket.on('heartbeat', ({ gameCode }) => {
    // Simple acknowledgment to keep connection alive
    socket.emit('heartbeat-ack');
  });

  // DISCONNECT
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Remove player from any games
    games.forEach((game, gameCode) => {
      if (game.players.has(socket.id)) {
        game.players.delete(socket.id);
        io.to(gameCode).emit('player-left', {
          players: Array.from(game.players.values())
        });
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Loaded ${scenarios.length} scenarios`);
});
