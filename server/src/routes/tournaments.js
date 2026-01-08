// Last restart: 2026-01-08T23:20:54.164Z
import express from 'express';
import { runQuery, getOne, getAll, getLastInsertRowId, saveDatabase } from '../database/init.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all tournaments (with optional status filter)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT t.*, g.name as game_name, g.slug as game_slug,
        (SELECT COUNT(*) FROM tournament_players tp WHERE tp.tournament_id = t.id) as player_count
      FROM tournaments t
      LEFT JOIN games g ON t.game_id = g.id
    `;

    if (status) {
      sql += ` WHERE t.status = ?`;
      const tournaments = getAll(sql, [status]);
      res.json(tournaments);
    } else {
      const tournaments = getAll(sql);
      res.json(tournaments);
    }
  } catch (error) {
    console.error('Failed to get tournaments:', error);
    res.status(500).json({ error: 'Failed to get tournaments' });
  }
});

// Get a specific tournament with full details
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get tournament
    const tournament = getOne(`
      SELECT t.*, g.name as game_name, g.slug as game_slug
      FROM tournaments t
      LEFT JOIN games g ON t.game_id = g.id
      WHERE t.id = ?
    `, [id]);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Get players with their user info
    const players = getAll(`
      SELECT tp.*, u.initials
      FROM tournament_players tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.tournament_id = ?
      ORDER BY tp.id
    `, [id]);

    // Get matches
    const matches = getAll(`
      SELECT * FROM tournament_matches
      WHERE tournament_id = ?
      ORDER BY round, match_order
    `, [id]);

    res.json({
      ...tournament,
      players,
      matches
    });
  } catch (error) {
    console.error('Failed to get tournament:', error);
    res.status(500).json({ error: 'Failed to get tournament' });
  }
});

// Create a new tournament
router.post('/', requireAuth, async (req, res) => {
  try {
    const { game_id, player_initials } = req.body;

    // Validate input
    if (!game_id) {
      return res.status(400).json({ error: 'Game ID is required' });
    }

    if (!player_initials || !Array.isArray(player_initials) || player_initials.length < 3 || player_initials.length > 4) {
      return res.status(400).json({ error: 'Tournament requires 3-4 players' });
    }

    // Verify game exists
    const game = getOne('SELECT * FROM games WHERE id = ?', [game_id]);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Create temporary users for tournament players (using initials only)
    const playerIds = [];
    for (const initials of player_initials) {
      // Check if user with these initials exists (as guest)
      let user = getOne('SELECT id FROM users WHERE initials = ? AND pin_code IS NULL', [initials.toUpperCase()]);

      if (!user) {
        // Create guest user
        runQuery(
          'INSERT INTO users (initials, is_returning_guest) VALUES (?, 0)',
          [initials.toUpperCase()]
        );
        const userId = getLastInsertRowId();
        playerIds.push(userId);
      } else {
        playerIds.push(user.id);
      }
    }

    // Create tournament
    runQuery(
      'INSERT INTO tournaments (game_id, status, current_round) VALUES (?, ?, ?)',
      [game_id, 'active', 1]
    );
    const tournamentId = getLastInsertRowId();

    // Add players to tournament
    for (const userId of playerIds) {
      runQuery(
        'INSERT INTO tournament_players (tournament_id, user_id) VALUES (?, ?)',
        [tournamentId, userId]
      );
    }

    // Create matches for round 1
    // Shuffle players for random matchups
    const shuffledPlayerIds = [...playerIds].sort(() => Math.random() - 0.5);

    if (shuffledPlayerIds.length === 4) {
      // 4 players: 2 semi-final matches, then 1 final
      runQuery(
        'INSERT INTO tournament_matches (tournament_id, round, match_order, player1_id, player2_id, status) VALUES (?, ?, ?, ?, ?, ?)',
        [tournamentId, 1, 1, shuffledPlayerIds[0], shuffledPlayerIds[1], 'pending']
      );
      runQuery(
        'INSERT INTO tournament_matches (tournament_id, round, match_order, player1_id, player2_id, status) VALUES (?, ?, ?, ?, ?, ?)',
        [tournamentId, 1, 2, shuffledPlayerIds[2], shuffledPlayerIds[3], 'pending']
      );
      // Final match (players TBD)
      runQuery(
        'INSERT INTO tournament_matches (tournament_id, round, match_order, status) VALUES (?, ?, ?, ?)',
        [tournamentId, 2, 1, 'pending']
      );
    } else if (shuffledPlayerIds.length === 3) {
      // 3 players: 1 semi-final (2 vs 3), player 1 gets bye to final
      runQuery(
        'INSERT INTO tournament_matches (tournament_id, round, match_order, player1_id, player2_id, status) VALUES (?, ?, ?, ?, ?, ?)',
        [tournamentId, 1, 1, shuffledPlayerIds[1], shuffledPlayerIds[2], 'pending']
      );
      // Final match (player 1 has bye, waits for winner)
      runQuery(
        'INSERT INTO tournament_matches (tournament_id, round, match_order, player1_id, status) VALUES (?, ?, ?, ?, ?)',
        [tournamentId, 2, 1, shuffledPlayerIds[0], 'pending']
      );
    }

    saveDatabase();

    // Return created tournament with details
    const tournament = getOne('SELECT * FROM tournaments WHERE id = ?', [tournamentId]);
    const players = getAll(`
      SELECT tp.*, u.initials
      FROM tournament_players tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.tournament_id = ?
    `, [tournamentId]);
    const matches = getAll('SELECT * FROM tournament_matches WHERE tournament_id = ? ORDER BY round, match_order', [tournamentId]);

    res.status(201).json({
      ...tournament,
      players,
      matches
    });
  } catch (error) {
    console.error('Failed to create tournament:', error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

// Report match result
router.post('/:id/result', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { match_id, winner_id, player1_score, player2_score } = req.body;

    // Validate input
    if (!match_id || !winner_id) {
      return res.status(400).json({ error: 'Match ID and winner ID are required' });
    }

    // Get tournament
    const tournament = getOne('SELECT * FROM tournaments WHERE id = ?', [id]);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.status === 'completed') {
      return res.status(400).json({ error: 'Tournament is already completed' });
    }

    // Get match
    const match = getOne('SELECT * FROM tournament_matches WHERE id = ? AND tournament_id = ?', [match_id, id]);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.status === 'completed') {
      return res.status(400).json({ error: 'Match is already completed' });
    }

    // Validate winner is in the match
    if (winner_id !== match.player1_id && winner_id !== match.player2_id) {
      return res.status(400).json({ error: 'Winner must be one of the match players' });
    }

    // Update match result
    const loserId = winner_id === match.player1_id ? match.player2_id : match.player1_id;
    runQuery(
      'UPDATE tournament_matches SET winner_id = ?, player1_score = ?, player2_score = ?, status = ? WHERE id = ?',
      [winner_id, player1_score || 0, player2_score || 0, 'completed', match_id]
    );

    // Mark loser as eliminated
    runQuery(
      'UPDATE tournament_players SET eliminated_at = CURRENT_TIMESTAMP WHERE tournament_id = ? AND user_id = ?',
      [id, loserId]
    );

    // Check if there's a next round match to update
    const nextRoundMatch = getOne(
      'SELECT * FROM tournament_matches WHERE tournament_id = ? AND round = ? AND status = ?',
      [id, match.round + 1, 'pending']
    );

    if (nextRoundMatch) {
      // Add winner to next match
      if (!nextRoundMatch.player1_id) {
        runQuery('UPDATE tournament_matches SET player1_id = ? WHERE id = ?', [winner_id, nextRoundMatch.id]);
      } else if (!nextRoundMatch.player2_id) {
        runQuery('UPDATE tournament_matches SET player2_id = ? WHERE id = ?', [winner_id, nextRoundMatch.id]);
      }
    }

    // Check if tournament is complete (final match played)
    const allMatches = getAll('SELECT * FROM tournament_matches WHERE tournament_id = ?', [id]);
    const allCompleted = allMatches.every(m => m.status === 'completed');

    if (allCompleted) {
      // Tournament is complete - get the final winner
      const finalMatch = getAll(
        'SELECT * FROM tournament_matches WHERE tournament_id = ? ORDER BY round DESC, match_order DESC LIMIT 1',
        [id]
      )[0];

      runQuery('UPDATE tournaments SET status = ?, winner_id = ? WHERE id = ?', ['completed', finalMatch.winner_id, id]);

      // Update winner's position
      runQuery(
        'UPDATE tournament_players SET position = 1 WHERE tournament_id = ? AND user_id = ?',
        [id, finalMatch.winner_id]
      );
    }

    saveDatabase();

    // Return updated tournament
    const updatedTournament = getOne('SELECT * FROM tournaments WHERE id = ?', [id]);
    const players = getAll(`
      SELECT tp.*, u.initials
      FROM tournament_players tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.tournament_id = ?
    `, [id]);
    const matches = getAll('SELECT * FROM tournament_matches WHERE tournament_id = ? ORDER BY round, match_order', [id]);

    res.json({
      ...updatedTournament,
      players,
      matches
    });
  } catch (error) {
    console.error('Failed to report match result:', error);
    res.status(500).json({ error: 'Failed to report match result' });
  }
});

// Delete/cancel a tournament
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const tournament = getOne('SELECT * FROM tournaments WHERE id = ?', [id]);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Delete matches first
    runQuery('DELETE FROM tournament_matches WHERE tournament_id = ?', [id]);

    // Delete players
    runQuery('DELETE FROM tournament_players WHERE tournament_id = ?', [id]);

    // Delete tournament
    runQuery('DELETE FROM tournaments WHERE id = ?', [id]);

    saveDatabase();

    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Failed to delete tournament:', error);
    res.status(500).json({ error: 'Failed to delete tournament' });
  }
});

export default router;
