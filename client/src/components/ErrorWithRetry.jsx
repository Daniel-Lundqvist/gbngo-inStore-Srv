import { useTranslation } from 'react-i18next';
import styles from './ErrorWithRetry.module.css';

/**
 * Component to display error messages with an optional retry button
 *
 * @param {object} props
 * @param {Error} props.error - The error object
 * @param {boolean} props.isTimeout - Whether this is a timeout error
 * @param {function} props.onRetry - Callback function to retry the operation
 * @param {string} props.message - Optional custom message override
 */
export default function ErrorWithRetry({ error, isTimeout, onRetry, message }) {
  const { t } = useTranslation();

  const errorMessage = message ||
    (isTimeout
      ? t('errors.timeout', 'Request timed out. Please check your connection.')
      : error?.message || t('errors.generic', 'Something went wrong.'));

  return (
    <div className={styles.errorContainer} role="alert">
      <div className={styles.errorIcon}>
        {isTimeout ? '⏱️' : '⚠️'}
      </div>
      <p className={styles.errorMessage}>{errorMessage}</p>
      {onRetry && (
        <button
          className={styles.retryButton}
          onClick={onRetry}
          aria-label={t('errors.retry', 'Try again')}
        >
          🔄 {t('errors.retry', 'Try again')}
        </button>
      )}
    </div>
  );
}
