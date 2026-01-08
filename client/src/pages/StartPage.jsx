import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import styles from './StartPage.module.css';

export default function StartPage() {
  const { t } = useTranslation();
  const location = useLocation();

  // Get redirect path from protected route redirect
  const from = location.state?.from;

  return (
    <div className={`page center ${styles.startPage}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={styles.content}
      >
        <div className={styles.logo}>
          <h1>Grab'n GO</h1>
          <p className={styles.subtitle}>QuickGames</p>
        </div>

        <h2 className={styles.title}>{t('start.title')}</h2>

        <div className={styles.options}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/guest" state={{ from }} className={`btn btn-large ${styles.optionBtn}`}>
              {t('start.playAsGuest')}
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/register" state={{ from }} className={`btn btn-large btn-secondary ${styles.optionBtn}`}>
              {t('start.createAccount')}
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/login" state={{ from }} className={`btn btn-large btn-secondary ${styles.optionBtn}`}>
              {t('start.login')}
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
