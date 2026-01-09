import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function GamePlayPage() {
  const { gameSlug } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'single';
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const [gameStarted, setGameStarted] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [gameEnded, setGameEnded] = useState(false);
  const [starting, setStarting] = useState(false);
  const [waitingForPlayer2, setWaitingForPlayer2] = useState(false);
  const [player2Joined, setPlayer2Joined] = useState(false);

  // Use ref for synchronous idempotency check to prevent double-clicks
  const isStartingRef = useRef(false);

  const getModeLabel = () => {
    switch (mode) {
      case 'together':
        return t('games.together', 'Tillsammans');
      case 'tournament':
        return t('games.tournament', 'Turnering');
      default:
        return t('games.singlePlayer', 'En spelare');
    }
  };

  const startGame = async () => {
    // Synchronous check using ref to prevent race conditions
    if (isStartingRef.current) {
      return;
    }
    isStartingRef.current = true;
    setStarting(true);

    // For together mode, show waiting for player 2 screen first
    if (mode === 'together' && !player2Joined) {
      setWaitingForPlayer2(true);
      setStarting(false);
      isStartingRef.current = false;
      return;
    }

    try {
      setError('');
      const response = await fetch(`/api/games/${gameSlug}/start`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('errors.failedToStartGame', 'Kunde inte starta spelet'));
        isStartingRef.current = false;
        setStarting(false);
        return;
      }

      setSessionId(data.session_id);
      setGameStarted(true);
      refreshUser();
    } catch (err) {
      setError(t('errors.failedToStartGame', 'Kunde inte starta spelet'));
      isStartingRef.current = false;
      setStarting(false);
    }
  };

  const simulatePlayer2Join = () => {
    setPlayer2Joined(true);
    setWaitingForPlayer2(false);
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
        setError(data.error || t('errors.failedToSubmitScore', 'Kunde inte skicka poäng'));
        return;
      }

      setGameEnded(true);
    } catch (err) {
      setError(t('errors.failedToSubmitScore', 'Kunde inte skicka poäng'));
    } finally {
      setSubmitting(false);
    }
  };

  // Waiting for player 2 screen (Together mode)
  if (waitingForPlayer2) {
    return (
      <div className="page center">
        <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <h1>👥 {t('games.together', 'Tillsammans')}</h1>
          <h2 style={{ textTransform: 'capitalize' }}>
            {gameSlug?.replace('-', ' ')}
          </h2>
          <p style={{ color: 'var(--color-text-light)', margin: '2rem 0' }}>
            {t('games.waitingForPlayer2', 'Väntar på spelare 2...')}
          </p>
          <div style={{
            padding: '2rem',
            backgroundColor: 'var(--color-surface-dark)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '2rem'
          }}>
            <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              {t('games.player2Instructions', 'Be din vän trycka på knappen nedan:')}
            </p>
            <button
              onClick={simulatePlayer2Join}
              className="btn btn-large"
              style={{ backgroundColor: 'var(--color-success)' }}
            >
              {t('games.joinAsPlayer2', 'Gå med som Spelare 2')}
            </button>
          </div>
          <Link to={`/games/${gameSlug}`} className="btn btn-secondary">
            {t('common.cancel', 'Avbryt')}
          </Link>
        </div>
      </div>
    );
  }

  if (gameEnded) {
    return (
      <div className="page center">
        <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
          <h1>🎮 {t('game.gameOver', 'Spelet slut!')}</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>
            {getModeLabel()}
          </p>
          <p style={{ fontSize: '2rem', margin: '1rem 0' }}>
            {t('game.yourScore', 'Din poäng')}: <strong>{score}</strong>
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
          <Link
            to={`/games/${gameSlug}`}
            style={{
              display: 'inline-block',
              marginBottom: '1rem',
              color: 'var(--color-primary)'
            }}
          >
            &larr; {t('games.changeMode', 'Byt spelläge')}
          </Link>
          <h1 style={{ textTransform: 'capitalize' }}>
            {gameSlug?.replace('-', ' ')}
          </h1>
          <p style={{
            display: 'inline-block',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.875rem',
            marginBottom: '1rem'
          }}>
            {getModeLabel()}
          </p>
          {player2Joined && (
            <p style={{
              backgroundColor: 'var(--color-success)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem'
            }}>
              ✓ {t('games.player2Ready', 'Spelare 2 är redo!')}
            </p>
          )}
          <p style={{ color: 'var(--color-text-light)', margin: '1rem 0' }}>
            {t('game.readyToPlay', 'Redo att spela?')}
            <br />
            {t('game.ticketCost', 'Detta kostar 1 ticket.')}
          </p>
          {error && <p style={{ color: 'var(--color-error)', marginBottom: '1rem' }} role="alert">{error}</p>}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={startGame} className="btn btn-large" disabled={starting}>
              {starting ? t('common.starting', 'Startar...') : t('game.startGame', 'Starta spel')}
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
        <p style={{
          display: 'inline-block',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.875rem',
          marginBottom: '1rem'
        }}>
          {getModeLabel()}
        </p>
        <p style={{ color: 'var(--color-text-light)', margin: '1rem 0' }}>
          {t('game.dummyPlaceholder', 'Detta är en platshållare för spelet.')}
          <br />
          {t('game.testScore', 'Ange en testpoäng nedan:')}
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
        {error && <p style={{ color: 'var(--color-error)', marginBottom: '1rem' }} role="alert">{error}</p>}
        <button
          onClick={endGame}
          className="btn btn-large"
          disabled={submitting}
        >
          {submitting ? t('common.submitting', 'Skickar...') : t('game.endGame', 'Avsluta spel och skicka poäng')}
        </button>
      </div>
    </div>
  );
}
