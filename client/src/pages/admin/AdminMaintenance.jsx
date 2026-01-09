import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AdminSection.module.css';

export default function AdminMaintenance() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const showMessage = (msg, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 5000);
  };

  const clearHighscores = async () => {
    if (!confirm('Är du säker på att du vill rensa ALLA highscores? Denna åtgärd kan inte ångras!')) return;
    if (!confirm('VARNING: Detta tar bort alla topplistor permanent. Skriv "RENSA" för att bekräfta.')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/highscores', {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        showMessage('Highscores har rensats!');
      } else {
        showMessage('Kunde inte rensa highscores', true);
      }
    } catch (error) {
      showMessage('Nätverksfel - försök igen', true);
    } finally {
      setLoading(false);
    }
  };

  const clearInactiveAccounts = async () => {
    if (!confirm('Ta bort konton som varit inaktiva i mer än 30 dagar?')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/users/inactive', {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        showMessage(`${data.deleted || 0} inaktiva konton har tagits bort!`);
      } else {
        showMessage('Kunde inte ta bort konton', true);
      }
    } catch (error) {
      showMessage('Nätverksfel - försök igen', true);
    } finally {
      setLoading(false);
    }
  };

  const clearExpiredTickets = async () => {
    if (!confirm('Ta bort alla tickets som har gått ut?')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/tickets/expired', {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        showMessage(`Utgångna tickets har rensats!`);
      } else {
        showMessage('Kunde inte rensa tickets', true);
      }
    } catch (error) {
      showMessage('Nätverksfel - försök igen', true);
    } finally {
      setLoading(false);
    }
  };

  const clearOldReceipts = async () => {
    if (!confirm('Ta bort använda kvitton äldre än 7 dagar?')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/receipts/old', {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        showMessage(`Gamla kvitton har rensats!`);
      } else {
        showMessage('Kunde inte rensa kvitton', true);
      }
    } catch (error) {
      showMessage('Nätverksfel - försök igen', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.section}>
      <h2>{t('admin.maintenance')}</h2>

      {message && (
        <div
          className={`${styles.message} ${message.includes('fel') ? styles.error : styles.success}`}
          role={message.includes('fel') ? 'alert' : 'status'}
          aria-live="polite"
        >
          {message}
        </div>
      )}

      <div className={styles.settingsGroup}>
        <h3>Datarensning</h3>
        <p style={{ marginBottom: '1rem', color: 'var(--color-text-light)' }}>
          Dessa åtgärder rensar ut gammal data för att hålla systemet snabbt.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            className={styles.saveBtn}
            onClick={clearExpiredTickets}
            disabled={loading}
          >
            Rensa utgångna tickets
          </button>

          <button
            className={styles.saveBtn}
            onClick={clearOldReceipts}
            disabled={loading}
          >
            Rensa gamla kvitton (äldre än 7 dagar)
          </button>

          <button
            className={styles.saveBtn}
            onClick={clearInactiveAccounts}
            disabled={loading}
          >
            Ta bort inaktiva konton (30+ dagar)
          </button>
        </div>
      </div>

      <div className={styles.dangerZone}>
        <h3>Farozon</h3>
        <p style={{ marginBottom: '1rem' }}>
          Dessa åtgärder är permanenta och kan inte ångras!
        </p>

        <button
          className={styles.dangerBtn}
          onClick={clearHighscores}
          disabled={loading}
        >
          {t('admin.clearHighscores')}
        </button>
      </div>
    </div>
  );
}
