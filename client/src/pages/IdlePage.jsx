import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import styles from './IdlePage.module.css';

export default function IdlePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleTouch = () => {
    navigate('/start');
  };

  return (
    <motion.div
      className={styles.idlePage}
      onClick={handleTouch}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.content}>
        <div className={styles.logo}>
          <h1>Grab'n GO</h1>
          <p>QuickGames</p>
        </div>

        <motion.div
          className={styles.message}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className={styles.cta}>{t('idle.scanReceipt')}</p>
        </motion.div>

        <p className={styles.touchPrompt}>{t('idle.touchToStart')}</p>
      </div>
    </motion.div>
  );
}
