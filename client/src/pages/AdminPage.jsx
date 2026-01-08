import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPage() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const sections = [
    { id: 'settings', label: t('admin.settings'), icon: '⚙️' },
    { id: 'products', label: t('admin.products'), icon: '📦' },
    { id: 'categories', label: t('admin.categories'), icon: '📁' },
    { id: 'idea-responses', label: t('admin.ideaResponses'), icon: '💡' },
    { id: 'advertisements', label: t('admin.advertisements'), icon: '📢' },
    { id: 'statistics', label: t('admin.statistics'), icon: '📊' },
    { id: 'maintenance', label: t('admin.maintenance'), icon: '🔧' }
  ];

  return (
    <div className="page">
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        borderRadius: 'var(--radius-lg)'
      }}>
        <h1 style={{ margin: 0 }}>{t('admin.title')}</h1>
        <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', cursor: 'pointer', borderRadius: 'var(--radius-md)' }}>
          {t('nav.logout')}
        </button>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        {sections.map(section => (
          <Link
            key={section.id}
            to={`/admin/${section.id}`}
            className="card"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              textAlign: 'center',
              padding: '2rem',
              transition: 'transform 0.2s'
            }}
          >
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>
              {section.icon}
            </span>
            <span style={{ fontWeight: 500 }}>{section.label}</span>
          </Link>
        ))}
      </div>

      <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-text-light)' }}>
        Admin panel - full functionality will be implemented in future sessions
      </p>
    </div>
  );
}
