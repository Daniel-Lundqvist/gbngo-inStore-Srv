import { Router } from 'express';
import { getAll } from '../database/init.js';

const router = Router();

// Get active advertisements (public)
router.get('/', (req, res) => {
  const ads = getAll(`
    SELECT id, image_path, message, price
    FROM advertisements
    WHERE is_active = 1
    ORDER BY created_at DESC
  `, []);
  res.json(ads);
});

export default router;
