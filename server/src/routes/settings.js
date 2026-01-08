import { Router } from 'express';
import { getDatabase } from '../database/init.js';

const router = Router();

// Get public settings (theme, language, etc.)
router.get('/public', (req, res) => {
  const db = getDatabase();

  const publicKeys = ['theme', 'language', 'sound_enabled', 'sound_volume'];
  const settings = {};

  for (const key of publicKeys) {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    settings[key] = row?.value;
  }

  res.json(settings);
});

// Get idle mode settings
router.get('/idle', (req, res) => {
  const db = getDatabase();

  const idleKeys = [
    'idle_view_cube_enabled',
    'idle_view_demos_enabled',
    'idle_view_ideas_enabled',
    'idle_view_ads_enabled',
    'idle_view_cube_percent',
    'idle_view_demos_percent',
    'idle_view_ideas_percent',
    'idle_view_ads_percent'
  ];

  const settings = {};

  for (const key of idleKeys) {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    settings[key] = row?.value;
  }

  res.json(settings);
});

export default router;
