import { Router } from 'express';
import { getDatabase } from '../database/init.js';
import { requireAuth, requireReturningGuest } from '../middleware/auth.js';

const router = Router();

// Get current user profile
router.get('/me', requireAuth, (req, res) => {
  const user = req.session.user;

  // For returning guests, get fresh data from database
  if (user.is_returning_guest && typeof user.id === 'number') {
    const db = getDatabase();
    const freshUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    if (freshUser) {
      return res.json({
        id: freshUser.id,
        initials: freshUser.initials,
        is_returning_guest: true,
        tickets_count: freshUser.tickets_count,
        tickets_expires_at: freshUser.tickets_expires_at,
        personal_qr_code: freshUser.personal_qr_code,
        face_image_path: freshUser.face_image_path,
        created_at: freshUser.created_at,
        last_active_at: freshUser.last_active_at
      });
    }
  }

  res.json({
    id: user.id,
    initials: user.initials,
    is_returning_guest: user.is_returning_guest || false,
    tickets_count: user.tickets_count || 0
  });
});

// Update user profile
router.put('/me', requireReturningGuest, (req, res) => {
  const { face_image_path } = req.body;
  const db = getDatabase();

  if (face_image_path !== undefined) {
    db.prepare('UPDATE users SET face_image_path = ? WHERE id = ?')
      .run(face_image_path, req.session.user.id);
  }

  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?')
    .get(req.session.user.id);

  req.session.user = updatedUser;

  res.json({
    success: true,
    user: {
      id: updatedUser.id,
      initials: updatedUser.initials,
      face_image_path: updatedUser.face_image_path
    }
  });
});

// Upload face image (placeholder for Face ID)
router.post('/me/face-image', requireReturningGuest, (req, res) => {
  // In MVP, we just store a reference - actual image upload would use multer
  const db = getDatabase();

  db.prepare('UPDATE users SET face_image_path = ? WHERE id = ?')
    .run(`/uploads/faces/${req.session.user.id}.jpg`, req.session.user.id);

  res.json({
    success: true,
    message: 'Face ID activated!'
  });
});

// Get personal QR code
router.get('/me/qr-code', requireReturningGuest, (req, res) => {
  const db = getDatabase();
  const user = db.prepare('SELECT personal_qr_code FROM users WHERE id = ?')
    .get(req.session.user.id);

  if (!user || !user.personal_qr_code) {
    return res.status(404).json({ error: 'QR code not found' });
  }

  res.json({
    qr_code: user.personal_qr_code
  });
});

export default router;
