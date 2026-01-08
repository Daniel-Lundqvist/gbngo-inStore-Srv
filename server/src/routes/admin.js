import { Router } from 'express';
import { getOne, getAll, runQuery, getLastInsertRowId, saveDatabase } from '../database/init.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// All admin routes require admin authentication
router.use(requireAdmin);

// Get all settings
router.get('/settings', (req, res) => {
  const settings = getAll('SELECT key, value FROM settings', []);
  const result = {};
  for (const row of settings) {
    result[row.key] = row.value;
  }
  res.json(result);
});

// Update settings
router.put('/settings', (req, res) => {
  const updates = req.body;

  for (const [key, value] of Object.entries(updates)) {
    runQuery('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, String(value)]);
  }
  saveDatabase();

  res.json({ success: true });
});

// Get statistics
router.get('/stats', (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const stats = {
    total_users: getOne('SELECT COUNT(*) as count FROM users WHERE is_returning_guest = 1', []).count,
    total_games_played: getOne('SELECT COUNT(*) as count FROM game_sessions', []).count,
    games_today: getOne('SELECT COUNT(*) as count FROM game_sessions WHERE date(started_at) = ?', [today]).count,
    total_highscores: getOne('SELECT COUNT(*) as count FROM highscores', []).count,
    active_products: getOne('SELECT COUNT(*) as count FROM products WHERE is_active = 1', []).count,
    active_ads: getOne('SELECT COUNT(*) as count FROM advertisements WHERE is_active = 1', []).count,
    active_idea_responses: getOne('SELECT COUNT(*) as count FROM idea_responses WHERE is_active = 1', []).count
  };

  res.json(stats);
});

// === PRODUCTS ===

// Get all products (admin view includes inactive)
router.get('/products', (req, res) => {
  const products = getAll(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.name
  `, []);
  res.json(products);
});

// Create product
router.post('/products', (req, res) => {
  const { name, category_id, tags } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  runQuery(
    `INSERT INTO products (name, category_id, tags) VALUES (?, ?, ?)`,
    [name.trim(), category_id || null, tags || null]
  );

  const lastId = getLastInsertRowId();
  const product = getOne('SELECT * FROM products WHERE id = ?', [lastId]);
  saveDatabase();
  res.json(product);
});

// Update product
router.put('/products/:id', (req, res) => {
  const { name, category_id, tags, is_active } = req.body;

  const existing = getOne('SELECT id FROM products WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  runQuery(`
    UPDATE products
    SET name = COALESCE(?, name),
        category_id = ?,
        tags = COALESCE(?, tags),
        is_active = COALESCE(?, is_active)
    WHERE id = ?
  `, [name, category_id, tags, is_active, req.params.id]);

  const product = getOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json(product);
});

// Delete product
router.delete('/products/:id', (req, res) => {
  const existing = getOne('SELECT id FROM products WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found' });
  }

  runQuery('DELETE FROM products WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json({ success: true });
});

// === CATEGORIES ===

// Get all categories
router.get('/categories', (req, res) => {
  const categories = getAll('SELECT * FROM categories ORDER BY sort_order, name', []);
  res.json(categories);
});

// Create category
router.post('/categories', (req, res) => {
  const { name, sort_order } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  runQuery(
    `INSERT INTO categories (name, sort_order) VALUES (?, ?)`,
    [name.trim(), sort_order || 0]
  );

  const lastId = getLastInsertRowId();
  const category = getOne('SELECT * FROM categories WHERE id = ?', [lastId]);
  saveDatabase();
  res.json(category);
});

// Update category
router.put('/categories/:id', (req, res) => {
  const { name, sort_order } = req.body;

  const existing = getOne('SELECT id FROM categories WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: 'Category not found' });
  }

  runQuery(`
    UPDATE categories
    SET name = COALESCE(?, name),
        sort_order = COALESCE(?, sort_order)
    WHERE id = ?
  `, [name, sort_order, req.params.id]);

  const category = getOne('SELECT * FROM categories WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json(category);
});

// Delete category
router.delete('/categories/:id', (req, res) => {
  const existing = getOne('SELECT id FROM categories WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: 'Category not found' });
  }

  runQuery('DELETE FROM categories WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json({ success: true });
});

// === IDEA RESPONSES ===

// Get all idea responses
router.get('/idea-responses', (req, res) => {
  const responses = getAll('SELECT * FROM idea_responses ORDER BY created_at DESC', []);
  res.json(responses);
});

// Create idea response
router.post('/idea-responses', (req, res) => {
  const { question, answer, is_active } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  runQuery(
    `INSERT INTO idea_responses (question, answer, is_active) VALUES (?, ?, ?)`,
    [question.trim(), answer.trim(), is_active ? 1 : 0]
  );

  const lastId = getLastInsertRowId();
  const response = getOne('SELECT * FROM idea_responses WHERE id = ?', [lastId]);
  saveDatabase();
  res.json(response);
});

// Update idea response
router.put('/idea-responses/:id', (req, res) => {
  const { question, answer, is_active } = req.body;

  const existing = getOne('SELECT id FROM idea_responses WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: 'Idea response not found' });
  }

  runQuery(`
    UPDATE idea_responses
    SET question = COALESCE(?, question),
        answer = COALESCE(?, answer),
        is_active = COALESCE(?, is_active)
    WHERE id = ?
  `, [question, answer, is_active !== undefined ? (is_active ? 1 : 0) : null, req.params.id]);

  const response = getOne('SELECT * FROM idea_responses WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json(response);
});

// Delete idea response
router.delete('/idea-responses/:id', (req, res) => {
  const existing = getOne('SELECT id FROM idea_responses WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: 'Idea response not found' });
  }

  runQuery('DELETE FROM idea_responses WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json({ success: true });
});

// === ADVERTISEMENTS ===

// Get all advertisements
router.get('/advertisements', (req, res) => {
  const ads = getAll('SELECT * FROM advertisements ORDER BY created_at DESC', []);
  res.json(ads);
});

// Create advertisement
router.post('/advertisements', (req, res) => {
  const { image_path, message, price, is_active } = req.body;

  runQuery(
    `INSERT INTO advertisements (image_path, message, price, is_active) VALUES (?, ?, ?, ?)`,
    [image_path || null, message || null, price || null, is_active ? 1 : 0]
  );

  const lastId = getLastInsertRowId();
  const ad = getOne('SELECT * FROM advertisements WHERE id = ?', [lastId]);
  saveDatabase();
  res.json(ad);
});

// Update advertisement
router.put('/advertisements/:id', (req, res) => {
  const { image_path, message, price, is_active } = req.body;

  const existing = getOne('SELECT id FROM advertisements WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: 'Advertisement not found' });
  }

  runQuery(`
    UPDATE advertisements
    SET image_path = COALESCE(?, image_path),
        message = COALESCE(?, message),
        price = COALESCE(?, price),
        is_active = COALESCE(?, is_active)
    WHERE id = ?
  `, [image_path, message, price, is_active !== undefined ? (is_active ? 1 : 0) : null, req.params.id]);

  const ad = getOne('SELECT * FROM advertisements WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json(ad);
});

// Delete advertisement
router.delete('/advertisements/:id', (req, res) => {
  const existing = getOne('SELECT id FROM advertisements WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: 'Advertisement not found' });
  }

  runQuery('DELETE FROM advertisements WHERE id = ?', [req.params.id]);
  saveDatabase();
  res.json({ success: true });
});

// === MAINTENANCE ===

// Clear all highscores
router.delete('/highscores', (req, res) => {
  runQuery('DELETE FROM highscores', []);
  saveDatabase();
  res.json({ success: true, message: 'All highscores cleared' });
});

// Clear inactive accounts (last_active_at > 30 days)
router.delete('/inactive-accounts', (req, res) => {
  // Get count before delete
  const countBefore = getOne(`
    SELECT COUNT(*) as count FROM users
    WHERE last_active_at < datetime('now', '-30 days')
      AND is_returning_guest = 1
  `, []);

  runQuery(`
    DELETE FROM users
    WHERE last_active_at < datetime('now', '-30 days')
      AND is_returning_guest = 1
  `, []);
  saveDatabase();

  res.json({
    success: true,
    deleted: countBefore.count
  });
});

export default router;
