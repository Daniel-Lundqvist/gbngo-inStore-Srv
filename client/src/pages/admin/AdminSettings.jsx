import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AdminSection.module.css';

export default function AdminSettings() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    kroner_per_ticket: 20,
    ticket_validity_hours: 30,
    max_tickets_per_user: 10,
    receipt_validity_minutes: 15,
    session_timeout_minutes: 10,
    game_time_minutes: 5,
    sound_enabled: true,
    sound_volume: 70,
    default_language: 'sv',
    active_theme: 'default'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        setMessage('Installningar sparade!');
      } else {
        setMessage('Kunde inte spara installningar');
      }
    } catch (error) {
      setMessage('Natverksfel - forsok igen');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Laddar installningar...</div>;
  }

  return (
    <div className={styles.section}>
      <h2>{t('admin.settings')}</h2>

      <div className={styles.settingsGroup}>
        <h3>Ticket-installningar</h3>
        <div className={styles.field}>
          <label>Kronor per ticket</label>
          <input
            type="number"
            value={settings.kroner_per_ticket}
            onChange={e => handleChange('kroner_per_ticket', parseInt(e.target.value))}
            min="1"
          />
          <span className={styles.hint}>Ex: 20 = 20 kr = 1 ticket</span>
        </div>
        <div className={styles.field}>
          <label>Ticket giltighetstid (timmar)</label>
          <input
            type="number"
            value={settings.ticket_validity_hours}
            onChange={e => handleChange('ticket_validity_hours', parseInt(e.target.value))}
            min="1"
          />
        </div>
        <div className={styles.field}>
          <label>Max tickets per anvandare</label>
          <input
            type="number"
            value={settings.max_tickets_per_user}
            onChange={e => handleChange('max_tickets_per_user', parseInt(e.target.value))}
            min="1"
          />
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <h3>Kvitto-installningar</h3>
        <div className={styles.field}>
          <label>Kvitto giltighetstid (minuter)</label>
          <input
            type="number"
            value={settings.receipt_validity_minutes}
            onChange={e => handleChange('receipt_validity_minutes', parseInt(e.target.value))}
            min="1"
          />
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <h3>Session-installningar</h3>
        <div className={styles.field}>
          <label>Session timeout (minuter till vilolage)</label>
          <input
            type="number"
            value={settings.session_timeout_minutes}
            onChange={e => handleChange('session_timeout_minutes', parseInt(e.target.value))}
            min="1"
          />
        </div>
        <div className={styles.field}>
          <label>Speltid per spel (minuter)</label>
          <input
            type="number"
            value={settings.game_time_minutes}
            onChange={e => handleChange('game_time_minutes', parseInt(e.target.value))}
            min="1"
          />
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <h3>Ljud-installningar</h3>
        <div className={styles.field}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={settings.sound_enabled}
              onChange={e => handleChange('sound_enabled', e.target.checked)}
            />
            Ljud aktiverat
          </label>
        </div>
        <div className={styles.field}>
          <label>Volym ({settings.sound_volume}%)</label>
          <input
            type="range"
            value={settings.sound_volume}
            onChange={e => handleChange('sound_volume', parseInt(e.target.value))}
            min="0"
            max="100"
          />
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <h3>Sprak och tema</h3>
        <div className={styles.field}>
          <label>Standardsprak</label>
          <select
            value={settings.default_language}
            onChange={e => handleChange('default_language', e.target.value)}
          >
            <option value="sv">Svenska</option>
            <option value="en">English</option>
            <option value="da">Dansk</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
        <div className={styles.field}>
          <label>Aktivt tema</label>
          <select
            value={settings.active_theme}
            onChange={e => handleChange('active_theme', e.target.value)}
          >
            <option value="default">Standard (Rod/Vit)</option>
            <option value="winter">Vinter</option>
            <option value="easter">Pask</option>
            <option value="western">Western</option>
            <option value="summer">Sommar</option>
            <option value="retro">Retro GameBoy</option>
          </select>
        </div>
      </div>

      {message && (
        <div className={`${styles.message} ${message.includes('sparade') ? styles.success : styles.error}`}>
          {message}
        </div>
      )}

      <button
        className={styles.saveBtn}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Sparar...' : 'Spara installningar'}
      </button>
    </div>
  );
}
