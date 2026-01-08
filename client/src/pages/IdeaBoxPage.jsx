import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export default function IdeaBoxPage() {
  const { t } = useTranslation();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/idea-responses')
      .then(res => res.json())
      .then(data => {
        setResponses(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load idea responses:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="page center loading">{t('common.loading')}</div>;
  }

  return (
    <div className="page">
      <header style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ color: 'var(--color-primary)' }}>
          &larr; {t('common.back')}
        </Link>
        <h1 style={{ marginTop: '1rem' }}>{t('ideaBox.title')}</h1>
      </header>

      {responses.length === 0 ? (
        <p style={{ color: 'var(--color-text-light)', textAlign: 'center' }}>
          No idea responses yet.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '800px' }}>
          {responses.map((response, index) => (
            <motion.div
              key={response.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card"
            >
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                  {t('ideaBox.yourQuestion')}
                </h4>
                <p style={{ margin: 0, fontStyle: 'italic' }}>"{response.question}"</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }}>
                  {t('ideaBox.ourAnswer')}
                </h4>
                <p style={{ margin: 0 }}>{response.answer}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
