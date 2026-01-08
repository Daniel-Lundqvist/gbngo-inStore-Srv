import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import styles from './AuthPage.module.css';

export default function AdminLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginAsAdmin } = useAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginAsAdmin(code);
      navigate('/admin');
    } catch (err) {
      setError(t('errors.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`page center ${styles.authPage}`}>
      <div className={`card ${styles.card}`}>
        <h1 className={styles.title}>{t('admin.title')}</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label htmlFor="code">{t('admin.enterCode')}</label>
            <input
              type="password"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              inputMode="numeric"
              autoComplete="off"
              autoFocus
            />
          </div>

          {error && <p className="form-error" role="alert" aria-live="assertive">{error}</p>}

          <button
            type="submit"
            className="btn btn-large"
            disabled={loading || code.length !== 4}
          >
            {loading ? t('common.loading') : t('login.submit')}
          </button>
        </form>

        <Link to="/" className={styles.backLink}>
          {t('common.back')}
        </Link>
      </div>
    </div>
  );
}
