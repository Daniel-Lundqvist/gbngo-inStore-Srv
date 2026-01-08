import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [initials, setInitials] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (initials.length !== 5) {
      setError(t('errors.invalidInitials'));
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError(t('errors.invalidPin'));
      return;
    }

    setLoading(true);
    try {
      await login(initials, pin);
      navigate('/dashboard');
    } catch (err) {
      setError(t('errors.invalidCredentials'));
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
        <h1 className={styles.title}>{t('login.title')}</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label htmlFor="initials">{t('login.initialsLabel')}</label>
            <input
              type="text"
              id="initials"
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().slice(0, 5))}
              maxLength={5}
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="pin">{t('login.pinLabel')}</label>
            <input
              type="password"
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              inputMode="numeric"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="form-error" role="alert" aria-live="assertive">{error}</p>}

          <button
            type="submit"
            className="btn btn-large"
            disabled={loading}
          >
            {loading ? t('common.loading') : t('login.submit')}
          </button>
        </form>

        <Link to="/start" className={styles.backLink}>
          {t('common.back')}
        </Link>
      </motion.div>
    </div>
  );
}
