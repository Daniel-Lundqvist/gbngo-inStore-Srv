import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';
import styles from './ControllerPage.module.css';

// Storage key for reconnection data
const RECONNECT_STORAGE_KEY = 'gbngo_controller_session';

export default function ControllerPage() {
  const { sessionId } = useParams();
  const { t } = useTranslation();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [playerNumber, setPlayerNumber] = useState(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [gameState, setGameState] = useState(null);
  const reconnectTokenRef = useRef(null);

  useEffect(() => {
    const newSocket = io('/controller', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');

      // Check if we have stored reconnection data for this session
      const storedData = localStorage.getItem(RECONNECT_STORAGE_KEY);
      if (storedData) {
        try {
          const { sessionId: storedSessionId, reconnectToken, playerNumber: storedPlayerNumber } = JSON.parse(storedData);

          // If we have a token for the current session, try to reconnect
          if (storedSessionId === sessionId && reconnectToken) {
            console.log('Attempting to reconnect with token:', reconnectToken);
            setReconnecting(true);
            reconnectTokenRef.current = reconnectToken;
            newSocket.emit('reconnect-session', { reconnectToken, sessionId });
            return;
          }
        } catch (e) {
          console.error('Failed to parse stored session data:', e);
          localStorage.removeItem(RECONNECT_STORAGE_KEY);
        }
      }

      // Normal join if no reconnection data
      if (sessionId) {
        newSocket.emit('join-session', { sessionId });
      }
    });

    newSocket.on('joined', (data) => {
      setConnected(true);
      setPlayerNumber(data.playerNumber);
      setReconnecting(false);
      reconnectTokenRef.current = data.reconnectToken;

      // Store reconnection data
      if (data.reconnectToken) {
        localStorage.setItem(RECONNECT_STORAGE_KEY, JSON.stringify({
          sessionId,
          reconnectToken: data.reconnectToken,
          playerNumber: data.playerNumber
        }));
        console.log('Stored reconnection token:', data.reconnectToken);
      }
    });

    newSocket.on('reconnected', (data) => {
      console.log('Successfully reconnected!', data);
      setConnected(true);
      setPlayerNumber(data.playerNumber);
      setReconnecting(false);
      setGameState(data.gameState);

      // Update stored token if provided
      if (reconnectTokenRef.current) {
        localStorage.setItem(RECONNECT_STORAGE_KEY, JSON.stringify({
          sessionId,
          reconnectToken: reconnectTokenRef.current,
          playerNumber: data.playerNumber
        }));
      }
    });

    newSocket.on('reconnect-failed', ({ reason }) => {
      console.log('Reconnection failed:', reason);
      setReconnecting(false);
      // Clear stored data and join as new player
      localStorage.removeItem(RECONNECT_STORAGE_KEY);
      if (sessionId) {
        newSocket.emit('join-session', { sessionId });
      }
    });

    newSocket.on('game-state-update', (state) => {
      setGameState(prev => ({ ...prev, ...state }));
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    newSocket.on('game-disconnected', () => {
      console.log('Game session ended');
      // Clear stored reconnection data
      localStorage.removeItem(RECONNECT_STORAGE_KEY);
    });

    newSocket.on('game-ended', () => {
      console.log('Game ended');
      // Clear stored reconnection data
      localStorage.removeItem(RECONNECT_STORAGE_KEY);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [sessionId]);

  const sendButton = (button, pressed) => {
    if (socket) {
      socket.emit('button', { button, pressed });
    }
  };

  const sendDpad = (direction, pressed) => {
    if (socket) {
      socket.emit('dpad', { direction, pressed });
    }
  };

  return (
    <div className={styles.controller}>
      <div className={styles.header}>
        <h1>Grab'n GO</h1>
        <p className={styles.status}>
          {reconnecting ? (
            <span className={styles.reconnecting}>
              {t('controller.reconnecting', 'Reconnecting...')}
            </span>
          ) : connected ? (
            <span className={styles.connected}>
              {t('controller.connected')} (Player {playerNumber})
            </span>
          ) : (
            <span className={styles.connecting}>{t('controller.connecting')}</span>
          )}
        </p>
        {gameState && gameState.status === 'playing' && (
          <p className={styles.gameStatus}>
            {t('controller.gameInProgress', 'Game in progress')}
          </p>
        )}
      </div>

      <div className={styles.controls}>
        {/* D-Pad */}
        <div className={styles.dpad}>
          <button
            className={`${styles.dpadBtn} ${styles.up}`}
            onTouchStart={() => sendDpad('up', true)}
            onTouchEnd={() => sendDpad('up', false)}
            onMouseDown={() => sendDpad('up', true)}
            onMouseUp={() => sendDpad('up', false)}
          >
            ▲
          </button>
          <button
            className={`${styles.dpadBtn} ${styles.left}`}
            onTouchStart={() => sendDpad('left', true)}
            onTouchEnd={() => sendDpad('left', false)}
            onMouseDown={() => sendDpad('left', true)}
            onMouseUp={() => sendDpad('left', false)}
          >
            ◀
          </button>
          <div className={styles.dpadCenter} />
          <button
            className={`${styles.dpadBtn} ${styles.right}`}
            onTouchStart={() => sendDpad('right', true)}
            onTouchEnd={() => sendDpad('right', false)}
            onMouseDown={() => sendDpad('right', true)}
            onMouseUp={() => sendDpad('right', false)}
          >
            ▶
          </button>
          <button
            className={`${styles.dpadBtn} ${styles.down}`}
            onTouchStart={() => sendDpad('down', true)}
            onTouchEnd={() => sendDpad('down', false)}
            onMouseDown={() => sendDpad('down', true)}
            onMouseUp={() => sendDpad('down', false)}
          >
            ▼
          </button>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionBtns}>
          <button
            className={`${styles.actionBtn} ${styles.btnB}`}
            onTouchStart={() => sendButton('b', true)}
            onTouchEnd={() => sendButton('b', false)}
            onMouseDown={() => sendButton('b', true)}
            onMouseUp={() => sendButton('b', false)}
          >
            B
          </button>
          <button
            className={`${styles.actionBtn} ${styles.btnA}`}
            onTouchStart={() => sendButton('a', true)}
            onTouchEnd={() => sendButton('a', false)}
            onMouseDown={() => sendButton('a', true)}
            onMouseUp={() => sendButton('a', false)}
          >
            A
          </button>
        </div>
      </div>

      {/* Start/Select */}
      <div className={styles.menuBtns}>
        <button
          className={styles.menuBtn}
          onTouchStart={() => sendButton('select', true)}
          onTouchEnd={() => sendButton('select', false)}
          onMouseDown={() => sendButton('select', true)}
          onMouseUp={() => sendButton('select', false)}
        >
          SELECT
        </button>
        <button
          className={styles.menuBtn}
          onTouchStart={() => sendButton('start', true)}
          onTouchEnd={() => sendButton('start', false)}
          onMouseDown={() => sendButton('start', true)}
          onMouseUp={() => sendButton('start', false)}
        >
          START
        </button>
      </div>
    </div>
  );
}
