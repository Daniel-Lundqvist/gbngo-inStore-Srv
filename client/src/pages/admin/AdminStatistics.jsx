import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AdminSection.module.css';

export default function AdminStatistics() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', { credentials: 'include' });
      if (response.ok) {
        setStats(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Laddar statistik...</div>;
  }

  if (!stats) {
    return <div className={styles.empty}>Kunde inte ladda statistik</div>;
  }

  return (
    <div className={styles.section}>
      <h2>{t('admin.statistics')}</h2>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.usersToday || 0}</div>
          <div className={styles.statLabel}>Spelare idag</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.usersThisWeek || 0}</div>
          <div className={styles.statLabel}>Spelare denna vecka</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.totalUsers || 0}</div>
          <div className={styles.statLabel}>Totalt antal konton</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.gamesPlayedToday || 0}</div>
          <div className={styles.statLabel}>Spel idag</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.gamesPlayedThisWeek || 0}</div>
          <div className={styles.statLabel}>Spel denna vecka</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.totalGamesPlayed || 0}</div>
          <div className={styles.statLabel}>Totalt spelade spel</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.ticketsUsedToday || 0}</div>
          <div className={styles.statLabel}>Tickets anvanda idag</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.receiptsScannedToday || 0}</div>
          <div className={styles.statLabel}>Kvitton skannade idag</div>
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <h3>Populara spel</h3>
        {stats.popularGames && stats.popularGames.length > 0 ? (
          <div className={styles.itemList}>
            {stats.popularGames.map((game, index) => (
              <div key={game.name} className={styles.item}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>
                    {index + 1}. {game.name}
                  </div>
                  <div className={styles.itemMeta}>
                    {game.count} spelsessioner
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Ingen speldata annu</p>
        )}
      </div>

      <div className={styles.settingsGroup}>
        <h3>Senaste aktivitet</h3>
        {stats.recentActivity && stats.recentActivity.length > 0 ? (
          <div className={styles.itemList}>
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className={styles.item}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{activity.initials}</div>
                  <div className={styles.itemMeta}>
                    {activity.action} - {new Date(activity.timestamp).toLocaleString('sv-SE')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Ingen aktivitet registrerad annu</p>
        )}
      </div>

      <button className={styles.saveBtn} onClick={fetchStats} style={{ marginTop: '1rem' }}>
        Uppdatera statistik
      </button>
    </div>
  );
}
