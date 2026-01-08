import { Router } from 'express';
import { getOne } from '../database/init.js';

const router = Router();

// Get public settings (theme, language, etc.)
router.get('/public', (req, res) => {
  const publicKeys = ['theme', 'language', 'sound_enabled', 'sound_volume'];
  const settings = {};

  for (const key of publicKeys) {
    const row = getOne('SELECT value FROM settings WHERE key = ?', [key]);
    settings[key] = row?.value;
  }

  res.json(settings);
});

// Get idle mode settings
router.get('/idle', (req, res) => {
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
    const row = getOne('SELECT value FROM settings WHERE key = ?', [key]);
    settings[key] = row?.value;
  }

  res.json(settings);
});

export default router;
