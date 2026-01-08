import { Router } from 'express';
import { getDatabase } from '../database/init.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// All admin routes require admin authentication
router.use(requireAdmin);

// Get all settings
router.get('/settings', (req, res) => {
  const db = getDatabase();
  const settings = db.prepare('SELECT key, value FROM settings').all();
  const result = {};
  for (const row of settings) {
    result[row.key] = row.value;
  }
  res.json(result);
});

// Update settings
router.put('/settings', (req, res) => {
  const db = getDatabase();
  const updates = req.body;

  const updateStmt = db.prepare('UPDATE settings SET value = ? WHERE key = ?');
  const insertStmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

  for (const [key, value] of Object.entries(updates)) {
    insertStmt.run(key, String(value));
  }

  res.json({ success: true });
});

// Get statistics
router.get('/stats', (req, res) => {
  const db = getDatabase();

  const today = new Date().toISOString().split('T')[0];

  const stats = {
    total_users: db.prepare('SELECT COUNT(*) as count FROM users WHERE is_returning_guest = 1').get().count,
    total_games_played: db.prepare('SELECT COUNT(*) as count FROM game_sessions').get().count,
    games_today: db.prepare('SELECT COUNT(*) as count FROM game_sessions WHERE date(started_at) = ?').get(today).count,
    total_highscores: db.prepare('SELECT COUNT(*) as count FROM highscores').get().count,
    active_products: db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1').get().count,
    active_ads: db.prepare('SELECT COUNT(*) as count FROM advertisements WHERE is_active = 1').get().count,
    active_idea_responses: db.prepare('SELECT COUNT(*) as count FROM idea_responses WHERE is_active = 1').get().count
  };

  res.json(stats);
});

// === PRODUCTS ===

// Get all products (admin view includes inactive)
router.get('/products', (req, res) => {
  const db = getDatabase();
  const products = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.name
  `).all();
  res.json(products);
});

// Create product
router.post('/products', (req, res) => {
  const { name, category_id, tags } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO products (name, category_id, tags)
    VALUES (?, ?, ?)
  `).run(name.trim(), category_id || null, tags || null);

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  res.json(product);
});

// Update product
router.put('/products/:id', (req, res) => {
  const { name, category_id, tags, is_active } = req.body;
  const db = getDatabase();

  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  db.prepare(`
    UPDATE products
    SET name = COALESCE(?, name),
        category_id = ?,
        tags = COALESCE(?, tags),
        is_active = COALESCE(?, is_active)
    WHERE id = ?
  `).run(name, category_id, tags, is_active, req.params.id);

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(product);
});

// Delete product
router.delete('/products/:id', (req, res) => {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json({ success: true });
});

// === CATEGORIES ===

// Get all categories
router.get('/categories', (req, res) => {
  const db = getDatabase();
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order, name').all();
  res.json(categories);
});

// Create category
router.post('/categories', (req, res) => {
  const { name, sort_order } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO categories (name, sort_order)
    VALUES (?, ?)
  `).run(name.trim(), sort_order || 0);

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
  res.json(category);
});

// Update category
router.put('/categories/:id', (req, res) => {
  const { name, sort_order } = req.body;
  const db = getDatabase();

  const existing = db.prepare('SELECT id FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Category not found' });
  }

  db.prepare(`
    UPDATE categories
    SET name = COALESCE(?, name),
        sort_order = COALESCE(?, sort_order)
    WHERE id = ?
  `).run(name, sort_order, req.params.id);

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  res.json(category);
});

// Delete category
router.delete('/categories/:id', (req, res) => {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Category not found' });
  }

  res.json({ success: true });
});

// === IDEA RESPONSES ===

// Get all idea responses
router.get('/idea-responses', (req, res) => {
  const db = getDatabase();
  const responses = db.prepare('SELECT * FROM idea_responses ORDER BY created_at DESC').all();
  res.json(responses);
});

// Create idea response
router.post('/idea-responses', (req, res) => {
  const { question, answer, is_active } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO idea_responses (question, answer, is_active)
    VALUES (?, ?, ?)
  `).run(question.trim(), answer.trim(), is_active ? 1 : 0);

  const response = db.prepare('SELECT * FROM idea_responses WHERE id = ?').get(result.lastInsertRowid);
  res.json(response);
});

// Update idea response
router.put('/idea-responses/:id', (req, res) => {
  const { question, answer, is_active } = req.body;
  const db = getDatabase();

  const existing = db.prepare('SELECT id FROM idea_responses WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Idea response not found' });
  }

  db.prepare(`
    UPDATE idea_responses
    SET question = COALESCE(?, question),
        answer = COALESCE(?, answer),
        is_active = COALESCE(?, is_active)
    WHERE id = ?
  `).run(question, answer, is_active !== undefined ? (is_active ? 1 : 0) : null, req.params.id);

  const response = db.prepare('SELECT * FROM idea_responses WHERE id = ?').get(req.params.id);
  res.json(response);
});

// Delete idea response
router.delete('/idea-responses/:id', (req, res) => {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM idea_responses WHERE id = ?').run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Idea response not found' });
  }

  res.json({ success: true });
});

// === ADVERTISEMENTS ===

// Get all advertisements
router.get('/advertisements', (req, res) => {
  const db = getDatabase();
  const ads = db.prepare('SELECT * FROM advertisements ORDER BY created_at DESC').all();
  res.json(ads);
});

// Create advertisement
router.post('/advertisements', (req, res) => {
  const { image_path, message, price, is_active } = req.body;

  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO advertisements (image_path, message, price, is_active)
    VALUES (?, ?, ?, ?)
  `).run(image_path || null, message || null, price || null, is_active ? 1 : 0);

  const ad = db.prepare('SELECT * FROM advertisements WHERE id = ?').get(result.lastInsertRowid);
  res.json(ad);
});

// Update advertisement
router.put('/advertisements/:id', (req, res) => {
  const { image_path, message, price, is_active } = req.body;
  const db = getDatabase();

  const existing = db.prepare('SELECT id FROM advertisements WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Advertisement not found' });
  }

  db.prepare(`
    UPDATE advertisements
    SET image_path = COALESCE(?, image_path),
        message = COALESCE(?, message),
        price = COALESCE(?, price),
        is_active = COALESCE(?, is_active)
    WHERE id = ?
  `).run(image_path, message, price, is_active !== undefined ? (is_active ? 1 : 0) : null, req.params.id);

  const ad = db.prepare('SELECT * FROM advertisements WHERE id = ?').get(req.params.id);
  res.json(ad);
});

// Delete advertisement
router.delete('/advertisements/:id', (req, res) => {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM advertisements WHERE id = ?').run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Advertisement not found' });
  }

  res.json({ success: true });
});

// === MAINTENANCE ===

// Clear all highscores
router.delete('/highscores', (req, res) => {
  const db = getDatabase();
  db.prepare('DELETE FROM highscores').run();
  res.json({ success: true, message: 'All highscores cleared' });
});

// Clear inactive accounts (last_active_at > 30 days)
router.delete('/inactive-accounts', (req, res) => {
  const db = getDatabase();
  const result = db.prepare(`
    DELETE FROM users
    WHERE last_active_at < datetime('now', '-30 days')
      AND is_returning_guest = 1
  `).run();

  res.json({
    success: true,
    deleted: result.changes
  });
});

export default router;
