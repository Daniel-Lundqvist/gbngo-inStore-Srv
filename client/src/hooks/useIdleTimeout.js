import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Default timeout in minutes (will be overridden by server settings)
const DEFAULT_TIMEOUT_MINUTES = 5;

// Throttle time for activity events (in ms) to prevent excessive resets
const ACTIVITY_THROTTLE_MS = 1000;

// Pages that should not trigger idle timeout (they are already "idle" states)
const IDLE_EXEMPT_PATHS = ['/', '/start', '/guest', '/register', '/login', '/admin/login', '/controller'];

export function useIdleTimeout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const timeoutRef = useRef(null);
  const timeoutMinutesRef = useRef(DEFAULT_TIMEOUT_MINUTES);
  const lastActivityRef = useRef(0);

  // Fetch timeout setting from server
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/public');
        if (response.ok) {
          const data = await response.json();
          if (data.session_timeout_minutes) {
            timeoutMinutesRef.current = parseInt(data.session_timeout_minutes);
          }
        }
      } catch (error) {
        console.error('Failed to fetch idle timeout setting:', error);
      }
    };
    fetchSettings();
  }, []);

  const resetTimer = useCallback(() => {
    // Clear existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Check if current path is exempt from idle timeout
    const isExemptPath = IDLE_EXEMPT_PATHS.some(path =>
      location.pathname === path || location.pathname.startsWith('/controller/')
    );

    // Only set timer if authenticated and not on exempt page
    if (isAuthenticated && !isExemptPath) {
      const timeoutMs = timeoutMinutesRef.current * 60 * 1000;
      timeoutRef.current = setTimeout(() => {
        console.log('Session idle timeout - redirecting to idle screen');
        logout();
        navigate('/', { replace: true });
      }, timeoutMs);
    }
  }, [isAuthenticated, location.pathname, logout, navigate]);

  // Throttled version of resetTimer for activity events
  const handleActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current >= ACTIVITY_THROTTLE_MS) {
      lastActivityRef.current = now;
      resetTimer();
    }
  }, [resetTimer]);

  useEffect(() => {
    // Events that indicate user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click'
    ];

    // Add event listeners with throttled handler
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Set initial timer
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [handleActivity, resetTimer]);

  // Reset timer when location changes (navigation is activity)
  useEffect(() => {
    resetTimer();
  }, [location.pathname, resetTimer]);

  return null;
}

export default useIdleTimeout;
