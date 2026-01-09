import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const sections = [
    { id: 'settings', label: t('admin.settings'), icon: '⚙️' },
    { id: 'games', label: t('admin.games', 'Spel'), icon: '🎮' },
    { id: 'products', label: t('admin.products'), icon: '📦' },
    { id: 'categories', label: t('admin.categories'), icon: '📁' },
    { id: 'idea-responses', label: t('admin.ideaResponses'), icon: '💡' },
    { id: 'advertisements', label: t('admin.advertisements'), icon: '📢' },
    { id: 'statistics', label: t('admin.statistics'), icon: '📊' },
    { id: 'maintenance', label: t('admin.maintenance'), icon: '🔧' }
  ];

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
