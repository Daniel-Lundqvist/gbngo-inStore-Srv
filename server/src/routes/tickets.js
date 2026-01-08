import { Router } from 'express';
import { getDatabase } from '../database/init.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Get ticket balance
router.get('/balance', requireAuth, (req, res) => {
  const user = req.session.user;

  if (user.is_returning_guest && typeof user.id === 'number') {
    const db = getDatabase();
    const freshUser = db.prepare('SELECT tickets_count, tickets_expires_at FROM users WHERE id = ?')
      .get(user.id);

    if (freshUser) {
      // Check if tickets have expired
      if (freshUser.tickets_expires_at) {
        const expiresAt = new Date(freshUser.tickets_expires_at);
        if (expiresAt < new Date()) {
          // Tickets expired, reset
          db.prepare('UPDATE users SET tickets_count = 0, tickets_expires_at = NULL WHERE id = ?')
            .run(user.id);
          return res.json({ tickets: 0, expires_at: null });
        }
      }

      return res.json({
        tickets: freshUser.tickets_count,
        expires_at: freshUser.tickets_expires_at
      });
    }
  }

  res.json({
    tickets: user.tickets_count || 0,
    expires_at: null
  });
});

// Scan receipt (MVP: mock implementation)
router.post('/scan', requireAuth, (req, res) => {
  const { receipt_id, amount } = req.body;
  const db = getDatabase();

  // Get settings
  const ticketPriceSetting = db.prepare("SELECT value FROM settings WHERE key = 'ticket_price_kronor'").get();
  const receiptValiditySetting = db.prepare("SELECT value FROM settings WHERE key = 'receipt_validity_minutes'").get();
  const ticketValiditySetting = db.prepare("SELECT value FROM settings WHERE key = 'ticket_validity_hours'").get();
  const maxTicketsSetting = db.prepare("SELECT value FROM settings WHERE key = 'max_tickets_per_account'").get();

  const ticketPrice = parseInt(ticketPriceSetting?.value || '20');
  const receiptValidityMinutes = parseInt(receiptValiditySetting?.value || '15');
  const ticketValidityHours = parseInt(ticketValiditySetting?.value || '30');
  const maxTickets = parseInt(maxTicketsSetting?.value || '50');

  // Check if receipt already used
  const usedReceipt = db.prepare('SELECT id FROM used_receipts WHERE receipt_identifier = ?')
    .get(receipt_id);

  if (usedReceipt) {
    return res.status(400).json({ error: 'Receipt already used' });
  }

  // In MVP, we don't validate receipt timestamp - just accept it
  // Calculate tickets from amount
  const ticketsToAdd = Math.floor(amount / ticketPrice);

  if (ticketsToAdd < 1) {
    return res.status(400).json({ error: 'Purchase amount too low for tickets' });
  }

  const user = req.session.user;
  let newTicketCount = ticketsToAdd;
  let userId = null;

  if (user.is_returning_guest && typeof user.id === 'number') {
    // Returning guest - save to database
    userId = user.id;
    const currentUser = db.prepare('SELECT tickets_count FROM users WHERE id = ?').get(userId);
    newTicketCount = Math.min((currentUser?.tickets_count || 0) + ticketsToAdd, maxTickets);

    // Calculate new expiry
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ticketValidityHours);

    db.prepare(`
      UPDATE users
      SET tickets_count = ?, tickets_expires_at = ?
      WHERE id = ?
    `).run(newTicketCount, expiresAt.toISOString(), userId);

    // Update session
    req.session.user.tickets_count = newTicketCount;
  } else {
    // Guest - only session storage
    req.session.user.tickets_count = (req.session.user.tickets_count || 0) + ticketsToAdd;
    newTicketCount = req.session.user.tickets_count;
  }

  // Mark receipt as used
  db.prepare(`
    INSERT INTO used_receipts (receipt_identifier, user_id, tickets_granted)
    VALUES (?, ?, ?)
  `).run(receipt_id, userId, ticketsToAdd);

  res.json({
    success: true,
    tickets_added: ticketsToAdd,
    total_tickets: newTicketCount,
    message: `${ticketsToAdd} ticket(s) added!`
  });
});

export default router;
