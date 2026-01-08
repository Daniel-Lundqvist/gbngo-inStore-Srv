import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import styles from './AuthPage.module.css';

export default function GuestPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { loginAsGuest } = useAuth();

  // Get the redirect path from state (if coming from protected route)
  const from = location.state?.from || '/dashboard';

  const [initials, setInitials] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (initials.length !== 5) {
      setError(t('errors.invalidInitials'));
      return;
    }

    setLoading(true);
    try {
      await loginAsGuest(initials);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || t('errors.inappropriateInitials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`page center ${styles.authPage}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card ${styles.card}`}
      >
        <h1 className={styles.title}>{t('guest.title')}</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label htmlFor="initials">{t('guest.initialsLabel')}</label>
            <input
              type="text"
              id="initials"
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 5))}
              placeholder={t('guest.initialsPlaceholder')}
              maxLength={5}
              autoComplete="off"
              autoFocus
            />
          </div>

          {error && <p className="form-error" role="alert" aria-live="assertive">{error}</p>}

          <button
            type="submit"
            className="btn btn-large"
            disabled={loading || initials.length !== 5}
          >
            {loading ? t('common.loading') : t('guest.submit')}
          </button>
        </form>

        <p className={styles.note}>{t('guest.note')}</p>

        <Link to="/start" className={styles.backLink}>
          {t('common.back')}
        </Link>
      </motion.div>
    </div>
  );
}
