import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function GamePlayPage() {
  const { gameSlug } = useParams();
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const [gameStarted, setGameStarted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [gameEnded, setGameEnded] = useState(false);
  const [starting, setStarting] = useState(false);

  // Use ref for synchronous idempotency check to prevent double-clicks
  const isStartingRef = useRef(false);

  const startGame = async () => {
    // Synchronous check using ref to prevent race conditions
    if (isStartingRef.current) {
      return;
    }
    isStartingRef.current = true;
    setStarting(true);

    try {
      setError('');
      const response = await fetch(`/api/games/${gameSlug}/start`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to start game');
        isStartingRef.current = false;
        setStarting(false);
        return;
      }

      setSessionId(data.session_id);
      setGameStarted(true);
      refreshUser();
    } catch (err) {
      setError('Failed to start game');
      isStartingRef.current = false;
      setStarting(false);
    }
  };

  const endGame = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/games/${gameSlug}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ session_id: sessionId, score })
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit score');
        return;
      }

      setGameEnded(true);
    } catch (err) {
      setError('Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  if (gameEnded) {
    return (
      <div className="page center">
        <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <h1>🎮 {t('game.gameOver', 'Game Over!')}</h1>
          <p style={{ fontSize: '2rem', margin: '1rem 0' }}>
            {t('game.yourScore', 'Your score')}: <strong>{score}</strong>
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <Link to="/highscores" className="btn btn-large">
              {t('nav.highscores', 'Highscores')}
            </Link>
            <Link to="/games" className="btn btn-secondary">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="page center">
        <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <h1 style={{ textTransform: 'capitalize' }}>
            {gameSlug?.replace('-', ' ')}
          </h1>
          <p style={{ color: 'var(--color-text-light)', margin: '2rem 0' }}>
            {t('game.readyToPlay', 'Ready to play?')}
            <br />
            {t('game.ticketCost', 'This will use 1 ticket.')}
          </p>
          {error && <p style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={startGame} className="btn btn-large" disabled={starting}>
              {starting ? t('common.starting', 'Starting...') : t('game.startGame', 'Start Game')}
            </button>
            <Link to="/games" className="btn btn-secondary">
              {t('common.back')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page center">
      <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
        <h1 style={{ textTransform: 'capitalize' }}>
          {gameSlug?.replace('-', ' ')}
        </h1>
        <p style={{ color: 'var(--color-text-light)', margin: '1rem 0' }}>
          {t('game.dummyPlaceholder', 'This is a placeholder for the game.')}
          <br />
          {t('game.testScore', 'Enter a test score below:')}
        </p>
        <div style={{ margin: '2rem 0' }}>
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value) || 0)}
            min="0"
            max="999999"
            style={{
              fontSize: '2rem',
              width: '150px',
              textAlign: 'center',
              padding: '0.5rem',
              borderRadius: '8px',
              border: '2px solid var(--color-primary)'
            }}
          />
        </div>
        {error && <p style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>{error}</p>}
        <button
          onClick={endGame}
          className="btn btn-large"
          disabled={submitting}
        >
          {submitting ? t('common.submitting', 'Submitting...') : t('game.endGame', 'End Game & Submit Score')}
        </button>
      </div>
    </div>
  );
}
