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
    <div className="page" style={{ maxWidth: '500px', margin: '0 auto', padding: '1rem' }}>
      <header style={{
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/dashboard" style={{ color: 'var(--color-primary)' }}>
          &larr; {t('common.back')}
        </Link>
        <LanguageSwitcher />
      </header>

      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', whiteSpace: 'nowrap' }}>
        {t('games.title')}
      </h1>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center'
      }}>
        {games.map((game) => (
          <motion.div
            key={game.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ width: '100%', maxWidth: '400px' }}
          >
            <Link
              to={`/games/${game.slug}`}
              style={{
                display: 'block',
                padding: '1.25rem',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                textDecoration: 'none',
                color: 'inherit',
                textAlign: 'center'
              }}
            >
              <h3 style={{ margin: 0, marginBottom: '0.5rem' }}>{game.name}</h3>
              <p style={{ margin: 0, color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                {game.description}
              </p>
              <p style={{ margin: 0, marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                {t('games.maxPlayers', 'Max {{count}} spelare', { count: game.max_players })}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
