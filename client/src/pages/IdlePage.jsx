import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import GameCube from '../components/GameCube';
import styles from './IdlePage.module.css';

export default function IdlePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cubeSize, setCubeSize] = useState(200);

  // Responsive cube size
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setCubeSize(150);
      } else if (width < 768) {
        setCubeSize(180);
      } else {
        setCubeSize(220);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

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

        <div className={styles.cubeContainer}>
          <GameCube size={cubeSize} />
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
