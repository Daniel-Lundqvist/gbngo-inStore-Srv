import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './HighscoresPage.module.css';

export default function HighscoresPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('today');
  const [highscores, setHighscores] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'today', label: t('highscores.today', 'Idag') },
    { id: 'week', label: t('highscores.week', 'Veckan') },
    { id: 'month', label: t('highscores.lastMonth', 'Förra månaden') }
  ];

  useEffect(() => {
    fetchHighscores(activeTab);
  }, [activeTab]);

  const fetchHighscores = async (period) => {
    setLoading(true);
    try {
      // Map tab id to API endpoint
      const endpointMap = {
        'today': '/today',
        'week': '/week',
        'month': '/last-month'
      };
      const endpoint = endpointMap[period] || '/today';

      const response = await fetch(`/api/highscores${endpoint}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setHighscores(data);
      }
    } catch (error) {
      console.error('Failed to fetch highscores:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/dashboard" className={styles.backLink}>← {t('nav.back', 'Tillbaka')}</Link>
        <h1>{t('highscores.title', 'Topplista')}</h1>
      </header>

      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {loading ? (
          <p className={styles.loading}>{t('common.loading', 'Laddar...')}</p>
        ) : highscores.length === 0 ? (
          <p className={styles.empty}>
            {activeTab === 'today' && t('highscores.noScoresToday', 'Inga poäng idag ännu')}
            {activeTab === 'week' && t('highscores.noScoresWeek', 'Inga poäng denna vecka ännu')}
            {activeTab === 'month' && t('highscores.noScoresMonth', 'Ingen vinnare förra månaden')}
          </p>
        ) : (
          <div className={styles.list}>
            {activeTab === 'month' && highscores.length > 0 ? (
              // Show winner for last month
              <div className={styles.winner}>
                <div className={styles.crown}>👑</div>
                <h2>{t('highscores.winner', 'Vinnare')}</h2>
                <div className={styles.winnerName}>{highscores[0].initials}</div>
                <div className={styles.winnerScore}>{highscores[0].score} {t('highscores.points', 'poäng')}</div>
                <div className={styles.winnerGame}>{highscores[0].game_name}</div>
              </div>
            ) : (
              // Show list for today/week
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('highscores.player', 'Spelare')}</th>
                    <th>{t('highscores.game', 'Spel')}</th>
                    <th>{t('highscores.score', 'Poäng')}</th>
                  </tr>
                </thead>
                <tbody>
                  {highscores.map((score, index) => (
                    <tr key={score.id} className={index < 3 ? styles.topThree : ''}>
                      <td>{index + 1}</td>
                      <td>{score.initials}</td>
                      <td>{score.game_name}</td>
                      <td>{score.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
