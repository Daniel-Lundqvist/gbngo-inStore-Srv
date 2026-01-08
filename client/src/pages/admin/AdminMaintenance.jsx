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
    if (!confirm('Ar du saker pa att du vill rensa ALLA highscores? Denna atgard kan inte angras!')) return;
    if (!confirm('VARNING: Detta tar bort alla topplistor permanent. Skriv "RENSA" for att bekrafta.')) return;

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
      showMessage('Natverksfel - forsok igen', true);
    } finally {
      setLoading(false);
    }
  };

  const clearInactiveAccounts = async () => {
    if (!confirm('Ta bort konton som varit inaktiva i mer an 30 dagar?')) return;

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
      showMessage('Natverksfel - forsok igen', true);
    } finally {
      setLoading(false);
    }
  };

  const clearExpiredTickets = async () => {
    if (!confirm('Ta bort alla tickets som har gatt ut?')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/tickets/expired', {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        showMessage(`Utgangna tickets har rensats!`);
      } else {
        showMessage('Kunde inte rensa tickets', true);
      }
    } catch (error) {
      showMessage('Natverksfel - forsok igen', true);
    } finally {
      setLoading(false);
    }
  };

  const clearOldReceipts = async () => {
    if (!confirm('Ta bort anvanda kvitton aldre an 7 dagar?')) return;

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
      showMessage('Natverksfel - forsok igen', true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.section}>
      <h2>{t('admin.maintenance')}</h2>

      {message && (
        <div className={`${styles.message} ${message.includes('fel') ? styles.error : styles.success}`}>
          {message}
        </div>
      )}

      <div className={styles.settingsGroup}>
        <h3>Datarensning</h3>
        <p style={{ marginBottom: '1rem', color: 'var(--color-text-light)' }}>
          Dessa atgarder rensar ut gammal data for att halla systemet snabbt.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            className={styles.saveBtn}
            onClick={clearExpiredTickets}
            disabled={loading}
          >
            Rensa utgangna tickets
          </button>

          <button
            className={styles.saveBtn}
            onClick={clearOldReceipts}
            disabled={loading}
          >
            Rensa gamla kvitton (aldre an 7 dagar)
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
          Dessa atgarder ar permanenta och kan inte angras!
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
