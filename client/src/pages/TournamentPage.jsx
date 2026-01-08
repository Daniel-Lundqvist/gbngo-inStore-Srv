import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './TournamentPage.module.css';

export default function TournamentPage() {
  const { tournamentId } = useParams();
  const [searchParams] = useSearchParams();
  const gameSlug = searchParams.get('game');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  // For creating new tournament
  const [playerInitials, setPlayerInitials] = useState(['', '', '', '']);
  const [gameId, setGameId] = useState(null);
  const [games, setGames] = useState([]);

  // For match scoring
  const [activeMatch, setActiveMatch] = useState(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [submittingResult, setSubmittingResult] = useState(false);

  // Load tournament if we have an ID
  useEffect(() => {
    if (tournamentId) {
      loadTournament();
    } else {
      loadGames();
      setLoading(false);
    }
  }, [tournamentId]);

  const loadTournament = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournamentId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Tournament not found');
      }
      const data = await response.json();
      setTournament(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadGames = async () => {
    try {
      const response = await fetch('/api/games', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setGames(data.filter(g => g.max_players >= 2));
        // Set default game if gameSlug is provided
        if (gameSlug) {
          const game = data.find(g => g.slug === gameSlug);
          if (game) setGameId(game.id);
        }
      }
    } catch (err) {
      console.error('Failed to load games:', err);
    }
  };

  const handlePlayerChange = (index, value) => {
    const newInitials = [...playerInitials];
    newInitials[index] = value.toUpperCase().slice(0, 5);
    setPlayerInitials(newInitials);
  };

  const createTournament = async () => {
    // Validate
    const filledPlayers = playerInitials.filter(p => p.trim().length > 0);
    if (filledPlayers.length < 3) {
      setError(t('tournament.needMinPlayers', 'Du behöver minst 3 spelare'));
      return;
    }
    if (!gameId) {
      setError(t('tournament.selectGame', 'Välj ett spel'));
      return;
    }

    setCreating(true);
    setError('');

    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          game_id: gameId,
          player_initials: filledPlayers
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create tournament');
      }

      const data = await response.json();
      navigate(`/tournament/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const startMatch = (match) => {
    setActiveMatch(match);
    setScores({ player1: 0, player2: 0 });
  };

  const submitMatchResult = async (winnerId) => {
    if (!activeMatch) return;
    setSubmittingResult(true);

    try {
      const response = await fetch(`/api/tournaments/${tournament.id}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          match_id: activeMatch.id,
          winner_id: winnerId,
          player1_score: scores.player1,
          player2_score: scores.player2
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit result');
      }

      const data = await response.json();
      setTournament(data);
      setActiveMatch(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingResult(false);
    }
  };

  const getPlayerName = (playerId) => {
    if (!tournament?.players) return '?';
    const player = tournament.players.find(p => p.user_id === playerId);
    return player?.initials || '?';
  };

  const getMatchStatus = (match) => {
    if (match.status === 'completed') return 'completed';
    if (!match.player1_id || !match.player2_id) return 'waiting';
    return 'ready';
  };

  if (loading) {
    return <div className="page center loading">{t('common.loading')}</div>;
  }

  // Create tournament form
  if (!tournamentId) {
    return (
      <div className="page center">
        <div className="card" style={{ maxWidth: '600px' }}>
          <Link
            to="/games"
            style={{
              display: 'inline-block',
              marginBottom: '1rem',
              color: 'var(--color-primary)'
            }}
          >
            &larr; {t('common.back')}
          </Link>

          <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            🏆 {t('tournament.create', 'Skapa turnering')}
          </h1>
          <p style={{ textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '2rem' }}>
            {t('tournament.createDesc', '3-4 spelare tävlar mot varandra')}
          </p>

          {error && (
            <p style={{ color: 'var(--color-error)', textAlign: 'center', marginBottom: '1rem' }}>
              {error}
            </p>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              {t('tournament.selectGame', 'Välj spel')}
            </label>
            <select
              value={gameId || ''}
              onChange={(e) => setGameId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--color-border)',
                fontSize: '1rem'
              }}
            >
              <option value="">{t('tournament.chooseGame', '-- Välj spel --')}</option>
              {games.map(game => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              {t('tournament.playerInitials', 'Spelarnas initialer (5 tecken)')}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {playerInitials.map((initials, index) => (
                <div key={index}>
                  <label style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
                    {t('tournament.player', 'Spelare')} {index + 1} {index >= 3 && `(${t('common.optional', 'valfri')})`}
                  </label>
                  <input
                    type="text"
                    value={initials}
                    onChange={(e) => handlePlayerChange(index, e.target.value)}
                    maxLength={5}
                    placeholder="ABCDE"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '2px solid var(--color-border)',
                      fontSize: '1.25rem',
                      textAlign: 'center',
                      textTransform: 'uppercase'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={createTournament}
            className="btn btn-large"
            disabled={creating}
            style={{ width: '100%' }}
          >
            {creating ? t('common.creating', 'Skapar...') : t('tournament.start', 'Starta turnering')}
          </button>
        </div>
      </div>
    );
  }

  // Tournament view
  if (!tournament) {
    return (
      <div className="page center">
        <div className="card" style={{ textAlign: 'center' }}>
          <h1>{t('tournament.notFound', 'Turnering hittades inte')}</h1>
          <Link to="/games" className="btn">
            {t('common.back')}
          </Link>
        </div>
      </div>
    );
  }

  const round1Matches = tournament.matches?.filter(m => m.round === 1) || [];
  const finalMatch = tournament.matches?.find(m => m.round === 2);
  const isCompleted = tournament.status === 'completed';
  const winner = isCompleted && tournament.winner_id ? getPlayerName(tournament.winner_id) : null;

  return (
    <div className="page center">
      <div className={styles.tournamentContainer}>
        <Link
          to="/games"
          style={{
            display: 'inline-block',
            marginBottom: '1rem',
            color: 'var(--color-primary)'
          }}
        >
          &larr; {t('common.back')}
        </Link>

        <h1 style={{ textAlign: 'center' }}>
          🏆 {t('tournament.title', 'Turnering')}
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '1rem' }}>
          {tournament.game_name}
        </p>

        {isCompleted && winner && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={styles.winner}
          >
            <span className={styles.crown}>👑</span>
            <h2>{t('tournament.winner', 'Vinnare')}: {winner}</h2>
          </motion.div>
        )}

        {error && (
          <p style={{ color: 'var(--color-error)', textAlign: 'center', marginBottom: '1rem' }}>
            {error}
          </p>
        )}

        {/* Tournament Bracket */}
        <div className={styles.bracket}>
          {/* Semi-finals */}
          <div className={styles.round}>
            <h3>{t('tournament.semifinals', 'Semifinaler')}</h3>
            {round1Matches.map((match, index) => {
              const status = getMatchStatus(match);
              const canPlay = status === 'ready' && !activeMatch;

              return (
                <div key={match.id} className={`${styles.match} ${styles[status]}`}>
                  <div className={styles.matchPlayers}>
                    <div className={`${styles.player} ${match.winner_id === match.player1_id ? styles.winner : ''}`}>
                      {getPlayerName(match.player1_id)}
                      {match.status === 'completed' && <span className={styles.score}>{match.player1_score}</span>}
                    </div>
                    <div className={styles.vs}>vs</div>
                    <div className={`${styles.player} ${match.winner_id === match.player2_id ? styles.winner : ''}`}>
                      {getPlayerName(match.player2_id)}
                      {match.status === 'completed' && <span className={styles.score}>{match.player2_score}</span>}
                    </div>
                  </div>
                  {canPlay && (
                    <button
                      className="btn btn-small"
                      onClick={() => startMatch(match)}
                    >
                      {t('tournament.play', 'Spela')}
                    </button>
                  )}
                  {match.status === 'completed' && (
                    <div className={styles.matchComplete}>✓</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Final */}
          <div className={styles.round}>
            <h3>{t('tournament.final', 'Final')}</h3>
            {finalMatch && (
              <div className={`${styles.match} ${styles.finalMatch} ${styles[getMatchStatus(finalMatch)]}`}>
                <div className={styles.matchPlayers}>
                  <div className={`${styles.player} ${finalMatch.winner_id === finalMatch.player1_id ? styles.winner : ''}`}>
                    {finalMatch.player1_id ? getPlayerName(finalMatch.player1_id) : '?'}
                    {finalMatch.status === 'completed' && <span className={styles.score}>{finalMatch.player1_score}</span>}
                  </div>
                  <div className={styles.vs}>vs</div>
                  <div className={`${styles.player} ${finalMatch.winner_id === finalMatch.player2_id ? styles.winner : ''}`}>
                    {finalMatch.player2_id ? getPlayerName(finalMatch.player2_id) : '?'}
                    {finalMatch.status === 'completed' && <span className={styles.score}>{finalMatch.player2_score}</span>}
                  </div>
                </div>
                {getMatchStatus(finalMatch) === 'ready' && !activeMatch && (
                  <button
                    className="btn btn-small"
                    onClick={() => startMatch(finalMatch)}
                  >
                    {t('tournament.play', 'Spela')}
                  </button>
                )}
                {finalMatch.status === 'completed' && (
                  <div className={styles.matchComplete}>👑</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Active Match Modal */}
        <AnimatePresence>
          {activeMatch && (
            <motion.div
              className={styles.matchModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={styles.matchModalContent}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
              >
                <h2>{t('tournament.match', 'Match')}</h2>
                <p>{tournament.game_name}</p>

                <div className={styles.matchScoring}>
                  <div className={styles.playerScore}>
                    <h3>{getPlayerName(activeMatch.player1_id)}</h3>
                    <input
                      type="number"
                      value={scores.player1}
                      onChange={(e) => setScores({ ...scores, player1: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                    <button
                      className="btn btn-large"
                      onClick={() => submitMatchResult(activeMatch.player1_id)}
                      disabled={submittingResult}
                    >
                      {t('tournament.declareWinner', 'Vinnare')}
                    </button>
                  </div>

                  <div className={styles.vsLarge}>VS</div>

                  <div className={styles.playerScore}>
                    <h3>{getPlayerName(activeMatch.player2_id)}</h3>
                    <input
                      type="number"
                      value={scores.player2}
                      onChange={(e) => setScores({ ...scores, player2: parseInt(e.target.value) || 0 })}
                      min="0"
                    />
                    <button
                      className="btn btn-large"
                      onClick={() => submitMatchResult(activeMatch.player2_id)}
                      disabled={submittingResult}
                    >
                      {t('tournament.declareWinner', 'Vinnare')}
                    </button>
                  </div>
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={() => setActiveMatch(null)}
                  style={{ marginTop: '1rem' }}
                >
                  {t('common.cancel', 'Avbryt')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
