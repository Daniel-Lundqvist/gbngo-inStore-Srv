import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import GameCube from '../GameCube';
import styles from './IdleViews.module.css';

export default function IdleGameCube() {
  const { t } = useTranslation();
  const [cubeSize, setCubeSize] = useState(200);

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

  return (
    <div className={styles.cubeWrapper}>
      <div className={styles.cubeContainer}>
        <GameCube size={cubeSize} />
      </div>

      <motion.div
        className={styles.cubeMessage}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <p>{t('idle.scanReceipt')}</p>
      </motion.div>
    </div>
  );
}
