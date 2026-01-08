import { Router } from 'express';
import { getAll } from '../database/init.js';

const router = Router();

// Get all categories (public endpoint)
router.get('/', (req, res) => {
  const categories = getAll('SELECT * FROM categories ORDER BY sort_order, name', []);
  res.json(categories);
});

export default router;
