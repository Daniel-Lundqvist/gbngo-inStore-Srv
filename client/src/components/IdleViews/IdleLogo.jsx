import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import styles from './IdleViews.module.css';

export default function IdleLogo({ logoPath }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hasProducts, setHasProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkProducts();
  }, []);

  const checkProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setHasProducts(data.length > 0);
      }
    } catch (error) {
      console.error('Failed to check products:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleInputClick = (e) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={styles.logoContainer}>
        {logoPath ? (
          <img
            src={logoPath}
            alt="Store Logo"
            className={styles.storeLogo}
          />
        ) : (
          <div className={styles.defaultLogo}>
            <h2>Grab'n GO</h2>
            <p>QuickGames</p>
          </div>
        )}

        {hasProducts && (
          <form
            onSubmit={handleSearch}
            onClick={handleInputClick}
            className={styles.logoSearchForm}
          >
            <input
              type="text"
              placeholder={t('products.search')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.logoSearchInput}
            />
            <button type="submit" className={styles.logoSearchButton}>
              {t('common.search') || 'Sök'}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
}
