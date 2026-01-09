import { useState, useEffect, useMemo } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminLayout.module.css';

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

export default function AdminLayout() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [menuConfig, setMenuConfig] = useState(DEFAULT_MENU_CONFIG);

  // Fetch menu config on mount
  useEffect(() => {
    const fetchMenuConfig = async () => {
      try {
        const response = await fetch('/api/settings/menu-config');
        if (response.ok) {
          const data = await response.json();
          if (data.admin_menu_config) {
            try {
              const parsed = JSON.parse(data.admin_menu_config);
              setMenuConfig({ ...DEFAULT_MENU_CONFIG, ...parsed });
            } catch (e) {
              console.error('Failed to parse menu config:', e);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch menu config:', error);
      }
    };

    fetchMenuConfig();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // All available sections with their base data
  const allSections = useMemo(() => [
    { id: 'settings', label: t('admin.settings'), icon: '⚙️' },
    { id: 'games', label: t('admin.games', 'Spel'), icon: '🎮' },
    { id: 'products', label: t('admin.products'), icon: '📦' },
    { id: 'categories', label: t('admin.categories'), icon: '📁' },
    { id: 'idea-responses', label: t('admin.ideaResponses'), icon: '💡' },
    { id: 'advertisements', label: t('admin.advertisements'), icon: '📢' },
    { id: 'statistics', label: t('admin.statistics'), icon: '📊' },
    { id: 'maintenance', label: t('admin.maintenance'), icon: '🔧' }
  ], [t]);

  // Filter and sort sections based on config
  const sections = useMemo(() => {
    return allSections
      .filter(section => {
        const config = menuConfig[section.id];
        return config ? config.visible !== false : true;
      })
      .sort((a, b) => {
        const orderA = menuConfig[a.id]?.order ?? 99;
        const orderB = menuConfig[b.id]?.order ?? 99;
        return orderA - orderB;
      });
  }, [allSections, menuConfig]);

  return (
    <div className={styles.adminLayout}>
      <header className={styles.header}>
        <Link to="/admin" className={styles.logoLink}>
          <h1>{t('admin.title')}</h1>
        </Link>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          {t('nav.logout')}
        </button>
      </header>

      <div className={styles.container}>
        <nav className={styles.sidebar}>
          {sections.map(section => (
            <NavLink
              key={section.id}
              to={`/admin/${section.id}`}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.icon}>{section.icon}</span>
              <span className={styles.label}>{section.label}</span>
            </NavLink>
          ))}
        </nav>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
