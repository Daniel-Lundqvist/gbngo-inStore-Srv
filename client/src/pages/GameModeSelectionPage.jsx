import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function GameModeSelectionPage() {
  const { gameSlug } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/games/${gameSlug}`)
      .then(res => {
        if (!res.ok) throw new Error('Game not found');
        return res.json();
      })
      .then(data => {
        setGame(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load game:', err);
        navigate('/404', { replace: true });
      });
  }, [gameSlug, navigate]);

  const selectMode = (mode) => {
    navigate(`/games/${gameSlug}/play?mode=${mode}`);
  };

  if (loading) {
    return <div className="page center loading">{t('common.loading')}</div>;
  }

  if (!game) {
    return null;
  }

  const isSinglePlayerOnly = game.max_players === 1;

  return (
    <div className="page center">
      <div className="card" style={{ maxWidth: '600px', textAlign: 'center' }}>
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

        <h1 style={{ textTransform: 'capitalize', marginBottom: '0.5rem' }}>
          {game.name}
        </h1>

        {game.description && (
          <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
            {game.description}
          </p>
        )}

        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
          {t('start.title', 'Välj hur du vill spela')}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Single Player - always available */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectMode('single')}
            className="btn btn-large"
            style={{
              width: '100%',
              padding: '1.5rem',
              fontSize: '1.25rem'
            }}
          >
            🎮 {t('games.singlePlayer', 'En spelare')}
          </motion.button>

          {/* Together mode - only if multiplayer */}
          {!isSinglePlayerOnly && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectMode('together')}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '1.5rem',
                fontSize: '1.25rem'
              }}
            >
              👥 {t('games.together', 'Tillsammans')}
              <span style={{
                display: 'block',
                fontSize: '0.875rem',
                opacity: 0.8,
                marginTop: '0.25rem'
              }}>
                {t('games.togetherDesc', 'Spela med en vän på samma enhet')}
              </span>
            </motion.button>
          )}

          {/* Tournament mode - only if multiplayer */}
          {!isSinglePlayerOnly && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectMode('tournament')}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '1.5rem',
                fontSize: '1.25rem'
              }}
            >
              🏆 {t('games.tournament', 'Turnering')}
              <span style={{
                display: 'block',
                fontSize: '0.875rem',
                opacity: 0.8,
                marginTop: '0.25rem'
              }}>
                {t('games.tournamentDesc', 'Tävla mot andra spelare')}
              </span>
            </motion.button>
          )}
        </div>

        <p style={{
          marginTop: '2rem',
          fontSize: '0.875rem',
          color: 'var(--color-text-light)'
        }}>
          {t('game.ticketCost', 'Kostar 1 ticket att spela')}
        </p>
      </div>
    </div>
  );
}
