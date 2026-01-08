// WebSocket handler for mobile controller connections

const gameSessions = new Map(); // sessionId -> { players: [], gameState }
const controllerSessions = new Map(); // socketId -> { sessionId, playerNumber }

export function setupWebSocket(io) {
  // Namespace for controller connections
  const controllerNs = io.of('/controller');

  controllerNs.on('connection', (socket) => {
    console.log('Controller connected:', socket.id);

    // Join a game session
    socket.on('join-session', ({ sessionId, playerNumber }) => {
      if (!gameSessions.has(sessionId)) {
        gameSessions.set(sessionId, { players: [], gameState: null });
      }

      const session = gameSessions.get(sessionId);
      session.players.push({
        socketId: socket.id,
        playerNumber: playerNumber || session.players.length + 1
      });

      controllerSessions.set(socket.id, {
        sessionId,
        playerNumber: playerNumber || session.players.length
      });

      socket.join(sessionId);
      socket.emit('joined', {
        sessionId,
        playerNumber: controllerSessions.get(socket.id).playerNumber,
        totalPlayers: session.players.length
      });

      // Notify the game screen
      io.of('/game').to(sessionId).emit('player-joined', {
        playerNumber: controllerSessions.get(socket.id).playerNumber,
        totalPlayers: session.players.length
      });

      console.log(`Player ${controllerSessions.get(socket.id).playerNumber} joined session ${sessionId}`);
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
        const { sessionId, playerNumber } = controllerSession;
        const session = gameSessions.get(sessionId);

        if (session) {
          session.players = session.players.filter(p => p.socketId !== socket.id);

          io.of('/game').to(sessionId).emit('player-disconnected', {
            playerNumber,
            totalPlayers: session.players.length
          });

          if (session.players.length === 0) {
            gameSessions.delete(sessionId);
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
