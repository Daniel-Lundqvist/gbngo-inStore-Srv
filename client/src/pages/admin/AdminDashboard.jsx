import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const { t } = useTranslation();

  const sections = [
    { id: 'settings', label: t('admin.settings'), icon: '⚙️', description: 'Ticket, session och vilolageinstellningar' },
    { id: 'products', label: t('admin.products'), icon: '📦', description: 'Hantera butikens produkter' },
    { id: 'categories', label: t('admin.categories'), icon: '📁', description: 'Hantera produktkategorier' },
    { id: 'idea-responses', label: t('admin.ideaResponses'), icon: '💡', description: 'Svara pa kundernas fragor' },
    { id: 'advertisements', label: t('admin.advertisements'), icon: '📢', description: 'Hantera reklam och erbjudanden' },
    { id: 'statistics', label: t('admin.statistics'), icon: '📊', description: 'Se anvandningsstatistik' },
    { id: 'maintenance', label: t('admin.maintenance'), icon: '🔧', description: 'Systemunderhall och rensning' }
  ];

  return (
    <div className={styles.dashboard}>
      <h2>Valkommen till adminpanelen</h2>
      <p className={styles.subtitle}>Valj en sektion for att komma igang</p>

      <div className={styles.grid}>
        {sections.map(section => (
          <Link
            key={section.id}
            to={`/admin/${section.id}`}
            className={styles.card}
          >
            <span className={styles.icon}>{section.icon}</span>
            <span className={styles.label}>{section.label}</span>
            <span className={styles.description}>{section.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
