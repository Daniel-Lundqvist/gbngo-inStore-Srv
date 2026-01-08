import { Router } from 'express';
import { getDatabase } from '../database/init.js';

const router = Router();

// Get today's highscores
router.get('/today', (req, res) => {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];

  const highscores = db.prepare(`
    SELECT h.id, h.score, h.achieved_at, u.initials, g.name as game_name, g.slug as game_slug
    FROM highscores h
    JOIN users u ON h.user_id = u.id
    JOIN games g ON h.game_id = g.id
    WHERE date(h.achieved_at) = ?
    ORDER BY h.score DESC
    LIMIT 20
  `).all(today);

  res.json(highscores);
});

// Get this week's highscores
router.get('/week', (req, res) => {
  const db = getDatabase();

  const highscores = db.prepare(`
    SELECT h.id, h.score, h.achieved_at, u.initials, g.name as game_name, g.slug as game_slug
    FROM highscores h
    JOIN users u ON h.user_id = u.id
    JOIN games g ON h.game_id = g.id
    WHERE h.achieved_at >= datetime('now', '-7 days')
    ORDER BY h.score DESC
    LIMIT 20
  `).all();

  res.json(highscores);
});

// Get last month's winner (highest score from previous month)
router.get('/last-month', (req, res) => {
  const db = getDatabase();

  const highscores = db.prepare(`
    SELECT h.id, h.score, h.achieved_at, u.initials, g.name as game_name, g.slug as game_slug
    FROM highscores h
    JOIN users u ON h.user_id = u.id
    JOIN games g ON h.game_id = g.id
    WHERE h.achieved_at >= datetime('now', 'start of month', '-1 month')
      AND h.achieved_at < datetime('now', 'start of month')
    ORDER BY h.score DESC
    LIMIT 10
  `).all();

  res.json(highscores);
});

// Get highscores for a specific game
router.get('/game/:gameId', (req, res) => {
  const db = getDatabase();

  const game = db.prepare('SELECT id FROM games WHERE id = ? OR slug = ?')
    .get(req.params.gameId, req.params.gameId);

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const highscores = db.prepare(`
    SELECT h.id, h.score, h.achieved_at, u.initials
    FROM highscores h
    JOIN users u ON h.user_id = u.id
    WHERE h.game_id = ?
    ORDER BY h.score DESC
    LIMIT 50
  `).all(game.id);

  res.json(highscores);
});

export default router;
