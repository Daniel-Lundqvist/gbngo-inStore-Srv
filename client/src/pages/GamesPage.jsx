import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function GamesPage() {
  const { t } = useTranslation();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/games')
      .then(res => res.json())
      .then(data => {
        setGames(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load games:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="page center loading">{t('common.loading')}</div>;
  }

  return (
    <div className="page">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Link to="/dashboard" style={{ color: 'var(--color-primary)' }}>
            &larr; {t('common.back')}
          </Link>
          <h1 style={{ marginTop: '1rem' }}>{t('games.title')}</h1>
        </div>
        <LanguageSwitcher />
      </header>

      <div style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
        {games.map((game) => (
          <motion.div
            key={game.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={`/games/${game.slug}`}
              style={{
                display: 'block',
                padding: '1.5rem',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{game.name}</h3>
              <p style={{ margin: 0, color: 'var(--color-text-light)' }}>
                {game.description}
              </p>
              <p style={{ margin: 0, marginTop: '0.5rem', fontSize: '0.875rem' }}>
                Max {game.max_players} {game.max_players === 1 ? 'spelare' : 'spelare'}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
