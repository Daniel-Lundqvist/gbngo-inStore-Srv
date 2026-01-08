import express from 'express';

const router = express.Router();

/**
 * Test endpoint that simulates slow network
 * GET /api/test/slow?delay=5000
 * Returns after specified delay (in ms)
 */
router.get('/slow', async (req, res) => {
  const delay = parseInt(req.query.delay) || 5000;
  // Cap delay at 30 seconds for safety
  const safeDelay = Math.min(delay, 30000);

  await new Promise(resolve => setTimeout(resolve, safeDelay));

  res.json({
    message: 'Slow response completed',
    delay: safeDelay
  });
});

/**
 * Test endpoint that always times out (never responds)
 * GET /api/test/timeout
 * Never responds - used to test client timeout handling
 */
router.get('/timeout', async (req, res) => {
  // Never respond - let the client timeout
  await new Promise(resolve => setTimeout(resolve, 600000)); // 10 minutes
  res.json({ message: 'This should never be seen' });
});

export default router;
