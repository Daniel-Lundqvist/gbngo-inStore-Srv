import { Router } from 'express';
import { getDatabase } from '../database/init.js';

const router = Router();

// Get active advertisements (public)
router.get('/', (req, res) => {
  const db = getDatabase();
  const ads = db.prepare(`
    SELECT id, image_path, message, price
    FROM advertisements
    WHERE is_active = 1
    ORDER BY created_at DESC
  `).all();
  res.json(ads);
});

export default router;
