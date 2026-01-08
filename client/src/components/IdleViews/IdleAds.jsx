import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './IdleViews.module.css';

export default function IdleAds() {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % ads.length);
      }, 10000); // 10 seconds per ad
      return () => clearInterval(timer);
    }
  }, [ads.length]);

  const fetchAds = async () => {
    try {
      const response = await fetch('/api/advertisements');
      if (response.ok) {
        const data = await response.json();
        setAds(data);
      }
    } catch (error) {
      console.error('Failed to fetch advertisements:', error);
    }
  };

  if (ads.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>Inga annonser att visa</div>
      </div>
    );
  }

  const current = ads[currentIndex];

  return (
    <div className={styles.adContainer}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className={styles.adContent}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
        >
          {current.image_path ? (
            <>
              <img
                src={current.image_path}
                alt={current.message || 'Annons'}
                className={styles.adImage}
              />
              {current.message && (
                <h2 className={styles.adTitle}>{current.message}</h2>
              )}
              {current.price && (
                <p className={styles.adDescription}>Pris: {current.price}</p>
              )}
            </>
          ) : (
            <div className={styles.adTextOnly}>
              <h2 className={styles.adTitle}>{current.message || 'Erbjudande'}</h2>
              {current.price && (
                <p className={styles.adDescription}>Pris: {current.price}</p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {ads.length > 1 && (
        <div className={styles.dots}>
          {ads.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === currentIndex ? styles.active : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
