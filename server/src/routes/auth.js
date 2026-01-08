import { Router } from 'express';
import { getOne, runQuery, getLastInsertRowId, saveDatabase } from '../database/init.js';
import { ADMIN_CODE } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Profanity filter - basic list of inappropriate words
const profanityList = [
  'kuk', 'fitta', 'hora', 'bitch', 'fuck', 'shit', 'ass', 'dick', 'cock',
  'pussy', 'cunt', 'whore', 'slut', 'negro', 'nigga', 'fag', 'gay',
  // Arabic profanity (transliterated)
  'sharmouta', 'kuss', 'zeb',
  // Additional Swedish
  'skit', 'fan', 'javel'
];

function containsProfanity(text) {
  const lower = text.toLowerCase();
  return profanityList.some(word => lower.includes(word));
}

// Create guest session
router.post('/guest', (req, res) => {
  const { initials } = req.body;

  if (!initials || initials.length !== 5) {
    return res.status(400).json({ error: 'Initials must be exactly 5 characters' });
  }

  if (containsProfanity(initials)) {
    return res.status(400).json({ error: 'Please choose appropriate initials' });
  }

  // Create temporary guest user (not saved to database for regular guests)
  const guestUser = {
    id: `guest_${Date.now()}`,
    initials: initials.toUpperCase(),
    is_returning_guest: false,
    tickets_count: 0
  };

  req.session.user = guestUser;
  req.session.isGuest = true;
  req.session.isAdmin = false;

  res.json({
    success: true,
    user: {
      id: guestUser.id,
      initials: guestUser.initials,
      is_returning_guest: false,
      tickets_count: 0
    }
  });
});

// Register returning guest (create account)
router.post('/register', (req, res) => {
  const { initials, pin_code } = req.body;

  if (!initials || initials.length !== 5) {
    return res.status(400).json({ error: 'Initials must be exactly 5 characters' });
  }

  if (!pin_code || !/^\d{4}$/.test(pin_code)) {
    return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
  }

  if (containsProfanity(initials)) {
    return res.status(400).json({ error: 'Please choose appropriate initials' });
  }

  // Check if initials + pin combo exists
  const existing = getOne(
    'SELECT id FROM users WHERE initials = ? AND pin_code = ?',
    [initials.toUpperCase(), pin_code]
  );

  if (existing) {
    return res.status(400).json({ error: 'An account with these credentials already exists' });
  }

  // Generate personal QR code
  const personalQrCode = uuidv4();

  // Create user
  runQuery(
    `INSERT INTO users (initials, pin_code, personal_qr_code, is_returning_guest)
     VALUES (?, ?, ?, 1)`,
    [initials.toUpperCase(), pin_code, personalQrCode]
  );

  const lastId = getLastInsertRowId();
  const user = getOne('SELECT * FROM users WHERE id = ?', [lastId]);
  saveDatabase();

  req.session.user = user;
  req.session.isGuest = false;
  req.session.isAdmin = false;

  res.json({
    success: true,
    user: {
      id: user.id,
      initials: user.initials,
      is_returning_guest: true,
      tickets_count: user.tickets_count,
      personal_qr_code: user.personal_qr_code
    }
  });
});

// Login with initials + PIN
router.post('/login', (req, res) => {
  const { initials, pin_code } = req.body;

  if (!initials || !pin_code) {
    return res.status(400).json({ error: 'Initials and PIN required' });
  }

  const user = getOne(
    'SELECT * FROM users WHERE initials = ? AND pin_code = ? AND is_returning_guest = 1',
    [initials.toUpperCase(), pin_code]
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Update last active
  runQuery('UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
  saveDatabase();

  req.session.user = user;
  req.session.isGuest = false;
  req.session.isAdmin = false;

  res.json({
    success: true,
    user: {
      id: user.id,
      initials: user.initials,
      is_returning_guest: true,
      tickets_count: user.tickets_count,
      personal_qr_code: user.personal_qr_code
    }
  });
});

// Login with QR code
router.post('/login-qr', (req, res) => {
  const { qr_code } = req.body;

  if (!qr_code) {
    return res.status(400).json({ error: 'QR code required' });
  }

  const user = getOne(
    'SELECT * FROM users WHERE personal_qr_code = ?',
    [qr_code]
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid QR code' });
  }

  // Update last active
  runQuery('UPDATE users SET last_active_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
  saveDatabase();

  req.session.user = user;
  req.session.isGuest = false;
  req.session.isAdmin = false;

  res.json({
    success: true,
    user: {
      id: user.id,
      initials: user.initials,
      is_returning_guest: true,
      tickets_count: user.tickets_count
    }
  });
});

// Admin login
router.post('/admin', (req, res) => {
  const { code } = req.body;

  if (code !== ADMIN_CODE) {
    return res.status(401).json({ error: 'Invalid code' });
  }

  req.session.isAdmin = true;
  res.json({ success: true });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true });
  });
});

// Check session status
router.get('/session', (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.user.id,
        initials: req.session.user.initials,
        is_returning_guest: req.session.user.is_returning_guest,
        tickets_count: req.session.user.tickets_count
      },
      isAdmin: req.session.isAdmin || false
    });
  } else if (req.session && req.session.isAdmin) {
    res.json({
      authenticated: true,
      isAdmin: true
    });
  } else {
    res.json({ authenticated: false });
  }
});

export default router;
