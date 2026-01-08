import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import LanguageSwitcher from '../components/LanguageSwitcher';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className={`page ${styles.dashboard}`}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Link to="/dashboard">
            <h1>Grab'n GO</h1>
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link to="/games">{t('nav.games')}</Link>
          <Link to="/products">{t('nav.products')}</Link>
          <Link to="/highscores">{t('nav.highscores', 'Topplista')}</Link>
          <Link to="/idea-box">{t('nav.ideaBox')}</Link>
          {user?.is_returning_guest && (
            <Link to="/my-page">{t('nav.myPage')}</Link>
          )}
          <LanguageSwitcher />
          <button onClick={handleLogout} className={styles.logoutBtn}>
            {t('nav.logout')}
          </button>
        </nav>
      </header>

      <main className={styles.main}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.welcome}
        >
          <h2>
            {t('dashboard.welcome')}, {user?.initials}!
          </h2>
          <div className={styles.ticketBadge}>
            <span className={styles.ticketCount}>{user?.tickets_count || 0}</span>
            <span className={styles.ticketLabel}>{t('dashboard.tickets')}</span>
          </div>
        </motion.div>

        <div className={styles.actions}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/games" className={`btn btn-large ${styles.playBtn}`}>
              {t('dashboard.playNow')}
            </Link>
          </motion.div>

          <div className={styles.scanSection}>
            <h3>{t('dashboard.scanReceipt')}</h3>
            <p>MVP: Use mock buttons below</p>
            <div className={styles.mockButtons}>
              {[1, 2, 3, 4].map((num) => (
                <MockReceiptButton key={num} amount={num * 20} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MockReceiptButton({ amount }) {
  const { refreshUser } = useAuth();

  const handleClick = async () => {
    try {
      const response = await fetch('/api/tickets/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          receipt_id: `mock_${Date.now()}_${Math.random()}`,
          amount
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Added ${data.tickets_added} ticket(s)! Total: ${data.total_tickets}`);
        refreshUser();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error scanning receipt');
    }
  };

  return (
    <button onClick={handleClick} className={styles.mockBtn}>
      {amount}kr
    </button>
  );
}
