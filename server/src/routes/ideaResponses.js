import { Router } from 'express';
import { getDatabase } from '../database/init.js';

const router = Router();

// Get active idea responses (public)
router.get('/', (req, res) => {
  const db = getDatabase();
  const responses = db.prepare(`
    SELECT id, question, answer, created_at
    FROM idea_responses
    WHERE is_active = 1
    ORDER BY created_at DESC
  `).all();
  res.json(responses);
});

export default router;
