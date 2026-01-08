import { Router } from 'express';
import { getDatabase } from '../database/init.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Get all active games
router.get('/', (req, res) => {
  const db = getDatabase();
  const games = db.prepare('SELECT * FROM games WHERE is_active = 1 ORDER BY name').all();
  res.json(games);
});

// Get specific game
router.get('/:id', (req, res) => {
  const db = getDatabase();
  const game = db.prepare('SELECT * FROM games WHERE id = ? OR slug = ?')
    .get(req.params.id, req.params.id);

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  res.json(game);
});

// Start a game (consumes 1 ticket)
router.post('/:id/start', requireAuth, (req, res) => {
  const db = getDatabase();
  const user = req.session.user;

  // Check tickets
  let currentTickets = user.tickets_count || 0;

  if (user.is_returning_guest && typeof user.id === 'number') {
    const freshUser = db.prepare('SELECT tickets_count FROM users WHERE id = ?').get(user.id);
    currentTickets = freshUser?.tickets_count || 0;
  }

  if (currentTickets < 1) {
    return res.status(400).json({ error: 'No tickets available' });
  }

  const game = db.prepare('SELECT * FROM games WHERE (id = ? OR slug = ?) AND is_active = 1')
    .get(req.params.id, req.params.id);

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  // Deduct ticket
  if (user.is_returning_guest && typeof user.id === 'number') {
    db.prepare('UPDATE users SET tickets_count = tickets_count - 1 WHERE id = ?').run(user.id);
    req.session.user.tickets_count = currentTickets - 1;
  } else {
    req.session.user.tickets_count = currentTickets - 1;
  }

  // Create game session
  const userId = typeof user.id === 'number' ? user.id : null;
  let sessionId = null;

  if (userId) {
    const result = db.prepare(`
      INSERT INTO game_sessions (user_id, game_id)
      VALUES (?, ?)
    `).run(userId, game.id);
    sessionId = result.lastInsertRowid;
  }

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
  const db = getDatabase();
  const user = req.session.user;

  const game = db.prepare('SELECT * FROM games WHERE id = ? OR slug = ?')
    .get(req.params.id, req.params.id);

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  // Update game session if exists
  if (session_id) {
    db.prepare(`
      UPDATE game_sessions
      SET ended_at = CURRENT_TIMESTAMP, score = ?
      WHERE id = ?
    `).run(score, session_id);
  }

  // Record highscore if user is in database
  if (user.is_returning_guest && typeof user.id === 'number') {
    db.prepare(`
      INSERT INTO highscores (user_id, game_id, score)
      VALUES (?, ?, ?)
    `).run(user.id, game.id, score);
  } else if (typeof user.id === 'string' && user.id.startsWith('guest_')) {
    // For guests, we need to create a temporary user record for highscore
    // Actually, let's just skip highscore for pure guests, or use initials only
    // For MVP, we'll allow guest highscores by creating temp records
    const tempResult = db.prepare(`
      INSERT INTO users (initials, is_returning_guest)
      VALUES (?, 0)
    `).run(user.initials);

    db.prepare(`
      INSERT INTO highscores (user_id, game_id, score)
      VALUES (?, ?, ?)
    `).run(tempResult.lastInsertRowid, game.id, score);
  }

  res.json({
    success: true,
    score: score,
    game: game.name
  });
});

export default router;
