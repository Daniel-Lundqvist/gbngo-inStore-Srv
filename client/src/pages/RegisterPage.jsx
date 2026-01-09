import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [initials, setInitials] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
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

    if (pin !== pinConfirm) {
      setError(t('errors.pinMismatch'));
      return;
    }

    setLoading(true);
    try {
      await register(initials, pin);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
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
        <h1 className={styles.title}>{t('register.title')}</h1>

        <ul className={styles.benefits}>
          {t('register.benefits', { returnObjects: true }).map((benefit, i) => (
            <li key={i}>{benefit}</li>
          ))}
        </ul>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label htmlFor="initials">{t('register.initialsLabel')}</label>
            <input
              type="text"
              id="initials"
              value={initials}
              onChange={(e) => setInitials(e.target.value.toUpperCase().replace(/[^A-ZÅÄÖ]/g, '').slice(0, 5))}
              maxLength={5}
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="pin">{t('register.pinLabel')}</label>
            <input
              type="password"
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              inputMode="numeric"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pinConfirm">{t('register.pinConfirmLabel')}</label>
            <input
              type="password"
              id="pinConfirm"
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              inputMode="numeric"
              autoComplete="new-password"
            />
          </div>

          {error && <p className="form-error" role="alert" aria-live="assertive">{error}</p>}

          <button
            type="submit"
            className="btn btn-large"
            disabled={loading}
          >
            {loading ? t('common.loading') : t('register.submit')}
          </button>
        </form>

        <Link to="/start" className={styles.backLink}>
          {t('common.back')}
        </Link>
      </motion.div>
    </div>
  );
}
