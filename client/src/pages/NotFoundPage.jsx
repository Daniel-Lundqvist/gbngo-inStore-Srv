import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="page center" style={{ minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
          404
        </h1>
        <h2 style={{ marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="btn btn-large">
          Go Home
        </Link>
      </div>
    </div>
  );
}
