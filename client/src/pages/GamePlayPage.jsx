import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function GamePlayPage() {
  const { gameSlug } = useParams();
  const { t } = useTranslation();

  return (
    <div className="page center">
      <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <h1 style={{ textTransform: 'capitalize' }}>
          {gameSlug?.replace('-', ' ')}
        </h1>
        <p style={{ color: 'var(--color-text-light)', margin: '2rem 0' }}>
          This is a placeholder for the {gameSlug} game.
          <br />
          The actual game will be implemented separately.
        </p>
        <Link to="/games" className="btn btn-large">
          {t('common.back')}
        </Link>
      </div>
    </div>
  );
}
