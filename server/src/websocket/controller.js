// WebSocket handler for mobile controller connections

const gameSessions = new Map(); // sessionId -> { players: [], gameState }
const controllerSessions = new Map(); // socketId -> { sessionId, playerNumber, reconnectToken }
const disconnectedPlayers = new Map(); // reconnectToken -> { sessionId, playerNumber, disconnectedAt, gameState }

// Grace period for reconnection (30 seconds)
const RECONNECT_GRACE_PERIOD = 30000;

// Generate a unique reconnection token
function generateReconnectToken() {
  return `rc_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
}

// Clean up expired disconnected players periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of disconnectedPlayers) {
    if (now - data.disconnectedAt > RECONNECT_GRACE_PERIOD) {
      disconnectedPlayers.delete(token);
      console.log(`Expired reconnection token: ${token}`);
    }
  }
}, 10000);

export function setupWebSocket(io) {
  // Namespace for controller connections
  const controllerNs = io.of('/controller');

  controllerNs.on('connection', (socket) => {
    console.log('Controller connected:', socket.id);

    // Attempt to reconnect with existing token
    socket.on('reconnect-session', ({ reconnectToken, sessionId }) => {
      const disconnectedData = disconnectedPlayers.get(reconnectToken);

      if (!disconnectedData) {
        socket.emit('reconnect-failed', { reason: 'Token expired or invalid' });
        return;
      }

      if (disconnectedData.sessionId !== sessionId) {
        socket.emit('reconnect-failed', { reason: 'Session mismatch' });
        return;
      }

      const session = gameSessions.get(sessionId);
      if (!session) {
        socket.emit('reconnect-failed', { reason: 'Session no longer exists' });
        disconnectedPlayers.delete(reconnectToken);
        return;
      }

      // Restore the player to the session
      const { playerNumber, gameState } = disconnectedData;

      session.players.push({
        socketId: socket.id,
        playerNumber,
        reconnectToken
      });

      controllerSessions.set(socket.id, {
        sessionId,
        playerNumber,
        reconnectToken
      });

      socket.join(sessionId);

      // Remove from disconnected players
      disconnectedPlayers.delete(reconnectToken);

      // Notify the controller of successful reconnection with game state
      socket.emit('reconnected', {
        sessionId,
        playerNumber,
        totalPlayers: session.players.length,
        gameState: session.gameState
      });

      // Notify the game screen
      io.of('/game').to(sessionId).emit('player-reconnected', {
        playerNumber,
        totalPlayers: session.players.length
      });

      console.log(`Player ${playerNumber} reconnected to session ${sessionId}`);
    });

    // Join a game session
    socket.on('join-session', ({ sessionId, playerNumber }) => {
      if (!gameSessions.has(sessionId)) {
        gameSessions.set(sessionId, { players: [], gameState: null });
      }

      const session = gameSessions.get(sessionId);
      const assignedPlayerNumber = playerNumber || session.players.length + 1;
      const reconnectToken = generateReconnectToken();

      session.players.push({
        socketId: socket.id,
        playerNumber: assignedPlayerNumber,
        reconnectToken
      });

      controllerSessions.set(socket.id, {
        sessionId,
        playerNumber: assignedPlayerNumber,
        reconnectToken
      });

      socket.join(sessionId);
      socket.emit('joined', {
        sessionId,
        playerNumber: assignedPlayerNumber,
        totalPlayers: session.players.length,
        reconnectToken // Send token to client for storage
      });

      // Notify the game screen
      io.of('/game').to(sessionId).emit('player-joined', {
        playerNumber: assignedPlayerNumber,
        totalPlayers: session.players.length
      });

      console.log(`Player ${assignedPlayerNumber} joined session ${sessionId}`);
    });

    // Controller input events
    socket.on('input', (data) => {
      const controllerSession = controllerSessions.get(socket.id);
      if (!controllerSession) return;

      const { sessionId, playerNumber } = controllerSession;

      // Forward input to game screen
      io.of('/game').to(sessionId).emit('controller-input', {
        playerNumber,
        ...data
      });
    });

    // D-pad specific events
    socket.on('dpad', ({ direction, pressed }) => {
      const controllerSession = controllerSessions.get(socket.id);
      if (!controllerSession) return;

      const { sessionId, playerNumber } = controllerSession;

      io.of('/game').to(sessionId).emit('controller-dpad', {
        playerNumber,
        direction, // 'up', 'down', 'left', 'right'
        pressed    // true for press, false for release
      });
    });

    // Button events (A, B, START, SELECT)
    socket.on('button', ({ button, pressed }) => {
      const controllerSession = controllerSessions.get(socket.id);
      if (!controllerSession) return;

      const { sessionId, playerNumber } = controllerSession;

      io.of('/game').to(sessionId).emit('controller-button', {
        playerNumber,
        button, // 'a', 'b', 'start', 'select'
        pressed
      });
    });

    socket.on('disconnect', () => {
      const controllerSession = controllerSessions.get(socket.id);
      if (controllerSession) {
        const { sessionId, playerNumber, reconnectToken } = controllerSession;
        const session = gameSessions.get(sessionId);

        if (session) {
          // Store disconnected player data for potential reconnection
          if (reconnectToken && session.gameState) {
            disconnectedPlayers.set(reconnectToken, {
              sessionId,
              playerNumber,
              disconnectedAt: Date.now(),
              gameState: { ...session.gameState }
            });
            console.log(`Stored reconnection data for player ${playerNumber}, token: ${reconnectToken}`);
          }

          session.players = session.players.filter(p => p.socketId !== socket.id);

          io.of('/game').to(sessionId).emit('player-disconnected', {
            playerNumber,
            totalPlayers: session.players.length,
            canReconnect: !!reconnectToken
          });

          // Only delete session if no players AND no pending reconnections
          if (session.players.length === 0) {
            // Check if any disconnected players belong to this session
            let hasDisconnectedPlayers = false;
            for (const [, data] of disconnectedPlayers) {
              if (data.sessionId === sessionId) {
                hasDisconnectedPlayers = true;
                break;
              }
            }
            if (!hasDisconnectedPlayers) {
              gameSessions.delete(sessionId);
            }
          }
        }

        controllerSessions.delete(socket.id);
      }
      console.log('Controller disconnected:', socket.id);
    });
  });

  // Namespace for game screen connections
  const gameNs = io.of('/game');

  gameNs.on('connection', (socket) => {
    console.log('Game screen connected:', socket.id);

    // Create a new game session
    socket.on('create-session', ({ gameId }) => {
      const sessionId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      gameSessions.set(sessionId, {
        players: [],
        gameState: { gameId, status: 'waiting' },
        gameSocketId: socket.id
      });

      socket.join(sessionId);
      socket.emit('session-created', { sessionId });

      console.log(`Game session created: ${sessionId}`);
    });

    // Start the game
    socket.on('start-game', ({ sessionId }) => {
      const session = gameSessions.get(sessionId);
      if (!session) return;

      session.gameState.status = 'playing';

      // Notify all controllers
      controllerNs.to(sessionId).emit('game-started', {
        gameId: session.gameState.gameId
      });
    });

    // End the game
    socket.on('end-game', ({ sessionId, results }) => {
      const session = gameSessions.get(sessionId);
      if (!session) return;

      session.gameState.status = 'ended';

      // Notify all controllers
      controllerNs.to(sessionId).emit('game-ended', { results });
    });

    // Send game state updates
    socket.on('game-state', ({ sessionId, state }) => {
      const session = gameSessions.get(sessionId);
      if (!session) return;

      session.gameState = { ...session.gameState, ...state };

      // Optionally forward to controllers if they need state info
      controllerNs.to(sessionId).emit('game-state-update', state);
    });

    socket.on('disconnect', () => {
      // Clean up any sessions where this was the game screen
      for (const [sessionId, session] of gameSessions) {
        if (session.gameSocketId === socket.id) {
          // Notify controllers
          controllerNs.to(sessionId).emit('game-disconnected');
          gameSessions.delete(sessionId);
        }
      }
      console.log('Game screen disconnected:', socket.id);
    });
  });

  console.log('WebSocket handlers initialized');
}
