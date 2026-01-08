import { Router } from 'express';
import { getAll } from '../database/init.js';

const router = Router();

// Get active idea responses (public)
router.get('/', (req, res) => {
  const responses = getAll(`
    SELECT id, question, answer, created_at
    FROM idea_responses
    WHERE is_active = 1
    ORDER BY created_at DESC
  `, []);
  res.json(responses);
});

export default router;
