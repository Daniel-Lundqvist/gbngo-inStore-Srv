import { Router } from 'express';
import { getAll } from '../database/init.js';

const router = Router();

// Get all products
router.get('/', (req, res) => {
  const { category, search } = req.query;

  let query = `
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
  `;
  const params = [];

  if (category) {
    query += ' AND p.category_id = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (p.name LIKE ? OR p.tags LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern);
  }

  query += ' ORDER BY p.name COLLATE NOCASE';

  const products = getAll(query, params);
  res.json(products);
});

// Search products
router.get('/search', (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    const products = getAll(`
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
      ORDER BY p.name COLLATE NOCASE
    `, []);
    return res.json(products);
  }

  const searchPattern = `%${q.trim()}%`;
  const products = getAll(`
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = 1
      AND (p.name LIKE ? OR p.tags LIKE ?)
    ORDER BY p.name COLLATE NOCASE
  `, [searchPattern, searchPattern]);

  res.json(products);
});

// Get all categories
router.get('/categories', (req, res) => {
  const categories = getAll('SELECT * FROM categories ORDER BY sort_order, name COLLATE NOCASE', []);
  res.json(categories);
});

// Alias for categories
router.get('/../categories', (req, res) => {
  const categories = getAll('SELECT * FROM categories ORDER BY sort_order, name COLLATE NOCASE', []);
  res.json(categories);
});

export default router;
