import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import styles from './AdminSection.module.css';

export default function AdminSettings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { changeTheme, theme: currentTheme } = useTheme();
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
    theme: 'default',
    // Idle view settings
    idle_view_cube_enabled: 'true',
    idle_view_ideas_enabled: 'false',
    idle_view_ads_enabled: 'false',
    idle_view_cube_percent: '40',
    idle_view_ideas_percent: '30',
    idle_view_ads_percent: '30'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [showBlocker, setShowBlocker] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const originalSettingsRef = useRef(null);

  // Handle browser beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Intercept link clicks when form is dirty
  useEffect(() => {
    const handleClick = (e) => {
      if (!isDirty) return;

      // Find closest anchor tag
      const link = e.target.closest('a');
      if (!link) return;

      // Check if it's an internal link
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('//')) return;

      // Block navigation and show dialog
      e.preventDefault();
      e.stopPropagation();
      setPendingNavigation(href);
      setShowBlocker(true);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isDirty]);

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
        const newSettings = { ...settings, ...data };
        setSettings(newSettings);
        originalSettingsRef.current = JSON.stringify(newSettings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Check if form is dirty
    if (originalSettingsRef.current) {
      setIsDirty(JSON.stringify(newSettings) !== originalSettingsRef.current);
    }

    // Apply theme change immediately
    if (key === 'theme') {
      changeTheme(value);
    }
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
        originalSettingsRef.current = JSON.stringify(settings);
        setIsDirty(false);
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

  const handleStay = () => {
    setShowBlocker(false);
    setPendingNavigation(null);
  };

  const handleLeave = () => {
    setShowBlocker(false);
    setIsDirty(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setPendingNavigation(null);
  };

  // Calculate total percentage for idle views
  const getTotalIdlePercent = () => {
    let total = 0;
    if (settings.idle_view_cube_enabled === 'true' || settings.idle_view_cube_enabled === true) {
      total += parseInt(settings.idle_view_cube_percent) || 0;
    }
    if (settings.idle_view_ideas_enabled === 'true' || settings.idle_view_ideas_enabled === true) {
      total += parseInt(settings.idle_view_ideas_percent) || 0;
    }
    if (settings.idle_view_ads_enabled === 'true' || settings.idle_view_ads_enabled === true) {
      total += parseInt(settings.idle_view_ads_percent) || 0;
    }
    return total;
  };

  if (loading) {
    return <div className={styles.loading}>Laddar installningar...</div>;
  }

  const totalPercent = getTotalIdlePercent();

  return (
    <div className={styles.section}>
      <h2>{t('admin.settings')}</h2>

      {/* Navigation blocker dialog */}
      {showBlocker && (
        <div className={styles.blockerOverlay}>
          <div className={styles.blockerDialog}>
            <h3>Osparade andringar</h3>
            <p>Du har osparade andringar. Vill du lamna sidan anda?</p>
            <div className={styles.blockerButtons}>
              <button
                className={styles.btnSecondary}
                onClick={handleStay}
              >
                Stanna kvar
              </button>
              <button
                className={styles.btnDanger}
                onClick={handleLeave}
              >
                Lamna sidan
              </button>
            </div>
          </div>
        </div>
      )}

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
        <h3>Vilolage (Idle Mode)</h3>
        <p className={styles.hint} style={{ marginBottom: 'var(--spacing-md)' }}>
          Valj vilka vyer som ska roteras i vilolaget. Procent anger hur mycket tid varje vy far.
        </p>

        <div className={styles.field}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={settings.idle_view_cube_enabled === 'true' || settings.idle_view_cube_enabled === true}
              onChange={e => handleChange('idle_view_cube_enabled', e.target.checked ? 'true' : 'false')}
            />
            Spelkub (3D-animering)
          </label>
          {(settings.idle_view_cube_enabled === 'true' || settings.idle_view_cube_enabled === true) && (
            <div style={{ marginTop: 'var(--spacing-xs)', marginLeft: 'var(--spacing-lg)' }}>
              <label>Tidsprocent: {settings.idle_view_cube_percent}%</label>
              <input
                type="range"
                value={settings.idle_view_cube_percent}
                onChange={e => handleChange('idle_view_cube_percent', e.target.value)}
                min="10"
                max="100"
              />
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={settings.idle_view_ideas_enabled === 'true' || settings.idle_view_ideas_enabled === true}
              onChange={e => handleChange('idle_view_ideas_enabled', e.target.checked ? 'true' : 'false')}
            />
            Idelada (fragor och svar)
          </label>
          {(settings.idle_view_ideas_enabled === 'true' || settings.idle_view_ideas_enabled === true) && (
            <div style={{ marginTop: 'var(--spacing-xs)', marginLeft: 'var(--spacing-lg)' }}>
              <label>Tidsprocent: {settings.idle_view_ideas_percent}%</label>
              <input
                type="range"
                value={settings.idle_view_ideas_percent}
                onChange={e => handleChange('idle_view_ideas_percent', e.target.value)}
                min="10"
                max="100"
              />
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={settings.idle_view_ads_enabled === 'true' || settings.idle_view_ads_enabled === true}
              onChange={e => handleChange('idle_view_ads_enabled', e.target.checked ? 'true' : 'false')}
            />
            Annonser
          </label>
          {(settings.idle_view_ads_enabled === 'true' || settings.idle_view_ads_enabled === true) && (
            <div style={{ marginTop: 'var(--spacing-xs)', marginLeft: 'var(--spacing-lg)' }}>
              <label>Tidsprocent: {settings.idle_view_ads_percent}%</label>
              <input
                type="range"
                value={settings.idle_view_ads_percent}
                onChange={e => handleChange('idle_view_ads_percent', e.target.value)}
                min="10"
                max="100"
              />
            </div>
          )}
        </div>

        {totalPercent > 0 && (
          <p className={styles.hint}>
            Totalt: {totalPercent}% (relativ fordelning)
          </p>
        )}
      </div>

      <div className={styles.settingsGroup}>
        <h3>Ljud-installningar</h3>
        <div className={styles.field}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={settings.sound_enabled === true || settings.sound_enabled === 'true'}
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
            value={settings.theme}
            onChange={e => handleChange('theme', e.target.value)}
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
        <div
          className={`${styles.message} ${message.includes('sparade') ? styles.success : styles.error}`}
          role={message.includes('sparade') ? 'status' : 'alert'}
          aria-live="polite"
        >
          {message}
        </div>
      )}

      <button
        className={styles.saveBtn}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Sparar...' : 'Spara installningar'}
        {isDirty && ' *'}
      </button>
    </div>
  );
}
