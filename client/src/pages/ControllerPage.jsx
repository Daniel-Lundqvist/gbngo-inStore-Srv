import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';
import styles from './ControllerPage.module.css';

export default function ControllerPage() {
  const { sessionId } = useParams();
  const { t } = useTranslation();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [playerNumber, setPlayerNumber] = useState(null);

  useEffect(() => {
    const newSocket = io('/controller', {
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      if (sessionId) {
        newSocket.emit('join-session', { sessionId });
      }
    });

    newSocket.on('joined', (data) => {
      setConnected(true);
      setPlayerNumber(data.playerNumber);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
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
          {connected ? (
            <span className={styles.connected}>
              {t('controller.connected')} (Player {playerNumber})
            </span>
          ) : (
            <span className={styles.connecting}>{t('controller.connecting')}</span>
          )}
        </p>
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
