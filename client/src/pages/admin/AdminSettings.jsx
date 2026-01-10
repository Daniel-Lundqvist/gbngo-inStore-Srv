import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import styles from './AdminSection.module.css';

// Default menu configuration
const DEFAULT_MENU_CONFIG = {
  settings: { visible: true, order: 1 },
  games: { visible: true, order: 2 },
  products: { visible: true, order: 3 },
  categories: { visible: true, order: 4 },
  'idea-responses': { visible: true, order: 5 },
  advertisements: { visible: true, order: 6 },
  statistics: { visible: true, order: 7 },
  maintenance: { visible: true, order: 8 }
};

// Menu item labels (matches AdminLayout)
const MENU_LABELS = {
  settings: 'admin.settings',
  games: 'admin.games',
  products: 'admin.products',
  categories: 'admin.categories',
  'idea-responses': 'admin.ideaResponses',
  advertisements: 'admin.advertisements',
  statistics: 'admin.statistics',
  maintenance: 'admin.maintenance'
};

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
    idle_view_ads_percent: '30',
    // Admin menu config (stored as JSON string)
    admin_menu_config: JSON.stringify(DEFAULT_MENU_CONFIG)
  });
  const [menuConfig, setMenuConfig] = useState(DEFAULT_MENU_CONFIG);
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

        // Parse menu config if it exists
        if (data.admin_menu_config) {
          try {
            const parsed = JSON.parse(data.admin_menu_config);
            setMenuConfig({ ...DEFAULT_MENU_CONFIG, ...parsed });
          } catch (e) {
            console.error('Failed to parse menu config:', e);
          }
        }

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
        setMessage(t('admin.settingsSaved'));
        originalSettingsRef.current = JSON.stringify(settings);
        setIsDirty(false);
      } else {
        setMessage(t('admin.settingsError'));
      }
    } catch (error) {
      setMessage(t('admin.networkError'));
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

  // Calculate total weight for idle views (used for relative distribution)
  const getTotalIdleWeight = () => {
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

  // Calculate actual relative percentage for a view
  const getRelativePercent = (viewPercent) => {
    const totalWeight = getTotalIdleWeight();
    if (totalWeight === 0) return 0;
    return Math.round((parseInt(viewPercent) / totalWeight) * 100);
  };

  // Count enabled views
  const getEnabledViewCount = () => {
    let count = 0;
    if (settings.idle_view_cube_enabled === 'true' || settings.idle_view_cube_enabled === true) count++;
    if (settings.idle_view_ideas_enabled === 'true' || settings.idle_view_ideas_enabled === true) count++;
    if (settings.idle_view_ads_enabled === 'true' || settings.idle_view_ads_enabled === true) count++;
    return count;
  };

  // Get sorted menu items
  const getSortedMenuItems = () => {
    return Object.keys(menuConfig)
      .map(id => ({ id, ...menuConfig[id] }))
      .sort((a, b) => a.order - b.order);
  };

  // Toggle menu item visibility
  const handleMenuVisibilityToggle = (menuId) => {
    const newConfig = {
      ...menuConfig,
      [menuId]: {
        ...menuConfig[menuId],
        visible: !menuConfig[menuId].visible
      }
    };
    setMenuConfig(newConfig);
    handleChange('admin_menu_config', JSON.stringify(newConfig));
  };

  // Move menu item up
  const handleMenuMoveUp = (menuId) => {
    const items = getSortedMenuItems();
    const currentIndex = items.findIndex(item => item.id === menuId);
    if (currentIndex <= 0) return;

    const prevItem = items[currentIndex - 1];
    const newConfig = {
      ...menuConfig,
      [menuId]: { ...menuConfig[menuId], order: prevItem.order },
      [prevItem.id]: { ...menuConfig[prevItem.id], order: menuConfig[menuId].order }
    };
    setMenuConfig(newConfig);
    handleChange('admin_menu_config', JSON.stringify(newConfig));
  };

  // Move menu item down
  const handleMenuMoveDown = (menuId) => {
    const items = getSortedMenuItems();
    const currentIndex = items.findIndex(item => item.id === menuId);
    if (currentIndex >= items.length - 1) return;

    const nextItem = items[currentIndex + 1];
    const newConfig = {
      ...menuConfig,
      [menuId]: { ...menuConfig[menuId], order: nextItem.order },
      [nextItem.id]: { ...menuConfig[nextItem.id], order: menuConfig[menuId].order }
    };
    setMenuConfig(newConfig);
    handleChange('admin_menu_config', JSON.stringify(newConfig));
  };

  if (loading) {
    return <div className={styles.loading}>{t('admin.loadingSettings')}</div>;
  }

  const enabledViewCount = getEnabledViewCount();

  return (
    <div className={styles.section}>
      <h2>{t('admin.settings')}</h2>

      {/* Navigation blocker dialog */}
      {showBlocker && (
        <div className={styles.blockerOverlay}>
          <div className={styles.blockerDialog}>
            <h3>{t('admin.unsavedChanges')}</h3>
            <p>{t('admin.unsavedChangesMessage')}</p>
            <div className={styles.blockerButtons}>
              <button
                className={styles.btnSecondary}
                onClick={handleStay}
              >
                {t('admin.stay')}
              </button>
              <button
                className={styles.btnDanger}
                onClick={handleLeave}
              >
                {t('admin.leave')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.settingsGroup}>
        <h3>{t('admin.ticketSettings')}</h3>
        <div className={styles.field}>
          <label>{t('admin.kronerPerTicket')}</label>
          <input
            type="number"
            value={settings.kroner_per_ticket}
            onChange={e => handleChange('kroner_per_ticket', parseInt(e.target.value))}
            min="1"
          />
          <span className={styles.hint}>{t('admin.kronerPerTicketHint')}</span>
        </div>
        <div className={styles.field}>
          <label>{t('admin.ticketValidityHours')}</label>
          <input
            type="number"
            value={settings.ticket_validity_hours}
            onChange={e => handleChange('ticket_validity_hours', parseInt(e.target.value))}
            min="1"
          />
        </div>
        <div className={styles.field}>
          <label>{t('admin.maxTicketsPerUser')}</label>
          <input
            type="number"
            value={settings.max_tickets_per_user}
            onChange={e => handleChange('max_tickets_per_user', parseInt(e.target.value))}
            min="1"
          />
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <h3>{t('admin.receiptSettings')}</h3>
        <div className={styles.field}>
          <label>{t('admin.receiptValidityMinutes')}</label>
          <input
            type="number"
            value={settings.receipt_validity_minutes}
            onChange={e => handleChange('receipt_validity_minutes', parseInt(e.target.value))}
            min="1"
          />
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <h3>{t('admin.sessionSettings')}</h3>
        <div className={styles.field}>
          <label>{t('admin.sessionTimeout')}</label>
          <input
            type="number"
            value={settings.session_timeout_minutes}
            onChange={e => handleChange('session_timeout_minutes', parseInt(e.target.value))}
            min="1"
          />
        </div>
        <div className={styles.field}>
          <label>{t('admin.gameTimeMinutes')}</label>
          <input
            type="number"
            value={settings.game_time_minutes}
            onChange={e => handleChange('game_time_minutes', parseInt(e.target.value))}
            min="1"
          />
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <h3>{t('admin.idleMode')}</h3>
        <p className={styles.hint} style={{ marginBottom: 'var(--spacing-md)' }}>
          {t('admin.idleModeHint')}
        </p>

        <div className={styles.field}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={settings.idle_view_cube_enabled === 'true' || settings.idle_view_cube_enabled === true}
              onChange={e => handleChange('idle_view_cube_enabled', e.target.checked ? 'true' : 'false')}
            />
            <span>{t('admin.gameCube')}</span>
          </label>
          {(settings.idle_view_cube_enabled === 'true' || settings.idle_view_cube_enabled === true) && (
            <div style={{ marginTop: 'var(--spacing-xs)', marginLeft: 'var(--spacing-lg)' }}>
              <label>
                {t('admin.weight')}: {settings.idle_view_cube_percent}
                {enabledViewCount > 1 && (
                  <span style={{ color: 'var(--color-text-light)', marginLeft: '0.5rem' }}>
                    (≈ {getRelativePercent(settings.idle_view_cube_percent)}% av visningstiden)
                  </span>
                )}
              </label>
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
            <span>{t('admin.ideaBoxView')}</span>
          </label>
          {(settings.idle_view_ideas_enabled === 'true' || settings.idle_view_ideas_enabled === true) && (
            <div style={{ marginTop: 'var(--spacing-xs)', marginLeft: 'var(--spacing-lg)' }}>
              <label>
                {t('admin.weight')}: {settings.idle_view_ideas_percent}
                {enabledViewCount > 1 && (
                  <span style={{ color: 'var(--color-text-light)', marginLeft: '0.5rem' }}>
                    (≈ {getRelativePercent(settings.idle_view_ideas_percent)}% av visningstiden)
                  </span>
                )}
              </label>
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
            <span>{t('admin.advertisementsView')}</span>
          </label>
          {(settings.idle_view_ads_enabled === 'true' || settings.idle_view_ads_enabled === true) && (
            <div style={{ marginTop: 'var(--spacing-xs)', marginLeft: 'var(--spacing-lg)' }}>
              <label>
                {t('admin.weight')}: {settings.idle_view_ads_percent}
                {enabledViewCount > 1 && (
                  <span style={{ color: 'var(--color-text-light)', marginLeft: '0.5rem' }}>
                    (≈ {getRelativePercent(settings.idle_view_ads_percent)}% av visningstiden)
                  </span>
                )}
              </label>
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

        {enabledViewCount === 0 && (
          <p className={styles.hint} style={{ color: 'var(--color-warning, #e67e22)' }}>
            {t('admin.noViewsEnabled')}
          </p>
        )}
        {enabledViewCount === 1 && (
          <p className={styles.hint}>
            {t('admin.singleViewEnabled')}
          </p>
        )}
      </div>

      <div className={styles.settingsGroup}>
        <h3>{t('admin.soundSettings')}</h3>
        <div className={styles.field}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={settings.sound_enabled === true || settings.sound_enabled === 'true'}
              onChange={e => handleChange('sound_enabled', e.target.checked)}
            />
            <span>{t('admin.soundEnabled')}</span>
          </label>
        </div>
        <div className={styles.field}>
          <label>{t('admin.volume', { value: settings.sound_volume })}</label>
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
        <h3>{t('admin.menuConfiguration')}</h3>
        <p className={styles.hint} style={{ marginBottom: 'var(--spacing-md)' }}>
          {t('admin.menuConfigHint')}
        </p>

        <div className={styles.menuConfigList}>
          {getSortedMenuItems().map((item, index) => (
            <div key={item.id} className={styles.menuConfigItem}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={item.visible}
                  onChange={() => handleMenuVisibilityToggle(item.id)}
                />
                <span>{t(MENU_LABELS[item.id])}</span>
              </label>
              <div className={styles.menuConfigButtons}>
                <button
                  type="button"
                  className={styles.btnSmall}
                  onClick={() => handleMenuMoveUp(item.id)}
                  disabled={index === 0}
                  title={t('admin.moveUp')}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.btnSmall}
                  onClick={() => handleMenuMoveDown(item.id)}
                  disabled={index === getSortedMenuItems().length - 1}
                  title={t('admin.moveDown')}
                >
                  ↓
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.settingsGroup}>
        <h3>{t('admin.languageAndTheme')}</h3>
        <div className={styles.field}>
          <label>{t('admin.defaultLanguage')}</label>
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
          <label>{t('admin.activeTheme')}</label>
          <select
            value={settings.theme}
            onChange={e => handleChange('theme', e.target.value)}
          >
            <option value="default">{t('admin.themeDefault')}</option>
            <option value="winter">{t('admin.themeWinter')}</option>
            <option value="easter">{t('admin.themeEaster')}</option>
            <option value="western">{t('admin.themeWestern')}</option>
            <option value="summer">{t('admin.themeSummer')}</option>
            <option value="retro">{t('admin.themeRetro')}</option>
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
        {saving ? t('admin.saving') : t('admin.saveSettings')}
        {isDirty && ' *'}
      </button>
    </div>
  );
}
