import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';

export default function ControllerTestPage() {
  const { t } = useTranslation();
  const [socket, setSocket] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const newSocket = io('/game', {
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Game screen connected');
      // Create a new session
      newSocket.emit('create-session', { gameId: 'controller-test' });
    });

    newSocket.on('session-created', ({ sessionId }) => {
      console.log('Session created:', sessionId);
      setSessionId(sessionId);
    });

    newSocket.on('player-joined', ({ playerNumber, totalPlayers }) => {
      setPlayers(prev => [...prev, { playerNumber }]);
      addEvent(`Player ${playerNumber} joined (Total: ${totalPlayers})`);
    });

    newSocket.on('player-disconnected', ({ playerNumber, totalPlayers }) => {
      setPlayers(prev => prev.filter(p => p.playerNumber !== playerNumber));
      addEvent(`Player ${playerNumber} disconnected (Total: ${totalPlayers})`);
    });

    newSocket.on('controller-dpad', ({ playerNumber, direction, pressed }) => {
      addEvent(`P${playerNumber}: D-PAD ${direction.toUpperCase()} ${pressed ? 'pressed' : 'released'}`);
    });

    newSocket.on('controller-button', ({ playerNumber, button, pressed }) => {
      addEvent(`P${playerNumber}: Button ${button.toUpperCase()} ${pressed ? 'pressed' : 'released'}`);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const addEvent = (text) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents(prev => [{ text, timestamp }, ...prev].slice(0, 50));
  };

  const controllerUrl = sessionId
    ? `${window.location.origin}/controller/${sessionId}`
    : null;

  return (
    <div className="page">
      <header style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ color: 'var(--color-primary)' }}>
          &larr; {t('common.back')}
        </Link>
        <h1 style={{ marginTop: '1rem' }}>Controller Test</h1>
      </header>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr', maxWidth: '900px' }}>
        {/* QR Code Section */}
        <div className="card" style={{ textAlign: 'center' }}>
          <h3>Scan to Connect Controller</h3>
          {sessionId ? (
            <>
              <div style={{ padding: '1rem', backgroundColor: 'white', display: 'inline-block', borderRadius: '8px', margin: '1rem 0' }}>
                <QRCodeSVG value={controllerUrl} size={200} />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', wordBreak: 'break-all' }}>
                {controllerUrl}
              </p>
              <p style={{ marginTop: '1rem' }}>
                <strong>Session ID:</strong> {sessionId.slice(0, 20)}...
              </p>
              <p style={{ color: 'var(--color-text-light)' }}>
                Connected Players: <strong>{players.length}</strong>
              </p>
            </>
          ) : (
            <p>Creating session...</p>
          )}
        </div>

        {/* Events Log */}
        <div className="card">
          <h3>Event Log</h3>
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            backgroundColor: 'var(--color-bg)',
            padding: '1rem',
            borderRadius: '8px'
          }}>
            {events.length === 0 ? (
              <p style={{ color: 'var(--color-text-light)' }}>
                No events yet. Connect a controller and press buttons.
              </p>
            ) : (
              events.map((event, index) => (
                <div key={index} style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-light)' }}>[{event.timestamp}]</span>{' '}
                  {event.text}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
