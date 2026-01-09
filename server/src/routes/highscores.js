import { Router } from 'express';
import { getOne, getAll } from '../database/init.js';

const router = Router();

// Get today's highscores
router.get('/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const highscores = getAll(`
    SELECT h.id, h.score, h.achieved_at, u.id as user_id, u.initials,
           CASE WHEN u.pin_code IS NULL THEN 1 ELSE 0 END as is_guest,
           g.name as game_name, g.slug as game_slug
    FROM highscores h
    JOIN users u ON h.user_id = u.id
    JOIN games g ON h.game_id = g.id
    WHERE date(h.achieved_at) = ?
    ORDER BY h.score DESC
    LIMIT 20
  `, [today]);

  res.json(highscores);
});

// Get this week's highscores
router.get('/week', (req, res) => {
  const highscores = getAll(`
    SELECT h.id, h.score, h.achieved_at, u.id as user_id, u.initials,
           CASE WHEN u.pin_code IS NULL THEN 1 ELSE 0 END as is_guest,
           g.name as game_name, g.slug as game_slug
    FROM highscores h
    JOIN users u ON h.user_id = u.id
    JOIN games g ON h.game_id = g.id
    WHERE h.achieved_at >= datetime('now', '-7 days')
    ORDER BY h.score DESC
    LIMIT 20
  `, []);

  res.json(highscores);
});

// Get last month's winner (highest score from previous month)
router.get('/last-month', (req, res) => {
  const highscores = getAll(`
    SELECT h.id, h.score, h.achieved_at, u.id as user_id, u.initials,
           CASE WHEN u.pin_code IS NULL THEN 1 ELSE 0 END as is_guest,
           g.name as game_name, g.slug as game_slug
    FROM highscores h
    JOIN users u ON h.user_id = u.id
    JOIN games g ON h.game_id = g.id
    WHERE h.achieved_at >= datetime('now', 'start of month', '-1 month')
      AND h.achieved_at < datetime('now', 'start of month')
    ORDER BY h.score DESC
    LIMIT 10
  `, []);

  res.json(highscores);
});

// Get highscores for a specific game
router.get('/game/:gameId', (req, res) => {
  const game = getOne('SELECT id FROM games WHERE id = ? OR slug = ?', [req.params.gameId, req.params.gameId]);

  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  const highscores = getAll(`
    SELECT h.id, h.score, h.achieved_at, u.id as user_id, u.initials,
           CASE WHEN u.pin_code IS NULL THEN 1 ELSE 0 END as is_guest
    FROM highscores h
    JOIN users u ON h.user_id = u.id
    WHERE h.game_id = ?
    ORDER BY h.score DESC
    LIMIT 50
  `, [game.id]);

  res.json(highscores);
});

// Get player profile (for highscore click)
router.get('/player/:userId', (req, res) => {
  const user = getOne(`
    SELECT id, initials, pin_code, created_at,
           CASE WHEN pin_code IS NULL THEN 1 ELSE 0 END as is_guest
    FROM users WHERE id = ?
  `, [req.params.userId]);

  if (!user) {
    return res.status(404).json({ error: 'Player not found' });
  }

  // Get stats for this player
  const stats = getOne(`
    SELECT
      COUNT(*) as total_games,
      MAX(score) as best_score,
      SUM(score) as total_score
    FROM highscores
    WHERE user_id = ?
  `, [req.params.userId]);

  res.json({
    initials: user.initials,
    is_guest: user.is_guest === 1,
    member_since: user.created_at,
    ...stats
  });
});

export default router;
