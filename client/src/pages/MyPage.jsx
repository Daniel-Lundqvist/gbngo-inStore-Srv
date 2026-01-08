import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';

export default function MyPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="page">
      <header style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ color: 'var(--color-primary)' }}>
          &larr; {t('common.back')}
        </Link>
        <h1 style={{ marginTop: '1rem' }}>{t('myPage.title')}</h1>
      </header>

      <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '500px' }}>
        <div className="card">
          <h3>{t('myPage.tickets')}</h3>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
            {user?.tickets_count || 0}
          </p>
          {user?.tickets_expires_at && (
            <p style={{ color: 'var(--color-text-light)' }}>
              {t('myPage.expiresAt')}: {new Date(user.tickets_expires_at).toLocaleString()}
            </p>
          )}
        </div>

        {user?.personal_qr_code && (
          <div className="card" style={{ textAlign: 'center' }}>
            <h3>{t('myPage.qrCode')}</h3>
            <div style={{ padding: '1rem', backgroundColor: 'white', display: 'inline-block', borderRadius: '8px' }}>
              <QRCodeSVG value={user.personal_qr_code} size={200} />
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
              Scan this to log in quickly
            </p>
          </div>
        )}

        <div className="card">
          <h3>{t('myPage.faceId')}</h3>
          <button className="btn" style={{ marginTop: '1rem' }}>
            {t('myPage.enableFaceId')}
          </button>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
            (Placeholder - coming soon)
          </p>
        </div>
      </div>
    </div>
  );
}
