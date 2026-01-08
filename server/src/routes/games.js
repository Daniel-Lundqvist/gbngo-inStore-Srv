import { Router } from 'express';
import { getOne, getAll, runQuery, getLastInsertRowId, saveDatabase } from '../database/init.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Get all active games
router.get('/', (req, res) => {
  const games = getAll('SELECT * FROM games WHERE is_active = 1 ORDER BY name', []);
  res.json(games);
});

// Get specific game
router.get('/:id', (req, res) => {
  const game = getOne('SELECT * FROM games WHERE id = ? OR slug = ?', [req.params.id, req.params.id]);

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  res.json(game);
});

// Start a game (consumes 1 ticket)
router.post('/:id/start', requireAuth, (req, res) => {
  const user = req.session.user;

  // Check tickets
  let currentTickets = user.tickets_count || 0;

  if (user.is_returning_guest && typeof user.id === 'number') {
    const freshUser = getOne('SELECT tickets_count FROM users WHERE id = ?', [user.id]);
    currentTickets = freshUser?.tickets_count || 0;
  }

  if (currentTickets < 1) {
    return res.status(400).json({ error: 'No tickets available' });
  }

  const game = getOne('SELECT * FROM games WHERE (id = ? OR slug = ?) AND is_active = 1', [req.params.id, req.params.id]);

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  // Deduct ticket
  if (user.is_returning_guest && typeof user.id === 'number') {
    runQuery('UPDATE users SET tickets_count = tickets_count - 1 WHERE id = ?', [user.id]);
    req.session.user.tickets_count = currentTickets - 1;
  } else {
    req.session.user.tickets_count = currentTickets - 1;
  }

  // Create game session
  const userId = typeof user.id === 'number' ? user.id : null;
  let sessionId = null;

  if (userId) {
    runQuery(
      `INSERT INTO game_sessions (user_id, game_id) VALUES (?, ?)`,
      [userId, game.id]
    );
    sessionId = getLastInsertRowId();
  }
  saveDatabase();

  res.json({
    success: true,
    game: game,
    session_id: sessionId,
    tickets_remaining: req.session.user.tickets_count
  });
});

// End a game (report score)
router.post('/:id/end', requireAuth, (req, res) => {
  const { session_id, score } = req.body;
  const user = req.session.user;

  const game = getOne('SELECT * FROM games WHERE id = ? OR slug = ?', [req.params.id, req.params.id]);

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  // Update game session if exists
  if (session_id) {
    runQuery(
      `UPDATE game_sessions SET ended_at = CURRENT_TIMESTAMP, score = ? WHERE id = ?`,
      [score, session_id]
    );
  }

  // Record highscore if user is in database
  if (user.is_returning_guest && typeof user.id === 'number') {
    runQuery(
      `INSERT INTO highscores (user_id, game_id, score) VALUES (?, ?, ?)`,
      [user.id, game.id, score]
    );
  } else if (typeof user.id === 'string' && user.id.startsWith('guest_')) {
    // For guests, we need to create a temporary user record for highscore
    runQuery(
      `INSERT INTO users (initials, is_returning_guest) VALUES (?, 0)`,
      [user.initials]
    );
    const tempUserId = getLastInsertRowId();

    runQuery(
      `INSERT INTO highscores (user_id, game_id, score) VALUES (?, ?, ?)`,
      [tempUserId, game.id, score]
    );
  }
  saveDatabase();

  res.json({
    success: true,
    score: score,
    game: game.name
  });
});

export default router;
