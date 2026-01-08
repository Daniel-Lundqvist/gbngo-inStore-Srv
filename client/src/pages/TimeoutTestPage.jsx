import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchWithTimeout } from '../hooks/useFetch';
import ErrorWithRetry from '../components/ErrorWithRetry';

/**
 * Test page for demonstrating timeout and retry functionality
 * This page allows testing the timeout handling with different delays
 */
export default function TimeoutTestPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTimeout, setIsTimeout] = useState(false);
  const [result, setResult] = useState(null);
  const [timeout, setTimeout_] = useState(5000); // 5 second timeout
  const [delay, setDelay] = useState(3000); // 3 second server delay

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsTimeout(false);
    setResult(null);

    try {
      const data = await fetchWithTimeout(`/api/test/slow?delay=${delay}`, {
        timeout: timeout
      });
      setResult(data);
    } catch (err) {
      console.error('Request failed:', err);
      setError(err);
      setIsTimeout(err.isTimeout || false);
    } finally {
      setLoading(false);
    }
  }, [timeout, delay]);

  const handleRetry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="page">
      <header style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ color: 'var(--color-primary)' }}>
          &larr; {t('common.back')}
        </Link>
        <h1 style={{ marginTop: '1rem' }}>⏱️ Timeout Test</h1>
        <p style={{ color: 'var(--color-text-light)' }}>
          Test the timeout and retry functionality
        </p>
      </header>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Settings</h3>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="timeout-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Client Timeout (ms):
            </label>
            <input
              id="timeout-input"
              type="number"
              value={timeout}
              onChange={(e) => setTimeout_(parseInt(e.target.value) || 1000)}
              min="1000"
              max="30000"
              step="1000"
              style={{ width: '120px' }}
            />
          </div>
          <div>
            <label htmlFor="delay-input" style={{ display: 'block', marginBottom: '0.5rem' }}>
              Server Delay (ms):
            </label>
            <input
              id="delay-input"
              type="number"
              value={delay}
              onChange={(e) => setDelay(parseInt(e.target.value) || 1000)}
              min="1000"
              max="30000"
              step="1000"
              style={{ width: '120px' }}
            />
          </div>
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
          {delay > timeout
            ? '⚠️ Server delay is longer than timeout - request will timeout!'
            : '✓ Server delay is within timeout - request should succeed'}
        </p>
      </div>

      <button
        onClick={fetchData}
        disabled={loading}
        style={{
          padding: '1rem 2rem',
          fontSize: '1rem',
          marginBottom: '1rem'
        }}
      >
        {loading ? 'Loading...' : 'Make Request'}
      </button>

      {loading && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>⏳ Waiting for response...</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
            Timeout in {timeout / 1000} seconds, server will respond in {delay / 1000} seconds
          </p>
        </div>
      )}

      {error && (
        <ErrorWithRetry
          error={error}
          isTimeout={isTimeout}
          onRetry={handleRetry}
        />
      )}

      {result && (
        <div className="card" style={{ background: 'var(--color-success-light, #d4edda)', borderColor: 'var(--color-success, #28a745)' }}>
          <h3 style={{ color: 'var(--color-success, #28a745)' }}>✓ Success!</h3>
          <pre style={{ margin: 0, overflow: 'auto' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
