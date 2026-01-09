import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { useRef } from 'react';

export default function MyPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const qrRef = useRef(null);

  const saveQRCode = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    // Create canvas and draw SVG to it
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(svgUrl);

      // Download as PNG
      const link = document.createElement('a');
      link.download = `qr-code-${user?.initials || 'user'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = svgUrl;
  };

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
            <div
              ref={qrRef}
              style={{ padding: '1rem', backgroundColor: 'white', display: 'inline-block', borderRadius: '8px' }}
            >
              <QRCodeSVG value={user.personal_qr_code} size={200} />
            </div>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
              Scan this to log in quickly
            </p>
            <button
              className="btn"
              onClick={saveQRCode}
              style={{ marginTop: '1rem' }}
            >
              {t('myPage.saveQR', 'Spara QR-kod')}
            </button>
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
