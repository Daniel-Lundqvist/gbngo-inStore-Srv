import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { IdleGameCube, IdleIdeaBox, IdleAds, IdleLogo } from '../components/IdleViews';
import styles from './IdlePage.module.css';

// View types
const VIEW_TYPES = {
  CUBE: 'cube',
  IDEAS: 'ideas',
  ADS: 'ads',
  LOGO: 'logo'
};

// Helper to check if a setting is enabled (handles both string and boolean)
const isEnabled = (value) => value === true || value === 'true';

export default function IdlePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState(VIEW_TYPES.CUBE);
  const [idleSettings, setIdleSettings] = useState(null);

  // Fetch idle settings on mount
  useEffect(() => {
    const fetchIdleSettings = async () => {
      try {
        const response = await fetch('/api/settings/idle');
        if (response.ok) {
          const data = await response.json();
          setIdleSettings(data);
        }
      } catch (error) {
        console.error('Failed to fetch idle settings:', error);
      }
    };

    fetchIdleSettings();
  }, []);

  // Build list of enabled views with their weights
  const enabledViews = useMemo(() => {
    if (!idleSettings) {
      // Settings still loading - return empty to show loading state
      return [];
    }

    const views = [];

    // Check each view type using consistent isEnabled helper
    if (isEnabled(idleSettings.idle_view_cube_enabled)) {
      views.push({
        type: VIEW_TYPES.CUBE,
        weight: parseInt(idleSettings.idle_view_cube_percent) || 40
      });
    }

    if (isEnabled(idleSettings.idle_view_ideas_enabled)) {
      views.push({
        type: VIEW_TYPES.IDEAS,
        weight: parseInt(idleSettings.idle_view_ideas_percent) || 20
      });
    }

    if (isEnabled(idleSettings.idle_view_ads_enabled)) {
      views.push({
        type: VIEW_TYPES.ADS,
        weight: parseInt(idleSettings.idle_view_ads_percent) || 20
      });
    }

    if (isEnabled(idleSettings.idle_view_logo_enabled)) {
      views.push({
        type: VIEW_TYPES.LOGO,
        weight: parseInt(idleSettings.idle_view_logo_percent) || 20
      });
    }

    // If no views are enabled, default to LOGO view
    if (views.length === 0) {
      views.push({ type: VIEW_TYPES.LOGO, weight: 100 });
    }

    return views;
  }, [idleSettings]);

  // Set initial view when enabledViews changes
  useEffect(() => {
    if (enabledViews.length > 0) {
      // Set to first enabled view if current view is not in the enabled list
      const isCurrentEnabled = enabledViews.some(v => v.type === currentView);
      if (!isCurrentEnabled) {
        setCurrentView(enabledViews[0].type);
      }
    }
  }, [enabledViews, currentView]);

  // Select next view based on weights
  const selectNextView = useCallback(() => {
    if (enabledViews.length <= 1) return;

    const totalWeight = enabledViews.reduce((sum, v) => sum + v.weight, 0);
    const random = Math.random() * totalWeight;

    let cumulative = 0;
    for (const view of enabledViews) {
      cumulative += view.weight;
      if (random < cumulative) {
        setCurrentView(view.type);
        return;
      }
    }

    // Fallback
    setCurrentView(enabledViews[0].type);
  }, [enabledViews]);

  // Rotate views periodically
  useEffect(() => {
    if (enabledViews.length <= 1) return;

    // Rotate every 15-20 seconds
    const interval = setInterval(() => {
      selectNextView();
    }, 15000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [enabledViews.length, selectNextView]);

  const handleTouch = () => {
    navigate('/start');
  };

  // Get logo path from settings
  const logoPath = idleSettings?.store_logo_path || null;

  // Render current view component
  const renderCurrentView = () => {
    switch (currentView) {
      case VIEW_TYPES.IDEAS:
        return <IdleIdeaBox />;
      case VIEW_TYPES.ADS:
        return <IdleAds />;
      case VIEW_TYPES.CUBE:
        return <IdleGameCube />;
      case VIEW_TYPES.LOGO:
        return <IdleLogo logoPath={logoPath} />;
      default:
        // If currentView doesn't match any enabled view, show logo as fallback
        return <IdleLogo logoPath={logoPath} />;
    }
  };

  return (
    <motion.div
      className={styles.idlePage}
      onClick={handleTouch}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.content}>
        <div className={styles.logo}>
          <h1>Grab'n GO</h1>
          <p>QuickGames</p>
        </div>

        <div className={styles.viewContainer}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className={styles.viewWrapper}
            >
              {renderCurrentView()}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className={styles.touchPrompt}>{t('idle.touchToStart')}</p>
      </div>
    </motion.div>
  );
}
