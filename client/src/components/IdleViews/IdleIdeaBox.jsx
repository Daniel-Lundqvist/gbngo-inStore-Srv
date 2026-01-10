import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import styles from './IdleViews.module.css';

export default function IdleIdeaBox() {
  const { t } = useTranslation();
  const [responses, setResponses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchResponses();
  }, []);

  useEffect(() => {
    if (responses.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % responses.length);
      }, 8000);
      return () => clearInterval(timer);
    }
  }, [responses.length]);

  const fetchResponses = async () => {
    try {
      const response = await fetch('/api/idea-responses');
      if (response.ok) {
        const data = await response.json();
        // API already filters for is_active = 1, no need to filter again
        setResponses(data);
      }
    } catch (error) {
      console.error('Failed to fetch idea responses:', error);
    }
  };

  if (responses.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>{t('idle.noQuestionsAnswers')}</div>
      </div>
    );
  }

  const current = responses[currentIndex];

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={styles.ideaBox}>
        <h2 className={styles.ideaTitle}>{t('ideaBox.title')}</h2>

        <motion.div
          key={currentIndex}
          className={styles.ideaContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className={styles.question}>
            <span className={styles.label}>{t('ideaBox.yourQuestion')}:</span>
            <p>{current.question}</p>
          </div>

          <div className={styles.answer}>
            <span className={styles.label}>{t('ideaBox.ourAnswer')}:</span>
            <p>{current.answer}</p>
          </div>
        </motion.div>

        {responses.length > 1 && (
          <div className={styles.dots}>
            {responses.map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${i === currentIndex ? styles.active : ''}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
